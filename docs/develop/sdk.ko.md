# SDK & host context

`@vineyard/plugin-sdk`는 플러그인을 빌드할 때 사용하는 작은 작성자 대상 TypeScript 표면입니다. 두 가지 define 헬퍼, `run` 함수가 받는 타입이 지정된 `HostContext`(`ctx`), 그리고 단위 테스트용 인프로세스 mock을 제공합니다. `npm i @vineyard/plugin-sdk`로 npm에서 설치하세요. 아래 모든 멤버는 게시된 패키지 타입의 일부입니다.

## 두 가지 define 헬퍼

플러그인의 번들은 두 가지 팩토리 함수 중 하나를 통해 기본 내보내기를 수행합니다. 둘 다 식별 함수입니다 — SDK 형태에 대한 타입 검사를 제공하기 위해서만 존재합니다.

```ts
import { definePlugin, definePluginPack } from "@vineyard/plugin-sdk";

// 단일 플러그인
export default definePlugin({ manifest, run });

// 또는 팩 — 여러 플러그인을 포함하는 하나의 번들 (plugin-packs.md 참조)
export default definePluginPack({
  identifier: "run.vineyard.pluginpacks.chaos",
  name: "Chaos",
  version: "1.0.0",
  plugins: [koreanRoulette, russianRoulette, thanosSnap /* ... */],
});
```

| 헬퍼 | 시그니처 | 검증하는 형태 |
|---|---|---|
| `definePlugin` | `(p: VineyardPlugin) => VineyardPlugin` | `{ manifest, run }` |
| `definePluginPack` | `(pack: VineyardPluginPack) => VineyardPluginPack` | `{ identifier, name, version, plugins[] }` |

번들의 기본 내보내기는 단일 플러그인, 플러그인 배열, 또는 팩(`PluginEntry`)일 수 있습니다. 호스트는 `flattenPlugins`로 이들을 평탄화합니다. 패키징 규칙은 [Plugin Packs](plugin-packs.md)를 참조하세요.

`VineyardPlugin.run`이 진입점입니다:

```ts
run(ctx: HostContext): Promise<RunResult | void>;
```

그래프 효과는 `ctx`를 통해 발생합니다. 반환 값(`{ summary?, counts? }`)은 [task UI](../guide/tasks.md)에 표시되는 사람이 읽을 수 있는 요약일 뿐입니다.

## HostContext (`ctx`)

`ctx`는 메인 스레드 *HostBridge*의 Comlink 프록시입니다. 코드를 실행하는 워커는 토큰도, 주변 `fetch`도, DOM도 없으며 — 부여된 스코프의 멤버만 가집니다. 그래프 쓰기는 실행 중에 API에 도달하지 않습니다: 브리지가 이를 캡처하고, 분석가가 변경 세트를 검토한 뒤 자신의 계정으로 적용합니다. 네트워크 이그레스는 SDK의 어떤 것도 아닌 브리지가 매니페스트에 선언된 엔드포인트와 대조하여 검사합니다. [보안 모델](security.md)을 참조하세요.

!!! warning "멤버는 해당 스코프가 부여되지 않으면 존재하지 않습니다"
    `ctx.graph`, `ctx.net`, `ctx.config`는 **선택적**이며, 해당 [scope](../reference/scopes.md)가 선언되고 *부여되었을* 때만 존재합니다. **Dumb AI Optimizer**와 같은 no-scope 플러그인은 올바르게 `ctx.graph === undefined`를 보게 됩니다. 사용 전에 옵셔널 체이닝이나 기능 테스트로 보호하세요. `ctx.graph` 내에서도 각 *메서드*는 특정 동사(`node:delete`, `edge:create`, …)가 부여된 경우에만 존재합니다.

### 항상 존재

이 멤버들은 스코프와 관계없이 모든 실행에 존재합니다.

