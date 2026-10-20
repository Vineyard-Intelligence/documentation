# SDK 및 호스트 컨텍스트

플러그인 SDK는 플러그인을 빌드할 때 사용하는 작은 작성자 대상 TypeScript 표면입니다. 두 가지 define 헬퍼, `run` 함수가 받는 타입이 지정된 `HostContext`(`ctx`), 그리고 단위 테스트용 인프로세스 mock을 제공합니다. SDK는 단일 TypeScript 파일 [`sdk.ts`](../assets/sdk/sdk.ts)이며, 이번 릴리스 시점의 앱과 같습니다. 이를 저장소에 복사하고 `./sdk`에서 가져오세요. 게시된 팩 저장소에 포함된 사본은 이보다 오래되어 `SafeRequestInit.timeoutMs` 같은 새 필드가 없을 수 있습니다.

## 두 가지 define 헬퍼

플러그인의 번들은 두 가지 팩토리 함수 중 하나를 통해 기본 내보내기를 수행합니다. 둘 다 식별 함수입니다 — SDK 형태에 대한 타입 검사를 제공하기 위해서만 존재합니다.

```ts
import { definePlugin, definePluginPack } from "./sdk";

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

번들의 기본 내보내기는 단일 플러그인, 플러그인 배열, 또는 팩(`PluginEntry`)일 수 있습니다. 호스트는 `flattenPlugins`로 이들을 평탄화합니다. 패키징 규칙은 [플러그인 팩](plugin-packs.md)을 참조하세요.

`VineyardPlugin.run`이 진입점입니다:

```ts
run(ctx: HostContext): Promise<RunResult | void>;
```

그래프 효과는 `ctx`를 통해 발생합니다. 반환 값(`{ summary?, counts? }`)은 [작업 UI](../guide/tasks.md)에 표시되는 사람이 읽을 수 있는 요약일 뿐입니다.

## HostContext (`ctx`)

`ctx`는 호스트에 대한 Comlink 프록시입니다. 코드를 실행하는 워커에는 DOM도 자체 네트워크도 없으며 — 부여된 스코프의 멤버만 가집니다. 그래프 쓰기는 스테이징되며, 분석가가 변경 세트를 검토하고 승인한 뒤에만 적용됩니다. 단, **Apply automatically** 설정에서 AI 에이전트가 시작한 실행은 예외입니다([보안 모델](security.md#graph-writes-are-staged-not-applied) 참조). 네트워크 요청은 호스트가 매니페스트에 선언된 엔드포인트와 대조하여 검사합니다. [보안 모델](security.md)을 참조하세요.

!!! warning "멤버는 해당 스코프가 부여되지 않으면 존재하지 않습니다"
    `ctx.graph`, `ctx.net`, `ctx.config`는 **선택적**이며, 해당 [스코프](../reference/scopes.md)가 선언되고 *부여되었을* 때만 존재합니다. **Dumb AI Optimizer**와 같은 no-scope 플러그인은 올바르게 `ctx.graph === undefined`를 보게 됩니다. 사용 전에 옵셔널 체이닝이나 기능 테스트로 보호하세요. `ctx.graph` 내에서도 각 *메서드*는 특정 동사(`node:delete`, `edge:create`, …)가 부여된 경우에만 존재합니다.

### 항상 존재

이 멤버들은 스코프와 관계없이 모든 실행에 존재합니다.

| 멤버 | 타입 | 제공하는 것 |
|---|---|---|
| `ctx.run` | `{ runId, projectId, pluginId, grantedScopes, platform }` | 이 실행의 식별 정보. `grantedScopes`는 설치 시 승인된 매니페스트의 스코프 세트. `platform`은 `"web"` 또는 `"desktop"`. |
| `ctx.input` | `{ selection: string[] }` | 이 실행이 대상으로 하는 노드 ID. Run plugins 패널에서 실행하면: `consumes`가 있는 플러그인은 소비 타입인 선택 노드(범위 *Selected*) 또는 프로젝트 안의 그 타입 노드 전체(범위 *Whole project*), consumes가 없는 플러그인은 현재 선택. `run`은 전체 목록으로 **한 번** 호출되므로 전부 순회하세요. **Black Hole**은 `ctx.input.selection[0]`을 읽습니다. AI 에이전트가 플러그인을 실행하면 `selection`에는 에이전트가 전달한 라이브 노드 ID가 담깁니다. 소비 타입으로 걸러지지 않으며, `consumes`가 빈 플러그인에는 노드를 넘기지 않도록 요청할 뿐 강제하지는 않습니다. 각 노드의 타입을 확인하고, 전체 그래프 플러그인은 `selection`을 무시하세요. |
| `ctx.params` | `Readonly<Record<string, unknown>>` | 실행 전 폼에서 받은 이 실행의 사용자 입력(`required`만 강제됨 — `pattern`/`minimum`/`maximum`/`default`는 적용되지 않으므로 검증과 기본값은 `run`에서 처리). 파일 필드는 `File` 객체로 옵니다. AI 에이전트가 `params`를 채울 때는 `required`조차 강제되지 않으므로, 모든 값을 `run`에서 검증하고 기본값을 정하세요. |
| `ctx.progress` | `{ set?, log?, status? }` | 지속 관리 작업 UI를 구동합니다(아래 상세). |
| `ctx.signal` | `AbortSignal` | 협력적 취소 — 반드시 관찰해야 합니다. |
| `ctx.onCancel` | `(handler) => void` | 취소 시 호출될 정리 핸들러 등록. |

!!! tip "취소는 협력적입니다"
    취소는 협력적이지만 한도가 있습니다. `ctx.signal.aborted`를 폴링하거나, 긴 await에 `ctx.signal`을 전달하거나, `ctx.onCancel(...)`을 등록하세요: Stop 후 호스트는 `run`이 반환하기를 3초 기다린 뒤 워커를 종료합니다. 중지 전에 실행이 스테이징한 것은 검토용으로 유지됩니다. 이와 별개로 모든 실행에는 wall-clock 예산(`lifecycle.timeout_ms`, 기본 10분, 최대 60분)이 있으며, 이를 넘으면 워커가 종료되고 실행은 실패합니다. 이 경우를 포함해 어떤 이유로든 실패한 실행은 스테이징한 것을 폐기하며, 부분 결과는 Stop으로 중지했을 때만 유지됩니다.

### 진행률, 상태, 로깅

이들은 `ctx.progress` 아래에 있습니다(각 메서드는 선택적이지만 객체에 항상 사용 가능):

```ts
ctx.progress?.set?.({ percent: 40, message: "Scanning neighbors", phase: "expand" });
ctx.progress?.log?.("found 12 candidate nodes");
ctx.progress?.status?.("waiting");   // "running" | "waiting"
```

`set`만 표시됩니다: `percent`는 Tasks 행의 진행률을 구동하고 `message`는 플러그인 이름 뒤에 표시됩니다(`phase`는 무시됨). `log`와 `status`는 허용되지만 현재 버려집니다 — 속도 제한 일시 중지를 보여주려면 `set({ message: "waiting for rate limit…" })`으로 보고하세요. SDK에는 내장된 백오프 헬퍼가 없습니다.

### 스코프 게이트 멤버 {#scope-gated-members}

다음 각 항목은 해당 스코프가 부여되지 않으면 `undefined`입니다.

#### `graph` (`graph:*` 스코프)

최소 하나의 `graph` 동사가 부여된 경우에만 존재합니다. 각 메서드는 해당 동사가 부여된 경우에만 존재합니다.

```ts
// 읽기 — node:read
ctx.graph?.get?(nodeId): Promise<GraphNode | null>
ctx.graph?.list?(opts?: { type?: string }): Promise<{ nodes: GraphNode[] }>

