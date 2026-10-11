# 둘러보기 및 설치

## 마켓플레이스 둘러보기

마켓플레이스는 정적인 카탈로그입니다: 모든 검색, 필터링, 정렬은 브라우저에서 수행됩니다.
계정, 서버 쿼리, 텔레메트리가 없습니다.

두 곳에서 둘러볼 수 있습니다. 두 곳 모두 같은 카탈로그를 보여 주지만 필터는 동일하지 않습니다:

- **이 사이트의 [마켓플레이스 페이지](../marketplace.md)** — 공개 읽기 전용 브라우저.
- **Vineyard 앱 내부의 인앱 미러** — 여기서 바로 **Install**로 설치할 수 있습니다.

<figure class="vy-shot" markdown="span">
  ![프로젝트 안의 마켓플레이스](../assets/guide/marketplace.webp){ width="800" loading=lazy }
  <figcaption>프로젝트에서 연 마켓플레이스: 종류 토글, Installed / Updates available 전환, 카드마다 있는 Install 버튼.</figcaption>
</figure>

### 검색 및 필터링

검색 상자는 항목의 **이름**, **작성자**, **설명**, **식별자**와 일치하며 입력에 따라
실시간으로 필터링됩니다. Type Pack의 카테고리와도 일치하며, 앱에서는 Plugin Pack이 쓰는
Type Pack과 Skill Pack이 적용되는 노드 유형과도 일치합니다. 이 사이트의 브라우저에서는 세 가지 측면이 그리드를 좁히며, 이들은 조합됩니다:

| 측면 | 역할 |
|---|---|
| **Type** (유형) | 세그먼트 토글: **All**, **Plugin packs**, **Type packs**, 또는 **Skill packs**. |
| **Category** (카테고리) | Type Pack 카테고리의 드롭다운 (예: `infrastructure`, `threat`). 카탈로그에 카테고리가 있을 때 표시되며, 카테고리는 Type Pack에만 있으므로 하나를 고르면 그리드에 Type Pack만 남습니다. |
| **Verified only** | 작성자가 인증 목록에 없는 모든 항목을 숨기는 체크박스. |

**Sort**(정렬) 드롭다운이 보이는 카드를 재정렬합니다: **Name A→Z**, **Name Z→A**, **Verified first**,
또는 **Group by type**.

인앱 브라우저는 더 가벼운 필터 구성을 가집니다: 동일한 **Type** 토글과 **Verified only** 스위치는
있지만 카테고리 측면은 없으며, 정렬은 **Name**/**Author**/**Kind** 기준입니다. 프로젝트 안에서는
두 번째 토글로 그리드를 **All**, **Installed**, **Updates available**로 좁힐 수 있습니다.

### 카드 읽기

각 카드는 간결한 요약입니다: **아이콘**과 **이름**, 메타 줄, 한 줄 **설명**, 그리고 푸터의
칩. 메타 줄은 *작성자 · 종류 · 개수 · 버전* 형식이며(예: *VINEYARD · Plugin pack · 4 plugins ·
v1.2.0*), 인증된 경우 작성자 앞에 ✓ 표시가 붙습니다. 개수는 Plugin Pack이 묶은 플러그인
수(둘 이상일 때), Type Pack이 정의하는 유형 수, Skill Pack의 섹션 수입니다. 칩은 팩이
요구하는 것만 알려 줍니다:

- **Plugin Pack**의 경우: 플러그인 전부 또는 일부가 데스크톱 앱에서만 실행되면
  `Desktop only` 또는 `Some desktop only`, API 키를 요구하면 `API key`, Vineyard가 운영하는
  서비스를 호출하면 `Vineyard service`.
- **Skill Pack**의 경우: 필요한 Plugin Pack에 대해 `Needs N plugins`. 적용되는 노드 유형은
  상세 보기에 나열됩니다.
- **Type Pack**에는 칩이 없습니다.

전체 권한 목록은 카드가 아니라 상세 보기에 있습니다.

<figure class="vy-shot" markdown="span">
  ![마켓플레이스 카드](../assets/guide/marketplace-card.webp){ width="434" loading=lazy }
  <figcaption>Plugin Pack 카드: 이름 아래의 메타 줄(작성자 · 종류 · 개수 · 버전)과 Some desktop only 칩.</figcaption>
</figure>

### 상세 보기

카드를 클릭하면 상세 드로어가 열립니다. Plugin Pack의 경우 **Permissions** 패널이 팩
전체가 요청하는 것을 평이한 언어로 다시 표현합니다 — 예를 들어 앱에서는 *"Delete nodes"*나
*"Network requests to rdap.org"*, 이 사이트에서는 *"Network: calls rdap.org."*. 설치 전에
이것을 읽으세요. 드로어에는 팩에 포함된 플러그인 목록과 함께 팩의 **식별자**(예:
`run.vineyard.pluginpacks.ip_recon`), **버전**, **라이선스**, 저장소도 표시됩니다. 앱에서는
Plugin Pack이 필요로 하는 Type Pack이 함께 설치됩니다.

