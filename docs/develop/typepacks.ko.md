# Type Packs

Type Pack은 그래프와 플러그인이 사용할 **노드 엔티티 타입**과 (선택적으로) **엣지 타입**을 정의하는 `vineyard:typepack` 문서입니다. 이 페이지는 엔드 투 엔드 작성을 다룹니다. 필드별 계약은 [Type Pack schema reference](../reference/typepack-schema.md)를 참조하세요.

## Type Pack이란 무엇인가

플러그인은 자체 데이터 형태를 만들어내지 않습니다. Type Pack이 선언한 노드 타입을 정규화된 문자열로 주소 지정하여 `consume`하고 `produce`합니다. `types`만 제공하는 Type Pack은 노드 타입을 제공하며, `edge_types`를 추가하면 그들 간의 관계를 설명할 수 있습니다. 배포된 6개의 참조 팩은 [Infrastructure, Threat, Identity, Financial, Endpoint, Geospatial](../guide/typepacks.md)입니다.

## 최상위 필드

```jsonc
{
  "identifier": "run.vineyard.typepacks.infrastructure",
  "content_type": "vineyard:typepack",           // 상수
  "version": "1.0.0",                             // 팩 콘텐츠의 SemVer
  "name": "Infrastructure",
  "description": "Network infrastructure entities.",
  "authors": [{ "name": "Vineyard", "url": "https://vineyard.run" }],
  "license": "Apache-2.0",                        // SPDX 표현식
  "distribution": { /* 공유 distribution 블록, Distribution 참조 */ },
  "marketing_url": "https://vineyard.run/packs/infrastructure",
  "thumbnail_url": "https://vineyard.run/img/infra.png",
  "types": [ /* 엔티티 타입 — 최소 하나 필수 */ ],
  "edge_types": [ /* 선택적 관계 타입 */ ]
}
```

`types[]`에는 최소 하나의 엔티티 타입이 필요합니다. `edge_types[]`는 선택 사항입니다. 전체 필수/선택 필드 테이블은 [Type Pack schema reference](../reference/typepack-schema.md)에 있습니다.

!!! note "참조 팩은 유효한 템플릿입니다"
    배포된 6개의 팩(`infrastructure.json`, `threat.json`, `identity.json`, `financial.json`, `endpoint.json`, `geo.json`)은 이 스키마를 따릅니다 — 명시적 프로퍼티 타입, 구조화된 유효성 검사기, `distribution`, 필수 최상위 필드 — 따라서 이들 중 아무거나 작업 템플릿으로 읽을 수 있습니다. 새 작성은 반드시 아래 스키마를 따라야 합니다.

## 엔티티 타입

`types[]`의 각 항목은 하나의 노드 엔티티 타입을 선언합니다.

```jsonc
{
  "category": "infrastructure",        // snake_case 식별자 세그먼트
  "name": "ip_address",                // snake_case 식별자 세그먼트
  "display_name": "IP Address",        // 선택적 사람용 레이블
  "description": "IPv4/IPv6 network address with geo and ASN context.",
  "icon": "network",                   // 시각 요소 참조
  "color": "#60a5fa",                  // 시각 요소 참조
  "label_property": "ip_address",      // properties 내의 키; 반드시 존재하고 non-optional이어야 함
  "properties": {                      // 최소 하나의 프로퍼티
    "ip_address":   { "type": "ip", "optional": false },
    "country_code": { "type": "string", "validator": { "regex": "^[A-Z]{2}$" }, "optional": false },
    "asn":          { "type": "string", "optional": true },
    "organization": { "type": "string", "optional": true }
  }
}
```

- `category`와 `name`은 **snake_case 식별자 세그먼트**입니다(`^[a-z][a-z0-9_]*$`, ≤31자).
- `properties`는 반드시 비어 있지 않아야 합니다. 각 프로퍼티 키도 snake_case 세그먼트입니다.
- `label_property`는 노드의 표시 레이블로 사용되는 키를 지정합니다. 교차 필드 린트는 이 키가 `properties`에 존재하고 **non-optional**이어야 함을 요구합니다.