// 읽기 — edge:read
ctx.graph?.edges?(): Promise<GraphEdge[]>
ctx.graph?.neighbors?(nodeId): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>

// 단일 쓰기 — node:create / node:update / node:delete / edge:create / edge:delete
ctx.graph?.createNode?(draft: EntityDraft): Promise<GraphNode>
ctx.graph?.updateNode?(nodeId, data): Promise<void>
ctx.graph?.deleteNode?(nodeId): Promise<void>
ctx.graph?.createEdge?(edge: EdgeDraft): Promise<void>
ctx.graph?.updateEdge?(edgeId, patch: { label?: string; data?: Record<string, unknown> }): Promise<void>   // edge:create
ctx.graph?.deleteEdge?(edgeId): Promise<void>

// 벌크
ctx.graph?.deleteNodes?(ids: string[]): Promise<{ deleted: number }>
ctx.graph?.deleteEdges?(ids: string[]): Promise<{ deleted: number }>
```

`list({ type })`는 노드 타입으로 필터링된 전체 그래프 열거를 한 번의 호출로 반환합니다 — 커서 페이지네이션이 아닙니다(**Thanos Snap**과 같은 전체 그래프 플러그인이 사용). `neighbors`는 1-홉 근방을 반환합니다(**Black Hole**이 사용). `updateNode`와 `createEdge`는 델타/초안을 받아 검토용으로 스테이징할 뿐 결과 레코드를 반환하지 않으므로 둘 다 `void`로 리졸브됩니다 — 적용된 상태가 필요하면 `get`/`list`로 다시 읽으세요. `updateNode`는 병합합니다: 전달한 값은 해당 필드를 대체하고 나머지 필드는 모두 유지되며, 이 실행이 방금 만든 노드에서도 마찬가지입니다. 빈 문자열과 `null`은 무시되므로 필드를 지울 수는 없습니다. 프로젝트에 없는 ID를 주면 예외를 던집니다. `createNode`는 동일성으로 중복을 제거합니다 — 정규 타입과 그 타입의 `identity_properties`(없으면 레이블 속성, 그다음 `value`): 라이브 노드(또는 이 실행이 이미 만든 노드)가 같은 동일성을 가지면 그 노드를 재사용해 필드를 병합하고 그 노드를 반환합니다. `type`이 설치된 [Type Pack](typepacks.md)에 정의되어 있지 않으면 예외를 던집니다. 데이터가 타입의 속성 검사를 통과하지 못하면 `createNode`와 `updateNode` 모두 예외를 던집니다. [앱이 노드 데이터에서 검사하는 것](typepacks.md#what-the-app-checks-on-node-data)을 참조하세요. `EdgeDraft.from`/`to`는 노드 ID입니다 — 라이브 ID 또는 `createNode`가 반환한 ID. `label`은 관계를 설명하는 자유 텍스트이며, 엣지에는 타입이 없습니다.

`updateEdge`는 `edge:create`로 게이트됩니다(`edge:update` 스코프는 현재 아무것도 부여하지 않음). `label`을 생략하면 문구와 그 등급이 그대로 유지됩니다. `EdgeDraft`/`updateEdge`는 엣지에 병합되는 선택적 `data` 객체를 받으며, `confidence`, `confidence_source`, `label_source`, `corroborated_by`는 호스트 소유이므로 거부됩니다. 순서가 있는 노드 쌍마다 엣지는 하나이므로, 이미 연결된 쌍에 대한 `createEdge`는 엣지를 추가하는 대신 그 엣지의 레이블 변경을 제안합니다.

`edges`와 `neighbors`로 읽어 온 엣지에는 `id`, `from_node_id`, `to_node_id`, `label`만 담깁니다. `GraphEdge` 타입에는 `data`가 선언되어 있지만 반환되지 않으므로, 플러그인은 자신이 쓴 `data`도, 엣지의 `confidence`나 `label_source`도 다시 읽을 수 없습니다.

<div id="net-network"></div>

#### `net` (network 스코프) {#net-network-scope}

[`network` 스코프](../reference/scopes.md)가 선언된 경우에만 존재합니다(또는 데스크톱 앱에서 `web_probe`만 있으면 `probe`만 존재). `fetch`는 `manifest.scopes.network` 엔드포인트와 그 선언된 `methods`로 제한됩니다. 요청은 쿠키 없이 전송되고, `Authorization`을 포함한 요청 헤더를 그대로 전달합니다. 헤더나 본문이 하나라도 있는 요청은 리다이렉트를 따라가지 않으며, 3xx 응답을 받으면 메시지가 `redirect not followed`로 시작하는 `Error`로 거부됩니다. 헤더도 본문도 없는 요청은 브라우저처럼 리다이렉트를 따라갑니다. 6개의 참조 플러그인은 네트워크를 **전혀** 사용하지 않습니다.

```ts
ctx.net?.fetch?(input: string, init?: SafeRequestInit): Promise<SafeResponse>
```

요청마다 본문까지 포함한 응답 전체에 걸리는 제한 시간이 있으며, 기본 60초입니다. `init.timeoutMs`로 바꿀 수 있습니다(최소 1초, 최대 10분). `0`, 음수, 숫자가 아닌 값은 기본값 60초가 됩니다. 제한 시간을 넘긴 요청은 이름이 `TimeoutError`인 `Error`로 거부되며, 메시지에는 메서드와 오리진만 담깁니다(예: `GET https://api.example.com did not answer within 60s`). `AbortError`는 실행이 중지되었다는 뜻입니다. 실행 전체의 wall-clock 예산은 이와 별개로 적용됩니다.

