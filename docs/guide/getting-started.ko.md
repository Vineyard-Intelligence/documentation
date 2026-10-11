# 시작하기

첫 실행 안내: Vineyard 앱을 열고, 프로젝트를 만들고, 마켓플레이스에서 **Type Pack**과
**플러그인**을 설치한 다음, 그래프에서 플러그인을 실행합니다.

## 1. 앱 열기

Vineyard는 브라우저에서, 또는 Vineyard 데스크탑 앱으로 실행됩니다. 로그인하면 대시보드에
도착합니다(**Settings → General → Start view**에서 마지막으로 연 프로젝트를 선택했다면, 로그인된
상태로 앱을 다시 열 때 그 프로젝트로 갑니다). 데스크탑 앱은 계정 없이 로컬 모드로도 실행할 수 있으며, 이때도 대시보드에서
시작합니다.

대시보드는 홈 페이지입니다. **Continue**에는 마지막으로 연 프로젝트와 최근 활동한
프로젝트가, **Since your last visit**에는 자리를 비운 사이 다른 사람이 프로젝트에서 바꾼
내용이, **Activity**에는 모든 프로젝트의 변경 내역이 표시됩니다. 서버에 로그인한
상태에서는 그 위의 검색창으로 모든 프로젝트의 엔티티를 찾을 수 있습니다.

플러그인과 Type Pack은 **클라이언트에서 실행**됩니다: 서버는 그래프를 저장하고
협업을 중개하지만, 플러그인 코드는 절대 실행하지 않습니다.

!!! tip "공지사항"
    서버에 로그인한 상태에서는 상단 바 오른쪽에 서비스의 상단 고정 공지가 한 건씩 위로 넘어가며 표시됩니다(마우스를 올리면 멈춥니다). 제목을 누르면 내용을 볼 수 있고, 거기서 **All announcements**를 누르면 전체 공지 목록이 나옵니다. 로컬 모드에는 서버가 없으므로 표시되지 않습니다.

## 2. 프로젝트 열기 또는 만들기

**프로젝트**는 그래프(노드 + 엣지), 협업자, 설치된 팩 세트를 소유합니다.

- **기존 프로젝트:** 목록에서 선택하세요.
- **새 프로젝트:** **Projects** 페이지나 대시보드에서 **New project**를 선택하고, 이름과
  선택적으로 조직을 지정한 뒤 **Create project**를 누르면 캔버스로 바로 이동합니다.

조직은 팀과 프로젝트를 공유하는 단위입니다. **Organizations**의 조직 페이지에는 멤버와
역할, 조직에 속한 프로젝트가 표시되며, 조직의 소유자와 관리자는 거기서 멤버를 초대합니다.

!!! note "설치는 프로젝트에 속합니다"
    팩은 계정이 아닌 **프로젝트**에 설치되므로, 해당 프로젝트의 모든 협업자가 동일한
    어휘와 도구를 받습니다. 설치 세트를 변경할 수 있는 사람은 프로젝트 소유자뿐입니다.

## 3. 캔버스 만나기

캔버스는 작업 표면입니다 — 팬, 줌, 배치할 수 있는 노드/엣지 그래프. 메뉴, 컨텍스트
메뉴, 사이드 패널의 전체 둘러보기는 [캔버스](canvas.md)를 참조하세요.

<figure class="vy-shot" markdown="span">
  ![프로젝트 작업 화면](../assets/guide/workspace.webp){ width="800" loading=lazy }
  <figcaption>프로젝트 작업 화면: 1 메뉴 바, 2 Types, 3 캔버스 툴바, 4 엔티티 검색, 5 미니맵, 6 Messages, 7 Properties, 8 Tasks.</figcaption>
</figure>

새 프로젝트에는 아직 **엔티티 유형이 없습니다**. 그것을 해결하는 것이 Type Pack입니다.

## 4. 마켓플레이스 열기

캔버스에서 **Project → Add from Marketplace…**를 선택하세요. 이름/작성자/설명으로
검색하고, 유형과 인증 상태로 필터링하고, 이름/작성자/종류로 정렬한 다음, 카드를 열어
세부 정보를 확인하세요. 전체 둘러보기는 [둘러보기 및 설치](installing.md)를 참조하세요.

## 5. Type Pack 추가 (엔티티 유형)

**Type Pack**은 노드가 될 수 있는 **엔티티 유형**(및 선택적 엣지 유형)을 정의하는
순수 JSON입니다. 플러그인의 입력과 출력이 Type Pack 유형으로 표현되므로, 플러그인보다
먼저 설치하세요.

