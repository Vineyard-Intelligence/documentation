# Plugin manifest schema

`plugin.schema.json`에 대한 권위 있는 필드별 참조 — 모든 `vineyard:plugin` manifest가 검증되는 JSON Schema (draft 2020-12)입니다. 산문 설명 및 작성 안내는 [manifest guide](../develop/plugin-manifest.md)를 참조하세요.

!!! info "Schema identity"
    - `$schema`: `https://json-schema.org/draft/2020-12/schema`
    - `$id`: `https://vineyard.run/schemas/plugin.json`
    - `title`: *VINEYARD Plugin Manifest*
    - Root: `type: object`, `additionalProperties: false` — 알 수 없는 최상위 키는 거부됩니다.

manifest는 plugin에 대한 단일 진실 공급원입니다. 별도의 서버 측 plugin 레코드는 없습니다. [Type Pack manifest](typepack-schema.md)와 동일한 네이밍 체계를 사용합니다.

## Top-level properties

`additionalProperties: false`. **필수:** `identifier`, `content_type`, `name`, `version`, `description`, `platforms`, `io`, `scopes`, `lifecycle`, `distribution`.

| Property | Type | Req. | Allowed / constraints | Default | Meaning |
|---|---|---|---|---|---|
| `identifier` | string | yes | pattern `^run\.vineyard\.plugins\.[a-z0-9_]+$` | — | Reverse-DNS 고유 ID, 예: `run.vineyard.plugins.cidr_expand`. |
| `content_type` | string | yes | `const`: `vineyard:plugin` | — | 문서 판별자. 정확히 이 값이어야 합니다. |
| `name` | string | yes | minLength 1, maxLength 128 | — | 사람이 읽을 수 있는 표시 이름. |
| `version` | string | yes | pattern `^\d+\.\d+\.\d+(?:[-+].+)?$` | — | SemVer 문자열 (레거시 float 아님), 예: `1.0.0`, `2.1.0-beta.1`. |
| `description` | string | yes | minLength 1, maxLength 1024 | — | 한 문단 요약. |
| `author` | object | no | [author](#author) 참조 | — | 저작자 메타데이터. |
| `license` | string | no | — | — | SPDX 라이선스 ID, 예: `MIT`. |
| `icon` | string | no | — | — | 노드 우클릭 메뉴에 표시되는 아이콘. |
| `thumbnail_url` | string | no | `format: uri` | — | Marketplace 썸네일 이미지 URL. |
| `marketing_url` | string | no | `format: uri` | — | 랜딩 / 마케팅 페이지 URL. |
| `latest_url` | string | no | `format: uri` | — | 항상 최신 manifest를 가리키는 저자별 폴백 포인터 (업데이트 확인용). registry 항목이 기본 최신 포인터이며, 이것은 폴백입니다. |
| `platforms` | object | yes | [platforms](#platforms) 참조 | — | 플랫폼별 실행 플래그. |
| `io` | object | yes | [io](#io) 참조 | — | 소비/생산되는 Type Pack 엔티티 유형. |
| `params` | object | no | [params](#params) 참조 | — | 실행 전 폼을 위한 JSON-Schema. |
| `scopes` | object | yes | [scopes](#scopes) 참조 | — | plugin의 권한 범위. |
| `lifecycle` | object | yes | [lifecycle](#lifecycle) 참조 | — | Task 실행 모델. |
| `distribution` | object | yes | [distribution](#distribution) 참조 | — | 번들을 가져오는 방법. |

### author

`type: object`, `additionalProperties: false`. 모든 속성은 선택 사항입니다.

| Property | Type | Req. | Constraints | Meaning |
|---|---|---|---|---|
| `name` | string | no | — | 저자 또는 조직 이름. |
| `url` | string | no | `format: uri` | 저자 홈페이지. |
| `contact` | string | no | — | 연락처 핸들, 이메일 또는 URL. |

## platforms

플랫폼별 실행 플래그. `type: object`, `additionalProperties: false`, `minProperties: 1` — `web` / `desktop` 중 최소 하나가 존재해야 합니다. `primary`가 선호됩니다.

| Property | Type | Req. | Allowed values | Default | Meaning |
|---|---|---|---|---|---|
| `primary` | string | no | `web`, `desktop` | — | 둘 다 선언된 경우 선호되는 플랫폼. |
| `web` | object | no | [platforms.web](#platformsweb) 참조 | — | Web 실행 블록. |
| `desktop` | object | no | [platforms.desktop](#platformsdesktop) 참조 | — | Desktop 실행 블록. |

!!! warning "What actually ships today"
    브라우저 런타임(`platforms.web.runtime: "sandbox-js"`)과 데스크톱 Electron 셸(`platforms.desktop.runtime: "sandbox-js"`)이 모두 현재 제공됩니다. `web-proxy` 런타임과 `native`/`subprocess` 데스크톱 런타임은 스키마에서 미래 지향적 설계로 유효하지만 **연기되었습니다** — 아직 빌드되지 않았습니다. 제공되는 동작이 아닌 예약된 것으로 취급하세요.

### platforms.web

`type: object`, `additionalProperties: false`. **필수:** `runtime`, `entry`.

| Property | Type | Req. | Allowed values | Default | Meaning |
|---|---|---|---|---|---|
| `runtime` | string | yes | `sandbox-js`, `web-proxy` | — | `sandbox-js` = 브라우저 worker에서 저자 JS 실행; `web-proxy` = 하나의 저자 엔드포인트를 호출하는 씬 클라이언트 (연기됨). |
| `entry` | string | yes | — | — | 번들 내 진입 경로, 예: `dist/cidr.js`. |
| `proxy_endpoint` | string | conditional | `format: uri` | — | **`runtime: web-proxy`일 때 필수.** 단일 엔드포인트. 반드시 하나의 `scopes.network` 항목과 동일해야 합니다. |
| `fallback` | string | no | `desktop`, `none` | `none` | web이 plugin을 실행할 수 없을 때 폴백할 곳. |

### platforms.desktop

`type: object`, `additionalProperties: false`. **필수:** `runtime`, `entry`. *(연기됨 — 위의 경고 참조.)*

| Property | Type | Req. | Allowed values | Default | Meaning |
|---|---|---|---|---|---|
| `runtime` | string | yes | `sandbox-js`, `native`, `subprocess` | — | 데스크톱 실행 모드. `native`/`subprocess`는 JS 샌드박스가 포함할 수 없는 코드를 실행합니다 (진행 중인 이슈). |
| `entry` | string | yes | — | — | 번들 내 진입 경로. |
| `min_app_version` | string | no | pattern `^\d+\.\d+\.\d+$` | — | 필요한 최소 데스크톱 앱 버전. |
| `fallback` | string | no | `web`, `none` | `none` | 데스크톱이 plugin을 실행할 수 없을 때 폴백할 곳. |

## io

plugin이 Type Pack에서 참조하는 엔티티 유형. `type: object`, `additionalProperties: false`. **필수:** `consumes`, `produces`. 빈 `consumes` 배열은 전체 그래프 plugin(노드별 우클릭 액션이 아닌 전역 실행)을 의미합니다.

| Property | Type | Req. | Items | Meaning |
|---|---|---|---|---|
| `consumes` | array | yes | [`typeRef`](#typeref) | plugin이 입력으로 읽는 노드 유형. |
| `produces` | array | yes | [`typeRef`](#typeref) | plugin이 출력하는 노드 유형. |

### typeRef (io.consumes / io.produces items) { #typeref }

`$defs.typeRef`. `type: object`, `additionalProperties: false`. **필수:** `typepack`, `category`, `name`. 런타임에서 `Node.type = "<category>.<name>"`입니다 (예: `infrastructure.ip_address`).

| Property | Type | Req. | Constraints | Meaning |
|---|---|---|---|---|
| `typepack` | string | yes | pattern `^run\.vineyard\.typepacks\.[a-z0-9]+(?:[._-][a-z0-9]+)*$` | 소유 Type Pack 식별자. |
| `category` | string | yes | — | Type 카테고리, 예: `infrastructure`. |
| `name` | string | yes | — | 카테고리 내 Type 이름, 예: `ip_address`. |
| `as` | string | no | — | 선택적 바인딩 별칭. 소비된 노드의 값이 이 키 아래 `params`에 미리 바인딩됩니다. |

!!! note "Open issue"
    `typeRef`는 아직 Type Pack 버전을 포함하지 **않습니다** — type 호환성은 식별자 + 정규화된 이름만으로 해결됩니다. 버전이 지정된 type 참조는 진행 중인 이슈입니다.

## params

실행 전 폼을 설명하는 JSON-Schema (draft 2020-12). 사용자가 입력한 내용은 `Task.input`이 됩니다. `type: object`. 이 객체는 `additionalProperties: false`가 **아니며**, 그 자체로 JSON Schema이며 표준 스키마 키워드를 포함할 수 있습니다. 아래 세 키만 명시적으로 모델링됩니다.

| Property | Type | Req. | Constraints | Meaning |
|---|---|---|---|---|
| `type` | string | no | `const`: `object` | params 폼은 항상 객체 스키마입니다. |
| `properties` | object | no | — | 필드별 JSON Schema 정의. |
| `required` | array | no | items: string | 필수 필드 이름. |

!!! warning "No secrets in params"
    `params`는 비밀을 포함해서는 **안 됩니다**. API 키 및 자격 증명에는 `secret: true`가 있는 [`scopes.config`](#configvalue-scopesconfig-items) 항목을 사용하세요. 현재 비밀로 보이는 param 키를 거부하는 검사는 없습니다 — 강제되는 검사가 아니라 규칙입니다.

### 파일 필드

`"format": "file"`로 선언된 필드는 드롭존으로 렌더링됩니다 — 파일을 끌어놓거나 클릭해서 고릅니다. 여기에 `"type": "array"`를 더하면 **다중 선택**이 되고, 그 외에는 파일 하나만 받습니다(두 개를 떨어뜨리면 조용히 잘라내지 않고 거부합니다). 폴더를 떨어뜨리면 재귀적으로 펼쳐집니다.

| Property | Type | Req. | Meaning |
|---|---|---|---|
| `format` | string | yes | `file`. 없으면 일반 입력 필드입니다. |
| `type` | string | no | 여러 파일이면 `array`. 생략하면(또는 다른 타입이면) 한 개. |
| `accept` | string | no | MIME 필터(예: `image/*`). 맨 파일 인풋의 `accept`와 달리 **드래그 중에도** 비매칭 파일을 거부합니다. 생략하면 필터 없음. |

`run(ctx)`가 받는 값은 **`File` 객체 그 자체**(또는 그 배열)입니다 — data: URL도, 경로도 아닙니다. `await file.arrayBuffer()`로 바이트를 읽고 파일명은 `file.name`에서 가져오세요. 별도의 "파일 이름" 동반 필드는 없습니다.

```json
"params": {
  "type": "object",
  "properties": {
    "images": { "type": "array", "format": "file", "accept": "image/*",
                "title": "Image files",
                "description": "One or more JPEG photos, read locally (never uploaded)." }
  },
  "required": ["images"]
}
```

!!! note "한 번의 run, 한 번의 배치"
    다중 파일 필드는 선택된 전체를 **단일** run에 넘깁니다 — 호스트가 파일당 run 하나로 팬아웃하지 않습니다. 직접 순회하면서 `ctx.progress.set({ percent })`로 진행률을 보고하고, 매 반복마다 `ctx.signal.aborted`를 확인해 Stop이 동작하게 하세요. 의도된 설계입니다: run이 N개면 분석가가 한 번의 작업으로 여기는 일에 대해 task 행이 N개, 별개의 리뷰 다이얼로그가 N개 생깁니다.

    호스트는 파일당 25 MB, run당 250 MB, 최대 50개로 선택을 제한합니다. 파일은 blob 핸들로 샌드박스에 전달되므로 실제 메모리 비용은 플러그인이 실체화하는 만큼입니다 — 배치를 `Promise.all`로 묶지 말고 한 번에 하나씩 읽으세요.

## scopes

plugin의 권한 범위. `type: object`, `additionalProperties: false`. `ctx` 멤버는 부여되지 않으면 존재하지 않습니다. 샌드박스에 의해 시행되며, 그래프 쓰기는 추가로 분석가의 검토를 거친 뒤에야 적용됩니다. 동사 의미는 [scopes reference](scopes.md)를 참조하세요.

| Property | Type | Req. | Items / constraints | Meaning |
|---|---|---|---|---|
| `graph` | array | no | `uniqueItems`; enum 항목 (아래) | 세분화된 노드/엣지 동사. 프로젝트 `graph_edit` 티어에 의해 지원됩니다. |
| `web_probe` | object | no | `{ purpose?: string }` — 배열이 아니라 객체 | **데스크탑 전용.** 셸의 메인 프로세스가 수행하는, *임의의* 공개 호스트에 대한 익명 요청 1회. `ctx.net.probe`를 지원하며, 웹 빌드에서는 뒷받침이 없어 `ctx.net.probe`가 존재하지 않습니다. |
| `network` | array | no | 항목: [`networkScope`](#networkscope-scopesnetwork-items) | 외부 XHR 대상. |
| `config` | array | no | 항목: [`configValue`](#configvalue-scopesconfig-items) | 런타임에만 주입되는 설치 시 값. |

!!! warning "There is no `publish` scope"
    스키마가 모델링하는 키는 위의 것들뿐입니다. 작성 중인 manifest에 `"publish": ["message:post"]`가 남아 있다면 해당 키를 삭제하세요 — `scopes`는 `additionalProperties: false`이므로 manifest가 검증에 실패합니다.

`scopes.graph` enum 값 (각각 최대 한 번만 나타날 수 있음):

| Value | Meaning |
|---|---|
| `node:read` | 노드 읽기. |
| `node:create` | 노드 생성. |
| `node:update` | 노드 필드 업데이트. |
| `node:delete` | 노드 삭제. |
| `edge:read` | 엣지 읽기. |
| `edge:create` | 엣지 생성. |
| `edge:update` | 엣지 필드 업데이트. |
| `edge:delete` | 엣지 삭제. |

!!! warning "Network fan-out rule"
    **web**에서 `scopes.network`는 정확히 **하나**의 항목을 포함해야 하며, `platforms.web.proxy_endpoint`와 동일해야 합니다 (팬아웃 없음). **데스크톱**에서는 더 많은 항목이 허용됩니다 — 사용자의 책임하에.

### networkScope (scopes.network items)

`$defs.networkScope`. `type: object`, `additionalProperties: false`. **필수:** `endpoint`, `methods`.

| Property | Type | Req. | Constraints | Meaning |
|---|---|---|---|---|
| `endpoint` | string | yes | `format: uri` | 정확한 origin/path 접두사. 교차 호스트 와일드카드 없음. |
| `methods` | array | yes | `uniqueItems`; 항목 enum: `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | 허용된 HTTP 메서드. |
| `purpose` | string | no | — | 사람이 읽을 수 있는 이유, 설치 시 표시됨. |

#### 자격증명 보내기

`ctx.net.fetch`는 요청 헤더를 **`Authorization`을 포함해** 그대로 통과시킵니다. 엔드포인트에 키가
필요하면 거기에 넣으십시오:

```js
await ctx.net.fetch(url, { headers: { Authorization: `Bearer ${ctx.config.api_key}` } });
```

서비스가 둘 다 받는다면 커스텀 헤더(`X-Api-Key`, `api-key` 등)보다 **`Authorization`을 쓰십시오.**
취향 문제가 아닙니다 — 브라우저는 응답이 다른 오리진으로 리다이렉트될 때 `Authorization`을
제거하지만 커스텀 헤더는 제거하지 않습니다. 선언한 엔드포인트가 어딘가로 302를 보내면
`Authorization`은 경계에서 멈추고 `X-Api-Key`는 따라갑니다. 쿼리스트링에 키를 넣는 건 더 나쁩니다
— 접근 로그와 `Referer`에 남습니다.

`Cookie`는 아예 설정할 수 없습니다(forbidden header name). 호스트도 모든 플러그인 요청을
`credentials: 'omit'`으로 보내므로 분석가 본인의 세션이 함께 나가는 일은 없습니다.

재측정은 `frontend/scripts/measure-net-headers.mjs`로 합니다.

### configValue (scopes.config items)

`$defs.configValue`. `type: object`, `additionalProperties: false`. **필수:** `key`, `type`. config 값은 런타임에만 주입됩니다. `secret: true` 값은 키체인(데스크톱)에 저장되며, 브라우저에 반환되지 않고 기록되지도 않습니다.

| Property | Type | Req. | Allowed values | Default | Meaning |
|---|---|---|---|---|---|
| `key` | string | yes | pattern `^[a-z0-9_]+$` | — | 안정적인 config 키. |
| `label` | string | no | — | — | 설치 폼의 표시 라벨. |
| `type` | string | yes | `string`, `number`, `boolean`, `url`, `enum` | — | 값 유형. |
| `enum` | array | no | items: string | — | `type: enum`일 때 허용된 선택지. |
| `secret` | boolean | no | — | `false` | BYOK 방식 비밀. web에서는 권장되지 않음 → 데스크톱으로 안내. 어떤 레코드에도 기록되지 않음. |
| `scope` | string | no | `plugin`, `project`, `user` | `user` | 값이 저장/공유되는 위치. |
| `optional` | boolean | no | — | `false` | 사용자가 비워둘 수 있는지 여부. |

## lifecycle

Task 실행 모델. `type: object`, `additionalProperties: false`. 모든 속성은 선택 사항이며 기본값이 있습니다.

| Property | Type | Req. | Allowed values | Default | Meaning |
|---|---|---|---|---|---|
| `long_running` | boolean | no | — | `false` | true이면 런타임이 task를 지속적으로 관리합니다 (status/pause/resume/cancel/retry/progress). |
| `controls` | array | no | `uniqueItems`; enum: `pause`, `resume`, `cancel`, `retry`, `progress` | — | 사용자에게 노출되는 컨트롤. |
| `progress` | string | no | `none`, `determinate`, `indeterminate` | `none` | 진행률 보고 스타일. |
| `persistence` | string | no | `ephemeral`, `opt-in`, `always` | `ephemeral` | `ephemeral` = Task DB 행 없음, 인메모리 전용. |
| `states` | array | no | enum: `queued`, `running`, `waiting`, `paused`, `cancelled`, `succeeded`, `failed` | 모든 7개 상태 | 표준 7-상태 머신. |

!!! note "Retry mints a new task"
    `retry`는 상태가 아니라 컨트롤입니다. 재시도는 기존 task를 전환하는 대신 **새로운** task를 생성합니다. 기본 `states` 배열은 전체 표준 세트입니다: `queued`, `running`, `waiting`, `paused`, `cancelled`, `succeeded`, `failed`.

## distribution

`$defs.distribution` — plugin과 Type Pack 양쪽에서 사용되는 공유 distribution 블록. `type: object`, `additionalProperties: false`. **필수:** `kind`. 번들의 서버 측 복사본은 없습니다. 클라이언트가 가져온 번들을 로컬에 캐시합니다.

| Property | Type | Req. | Allowed values / constraints | Meaning |
|---|---|---|---|---|
| `kind` | string | yes | `git`, `zip`, `inline` | 번들 제공 방식. |
| `repository` | string | no | `format: uri`, pattern `^https://github\.com/[^/]+/[^/]+$` | GitHub 저장소 (git 방식). |
| `ref` | string | no | — | 불변: 40자 커밋 SHA 또는 주석 태그. 브랜치는 registry CI에서 거부됩니다. |
| `path` | string | no | — | `repo@ref` 내 `manifest.json`까지의 경로 (git 방식). |
| `integrity` | object | no | [integrity](#distributionintegrity) 참조 | 선택적 무결성 해시. |
| `archive` | object | no | [archive](#distributionarchive) 참조 | Zip 아카이브 위치 + 체크섬 (zip 방식). |

### distribution.integrity

`type: object`, `additionalProperties: false`. **필수:** `algo`, `hash`. **선택적** 블록 — 설치 시 force-push를 감지합니다.

| Property | Type | Req. | Allowed values / constraints | Meaning |
|---|---|---|---|---|
| `algo` | string | yes | `sha256`, `sha512` | 해시 알고리즘. |
| `hash` | string | yes | pattern `^[a-f0-9]{64,128}$` | 번들의 소문자 16진수 다이제스트. |

### distribution.archive

`type: object`, `additionalProperties: false`. **필수:** `url`, `sha256`.

| Property | Type | Req. | Constraints | Meaning |
|---|---|---|---|---|
| `url` | string | yes | `format: uri`, pattern `^https://.*\.zip$` | `.zip`으로 끝나는 HTTPS URL. |
| `sha256` | string | yes | pattern `^[a-f0-9]{64}$` | 아카이브의 SHA-256. |

## Complete annotated example

완전하고 유효한 manifest — **CIDR Expand** 참조 plugin. `infrastructure.netblock` 노드를 소비하고, `infrastructure.ip_address` 노드를 출력하며, 순수 계산(네트워크 없음)을 수행하고, web과 데스크톱에서 동일하게 실행됩니다.

```json title="cidr_expand.manifest.json"
{
  "identifier": "run.vineyard.plugins.cidr_expand", // (1)!
  "content_type": "vineyard:plugin",                // (2)!
  "name": "CIDR Expand",
  "version": "1.0.0",                               // (3)!
  "description": "Expand a CIDR block into its constituent IP address nodes. Pure compute, no network, runs identically on web and desktop.",
  "author": { "name": "VINEYARD", "url": "https://vineyard.run" },
  "license": "MIT",
  "icon": "sitemap",                                // (4)!
  "thumbnail_url": "https://vineyard.run/assets/plugins/cidr-expand.png",

  "platforms": {
    "primary": "web",                               // (5)!
    "web": { "runtime": "sandbox-js", "entry": "dist/cidr.js" },
    "desktop": { "runtime": "sandbox-js", "entry": "dist/cidr.js" }
  },

  "io": {
    "consumes": [
      { "typepack": "run.vineyard.typepacks.infrastructure",
        "category": "infrastructure", "name": "netblock", "as": "cidr" } // (6)!
    ],
    "produces": [
      { "typepack": "run.vineyard.typepacks.infrastructure",
        "category": "infrastructure", "name": "ip_address" }
    ]
  },

  "params": {                                        // (7)!
    "type": "object",
    "required": ["cidr"],
    "properties": {
      "cidr": { "type": "string", "title": "CIDR block",
                "pattern": "^\\d{1,3}(\\.\\d{1,3}){3}/\\d{1,2}$",
                "description": "Pre-filled from the right-clicked netblock node." },
      "max_hosts": { "type": "integer", "title": "Max hosts to emit",
                     "minimum": 1, "maximum": 65536, "default": 1024 }
    }
  },

  "scopes": {                                        // (8)!
    "graph": ["node:read", "node:create", "edge:create"],
    "network": [],
    "config": []
  },

  "lifecycle": {                                     // (9)!
    "long_running": false,
    "controls": ["cancel", "progress"],
    "progress": "determinate",
    "persistence": "ephemeral"
  },

  "distribution": {                                  // (10)!
    "kind": "inline",
    "integrity": { "algo": "sha256",
                   "hash": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad" }
  }
}
```

1.  `^run\.vineyard\.plugins\.[a-z0-9_]+$`에 일치하는 Reverse-DNS 식별자.
2.  `const` 판별자 — 정확히 `vineyard:plugin`이어야 합니다.
3.  레거시 float가 아닌 SemVer.
4.  노드 우클릭 메뉴에 표시되는 아이콘.
5.  `primary: web`이 선호됩니다. `sandbox-js`를 사용하는 `desktop` 블록은 현재 제공됩니다. `native`/`subprocess` 런타임은 연기되었습니다. 여기서는 둘 다 동일한 `sandbox-js` 진입점을 재사용합니다.
6.  `as: "cidr"`은 우클릭된 노드의 값을 `params.cidr`에 미리 바인딩합니다. 이 참조들의 런타임 `Node.type`은 `infrastructure.netblock` / `infrastructure.ip_address`입니다.
7.  실행 전 폼을 위한 JSON-Schema. `Task.input`이 됩니다. 여기에 비밀은 없습니다.
8.  순수 계산: 그래프 동사만, `network`나 `config` 없음.
9.  단기 실행, 취소 가능, 결정적 진행률, 임시 (Task DB 행 없음).
10. 선택적 무결성 해시가 있는 `inline` distribution.

## Next / See also

- [Plugin manifest guide](../develop/plugin-manifest.md) — 이 필드들에 대한 서사적 설명.
- [Scopes reference](scopes.md) — 전체 동사 및 티어 의미.
- [Type Pack manifest schema](typepack-schema.md) — 동반 `vineyard:typepack` 스키마.
- [Registry schema](registry-schema.md) — 게시된 manifest가 인덱싱되는 방식.