호스트는 제한 시간 안에 응답하지 않은 오리진을 기록하므로, 플러그인이 `TimeoutError`를 잡고 정상적으로 반환하더라도 응답이 없었다는 사실은 따로 보고됩니다. 아무것도 스테이징하지 않고 성공한 실행은 알림이 노란색으로 바뀌고 끝에 `(no answer from <origins>)`가 붙습니다. AI 에이전트가 시작한 실행이면 결과와 관계없이 응답하지 않은 호스트가 에이전트에게 전달됩니다.

내장된 재시도/백오프 헬퍼는 없습니다 — HTTP `429`/`Retry-After`는 직접 처리하고, 대기하는 동안 `ctx.progress?.set?.({ message: "waiting for rate limit…" })`으로 일시 중지를 보고하세요.

#### `net.probe` (`web_probe` 스코프, 데스크톱 전용)

`scopes.web_probe`가 선언**되고** 플러그인이 데스크톱 셸에서 실행 중일 때만 존재합니다 — 스코프가 부여되어도 웹 빌드에서는 계속 없습니다. 대상 호스트를 미리 알 수 없는 플러그인을 위해 임의의 공개 호스트로 단일 익명 요청을 수행합니다: 쿠키 없음, `Origin` 없음, 리다이렉트를 따라가지 않음(호출자는 요청한 URL의 실제 상태를 봅니다), 사설/루프백 호스트는 거부됩니다. 기본 포트(80/443)와 GET/HEAD/POST 메서드만 허용되며, `cookie`, `authorization`, `host`와 포워딩 헤더는 제거되며, `User-Agent`를 지정하지 않으면 데스크톱 브라우저의 것이 전송됩니다. `maxBytes`는 기본 512 KiB(최대 2 MiB)입니다. `timeoutMs`는 연결과 응답에 걸리는 제한으로, 기본 8초이며 최소 1초, 최대 20초입니다. 셸은 한 번에 최대 48개의 프로브를 실행하며, 이 시간은 프로브가 실행 슬롯을 얻고 호스트 이름 검사를 마친 뒤에야 재기 시작합니다(DNS에는 별도로 3초 제한이 있고 두 번 시도합니다). 따라서 프로브는 `timeoutMs`보다 오래 걸릴 수 있습니다. 슬롯을 기다릴 수 있는 프로브는 최대 2048개이며, 이를 넘으면 프로브는 곧바로 `error: "too many queued probes"`로 리졸브됩니다. 거부되거나 실패한 프로브는 예외를 던지지 않고 `status: 0`과 `error`가 설정된 채로 리졸브됩니다.

