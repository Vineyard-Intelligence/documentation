# Type Pack 사용하기

**Type Pack**은 그래프가 보유할 수 있는 엔티티 종류(IP 주소, 도메인, 멀웨어 패밀리,
위협 행위자 등)를 정의하는 작은 JSON 번들입니다. 프로젝트에 설치하면 노드를 생성할 때
해당 유형을 사용할 수 있고, 캔버스에 각 노드가 어떻게 보일지 알려줍니다.

## Type Pack이 제공하는 것

Type Pack은 **엔티티(노드) 유형**을 선언합니다. 엣지에는 유형이 없습니다: 각 엣지는
자유 텍스트 라벨을 가지며, 이 라벨은 사용자가 [엣지를 그릴 때](canvas.md#엣지-그리기)
입력하거나 연결을 찾아낸 플러그인이 씁니다. 각 엔티티 유형은 다음을 포함합니다:

- **`label_property`** — 캔버스에서 노드 이름으로 표시되는 속성 값. IP 주소의 경우
  주소 자체, 취약점의 경우 CVE ID입니다. 일부 유형은 대신 여러 속성을 조합한 라벨
  ([`label_template`](../develop/typepacks.md#entity-types))을 쓰며, 그 속성이 모두 채워지기
  전까지는 `label_property` 값을 표시합니다.
- **속성** 세트 — 입력할 수 있는 명명된 필드(예: `country_code`, `asn`, `registrar`).
  노드 선택 시 **Properties**(속성) 패널에 나타나며, 각 값은 담긴 값의 종류에 맞게 표시됩니다
  ([Properties 패널에서 값 읽기](#reading-values-in-the-properties-panel)). 속성을 편집하면 그 값이 유형이 선언한
  종류, 허용 값, 패턴이나 범위에 맞는지 검사합니다(예: `country_code`는 대문자 두 글자,
  `asn`은 1부터 4294967295까지의 정수여야 함). 검사를 통과하지 못한 값은 저장되지 않고,
  이유를 알리는 메시지가 표시됩니다.
- **`icon`** 및 **`color`** — 노드가 캔버스와 **Types**(유형) 및 **Properties** 패널에서 렌더링되는 방식을
  결정하는 시각적 요소.

## Type Pack 설치하기

다른 항목을 설치하는 것과 동일한 방식으로 Type Pack을 설치합니다([둘러보기 및 설치](installing.md)
참조). 설치되면 해당 유형이 **Types** 패널에 나타나고 노드 생성 시 선택 가능해집니다.
최소 하나의 Type Pack이 설치될 때까지 선택할 수 있는 엔티티 유형이 없습니다.

**Types** 패널에서 유형은 팩이 아니라 **카테고리**별로 묶이므로, 한 팩이 여러 그룹을 채울 수
있습니다(Infrastructure 팩은 **Infrastructure**와 **Web** 양쪽에 나타남). 각 그룹에는 개수가
표시됩니다. 유형에 마우스를 올리면 설명과 **Category:**, 그리고 출처인 **Type pack:**이
표시됩니다. 유형을 클릭하면 해당 유형의 새 노드(`New <유형>` 라벨의 자리표시자)가 생성되고
바로 선택되어 속성을 채울 수 있습니다. 유형 옆의 상자는 그 유형의 노드가 캔버스에 그려지는 동안
체크되어 있고, 체크를 해제하면 그 노드들을 숨깁니다([노드와 엣지 숨기기](canvas.md#숨기기) 참조).
위쪽의 **Search types…** 상자는 유형 이름, 카테고리,
설명, 팩 이름으로 목록을 거릅니다. 패널이 이 상자를 담기에 너무 좁으면 유형 아이콘만
표시됩니다. 설치된 Type Pack이 없으면 패널이 그렇게 알려 주고 **Browse the marketplace**
버튼을 제공합니다. 로그인하지 않고 공유된 프로젝트를 보는 방문자에게는 이 버튼이 표시되지 않습니다.

<figure class="vy-shot" markdown="span">
  ![ip_address 툴팁이 열린 Types 패널](../assets/guide/types-panel.webp){ width="410" loading=lazy }
  <figcaption>Types 패널은 유형을 카테고리별로 묶습니다. 유형에 마우스를 올리면 설명, 카테고리, 타입 팩이 표시됩니다.</figcaption>
</figure>

노드를 생성할 때 설치된 Type Pack에서 유형을 선택합니다. Vineyard는 해당 선택을
`category.name` 형식의 **정규화된 문자열**로 저장합니다 — 예:
`infrastructure.ip_address` 또는 `threat.malware`. 플러그인은 자신이 소비하고 생성하는
것을 선언할 때 동일한 형식을 참조합니다.

## 레퍼런스 팩

Vineyard는 여러 공식 Type Pack을 제공합니다. 각각은 독립적입니다 — 조사에 필요한
것만 설치하세요 — 그리고 함께 사용하도록 설계되어 있습니다: 엣지 하나가 서로 다른
팩의 노드를 연결할 수 있습니다(`threat.malware`가 `infrastructure.ip_address`와
**통신하는**, `cryptocurrency.crypto_address`가 `identity.person`에 의해 **제어되는** 등).

| 팩 (`identifier`) | 카테고리 | 유형 | 모델링 대상 |
|---|---|---|---|
| **Infrastructure** (`…typepacks.infrastructure`) | `infrastructure`, `web` | 15 | 정찰 중 매핑하는 네트워크, 그리고 그 위에서 관측되는 웹 리소스(URL), 웹 지문(헤더, 파비콘, DOM 해시), 트래킹 ID 엔티티 |
| **Threat** (`…typepacks.threat`) | `threat` | 10 | 위협 인텔리전스 (STIX 정렬) |
| **Identity** (`…typepacks.identity`) | `identity` | 7 | 사람, 조직, 온라인 페르소나 |
| **Financial** (`…typepacks.financial`) | `financial` | 4 | 거래소와 그 밖의 가상자산사업자, 은행 계좌, 옛 암호화폐 유형 두 개 |
| **Cryptocurrency** (`…typepacks.cryptocurrency`) | `cryptocurrency` | 4 | 모든 체인의 주소, 거래, 토큰, 자금을 맡지 않는 서비스. 네트워크로 식별 |
| **Endpoint** (`…typepacks.endpoint`) | `endpoint` | 6 | 호스트 / DFIR 아티팩트 |
| **Geospatial** (`…typepacks.geo`) | `geo` | 3 | 장소와 물리적 맥락 |
| **Social Media** (`…typepacks.social`) | `social` | 5 | 플랫폼에 무관한 계정, 게시물, 해시태그, 그룹, 미디어 |
| **Telegram** (`…typepacks.telegram`) | `telegram` | 4 | 가입 없이 수집한 계정, 채널, 슈퍼그룹, 게시물 |

### Financial — 은행 계좌

계좌번호는 은행 안에서만 유일하므로 `financial.bank_account`는 `bank_code`와
`account_identifier`를 함께 써서 식별합니다. 두 은행의 같은 번호는 두 노드이고, 라벨에 은행
이름이 붙습니다(`123456789012 · KB Kookmin`). 두 값 모두 공백과 하이픈 없이 씁니다.
`123-456-789012` 같은 값은 거부되고, 메시지가 어떤 형식으로 써야 하는지 알려 줍니다.
`bank_code`는 그 나라의 은행 코드가 있으면 그것(한국은 세 자리, 예: `004`, `088`, `090`),
없으면 SWIFT/BIC입니다. 은행 이름은 쓰지 않습니다. `KB`나 `SHINHAN` 같은 값은 거부됩니다. IBAN은
은행을 이미 담고 있으므로 비워 둡니다.

AI 에이전트는 은행 계좌를 식별하는 필드가 무엇인지와 은행 코드를 쓰는 형식을 안내받습니다.
그래도 은행 코드 없이 쓴 계좌는, 어느 은행의 계좌이든 은행 코드 없는 같은 번호의 다른 계좌와
한 노드가 됩니다. 에이전트가 만든 은행 계좌를 검토할 때 은행 코드가 들어 있는지 확인하세요.

신고된 계좌의 상태는 따로 적는 필드가 있습니다.

| 속성 | 기록하는 것 |
|---|---|
| `fraud_registration` | 사기이용계좌로 등록됨(`registered`), 확인했으나 등록되지 않음(`not_registered`), 등록 후 해제됨(`released`) |
| `payment_suspended_at` | 계좌의 지급정지 시각 |
| `report_channels` | 신고한 곳, 한 줄에 하나(112, 1332, 계좌 개설 은행…) |
| `status_checked_at`, `status_source` | 상태를 마지막으로 확인한 시각과 확인해 준 곳 |

`account_holder`는 명의인입니다. 명의인은 계좌를 실제로 쓴 사람이 아닌 경우가 많습니다.
계좌를 운용한 사람은 `identity.person`으로 만들고 엣지로 잇습니다. AI 에이전트는 은행 계좌의
속성도 다른 노드와 똑같이 읽으므로, 에이전트가 노드를 읽으면 계좌번호와 명의인 이름이 AI
제공자로 갑니다. 사건에 이름이 필요하지 않으면 `account_holder`를 비워 두세요.

Financial 2.0.0 이전에 만든 은행 계좌에는 은행 코드가 없어서, 같은 계좌를 새로 쓰면 다른 노드가
됩니다. 옛 노드에 은행 코드를 넣고 번호의 하이픈을 지우면 그 계좌의 이후 쓰기는 그 노드로
들어옵니다. 이미 따로 생긴 노드는 그대로 남습니다. 번호에 하이픈이 있는 옛 계좌에도 에이전트는
상태를 적을 수 있습니다. 편집은 바꾸는 값만 검사하기 때문입니다.

### Infrastructure — 자세히 보기

`run.vineyard.typepacks.infrastructure`는 정찰 중 매핑하는 네트워크 측 엔티티를
`infrastructure` 카테고리로 모델링합니다:

| 유형 (`category.name`) | 표시 라벨 | 주요 속성 |
|---|---|---|
| `infrastructure.ip_address` | IP 주소 | `version`, `country_code`, `asn`, `reverse_dns` |
| `infrastructure.domain` | 도메인 이름 | `registrar`, `created_date`, `name_servers` |
| `infrastructure.host` | 호스트 이름 | `operating_system`, `open_ports`, `hosting_provider` |
| `infrastructure.autonomous_system` | ASN | `autonomous_system_name`, `registry` |
| `infrastructure.netblock` | CIDR | `network_name`, `asn` |
| `infrastructure.dns_record` | 이름, 유형, 값 (예: `www.example.com A 93.184.216.34`). 유형과 값이 채워지기 전에는 레코드 이름 | `record_type`, `record_value`, `ttl` |
| `infrastructure.whois_record` | 주체 (도메인/IP) | `registrant`, `registrar`, `created_at` |
| `infrastructure.certificate` | SHA-256 지문 | `fingerprint_sha1`, `subject_common_name`, `issuer`, `not_after` |
| `infrastructure.ssh_host_key` | 키의 SHA-256 (16진수) | `key_type` |
| `infrastructure.technologies` | 기술 이름 | `kind`, `vendor`, `version`, `cpe` |

같은 팩이 별도의 `web` 카테고리로 유형 다섯 개를 더 제공합니다:

| 유형 (`category.name`) | 표시 라벨 | 주요 속성 |
|---|---|---|
| `web.url` | URL | `domain` (일반 텍스트로 적은 호스트 이름. 도메인 노드와는 엣지로 연결), `http_status` |
| `web.hhhash` | HTTP 헤더 해시 | `header_count`, `server_hint` |
| `web.favicon_hash` | Shodan 방식 MMH3 해시 (부호 있는 10진수) | `mmh3_hex`, `md5`, `sha256`, `phash`, `dhash`, `favicon_url` |
| `web.dom_hash` | DOM 구조 해시 | `tag_count` |
| `web.tracking_id` | 페이지에 적힌 그대로의 식별자 (예: `G-SXM8TFRYSW`), 동일성은 `provider` + `value` | `provider`, `kind` |

`web.favicon_hash`는 파비콘 하나를 검색 서비스들이 색인하는 형식별로 모두 담습니다. Shodan·FOFA·
Censys·ZoomEye는 `hash_value`, Criminal IP는 `mmh3_hex`, Censys·ZoomEye·360 Quake·Hunter.how·
ONYPHE·VirusTotal은 `md5`, Censys·Netlas·urlscan.io는 `sha256`으로 찾고, `phash`와 `dhash`는
비트가 몇 개 다른지로 비교하는 지각 해시입니다. AI 에이전트는 `similar_hashes`로 이 값을 비교하고,
**Shared-Attribute Clustering** 팩은 `phash`나 `dhash`가 64비트 중 10비트 이하로 다른 파비콘을
`similar favicon` 엣지로 잇습니다(실행할 때 바꿀 수 있음). 빈 아이콘이나 한 가지 색 아이콘은 색과
관계없이 해시가 같고, 대칭인 로고의 `phash`는 그 값과 몇 비트밖에 다르지 않으므로, 둘 다 그 값과
같거나 가까운 해시는 비교하지 않습니다. 그 파비콘의 다른 해시는 그대로 비교합니다.

`infrastructure.certificate`는 SHA-256으로 식별합니다. 출처가 SHA-1도 알려 주면(Shodan, Censys,
VirusTotal) `fingerprint_sha1`에 함께 담습니다. abuse.ch SSLBL 같은 차단 목록은 인증서를 SHA-1로만
적고, SHA-1은 SHA-256에서 계산할 수 없기 때문입니다.

`infrastructure.domain`은 Infrastructure 4.3.0부터 `.한국`(`xn--3e0b707e`)이나 `.рф`(`xn--p1ai`)
같은 국제화 최상위 도메인 아래의 이름도 받습니다. 유니코드(`사이트.한국`)로 적어도, 퓨니코드
(`xn--vf4b27jhrk.xn--3e0b707e`)로 적어도 같은 도메인입니다. 4.3.1부터는 이름의 나머지 부분처럼
퓨니코드 접두사도 대문자로 적을 수 있습니다(`EXAMPLE.XN--P1AI`). AI 에이전트의
`extract_indicators`는 텍스트에서 읽은 이름을 퓨니코드로 적습니다. 이전 버전의 프로젝트는 팩을
업데이트하기 전까지(마켓플레이스에서 카드의 **Update**) 이런 이름을 거부합니다.

각 유형은 자체 아이콘과 색상을 제공합니다.

### Endpoint — 호스트 아티팩트

`run.vineyard.typepacks.endpoint`는 침해 사고 대응자가 단말에서 찾은 것을 담습니다. 이 팩은
**Host Artifacts** 플러그인 팩이 이미 가진 내보내기로 채웁니다. 그 팩의 **Process Activity
Import** 플러그인은 **Run plugins** 패널에서 고른 파일(JSON, JSON lines, CSV, Windows 이벤트
XML. 기기 안에서 파싱)에서 Sysmon 이벤트 1·3·22나 ECS 프로세스·네트워크·DNS 이벤트를 읽고,
다음 링크를 그립니다:

| From → to | 라벨 | 엣지 데이터 |
|---|---|---|
| `endpoint.process` → `endpoint.process` | `spawned` | 없음 |
| `endpoint.process` → `endpoint.file` | `executed from` | 없음 |
| `endpoint.process` → `infrastructure.ip_address` | `connected to`. 모든 연결이 인바운드였으면 `accepted connection from` | `source`, `events`, `direction`, `first_seen`, `last_seen`, `ports`, `port_count`, `protocols`, `remote_hostnames` |
| `endpoint.process` → `infrastructure.domain` | `queried` | `source`, `events`, `first_seen`, `last_seen`, `answers`, `failed_events`, `statuses` |

프로세스는 프로세스 GUID, 이미지 이름, PID로 식별되므로 Sysmon `ProcessGuid`나 ECS
`process.entity_id`가 없는 레코드는 건너뜁니다. 이것이 없으면 두 호스트의 같은 이름·PID가 노드
하나가 됩니다. 프로세스 유형에는 호스트 필드가 없어서, 플러그인은 컴퓨터 이름을 별도 필드
`hostname`에 적고 **Properties** 패널이 이를 보여 줍니다. 한 프로세스와 한 목적지 사이의 이벤트는
모두 링크 하나가 되고, 그 `events`는 레코드 수가 아니라 연결이나 질의의 수입니다. Elastic
Defend는 연결이 열릴 때와 닫힐 때 한 번씩 기록하지만 이벤트는 하나입니다. 새 링크는 처음
가져올 때부터 이 요약을 담습니다. 나중의 내보내기를 가져오면 그 요약은 더해지지 않고 바뀌며,
나중의 내보내기에 값이 없는 키는 비워집니다. 검토 목록에는 요약이 바뀐 링크만 나오므로, 같은
내보내기를 다시 가져오면 아무것도 스테이징되지 않습니다. 프로젝트에 이미 있는 링크는 직접
바꾼 라벨을 포함해 라벨을 그대로 두고 요약만 씁니다. 라벨을 바꾼 `spawned`나 `executed from`
링크는 건드리지 않습니다. 노드 하나에 담을 수 없을 만큼 긴 명령줄(Linux는 수 MB의 인자를
허용)은 앞부분만 남기고 자르며, 노드의 `command_line_truncated`와 `command_line_length`에 그
사실을 적습니다. 루프백과 링크 로컬 트래픽은 가져오지 않고, 사설망 주소와 내부 이름은 그
옵션을 켰을 때만 가져옵니다.

!!! warning "서버에 남는 호스트 데이터"
    호스트 이름, 사용자 이름, 명령줄은 노드 필드가 됩니다. Vineyard 서버의 프로젝트에서는 그
    서버에 저장됩니다. 호스트 데이터가 이 컴퓨터 밖으로 나가면 안 되는 사건이라면 데스크탑 앱의
    로컬 모드를 쓰세요([로그인 모드와 로컬 모드](modes.md)).

다른 팩도 같은 형태를 따릅니다 — 예를 들어 **Threat** 팩은 `threat.malware`,
`threat.threat_actor`, `threat.indicator`, `threat.operation`(캠페인 내의 경계된 작업 —
하나의 캠페인은 여러 개의 operation을 포함할 수 있음)을, **Identity** 팩은 활동 뒤의
사람과 페르소나를 추가합니다.

### Cryptocurrency — 자세히 보기

`run.vineyard.typepacks.cryptocurrency`는 `cryptocurrency` 카테고리의 유형 한 벌로 모든 체인을
다루고, 어느 체인인지는 `network`로 나타냅니다. 같은 문자열도 네트워크가 다르면 다른 계정이므로
(Bitcoin과 Bitcoin Cash의 `1…` 주소, Ethereum과 BSC의 같은 `0x…` 주소) `network`는 식별 값의
일부이고, 그런 두 노드는 병합되지 않습니다.

| 유형 (`category.name`) | 표시 라벨 | 식별 | 주요 속성 |
|---|---|---|---|
| `cryptocurrency.crypto_address` | 주소와 네트워크 | `network` + `address` + `memo` | `address_kind`, `balance`, `first_funder`, `public_label`, `sanctioned` |
| `cryptocurrency.crypto_transaction` | 해시와 네트워크 | `network` + `tx_hash` | `block_height`, `block_time`, `status`, `fee` |
| `cryptocurrency.crypto_token` | 심볼과 네트워크 | `network` + `contract_address` | `standard`, `decimals`, `issuer` |
| `cryptocurrency.crypto_service` | 이름 | `name` | `service_type` (mixer, bridge, gambling, merchant, defi) |

- **대소문자.** hex, bech32, CashAddr, TON raw 값은 대소문자와 관계없이 일치합니다. 그래서 EIP-55
  체크섬 표기 주소와 소문자 표기는 한 노드이고, hex 64자 해시는 `0x` 유무와 관계없이 일치합니다.
  Base58 값(비트코인 레거시, TRON, Solana, Monero, XRPL)은 적힌 그대로 비교합니다.
- **`evm`과 `unknown`**은 아직 정해지지 않은 네트워크입니다. 출처가 체인을 말하지 않은 `0x…`
  주소, 그리고 출처도 형식도 네트워크를 정하지 못한 그 밖의 주소입니다. 이 노드는 따로 남고,
  네트워크가 정해지면 `evm`·`unknown` 노드에서 그 네트워크의 노드로 `same address on`을 긋습니다.
- **거래소**와 고객 자금을 맡는 그 밖의 서비스(OTC 데스크, 수탁형 지갑, 결제대행)는
  `financial.exchange`입니다. `crypto_service`는 자금을 맡지 않는 서비스에 씁니다.
- **금액**(`balance`, `fee`)은 네트워크 기본 단위의 10진 문자열입니다. 정밀도는 그대로지만 숫자로
  정렬되지 않습니다.
- **Financial 팩의** `crypto_address`와 `crypto_transaction`은 기존 노드를 위해 남아 있고
  "(legacy)"로 표시됩니다. 새 유형과 병합되지 않습니다. 두 팩을 함께 설치하면 짧은 이름
  `crypto_address`는 Cryptocurrency 팩의 유형을 가리킵니다.

`network` 값 대부분에는 다른 도구와 주고받는 CAIP-2 체인 ID가 있습니다. 초안이나 제안 단계인 것도
있고, 등재된 ID가 없는 것도 몇 있습니다. 이 ID는 식별 값에 들어가지 않으므로, 나중에 고쳐도 노드가
갈라지지 않습니다.
{#crypto-networks}

| `network` | CAIP-2 |
|---|---|
| `bitcoin` | `bip122:000000000019d6689c085ae165831e93` |
| `bitcoin_cash` | `bip122:000000000000000000651ef99cb9fcbe` |
| `bitcoin_sv` | `bsv:mainnet` (초안) |
| `bitcoin_gold` | 미등재 |
| `litecoin` | `bip122:12a765e31ffd4059bada1e25190f6e98` |
| `dogecoin` | `bip122:1a91e3dace36e2be3bf030a65679fe82` |
| `dash` | 미등재 |
| `zcash` | 미등재 |
| `monero` | `monero:418015bb9ae982a1975da7d79277c270` (초안) |
| `verge` | 미등재 |
| `ethereum` | `eip155:1` |
| `ethereum_classic` | `eip155:61` |
| `bsc` | `eip155:56` |
| `polygon` | `eip155:137` |
| `arbitrum` | `eip155:42161` |
| `optimism` | `eip155:10` |
| `base` | `eip155:8453` |
| `avalanche_c` | `eip155:43114` |
| `evm` | 없음 (체인 미정) |
| `tron` | `tron:728126428` |
| `solana` | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` |
| `xrpl` | `xrpl:0` |
| `ton` | `tvm:-239` |
| `cardano` | 제안: `cardano:1-764824073` |
| `bnb_beacon` | `cosmos:Binance-Chain-Tigris` (초안) |
| `unknown` | 없음 (네트워크 미정) |

엣지에는 유형이 없으므로, Cryptocurrency 팩은 수집기가 쓸 라벨과 데이터 키를 정해 둡니다. 두 노드
사이의 링크는 하나뿐입니다. 수집기는 이미 있는 링크의 라벨을 바꾸지 않고 데이터 키를 더하며, 출처가
다른 수치는 각자의 키에 둡니다.

| 시작 → 끝 | 라벨 | 데이터 |
|---|---|---|
| 주소 → 주소 | `sent to` | `network`, 출처별 `summary_<출처>`(`asset`, `symbol`, `count`, `total`, `first`, `last`, `window_from`, `window_to`, `complete`), 최근 20건 `recent`(`tx_hash`, `asset`, `amount`, `time`), `first_funding`, `deployment` |
| 주소 → 주소 | `deployed` | `deployment`(`tx_hash`). 그 쌍에 링크가 아직 없을 때 |
| 주소 → 거래 | `input to` | `amount`, `inputs`(`index`, `amount`, `prev_txid`, `prev_vout`) |
| 거래 → 주소 | `output to` | `amount`, `outputs`(`index`, `amount`) |
| 계약 주소 → 토큰 | `token contract` | — |
| 주소 → 거래소, 서비스, 조직 | `attributed to` | 출처별 `attribution_<출처>`(`label`, `label_kind`: verified, prediction, public_tag, `as_of`) |
| `evm`·`unknown` 주소 → 주소 | `same address on` | 네트워크를 정한 근거. 계약이면 같은 소유자라는 뜻이 아님 |
| 사람·조직 → 주소 | `listed address` | `list`(예: OFAC SDN), `uid`, `program`, `as_of` |
| URL·도메인 → 주소 | `accepts payment to` | 결제 주소를 찾은 곳 |
| 옛 `financial.crypto_address`, 결제용 `web.tracking_id` → 주소 | `same as` | 같다고 본 근거 |

!!! tip "Type Pack 혼합하기"
    필요한 만큼 Type Pack을 설치하세요 — 하나의 정규화된 유형 네임스페이스를
    공유하며 설계상 상호 연결됩니다. `threat.malware`를 그것이 비콘하는
    `infrastructure.ip_address`에 연결하고, `threat.campaign`을
    `identity.organization`에 귀속시키고, 몸값 `cryptocurrency.crypto_transaction`을
    추적할 수 있습니다.

!!! note "신원 및 중복 제거"
    플러그인이나 AI 작업이 노드를 추가할 때, Vineyard는 **유형 + 유형의 식별 필드**로
    중복을 제거합니다 — 유형이 `identity_properties`를 선언하면 그 필드들(예:
    `identity.account` → username + platform, `endpoint.file` → SHA-256·파일 이름·경로·호스트,
    `endpoint.process` → 프로세스 GUID·이름·PID, `financial.bank_account` → 은행 코드·계좌번호),
    아니면 `label_property` 값입니다. 같은
    유형과 같은 식별 값의 두 노드는 병합되고 속성이 결합됩니다. 팩이 대소문자 무시로 표시한
    필드(도메인, 호스트 이름, 이메일, 핸들 등)는 대소문자와 관계없이 일치합니다. 암호화폐
    주소와 거래 해시는 hex·bech32 표기의 대소문자와 관계없이 일치하지만, Base58 주소는 적힌
    그대로 비교하고 네트워크도 식별 값의 일부입니다. Infrastructure 4.3.0부터 도메인·호스트·DNS
    레코드 이름은 끝의 점과 관계없이 퓨니코드 표기로, IP 주소는 표준 표기(IPv6는 RFC 5952 형식)로,
    URL은 스킴·호스트의 대소문자나 기본 포트, 퍼센트 인코딩을 어떻게 썼든 일치합니다. URL 경로의
    대소문자는 그대로 비교합니다. 노드는 이미 가진 표기를 유지합니다. 다른 표기로 같은 값을
    쓰면 다른 필드만 더해지고 식별 값은 그대로 남습니다. 따라서
    가장 유용한 라벨은 읽기 쉽고 *식별적인* 것입니다. 대부분의 유형은 자연적으로
    고유한 필드(IP, CVE ID, 트랜잭션 해시, WHOIS 주체)를 키로 사용합니다. 라벨이
    본질적으로 고유하지 않은 유형(`identity.person`의 이름, `identity.organization`의
    이름)은 같은 라벨을 공유하는 서로 다른 엔티티가 병합되므로, 구분되는 라벨
    (예: `John Smith (DOB 1990)`)을 주세요. 이 두 유형은 라벨만으로 식별되므로 생년월일이나
    등록번호 같은 다른 속성을 채워도 서로 구분되지 않습니다. 전화번호는 적힌 그대로
    식별하므로 `+82 10-1234-5678`과 `010-1234-5678`은 서로 다른 `identity.phone_number`
    노드입니다. **Phone Numbers** 플러그인팩이 둘이 공유하는 E.164 표기를
    `e164`에 쓰고(Identity 2.4.0 이상), `region`과 번호 대역으로 추정한 `line_type`도
    채웁니다. 라벨은 바꾸지 않습니다. `e164`가 같은 노드는 중복으로 찾아집니다(Identity 2.5.0
    이상). **수동으로** 추가한 노드는 절대 자동 병합되지 않습니다. 같은 엔터티인데 프로젝트에
    이미 두 노드로 있는 것은 AI 에이전트의 `find_duplicates`와 `merge_nodes`가 검토를 거쳐 찾아
    합치거나([중복과 병합](tasks.md#duplicates-and-merging) 참고), 직접 합칩니다([노드 병합](canvas.md#merging-nodes)
    참고).

## Properties 패널에서 값 읽기 {#reading-values-in-the-properties-panel}

**Properties** 패널은 값을 선언된 유형만이 아니라 값이 무엇인지에 따라 보여 줍니다. URL은
호스트를 강조하고, 해시는 줄여서 알고리즘을 옆에 적고, 텍스트 필드 하나에 담긴 목록은 항목으로
나눠 보여 줍니다. 바뀌는 것은 표시 방법뿐입니다. 저장된 값은 사용자가 편집하기 전까지 그대로입니다.

값 끝의 화살표(**›**)를 누르면 그 행 아래에 값 전체를 보는 보기가 열립니다.

| 값 | 그리드 | 행 아래 보기 |
|---|---|---|
| 긴 텍스트(`description`, `bio`, 게시글) | 첫 줄과 나머지 줄 수(`+3 lines`). | 줄바꿈을 지킨 전체 텍스트, **Find**와 **Copy**. |
| 텍스트 필드 하나에 담긴 목록(`name_servers`, `open_ports`, `user_ids`, `tags`) | 앞쪽 항목을 칩으로, 항목 수와 함께. | 한 행에 한 항목, URL이면 그 호스트. **Copy, one per line**, **Copy defanged**, **Edit as text**. |
| URL | 저장된 그대로의 URL, 호스트는 강조. 브라우저가 읽지 못하는 URL에는 `unreadable`, 호스트 앞에 사용자 이름이나 비밀번호가 있으면 `credentials` 배지가 붙습니다. | scheme, 호스트(퓨니코드면 유니코드 형태도), 포트, 경로, 디코딩한 쿼리 파라미터 하나하나, fragment. **Defanged**를 켜면 그리드에서도 `hxxps://example[.]com`처럼 보입니다. 같은 호스트를 가진 다른 노드. |
| 해시 | 앞 8자와 뒤 8자, 그리고 속성 이름이나 길이로 읽은 알고리즘(`MD5`, `SHA-1`, `SHA-256`, `mmh3`, `ssdeep`, `TLSH`…). 알고리즘은 라벨일 뿐이며 아무것도 계산하지 않습니다. | 전체 해시, **Copy**, 대문자로 적힌 16진 해시에는 **Lower case**, 같은 값을 가진 다른 노드. |
| IP 주소나 CIDR 블록 | 값, `v4` 또는 `v6`, 그리고 `private`, `loopback`, `documentation` 같은 특수 용도 대역. 호스트 주소로 적은 블록에는 `host bits set`이 붙습니다. | 주소의 표준 표기, 또는 블록의 네트워크, 넷마스크, 첫 주소와 끝 주소, 크기. 같은 /24(IPv6는 /64)에 있거나 블록 안의 주소를 가진 다른 노드. |
| 이메일 주소 | 도메인 강조. | local part, `+` 뒤의 태그, 도메인(유니코드 형태도). |
| 크기, 개수, 금액(`size_bytes`, `*_count`, `followers`, `balance`) | 천 단위 구분. 크기는 KiB, MiB, GiB로도, 금액은 노드의 통화와 함께. | — |
| 코드: 탐지 규칙, armored 키, 원본 레코드, 명령행 | 고정폭 글꼴로 첫 줄. | 줄 번호, YARA, Sigma, PGP armor, WHOIS 강조(8,000자까지), **Find**, **Wrap**, **Copy**, **Download**, 그리고 **Save**를 눌러야 저장되는 코드 편집기 **Edit**. |
| 암호화폐 주소 | 주소 형식이 속한 체인과 체크섬 결과(EIP-55, Base58Check, Bech32, Bech32m). Solana 주소와 모두 소문자인 EVM 주소에는 체크섬이 없고, Monero의 체크섬은 검사하지 않습니다. 체크섬은 맞지만 버전 바이트가 Vineyard가 아는 체인이 아닌 Base58Check 주소(Bitcoin Gold, Dash)는 체인 없이 `checksum ok`로 표시합니다. | 형식, 체인, 노드의 currency나 network 필드가 말하는 값, 블록 탐색기 링크. 링크는 노드가 지정한 네트워크의 탐색기이고, 노드에 네트워크가 없으면 주소 형식이 속한 체인의 탐색기입니다. 탐색기 서버가 사용자의 IP 주소, 시각, 조회한 주소를 알게 되므로 링크는 열기 전에 확인을 받습니다. |
| JSON | 지금처럼 한 줄과 편집용 **{ }**. | 트리: 접고 펴기, 키를 눌러 경로 복사(`rdap.events[0].action`), **Find**, 들여쓴 JSON을 보는 **Raw**. |

레거시 Bitcoin 주소는 Bitcoin Cash와 Bitcoin SV에서도 같은 문자열이고, EVM 주소는 모든 EVM 체인에서
같은 문자열이지만 체인마다 다른 계정입니다. 그래서 노드가 주소 형식과 다른 네트워크를 지정했거나,
Vineyard에 탐색기가 없는 네트워크(Ethereum Classic, Bitcoin Gold, Dash 등)를 지정했거나, 여러 체인이
같이 쓰는 주소에 `evm`이나 `unknown`만 적혀 있으면 탐색기 링크를 제공하지 않습니다. 그 이유는 행 아래
보기에 적힙니다.

날짜, 시각, 선택지, 참/거짓 값, 색은 지금처럼 보입니다. 시간대가 없는 날짜·시각, EXIF 시각
(`2021:12:14 11:58:18`), epoch 숫자는 시각으로 해석하지 않고 저장된 그대로 보여 줍니다.

값의 종류는 선언된 유형, 속성 이름, 값 자체로 판별하므로 흔치 않은 값에서는 틀릴 수 있습니다. 틀려도
바뀌는 것은 표시 방법과, 텍스트 필드 하나에 담긴 목록이라면 에이전트의 `aggregate_values`가 그 항목을 세는
방법뿐입니다. 다른 노드 목록은 노드 패널에만 있고 Review 대화상자에는 없습니다.

### 값 편집하기

- 값을 누르거나 **Tab**으로 옮겨 가면 편집할 수 있습니다. 긴 텍스트와 코드는 그 자리에서 커집니다.
- **Esc**는 저장된 값으로 되돌리고 입력칸을 나갑니다. 한 줄 입력칸에서는 **Enter**로 저장합니다. 긴
  텍스트와 코드에서는 **Enter**가 줄바꿈이고, **⌘Enter**(Mac)나 **Ctrl+Enter**로 저장합니다. 입력칸을
  나갈 때도 저장됩니다.
- 텍스트 필드 하나에 담긴 목록은 항목 단위로 편집합니다. 항목을 입력하고 **Enter**를 누르거나 **×**로
  지웁니다. 저장할 때는 값이 원래 쓰던 구분자(한 줄에 하나 또는 `, `)로 다시 이어 붙입니다. 항목을
  끝으로 옮기지 않고 그 자리에서 고치려면 행을 펼쳐 **Edit as text**를 누릅니다. 그러면 입력칸이
  저장된 텍스트 그대로가 됩니다. **Edit as entries**를 누르면 항목 편집으로 돌아갑니다.
- 입력하는 동안 입력칸은 처음 누른 그대로 유지됩니다. 지금까지 입력한 내용이 URL, 주소, 목록으로
  읽혀도 바뀌지 않고, 입력칸을 나가면 그 종류로 표시됩니다.
- URL, 이메일 주소, IP 주소, 해시, 암호화폐 주소를 편집하는 동안에는 입력칸 아래 줄에 값의 문제가
  표시됩니다. 유형의 규칙이나 실패한 체크섬입니다. 저장 여부는 유형의 규칙이 정합니다.
- *View only*로 표시된 패널에서도 값을 같은 방식으로 보고 펼칠 수 있지만 편집할 수는 없습니다.

## 버전

Type Pack은 시맨틱 버저닝을 사용합니다. **MAJOR 버전 증가는 유형 정의의 파괴적
변경**을 의미합니다 — 예: 유형 이름 변경 또는 제거 — 기존 유형을 사용하는 노드를
수정해야 할 수 있습니다. 마이너 및 패치 업데이트(새 선택적 속성,
시각적 조정)는 기존 노드를 깨지 않습니다.

## 다음 / 함께 보기

- [캔버스](canvas.md) — 유형화된 노드가 렌더링되고 연결되는 방식
- [플러그인 실행](running-plugins.md) — 플러그인은 Type Pack이 정의한 유형에 작용
- [Skill Pack 사용하기](skillpacks.md) — 이러한 유형을 피벗하는 플레이북
