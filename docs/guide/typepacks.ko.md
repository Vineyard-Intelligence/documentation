# Type Pack 작업하기

**Type Pack**은 그래프가 보유할 수 있는 엔티티 종류(IP 주소, 도메인, 멀웨어 패밀리, 위협 행위자 등)를 정의하는 작은 JSON 번들입니다. 활성화하면 노드를 생성할 때 해당 유형을 사용할 수 있고, 캔버스에 각 노드가 어떻게 보일지 알려줍니다.

## Type Pack이 제공하는 것

Type Pack은 **엔티티(노드) 유형**과 선택적으로 **엣지(관계) 유형**을 선언합니다. 각 엔티티 유형은 다음을 포함합니다:

- **`label_property`** — 캔버스에서 노드 이름으로 표시되는 속성 값. IP 주소의 경우 주소 자체, 취약점의 경우 CVE ID입니다.
- **속성** 세트 — 입력할 수 있는 명명된 필드(예: `country_code`, `asn`, `registrar`). 노드 선택 시 속성 패널에 나타납니다.
- **`icon`** 및 **`color`** — 노드가 캔버스와 유형 및 속성 패널에서 렌더링되는 방식을 결정하는 시각적 요소. Type Pack 작성자가 설정하며, 아이콘/색상 규칙은 [Type Pack 작성하기](../develop/typepacks.md)를 참조하세요.

## Type Pack 활성화하기

다른 항목을 설치하는 것과 동일한 방식으로 Type Pack을 설치하고 활성화합니다([설치하기](installing.md) 참조). 활성화되면 해당 유형이 **유형** 패널에 나타나고 노드 생성 시 선택 가능해집니다. 최소 하나의 Type Pack이 활성화될 때까지 선택할 수 있는 엔티티 유형이 없습니다.

노드를 생성할 때 활성화된 Type Pack에서 유형을 선택합니다. Vineyard는 해당 선택을 `category.name` 형식의 **정규화된 문자열**로 저장합니다 — 예: `infrastructure.ip_address` 또는 `threat.malware`. 이 정규화된 문자열이 노드 유형의 표준 식별자이며, 플러그인은 자신이 소비하고 생성하는 것을 선언할 때 동일한 형식을 참조합니다.

## 레퍼런스 팩

Vineyard는 6개의 공식 Type Pack을 제공합니다. 각각은 독립적입니다 — 조사에 필요한
것만 설치하세요 — 그리고 함께 사용하도록 설계되어 있으며, 한 팩에서 다른 팩으로
교차하는 엣지 유형이 있습니다(`threat.malware`가 `infrastructure.ip_address`와
**통신하는**, `financial.crypto_address`가 `identity.person`에 의해 **제어되는**
등).

| 팩 (`identifier`) | 카테고리 | 유형 | 모델링 대상 |
|---|---|---|---|
| **Infrastructure** (`…typepacks.infrastructure`) | `infrastructure` | 9 | 정찰 중 매핑하는 네트워크 |
| **Threat** (`…typepacks.threat`) | `threat` | 8 | 위협 인텔리전스 (STIX 정렬) |
| **Identity** (`…typepacks.identity`) | `identity` | 5 | 사람, 조직, 온라인 페르소나 |
| **Financial** (`…typepacks.financial`) | `financial` | 4 | 자금 추적 |
| **Endpoint** (`…typepacks.endpoint`) | `endpoint` | 6 | 호스트 / DFIR 아티팩트 |
| **Geospatial** (`…typepacks.geo`) | `geo` | 3 | 장소 및 물리적 맥락 |

### Infrastructure

`run.vineyard.typepacks.infrastructure`는 정찰 중 매핑하는 네트워크 측 엔티티를
모델링하며, 모두 `infrastructure` 카테고리에 속합니다:

| 유형 (`category.name`) | 표시 레이블 | 주요 속성 |
|---|---|---|
| `infrastructure.ip_address` | IP 주소 | `version`, `country_code`, `asn`, `reverse_dns` |
| `infrastructure.domain` | 도메인 이름 | `registrar`, `created_date`, `name_servers` |
| `infrastructure.url` | URL | `domain` (→ `infrastructure.domain`), `http_status` |
| `infrastructure.host` | 호스트명 | `ip_address`, `operating_system`, `open_ports` |
| `infrastructure.autonomous_system` | ASN | `autonomous_system_name`, `registry` |
| `infrastructure.netblock` | CIDR | `network_name`, `asn` |
| `infrastructure.dns_record` | 레코드 이름 | `record_type`, `record_value`, `ttl` |
| `infrastructure.whois_record` | 대상 (도메인/IP) | `registrant`, `registrar`, `created_at` |
| `infrastructure.certificate` | SHA-256 지문 | `subject_common_name`, `issuer`, `not_after` |

