# Scopes reference

plugin이 `manifest.scopes`에서 선언할 수 있는 모든 scope 문자열, 각각이 부여하는 것, 그리고 잠금 해제하는 `ctx` 멤버에 대한 완전한 카탈로그입니다. Scope는 plugin이 얻는 **유일한** 권한입니다 — `ctx` 멤버는 해당 scope가 부여되지 않으면 존재하지 않으므로 우회할 수 있는 것이 없습니다. 최소 권한을 선언하세요: plugin이 실제로 필요로 하는 가장 좁은 동사를 선택하세요.

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

!!! warning "There is no `publish` scope"
    plugin은 프로젝트 채팅이나 피드에 게시할 수 없습니다 — `ctx.message`는 존재하지 않습니다. `"publish": ["message:post"]`를 담고 있는 manifest 초안이 있다면 그 키를 삭제하세요: `scopes`는 `additionalProperties: false`이므로 이제 스키마 검증에 실패합니다.

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
    `node:create`(또는 create/update/delete 동사 전부)를 부여한다고 해서 plugin이 케이스를 변경할 수 있게 되는 것은 아닙니다. 쓰기는 해당 실행의 변경 세트로 캡처되며, 분석가가 그 변경 세트를 검토하고 자신의 계정으로 적용할 때에만 그래프에 반영됩니다. 신뢰할 수 없는 plugin의 실질적 경계는 scope 문자열이 아니라 바로 이 검토입니다.

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

`ctx.net.fetch`는 이 엔드포인트로 제한됩니다. URL은 문자열 접두사가 아니라 **파싱된 origin**과 경로 세그먼트 경계로 매칭됩니다 — `https://h/v1`은 `/v1/search`를 포함하지만 `/v1beta`는 포함하지 않으며, `https://h.attacker.test`는 전혀 포함하지 않습니다 (`plugins/net-allowlist.ts`, `endpointCovers`).

