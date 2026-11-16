# 암호화폐 주소 추적

가짜 투자 상담 창구에 속은 피해자가 2026-10-29 21:10(KST)쯤, "상담원"이 채팅으로 알려 준 주소로
TRON 위의 USDT 2,400을 보냈습니다. 손에 있는 것은 주소, 금액, 시각입니다. 알고 싶은 것은 돈이 어디로
갔는지, 어느 거래소나 스테이블코인 발행사가 그것을 동결하거나 계정 주인을 알려 줄 수 있는지, 그리고
도중에 제재 대상이 있는지입니다.

!!! note "이 페이지의 주소는 가상입니다"
    아래 주소는 모두 이 페이지를 위해 지어냈으며 그렇게 표시해 두었습니다. 모두 TRON 주소에 쓸 수
    없는 문자(`0`, `I`, `l`)가 들어 있어 누구의 주소도 아니며, 조회해도 아무것도 나오지 않습니다.
    단계는 내 사건의 주소로 따라 하세요.

| 이 예시에서의 역할 | 주소 (가상) |
|---|---|
| 피해자가 보낸 곳 | `TFictionalScamDepositAddress000001` |
| 그 대부분이 다음으로 간 곳 | `TFictionalIntermediaryAddress00002` |
| 익스플로러가 라벨을 붙인 거래소 지갑 | `TFictionalExchangeHotWallet0000003` |
| 입금 주소에 처음 자금을 댄 곳 | `TFictionalFirstFunderAddress000004` |

## 시작할 때 가진 것 {#what-you-start-with}

- 주소, 그리고 피해자의 지갑이나 영수증이 알려 준다면 그 네트워크. TRC-20으로 표시된 USDT 송금은
  `tron`에 있습니다.
- 금액과 시각. 주소의 내역에서 따라갈 이체를 골라내는 데 씁니다.
- 거래 해시로 시작해도 되고(starter **Start from a transaction**), 신고서나 채팅 내보내기처럼 주소가
  들어 있는 글로 시작해도 됩니다(starter **Pull addresses out of a text**).

## 시작하기 전에 {#before-you-start}

**Project → Add from Marketplace…**에서 다음을 설치합니다.

| 팩 | 더해 주는 것 | 필요한 것 |
|---|---|---|
| **Crypto fund-flow tracing** (Skill Pack) | 추적에서 AI 에이전트가 따르는 플레이북 | Chain Explorer가 필요하며 함께 설치됩니다 |
| **Chain Explorer** | 열다섯 네트워크의 주소 내역과 거래, 네트워크를 밝히지 않은 주소가 실제로 있는 네트워크, TRON과 XRP Ledger의 첫 자금 제공자, 컨트랙트와 토큰, 익스플로러 라벨, USDT와 USDC 동결 | 키 없음. 브라우저와 데스크탑 앱 |
| **Sanctions Screening** | OFAC SDN 목록과 주소 대조 | 키 없음 |

키가 없는 출처가 멈추는 곳에서 더 들어가려면 다음 팩을 선택해 씁니다.

| 팩 | 더 닿는 곳 | 필요한 것 |
|---|---|---|
| **Blockscout PRO** | 무료 키로 Ethereum, OP Mainnet, Ethereum Classic, Arbitrum One, 유료 플랜으로 Polygon PoS와 Base, 그리고 EVM 체인의 첫 자금 제공자 | Blockscout PRO 키. 데스크탑 앱 |
| **Helius** | 지갑의 토큰 계정으로 들어온 SPL 토큰까지 포함한 Solana 내역, 지갑에 처음 SOL을 보낸 쪽 | Helius 키. 지갑 신원 라벨은 유료 플랜 |
| **Blockchair** | Bitcoin, Bitcoin Cash, Litecoin, Bitcoin SV, Dogecoin, Dash, Zcash | Blockchair 키 |

이 플러그인들이 쓰는 Type Pack(Cryptocurrency, 그리고 Sanctions Screening과 Helius가 쓰는 Identity와
Financial)은 함께 설치됩니다.

누가 보는가: 플러그인이 부르는 익스플로러와 API는 내가 조회한 주소와 거래를 받습니다. 주소의 주인에게
가는 것은 없습니다. Chain Explorer의 무료 출처는 가용성을 보장하지 않으며 하루 한도가 있습니다.