엣지 유형이 정찰 그래프를 연결합니다: `resolves_to`, `has_address`, `announced_by`,
`contains`, `has_record`, `subdomain_of`, `has_domain`, `redirects_to`, `has_whois`,
`presents_certificate`. 각 유형은 고유한 아이콘과 색상을 제공하므로, `ip_address`,
`domain`, `certificate`가 한눈에 시각적으로 구분됩니다.

### Threat

`run.vineyard.typepacks.threat`는 위협 인텔리전스 엔티티(STIX 2.1 개념에 정렬)를
다루며, 모두 `threat` 카테고리에 속합니다:

| 유형 (`category.name`) | 표시 레이블 | 주요 속성 |
|---|---|---|
| `threat.malware` | 멀웨어 이름 | `malware_type`, `platform`, `hash_sha256`, `first_seen` |
| `threat.campaign` | 캠페인 이름 | `status`, `objective`, `attribution`, `start_date` |
| `threat.threat_actor` | 행위자 이름 | `actor_type`, `motivation`, `sophistication`, `country` |
| `threat.vulnerability` | CVE ID | `cvss_score`, `severity`, `exploited_in_wild` |
| `threat.indicator` | 지표 값 | `indicator_type`, `confidence`, `valid_from` |
| `threat.attack_pattern` | 기법 이름 | `technique_id` (MITRE ATT&CK), `tactic` |
| `threat.tool` | 도구 이름 | `tool_type`, `aliases` |
| `threat.signature` | 규칙 이름 | `signature_type` (YARA / Sigma / …), `rule` |

이들은 `uses`, `attributed_to`, `targets`, `exploits`, `indicates`,
`variant_of`, `detects`, `communicates_with`, `refers_to`(추상 지표를 식별하는
구체적 유형 노드에 연결)를 통해 연결됩니다. 예를 들어, `threat.vulnerability`는
CVE 형식에 대해 `cve_id`를 검증하고 `shield-alert` 아이콘으로 그려지는 반면,
`threat.threat_actor`는 `venetian-mask` 아이콘으로 그려집니다.

### Identity

`run.vineyard.typepacks.identity`는 활동 뒤의 사람과 온라인 페르소나를 모델링하며,
모두 `identity` 카테고리에 속합니다:

| 유형 (`category.name`) | 표시 레이블 | 주요 속성 |
|---|---|---|
| `identity.person` | 전체 이름 | `aliases`, `nationality`, `occupation` |
| `identity.organization` | 조직 이름 | `org_type`, `country`, `industry`, `website` |
| `identity.email_address` | 이메일 | `domain`, `breached` |
| `identity.phone_number` | 전화번호 | `country_code`, `carrier`, `line_type` |
| `identity.user_account` | 사용자명 | `platform`, `profile_url`, `followers` |

관계에는 `owns`, `member_of`, `affiliated_with`, `controls`, 그리고 귀속 중
페르소나를 연결하기 위한 무방향 `same_as`가 포함됩니다.

### Financial

`run.vineyard.typepacks.financial`은 자금을 추적합니다. **공개 식별자만**
기록하며 — 개인 키, 전체 카드 번호, 자격 증명은 절대 기록하지 않습니다 —
`financial` 카테고리에 속합니다:

| 유형 (`category.name`) | 표시 레이블 | 주요 속성 |
|---|---|---|
| `financial.crypto_address` | 주소 | `currency`, `balance`, `owner_label` |
| `financial.crypto_transaction` | 트랜잭션 해시 | `currency`, `amount`, `fee`, `timestamp` |
| `financial.exchange` | 거래소 이름 | `country`, `kyc_level` |
| `financial.bank_account` | 계좌 식별자 | `bank_name`, `account_holder`, `country` |

엣지 유형 `transfers_to`, `input_to`, `output_to`, `hosted_at`, `controlled_by`로
자금 흐름을 재구성하고 제어 주체에 연결할 수 있습니다.

### Endpoint

`run.vineyard.typepacks.endpoint`는 호스트 수준의 포렌식(DFIR) 아티팩트를
캡처하여 머신에서 멀웨어 동작을 매핑할 수 있게 하며, 모두 `endpoint` 카테고리에
속합니다:

| 유형 (`category.name`) | 표시 레이블 | 주요 속성 |
|---|---|---|
| `endpoint.file` | 파일 이름 | `file_path`, `sha256`, `signed` |
| `endpoint.process` | 프로세스 이름 | `pid`, `parent_pid`, `command_line` |
| `endpoint.registry_key` | 키 경로 | `hive`, `value_name`, `value_data` |
| `endpoint.service` | 서비스 이름 | `binary_path`, `start_type`, `state` |
| `endpoint.mutex` | 뮤텍스 이름 | `created_by` |
| `endpoint.persistence` | 항목 이름 | `mechanism`, `trigger`, `action` |