!!! warning "The host bridge is the only way out"
    plugin worker 자체의 응답에는 web과 데스크톱 셸 모두에서 두 번째 CSP `connect-src 'none'; worker-src 'none'`이 붙습니다. plugin이 직접 여는 `fetch`, XHR, WebSocket, 중첩 worker는 모두 거부되므로, 호스트 브릿지가 유일한 네트워크 경로입니다: 이 엔드포인트들로 검사되는 `ctx.net.fetch`, 그리고 [`ctx.net.probe`](#web_probe)와 [`ctx.service`](#services). (`vite dev`에서는 이 CSP가 제공되지 않으므로, `fetch`를 직접 호출하는 팩은 거기서는 동작하고 프로덕션에서는 실패합니다.) sandbox-js plugin은 여러 엔드포인트를 선언할 수 있습니다. 항목 하나짜리 `proxy_endpoint` 규칙은 연기된 `web-proxy` 런타임의 것입니다. 브릿지는 `credentials: "omit"`을 강제하므로 분석가의 쿠키는 plugin 요청에 절대 실리지 않으며, 요청 헤더는 `Authorization`을 포함해 그대로 전달합니다([Sending a credential](plugin-schema.md#sending-a-credential) 참조). 데스크톱에서는 셸이 추가로 `Origin`을 제거하고 선언된 origin에 대해 CORS 헤더를 채워 주므로, CORS 헤더를 보내지 않는 선언된 엔드포인트에도 접근할 수 있습니다.

## web_probe

배열이 **아닌** 단일 객체입니다. `ctx.net.probe`를 부여합니다 — *임의의* 공개 호스트에 대한 한 번의 익명 요청입니다. `network`가 허용 목록(plugin이 호출할 엔드포인트를 직접 명시)인 반면, `web_probe`는 정반대 형태입니다: 계정 탐지 같은 plugin은 수백 개 사이트 중 어디에 접속할지 미리 알 수 없으므로, 엔드포인트 목록 대신 접근의 *방식*을 선언하고 호스트가 이를 제약합니다. (출처: `@vineyard/plugin-sdk` 패키지 타입 — `WebProbeScope`, `HostContext.net.probe`.)

```jsonc
"web_probe": { "purpose": "check whether a username has a profile page" }
```

| Field | Type | Meaning |
| --- | --- | --- |
| `purpose` | `string` (선택 사항) | 사람이 읽을 수 있는 이유 |

조건을 정하는 쪽은 plugin이 아니라 호스트입니다: 쿠키 없음, 자격 증명 없음(`Cookie` / `Authorization` / `Host` 헤더 제거), 사설·루프백 대상 거부, `maxBytes` / `timeoutMs`는 상한으로 클램프됩니다. 리다이렉트는 **따라가지 않습니다** — 호출자는 자신이 요청한 URL의 실제 상태를 보게 되며, 존재 여부 탐지는 바로 이것에 의존합니다(로그인 페이지로의 302는 "계정 없음"을 뜻합니다). 3xx의 `Location`은 `redirectUrl`로 반환됩니다.

!!! warning "Desktop only"
    `ctx.net.probe`는 Electron 메인 프로세스가 수행합니다 — CORS를 허용하지 않는 호스트로부터 교차 출처 응답을 읽을 수 있는 유일한 지점입니다. web 빌드에서는 이 기능에 뒷받침이 없으므로, 부여되었더라도 `ctx.net.probe`는 **존재하지 않습니다**. 호출 전에 존재 여부를 확인하고 폴백하세요 (WhatsMyName 팩이 정확히 이렇게 합니다).

## services

이 플러그인이 **이름으로** 호출하는 Vineyard 운영 서비스입니다. `ctx.service`를 뒷받침합니다.

```jsonc
"services": ["rdap"]
```

| 이름 | 내용 |
| --- | --- |
| `rdap` | 모든 RIR을 정규화한 캐시형 IP RDAP 조회 |
| `telegram` | Vineyard가 운영하는 계정으로 수행하는 읽기 전용 텔레그램 정찰 |

닫힌 enum이라 오타는 분석가의 첫 실행이 아니라 리뷰에서 걸리고, 설치 화면에 표시되는 스코프는 항상
실제로 동작하는 것입니다.

**왜 URL이 아니라 이름인가.** `network`는 목적지를 플러그인에서 받으므로, 그 경로에 분석가의 자격증명을
붙이면 매니페스트가 선언한 아무 엔드포인트에나 넘어갑니다. `ctx.service`는 서비스 이름과 경로만 받고
기본 URL은 앱의 테이블에 있어서, 플러그인은 목적지를 표현할 방법 자체가 없습니다. 그래서 이 호출에
분석가의 신원을 실어도 안전하고, 같은 이유로 서비스 스코프는 카탈로그 카드의
`scopes_summary.network`에 **포함되지 않습니다**. 별도 `services` 필드로, 이름까지 표시됩니다 —
어느 서비스인지가 중요하기 때문입니다: `rdap`은 공개 등록 정보를 읽고, `telegram`은 계정을 움직입니다.

```js
const res = await ctx.service('rdap', '8.8.8.8');
const who = await ctx.service('telegram', 'resolve', {
    method: 'POST',
    body: JSON.stringify({ target: 'durov' }),
});
```

서비스 호출의 `Authorization`은 병합되지 않고 무시됩니다 — 호스트가 설정하며, 서비스가 누구의
호출로 인식할지를 정하는 유일한 헤더이기 때문입니다. 일부 서비스는 지정된 팩으로 더 제한됩니다.
`telegram`이 그렇고, 그 계정은 실행을 시킨 분석가가 아니라 운영자의 것이기 때문입니다.

## config

각 항목은 `ConfigValue`입니다. `ctx.config`는 분석가가 값을 설정한 선언된 키들(비밀 키 포함)을 선언된 `type`으로 변환해 담은 읽기 전용 맵입니다. 그중 어느 것에도 값이 없는 동안에는 존재하지 않으므로, `ctx.config?.key ?? DEFAULT`로 읽으세요. (출처: `@vineyard/plugin-sdk` 패키지 타입 — `ConfigValue`, `HostContext.config`.)

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
    `secret: true`는 **값을 plugin으로부터 숨기는 것이 아니라 저장과 표시**에 관한 것입니다. 값은 선언한 plugin에게 `ctx.config[key]`로 실제 전달됩니다(SPEC §6.1) — API를 호출하는 주체가 plugin이므로 그래야 하며, `configFor`는 팩 자신의 매니페스트가 선언한 키만 넘겨줍니다. 플래그가 바꾸는 것: 폼 필드가 마스킹됩니다. 비밀 여부와 무관하게 모든 config 값은 데스크톱 키체인(`safeStorage`, 저장 시 암호화, 해당 머신 한정) 또는 브라우저의 해당 탭 `sessionStorage`에 저장되어, 브라우저에서 입력한 키는 세션을 넘기지 못합니다. task 기록이나 AI 대화에는 **절대 기록되지 않으며**, 이는 `ctx.config`에서 값을 빼서가 아니라 자격 증명을 `params`에 두지 않음으로써 보장됩니다. [security](../develop/security.md) 및 SPEC §6을 참조하세요.

## Not scopes

다음은 **항상 사용 가능**하며 데이터나 네트워크에 대한 권한을 부여하지 않습니다. 선언이 필요하지 않습니다. (출처: SPEC §4; `@vineyard/plugin-sdk` 패키지 타입 — `HostContext`.)

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
