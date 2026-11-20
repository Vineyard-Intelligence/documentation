# Type Pack 스키마

`typepack.schema.json`에 대한 완전한 필드 참조 — `vineyard:typepack` 문서의 작성 계약입니다. 레지스트리 CI도 앱도 문서를 이 스키마로 검증하지 않으므로, 참조 팩 저장소들처럼 자체 CI에서 실행하세요. Type Pack은 그래프의 어휘를 확장하는 **노드 엔티티 유형**을 선언합니다. 개념적 설명 및 작성 안내는 [Type Pack](../develop/typepacks.md)을 참조하세요.

!!! info "정식 스키마"
    `$id`: `https://vineyard.run/schemas/typepack.json` · JSON Schema draft 2020-12. 이 문서는 진실 공급원이며, 이 페이지는 필드별로 열거합니다.

## 최상위 객체 {#top-level-object}

루트는 `additionalProperties: false`인 객체입니다 — 알 수 없는 키는 스키마 검증에 실패합니다.

**필수:** `identifier`, `name`, `content_type`, `version`, `summary`, `description`, `types`.

| 필드 | 유형 | 필수 | 제약 / 기본값 | 의미 |
|-------|------|-----|-----------------------|---------|
| `identifier` | string | 예 | pattern `^(?:[a-z0-9]+(?:-[a-z0-9]+)*\.){2,}typepacks\.[a-z0-9]+(?:[._-][a-z0-9]+)*$` | Reverse-DNS ID, 예: `run.vineyard.typepacks.infrastructure`. |
| `content_type` | string | 예 | `const: "vineyard:typepack"` | 문서가 Type Pack임을 표시하는 판별자. |
| `name` | string | 예 | `minLength: 1`, `maxLength: 128` | 사람이 읽을 수 있는 팩 이름. |
| `version` | string | 예 | SemVer pattern `^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$` | 팩 **내용**의 SemVer. MAJOR = 파괴적 type 변경. 변경된 type을 쓰는 노드는 수정이 필요할 수 있습니다. |
| `summary` | string | 예 | 1–250자, 한 줄 | 팩 이름 아래의 한 줄. [팩의 한 줄과 페이지](../develop/publishing.md#pack-page)를 참고하세요. |
| `description` | string | 예 | 1–16,000자 | 팩의 페이지(Markdown). `summary`가 없는 문서는 페이지가 생기기 전의 것으로 이 값이 한 줄입니다. 앱은 읽지만 레지스트리는 등재하지 않습니다. |
| `authors` | array&lt;object&gt; | 아니요 | [저자](#authors) 참조 | 기여자 목록. |
| `license` | string | 아니요 | — | SPDX 표현식, 예: `MIT`, `Apache-2.0`, `CC-BY-4.0`. |
| `marketing_url` | string | 아니요 | `format: uri` | 팩의 랜딩 페이지. |
| `thumbnail_url` | string | 아니요 | `format: uri` | 아이콘/썸네일 이미지. |
| `types` | array&lt;[entityType](#entity-type-types)&gt; | 예 | `minItems: 1` | 노드 엔티티 유형 정의. |

### identifierSegment

여러 키(`category`, `name`, 속성 키)는 `identifierSegment` 정의를 재사용합니다:

| 규칙 | 값 |
|------|-------|
| type | string |
| pattern | `^[a-z][a-z0-9_]*$` (snake_case, 소문자로 시작해야 함) |
| `maxLength` | 31 |

## 저자 {#authors}

`authors[]` — 객체 배열, 각각 `additionalProperties: false`.

| 필드 | 유형 | 필수 | 제약 |
|-------|------|-----|-------------|
| `name` | string | 예 | — |
| `email` | string | 아니요 | `format: email` |
| `url` | string | 아니요 | `format: uri` |

## 엔티티 유형 (`types[]`) {#entity-type-types}

`types`의 각 항목은 하나의 **노드** 엔티티 유형을 정의합니다 (`#/$defs/entityType`, `additionalProperties: false`). **필수:** `category`, `name`, `label_property`, `properties`.

| 필드 | 유형 | 필수 | 제약 / 기본값 | 의미 |
|-------|------|-----|-----------------------|---------|
| `category` | identifierSegment | 예 | snake_case, ≤31 | 그룹화 네임스페이스, 예: `infrastructure`. |
| `name` | identifierSegment | 예 | snake_case, ≤31 | 카테고리 내 type 이름, 예: `ip_address`. |
| `display_name` | string | 아니요 | — | type의 사람용 라벨. |
| `description` | string | 아니요 | — | type이 나타내는 것. |
| `label_property` | string | 예 | **비선택적** `properties` 내 키를 지정해야 함 | 노드의 표시 라벨로 사용되는 속성 키. |
| `icon` | string | 아니요 | 다형적 (아래 참조) | 노드 아이콘. 없으면 노드는 `color`만으로 렌더링됩니다. |
| `color` | string | 아니요 | pattern `^#[0-9a-fA-F]{6}$` | 노드 색상 `#rrggbb`. 없으면 `category.name`에서 안정적인 색상이 파생됩니다. |
| `properties` | object | 예 | `minProperties: 1`; 키는 identifierSegment; 값은 [속성 객체](#property-object) | 속성 키 → 속성 스키마. 비어 있지 않아야 합니다. |
| `identity_properties` | array&lt;string&gt; | 아니요 | `minItems: 1`, `uniqueItems`; 각 항목은 `properties`의 키를 지정해야 함 | 중복 제거를 위해 하나의 엔티티를 함께 식별하는 키들. 기본값은 `[label_property]`. 예: `identity.account`의 `label_property`는 `username`이지만 식별은 `(username, platform)`으로 합니다. |
| `label_template` | string | 아니요 | 참조된 키는 `properties`에 존재해야 함 | 여러 속성으로 구성된 표시 라벨, 예: `"{username} · {platform}"`. 참조된 필드가 비어 있으면 `label_property`로 폴백하므로, 일부만 채워진 노드가 구분자만 덩그러니 남는 일이 없습니다. 표시 전용 — 중복 제거는 `identity_properties`를 사용합니다. |

완전한 정규화 type 참조는 `category.name`입니다 (예: `infrastructure.ip_address`). 이 정규화된 형식은 `Node.type`이 저장하는 값이며 `reference` 대상이 가리키는 것입니다.

!!! info "아이콘 해석 순서"
    `icon`은 다형적이며 다음 순서로 해석됩니다: `data:` / `http(s):` 이미지 URI; 그 외 kebab-case [lucide](https://lucide.dev) 아이콘 이름 (예: `shield-alert`); 그 외 리터럴 글리프/이모지. 어떤 kebab-case lucide 이름이든 해석됩니다.

## 속성 객체 {#property-object}

`properties` 맵의 각 값에 대한 스키마 (`#/$defs/property`, `additionalProperties: false`). **필수:** `type` — 모든 속성은 명시적인 type을 선언해야 합니다.

| 필드 | 유형 | 필수 | 제약 / 기본값 | 의미 |
|-------|------|-----|-----------------------|---------|
| `type` | string (enum) | 예 | [type 열거형](#property-type-enum) 참조 | 논리적 속성 유형. |
| `description` | string | 아니요 | — | 속성에 대한 사람용 설명. |
| `optional` | boolean | 아니요 | `default: false` | `false` ⇒ `Node.data`의 필수 키. 모든 속성에 적으세요: 노드 생성은 속성이 `"optional": false`라고 명시했을 때만 빠진 키를 거부합니다. `optional`을 생략하면 Properties 패널은 그 속성을 필수(`*`)로 표시하지만, 그 키 없이 생성해도 받아들여집니다. |
| `case_insensitive` | boolean | 아니요 | `default: false` | 이 속성이 중복 제거 식별자에 포함될 때 대소문자를 접습니다. 표시와 저장은 작성된 그대로 유지됩니다. 핸들, 도메인, 호스트명, 이메일, 16진 다이제스트에는 맞고, Base58 암호화폐 주소, URL 경로, 대소문자를 구분하는 파일 경로에는 틀립니다. 암호화폐 주소 속성에는 Base58과, 대소문자에 의미가 없는 hex·bech32가 섞이므로 대신 `normalize`를 씁니다. `normalize: hostname`, `ip`, `cidr` 옆에는 이 플래그도 함께 둡니다. 그러면 규칙을 모르는 앱도 대소문자는 접습니다. 플래그가 빠지면 눈에 보이고 병합 가능한 중복이 생기지만, 잘못 붙이면 두 엔티티가 조용히 하나로 병합됩니다. |
| `normalize` | string (enum) | 아니요 | `crypto_address`, `hex`, `hostname`, `ip`, `cidr`, `url`. `case_insensitive: true`는 `hostname`, `ip`, `cidr` 옆에만 | 중복 제거 식별자에 쓰는 이름 붙은 규칙으로, `case_insensitive`로 나타낼 수 없는 것에 씁니다. 표시와 저장은 작성된 그대로 유지됩니다. `hostname`은 DNS 이름을 접습니다: 끝의 점 하나를 떼고, 국제화 도메인 이름을 퓨니코드로 바꾸고(IDNA, UTS #46), 소문자로 접습니다. 이 변환은 이름을 IPv4 주소로 읽지 않습니다. ASCII가 아닌 이름은 대응하는 ASCII 이름으로 접으므로, 전각 `０ｘ７ｆ.１`은 127.0.0.1이 아니라 `0x7f.1`로 접힙니다. `ip`는 IPv6 주소를 RFC 5952 형식(소문자, 그룹 앞 0 없음, 가장 긴 0 구간은 `::`. IPv4 매핑 주소는 점으로 쓴 끝부분을 유지하고 그 IPv4 주소로 접지 않음)으로, 부분마다 세 자리로 채운 IPv4 주소(`192.000.002.001`)를 일반 형식으로 접습니다. 다만 0으로 시작하는 부분이 모두 8진수와 10진수가 같게 읽히는 `000`부터 `007`까지일 때만 접습니다. 그 밖의 앞자리 0이 있는 주소는 `010.001.002.003`의 `010`처럼 세 자리로 채운 부분이라도 적힌 그대로 비교합니다. 브라우저와 `inet_aton`이 `010`을 8진수 8로 읽기 때문입니다. `cidr`는 주소를 `ip`처럼 접고 프리픽스 길이도 접으며, 호스트 비트는 지우지 않습니다. `url`은 `http`, `https`, `ftp`, `ws`, `wss` URL을 브라우저가 해석하는 대로 접습니다. 스킴과 호스트는 소문자, 호스트는 끝의 점 없이 퓨니코드로, 기본 포트는 빼고, `.`·`..`은 풀고, 빈 경로는 `/`로 쓰며, 퍼센트 인코딩은 한 형태로 맞춥니다(RFC 3986 §6.2.2). 경로, 쿼리, 프래그먼트의 대소문자는 그대로 둡니다. `crypto_address`와 `hex`는 대소문자가 의미 있는 형식과 의미 없는 형식이 한 속성에 섞일 때 값마다 판단합니다. `crypto_address`는 값의 형식을 보고 접습니다: `0x` + hex 40자(EIP-55 대소문자는 체크섬), 알려진 접두어(`bc`, `tb`, `bcrt`, `ltc`, `tltc`, `btg`, `bnb`, `addr`, `addr_test`, `stake`, `stake_test`)에 체크섬이 맞는 bech32/bech32m, TON raw `<workchain>:<hex 64자>`는 소문자로, CashAddr는 `bitcoincash:` 유무와 관계없이 소문자 페이로드로 접고, 그 밖(Base58 포함)은 작성된 그대로 비교합니다. `hex`는 `0x` 유무와 관계없이 hex 64자 값을 `0x`를 뗀 소문자로 접습니다. 둘 다 다시 인코딩하지 않으므로, 변환해야 같아지는 값(TRON hex 주소, Litecoin `3…` 별칭, TON 사용자용 주소)은 정규형으로 써야 합니다. 이 규칙을 모르는 앱은 `case_insensitive`를 따릅니다. 에이전트의 `common_ground`와 `aggregate_values`도 이 규칙으로 값을 비교하며, 설치된 모든 유형에 걸쳐 속성 이름으로 적용합니다. 그 이름의 속성은 어느 유형에 있든 이 규칙을 따르므로 원래 받던 대소문자·띄어쓰기 접기를 잃고, 두 팩이 같은 이름에 다른 규칙을 주면 작성된 그대로 비교합니다. 그 이름을 쓰는 모든 팩에서 같은 뜻인 속성 이름에만 선언하세요. |
| `duplicate_key` | boolean | 아니요 | `default: false`. 식별에 들지 않는 스칼라 속성 | 노드를 만든 뒤에 채우는 식별의 정규형을 표시합니다. 적힌 그대로의 번호 옆에 두는 전화번호의 `e164`가 그 예입니다. 이 값이 같은 같은 유형의 노드는 식별이 달라도 서로 중복으로 보고됩니다([중복과 병합](../guide/tasks.md#duplicates-and-merging) 참조). 식별에는 들지 않으므로, 채운다고 노드가 저절로 합쳐지지는 않습니다. 속성 자신의 `case_insensitive`나 `normalize`로 비교합니다. |
| `default` | any | 아니요 | `type`과 일치해야 함 (검사하지 않음) | 받아들여지지만 적용되지 않음: 앱에서 빠진 키를 이 값으로 채우는 곳이 없습니다. |
| `validator` | object | 아니요 | [validator 객체](#validator-object) 참조 | 구조화된 검증 규칙. |
| `enum` | array | 조건부 | `minItems: 1`; 항목 `string`\|`number`\|`boolean` | **`type = "enum"`일 때 필수.** |
| `reference` | object | 조건부 | [reference 객체](#reference-object) 참조 | **`type = "reference"`일 때 필수.** |

### 속성 `type` 열거형 {#property-type-enum}

`type`은 다음 중 하나여야 합니다:

`string`, `text`, `number`, `integer`, `boolean`, `date`, `datetime`, `enum`, `url`, `ip`, `hash`, `email`, `reference`, `array`, `object`

| 값 | 비고 |
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

!!! warning "secret/credential 유형 없음"
    enum은 의도적으로 `secret`과 `credential`을 제외합니다. API 키, 토큰, 비밀번호를 노드/엣지 속성으로 모델링하지 마세요.

### validator 객체 {#validator-object}

`additionalProperties: false`. 구조화된 검증. 모든 필드는 선택 사항이며 필요에 따라 조합합니다.

| 필드 | 유형 | 제약 | 의미 |
|-------|------|-------------|---------|
| `regex` | string | — | 문자열 값에 적힌 그대로 검사하는 ECMAScript 정규식으로, 암묵적인 앵커가 없습니다: 값 전체가 일치해야 한다면 `^…$`를 쓰세요. 앱은 패턴의 형태와 상관없이 값의 길이에 비례하는 시간으로 실행합니다. 4,096자보다 긴 값, 그리고 컴파일되지 않거나, 전방·후방 탐색, 역참조, 인라인 수정자, 레거시 8진 이스케이프를 쓰거나, 2,000자보다 길거나, 그룹을 32단계보다 깊게 중첩하거나, 상태가 2,000개를 넘게 펼쳐지거나, 빈 그룹을 반복 안에서 반복하는 패턴은 검사를 건너뛰고 값을 검사하지 않은 채 둡니다. [앱이 노드 데이터에서 검사하는 것](../develop/typepacks.md#what-the-app-checks-on-node-data)을 참조하세요. |
| `min` | number | — | 최소 숫자 값. |
| `max` | number | — | 최대 숫자 값. |
| `min_length` | integer | `minimum: 0` | 최소 문자열 길이. 힌트이며 앱이 검사하지 않습니다. |
| `max_length` | integer | `minimum: 0` | 최대 문자열 길이. 힌트이며 앱이 검사하지 않습니다. |
| `format` | string | — | 명명된 형식 힌트, 예: `ipv4`, `sha256`, `iso8601`. 앱이 검사하지 않습니다. |

### reference 객체 {#reference-object}

`type = "reference"`일 때 필수. `additionalProperties: false`.

| 필드 | 유형 | 의미 |
|-------|------|---------|
| `target` | string | 참조된 노드 유형의 정규화된 `category.name`, 또는 모든 유형에 대한 `*`. |

## 주석이 달린 예시: Infrastructure Type Pack {#annotated-example-infrastructure-type-pack}

최상위 블록, 두 개의 노드 유형(`ip`, `enum`, `string`, `integer` 속성 유형과 `validator` 변형 포함)을 보여주는 간결하고 완전히 유효한 `vineyard:typepack`입니다. 주석은 설명용이며 — JSON에서는 허용되지 않습니다.

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
          "validator": { "regex": "^[A-Z]{2}$" }       // 앵커가 있어 값 전체가 일치해야 함
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

!!! example "실제 팩의 더 많은 패턴"
    출시된 Infrastructure 팩은 `category`가 한 팩 안에서 일치할 필요가 없다는 점(`infrastructure.*`와 `web.*` 유형을 모두 정의함)과 `hash`/`date`/`datetime`/`text` 유형 (`whois_record` 및 `certificate` 내)도 보여줍니다. [Type Pack 사용하기](../guide/typepacks.md)를 참조하세요.

## 검증 참고 사항 {#validation-notes}

- 모든 최상위, 엔티티, 속성 및 중첩 블록은 `additionalProperties: false`를 설정합니다 — 알 수 없는 키는 검증에 실패합니다.
- `label_property`는 `properties`에 존재하고 **비선택적**인 키를 지정해야 합니다.
- `enum`은 `type = "enum"`일 때 정확히 필수입니다. `reference`는 `type = "reference"`일 때 정확히 필수입니다.
- 위의 두 규칙은 작성 규칙입니다. 스키마는 이를 설명(description)으로만 적고 있으므로 스키마 검증기로도 강제되지 않으며, 다른 무엇도 강제하지 않습니다.
- `normalize: crypto_address`, `hex`, `url`인 속성은 `"case_insensitive": true`를 함께 쓸 수 없습니다. 플래그가 이 규칙들이 남겨 두는 대소문자를 접기 때문에 스키마가 이 조합을 거부합니다.
- 레지스트리 CI가 Type Pack 문서에서 검사하는 것은 다음뿐입니다: `identifier`, `content_type`, `version`이 항목과 일치할 것, `type_count`와 (항목에 있다면) `icon`이 문서와 일치할 것, 모든 `identity_properties` 키가 `array`, `object`, `json`이 아닌 실제 속성을 가리킬 것, 모든 `normalize`가 여섯 규칙 가운데 하나이고 `case_insensitive: true`와는 `hostname`, `ip`, `cidr`일 때만 함께 쓰이며 `array`, `object`, `json`이 아닌 속성에 있을 것, 모든 `duplicate_key`가 그런 속성 가운데 식별에 들지 않는 속성의 boolean일 것, 그리고 다른 게시된 Type Pack이 같은 `category.name`을 정의하지 않을 것([레지스트리에 배포하기](../develop/publishing.md#what-ci-enforces) 참조).
- 앱은 노드를 쓸 때 선언된 속성으로 노드 데이터를 검사합니다. [앱이 노드 데이터에서 검사하는 것](../develop/typepacks.md#what-the-app-checks-on-node-data)을 참조하세요.
- 팩을 등록하는 레지스트리 항목은 팩을 불변 커밋 SHA로 고정합니다. registry CI는 태그와 브랜치를 거부합니다 ([레지스트리 엔트리 스키마](registry-schema.md) 참조).

## 다음 / 참고 {#next-see-also}

- [Type Pack](../develop/typepacks.md) — 작성 가이드 및 라이프사이클
- [플러그인 매니페스트 스키마](plugin-schema.md) — 형제 `vineyard:plugin` 메타 스키마
- [레지스트리 엔트리 스키마](registry-schema.md) — 팩이 목록화되는 방식
- [스코프 레퍼런스](scopes.md) — plugin이 요청하는 기능 문자열
- [Type Pack 사용하기](../guide/typepacks.md) — 사용 중인 Type Pack
