# Type Pack schema

`typepack.schema.json`에 대한 완전한 필드 참조 — 모든 `vineyard:typepack` 문서가 검증되는 메타 스키마입니다. Type Pack은 그래프의 어휘를 확장하는 **노드 엔티티 유형**을 선언합니다. 개념적 설명 및 작성 안내는 [Developing Type Packs](../develop/typepacks.md)를 참조하세요.

!!! info "Canonical schema"
    `$id`: `https://vineyard.run/schemas/typepack.json` · JSON Schema draft 2020-12. 이 문서는 진실 공급원이며, 이 페이지는 필드별로 열거합니다.

## Top-level object

루트는 `additionalProperties: false`인 객체입니다 — 알 수 없는 키는 거부됩니다.

**필수:** `identifier`, `name`, `content_type`, `version`, `types`.

| Field | Type | Req | Constraints / default | Meaning |
|-------|------|-----|-----------------------|---------|
| `identifier` | string | yes | pattern `^(?:[a-z0-9]+(?:-[a-z0-9]+)*\.){2,}typepacks\.[a-z0-9]+(?:[._-][a-z0-9]+)*$` | Reverse-DNS ID, 예: `run.vineyard.typepacks.infrastructure`. |
| `content_type` | string | yes | `const: "vineyard:typepack"` | 문서가 Type Pack임을 표시하는 판별자. |
| `name` | string | yes | `minLength: 1`, `maxLength: 128` | 사람이 읽을 수 있는 팩 이름. |
| `version` | string | yes | SemVer pattern `^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$` | 팩 **내용**의 SemVer. MAJOR = 파괴적 type 변경. 변경된 type을 쓰는 노드는 수정이 필요할 수 있습니다. |
| `description` | string | no | `maxLength: 1024` | 팩이 모델링하는 내용에 대한 간략한 요약. |
| `authors` | array&lt;object&gt; | no | [Authors](#authors) 참조 | 기여자 목록. |
| `license` | string | no | — | SPDX 표현식, 예: `MIT`, `Apache-2.0`, `CC-BY-4.0`. |
| `marketing_url` | string | no | `format: uri` | 팩의 랜딩 페이지. |
| `thumbnail_url` | string | no | `format: uri` | 아이콘/썸네일 이미지. |
| `types` | array&lt;[entityType](#entity-type-types)&gt; | yes | `minItems: 1` | 노드 엔티티 유형 정의. |

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
| `identity_properties` | array&lt;string&gt; | no | `minItems: 1`, `uniqueItems`; 각 항목은 `properties`의 키를 지정해야 함 | 중복 제거를 위해 하나의 엔티티를 함께 식별하는 키들. 기본값은 `[label_property]`. 예: `user_account`는 사용자명으로 표시되지만 `(username, platform)`으로 식별됩니다. |
| `label_template` | string | no | 참조된 키는 `properties`에 존재해야 함 | 여러 속성으로 구성된 표시 라벨, 예: `"{username} · {platform}"`. 참조된 필드가 비어 있으면 `label_property`로 폴백하므로, 일부만 채워진 노드가 구분자만 덩그러니 남는 일이 없습니다. 표시 전용 — 중복 제거는 `identity_properties`를 사용합니다. |

완전한 정규화 type 참조는 `category.name`입니다 (예: `infrastructure.ip_address`). 이 정규화된 형식은 `Node.type`이 저장하는 값이며 `reference` 대상이 가리키는 것입니다.

!!! info "Icon resolution order"
    `icon`은 다형적이며 다음 순서로 해석됩니다: `data:` / `http(s):` 이미지 URI; 그 외 kebab-case [lucide](https://lucide.dev) 아이콘 이름 (예: `shield-alert`); 그 외 리터럴 글리프/이모지. 어떤 kebab-case lucide 이름이든 해석됩니다.

## Property object

`properties` 맵의 각 값에 대한 스키마 (`#/$defs/property`, `additionalProperties: false`). **필수:** `type` — 모든 속성은 명시적인 type을 선언해야 합니다.

| Field | Type | Req | Constraints / default | Meaning |
|-------|------|-----|-----------------------|---------|
| `type` | string (enum) | yes | [type enum](#property-type-enum) 참조 | 논리적 속성 유형. |
| `description` | string | no | — | 속성에 대한 사람용 설명. |
| `optional` | boolean | no | `default: false` | `false` (기본값) ⇒ `Node.data`의 필수 키. |
| `case_insensitive` | boolean | no | `default: false` | 이 속성이 중복 제거 식별자에 포함될 때 대소문자를 접습니다. 표시와 저장은 작성된 그대로 유지됩니다. 핸들, 도메인, 호스트명, 이메일, 16진 다이제스트에는 맞고, Base58/EIP-55 암호화폐 주소, URL 경로, 대소문자를 구분하는 파일 경로에는 틀립니다. 플래그가 빠지면 눈에 보이고 병합 가능한 중복이 생기지만, 잘못 붙이면 두 엔티티가 조용히 하나로 병합됩니다. |
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

`additionalProperties: false`. 구조화된 검증. 모든 필드는 선택 사항이며 필요에 따라 조합합니다.

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

## Annotated example: Infrastructure Type Pack

최상위 블록, 두 개의 노드 유형(`ip`, `enum`, `string`, `integer`, `reference` 속성 유형과 `validator` 변형 포함)을 보여주는 간결하고 완전히 유효한 `vineyard:typepack`입니다. 주석은 설명용이며 — JSON에서는 허용되지 않습니다.

```jsonc
{
  "identifier": "run.vineyard.typepacks.infrastructure", // reverse-DNS id
  "content_type": "vineyard:typepack",                 // 판별자 (const)
  "version": "1.0.0",                                  // 팩 내용 SemVer
  "name": "VINEYARD Type Pack - Infrastructure",
  "description": "Network infrastructure CTI entities.",
  "authors": [{ "name": "VINEYARD", "url": "https://vineyard.run" }],
  "license": "Apache-2.0",                             // SPDX 표현식
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
  ]
}
```

!!! example "More patterns in the real pack"
    출시된 Infrastructure 팩은 `category`가 한 팩 안에서 일치할 필요가 없다는 점(`infrastructure.*`와 `web.*` 유형을 모두 정의함)과 `hash`/`date`/`datetime`/`text` 유형 (`whois_record` 및 `certificate` 내)도 보여줍니다. [Type Packs guide](../guide/typepacks.md)를 참조하세요.

## Validation notes

- 모든 최상위, 엔티티, 속성 및 중첩 블록은 `additionalProperties: false`를 설정합니다 — 알 수 없는 키는 검증에 실패합니다.
- `label_property`는 `properties`에 존재하고 **비선택적**인 키를 지정해야 합니다.
- `enum`은 `type = "enum"`일 때 정확히 필수입니다. `reference`는 `type = "reference"`일 때 정확히 필수입니다.
- 팩을 등록하는 레지스트리 항목은 팩을 불변 커밋 SHA로 고정합니다. registry CI는 태그와 브랜치를 거부합니다 ([registry schema](registry-schema.md) 참조).

## Next / See also

- [Developing Type Packs](../develop/typepacks.md) — 작성 가이드 및 라이프사이클
- [Plugin schema reference](plugin-schema.md) — 형제 `vineyard:plugin` 메타 스키마
- [Registry schema reference](registry-schema.md) — 팩이 목록화되는 방식
- [Scopes reference](scopes.md) — plugin이 요청하는 기능 문자열
- [Type Packs guide](../guide/typepacks.md) — 사용 중인 Type Packs