두 옵션은 반환되는 내용을 바꿉니다:

- `bodyEncoding: "base64"`는 본문을 base64로 인코딩해 반환합니다. 파비콘 같은 바이너리 콘텐츠용입니다. 디코딩하기 전에 `response.bodyEncoding === "base64"`인지 확인하세요.
- `headerNames: true`(GET 또는 HEAD 전용)는 HTTP/1.1로 요청하고, 서버가 보낸 그대로의 응답 헤더 이름 — 순서, 대소문자, 반복까지 — 을 `headerNames`로 반환합니다. 본문은 읽지 않습니다.

```ts
ctx.net?.probe?(input: string, init?: SafeProbeInit): Promise<SafeProbeResponse>
```

#### `service` (`scopes.services`)

`scopes.services`가 최소 하나의 Vineyard 운영 서비스(현재 모든 팩에 열린 `rdap`, 그리고 `run.vineyard.pluginpacks.telegram` 전용인 `telegram` — 다른 팩이 호출하면 오류)를 지정한 경우에만 존재합니다. Vineyard 계정 없이 실행되는 빌드(로컬 모드)에서는 호출이 예외를 던집니다. 목적지는 URL이 아니라 이름입니다 — 호스트가 이를 해석하고 분석가의 자격 증명을 첨부하며, 플러그인이 전달하는 `Authorization` 헤더는 이를 재정의할 수 없습니다.

