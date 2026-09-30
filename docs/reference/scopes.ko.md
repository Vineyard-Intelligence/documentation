# Scopes reference

plugin이 `manifest.scopes`에서 선언할 수 있는 모든 scope 문자열, 각각이 부여하는 것, 그리고 잠금 해제하는 `ctx` 멤버에 대한 완전한 카탈로그입니다. `ctx` 멤버는 해당 scope가 부여되지 않으면 존재하지 않습니다. 최소 권한을 선언하세요: plugin이 실제로 필요로 하는 가장 좁은 동사를 선택하세요.

런타임에 권한 부여가 어떻게 시행되는지(Web Worker 샌드박스, 이그레스 허용 목록, 비밀 스크러빙)는 [security](../develop/security.md)를 참조하세요.

`scopes` 블록은 정확히 5개의 키를 가지며, 모두 선택 사항입니다:

```jsonc
"scopes": {
  "graph":     ["node:read", "edge:create"],               // 세분화된 그래프 동사
  "network":   [ { "endpoint": "https://...", "methods": ["POST"] } ],
  "web_probe": { "purpose": "check whether a profile page exists" },  // 데스크톱 전용
  "services":  ["rdap"],                                   // 이름으로 호출하는 Vineyard 운영 서비스
  "config":    [ { "key": "max_concurrency", "type": "number" } ]
}
```

## graph

노드와 엣지에 대한 세분화된 동사 (`node:*` / `edge:*` × read/create/update/delete). 삭제하는 plugin은 `node:delete` / `edge:delete`를 명시적으로 선언해야 합니다. `ctx.graph`는 **하나 이상의** graph 동사가 부여된 경우에만 존재합니다. 아래 각 메서드는 해당 특정 동사가 부여된 경우에만 존재합니다. (출처: `@vineyard/plugin-sdk` 패키지 타입 — `GraphScope`, `HostContext.graph`.)

| Scope string | Grants | `ctx` member(s) |
| --- | --- | --- |
| `node:read` | 개별 노드 읽기, 노드 나열 (선택적으로 유형별) | `ctx.graph.get`, `ctx.graph.list` |
| `node:create` | `EntityDraft`에서 노드 생성 | `ctx.graph.createNode` |
| `node:update` | 노드의 `data` 패치 | `ctx.graph.updateNode` |
| `node:delete` | 단일 바운드 작업으로 하나 또는 여러 노드 삭제 | `ctx.graph.deleteNode`, `ctx.graph.deleteNodes` |
| `edge:read` | 모든 엣지 읽기; 노드의 1-홉 이웃 | `ctx.graph.edges`, `ctx.graph.neighbors` |
| `edge:create` | 엣지 생성; 기존 엣지를 id로 수정 (label/data) | `ctx.graph.createEdge`, `ctx.graph.updateEdge` |
| `edge:update` | 스키마가 허용함 | *(뒷받침하는 메서드 없음 — `updateEdge`는 `edge:create`로 부여됨)* |
| `edge:delete` | 단일 바운드 작업으로 하나 또는 여러 엣지 삭제 | `ctx.graph.deleteEdge`, `ctx.graph.deleteEdges` |

!!! note "A write verb is not a write"
    `node:create`(또는 create/update/delete 동사 전부)를 부여한다고 해서 plugin이 프로젝트를 변경할 수 있게 되는 것은 아닙니다. 쓰기는 해당 실행의 변경 세트로 캡처되며, 분석가가 그 변경 세트를 검토하고 자신의 계정으로 적용할 때에만 그래프에 반영됩니다.

!!! note "Bulk ops are one operation"
    `deleteNodes(ids[])`와 `deleteEdges(ids[])`는 N개의 개별 쓰기가 아니라 **단일** 바운드 호출입니다: 정당한 대량 삭제(Russian Roulette, Thanos Snap)는 한 번만 발행되며 호스트가 자체적으로 동시성을 제한합니다.

## network

각 항목은 `NetworkScope` 객체이며, **단순 문자열이 아닙니다**. `ctx.net.fetch`는 하나 이상의 network scope가 선언된 경우에만 존재합니다. (출처: `@vineyard/plugin-sdk` 패키지 타입 — `NetworkScope`, `HostContext.net`.)

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