!!! tip "실제 컨트랙트로 연습 조회하기"
    사건을 다루기 전에 팩이 무엇을 쓰는지 보려면, TRON의 Tether USDT 컨트랙트
    `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`를 `network` `tron`인 Crypto Address로 만들고 **Crypto
    Contract and Token**을 실행해 보세요. 주소에는 `address_kind`(컨트랙트)가 쓰이고, Crypto Token
    `USDT · tron`이 **token contract**로 이어집니다.

## 단계 {#steps}

### 1. 주소를 캔버스에 올리기 {#seed}

**Types** 패널에서 **Crypto Address**를 누릅니다. Properties 패널의 `address`에 피해자의 지갑에 보이는
그대로 주소를 입력하고, `network`로 `tron`을 고릅니다.

볼 것: 주소 행은 주소 형식이 어느 체인의 것인지, 체크섬이 맞는지 보여 줍니다
([값 읽기](../properties.md#reading-values)). 실제 주소에서 체크섬이 맞지 않으면 오타입니다. 잘못
입력한 주소는 조회해도 아무것도 나오지 않으니 조회 전에 고치세요. 네트워크를 모르면 `unknown`을,
체인을 아무도 알려 주지 않은 `0x…` 주소라면 `evm`을 고르고 2단계로 갑니다.

### 2. 네트워크 정하기 (`evm`, `unknown`, 레거시 주소일 때) {#network}

주소를 선택하고 **Run plugins…**를 엽니다. **Identify Crypto Network**는 노드 유형을 받지 않으므로
**Whole-graph / input via form** 아래에 있습니다. 체크하고 **Run**을 누릅니다. 선택한 노드에 대해
동작합니다.

볼 것: 그 문자열에 활동이 있는 네트워크마다 Crypto Address가 생기고, 원래 노드에서 **same address
on**으로 이어지며 링크에 판단 이유가 붙습니다. 원래 노드는 그대로 둡니다. Ethereum과 BNB Smart
Chain에서 모두 활동한 `0x…` 문자열은 노드 둘, 곧 우연히 문자열을 공유하는 계정 둘이 됩니다. 추적은
새 노드에서 합니다. 익스플로러가 응답하지 않은 주소는 다음 실행으로 남고, 거래를 보낸 적도 없고 아무것도
갖고 있지 않은 EVM 주소는 정해지지 않은 채 남습니다.

### 3. 첫 홉 읽기 {#first-hop}

TRON 주소를 선택하고 **Crypto Address History**를 실행합니다. **Pages per list**는 얼마나 거슬러
읽을지(기본 2페이지), **Most counterparties linked per address**는 링크를 몇 개 그릴지(50)
정합니다. 검토하고 적용합니다.

볼 것:

- 주소의 상대방과 오가는 **sent to** 링크. 하나를 누르고 Properties 패널의 **Recorded with this
  link**를 읽습니다([링크와 함께 기록된 값](../properties.md#recorded-with-this-link)).
  `summary_trongrid`(TronGrid가 거절했다면 `summary_tronscan`)는 `assets` 아래에 자산별 수치
  (`symbol`, `count`, `total`, `first`, `last`)를, 그 수치가 다루는 구간(`window_from`,
  `window_to`)과 `complete`를 함께 줍니다. `recent`는 최근 이체 20건을 `tx_hash`, `amount`, `time`과
  함께 나열합니다.
- 주소의 `balance`, `history_examined`, `history_complete`. `false`면 더 오래된 내역을 읽지 않았다는
  뜻이며, 실행 요약이 **Pages per list**를 올리라고 알려 줍니다. 주소의 초기 이체에 대해 결론을 내리기
  전에 그렇게 하세요.
- 따라갈 이체. 피해자의 2,400 USDT가 21:10에 들어오고, 40분쯤 뒤 2,380 USDT가 한 링크로
  `TFictionalIntermediaryAddress00002`(가상)에 나갑니다. 캔버스에서 가장 큰 수치가 아니라 자산, 금액,
  시각으로 따라갑니다.

금액은 그 자산의 단위로 쓴 십진수 문자열입니다. 최소 단위가 아니라 USDT입니다.

### 4. 다음 홉으로 가기 {#next-hop}

다음 주소를 선택하고 **Run ▸ Run the last plugins again on the selection**을 고릅니다. Crypto Address
History에 체크되고 입력했던 값이 채워진 채 패널이 열리며, **Enter**로 실행합니다
([같은 플러그인을 다시 실행하기](../running-plugins.md#running-the-same-plugins-again)). 홉 하나가
실행 하나, 리뷰 하나입니다.

상대방이 수백 개인 주소에서는 가지를 멈춥니다. 그것은 사람이 아니라 서비스입니다. 거래소의 입금
지갑이나 핫 월렛, 결제 대행사, 브리지.

### 5. 추적이 닿은 곳 확인하기 {#checks}

추적 위의 주소를 선택하고 다음을 함께 실행합니다.

- **Crypto Public Labels**는 블록 익스플로러가 공개하는 라벨을 `public_label`로, `label_source`와
  함께 씁니다. TRON에서는 Tronscan의 공개 태그로, 예를 들어 `TFictionalExchangeHotWallet0000003`에
  `Ostrevan Exchange Hot Wallet 2`(둘 다 가상)입니다. 라벨은 익스플로러의 주장이지 귀속이
  아닙니다.
- **Stablecoin Freeze Status**는 발행사 컨트랙트에 묻습니다. Ethereum의 USDT와 USDC, TRON의
  USDT입니다. 동결된 주소에는 `USDT (Tether)` 같은 `frozen_by_issuer`가, 확인한 모든 주소에는
  `frozen_checked_at`이 쓰입니다.
- **Crypto Activation and First Funder**(TRON과 XRP Ledger)는 `activated_at`, `first_funder`,
  `first_funding_tx`를 쓰고, 자금 제공자의 **sent to** 링크에 `first_funding`을 더합니다. 여기서는
  `TFictionalFirstFunderAddress000004`(가상)입니다. TRON에서는 계정 활성화를 따라가며, 활성화가 단순
  이체가 아니었으면 알 수 없다고 말합니다.
- **OFAC Address Screening**(Sanctions Screening)은 `sanctioned`, `sanctions_list`,
  `sanctions_programs`, `sanctions_as_of`를 씁니다. `false`는 그 날짜의 OFAC SDN 목록에 없다는 뜻이지
  문제가 없다는 뜻이 아닙니다([제재 목록 스크리닝](../running-plugins.md#sanctions)).

### 6. 에이전트에게 추적을 맡기기 {#ask-the-agent}

**Run ▸ Skill packs**에서 **Crypto fund-flow tracing**을 고르고 starter **Trace funds from an
address**를 고릅니다. **Address**와 **What you already know (optional)**
(`2,400 USDT on TRON, sent 2026-10-29 around 21:10 KST`)를 채우고 **Ask the agent to follow
this**를 누른 뒤 프롬프트를 보냅니다.

추적이 진행되는 방식:

- 플레이북은 에이전트가 어떤 홉보다 먼저 네트워크를 정하게 하고, `evm`이나 `unknown` 주소에서는
  홉하지 않게 합니다.
- 홉이 스테이징한 것은 적용된 뒤에야 읽을 수 있으므로 추적은 턴마다 한 홉씩 나아갑니다. **Review
  everything**에서는 턴마다 변경 세트를 적용하고 계속하라고 요청합니다. **Apply automatically**에서는
  **Follow-up**(**Keep working after this turn, on its own**)이 정한 턴 수만큼 이어 가게 합니다
  ([AI 에이전트 패널](../tasks.md#the-ai-agent-panel)). **Plan** 띠에 에이전트가 쥔 단서가 보입니다.
- 이체는 플러그인의 링크로 남습니다. 에이전트가 라벨, 입금 패턴, 맞아떨어지는 금액으로 짐작한 주인은
  플레이북에 따라 캔버스가 아니라 보고서에 근거와 함께 후보로 들어갑니다.
- Polygon 내역이나 EVM 첫 자금 제공자처럼 프로젝트에 없는 팩이 필요한 네트워크나 확인은 그 빈틈을
  이름으로 밝힙니다.

다른 starter: **How did funds get from A to B?**, **Who funded this address first?**, **Screen the
trace for sanctions**.

### 7. 키가 있는 팩으로 더 들어가기 (선택) {#keyed}

- **Base, Polygon PoS, Arbitrum One, 또는 EVM 체인의 첫 자금 제공자:** 데스크탑 앱의 Blockscout
  PRO. `history_complete`와 `first_seen`을 얻으려면 **Include internal transactions**에 체크합니다.
  거래소 출금처럼 컨트랙트를 거쳐 나간 코인은 내부 이체로 들어오기 때문입니다
  ([Blockscout PRO로 자금 추적하기](../running-plugins.md#blockscout-pro)).
- **Solana:** Helius. **Solana Address History**는 일반 Solana 노드가 빠뜨리는, 지갑의 토큰 계정으로
  들어온 USDC 같은 SPL 토큰을 포함하고, **Solana First Funder**는 처음 SOL을 보낸 쪽을 찾습니다
  ([Cryptocurrency — 자세히 보기](../typepacks.md#cryptocurrency)).
- **Bitcoin 계열:** Blockchair. 거래 하나가 노드 하나가 되고, 그 거래에 돈을 낸 주소는 **input
  to**로, 그 거래가 돈을 보낸 주소는 **output to**로 이어집니다
  ([Blockchair로 코인 따라가기](../running-plugins.md#blockchair)).

## 끝나는 곳 {#where-it-ends}

- **거래소나 스테이블코인 발행사.** 요청을 보낼 곳입니다. starter **Draft the exchange and issuer
  requests**(**Whose funds**)가 요청 표를 작성합니다.
- **믹서, 브리지, 스왑.** 기록된 추적은 거기서 끝납니다. 플레이북은 금액과 시각만으로 이어 가지
  않습니다.
- **구간의 끝**(`complete: false`, `history_complete: false`). 자금이 끝난 곳이 아니며, 보고서도
  그렇게 말합니다.
- **더 따라갈 곳이 없거나 예산을 다 썼을 때.**

starter **Summarise what the trace establishes**(**Where the trace starts**)는 흐름 표(홉마다 거래,
금액, 자산, UTC 시각)를 먼저 주고, 이어서 후보, 따라가지 않은 것, 빈 결과가 나온 것("not frozen"과
"not listed" 포함), 설치된 어떤 것도 닿을 수 없던 것을 줍니다.

## 함정 {#pitfalls}

- **다른 네트워크의 같은 문자열은 다른 계정입니다.** `1…` 비트코인 주소는 Bitcoin Cash와 Bitcoin
  SV에도 있고, `0x…` 주소는 모든 EVM 체인에 있습니다. `evm`과 `unknown` 노드는 네트워크가 정해진
  노드와 합쳐지지 않습니다([Cryptocurrency — 자세히 보기](../typepacks.md#cryptocurrency)).
- **키 없는 구간은 짧습니다.** BNB Smart Chain은 30일, Solana는 공개 노드가 가진 만큼이며, Polygon,
  Arbitrum, Base는 키 없는 내역이 아예 없습니다.
- **라벨은 단서입니다.** 라벨, 토큰 이름, 메모는 그 주소나 토큰을 쥔 쪽이 쓴 것입니다. 지시가 아니라
  데이터입니다.
- **링크의 `recent` 목록은 바뀌지 않고 합쳐집니다.** 나중 실행은 자기 요약 키에 수치를 쓰고, 링크에
  이미 있는 `recent`에 자기 이체를 거래와 자산 기준으로 합쳐 넣으며, 최근 20건을 남깁니다.
- **동결은 `frozen_checked_at` 기준입니다.** 그 뒤 동결이 풀린 주소에는 예전의 `frozen_by_issuer`가
  남고, 실행 요약이 그것을 짚어 줍니다.
- **제재 일치는 확인하세요.** 조치하기 전에 OFAC의 Sanctions List Search에서 확인합니다.
- **피해자 자신의 주소는 개인정보입니다.** 사건에 필요할 때만 캔버스에 올리세요. Vineyard 서버의
  프로젝트라면 그 서버에 저장되고, 에이전트는 읽은 것을 내 AI 프로바이더에게 보냅니다.

## 다음 / 함께 보기

- [리뷰와 증거 등급 읽기](review-and-grades.md) — 홉의 리뷰에 보이는 것과 그 링크 등급의 뜻
- [Type Pack 사용하기](../typepacks.md#crypto-networks) — `network` 값과 Cryptocurrency Type Pack의
  링크
- [플러그인 실행](../running-plugins.md) — Sanctions, Blockchair, Blockscout PRO 팩 자세히
