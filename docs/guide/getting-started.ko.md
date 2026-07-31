# 시작하기

첫 실행 안내: Vineyard 앱을 열고, 프로젝트를 생성하고, 마켓플레이스에서 **Type Pack**과 **플러그인**을 설치한 후, 해당 플러그인을 그래프에 대해 실행합니다. 핵심 루프는 *프로젝트 → 유형 → 플러그인 → 임시 실행*입니다.

## 1. 앱 열기

Vineyard는 현재 브라우저에서 실행됩니다. 로그인하면 프로젝트 목록 화면이 표시됩니다.

플러그인과 Type Pack은 **클라이언트에서 실행**됩니다: 서버는 그래프를 저장하고 협업을 중개하지만, 플러그인 코드를 절대 실행하지 않습니다. 이유는 [아키텍처](../develop/architecture.md)를 참조하세요.

## 2. 프로젝트 열기 또는 생성하기

**프로젝트**는 그래프(노드 + 엣지), 협업자, 설치된 Type Pack 및 플러그인 세트를 소유합니다.

- **기존 프로젝트:** 목록에서 선택하세요.
- **새 프로젝트:** *생성*을 선택하고 이름을 지정하면 바로 캔버스로 이동합니다.

!!! note "설치는 프로젝트에 속합니다"
    Type Pack과 플러그인은 계정이 아닌 **프로젝트에** 설치되므로, 해당 프로젝트의 모든 협업자가 동일한 어휘와 도구를 사용할 수 있습니다. 프로젝트 소유자만 설치된 세트를 변경할 수 있습니다.

## 3. 캔버스 살펴보기

캔버스는 작업 영역입니다 — 팬, 줌, 레이아웃이 가능한 노드/엣지 그래프입니다. 메뉴, 우클릭 메뉴, 사이드 패널에 대한 전체 둘러보기는 [캔버스](canvas.md)를 참조하세요.

새 프로젝트에는 아직 **엔티티 유형이 없습니다**. 이를 Type Pack이 해결합니다.

## 4. 마켓플레이스 열기

캔버스에서 **프로젝트 → 마켓플레이스에서 추가…**를 선택하세요. 이름/작성자/설명으로 검색하고, `?type=pluginpack` / `?type=typepack`, 플랫폼, 카테고리, 인증 상태로 필터링한 다음, 카드를 열어 상세 정보를 확인하세요. 전체 둘러보기는 [둘러보기 및 설치](installing.md)를 참조하세요.

## 5. Type Pack 추가하기 (엔티티 유형)

**Type Pack**은 노드가 가질 수 있는 **엔티티 유형**(및 선택적 엣지 유형)을 정의하는 순수 JSON입니다. 플러그인의 입력과 출력이 Type Pack 유형으로 표현되므로, 플러그인보다 먼저 설치하세요.

마켓플레이스에서 Type Pack으로 전환하고 **Infrastructure** (`run.vineyard.typepacks.infrastructure`)를 설치하세요. 여기에는 `infrastructure.ip_address`, `infrastructure.netblock`, `infrastructure.domain`과 같은 엔티티 유형이 포함되며, 각각 `category.name`으로 참조됩니다. 자세한 내용은 [Type Pack](typepacks.md)에서 확인하세요.

## 6. 플러그인 설치하기

**플러그인**은 그래프를 읽거나 쓰는 JavaScript로, 필요한 **스코프**를 정확히 선언합니다(예: `node:read`, `node:create`, `edge:create`). 처음 설치하기 좋은 두 가지:

- **CIDR Expand** — 순수 계산, 네트워크 없음. `infrastructure.netblock` 노드를 소비하고 그 안의 개별 `infrastructure.ip_address` 노드를 **생성**합니다. (이 때문에 Infrastructure를 먼저 설치한 것입니다.)
- **Chaos Reference Pack** (`run.vineyard.pluginpacks.chaos`) — 하나의 번들, 여러 플러그인: Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node. 일회용 그래프에서 실행 루프를 학습하기 위한 파괴적이지만 무해한 장난감입니다.

설치 시 **승인 대화상자**에 플러그인의 스코프가 나열되어, 부여하기 전에 접근 가능한 항목을 확인할 수 있으며, 이후 번들은 로컬에 캐시됩니다. 자세한 내용은 [둘러보기 및 설치](installing.md)에서 확인하세요.

## 7. 실행하기

플러그인 실행 방식은 **소비하는 대상**에 따라 다릅니다:

- **노드 유형을 대상으로 하는 경우** (예: CIDR Expand는 `infrastructure.netblock`을 소비) → **일치하는 노드의 우클릭 메뉴**에 나타나며, 해당 노드가 입력으로 미리 바인딩됩니다.
- **전체 그래프에서 작동하는 경우** (예: 아무것도 소비하지 않는 Korean Roulette) → 전역 **플러그인 실행** 메뉴에서 실행합니다.

플러그인이 입력 `params`를 선언한 경우, 작은 실행 전 양식이 나타납니다(CIDR Expand의 경우 CIDR 블록 — 우클릭한 노드에서 이미 채워져 있음). 확인하면 실행이 시작됩니다.

**작업** 패널에서 확인하세요. 작업은 `queued → running → {succeeded | failed | cancelled}`로 이동하며(속도 제한이나 사용자 입력에 대해 `waiting`/`paused` 포함), 실행 중에는 **중지**, **일시 중지**, 진행률 제어가 제공됩니다. CIDR Expand의 경우, 새 `infrastructure.ip_address` 노드가 생성되면서 캔버스에 나타납니다.

## 8. 실행은 임시입니다

기본적으로 실행에 관한 어떤 것도 서버에 저장되지 않습니다 — 완료된 작업에서 명시적 **저장** 작업을 사용하여 결과를 보관하세요. 자세한 내용은 [작업 및 실행](tasks.md)을 참조하세요.

## 다음 / 함께 보기

- [둘러보기 및 설치](installing.md) — 검색, 필터링, 설치 파이프라인, 스코프 승인, 로컬 캐싱.
- [플러그인 실행하기](running-plugins.md) — 실행 경로, 작업 패널, 실행 수명 주기 심층 설명.
- [Type Pack (사용자 가이드)](typepacks.md) — 엔티티 유형의 역할과 관리 방법.
- [아키텍처](../develop/architecture.md) — 플러그인이 클라이언트에서 실행되는 이유.
