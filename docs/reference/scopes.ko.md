# 스코프 레퍼런스

plugin이 `manifest.scopes`에서 선언할 수 있는 모든 scope 문자열, 각각이 부여하는 것, 그리고 잠금 해제하는 `ctx` 멤버에 대한 완전한 카탈로그입니다. `ctx` 멤버는 해당 scope가 부여되지 않으면 존재하지 않습니다. 최소 권한을 선언하세요: plugin이 실제로 필요로 하는 가장 좁은 동사를 선택하세요.

런타임에 권한 부여가 어떻게 시행되는지(Web Worker 샌드박스, 이그레스 허용 목록, 시크릿 처리)는 [샌드박스 및 보안](../develop/security.md)을 참조하세요.

`scopes` 블록은 정확히 6개의 키를 가지며, 모두 선택 사항입니다:

```jsonc
"scopes": {
  "graph":     ["node:read", "edge:create"],               // 세분화된 그래프 동사
  "network":   [ { "endpoint": "https://...", "methods": ["POST"] } ],
  "network_configurable": [ { "config_key": "misp_url", "methods": ["POST"] } ],  // 분석가가 정하는 주소
  "web_probe": { "purpose": "check whether a profile page exists" },  // 데스크톱 전용
  "services":  ["rdap"],                                   // 이름으로 호출하는 Vineyard 운영 서비스
  "config":    [ { "key": "max_concurrency", "type": "number" } ]
}
```

## graph

노드와 엣지에 대한 세분화된 동사 (`node:*` / `edge:*` × read/create/update/delete). 삭제하는 plugin은 `node:delete` / `edge:delete`를 명시적으로 선언해야 합니다. `ctx.graph`는 **하나 이상의** graph 동사가 부여된 경우에만 존재합니다. 아래 각 메서드는 해당 특정 동사가 부여된 경우에만 존재합니다. (출처: SDK의 `sdk.ts` 타입 — `GraphScope`, `HostContext.graph`.)

| 스코프 문자열 | 부여하는 것 | `ctx` 멤버 |
| --- | --- | --- |
| `node:read` | 개별 노드 읽기, 노드 나열 (선택적으로 유형별) | `ctx.graph.get`, `ctx.graph.list` |
| `node:create` | `EntityDraft`에서 노드 생성 | `ctx.graph.createNode` |
| `node:update` | 노드의 `data` 패치 | `ctx.graph.updateNode` |
| `node:delete` | 단일 바운드 작업으로 하나 또는 여러 노드 삭제 | `ctx.graph.deleteNode`, `ctx.graph.deleteNodes` |
| `edge:read` | 모든 엣지 읽기; 노드의 1-홉 이웃 | `ctx.graph.edges`, `ctx.graph.neighbors` |
| `edge:create` | 엣지 생성; 기존 엣지를 id로 수정 (label/data) | `ctx.graph.createEdge`, `ctx.graph.updateEdge` |
| `edge:update` | 스키마가 허용함 | *(뒷받침하는 메서드 없음 — `updateEdge`는 `edge:create`로 부여됨)* |
| `edge:delete` | 단일 바운드 작업으로 하나 또는 여러 엣지 삭제 | `ctx.graph.deleteEdge`, `ctx.graph.deleteEdges` |

!!! note "쓰기 동사가 곧 쓰기는 아닙니다"
    `node:create`(또는 create/update/delete 동사 전부)를 부여한다고 해서 plugin이 프로젝트를 변경할 수 있게 되는 것은 아닙니다. 쓰기는 해당 실행의 변경 세트로 캡처되며, 분석가가 그 변경 세트를 검토하고 자신의 계정으로 적용할 때에만 그래프에 반영됩니다.

!!! note "벌크 작업은 하나의 작업입니다"
    `deleteNodes(ids[])`와 `deleteEdges(ids[])`는 N개의 개별 쓰기가 아니라 **단일** 바운드 호출입니다: 정당한 대량 삭제(Russian Roulette, Thanos Snap)는 한 번만 발행되고, 각 id가 실행의 변경 세트에 검토 항목으로 하나씩 스테이징됩니다. 알 수 없는 id가 하나라도 있으면 호출 전체가 실패합니다.

