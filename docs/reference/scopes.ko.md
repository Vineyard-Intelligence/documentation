# Scopes reference

plugin이 `manifest.scopes`에서 선언할 수 있는 모든 scope 문자열, 각각이 부여하는 것, 그리고 잠금 해제하는 `ctx` 멤버에 대한 완전한 카탈로그입니다. Scope는 plugin이 얻는 **유일한** 권한입니다 — `ctx` 멤버는 해당 scope가 부여되지 않으면 존재하지 않으므로 우회할 수 있는 것이 없습니다. 최소 권한을 선언하세요: plugin이 실제로 필요로 하는 가장 좁은 동사를 선택하세요.

런타임에 권한 부여가 어떻게 시행되는지(일회성 RunToken, CSP 이그레스, 비밀 스크러빙)는 [security](../develop/security.md)를 참조하세요.

`scopes` 블록은 정확히 4개의 키를 가지며, 모두 선택 사항입니다:

```jsonc
"scopes": {
  "graph":   ["node:read", "edge:create"],                 // 세분화된 그래프 동사
  "publish": ["message:post"],                              // 프로젝트 피드에 게시
  "network": [ { "endpoint": "https://...", "methods": ["POST"] } ],
  "config":  [ { "key": "max_concurrency", "type": "number" } ]
}
```

## graph

노드와 엣지에 대한 세분화된 동사 (`node:*` / `edge:*` × read/create/update/delete). 삭제하는 plugin은 `node:delete` / `edge:delete`를 명시적으로 선언해야 합니다. `ctx.graph`는 **하나 이상의** graph 동사가 부여된 경우에만 존재합니다. 아래 각 메서드는 해당 특정 동사가 부여된 경우에만 존재합니다. (출처: `sdk/types.ts` `GraphScope`, `HostContext.graph`.)

| Scope string | Grants | `ctx` member(s) |
| --- | --- | --- |
| `node:read` | 개별 노드 읽기, 그래프 열거, 이웃 나열 | `ctx.graph.get`, `ctx.graph.list`, `ctx.graph.neighbors` |
| `node:create` | `EntityDraft`에서 노드 생성; 벌크 upsert | `ctx.graph.createNode`, `ctx.graph.emit` |
| `node:update` | 노드의 `data` 패치 | `ctx.graph.updateNode` |
| `node:delete` | 단일 바운드 작업으로 하나 또는 여러 노드 삭제 | `ctx.graph.deleteNode`, `ctx.graph.deleteNodes` |
| `edge:read` | 엣지 읽기 (이웃/목록 쿼리와 함께 반환됨) | `ctx.graph.neighbors`, `ctx.graph.list` |
| `edge:create` | 엣지 생성; 벌크 upsert 엣지 | `ctx.graph.createEdge`, `ctx.graph.emit` |
| `edge:update` | 엣지 데이터 업데이트 | *(예약됨; `sdk/types.ts`에 전용 메서드 없음)* |
| `edge:delete` | 엣지 삭제 | `ctx.graph.deleteEdge` |

!!! note "Bulk ops count as one write"
    `deleteNodes(ids[])`와 `emit(entities, edges)`는 RunToken의 `max_writes` 제한에 대해 **단일** 바운드 작업으로 계산되므로, 정당한 대량 삭제(Korean Roulette, Thanos Snap)가 과도하게 제한되지 않습니다. [security](../develop/security.md)를 참조하세요.

!!! info "Emit needs both verbs"
    `ctx.graph.emit(entities, edges)`는 노드*와* 엣지를 upsert합니다. 둘 다에 사용하려면 `node:create`와 `edge:create`를 부여하세요. `node:create`만 있는 경우, 엣지 없이 `emit(entities)`를 전달하세요.

## publish

| Scope string | Grants | `ctx` member |
| --- | --- | --- |
| `message:post` | 프로젝트 채팅/피드에 텍스트 메시지(선택적 메타데이터 포함) 게시 | `ctx.message.post` |

`ctx.message`는 `message:post`가 부여된 경우에만 존재합니다. (출처: `sdk/types.ts` `PublishScope`, `HostContext.message`.)

## network

각 항목은 `NetworkScope` 객체이며, **단순 문자열이 아닙니다**. `ctx.net`은 하나 이상의 network scope가 선언된 경우에만 존재합니다. (출처: `sdk/types.ts` `NetworkScope`, `HostContext.net`.)

```jsonc
"network": [
  { "endpoint": "https://api.example.com/v1/lookup",
    "methods": ["POST"],
    "purpose": "shown at install" }
]
```