동작 엣지 `spawned`, `executed`, `wrote`, `created_mutex`, `installed`,
`dropped`는 실행 체인을 재구성하며, `observed_on`은 모든 아티팩트를 관찰된
호스트(`infrastructure.host`)에 고정합니다.

### Geospatial

`run.vineyard.typepacks.geo`는 조사의 *위치*를 고정하며, `geo` 카테고리에
속합니다:

| 유형 (`category.name`) | 표시 레이블 | 주요 속성 |
|---|---|---|
| `geo.location` | 장소 이름 | `latitude`, `longitude`, `city`, `country` |
| `geo.address` | 형식화된 주소 | `street`, `postal_code`, `country` |
| `geo.facility` | 시설 이름 | `facility_type`, `operator` |

`located_at` 엣지는 **모든** 소스 유형(`from: ["*"]`)을 허용하므로, 사람,
호스트, 조직을 장소에 고정할 수 있습니다. `located_in`과 무방향 `near`는 장소 간의
관계를 연결합니다.

!!! tip "Type Pack 혼합하기"
    필요한 만큼 Type Pack을 활성화하세요 — 하나의 정규화된 유형 네임스페이스를
    공유하며 설계상 상호 연결됩니다. `threat.malware`를 비컨 대상인
    `infrastructure.ip_address`에 연결하고, `threat.campaign`을
    `identity.organization`에 귀속하고, 랜섬 `financial.crypto_transaction`을
    추적한 다음, [CIDR Expand](../develop/plugin-manifest.md)와 같은 플러그인을
    실행하여 주변 주소 공간을 열거할 수 있습니다.

!!! note "식별 및 중복 제거"
    플러그인 또는 AI 작업이 노드를 추가할 때, Vineyard는 **유형 + `label_property` 값**으로
    중복 제거합니다 — 동일한 유형과 동일한 레이블을 가진 두 노드는 병합되고 속성이
    결합됩니다. 따라서 가장 유용한 레이블은 읽을 수 있으면서 *식별 가능한* 것입니다.
    대부분의 유형은 자연스럽게 고유한 필드(IP, CVE ID, 트랜잭션 해시, WHOIS 대상)를
    키로 사용합니다. 유형의 레이블이 본질적으로 고유하지 않은 경우 —
    `identity.person`의 이름, `endpoint.process`의 이미지 이름 — 해당 레이블을 공유하는
    별개의 엔티티는 병합되므로, 구별되는 레이블(예: `John Smith (DOB 1990)`)을 부여하거나
    유형이 제공하는 안정적 ID(`endpoint.process.process_guid`, `endpoint.file.sha256`)를
    채우세요. **수동으로** 추가한 노드는 절대 자동 병합되지 않습니다.

## 버전 및 마이그레이션

Type Pack은 시맨틱 버전 관리를 사용합니다. **MAJOR 버전 증가는 유형 정의에 대한 중단 변경**을 의미합니다 — 예를 들어 유형 이름 변경이나 제거. 따라서 새 메이저 버전을 활성화하려면 이전 유형을 사용하는 노드에 대해 **마이그레이션 패스**가 필요하여 저장된 `category.name`이 유효하게 유지되도록 합니다. 마이너 및 패치 업데이트(새 선택적 속성, 시각적 조정)는 기존 노드를 중단하지 않습니다.

!!! note "유형 버전 고정은 미해결 이슈입니다"
    현재 플러그인의 입력/출력 레퍼런스는 특정 Type Pack 버전을 고정하지 않으므로, 메이저 Type Pack 변경이 해당 유형을 소비하는 플러그인에 영향을 줄 수 있습니다. 이는 추적 중인 설계 항목이며 출시된 동작이 아닙니다 — 현재 상태는 공식 [사양](../develop/index.md)을 참조하세요.

## 다음 / 함께 보기

- [Type Pack 작성하기](../develop/typepacks.md) — 자신만의 유형, 아이콘, 유효성 검사기, 엣지 유형 정의.
- [Type Pack 스키마](../reference/typepack-schema.md) — 전체 `vineyard:typepack` 형식 레퍼런스.
- [캔버스 작업하기](canvas.md) — 유형화된 노드의 렌더링 및 연결 방식.
- [플러그인 실행하기](running-plugins.md) — 플러그인은 Type Pack이 정의하는 유형에 작용합니다.