`ctx.net.fetch`는 이 엔드포인트로 제한됩니다. URL은 문자열 접두사가 아니라 **파싱된 origin**(프로토콜, 호스트, 포트)과 경로 세그먼트 경계로 매칭되고 — `https://h/v1`은 `/v1/search`를 포함하지만 `/v1beta`는 포함하지 않습니다 — 선언된 `methods`로도 매칭됩니다.

!!! warning "The host bridge is the only way out"
    plugin 코드에는 자체 네트워크가 없습니다: plugin이 직접 여는 `fetch`, XHR, WebSocket, 중첩 worker는 web과 데스크톱 앱 모두에서 거부됩니다. `ctx.net.fetch`(이 엔드포인트들로 검사됨), [`ctx.net.probe`](#web_probe), [`ctx.service`](#services)를 사용하세요. 개발 서버는 이를 강제하지 않으므로, `fetch`를 직접 호출하는 팩은 개발 중에는 동작하고 프로덕션에서는 실패합니다. sandbox-js plugin은 여러 엔드포인트를 선언할 수 있습니다. 쿠키는 전송되지 않으며, 요청 헤더는 `Authorization`을 포함해 작성한 그대로 전달됩니다([Sending a credential](plugin-schema.md#sending-a-credential) 참조). 데스크톱에서는 CORS 헤더가 없는 선언된 엔드포인트에도 접근할 수 있습니다.

## web_probe

배열이 **아닌** 단일 객체입니다. `ctx.net.probe`를 부여합니다 — *임의의* 공개 호스트에 대한 한 번의 익명 요청으로, 계정 탐지처럼 엔드포인트를 미리 나열할 수 없는 plugin을 위한 것입니다. (출처: `@vineyard/plugin-sdk` 패키지 타입 — `WebProbeScope`, `HostContext.net.probe`.)

```jsonc
"web_probe": { "purpose": "check whether a username has a profile page" }
```

| Field | Type | Meaning |
| --- | --- | --- |
| `purpose` | `string` (선택 사항) | 사람이 읽을 수 있는 이유 |

조건을 정하는 쪽은 plugin이 아니라 호스트입니다: 쿠키 없음, 자격 증명 없음(`Cookie` / `Authorization` / `Host` 헤더 제거), 사설·루프백 대상 거부, `maxBytes` / `timeoutMs`는 상한으로 클램프됩니다. 리다이렉트는 **따라가지 않습니다** — 호출자는 자신이 요청한 URL의 실제 상태를 보게 되며, 존재 여부 탐지는 바로 이것에 의존합니다(로그인 페이지로의 302는 "계정 없음"을 뜻합니다). 3xx의 `Location`은 `redirectUrl`로 반환됩니다.

!!! warning "Desktop only"
    web 빌드에서는 부여되었더라도 `ctx.net.probe`가 **존재하지 않습니다**. 호출 전에 존재 여부를 확인하고 폴백하세요 (WhatsMyName 팩이 정확히 이렇게 합니다).

## services

이 플러그인이 **이름으로** 호출하는 Vineyard 운영 서비스입니다. `ctx.service`를 뒷받침하며, 서비스 이름과 경로만 받고 기본 URL은 앱이 고정합니다.

```jsonc
"services": ["rdap"]
```

| 이름 | 내용 |
| --- | --- |
| `rdap` | 모든 RIR을 정규화한 캐시형 IP RDAP 조회 |
| `telegram` | Vineyard가 운영하는 계정으로 수행하는 읽기 전용 텔레그램 정찰 |

닫힌 enum이라 오타는 리뷰에서 걸립니다. 서비스 스코프는 카탈로그 카드의
`scopes_summary.network`에 **포함되지 않고**, 별도 `services` 필드로 표시됩니다.

```js
const res = await ctx.service('rdap', '8.8.8.8');
const who = await ctx.service('telegram', 'resolve', {
    method: 'POST',
    body: JSON.stringify({ target: 'durov' }),
});
```

서비스 호출의 `Authorization`은 무시됩니다 — 호스트가 설정합니다. 일부 서비스는 지정된 팩으로
제한되며, `telegram`이 그렇습니다.

## config

각 항목은 `ConfigValue`입니다. `ctx.config`는 분석가가 값을 설정한 선언된 키들(비밀 키 포함)을 선언된 `type`으로 변환해 담은 읽기 전용 맵입니다. 그중 어느 것에도 값이 없는 동안에는 존재하지 않으므로, `ctx.config?.key ?? DEFAULT`로 읽으세요. 값은 로그인한 계정별로 보관됩니다 — 데스크톱에서는 OS 키체인에, 브라우저에서는 해당 탭 세션 동안. (출처: `@vineyard/plugin-sdk` 패키지 타입 — `ConfigValue`, `HostContext.config`.)

| Field | Type | Meaning |
| --- | --- | --- |
| `key` | `string` | 식별자, 패턴 `^[a-z0-9_]+$` |
| `label` | `string` (선택 사항) | Run plugins 대화상자의 해당 plugin Settings 섹션에 표시되는 필드 라벨 |
| `type` | `"string" \| "number" \| "boolean" \| "url" \| "enum"` | 값 유형 |
| `enum` | `string[]` (선택 사항) | `type`이 `enum`일 때 허용된 값 |
| `secret` | `boolean` (선택 사항) | BYOK 방식 자격 증명; 아래 참조 |
| `scope` | `"plugin" \| "project" \| "user"` (선택 사항) | 값이 저장되는 위치. 허용되지만 오늘은 읽히지 않으며, 값은 plugin별로 저장됨 |
| `optional` | `boolean` (선택 사항) | false/없으면 필드에 "required by this plugin"이 표시됨 (강제되지 않음; plugin이 값이 없는 경우를 처리해야 함) |

!!! danger "secret semantics"
    `secret: true`는 **값을 plugin으로부터 숨기지 않습니다**. 값은 선언한 plugin에게 `ctx.config[key]`로 실제 전달됩니다 — API를 호출하는 주체가 plugin이기 때문입니다. 플래그는 폼 필드를 마스킹합니다. 값은 task 기록이나 AI 대화에 **절대 기록되지 않으며**, 이는 자격 증명을 `params`에 두지 않기 때문입니다. [security](../develop/security.md)를 참조하세요.

## Not scopes

다음은 **항상 사용 가능**하며 데이터나 네트워크에 대한 권한을 부여하지 않습니다. 선언이 필요하지 않습니다. (출처: `@vineyard/plugin-sdk` 패키지 타입 — `HostContext`.)

| Capability | `ctx` member | Notes |
| --- | --- | --- |
| `params` | `ctx.params` | 이 실행의 사용자 입력 (읽기 전용). `params` JSON Schema에 대해 검증되지 않음: Run 대화상자는 `required` 필드가 채워졌는지만 확인하므로 유형은 직접 검증하세요 |
| `progress` | `ctx.progress.set` | Task UI 구동 (`percent` / `message` / `phase`) |
| `log` | `ctx.progress.log` | 허용되지만 현재 no-op; 아무것도 기록되지 않음 |
| `status` | `ctx.progress.status` | 허용되지만 현재 no-op; task 상태는 runner가 설정함 |
| `signal` | `ctx.signal`, `ctx.onCancel` | 협력적 취소 — plugin이 반드시 관찰해야 함 |

두 멤버도 항상 존재하며 게이트되지 않습니다: `ctx.run` (이 실행의 식별 — `runId`, `projectId`, `pluginId`, `grantedScopes`, `platform`) 및 `ctx.input` (`selection`을 포함한 트리거 컨텍스트).

!!! example "A scope-0 plugin"
    Chaos 팩의 **Dumb AI Optimizer**는 scope를 전혀 선언하지 않습니다. 여전히 `ctx.params`, `ctx.progress`, `ctx.signal`을 받지만 — `ctx.graph`, `ctx.net`, `ctx.config`는 모두 `undefined`입니다.

## Next / See also

- [Security](../develop/security.md) — worker 샌드박스, 이그레스 허용 목록, 비밀 스크러빙
- [Plugin schema](plugin-schema.md) — 전체 manifest 참조
- [SDK](../develop/sdk.md) — `ctx` 인터페이스 및 `definePlugin`