| Field | Type | Meaning |
| --- | --- | --- |
| `endpoint` | `string` | plugin이 접근할 수 있는 정확한 origin/path 접두사 |
| `methods` | `HttpMethod[]` | 허용된 동사: `GET` `POST` `PUT` `PATCH` `DELETE` |
| `purpose` | `string` (선택 사항) | 사람이 읽을 수 있는 이유, 설치 시 표시됨 |

`ctx.net.fetch` / `ctx.net.fetchWithBackoff`는 이 엔드포인트로 제한됩니다.

!!! warning "Web: exactly one endpoint == proxy_endpoint"
    **web** plugin의 경우 `network` 배열은 정확히 **하나**의 항목을 포함해야 하며, 그 `endpoint`는 `platforms.web.proxy_endpoint`와 동일해야 합니다 — 팬아웃 없음. 이그레스는 JS가 아닌 worker origin의 `Content-Security-Policy: connect-src`에 의해 시행됩니다. 데스크톱은 더 많은 엔드포인트를 선언할 수 있습니다 (사용자의 책임하에). 브릿지는 `credentials: "omit"`을 강제하고 `Authorization` / `Cookie` 헤더를 제거합니다 (`SafeRequestInit`).

## config

각 항목은 `ConfigValue`입니다. `config` 항목을 선언하면 `ctx.config`가 존재하게 됩니다 — 선언된 **비밀 아닌** 값들의 읽기 전용 맵입니다. (출처: `sdk/types.ts` `ConfigValue`, `HostContext.config`.)

| Field | Type | Meaning |
| --- | --- | --- |
| `key` | `string` | 식별자, 패턴 `^[a-z0-9_]+$` |
| `label` | `string` (선택 사항) | 설치 폼의 표시 라벨 |
| `type` | `"string" \| "number" \| "boolean" \| "url" \| "enum"` | 값 유형 |
| `enum` | `string[]` (선택 사항) | `type`이 `enum`일 때 허용된 값 |
| `secret` | `boolean` (선택 사항) | BYOK 방식 자격 증명; 아래 참조 |
| `scope` | `"plugin" \| "project" \| "user"` (선택 사항) | 값이 저장되는 위치 |
| `optional` | `boolean` (선택 사항) | false/없으면 설치 시 값이 필수 |

!!! danger "secret semantics"
    `secret: true`는 **키체인/데스크톱 전용**을 의미합니다. 값은 호스트(`safeStorage`/keyring을 통한 데스크톱 키체인)에 의해 네트워크 경계에서 주입됩니다. **브라우저에 반환되지 않으며**, 어떤 task 기록이나 AI 대화에도 **기록되지 않으며**, plugin은 "내 비밀 config 읽기" 호출을 받지 않습니다 — 키를 자신의 출력에 반영할 수 없습니다. 따라서 비밀 값은 web에서 `ctx.config`에서 **제외됩니다**. 비밀 config가 있는 web 설치는 사용자를 데스크톱 plugin으로 안내합니다. 브라우저에서의 BYOK는 설계상 지원되지 않습니다. [security](../develop/security.md) 및 SPEC §6을 참조하세요.

## Not scopes

다음은 **항상 사용 가능**하며 데이터나 네트워크에 대한 권한을 부여하지 않습니다. 선언이 필요하지 않습니다. (출처: SPEC §4; `sdk/types.ts` `HostContext`.)

| Capability | `ctx` member | Notes |
| --- | --- | --- |
| `params` | `ctx.params` | 이 실행의 사용자 입력, `params` JSON Schema에 대해 검증됨 (읽기 전용) |
| `progress` | `ctx.progress.set` | Task UI 구동 (`percent` / `message` / `phase`) |
| `log` | `ctx.progress.log` | 실행에 로그 줄 추가 |
| `status` | `ctx.progress.status` | `"running"` / `"waiting"` 보고 |
| `signal` | `ctx.signal`, `ctx.onCancel` | 협력적 취소 — plugin이 반드시 관찰해야 함 |

두 멤버도 항상 존재하며 게이트되지 않습니다: `ctx.run` (이 실행의 식별 — `runId`, `projectId`, `pluginId`, `grantedScopes`, `platform`) 및 `ctx.input` (`selection`을 포함한 트리거 컨텍스트).

!!! example "A scope-0 plugin"
    Chaos 팩의 **Dumb AI Optimizer**는 scope를 전혀 선언하지 않습니다. 여전히 `ctx.params`, `ctx.progress`, `ctx.signal`을 받지만 — `ctx.graph`, `ctx.net`, `ctx.message`, `ctx.config`는 모두 `undefined`입니다.

## Next / See also

- [Security](../develop/security.md) — RunToken, CSP 이그레스, 비밀 스크러빙
- [Plugin schema](plugin-schema.md) — 전체 manifest 참조
- [SDK](../develop/sdk.md) — `ctx` 인터페이스 및 `definePlugin`
