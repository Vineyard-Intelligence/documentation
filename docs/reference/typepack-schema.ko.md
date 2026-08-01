# Type Pack schema

`typepack.schema.json`에 대한 완전한 필드 참조 — 모든 `vineyard:typepack` 문서가 검증되는 메타 스키마입니다. Type Pack은 그래프의 어휘를 확장하는 **노드 엔티티 유형**과 선택적 **엣지 유형**을 선언합니다. 개념적 설명 및 작성 안내는 [Developing Type Packs](../develop/typepacks.md)를 참조하세요.

!!! info "Canonical schema"
    `$id`: `https://vineyard.run/schemas/typepack.json` · JSON Schema draft 2020-12. 이 문서는 진실 공급원이며, 이 페이지는 필드별로 열거합니다.

## Top-level object

루트는 `additionalProperties: false`인 객체입니다 — 알 수 없는 키는 거부됩니다.

**필수:** `identifier`, `name`, `content_type`, `version`, `distribution`, `types`.

| Field | Type | Req | Constraints / default | Meaning |
|-------|------|-----|-----------------------|---------|
| `identifier` | string | yes | pattern `^run\.vineyard\.typepacks\.[a-z0-9]+(?:[._-][a-z0-9]+)*$` | Reverse-DNS ID, 예: `run.vineyard.typepacks.infrastructure`. |
| `content_type` | string | yes | `const: "vineyard:typepack"` | 문서가 Type Pack임을 표시하는 판별자. |
| `name` | string | yes | `minLength: 1`, `maxLength: 128` | 사람이 읽을 수 있는 팩 이름. |
| `version` | string | yes | SemVer pattern `^(0\|[1-9]\d*)\.(0\|[1-9]\d*)\.(0\|[1-9]\d*)$` | 팩 **내용**의 SemVer. MAJOR = 노드 마이그레이션이 필요한 파괴적 type 변경. |
| `description` | string | no | `maxLength: 1024` | 팩이 모델링하는 내용에 대한 간략한 요약. |
| `authors` | array&lt;object&gt; | no | [Authors](#authors) 참조 | 기여자 목록. |
| `license` | string | no | — | SPDX 표현식, 예: `MIT`, `Apache-2.0`, `CC-BY-4.0`. |
| `distribution` | object | yes | [Distribution](#distribution) 참조 | 문서가 위치한 곳 (git / zip / inline). |
| `marketing_url` | string | no | `format: uri` | 팩의 랜딩 페이지. |
| `thumbnail_url` | string | no | `format: uri` | 아이콘/썸네일 이미지. |
| `types` | array&lt;[entityType](#entity-type-types)&gt; | yes | `minItems: 1` | 노드 엔티티 유형 정의. |
| `edge_types` | array&lt;[edgeType](#edge-types-edge_types)&gt; | no | — | 관계 유형 정의. 없음 ⇒ 팩은 노드 유형만 기여합니다. |

### identifierSegment

여러 키(`category`, `name`, 속성 키)는 `identifierSegment` 정의를 재사용합니다:

| Rule | Value |
|------|-------|
| type | string |
| pattern | `^[a-z][a-z0-9_]*$` (snake_case, 소문자로 시작해야 함) |
| `maxLength` | 31 |

## Authors

`authors[]` — 객체 배열, 각각 `additionalProperties: false`.

| Field | Type | Req | Constraints |
|-------|------|-----|-------------|
| `name` | string | yes | — |
| `email` | string | no | `format: email` |
| `url` | string | no | `format: uri` |

## Distribution

plugin과 Type Pack 양쪽에서 사용되는 공유 블록 (`#/$defs/distribution`). `additionalProperties: false`; **필수:** `kind`. `kind`별 관련 필드는: `git` → `repository` + `ref` + `path`; `zip` → `archive`; `inline` → 문서가 내장됩니다.

| Field | Type | Req | Constraints | Meaning |
|-------|------|-----|-------------|---------|
| `kind` | string (enum) | yes | `git` \| `zip` \| `inline` | 소스 메커니즘. |
| `repository` | string | no | `format: uri`, pattern `^https://github\.com/[^/]+/[^/]+$` | HTTPS 저장소 URL, `.git`이나 슬래시 접미사 없음. |
| `ref` | string | no | — | **불변** ref: 40자 커밋 SHA 또는 주석 태그. 브랜치는 registry CI에서 거부됩니다. |
| `path` | string | no | — | `repo@ref` 내 문서 경로, 예: `typepacks/infrastructure.json`. |
| `integrity` | object | no | 아래 참조 | 선택적 무결성 블록. 설치 시 force-push를 감지합니다. |
| `archive` | object | no | 아래 참조 | 선택적 검증 가능 zip 미러 (`kind=zip`). |

**`integrity`** (`additionalProperties: false`; 필수 `algo`, `hash`):

| Field | Type | Constraints |
|-------|------|-------------|
| `algo` | string (enum) | `sha256` \| `sha512` |
| `hash` | string | pattern `^[a-f0-9]{64,128}$` |

**`archive`** (`additionalProperties: false`; 필수 `url`, `sha256`):

| Field | Type | Constraints |
|-------|------|-------------|
| `url` | string | `format: uri`, pattern `^https://.*\.zip$` |
| `sha256` | string | pattern `^[a-f0-9]{64}$` |

## Entity type (`types[]`)

`types`의 각 항목은 하나의 **노드** 엔티티 유형을 정의합니다 (`#/$defs/entityType`, `additionalProperties: false`). **필수:** `category`, `name`, `label_property`, `properties`.

| Field | Type | Req | Constraints / default | Meaning |
|-------|------|-----|-----------------------|---------|
| `category` | identifierSegment | yes | snake_case, ≤31 | 그룹화 네임스페이스, 예: `infrastructure`. |
| `name` | identifierSegment | yes | snake_case, ≤31 | 카테고리 내 type 이름, 예: `ip_address`. |
| `display_name` | string | no | — | type의 사람용 라벨. |
| `description` | string | no | — | type이 나타내는 것. |
| `label_property` | string | yes | **비선택적** `properties` 내 키를 지정해야 함 | 노드의 표시 라벨로 사용되는 속성 키. |
| `icon` | string | no | 다형적 (아래 참조) | 노드 아이콘. 없으면 노드는 `color`만으로 렌더링됩니다. |
| `color` | string | no | pattern `^#[0-9a-fA-F]{6}$` | 노드 색상 `#rrggbb`. 없으면 `category.name`에서 안정적인 색상이 파생됩니다. |
| `properties` | object | yes | `minProperties: 1`; 키는 identifierSegment; 값은 [property](#property-object) | 속성 키 → 속성 스키마. 비어 있지 않아야 합니다. |

완전한 정규화 type 참조는 `category.name`입니다 (예: `infrastructure.ip_address`). 이 정규화된 형식은 엣지 엔드포인트와 `reference` 대상이 가리키는 것입니다.

!!! info "Icon resolution order"
    `icon`은 다형적이며 다음 순서로 해석됩니다: `data:` / `http(s):` 이미지 URI; 그 외 kebab-case [lucide](https://lucide.dev) 아이콘 이름 (예: `shield-alert`); 그 외 리터럴 글리프/이모지.

## Property object

`properties` 맵의 각 값에 대한 스키마 (`#/$defs/property`, `additionalProperties: false`). **필수:** `type` — 모든 속성은 명시적인 type을 선언해야 합니다.

| Field | Type | Req | Constraints / default | Meaning |
|-------|------|-----|-----------------------|---------|
| `type` | string (enum) | yes | [type enum](#property-type-enum) 참조 | 논리적 속성 유형. |
| `description` | string | no | — | 속성에 대한 사람용 설명. |
| `optional` | boolean | no | `default: false` | `false` (기본값) ⇒ `Node.data`의 필수 키. |
| `default` | any | no | type이 `type`과 일치해야 함 | 키가 없을 때 적용되는 기본값. |
| `validator` | object | no | [validator](#validator-object) 참조 | 구조화된 검증 규칙. |
| `enum` | array | conditional | `minItems: 1`; 항목 `string`\|`number`\|`boolean` | **`type = "enum"`일 때 필수.** |
| `reference` | object | conditional | [reference](#reference-object) 참조 | **`type = "reference"`일 때 필수.** |

### Property `type` enum

`type`은 다음 중 하나여야 합니다:

`string`, `text`, `number`, `integer`, `boolean`, `date`, `datetime`, `enum`, `url`, `ip`, `hash`, `email`, `reference`, `array`, `object`

| Value | Notes |
|-------|-------|
| `string` | 단일 라인 문자열. |
| `text` | 여러 줄 / 긴 텍스트. |
| `number` | 부동 소수점 숫자. |
| `integer` | 정수. |
| `boolean` | true/false. |
| `date` | 달력 날짜. |
| `datetime` | 타임스탬프. |
| `enum` | 제한된 집합 — `enum` 배열 참조. |
| `url` | URL 문자열. |
| `ip` | IP 주소 (IPv4/IPv6). |
| `hash` | 해시 다이제스트. |
| `email` | 이메일 주소. |
| `reference` | 다른 노드 유형으로의 링크 — `reference` 객체 참조. |
| `array` | 리스트 값. |
| `object` | 중첩 객체 값. |

!!! warning "No secret/credential types"
    enum은 의도적으로 `secret`과 `credential`을 제외합니다. API 키, 토큰, 비밀번호를 노드/엣지 속성으로 모델링하지 마세요.

### validator object

`additionalProperties: false`. 이전의 원시 regex 문자열 관행을 대체하는 구조화된 검증. 모든 필드는 선택 사항이며 필요에 따라 조합합니다.

| Field | Type | Constraints | Meaning |
|-------|------|-------------|---------|
| `regex` | string | — | 문자열 형식이 **완전히** 일치해야 하는 ECMAScript 정규식. |
| `min` | number | — | 최소 숫자 값. |
| `max` | number | — | 최대 숫자 값. |
| `min_length` | integer | `minimum: 0` | 최소 문자열 길이. |
| `max_length` | integer | `minimum: 0` | 최대 문자열 길이. |
| `format` | string | — | 명명된 형식 힌트, 예: `ipv4`, `sha256`, `iso8601`. |

### reference object

`type = "reference"`일 때 필수. `additionalProperties: false`.

| Field | Type | Meaning |
|-------|------|---------|
| `target` | string | 참조된 노드 유형의 정규화된 `category.name`, 또는 모든 유형에 대한 `*`. |

## Edge types (`edge_types[]`)

각 항목은 방향성 관계 유형을 정의합니다 (`#/$defs/edgeType`, `additionalProperties: false`). **필수:** `category`, `name`, `label`, `from`, `to`. `label`은 `Edge.label`에 그대로 저장됩니다. `from`/`to`는 엔드포인트 노드 유형을 제한합니다.

| Field | Type | Req | Constraints / default | Meaning |
|-------|------|-----|-----------------------|---------|
| `category` | identifierSegment | yes | snake_case, ≤31 | 그룹화 네임스페이스. |
| `name` | identifierSegment | yes | snake_case, ≤31 | 엣지 type 이름. |
| `label` | string | yes | `maxLength: 64` | `Edge.label`에 그대로 저장됨. |
| `display_name` | string | no | — | 사람용 라벨. |
| `description` | string | no | — | 관계의 의미. |
| `directed` | boolean | no | `default: true` | 엣지가 방향성인지 여부. |
| `from` | array&lt;string&gt; | yes | 항목은 `category.name` 참조; `*` = any | 허용된 소스 노드 유형 참조. |
| `to` | array&lt;string&gt; | yes | 항목은 `category.name` 참조; `*` = any | 허용된 대상 노드 유형 참조. |
| `properties` | object | no | 키 identifierSegment; 값 [property](#property-object) | 선택적 엣지 속성 스키마 (`Edge.data`에 저장됨). 노드 속성과 동일한 문법. |

## Annotated example: Infrastructure Type Pack

최상위 블록, 두 개의 노드 유형(`ip`, `enum`, `string`, `integer`, `reference` 속성 유형과 `validator` 변형 포함), 하나의 엣지 유형을 보여주는 간결하고 완전히 유효한 `vineyard:typepack`입니다. 주석은 설명용이며 — JSON에서는 허용되지 않습니다.

```jsonc
{
  "identifier": "run.vineyard.typepacks.infrastructure", // reverse-DNS id
  "content_type": "vineyard:typepack",                 // 판별자 (const)
  "version": "1.0.0",                                  // 팩 내용 SemVer
  "name": "VINEYARD Type Pack - Infrastructure",
  "description": "Network infrastructure CTI entities and their relationships.",
  "authors": [{ "name": "VINEYARD", "url": "https://vineyard.run" }],
  "license": "Apache-2.0",                             // SPDX 표현식
  "distribution": {                                    // 불변 git 소스
    "kind": "git",
    "repository": "https://github.com/Vineyard-Intelligence/typepacks",
    "ref": "v1.0.0",                                   // 주석 태그 또는 40자 SHA
    "path": "infrastructure/typepack.json"
  },
  "marketing_url": "https://vineyard.run/typepacks/infrastructure",
  "thumbnail_url": "https://vineyard.run/typepacks/infrastructure/icon.png",

  "types": [
    {
      "category": "infrastructure",                    // 정규화된 type => infrastructure.ip_address
      "name": "ip_address",
      "display_name": "IP Address",
      "description": "An IPv4 or IPv6 network address.",
      "label_property": "ip_address",                  // 반드시 아래의 비선택적 속성이어야 함
      "icon": "network",                               // lucide 아이콘 이름
      "color": "#60a5fa",                              // #rrggbb
      "properties": {
        "ip_address": {
          "type": "ip",
          "description": "The IP address.",
          "optional": false,                           // => Node.data의 필수 키
          "validator": { "format": "ip" }              // 명명된 형식 힌트
        },
        "version": {
          "type": "enum",
          "optional": true,
          "enum": ["ipv4", "ipv6"]                     // type=enum에 필수
        },
        "country_code": {
          "type": "string",
          "optional": true,
          "validator": { "regex": "^[A-Z]{2}$" }       // 완전히 일치해야 함
        }
      }
    },
    {
      "category": "infrastructure",
      "name": "autonomous_system",
      "display_name": "Autonomous System",
      "label_property": "autonomous_system_number",
      "icon": "waypoints",
      "color": "#818cf8",
      "properties": {
        "autonomous_system_number": {
          "type": "integer",
          "optional": false,
          "validator": { "min": 0, "max": 4294967295 } // 숫자 경계
        },
        "autonomous_system_name": { "type": "string", "optional": true }
      }
    }
  ],

  "edge_types": [
    {
      "category": "infrastructure",
      "name": "announced_by",
      "label": "announced_by",                         // Edge.label에 저장됨 (<=64)
      "display_name": "Announced By",
      "description": "An IP address is announced by an autonomous system.",
      "from": ["infrastructure.ip_address"],           // 정규화된 엔드포인트 참조
      "to": ["infrastructure.autonomous_system"]
    }
  ]
}
```

!!! example "More patterns in the real pack"
    출시된 Infrastructure 팩은 `reference` 속성 (`infrastructure.url.domain` → `{ "target": "infrastructure.domain" }`), `hash`/`date`/`datetime`/`text` 유형 (`whois_record` 및 `certificate` 내), 그리고 `from`/`to`가 여러 노드 유형을 나열하는 다중 소스 엣지 (예: `resolves_to`가 `infrastructure.domain` **및** `infrastructure.url`로부터)도 보여줍니다. [Type Packs guide](../guide/typepacks.md)를 참조하세요.

## Validation notes

- 모든 최상위, 엔티티, 엣지, 속성 및 중첩 블록은 `additionalProperties: false`를 설정합니다 — 알 수 없는 키는 검증에 실패합니다.
- `label_property`는 `properties`에 존재하고 **비선택적**인 키를 지정해야 합니다.
- `enum`은 `type = "enum"`일 때 정확히 필수입니다. `reference`는 `type = "reference"`일 때 정확히 필수입니다.
- `ref`는 불변이어야 합니다 (커밋 SHA 또는 주석 태그). registry CI는 브랜치 ref를 거부합니다.

## Next / See also

- [Developing Type Packs](../develop/typepacks.md) — 작성 가이드 및 라이프사이클
- [Plugin schema reference](plugin-schema.md) — 형제 `vineyard:plugin` 메타 스키마
- [Registry schema reference](registry-schema.md) — 팩이 목록화되는 방식
- [Scopes reference](scopes.md) — plugin이 요청하는 기능 문자열
- [Type Packs guide](../guide/typepacks.md) — 사용 중인 Type Packs