마켓플레이스에서 **Type packs**로 전환하고 **Infrastructure**
(`run.vineyard.typepacks.infrastructure`)를 설치하세요. `infrastructure.ip_address`,
`infrastructure.netblock`, `infrastructure.domain` 같은 엔티티 유형을 제공합니다.
자세한 내용은 [Type Pack](typepacks.md)을 참조하세요.

## 6. 플러그인 설치

**플러그인**은 그래프를 읽고/쓰는 JavaScript로, 필요한 권한에 대한 승인을
요청합니다. 좋은 첫 설치 하나로 실행의 두 가지 범위를 다 배울 수 있습니다:

- **Chaos Reference Pack** — 순수 계산·네트워크 없음인 작은 플러그인 여섯 개를
  담은 하나의 번들. 그중 둘이 실행의 두 가지 범위를 보여 줍니다: **Black Hole**은
  선택한 노드에 작용하고(우클릭 → **Run plugins…**), **Korean Roulette**은 전체
  그래프에 작용합니다(**Run ▸ Run plugins…**).

설치하면 **승인 대화상자**가 플러그인의 권한을 평이한 언어로 나열하므로, 승인하기
전에 무엇을 건드릴 수 있는지 알 수 있습니다. 전체 내용은
[둘러보기 및 설치](installing.md)를 참조하세요.

## 7. 실행하기

모든 플러그인은 같은 **Run plugins** 패널에서 실행되며, 플러그인이 무엇을
**소비하는지**가 언제 목록에 나타나는지를 결정합니다:

- **노드 우클릭 → Run plugins…** 는 선택 범위로 **Run plugins** 패널을 엽니다. 선택한 노드
  유형을 소비하는 플러그인과, 노드 유형을 받지 않는 플러그인(선택한 노드에 작용하는
  Black Hole 등)이 나열됩니다.
- 아무것도 선택하지 않은 상태의 **Run ▸ Run plugins…** (또는 빈 캔버스 우클릭)는 같은
  패널을 프로젝트 전체 범위로 엽니다. Korean Roulette 같은 전체 그래프 플러그인은
  여기서 실행하세요.

원하는 플러그인에 체크하세요. 플러그인이 입력을 받으면 패널에서 해당 플러그인 아래에
입력 필드가 나타나니, 필수 항목을 채우세요. 그런 다음 **Run**을 누르세요. 우클릭한 노드는
양식 값이 아니라 실행 대상이 됩니다.

**Tasks**(작업) 패널에서 지켜보세요. 작업은 `running`으로 시작해(실행 중에는 **Stop**
컨트롤이 있습니다) `succeeded`, `failed`, `cancelled` 중 하나로 끝납니다. 실행은 그래프를
직접 수정하지 않습니다: 변경을 스테이징하면 배지에 `succeeded` 대신 **needs review**가
표시됩니다. 이를 클릭해 **Review**(검토) 대화상자를 열고, 변경을 확인한 뒤 **Apply**(또는
**Discard all**)를 누르면 배지가 **applied**(또는 **discarded**)로 바뀝니다. Black Hole의 경우 적용하는 순간 대상 노드의 1-hop 이웃들이 캔버스에서
사라집니다.

<figure class="vy-shot">
  <video src="../../../assets/guide/run-plugin.mp4" poster="../../../assets/guide/run-plugin.webp" width="1280" height="800" muted loop playsinline controls preload="none" aria-label="예시: example.com 우클릭 → Run plugins… → DNS Lookup (A Record) 체크 → Run, 이어서 Tasks의 needs review를 눌러 Apply. IP 주소 노드 두 개가 그래프에 추가됩니다. Black Hole도 절차는 같습니다."></video>
  <figcaption>예시: example.com 우클릭 → Run plugins… → DNS Lookup (A Record) 체크 → Run, 이어서 Tasks의 needs review를 눌러 Apply. IP 주소 노드 두 개가 그래프에 추가됩니다. Black Hole도 절차는 같습니다.</figcaption>
</figure>

## 8. 실행은 임시입니다

실행 자체는 서버에 아무것도 기록하지 않습니다. 실행의 변경은 해당 실행의 검토에서
**Apply**로 승인할 때에만 그래프에 반영되며, **Discard all**은 변경을 버립니다. 자세한
내용은 [작업 및 실행](tasks.md)을 참조하세요.

## 다음 / 함께 보기

- [둘러보기 및 설치](installing.md) — 검색, 필터, 설치, 스코프 승인
- [플러그인 실행하기](running-plugins.md) — 실행 경로와 **Tasks** 패널
- [Type Pack](typepacks.md) — 엔티티 유형이 하는 일과 관리 방법
