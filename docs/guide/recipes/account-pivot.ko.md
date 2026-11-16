# 계정·핸들 피벗

[앞 레시피](phishing-domain.md)의 피싱 페이지에는 텔레그램 연락처 `@vardelmoth_ops`가 있고, 키트의
설정 파일에는 이메일 주소 `vardelmoth@quillpost.test`가 적혀 있습니다. 이것을 쓰는 사람의 다른
계정을 찾고, 같은 이름을 쓰는 계정 가운데 어느 것이 다른 사람의 것인지 가리려 합니다. 여기 나오는
이름은 지어낸 것입니다([예시에 대해](index.md#about-the-examples)).

## 시작할 때 가진 것 {#what-you-start-with}

- 핸들 `vardelmoth_ops`와 그것을 본 곳.
- 이메일 주소 `vardelmoth@quillpost.test`. 프로필 URL로 시작해도 됩니다(starter **Start from a
  profile page**).

## 시작하기 전에 {#before-you-start}

데스크탑 앱에서 작업합니다. **Project → Add from Marketplace…**에서 다음을 설치합니다.

| 팩 | 더해 주는 것 | 필요한 것 |
|---|---|---|
| **Account & identity pivoting** (Skill Pack) | 이런 질문에 AI 에이전트가 따르는 플레이북 | WhatsMyName이 필요하며 함께 설치됩니다 |
| **WhatsMyName** | 핸들이 약 700개 사이트에 등록되어 있는지 | 데스크탑 앱 |
| **GitHub** | GitHub 계정의 저장소, 커밋 신원, GPG 키, 활동 시간대 | GitHub 토큰 |
| **PGP Key Lookup** | 사용자 ID에 주소가 들어 있는 공개 키(키 디렉터리 네 곳) | 데스크탑 앱 |
| **Disposable Email** | 주소의 도메인이 일회용 메일 서비스인지 | 키 없음 |
| **Telegram** | 텔레그램 사용자명이 가리키는 프로필(가입하지 않고 읽음) | Vineyard 계정(로그인) |
| **X (Twitter)** | X 계정의 공개 프로필과 최근 게시물 | 데스크탑 앱 |

이 플러그인들이 쓰는 Type Pack(Identity, Infrastructure, Social Media, Telegram)은 함께
설치됩니다.

Account & identity pivoting은 WhatsMyName을 실행할 수 있는 곳에서만 제공되므로, 브라우저에서는
**Run ▸ Skill packs**에 나오지 않습니다. 이 탐색은 내 컴퓨터에서 사이트마다 프로필 페이지를
요청합니다.

## 단계 {#steps}

### 1. 핸들과 주소를 캔버스에 올리기 {#seed}

**Types** 패널에서 **Handle**을 누르고, Properties 패널의 `handle`에 `vardelmoth_ops`를,
`first_seen_context`에 그것을 본 곳을 입력합니다. **Email Address**를 누르고 `email`에
`vardelmoth@quillpost.test`를 입력합니다.

### 2. 탐색하기 전에 군중을 가늠하기 {#judge-the-crowd}

무엇이든 실행하기 전에, 서로 무관한 사람 몇 명이 같은 핸들을 쓸 수 있을지 생각합니다. 흔한
단어, 이름, 팬덤에서 따온 말은 수천 명이 쓰며, 그런 핸들이 정확히 일치해도 아무도 묶어 주지
않습니다. `vardelmoth_ops`는 드물지만 `shadow`는 그렇지 않습니다. starter **Deep-dive one handle**
(7단계)은 에이전트가 이 추정부터 하고 그 근거를 말하게 합니다.

### 3. 핸들 탐색하기 {#sweep}

Handle을 선택하고 **R**을 누른 뒤 **WhatsMyName Account Search**에 체크하고 **Run**을 누릅니다.
검토하고 적용합니다.

볼 것:

- 핸들이 발견된 사이트마다 Account 노드 하나(`username`, `platform`, `profile_url`)가 생기고,
  Handle에서 **same handle**로 이어집니다. 요약은 오탐일 가능성이 높아 빼 둔 것을 blocked로 셉니다.
- 이것들이 무엇인지: 후보입니다. 이 링크의 등급은 `recorded`이며, 이는 그 사이트에 이 이름의
  계정이 있다는 것을 도구가 기록했다는 뜻이지 같은 사람의 것이라는 뜻이 아닙니다.

WhatsMyName은 Email Address도 받습니다. `@` 앞부분으로 탐색하고, 주소에서 Handle로 **uses
handle** 링크를 잇습니다.

### 4. 이메일 주소 읽기 {#email}

Email Address를 선택하고 **Disposable Email Check**와 **PGP Key Lookup**을 실행합니다.

볼 것:

- 주소의 `is_disposable`. 일회용 주소는 그때를 위해 만든 것이라 더 이어지지 않습니다.
- **key bound to**로 이어진 PGP Key 노드와 그 사용자 ID. `user_id_sources`는 사용자 ID마다 어느
  디렉터리가 그것을 내주었는지, 그 가운데 주소를 확인하는 곳이 있는지 알려 줍니다. 주소를 확인하지
  않는 디렉터리의 키에는 누구의 주소든 들어갈 수 있습니다.
- 키의 사용자 ID에 있는 다른 주소. 각각 새 Email Address로 같은 방법으로 읽습니다.

### 5. 프로필마다 그 안의 단서 읽기 {#profiles}

후보를 하나씩 다룹니다.

- **GitHub 계정:** **GitHub GPG Keys**는 그 계정의 키와, GitHub가 그 계정에서 확인한 주소
  (**registered email on this account (GitHub GPG key)**)를 줍니다. **GitHub Account
  Repositories**는 저장소를 나열하고, 저장소 URL에 **GitHub Commit Identities**를 실행하면 커밋에
  쓰인 이름과 주소가 나옵니다. **GitHub Activity Timeline**은 계정의 최근 활동을 하루의 시간대별로
  센 `activity_hours_utc`를 씁니다.
- **X 계정:** **X Profile**은 소개, 위치, 웹사이트, 가입일을, **X Posts**는 최근 게시물을 씁니다.
- **텔레그램 핸들:** Handle에 **Telegram Resolve**를 실행하면, 그 핸들이 지금 가리키는 텔레그램
  사용자가 소개와 함께 만들어져 **currently resolves to**로 이어집니다.

두 계정을 묶어 주는 것을 찾습니다. 한 프로필의 웹사이트나 소개가 다른 계정을 가리키는 것, 두 계정에
같은 PGP 키 지문이 있는 것, 같은 확인된 주소. 표시 이름, 아바타 스타일, 핸들 자체는 묶어 주지
않습니다.

### 6. 쌍마다 판단하기 {#decide}

**Run ▸ Skill packs**에서 **Account & identity pivoting**을 고르고 starter **Are these the same
person?**을 고릅니다. **First account**와 **Second account**를 채우고 **Ask the agent to follow
this**를 누른 뒤 프롬프트를 보냅니다. **Rule out a false match**는 반대 질문을 하고, **Sort
candidates by how well they hold up**은 목록 전체를 받습니다.

답에서 볼 것:

- 쌍이 공유하는 속성마다 그것을 가진 사람이 얼마나 되는지, 그 수치가 무엇에 기대는지.
- 공유하는 속성 둘이 서로 독립인지, 한 번의 행위에서 나왔는지. 다른 프로필을 베낀 프로필은 소개,
  아바타, 링크를 한꺼번에 갖고 옵니다.
- 아직 열린 쌍이라면 그것을 판가름할 검사 하나. 플레이북은 에이전트가 같은 사람이라는 주장을
  링크로 스테이징하기 전에 반박해 보게 하고, 핸들 공유만으로는 그런 링크를 스테이징하지 않게
  합니다.

### 7. 에이전트에게 탐색 전체를 맡기기 (선택) {#agent-sweep}

starter **Deep-dive one handle**(**Handle or username**, **What you already know (optional)**)은 2–6단계를
조사 하나로 실행합니다. 군중을 가늠하고, 탐색하고, 찾은 프로필을 읽고, 후보를 가려냅니다. **Start
from an email address**는 주소에서 같은 일을 합니다. 변경은 턴마다 내 검토를 기다립니다.

### 8. 내 결론 기록하기 {#record}

증거가 두 계정을 묶어 주면 링크를 직접 그립니다. 하나를 선택하고 다른 하나를 **⌘**-클릭(**Ctrl**-클릭)한
뒤, 결론이 아니라 증거로 링크 이름을 짓습니다. 예를 들어 `same PGP key fingerprint`나
`bio links this account`입니다([엣지 그리기](../canvas.md#엣지-그리기)). 직접 그린 링크는 `asserted` 등급을 받고
*Edited here*로 표시됩니다.

두 플랫폼의 두 계정은 두 노드로 둡니다. **Merge nodes…**는 한 개체가 두 번 기록된 경우를 위한
것이며, 합쳐지는 노드를 삭제합니다([노드 병합](../canvas.md#merging-nodes)).

## 끝나는 곳 {#where-it-ends}

한 번 돌아도 계정이 늘지 않고 판가름 나는 쌍도 없을 때, 또는 남은 단서에 설치된 어떤 것도 할 수
없는 검사가 필요할 때 피벗이 끝납니다. starter **Summarise what the project establishes**(**Who or what
the summary is about**)는 다섯 부분으로 보고합니다. 한 주인으로 교차 확인된 것과 그 증거, 아직
후보인 것과 그것을 판가름할 검사, 배제한 것과 그 이유, 실행했지만 빈 결과가 나온 것, 설치된 어떤
것도 닿을 수 없는 것. **What would settle the open questions?**는 열린 쌍을 검사 목록으로 바꿉니다.

단서가 개인 도메인이나 메일 서버 같은 인프라로 바뀌면
[피싱 도메인에서 인프라까지](phishing-domain.md)로 돌아갑니다.

## 함정 {#pitfalls}

- **핸들을 공유한다고 사람을 공유하는 것은 아닙니다.** 비슷한 변형도 마찬가지입니다.
  `vardel_moth`는 다른 문자열이지 일치가 아닙니다.
- **이름으로 찾은 계정은 누구의 것이든 될 수 있습니다.** 선점한 사람, 동명이인, 그 뒤 이름을 바꾼
  계정일 수 있으니 세기 전에 프로필을 읽으세요.
- **텔레그램 사용자명은 주인이 바뀝니다.** 사용자명은 해제되었다가 무관한 계정이 가져갈 수 있으므로
  **currently resolves to**는 지금 쥔 쪽입니다. **Telegram Phone Lookup**에 결과가 없다고 그 번호에
  계정이 없다는 증거는 아닙니다.
- **커밋 주소는 커밋한 사람이 입력한 값입니다.** GPG 키처럼 GitHub가 계정에서 확인한 주소가 더 강한
  연결입니다.
- **사람은 이름으로 식별됩니다.** 이름이 같은 `identity.person` 노드 둘은 하나가 됩니다. 사람에게는
  구별되는 라벨을 붙이세요([Type Pack 사용하기](../typepacks.md)).
- **데이터가 가는 곳.** Vineyard 서버의 프로젝트라면 사람에 대해 모은 것이 그 서버에 저장되고
  협업자에게 보이며, 에이전트는 읽은 노드를 내 AI 프로바이더에게 보냅니다. 내 컴퓨터를 떠나면 안 되는
  사건은 로컬 모드에서 다루세요. 로컬 모드에서는 Telegram 팩이 실행되지 않습니다
  ([로그인 모드와 로컬 모드](../modes.md)).

## 다음 / 함께 보기

- [Skill Pack 사용하기](../skillpacks.md) — Skill pack 패널과 starter
- [리뷰와 증거 등급 읽기](review-and-grades.md) — 탐색한 링크가 `recorded`인 이유와 `asserted`가
  말하는 것
- [플러그인 실행](../running-plugins.md) — GitHub 토큰 같은 키와 리뷰