<figure class="vy-shot" markdown="span">
  ![마켓플레이스 상세 드로어](../assets/guide/marketplace-drawer.webp){ width="657" loading=lazy }
  <figcaption>상세 드로어는 플러그인마다 입력·출력 유형과 권한을 보여 줍니다.</figcaption>
</figure>

!!! note "인증(✓)의 의미"
    인증 ✓는 *작성자의 신원*을 증명합니다 — 레지스트리가 설정하며 작성자가 아닙니다.
    특정 팩의 안전성이나 품질에 대해서는 아무것도 말하지 않습니다: 설치 전에 항상
    권한을 직접 검토하세요.

## 설치하기

프로젝트에서 마켓플레이스를 열고(**Project → Add from Marketplace…**) 카드에서 **Install**을
클릭하면 Vineyard가 나머지를 처리합니다. 프로젝트 밖에서 연 마켓플레이스는 둘러보기
전용이라 **Install**이 표시되지 않습니다. **Install**이 비활성화되어 있으면 마우스를 올려
이유를 확인하세요 — 예: *Only the project owner can install*. 팩의 오프라인 복사본은 없습니다:
Vineyard는 프로젝트를 열 때마다 고정된 커밋의 팩을 작성자의 저장소에서 불러오고, 플러그인
코드는 실행할 때마다 불러옵니다.

**플러그인**의 경우, **승인 대화상자**가 요청하는 권한을 평이한 언어로 나열합니다.
승인하면 플러그인을 프로젝트에서 실행할 수 있게 됩니다.

<figure class="vy-shot" markdown="span">
  ![설치 승인 대화상자](../assets/guide/install-approval.webp){ width="565" loading=lazy }
  <figcaption>Domain Recon의 승인 대화상자: 권한마다 한 줄씩 표시되며, 네트워크 권한 아래에는 팩이 밝힌 이유가 붙습니다.</figcaption>
</figure>

**Type Pack**이나 **Skill Pack**은 권한을 담지 않지만 같은 설치 대화상자를 거칩니다:
추가될 내용(Type Pack의 유형 개수, 또는 Skill Pack의 개요, 그리고 함께 끌어오는 팩)을 보여 주고,
**Install**을 누르면 설치됩니다.

!!! tip "팩은 의존성을 자동으로 함께 설치합니다"
    입력/출력이 Type Pack의 유형을 참조하는 플러그인은 해당 Type Pack이 설치되어 있어야
    합니다 — 마켓플레이스가 이를 해결합니다: Plugin Pack을 설치하면 그 플러그인들이
    `consume`/`produce`하는 모든 Type Pack도 함께 설치되고, Skill Pack을 설치하면 요구하는
    Plugin Pack **그리고 그 Type Pack들**까지 끌어옵니다. 이미 설치된 팩은 건너뛰고,
    카탈로그에 없는 의존성은 설치 자체를 차단합니다.

## 프로젝트에 설치하기

설치는 **프로젝트** 단위로 소속되며, 계정 단위가 아닙니다 — 프로젝트의 모든 협업자가
동일한 어휘와 도구를 받습니다. 설치 세트를 변경할 수 있는 사람은 프로젝트 소유자뿐입니다.

여러 팩을 한 번에 추가하려면 카드에 체크하고(또는 **Select all**) **Install N selected**를
선택하세요. 추가될 모든 것을 대화상자 하나가 보여 줍니다. 설치는 설치한 버전에 고정됩니다.
카탈로그에 더 새 버전이 있으면 카드에 **Update**가, 상세 드로어에 **Update available**이
표시됩니다. 둘 다 설치와 같은 승인 대화상자를 엽니다: 새 버전이 추가하는 권한에는 **New**
표시가 붙고, 새로 필요한 팩은 **Also installs** 아래에 나열됩니다. 확인하기 전에는 아무것도
바뀌지 않습니다. 제거하려면 팩을 열고 **Installed — click to remove**를 클릭하세요. 프로젝트의
노드가 아직 Type Pack의 유형을 쓰고 있으면 먼저 그 개수를 보여 주며 **Remove anyway**로
제거할 수 있습니다. 레지스트리가 퇴역시킨 팩에는 **Deprecated**(여전히 설치 가능, 배지에
마우스를 올리면 사유 표시) 또는 **Withdrawn**(설치 불가, 그 팩을 가진 프로젝트에서만
목록에 남아 제거할 수 있음) 배지가 붙습니다.

## 다음 / 함께 보기

- [플러그인 실행하기](running-plugins.md) — 활성화 후의 과정
- [Type Pack](typepacks.md) — 유형 스키마 활성화
- [Skill Pack](skillpacks.md) — 조사 플레이북 사용
- [작업](tasks.md) — 실행이 임시인 이유