## network

각 항목은 `NetworkScope` 객체이며, **단순 문자열이 아닙니다**. `ctx.net.fetch`는 하나 이상의 network scope가 선언된 경우에만 존재합니다. (출처: SDK의 `sdk.ts` 타입 — `NetworkScope`, `HostContext.net`.)

```jsonc
"network": [
  { "endpoint": "https://api.example.com/v1/lookup",
    "methods": ["POST"],
    "purpose": "shown at install" }
]
```

| 필드 | 타입 | 의미 |
| --- | --- | --- |
| `endpoint` | `string` | plugin이 접근할 수 있는 정확한 origin/path 접두사 |
| `methods` | `HttpMethod[]` | 허용된 동사: `GET` `POST` `PUT` `PATCH` `DELETE`. 빈 목록은 모든 동사를 허용 |
| `purpose` | `string` (선택 사항) | 사람이 읽을 수 있는 이유, 설치 시 표시됨 |

`ctx.net.fetch`는 이 엔드포인트와, 분석가가 [`network_configurable`](#network_configurable)에 정한 주소로 제한됩니다. URL은 문자열 접두사가 아니라 **파싱된 origin**(프로토콜, 호스트, 포트)과 경로 세그먼트 경계로 매칭되고 — `https://h/v1`은 `/v1/search`를 포함하지만 `/v1beta`는 포함하지 않습니다 — 선언된 `methods`로도 매칭됩니다. 요청마다 응답 본문까지 포함하는 기한도 따로 있습니다: 요청의 `init.timeoutMs`로 바꾸지 않으면 60초이며, 1초–10분 범위로 제한됩니다. 기한을 넘기면 이름이 `TimeoutError`인 `Error`로 거부됩니다. SDK의 [`net`](../develop/sdk.md#net-network)을 참조하세요.

!!! warning "호스트 브리지가 유일한 출구입니다"
    plugin 코드에는 자체 네트워크가 없습니다: plugin이 직접 여는 `fetch`, XHR, WebSocket, 중첩 worker는 web과 데스크톱 앱 모두에서 거부됩니다. `ctx.net.fetch`(이 엔드포인트들로 검사됨), [`ctx.net.probe`](#web_probe), [`ctx.service`](#services)를 사용하세요. 개발 서버는 이를 강제하지 않으므로, `fetch`를 직접 호출하는 팩은 개발 중에는 동작하고 프로덕션에서는 실패합니다. sandbox-js plugin은 여러 엔드포인트를 선언할 수 있습니다. 쿠키는 전송되지 않으며, 요청 헤더는 `Authorization`을 포함해 작성한 그대로 전달됩니다([자격증명 보내기](plugin-schema.md#sending-a-credential) 참조). 데스크톱에서는 CORS 헤더가 없는 선언된 엔드포인트에도 접근할 수 있습니다. 단, `localhost`나 루프백·사설 네트워크 IP 주소에 있는 엔드포인트와 그런 주소로 풀리는 이름은 여전히 CORS 헤더가 필요합니다. 앱이 연결된 Vineyard 백엔드 오리진의 URL은 매니페스트에 무엇을 선언하든 거부됩니다([샌드박스 및 보안](../develop/security.md) 참조).

## network_configurable

주소를 분석가만 아는 서버를 위한 scope입니다. 자체 호스팅 MISP나 OpenCTI, 기관 내부 위협 인텔리전스 플랫폼이 그렇습니다. 각 항목은 엔드포인트 대신 [`config`](#config) 키를 가리키고, 분석가가 그 키에 입력한 주소가 `ctx.net.fetch`의 엔드포인트가 됩니다. (출처: SDK의 `sdk.ts` 타입 — `ConfigurableNetworkScope`.)

```jsonc
"network_configurable": [
  { "config_key": "misp_url",
    "methods": ["POST"],
    "purpose": "search events on your MISP" }
],
"config": [
  { "key": "misp_url", "label": "MISP URL", "type": "url" },
  { "key": "misp_key", "label": "MISP API key", "type": "string", "secret": true }
]
```

| 필드 | 타입 | 의미 |
| --- | --- | --- |
| `config_key` | `string` | **같은** plugin의 `scopes.config`에 `type: "url"`로 선언된 키. 그 값이 엔드포인트가 됨 |
| `methods` | `HttpMethod[]` | `network`와 같이 허용된 동사. 빈 목록은 모든 동사를 허용 |
| `purpose` | `string` (선택 사항) | 사람이 읽을 수 있는 이유, 설치 시 표시됨 |
| `schemes` | `("https" | "http")[]` (선택 사항) | 주소에 쓸 수 있는 스킴. 생략하면 `["https"]` |

주소는 항목이 허용하는 스킴, 호스트, 선택적인 경로로 이루어져야 합니다. `https://misp.example.org`나 `https://tip.example.org/opencti` 같은 형태입니다. 사용자 이름이나 비밀번호, `?` 쿼리, `#` 프래그먼트가 들어간 주소는 쓰이지 않습니다. 주소가 정해지면 `network` 엔드포인트와 똑같이 매칭됩니다: 파싱된 origin, 경로 세그먼트 경계, `methods`로 판정하고, Vineyard 백엔드 오리진은 거부합니다. 주소가 정해지기 전이나 쓸 수 없는 주소인 동안에는 항목이 아무것도 허용하지 않고, `ctx.net.fetch`는 해당 설정의 이름을 담은 오류로 거부됩니다. plugin은 주소를 정하거나 바꿀 수 없습니다. 분석가만 plugin 설정에서 정할 수 있습니다. Vineyard 백엔드 자신의 주소는 어떤 경우에도 쓰이지 않으며, 설정 칸에 그렇게 표시됩니다.

`http` 주소는 데스크톱 앱에서 쓰입니다. 웹 앱은 https로 제공되고, 브라우저는 그 페이지에서 http 주소로 가는 요청을 혼합 콘텐츠로 막습니다. 그래서 웹 앱에서는 이 컴퓨터의 주소(`localhost`, `127.0.0.1`, `[::1]`)가 아니면 `http` 주소가 쓰이지 않으며, 설정 칸에 그렇게 표시됩니다.

`config_key`가 같은 plugin의 `url` 설정이 아닌 항목은 아무것도 허용하지 않으며, 레지스트리 CI가 거부합니다. CI는 대문자 동사 다섯 개 외의 `methods`와, 위 네 필드 외의 필드도 거부합니다. 앱은 메서드를 정확히 비교하므로 `"post"`로 적으면 모든 요청이 거부되기 때문입니다.

설치 화면에는 **Network requests to the address you enter in "MISP URL" (https only)**가 표시되고, 그 아래에 목적이, 이 기기에서 이 팩에 이미 주소가 정해져 있으면 그 호스트가 함께 표시됩니다. 설정 칸에는 요청이 갈 호스트나, 주소가 쓰이지 않는 이유가 표시됩니다. 카탈로그 카드에서는 이 scope가 네트워크로 집계됩니다.

!!! warning "분석가 자신의 네트워크"
    데스크톱 앱에서 분석가가 정한 주소는 선언된 엔드포인트와 같은 CORS 면제를 받고, 같은 한계도 따릅니다: 면제는 분석가 자신의 네트워크에서 멈춥니다. 이 컴퓨터나 기관 네트워크에 있는 서버(예: `10.0.0.0/8`의 MISP)라면, 설정 칸의 **Trust … on this computer…**를 누르세요. 확인 대화상자를 거쳐 Desktop Settings의 **Additional trusted origins**에 그 오리진이 추가됩니다. 이 목록은 그곳에서 오리진을 지울 때까지 모든 프로젝트에 적용됩니다. 브라우저에서는 서버가 앱의 오리진에 대해 직접 CORS로 응답해야 합니다.

`network`와 마찬가지로 이 scope도 Vineyard 자격 증명을 붙이지 않습니다. 서버의 API 키는 [자격증명 보내기](plugin-schema.md#sending-a-credential)처럼 `secret` 설정에서 읽어 직접 보내세요.

## web_probe

배열이 **아닌** 단일 객체입니다. `ctx.net.probe`를 부여합니다 — *임의의* 공개 호스트에 대한 한 번의 익명 요청으로, 계정 탐지처럼 엔드포인트를 미리 나열할 수 없는 plugin을 위한 것입니다. (출처: SDK의 `sdk.ts` 타입 — `WebProbeScope`, `HostContext.net.probe`.)

```jsonc
"web_probe": { "purpose": "check whether a username has a profile page" }
```

| 필드 | 타입 | 의미 |
| --- | --- | --- |
| `purpose` | `string` (선택 사항) | 사람이 읽을 수 있는 이유 |

조건을 정하는 쪽은 plugin이 아니라 호스트입니다: 쿠키 없음, 자격 증명 없음(`Cookie` / `Authorization` / `Host` 헤더 제거), 사설·루프백 대상 거부, `maxBytes` / `timeoutMs`는 상한으로 클램프됩니다. 리다이렉트는 **따라가지 않습니다** — 호출자는 자신이 요청한 URL의 실제 상태를 보게 되며, 존재 여부 탐지는 바로 이것에 의존합니다(로그인 페이지로의 302는 "계정 없음"을 뜻합니다). 3xx의 `Location`은 `redirectUrl`로 반환됩니다.

!!! warning "데스크톱 전용"
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

서비스 호출의 `Authorization`은 무시됩니다 — 호스트가 설정합니다. `init.timeoutMs`와 요청 기한은
`ctx.net.fetch`와 같이 동작합니다. 일부 서비스는 지정된 팩으로 제한되며, `telegram`이 그렇습니다.

서비스 호출에는 Vineyard 계정이 필요합니다. 로컬 모드에서는 Marketplace가 `services`를 선언한 팩을
설치하지 않으며(**Install** 버튼이 비활성화되고 툴팁에 "Needs a Vineyard account — sign in to use this pack"이 표시됨),
그 전에 설치된 팩에서는 `ctx.service`가 `service '<name>' needs a Vineyard account` 예외를 던집니다.

## config

각 항목은 `ConfigValue`입니다. `ctx.config`는 분석가가 값을 설정한 선언된 키들(비밀 키 포함)을 선언된 `type`으로 변환해 담은 읽기 전용 맵입니다. 그중 어느 것에도 값이 없는 동안에는 존재하지 않으므로, `ctx.config?.key ?? DEFAULT`로 읽으세요. 값은 로그인한 계정별로 보관됩니다 — 데스크톱에서는 OS 키체인에(컴퓨터가 값을 암호화할 수 없으면 앱을 종료할 때까지만), 브라우저에서는 해당 탭 세션 동안. (출처: SDK의 `sdk.ts` 타입 — `ConfigValue`, `HostContext.config`.)

같은 Plugin Pack의 멤버 가운데 같은 키를 선언하고 같은 네트워크 오리진 집합을 호출하는 멤버들은 그 키의 값 하나를 공유하므로, 분석가는 한 번만 입력합니다. 오리진은 멤버의 `scopes.network` 엔드포인트의 스킴·호스트·포트이며 경로는 상관없으므로, 한 API 호스트의 서로 다른 경로를 호출하는 멤버들도 값을 공유합니다. `network_configurable` 항목은 `config_key`로 이름 붙은 목적지 하나로 집계되므로, 같은 주소 설정을 읽고 같은 고정 호스트를 호출하는 멤버들은 주소와 그 주소로 가는 키를 함께 공유합니다. 단독으로 게시된 plugin이나 `scopes.network` 항목도 `network_configurable` 항목도 없는 plugin은 자기 값을 따로 가지며, 서로 다른 두 팩은 같은 호스트를 호출하더라도 값을 공유하지 않습니다. 다른 멤버보다 오리진을 하나 더 호출하는 멤버는 자기 값을 따로 가지므로, 키를 함께 써야 하는 멤버들에는 같은 오리진을 주세요. 공유한다고 plugin이 받는 범위가 넓어지지는 않습니다: 각 plugin은 여전히 자신의 매니페스트가 선언한 키만 받습니다.

| 필드 | 타입 | 의미 |
| --- | --- | --- |
| `key` | `string` | 식별자, 패턴 `^[a-z0-9_]+$` |
| `label` | `string` (선택 사항) | Run plugins 대화상자의 해당 plugin Settings 섹션과 **Settings → Keys & Secrets**에 표시되는 필드 라벨 |
| `type` | `"string" | "number" | "boolean" | "url" | "enum"` | 값 유형 |
| `enum` | `string[]` (선택 사항) | `type`이 `enum`일 때 허용된 값 |
| `secret` | `boolean` (선택 사항) | BYOK 방식 자격 증명; 아래 참조 |
| `scope` | `"plugin" | "project" | "user"` (선택 사항) | 값이 저장되는 위치. 허용되지만 읽히지 않으며, 값은 위에 설명한 대로 저장·공유됨 |
| `optional` | `boolean` (선택 사항) | false/없으면 필드에 "required by this plugin"이 표시됨 (강제되지 않음; plugin이 값이 없는 경우를 처리해야 함) |

!!! danger "secret의 의미"
    `secret: true`는 **값을 plugin으로부터 숨기지 않습니다**. 값은 선언한 plugin에게 `ctx.config[key]`로 실제 전달됩니다 — API를 호출하는 주체가 plugin이기 때문입니다. 플래그는 폼 필드를 마스킹합니다. 값은 task 기록이나 AI 대화에 **절대 기록되지 않으며**, 이는 자격 증명을 `params`에 두지 않기 때문입니다. [샌드박스 및 보안](../develop/security.md)을 참조하세요.

## 스코프가 아닌 것 {#not-scopes}

다음은 **항상 사용 가능**하며 데이터나 네트워크에 대한 권한을 부여하지 않습니다. 선언이 필요하지 않습니다. (출처: SDK의 `sdk.ts` 타입 — `HostContext`.)

| 기능 | `ctx` 멤버 | 참고 |
| --- | --- | --- |
| `params` | `ctx.params` | 이 실행의 사용자 입력 (읽기 전용). `params` JSON Schema에 대해 검증되지 않음: Run 대화상자는 `required` 필드가 채워졌는지만 확인하므로 유형은 직접 검증하세요 |
| `progress` | `ctx.progress.set` | 작업 행을 구동: `percent`는 진행률을 정하고, `message`는 플러그인 이름 뒤에 표시됨. `phase`는 허용되지만 표시되지 않음 |
| `log` | `ctx.progress.log` | 허용되지만 현재 no-op; 아무것도 기록되지 않음 |
| `status` | `ctx.progress.status` | 허용되지만 현재 no-op; task 상태는 runner가 설정함 |
| `signal` | `ctx.signal`, `ctx.onCancel` | 협력적 취소 — plugin이 반드시 관찰해야 함 |

두 멤버도 항상 존재하며 게이트되지 않습니다: `ctx.run` (이 실행의 식별 — `runId`, `projectId`, `pluginId`, `grantedScopes`, `platform`) 및 `ctx.input` (`selection`을 포함한 트리거 컨텍스트).

!!! example "스코프가 하나도 없는 plugin"
    Chaos 팩의 **Dumb AI Optimizer**는 scope를 전혀 선언하지 않습니다. 여전히 `ctx.params`, `ctx.progress`, `ctx.signal`을 받지만 — `ctx.graph`, `ctx.net`, `ctx.config`는 모두 `undefined`입니다.

## 다음 / 참고

- [샌드박스 및 보안](../develop/security.md) — worker 샌드박스, 이그레스 허용 목록, 시크릿 처리
- [플러그인 매니페스트 스키마](plugin-schema.md) — 전체 manifest 참조
- [SDK 및 호스트 컨텍스트](../develop/sdk.md) — `ctx` 인터페이스 및 `definePlugin`
