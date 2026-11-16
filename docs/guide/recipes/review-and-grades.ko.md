# 리뷰와 증거 등급 읽기

플러그인, AI 에이전트, 병합, 재검증이 제안하는 것은 모두 프로젝트에 들어가기 전에 리뷰에서
기다리고, 적용된 링크에는 모두 증거 등급이 붙습니다. 이 레시피는 플러그인 실행 하나를 리뷰로 끝까지
가져간 뒤, 그 실행이 그린 링크의 등급을 읽고, Re-verify로 다시 묻습니다. 예시는
[피싱 도메인에서 인프라까지](phishing-domain.md)에서 이어지며, 이름과 주소는 지어낸 것입니다
([예시에 대해](index.md#about-the-examples)).

## 시작할 때 가진 것 {#what-you-start-with}

검토를 기다리는 변경 세트. 다음 가운데 하나로 보입니다.

- *Certificate Transparency Subdomains: 14 change(s) staged — review to apply* 같은 토스트 뒤,
  **Tasks**의 행에 붙는 **needs review** 배지(또는 **N to review**)
- AI 에이전트 대화에서, 입력창 위에 **Review**와 함께 나오는 *N change(s) across M change sets need
  review* 줄
- Tasks의 **Merge**나 *Re-verification* 행

## 단계 {#steps}

### 1. 리뷰 열기 {#open}

Tasks의 행을 누르거나 AI 에이전트 패널의 **Review**를 누릅니다. 대화상자 제목이
*Review: Certificate Transparency Subdomains*처럼 실행의 이름을 알려 줍니다. 열려 있는 동안에는
아무것도 쓰이지 않습니다. 캔버스는 변경을 미리 보여 주며, 변경하거나 삭제할 것은 캔버스 필터가
숨기고 있어도 그려집니다([노드와 엣지 숨기기](../canvas.md#숨기기)).

### 2. 목록 읽기 {#list}

- **All**, **Add**, **Update**, **Delete** 탭은 종류별 행 수를 세고, 그 옆 줄은 보이는 행 가운데 몇
  개에 체크되어 있는지 셉니다(*12 of 14 selected*).
- 행마다 **Op**(Add, Update, Delete), **Kind**(node 또는 edge), **Label**, **Type**이 있습니다. 독립
  검사가 실행되었으면 **Check** 열이 판정을 보여 주고, 적용한 뒤에는 **Status**가 그 행에 무슨 일이
  있었는지 말해 줍니다.
- **Filter by keyword (label, type, data…)**(또는 **/**)는 라벨만이 아니라 행이 담은 값을 찾습니다.
  `cloudflare`를 입력하면 데이터에 그 말이 들어 있는 행이 모두 나오므로 한꺼번에 체크를 해제할 수
  있습니다.
- 체크를 해제한 행은 적용에서 빠집니다. 노드의 체크를 해제하면 그 노드가 필요한 링크도 빠지며,
  하단이 그 수를 셉니다(*N edges excluded — their endpoint nodes are not being created*).

링크의 **Update** 행을 살펴보세요. 링크의 Update는 그 쌍에 이미 링크가 있다는 뜻입니다. 새 작성자가
다른 말을 썼다면 그 행은 지금 라벨 대신 자기 라벨을 제안합니다. 피싱 레시피 4단계의 실행에서 DNS
Lookup의 `resolves to` 위에 제안된 OTX의 `resolved to (2026-09-14 → 2026-11-02)`가 그렇습니다. 지금
라벨을 지키려면 체크를 해제합니다. 라벨을 그대로 두는 Update는 새 작성자가 링크에 함께 저장한 값을
더하고, 새 작성자가 같은 링크를 같은 말로 그린 다른 수집기라면 그 작성자를 `corroborated_by`에
더합니다(6단계).

### 3. 포커스한 행 읽기 {#focused-row}

행을 누르거나 **↑**, **↓**로 옮깁니다. 오른쪽 창이 그 행이 쓸 것을 보여 줍니다.

- **노드:** 행을 적용한 뒤의 필드. Update라면 저장된 값 위에 제안한 값을 병합한 결과입니다. *This
  node is already in the project*는 이 실행을 스테이징한 뒤, 예를 들어 그 사이 적용한 리뷰를 통해
  같은 식별값의 노드가 프로젝트에 들어왔다는 뜻입니다. 적용하면 이 필드가 그 노드에 더해지며, 보이는
  값이 그 노드가 갖게 될 값입니다.
- **링크:** `from`, `relation`, `to`, 그리고 **Recorded with this link** 아래에 작성자가 링크와 함께
  저장한 값. OTX가 남기는 `first_seen`과 `last_seen` 같은 것입니다. 라벨을 바꾸는 Update라면 창에
  `current_relation`, 그 라벨을 쓴 쪽(`current_relation_written_by`), `proposed_relation`이 나옵니다.
  거기에 *Edited here*가 있으면 바뀌려는 말이 내 것이라는 뜻입니다.

### 4. 검사가 실행되었다면 판정 읽기 {#check}

독립 검사는 **Have an independent check test each inference**가 켜져 있을 때 AI 에이전트의 변경
세트에서, 그리고 모든 재검증에서 실행됩니다. 판정은 **Check** 열에 나옵니다.

| 판정 | 뜻 | 링크를 적용하면 |
|---|---|---|
| *supported* | 검사가 링크를 반박해 보았고 링크가 버텼습니다 | `assessed` |
| *weak*, *unresolved* | 들어맞지만 근거가 얇습니다 | `circumstantial` |
| *refuted* | 검사가 링크를 반박했습니다 | `contested`: 내가 남겨 두었기 때문에 남습니다 |
| *not checked*, *check failed* | 아무것도 그 행을 판단하지 않았습니다 | 검사가 없었을 때 받았을 등급 |
| *dropped* | 에이전트가 그 변경을 철회했습니다 | — |

목록 아래 **Independent check** 창은 포커스한 행의 **Claim**, **Case against**, **Prevalence**(주장이
기대는 속성이 얼마나 흔한지), 그리고 그것을 판가름할 것(**Would be settled by**)을 보여 줍니다. 위쪽
가장자리를 끌어 높이를 늘릴 수 있습니다. 기본값인 **Review everything (AI-assisted)**에서는
에이전트가 권하지 않는 행이 체크 해제된 채 나옵니다.

### 5. 적용하거나, 이유를 남기기 {#apply}

**Apply (N)**(**⌘Enter** 또는 **Ctrl+Enter**)을 누릅니다. 하단이 반영되는 행을 세고 *Done N/N*으로
끝납니다. 쓰지 못한 행은 이유와 함께 스테이징된 채 남고 실행은 계속 검토를 기다리니, 다시 열어 다시
시도합니다. **Discard all**은 아직 스테이징된 것을 버립니다. AI 에이전트 대화에서 온 변경 세트라면
**Why reject? (optional — the agent is told)**가 내 이유를 에이전트에게 전해, 같은 것을 다시 제안하지
않게 합니다.

**×**나 **Esc**로 대화상자를 닫으면 실행과 내가 체크한 것, 입력한 것이 그대로 남으니 Tasks에서 다시
엽니다. 적용하거나 폐기한 실행은 행마다 **Status**가 있는 읽기 전용 기록
(*History — N applied, M skipped, K failed*)으로 열립니다.

### 6. 링크의 등급 읽기 {#grade}

실행이 그린 링크 하나를 누릅니다. Properties 패널에 다음이 나옵니다([링크](../properties.md#a-link)).

- 양 끝 `from → to`와 라벨을 쓴 쪽: *Written by* `run.vineyard.plugins.crtsh_subdomains`
- *Evidence:* 등급, 그 등급을 매긴 쪽(같은 플러그인의 *Graded by*), 등급의 뜻 한 줄
- **Recorded with this link** 아래에 작성자가 저장한 값과, 같은 링크를 그린 다른 작성자를 담은
  `corroborated_by`

링크가 적용될 때 모델 없이 등급이 정해지는 방식:

| 링크 | 등급 |
|---|---|
| 플러그인을 실행한 노드와 그 실행이 찾은 노드 사이의 플러그인 링크: DNS Lookup의 `resolves to`, Certificate Transparency의 `subdomain`, IP to ASN이 주소에서 그 AS로 그린 링크 | `recorded` |
| 한쪽 끝이 자기 필드에서 다른 쪽을 가리키는 링크. 예를 들어 `profile_url`에 링크가 가리키는 URL이 들어 있는 계정, 다른 계정의 주소를 인용한 소개글 | `recorded` |
| 두 번째 수집기가 같은 말로 다시 그린 같은 링크: crt.sh가 이미 그린 곳에 OTX Passive DNS가 그린 `subdomain` | `recorded`. OTX 플러그인이 `corroborated_by`에 더해집니다. 같은 플러그인을 다시 실행해도, AI 에이전트가 동의해도 더해지지 않습니다. |
| 이미 그래프에 있던 두 노드 사이에 공유하는 값을 말하는 플러그인 링크: Shared-Attribute Clustering의 `shared registrar: …; shared nameserver: …` | `unassessed` |
| 아무것도 검사하지 않았고 양 끝이 서로를 가리키지 않는 AI 에이전트의 링크 | `unassessed` |
| 검사가 판단한 AI 에이전트의 링크 | 판정에 따라(4단계) |
| 직접 그린 링크 | `asserted` |

양 끝이 같은 필드에 가진 값은, 한쪽 값이 더 길거나 다른 쪽 값을 품고 있어도 한쪽이 다른 쪽을
가리키는 것이 아니라 공유하는 속성입니다. `ns1`과 `ns2`를 적은 도메인과 `ns1`만 적은 도메인,
`Ostrel Hosting`과 `Ostrel Hosting Ltd`, 다른 쪽 상태에 `add period`가 더 붙은 RDAP 상태, 핸들과
뒤에 무언가 붙은 같은 핸들이 그렇습니다. 이런 값에 기대는 링크는 `recorded`가 아닙니다. 검사가 없으면
`unassessed`이고 점선으로 그려지며, 이런 모양의 AI 에이전트 링크는 추론이므로 독립 검사가 켜져 있으면
검사가 판단합니다.

`recorded`는 도구가 링크를 기록했다는 뜻이지 누군가 검증했다는 뜻이 아닙니다. 등급은 링크를 쓴 때
알려져 있던 것을 기록합니다. 그래프가 커져도 저절로 바뀌지 않고, 새 증거와 함께 링크가 다시 쓰일
때, 사람이 바꿀 때, 적용한 재검증이 있을 때만 바뀝니다. 여섯 등급은 모두
[증거 등급](../properties.md#evidence-grades)에 있습니다.

### 7. 캔버스를 등급으로 읽기 {#canvas}

캔버스에서 등급마다 선이 다릅니다. `assessed`는 실선, `asserted`는 긴 대시, `recorded`는 그보다 짧은
대시, `circumstantial`은 짧은 대시, `unassessed`는 점선, `contested`는 더 굵은 호박색 선입니다. 범례의
**Evidence** 키는 프로젝트에 있는 등급을 수와 함께 나열합니다. 하나를 누르면 그 등급의 링크가
숨겨지며([범례](../canvas.md#범례)), **Filter → Evidence**에서 체크를 해제해도 됩니다.

결론이 무엇에 기대는지 보려면 AI 에이전트에게 묻습니다. 예를 들어 *Which links does the connection
between kestrune-redelivery.example and kestrune-parcel-fee.test rest on, weakest first?* 에이전트는
링크마다 등급, 그 등급을 매긴 쪽, 라벨을 쓴 쪽, 교차 확인한 쪽을 읽으며, 결론은 가장 약한 링크만큼만
강하다는 것을 알고 있습니다. Infrastructure pivoting의 starter **Check a link the project already
draws**는 링크 하나를 그 증거에 비추어 점검합니다.

### 8. Re-verify로 다시 묻기 {#re-verify}

링크를 누르고 Properties 패널에서 **Re-verify**를 누릅니다([Re-verify](../properties.md#re-verify)).
AI 에이전트 패널에 설정한 모델 키가 필요하며, 아무것도 쓰지 않습니다. 판정은 *Re-verification*이라는
변경 세트로 도착해 Review 대화상자에 열리고 Tasks에 행이 남습니다. 그 한 행은 링크의 **Update**입니다.
창에는 `relation`, `relation_written_by`, 그리고 `supported — still valid` 같은 `re_verified`가 나오고,
**Check** 열과 **Independent check** 창이 그 근거를 보여 줍니다.

적용하면 등급이 정해집니다. *still valid*는 `assessed`, *inconclusive*는 `circumstantial`, *stale*은
`contested`입니다. 실행하지 못한 재검증은 등급을 내리지 않으며, 어떤 재검증도 링크 삭제를 제안하지
않습니다. 버튼 옆 화살표의 **Re-collect with the agent**는 이 링크의 새 증거를 모아 달라는 요청을
채운 새 대화를 열며, 요청은 보내지 않습니다.

## 끝나는 곳 {#where-it-ends}

리뷰는 모든 행을 적용하거나 일부러 뺐을 때 끝납니다. 읽기는 결론이 기대는 링크마다 그 증거가 어디까지
가는지, 무엇이 있으면 등급이 오를지 말할 수 있을 때 끝납니다. 보고서용으로는 노드의 **Document**
보기가 링크를 라벨별로 묶어 등급마다 몇 개인지 보여 주고, **Copy as Markdown**이 그 페이지를
복사합니다([문서 보기와 JSON 보기](../properties.md#document-and-json-views)).

## 함정 {#pitfalls}

- **`recorded`는 `verified`가 아닙니다.** 오늘 기록한 DNS 응답은 누가 그 도메인을 쥐고 있는지 말해
  주지 않습니다.
- **`asserted`는 측정이 아니라 판단입니다.** 사람이 그 링크를 보증했다는 뜻이며, 무언가가 그 링크를
  검사했는지는 말하지 않습니다.
- **어떤 등급도 관문이 아닙니다.** 등급이 무엇이든 링크를 편집하거나 지우거나 그 위에 쌓는 것을 막지
  않으며, `contested` 링크는 사람이 지울 때까지 남습니다.
- **inconclusive는 false가 아닙니다.** 사라진 페이지나 한 번 실패한 조회는 낡았다는 증거가 아니며,
  검사도 그렇게 안내받습니다.
- **"No changes"는 "확인하지 못함"일 수 있습니다.** 호스트가 응답하지 않은 실행은 그 호스트를 알려
  주는 노란 토스트로 끝납니다.
- **일부 적용된 실행은 적용된 것으로 남습니다.** 일부를 적용한 뒤 **Discard all**을 누르면 아직
  스테이징된 것만 버려지고, 실행은 적용으로 기록됩니다.
- **라벨과 등급은 따로입니다.** 링크의 라벨을 바꿔도 등급을 매긴 쪽은 바뀌지 않고, 등급을 매겨도
  라벨이 내 것이 되지 않습니다.

## 다음 / 함께 보기

- [Properties 패널](../properties.md#a-link) — 링크 패널의 모든 항목
- [플러그인 실행](../running-plugins.md#reviewing-a-runs-changes) — Review 대화상자 전체
- [작업 및 실행](../tasks.md#review-and-apply) — 적용 방식과 독립 검사