## 프로퍼티 타입

모든 프로퍼티는 열거형(enum)에서 명시적 `type`을 선언해야 합니다(전체 목록은 [schema reference](../reference/typepack-schema.md) 참조). 프로퍼티는 기본적으로 필수입니다. `"optional": true`로 설정하면 `Node.data`에서 키가 없을 수 있습니다. `default`를 제공할 수 있습니다(값이 `type`과 일치해야 함). 세 가지 타입은 추가 키가 필요합니다:

=== "enum"

    ```jsonc
    "malware_type": {
      "type": "enum",
      "enum": ["trojan", "ransomware", "worm", "rootkit"],   // type=enum일 때 필수
      "optional": false
    }
    ```

=== "reference"

    `reference` 프로퍼티는 다른 노드 타입에 연결됩니다. 정규화된 `category.name`(또는 모든 경우 `*`)으로 `reference.target`을 제공하세요:

    ```jsonc
    "observed_on": {
      "type": "reference",
      "reference": { "target": "infrastructure.ip_address" },
      "optional": true
    }
    ```

=== "validated string"

    ```jsonc
    "cve_id": {
      "type": "string",
      "validator": { "regex": "^CVE-\\d{4}-\\d{4,}$" },
      "optional": false
    }
    ```

Type Pack은 `secret` 또는 `credential` 프로퍼티 타입을 선언할 수 **없습니다** — 해당 열거형 값이 없으므로 스키마가 강제로 거부합니다. API 키와 토큰은 그래프 데이터가 아닙니다. 시크릿은 `secret: true`인 플러그인 `config`를 통해서만 처리됩니다([security](security.md) 참조).

### 구조화된 유효성 검사기

`validator`는 원시 정규식 문자열이 아닌 **구조화된 객체**입니다. (이전 팩은 일반 문자열을 사용했으나, 그 형태는 대체되었습니다.) 해당 키(`regex`, `min`/`max`, `min_length`/`max_length`, `format`)는 [schema reference](../reference/typepack-schema.md)에 표로 정리되어 있습니다.

```jsonc
"cvss_score": { "type": "number", "validator": { "min": 0, "max": 10 }, "optional": true }
```

## 시각 요소: icon 및 color

둘 다 엔티티 타입별로 선택 사항이며, 캔버스와 Types/Properties 패널은 하나의 공유 리졸버를 사용합니다.

- **`icon`**은 다형적이며 순서대로 해석됩니다:
    1. `data:` / `http(s):` 이미지 URI → 노드 아이콘으로 그려짐;
    2. 그 외에는 케밥 케이스의 **lucide** 아이콘 이름(예: `shield-alert`) → SVG로 직렬화되어 `color`로 색조 지정됨;
    3. 그 외에는 리터럴 **글리프/이모지**.

    `icon`이 없으면 노드는 `color`만으로 렌더링됩니다. (lucide는 기본 아이콘 세트입니다. 호스트는 알 수 없는 lucide 이름을 색상 폴백으로 렌더링합니다.)
- **`color`**는 `#rrggbb`입니다. 없으면 `category.name`에서 안정적인 색상이 해시됩니다.

예를 들어 Threat 팩은 `bug`(malware), `shield-alert`(vulnerability), `venetian-mask`(threat actor)와 같은 lucide 이름을 사용합니다.

## 엣지 타입

`edge_types[]`는 방향성 관계를 선언합니다. 각각 `category`, `name`, `label`, `from`, `to`가 필요합니다.

```jsonc
{
  "category": "threat",
  "name": "exploits",
  "label": "exploits",                 // Edge.label에 그대로 저장, <= 1024자
  "directed": true,                     // 기본값 true
  "from": ["threat.malware"],           // 허용된 소스 노드 타입 참조 (category.name); '*' = 모든 것
  "to":   ["threat.vulnerability"],     // 허용된 대상 노드 타입 참조; '*' = 모든 것
  "properties": {                       // 선택 사항, Edge.data에 저장; 노드 props와 동일한 문법
    "confidence": { "type": "enum", "enum": ["low", "medium", "high"], "optional": true }
  }
}
```