| 멤버 | 타입 | 제공하는 것 |
|---|---|---|
| `ctx.run` | `{ runId, projectId, pluginId, grantedScopes, platform }` | 이 실행의 식별 정보. `grantedScopes`는 설치 시 승인된 매니페스트의 스코프 세트. `platform`은 `"web"` 또는 `"desktop"`. |
| `ctx.input` | `{ selection: string[] }` | 실행이 시작될 때 사용자가 선택한 노드 ID. **Black Hole**은 `ctx.input.selection`을 읽습니다. |
| `ctx.params` | `Readonly<Record<string, unknown>>` | 이 실행의 사용자 입력, 매니페스트 `params` 스키마에 대해 검증됨. `TypeRef.as` 별칭을 통해 바인딩된 소비 노드가 여기에 미리 바인딩됩니다. |
| `ctx.progress` | `{ set?, log?, status? }` | 지속 관리 작업 UI를 구동합니다(아래 상세). |
| `ctx.signal` | `AbortSignal` | 협력적 취소 — 반드시 관찰해야 합니다. |
| `ctx.onCancel` | `(handler) => void` | 취소 시 호출될 정리 핸들러 등록. |

!!! tip "취소는 협력적입니다"
    `run`을 강제 종료하는 것은 없습니다. `ctx.signal.aborted`를 폴링하거나, 긴 await에 `ctx.signal`을 전달하거나, `ctx.onCancel(...)`을 등록하세요. 시그널을 무시하는 플러그인은 반환할 때까지 계속 실행됩니다. 장기 실행 플러그인은 [manifest](plugin-manifest.md)에서 `lifecycle.controls: ["cancel"]`을 설정해야 합니다.

### 진행률, 상태, 로깅

이들은 `ctx.progress` 아래에 있습니다(각 메서드는 선택적이지만 객체에 항상 사용 가능):

```ts
ctx.progress?.set?.({ percent: 40, message: "Scanning neighbors", phase: "expand" });
ctx.progress?.log?.("found 12 candidate nodes");
ctx.progress?.status?.("waiting");   // "running" | "waiting"
```

