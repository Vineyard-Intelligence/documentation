# 피싱 도메인에서 인프라까지

택배사 Kestrune Post를 사칭한 문자 메시지가 받는 사람을
`hxxps://kestrune-redelivery[.]example/redeliver`로 보냅니다. 손에 있는 것은 이 URL 하나입니다.
알고 싶은 것은 같은 운영자가 그 밖에 무엇을 운영하는지, 그래서 함께 차단하거나 내리게 할 수
있는지, 그리고 이 도메인이 서로 무관한 수천 개 사이트와 그저 공유하는 것은 무엇인지입니다. 여기
나오는 이름과 주소는 지어낸 것입니다([예시에 대해](index.md#about-the-examples)).

## 시작할 때 가진 것 {#what-you-start-with}

- 도메인 하나, `kestrune-redelivery.example`, 그리고 그 위의 URL.
- 메시지를 본 날짜를 안다면 그 날짜. 여기서는 2026-11-03입니다.

## 시작하기 전에 {#before-you-start}

**Project → Add from Marketplace…**에서 다음을 설치합니다.

| 팩 | 더해 주는 것 | 필요한 것 |
|---|---|---|
| **Infrastructure pivoting** (Skill Pack) | 이런 질문에 AI 에이전트가 따르는 플레이북 | 없음. 프로젝트에 있는 수집 플러그인으로 일합니다 |
| **Domain Recon** | DNS 레코드, RDAP 등록 정보, Certificate Transparency 하위 도메인 | 키 없음 |
| **IP Recon** | RDAP IP(넷블록과 조직), Shodan InternetDB(포트, 태그, 이름), IP Geolocation | 키 없음 |
| **IP to ASN (Team Cymru - DoH Based)** | 주소를 알리는 자율 시스템(AS) | 키 없음 |
| **CDN / WAF Detection (cdncheck)** | 주소나 이름이 CDN·WAF 앞단인지 | 키 없음 |
| **Shared-Attribute Clustering** | 이미 그래프에 있는 노드 가운데 등록 대행자, 네임서버, ASN, 인증서를 공유하거나 파비콘이 비슷한 노드를 잇습니다 | 키 없음. 그래프만 읽습니다 |
| **AlienVault OTX** | 패시브 DNS: 주소가 과거에 서비스한 이름과 그 시기 | 무료 OTX API 키 |
| **Web Recon**, **Ad Tags** | 페이지의 파비콘·헤더·DOM 해시와 마크업 속 추적 ID | 데스크탑 앱 |

이 플러그인들이 쓰는 Type Pack(Infrastructure, Threat, Geospatial, 그리고 Ad Tags가 쓰는 Identity와
Cryptocurrency)은 함께 설치됩니다.

요청이 가는 곳: Domain Recon, IP to ASN, CDN / WAF Detection은 공개 DNS-over-HTTPS 리졸버
(Cloudflare와 Google)에 묻고, RDAP는 rdap.org, Certificate Transparency는 crt.sh, InternetDB는
Shodan, Passive DNS는 AlienVault로 갑니다. 어느 것도 피싱 사이트에 접속하지 않습니다. Web Recon과
Ad Tags는 접속합니다. 내 컴퓨터에서 페이지를 요청하므로 그 서버가 내 주소와 시각을 봅니다. 그래서
여기서는 맨 끝에, 그래도 괜찮은 사건에서만 씁니다.

## 단계 {#steps}

### 1. 도메인을 캔버스에 올리기 {#seed}

**Types** 패널에서 **Domain**을 누릅니다. 새 노드가 선택되면 Properties 패널의 `domain_name`에
`kestrune-redelivery.example`을 입력하고 Enter를 누릅니다. 값은 리팡해서 씁니다. `[.]`와
`hxxps`는 보고서에 쓰는 표기이지 노드에 넣을 값이 아닙니다. 나중에 페이지 지문을 뜨려면(7단계)
같은 방법으로 `https://kestrune-redelivery.example/redeliver`의 **URL** 노드도 만듭니다.

신고서에 지표가 많으면 AI 에이전트 패널에 붙여 넣고 그래프에 올려 달라고 하세요. 에이전트는 디팡된
표기도 읽으며, 찾은 노드는 내 검토를 기다립니다.

### 2. 도메인 조회하기 {#resolve}

도메인을 우클릭하고 **Run plugins…**를 고릅니다(또는 선택하고 **R**). **DNS Lookup (A Record)**,
**DNS Lookup (AAAA Record)**, **DNS Lookup (NS Record)**, **DNS Lookup (MX Record)**, **RDAP
Domain**, **Certificate Transparency Subdomains**에 체크하고 **Run (6)**을 누릅니다.

플러그인마다 실행이 따로입니다. **Tasks**에 행이 여섯 개 생기고, 끝나면 각각 **needs review**가
됩니다. 행을 눌러 스테이징된 내용을 확인하고 **Apply**를 누릅니다. 무엇을 읽어야 하는지는
[리뷰 레시피](review-and-grades.md)에 있습니다.

볼 것:

- **RDAP Domain**은 도메인의 `registrar`, `created_date`, `expiration_date`, `status`,
  `name_servers`를 채우고 노드는 만들지 않습니다. 메시지를 본 날보다 며칠 앞선 `created_date`(여기서는
  2026-10-30)는 캠페인 하나를 위해 등록한 도메인의 모습입니다.
- A와 AAAA 레코드는 **resolves to**로 이어진 IP Address 노드가 됩니다. `203.0.113.47`과
  `2001:db8:4f2::47`입니다. Properties 패널은 이 둘에 `documentation` 배지를 붙입니다. 실제
  사건에서 그 자리에 `private`나 `loopback` 같은 배지가 붙으면 인터넷에 있지 않은 주소입니다.
- NS와 MX 레코드는 **has record**로 이어진 DNS Record 노드가 됩니다. 여기서는
  `ns1.dovrapark-dns.test`와 `ns2.dovrapark-dns.test`입니다.
- **Certificate Transparency Subdomains**는 인증서가 발급된 이름을 최대 150개까지 **subdomain**으로
  잇습니다. `track.kestrune-redelivery.example`, `pay.kestrune-redelivery.example`.

### 3. 주소가 누구의 것인지 묻기 {#whose-address}

두 주소를 선택하고(하나를 클릭하고 다른 하나를 **Shift**-클릭) **Run plugins…**를 엽니다. **IP →
ASN**, **RDAP IP**, **Shodan InternetDB**, **Detect CDN/WAF (IP)**에 체크하고 **Run (4)**를 누릅니다.

볼 것:

- **Detect CDN/WAF (IP)**는 주소가 알려진 CDN·WAF 대역에 있으면 그 주소의 `organization`을
  제공자로 씁니다(예: `cloudflare (WAF)`). 그렇다면 도메인은 앞단 뒤에 있고, 그 주소의 다른 이름은
  모두 같은 제공자의 다른 고객입니다. 그 주소에서 피벗을 멈추세요. Infrastructure pivoting의 starter
  **Find the origin behind a CDN**이 거기서 이어 갑니다.
- **IP → ASN**은 **announced by**로 이어진 Autonomous System을 만들고 주소의 `asn`을 씁니다.
  **RDAP IP**는 **within netblock**으로 이어진 Netblock을 만들고, 비어 있으면 `organization`과
  `country_code`를 채웁니다. 여기서는 작은 호스팅 회사가 AS64500으로 알리는 `203.0.113.0/24`입니다.
- **Shodan InternetDB**는 열린 포트(**exposes**), 알려진 CVE(**affected by**), 주소를 가리키는
  이름(주소에서 나가는 **resolves to**)이 있는 Host를 만들고, `cdn`, `cloud`, `self-signed` 같은
  `shodan_tags`를 씁니다.

### 4. 주소가 서비스한 이름 찾기 {#neighbours}

`203.0.113.47`을 선택하고 **OTX Passive DNS**를 실행합니다. 처음에는 Run plugins 패널에서 그
플러그인의 **Settings** 블록에 OTX 키를 붙여 넣습니다. 키는 이 기기에 내 계정 몫으로 보관되며,
브라우저 탭에서는 탭을 닫을 때까지만 남습니다([플러그인 실행](../running-plugins.md)).

볼 것:

- 그 주소로 조회되던 Domain 노드. 링크 라벨에 날짜가 들어 있습니다:
  `resolved to (2026-09-14 → 2026-11-02)`. 링크에는 `first_seen`과 `last_seen`도 저장됩니다.
- 시드와 같은 모양으로 지어 같은 몇 주에 보인 이름: `kestrune-parcel-fee.test`,
  `kestrune-customs.example`. 이것들은 후보입니다. 주소를 공유한다는 것은 두 이름이 어느 시점에 그
  주소에서 서비스되었다는 뜻일 뿐입니다.
- 이름이 몇 개인지. `ombrisel-florist.example`처럼 서로 무관한 이름 수십 개가 한 주소에 있다면 공유
  호스팅이고, 아무도 묶어 주지 않습니다.

OTX는 시드 도메인에서도 `resolved to (…)`를 그리는데, 그 자리에는 DNS Lookup이 이미
`resolves to`를 그려 두었습니다. 노드 한 쌍에는 링크가 하나뿐이므로 그 행은 지금 라벨 대신 OTX의 라벨을
제안하는 **Update**입니다. `resolves to`를 지키려면 체크를 해제합니다.

### 5. 후보의 등록 정보 비교하기 {#compare}

후보 도메인을 선택하고 **RDAP Domain**을 실행합니다. 그다음 후보와 시드를 함께 선택하고
**Shared-Attribute Clustering**을 실행합니다. 이 플러그인은 **Whole-graph / input via form** 아래에
있으며 선택한 노드에 대해, 아무것도 선택하지 않았으면 그래프 전체에 대해 동작합니다.

볼 것:

- 두 도메인 사이의 링크 하나. 둘이 공유하는 값을 모두 적습니다. 예를 들면
  `shared registrar: …; shared nameserver: ns1.dovrapark-dns.test, ns2.dovrapark-dns.test`입니다.
  속성마다 값을 네 개까지 적고, 나머지는 *and N more*로 셉니다. 플러그인은 노드에 이미 있는 값만
  쓰며 요청을 보내지 않습니다.
- 그래프가 커진 뒤 다시 실행하면, 두 도메인이 공유하는 것이 바뀐 경우 플러그인이 그린 링크의 라벨을
  그 자리에서 바꿉니다. 직접 그렸거나 다른 플러그인이 그린 링크는 그대로 두며, 요약에 그런 쌍의 수가
  나옵니다(*already linked under another label, left as they are*).
- 공유하는 값이 무엇인지. 첫 값만 보지 말고 라벨에 적힌 값을 모두 읽습니다. 등록 대행자가 맨 앞에
  오는데, 가장 약한 값일 때가 많습니다. 작은 DNS 호스트 한 곳의 네임서버를 같은 주에 등록한 브랜드풍
  도메인 셋이 함께 쓴다면 범위가 좁혀집니다. 대중적인 등록 대행자나 대형 DNS 제공자의 네임서버는
  아무도 묶어 주지 않습니다. 플러그인은 비교하는 노드 가운데 30개보다 많이 공유하는 값을 건너뛰고
  라벨에서도 빼지만, 그 안에서 드문 값도 인터넷에서는 흔할 수 있습니다.
- 링크의 등급. 이 링크들은 이미 그래프에 있던 노드를 잇고 관측이 아니라 공유하는 값을 말하므로,
  한 도메인이 다른 도메인보다 네임서버를 더 많이 적고 있어도 `unassessed`로 적용되고 점선으로
  그려집니다. 그것이 이 링크를 정직하게 읽는 방법입니다.

### 6. 에이전트에게 따져 보게 하기 {#ask-the-agent}

**Run ▸ Skill packs**에서 **Infrastructure pivoting**을 고릅니다. starter 가운데 **Related, or just
shared hosting?**을 고르고 **First indicator**(`kestrune-redelivery.example`)와 **Second
indicator**(`kestrune-parcel-fee.test`)를 채운 뒤 **Ask the agent to follow this**를 누릅니다.
프롬프트가 새 대화의 입력창에 들어가니 읽어 보고 보냅니다.

다른 starter는 다른 때에 맞습니다. 처음부터라면 **Expand one indicator**, 3단계 뒤라면 **Find the
origin behind a CDN**, 그래프가 커졌다면 **Strip out shared-hosting noise**, 데스크탑 앱에서는
**Fingerprint a URL**과 **What did it look like before?**입니다.

답에서 볼 것:

- 판정만이 아니라 추정치: 공유하는 속성마다 무관한 쪽이 얼마나 많이 갖는지, 그 수치가 무엇에
  기대는지, 그리고 질문을 판가름할 검사.
- 변경 세트로 검토를 기다리는 변경. 에이전트가 스테이징하는 링크는 "같은 운영자" 같은 결론이 아니라
  관측한 것(`resolves to`, `shares certificate`)으로 라벨이 붙습니다.
- 가지 못한 홉. 프로젝트에 없는 플러그인이 필요한 홉은 기억으로 채우지 않고 이름을 댑니다.

### 7. 페이지 지문 뜨기 (데스크탑 앱, 선택) {#fingerprint}

이 단계는 내 컴퓨터에서 페이지를 요청합니다. URL 노드를 선택하고 **Favicon Hash**, **HTTP Header
Hash (HHHash)**, **DOM Structure Hash**, **Ad Tag Extract**를 실행합니다.

볼 것:

- 프로젝트의 다른 사이트도 가진 Tracking ID. 두 사이트가 **carries tracking ID**로 같은 Tracking ID
  노드에 이어집니다. 강한 단서이지만 여전히 후보입니다. 복제한 키트는 원래 사이트의 분석 ID를 그대로
  갖고 있습니다.
- 파비콘 해시. URL 노드가 아직 선택되어 있고 Shared-Attribute Clustering은 선택한 노드만 비교하므로,
  프로젝트의 파비콘을 모두 비교하려면 먼저 선택을 해제하고(**Esc**, 또는 빈 캔버스 클릭) 그렇지
  않으면 Favicon Hash 노드를 선택합니다. 그다음 Shared-Attribute Clustering을 다시 실행하면 지각
  해시가 64비트 가운데 10비트 이하로 다른 파비콘이 `similar favicon: …`으로 이어집니다. 비어 있거나
  한 가지 색인 아이콘은 비교하지 않습니다.

## 끝나는 곳 {#where-it-ends}

다음 홉이 배경 값(CDN 앞단, 공유 호스팅, 대중적인 등록 대행자)에만 닿을 때, 조치할 수 있는 곳(RDAP가
알려 주는 등록 대행자, 넷블록 뒤의 조직)에 닿을 때, 또는 설치된 어떤 플러그인도 그 홉을 갈 수 없을
때 가지가 멈춥니다. 요약은 starter **Summarise the footprint**(**Starting indicator**)로 요청합니다.
연결을 홉마다 증거와 함께 되짚고, 멈춘 가지와 그 이유를 밝히며, 실행했지만 빈 결과가 나온 것을
나열합니다.

브리핑용으로는 **View ▸ Saved views**가 배치를 보관하고([저장된 뷰](../canvas.md#저장된-뷰)), 노드의
**Document** 보기에 **Copy as Markdown**이 있으며([문서 보기와 JSON 보기](../properties.md#document-and-json-views)),
**Edit ▸ Copy labels, defanged**가 선택한 지표를 티켓에 붙일 수 있게 복사합니다.

페이지나 등록 기록에 사람, 이메일 주소, 핸들이 나오면 [계정·핸들 피벗](account-pivot.md)으로 이어
갑니다.

## 함정 {#pitfalls}

- **앞단은 운영자가 아닙니다.** CDN 뒤에 있는 도메인의 주소는 CDN의 것이고, 그 주소를 함께 쓰는
  이름도 마찬가지입니다.
- **공유한다고 관련된 것은 아닙니다.** 수천 곳이 쓰는 등록 대행자, 네임서버, ASN은 아무도 잇지
  않습니다. Shared-Attribute Clustering의 30이라는 한도는 인터넷이 아니라 비교하는 노드에서 센
  값입니다.
- **패시브 DNS는 과거입니다.** 2년 전에 그 주소로 조회되던 이름이 지금도 주소를 함께 쓰는 것은
  아닙니다. 라벨의 날짜를 읽으세요.
- **인증서 로그는 살아 있는 호스트가 아니라 이름을 나열합니다.** crt.sh에서 온 하위 도메인은 한때 그
  이름으로 인증서가 발급되었다는 뜻입니다.
- **"No changes"는 "확인하지 못함"일 수 있습니다.** 호스트가 응답하지 않은 실행은 그 호스트를
  알려 주는 노란 토스트로 끝납니다([진행률 및 취소](../running-plugins.md#progress-and-cancellation)).
- **플러그인이 여럿이면 리뷰도 여럿입니다.** 한 실행의 링크가 다른 실행이 아직 만들지 않은 노드를
  가리키면, 그 리뷰를 적용할 때까지 기다리며 리뷰 하단이 그렇게 알려 줍니다.
- **어떤 단계는 사이트에 닿습니다.** Web Recon과 Ad Tags는 내 컴퓨터에서 페이지를 가져옵니다.
  사칭당한 브랜드의 실제 도메인 `kestrunepost.example`처럼 에이전트가 아예 손대지 않게 할 호스트는
  AI 에이전트 패널의 **Setup → Session scope → Hosts nothing may collect from**에 넣습니다.

## 다음 / 함께 보기

- [리뷰와 증거 등급 읽기](review-and-grades.md) — 이 레시피의 리뷰마다 보이는 것과 링크 등급의 뜻
- [플러그인 실행](../running-plugins.md) — Run plugins 패널과 리뷰
- [Type Pack 사용하기](../typepacks.md) — Infrastructure 유형과 각 유형을 식별하는 값