`from`/`to`는 정규화된 `category.name`으로 엔드포인트 노드 타입을 제한합니다. 설치 시 린트는 이러한 참조가 해석되는지 확인합니다. `label`은 `Edge.label`에 그대로 저장됩니다. 선택적 엣지 `properties`는 노드와 동일한 프로퍼티 문법을 따르며 `Edge.data`에 저장됩니다.

## 타입 식별 및 저장

노드 타입은 정규화된 문자열 `"<category>.<name>"`으로 주소 지정됩니다 — 예: `infrastructure.ip_address` 또는 `threat.malware`. 이 정규화된 형태가 `Node.type`이 저장하는 값이며, 플러그인의 `io.consumes` / `io.produces` 및 `emit`이 참조하는 값입니다. 엣지 타입은 `Edge.label`에 매핑됩니다. 엣지 프로퍼티(사용 시)는 `Edge.data`에 저장됩니다.

## 버전 관리

`version`은 **팩 콘텐츠**의 SemVer입니다.

- **MAJOR** = 주요 변경: 타입 이름 변경 또는 제거. 활성화 시 **노드 마이그레이션 패스**가 필요하여 기존 노드가 다시 매핑됩니다.
- **MINOR / PATCH** = 기존 `Node.type` 값을 깨뜨리지 않는 추가 또는 수정 수준의 변경.

!!! note "미해결 이슈: Type Pack 버전 고정"
    플러그인의 `typeRef`는 아직 Type Pack 버전이나 범위를 포함하지 않으므로, MAJOR Type Pack 변경이 조용히 플러그인의 `io`를 깨뜨릴 수 있습니다. 해결책(`typeRef.version_range` + CI 교차 검사, 또는 활성화된 버전 기준 해석)은 여전히 추적 중인 미해결 이슈이며, 배포된 동작이 아닙니다. MAJOR 변경은 보수적으로 다루세요.

## 유효성 검사 체크리스트

설치 시 린트는 원시 JSON Schema를 넘어 교차 필드 불변성을 강제합니다:

- [ ] `content_type`이 `vineyard:typepack`입니다.
- [ ] `identifier`가 유효한 `run.vineyard.typepacks.*` reverse-DNS 문자열입니다.
- [ ] 최소 하나의 엔티티 타입. 모든 엔티티 타입은 ≥1개의 프로퍼티를 가집니다.
- [ ] 각 프로퍼티가 열거형에서 명시적 `type`을 선언합니다(`secret`/`credential` 없음).
- [ ] `validator`(존재 시)가 원시 정규식 문자열이 아닌 구조화된 객체입니다.
- [ ] `label_property`가 `properties`에 존재하고 non-optional입니다.
- [ ] `enum` 프로퍼티는 `enum`을 제공합니다. `reference` 프로퍼티는 `reference.target`을 제공합니다. 모든 `default`는 `type`과 일치합니다.
- [ ] 엣지 `from`/`to` 참조가 선언된 노드 타입(또는 `*`)으로 해석됩니다.

## 다음 / 참고

- [Type Pack schema reference](../reference/typepack-schema.md) — 권위 있는 필드 계약.
- [Scopes reference](../reference/scopes.md) — 플러그인이 이러한 타입으로 할 수 있는 작업.
- [Plugin manifest](plugin-manifest.md) — 플러그인의 `io`가 Type Pack 타입을 참조하는 방식.
- [Security](security.md) — 시크릿이 그래프 프로퍼티가 되지 않는 이유.
- [Distribution](distribution.md) — 공유 `git`/`zip`/`inline` 블록.
- 카탈로그: [6개의 참조 팩](../guide/typepacks.md) — Infrastructure, Threat, Identity, Financial, Endpoint, Geospatial.