```ts
ctx.service?(name: string, path: string, init?: SafeRequestInit): Promise<SafeResponse>
```

`init.timeoutMs`와 요청 제한 시간은 `net.fetch`와 같습니다.

`path`는 서비스 루트를 기준으로 해석됩니다. 앞의 슬래시는 제거되므로 `"/8.8.8.8"`과 `"8.8.8.8"`은 같은 곳에 도달합니다. 루트 밖으로 벗어나는 경로(루트 위로 올라가는 `..`나 절대 URL)는 `service path '<path>' escapes the '<name>' service root` 예외를 던집니다. 서비스 요청에는 항상 분석가의 자격 증명이 붙으므로 리다이렉트를 절대 따라가지 않으며, 3xx 응답은 메시지가 `redirect not followed`로 시작하는 `Error`로 거부됩니다. `401`은 서비스 고장이 아니라 분석가의 Vineyard 세션이 끝났다는 뜻입니다.

#### `config` (`scopes.config`)

`scopes.config`가 선언**되고** 분석가가 그 키 중 하나 이상을 설정한 경우에만 존재합니다. 읽기 전용, 선언된 값만.

```ts
ctx.config?: Readonly<Record<string, string | number | boolean>>
```

!!! warning "시크릿은 이를 선언한 플러그인에게만 전달됩니다"
    `secret: true`는 값을 입력하는 방식(마스킹된 필드)만 바꿉니다 — 값은 여전히 이를 선언한 플러그인에게 `ctx.config.<key>`로 전달되며, 자신의 매니페스트가 선언한 키만 전달됩니다. 같은 팩에서 같은 키를 선언하고 같은 네트워크 오리진을 호출하는 멤버들은 값 하나를 공유하므로, 분석가는 한 번만 입력하면 됩니다. 값은 로그인한 계정별로 보관됩니다 — 데스크톱에서는 OS 키체인에(암호화할 수 없는 데스크톱에서는 그 세션 동안만), 브라우저에서는 해당 탭에서만. [시크릿 처리](security.md#secret-handling)를 참조하세요.

!!! note "`publish` 스코프는 존재하지 않습니다"
    플러그인은 프로젝트 채팅/피드에 게시할 수 없습니다 — `ctx.message`는 존재하지 않습니다. `publish`는 스코프 스키마에 없으며, 앱은 이를 무시하고 아무 권한도 주지 않으므로 제거하세요. 찾아낸 결과는 대신 그래프에 기록하세요.

### 벌크 작업

`deleteNodes(ids[])`와 `deleteEdges(ids[])`는 각각 수백 번의 왕복 대신 ID마다 삭제 하나를 한 배치로 스테이징하는 **단일 브리지 호출**입니다. ID 중 하나라도 알 수 없으면 호출 전체가 거부되므로(`no node <id> in this project` / `no edge <id> in this project`), 그래프에서 읽은 ID만 전달하세요. 전체 그래프 변이(예: Korean Roulette이 전체 그래프를 지우는 경우)에는 벌크 형태를 선호하세요. 영향을 받은 각 노드와 엣지는 여전히 분석가가 검토하는 변경 세트에 각자의 항목으로 나타납니다.

## 완전한 `run(ctx)` 예제

완전히 작동하는 예제(Korean Roulette)와 `createMockContext` 단위 테스트는 [퀵스타트](quickstart.md)를 참조하세요.

<div id="createmockcontext"></div>

## `createMockContext`로 테스트하기 {#testing-with-createmockcontext}

`createMockContext`는 앱 없이, GitHub 없이, 서버 없이 `run(ctx)`을 단위 테스트할 수 있게 합니다. 인메모리 그래프 위에 `HostContext`를 빌드합니다: `graph`는 graph 동사가 하나라도 부여되면 존재하고 그 **쓰기** 메서드는 해당 동사에 대해서만 존재합니다(mock에서는 읽기 메서드가 항상 존재 — 프로덕션은 `node:read`/`edge:read`도 요구). `net.fetch`/`net.probe`는 `netHandler`/`probeHandler`를 전달했을 때 존재하고, `config`는 전달한 값입니다(기본 `{}`). `updateEdge`와 동일성 중복 제거는 mock되지 않습니다. 반환된 컨텍스트는 어서션할 수 있는 `mock` 레코드를 가집니다.

mock은 다음 점에서 앱과 달라서, 테스트가 통과해도 이 차이가 가려질 수 있습니다:

- 쓰기가 mock의 그래프에 곧바로 반영되므로, `get`, `list`, `edges`, `neighbors`는 실행이 만들거나 바꾼 것을 보고 삭제한 것은 더 이상 보지 않습니다. 앱에서는 이 읽기들이 라이브 그래프에서 오며, 스테이징된 변경은 적용되기 전까지 보이지 않습니다. 실행이 만든 노드를 찾아 주는 것은 `get`뿐입니다.
- `list({ type })`는 `type`을 무시하고 모든 노드를 반환합니다.
- `edges`와 `neighbors`는 전달한 엣지를 `data`까지 그대로 반환하지만, 앱은 엣지의 `data`를 반환하지 않습니다.
- `ctx.signal`은 `signal`을 전달하지 않으면 `undefined`이므로, `ctx.signal.aborted`를 읽는 코드는 테스트에서 signal을 넘겨야 합니다. `onCancel` 핸들러는 호출되지 않습니다.
- `config`를 전달하지 않으면 `ctx.config`는 `{}`입니다. 앱에서는 분석가가 선언된 키 중 하나를 설정하기 전까지 존재하지 않습니다.
- `ctx.service`가 없습니다. `net.fetch`는 모든 요청을 `netHandler`에 그대로 넘기며, 선언된 엔드포인트와 메서드 검사, 제한 시간, 리다이렉트 규칙이 모두 없습니다.
- `createNode`는 타입이 설치된 Type Pack에 있는지도, 데이터가 타입의 속성 검사를 통과하는지도 확인하지 않습니다.
- `updateNode`는 `""`와 `null`도 필드에 그대로 씁니다. 앱은 이 값들을 무시합니다.
- `createEdge`는 엣지에 `data`를 저장하지 않고(전달한 초안은 `data`까지 `mock.createdEdges`에 기록됩니다), 호스트 소유 `data` 키를 거부하지 않으며, 이미 연결된 쌍이어도 레이블을 바꾸는 대신 항상 새 엣지를 추가합니다.
- `updateNode`, `deleteNode`, `deleteEdge`와 벌크 삭제는 알 수 없는 ID를 거부하지 않습니다.
- `run.platform`은 항상 `"web"`입니다.

`MockContextOptions`는 `nodes`, `edges`, `params`, `config`, `selection`, `grantedScopes`, `projectId`, `pluginId`, `signal`, `netHandler`, `probeHandler`를 허용합니다. `ctx.mock` 레코드는 `nodes`, `edges`, `createdNodes`, `createdEdges`, `deletedNodeIds`, `deletedEdgeIds`, `updatedNodes`, `progress`를 노출합니다. 전체 테스트 예제는 [퀵스타트](quickstart.md)를 참조하세요.

!!! note "참조 구현"
    `createMockContext`는 `sdk.ts` 자체에 구현되어 있습니다. 위의 이름들을 안정적인 계약으로 취급하세요.

## 다음 / 참고

- [플러그인 매니페스트](plugin-manifest.md) — `definePlugin`에 전달하는 `manifest`
- [스코프 레퍼런스](../reference/scopes.md) — 각 `ctx` 멤버를 게이트하는 것
- [샌드박스 및 보안](security.md) — 워커 샌드박스, 이그레스 허용목록, 스테이징된 쓰기
- [작업 생명주기](lifecycle.md) — 진행률, 취소, 작업 상태
- [퀵스타트: 첫 플러그인](quickstart.md) — 개발 로더 및 테스트 하네스
- [플러그인 실행](../guide/running-plugins.md) — SDK가 검증된 6개의 Chaos 참조 플러그인