`status("waiting")`은 백오프/속도 제한 일시 중지를 신호하여 UI가 대기 상태를 표시할 수 있게 합니다 — 내장 경로는 [`net.fetchWithBackoff`](#scope-gated-members)를 참조하세요.

### 스코프 게이트 멤버 {#scope-gated-members}

다음 각 항목은 해당 스코프가 부여되지 않으면 `undefined`입니다.

=== "graph (graph:* 스코프)"

    최소 하나의 `graph` 동사가 부여된 경우에만 존재합니다. 각 메서드는 해당 동사가 부여된 경우에만 존재합니다.

    ```ts
    // 읽기 — node:read / edge:read
    ctx.graph?.get?(nodeId): Promise<GraphNode | null>
    ctx.graph?.list?(opts?): Promise<{ nodes: GraphNode[]; cursor?: string }>
    ctx.graph?.neighbors?(nodeId): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>

    // 단일 쓰기 — node:create / node:update / node:delete / edge:create / edge:delete
    ctx.graph?.createNode?(draft: EntityDraft): Promise<GraphNode>
    ctx.graph?.updateNode?(nodeId, data): Promise<GraphNode>
    ctx.graph?.deleteNode?(nodeId): Promise<void>
    ctx.graph?.createEdge?(edge: EdgeDraft): Promise<GraphEdge>
    ctx.graph?.deleteEdge?(edgeId): Promise<void>

    // 벌크
    ctx.graph?.deleteNodes?(ids: string[]): Promise<{ deleted: number }>
    ctx.graph?.emit?(entities: EntityDraft[], edges?: EdgeDraft[]):
      Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>
    ```

    `list({ type, limit, cursor })`는 커서 페이지네이션 전체 그래프 열거입니다(**Thanos Snap**과 같은 전체 그래프 플러그인이 사용). `neighbors`는 1-홉 근방을 반환합니다(**Black Hole**이 사용). `EntityDraft.key`는 재실행 시 중복 대신 upsert하기 위한 선택적 클라이언트 측 중복 제거 키입니다. `EdgeDraft`는 `key` 또는 반환된 ID로 노드를 참조하며, `label`은 활성화된 [Type Pack](typepacks.md) 엣지 타입과 일치해야 합니다.

=== "net (network 스코프)"

    최소 하나의 [network scope](../reference/scopes.md)가 선언된 경우에만 존재합니다. `manifest.scopes.network` 엔드포인트로 제한됩니다. 브리지는 `credentials: "omit"`을 강제하고 `Authorization`/`Cookie`를 제거합니다. 6개의 참조 플러그인은 네트워크를 **전혀** 사용하지 않습니다.

    ```ts
    ctx.net?.fetch?(input: string, init?: SafeRequestInit): Promise<SafeResponse>
    ctx.net?.fetchWithBackoff?(input, init?, opts?): Promise<SafeResponse>
    ```

    `fetchWithBackoff`는 HTTP 429 / `Retry-After` 처리를 위한 단일 진입점이며 대기 상태를 자동으로 표시합니다.

=== "config (scopes.config)"

    `scopes.config`가 선언된 경우에만 존재합니다. 읽기 전용, 선언된 값만.

    ```ts
    ctx.config?: Readonly<Record<string, string | number | boolean>>
    ```

    !!! warning "시크릿은 절대 읽을 수 없습니다"
        `config.secret: true` 값은 **제외**됩니다 — 호스트에 의해 네트워크 경계에서 주입되며 플러그인에 반환되지 않습니다. 웹에서는 시크릿 config가 데스크톱 플러그인으로 라우팅됩니다. [시크릿 처리](security.md#secret-handling)를 참조하세요.

!!! note "`publish` 스코프는 존재하지 않습니다"
    플러그인은 프로젝트 채팅/피드에 게시할 수 없습니다 — `ctx.message`는 존재하지 않으며, `publish`는 스코프 스키마에 포함되어 있지 않습니다. `scopes`는 `additionalProperties: false`를 설정하므로, 아직 이를 선언하는 초안 매니페스트는 **검증에 실패합니다**. 찾아낸 결과는 대신 그래프에 기록하세요.

### 벌크 작업

`deleteNodes(ids[])`와 `emit(entities, edges)`은 각각 브리지에서 **단일 제한 작업**입니다 — 수백 번의 개별 왕복 대신, 하나의 호출이 들어가 고정된 동시성 한도 아래에서 한 번에 팬아웃됩니다. 전체 그래프 변이에는 벌크 형태를 선호하세요: 합법적인 대량 삭제(Korean Roulette이 전체 그래프를 지우는 경우)가 수천 번의 개별 `deleteNode` 호출이 되어서는 안 됩니다. 영향을 받은 각 노드와 엣지는 여전히 분석가가 검토하는 변경 세트에 각자의 항목으로 나타나므로, 벌크라고 해서 검토를 건너뛰는 것은 아닙니다.

## 완전한 `run(ctx)` 예제

완전히 작동하는 예제(Korean Roulette)와 `createMockContext` 단위 테스트는 [quickstart](quickstart.md)를 참조하세요.

## `createMockContext`로 테스트하기

`createMockContext`는 앱 없이, GitHub 없이, 서버 없이 `run(ctx)`을 단위 테스트할 수 있게 합니다. 부여된 스코프에 대해서만 `graph` / `net` / `config` 멤버가 존재하는 `HostContext`를 빌드하므로, 프로덕션과 정확히 동일하게 스코프 게이팅이 작동합니다. 반환된 컨텍스트는 어서션할 수 있는 `mock` 레코드를 가집니다.

`MockContextOptions`는 `nodes`, `edges`, `params`, `config`, `selection`, `projectId`, `pluginId`, `grantedScopes`, `platform`을 허용합니다. `ctx.mock` 레코드는 `nodes`, `edges`, `createdNodes`, `deletedNodeIds`, `deletedEdgeIds`, `netCalls`, `progress`를 노출합니다. 전체 테스트 예제는 [quickstart](quickstart.md)를 참조하세요.

!!! note "참조 구현"
    SDK 패키지에서 `createMockContext`는 참조 스케치와 함께 선언(`export declare function …`)되어 있습니다. 게시된 패키지가 구현을 제공합니다. 위의 이름들을 안정적인 계약으로 취급하세요.

## 다음 / 참고

- [Plugin manifest](plugin-manifest.md) — `definePlugin`에 전달하는 `manifest`
- [Scopes reference](../reference/scopes.md) — 각 `ctx` 멤버를 게이트하는 것
- [Security model](security.md) — 워커 샌드박스, 이그레스 허용목록, 스테이징된 쓰기
- [Lifecycle](lifecycle.md) — 진행률, 취소, 작업 상태
- [Quickstart](quickstart.md) — Developer Mode 및 테스트 하네스
- [Reference plugins](../guide/running-plugins.md) — SDK가 검증된 6개의 Chaos 플러그인
