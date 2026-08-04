# Type Pack 작업하기

**Type Pack**은 그래프가 보유할 수 있는 엔티티 종류(IP 주소, 도메인, 멀웨어 패밀리,
위협 행위자 등)를 정의하는 작은 JSON 번들입니다. 활성화하면 노드를 생성할 때 해당
유형을 사용할 수 있고, 캔버스에 각 노드가 어떻게 보일지 알려줍니다.

## Type Pack이 제공하는 것

Type Pack은 **엔티티(노드) 유형**과 선택적으로 **엣지(관계) 유형**을 선언합니다.
각 엔티티 유형은 다음을 포함합니다:

- **`label_property`** — 캔버스에서 노드 이름으로 표시되는 속성 값. IP 주소의 경우
  주소 자체, 취약점의 경우 CVE ID입니다.
- **속성** 세트 — 입력할 수 있는 명명된 필드(예: `country_code`, `asn`, `registrar`).
  노드 선택 시 속성 패널에 나타납니다.
- **`icon`** 및 **`color`** — 노드가 캔버스와 유형 및 속성 패널에서 렌더링되는 방식을
  결정하는 시각적 요소.

## Type Pack 활성화하기

다른 항목을 설치하는 것과 동일한 방식으로 Type Pack을 설치하고 활성화합니다
([설치하기](installing.md) 참조). 활성화되면 해당 유형이 **유형** 패널에 나타나고
노드 생성 시 선택 가능해집니다. 최소 하나의 Type Pack이 활성화될 때까지 선택할 수
있는 엔티티 유형이 없습니다.

노드를 생성할 때 활성화된 Type Pack에서 유형을 선택합니다. Vineyard는 해당 선택을
`category.name` 형식의 **정규화된 문자열**로 저장합니다 — 예:
`infrastructure.ip_address` 또는 `threat.malware`. 플러그인은 자신이 소비하고 생성하는
것을 선언할 때 동일한 형식을 참조합니다.

## 레퍼런스 팩

Vineyard는 여러 공식 Type Pack을 제공합니다. 각각은 독립적입니다 — 조사에 필요한
것만 설치하세요 — 그리고 함께 사용하도록 설계되어 있으며, 한 팩에서 다른 팩으로
교차하는 엣지 유형이 있습니다(`threat.malware`가 `infrastructure.ip_address`와
**통신하는**, `financial.crypto_address`가 `identity.person`에 의해 **제어되는** 등).

| 팩 (`identifier`) | 카테고리 | 유형 | 모델링 대상 |
|---|---|---|---|
| **Infrastructure** (`…typepacks.infrastructure`) | `infrastructure`, `web` | 10 | 정찰 중 매핑하는 네트워크, 그리고 그 위에서 관측되는 웹 리소스(URL) |
| **Threat** (`…typepacks.threat`) | `threat` | 9 | 위협 인텔리전스 (STIX 정렬) |
| **Identity** (`…typepacks.identity`) | `identity` | 5 | 사람, 조직, 온라인 페르소나 |
| **Financial** (`…typepacks.financial`) | `financial` | 4 | 자금 흐름 |
| **Endpoint** (`…typepacks.endpoint`) | `endpoint` | 6 | 호스트 / DFIR 아티팩트 |
| **Geospatial** (`…typepacks.geo`) | `geo` | 3 | 장소와 물리적 맥락 |

### Infrastructure — 자세히 보기

`run.vineyard.typepacks.infrastructure`는 정찰 중 매핑하는 네트워크 측 엔티티를
`infrastructure` 카테고리로 모델링합니다:

| 유형 (`category.name`) | 표시 라벨 | 주요 속성 |
|---|---|---|
| `infrastructure.ip_address` | IP 주소 | `version`, `country_code`, `asn`, `reverse_dns` |
| `infrastructure.domain` | 도메인 이름 | `registrar`, `created_date`, `name_servers` |
| `infrastructure.host` | 호스트 이름 | `ip_address`, `operating_system`, `open_ports` |
| `infrastructure.autonomous_system` | ASN | `autonomous_system_name`, `registry` |
| `infrastructure.netblock` | CIDR | `network_name`, `asn` |
| `infrastructure.dns_record` | 레코드 이름 | `record_type`, `record_value`, `ttl` |
| `infrastructure.whois_record` | 주체 (도메인/IP) | `registrant`, `registrar`, `created_at` |
| `infrastructure.certificate` | SHA-256 지문 | `subject_common_name`, `issuer`, `not_after` |
| `infrastructure.technologies` | 기술 이름 | `kind`, `vendor`, `version`, `cpe` |

같은 팩이 별도의 `web` 카테고리로 유형 하나를 더 제공합니다 — 리소스 로케이터는
관측된 웹 아티팩트(페이지 제목, HTTP 상태, 리다이렉트 후 최종 URL)이지 네트워크
substrate가 아니므로, 별도 설치 없이 같은 팩 안에서 카테고리만 분리됩니다:

| 유형 (`category.name`) | 표시 라벨 | 주요 속성 |
|---|---|---|
| `web.url` | URL | `domain` (→ `infrastructure.domain`), `http_status` |

엣지 유형이 두 카테고리를 가로질러 정찰 그래프를 연결합니다: `resolves_to`,
`has_address`, `announced_by`, `contains`, `has_record`, `subdomain_of`, `has_domain`,
`redirects_to`, `has_whois`, `presents_certificate`, 그리고 `runs_technology`(호스트, IP,
도메인, URL을 그것이 실행하거나 제공받는 소프트웨어, 하드웨어, 또는 서드파티 서비스 —
예: Cloudflare — 에 연결). 각 유형은 자체 아이콘과 색상을 가지므로, `ip_address`,
`domain`, `certificate`가 한눈에 구분됩니다.

다른 팩도 같은 형태를 따릅니다 — 예를 들어 **Threat** 팩은 `threat.malware`,
`threat.threat_actor`, `threat.indicator`, `threat.operation`(캠페인 내의 경계된 작업 —
하나의 캠페인은 여러 개의 operation을 포함할 수 있음)을, **Identity** 팩은 활동 뒤의
사람과 페르소나를 추가합니다.

!!! tip "Type Pack 혼합하기"
    필요한 만큼 Type Pack을 활성화하세요 — 하나의 정규화된 유형 네임스페이스를
    공유하며 설계상 상호 연결됩니다. `threat.malware`를 그것이 비콘하는
    `infrastructure.ip_address`에 연결하고, `threat.campaign`을
    `identity.organization`에 귀속시키고, 몸값 `financial.crypto_transaction`을
    추적할 수 있습니다.

!!! note "신원 및 중복 제거"
    플러그인이나 AI 작업이 노드를 추가할 때, Vineyard는 **유형 + `label_property` 값**으로
    중복을 제거합니다 — 같은 유형과 같은 라벨의 두 노드는 병합되고 속성이 결합됩니다.
    유형은 **정확한 정규화 키**(`category.name`)로만 일치하며, 설치된 팩에 정의되지 않은
    유형의 노드는 원래 유형 문자열을 유지합니다 — 따라서 새 팩 버전에서 유형이 다른
    카테고리로 이동해도 기존 노드가 새 유형의 생성물과 병합되지 않습니다. 가장 유용한
    라벨은 읽기 쉽고 *식별적인* 것입니다. 대부분의 유형은 자연적으로
    고유한 필드(IP, CVE ID, 트랜잭션 해시, WHOIS 주체)를 키로 사용합니다. 라벨이
    본질적으로 고유하지 않은 유형(`identity.person`의 이름, `endpoint.process`의 이미지
    이름)은 같은 라벨을 공유하는 서로 다른 엔티티가 병합되므로, 구분되는 라벨
    (예: `John Smith (DOB 1990)`)을 주거나 유형이 제공하는 안정 ID를 채우세요.
    **수동으로** 추가한 노드는 절대 자동 병합되지 않습니다.

## 버전

Type Pack은 시맨틱 버저닝을 사용합니다. **MAJOR 버전 증가는 유형 정의의 파괴적
변경**을 의미합니다 — 예: 유형 이름 변경 또는 제거 — 기존 유형을 사용하는 노드에
마이그레이션 과정이 필요할 수 있습니다. 마이너 및 패치 업데이트(새 선택적 속성,
시각적 조정)는 기존 노드를 깨지 않습니다.

## 다음 / 함께 보기

- [캔버스](canvas.md) — 유형화된 노드가 렌더링되고 연결되는 방식
- [플러그인 실행하기](running-plugins.md) — 플러그인은 Type Pack이 정의한 유형에 작용
- [Skill Pack](skillpacks.md) — 이러한 유형을 피벗하는 플레이북
