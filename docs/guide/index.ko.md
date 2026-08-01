# 사용자 가이드

VINEYARD은 클라이언트 측 그래프 분석 도구입니다. 엔티티와 관계로 그래프를
구축한 다음, 자신의 세션에서 완전히 둘러보고, 설치하고, 실행하는 **팩**으로
앱을 확장합니다.

## 팩이 제공하는 것

세 가지 종류의 팩이 있습니다:

- **Plugin Pack** — 그래프의 노드와 엣지를 읽거나, 생성하거나, 수정하는 JavaScript
  액션입니다(허가 시 네트워크 호출도 가능).
- **Type Pack** — 그래프가 이해하는 **엔티티 유형**과 **엣지 유형**의 JSON 정의로,
  노드에 속성, 유효성 검사 규칙, 아이콘, 색상을 부여합니다.
- **Skill Pack** — AI 에이전트가 사건을 다룰 때 따를 수 있는 조사 플레이북입니다.
  텍스트만 있으며 — 코드도 권한도 없습니다.

## 멘탈 모델

팩을 **마켓플레이스에서 둘러보고**, 해당 레퍼런스를 앱에 **설치**하면, 앱이 이를
**클라이언트 측에서 그래프에 실행**합니다. Vineyard 서버는 메타데이터 포인터만
제공할 뿐 — 플러그인 코드를 실행하지 않고, 플러그인 바이트를 저장하지 않으며,
기본적으로 실행 기록을 기록하지 않습니다. 각 실행은 저장을 선택하지 않는 한
임시 채팅처럼 **임시**입니다.

## 다음 단계

<div class="vy-cardgrid" markdown>

<div class="vy-card" markdown>
### :material-rocket-launch: 시작하기
몇 분 안에 그래프를 설정하고 첫 번째 플러그인을 실행하세요.
→ [시작하기](getting-started.md)
</div>

<div class="vy-card" markdown>
### :material-download: 둘러보기 및 설치
팩을 찾고, 접근 가능한 항목을 검토하고, 설치하세요.
→ [둘러보기 및 설치](installing.md)
</div>

<div class="vy-card" markdown>
### :material-play: 플러그인 실행하기
노드의 우클릭 메뉴 또는 전역 실행 메뉴에서 플러그인을 실행하세요.
→ [플러그인 실행하기](running-plugins.md)
</div>

<div class="vy-card" markdown>
### :material-shape: Type Pack 작업하기
엔티티 및 엣지 유형을 추가하여 그래프가 새로운 종류의 데이터를 인식하게 하세요.
→ [Type Pack 작업하기](typepacks.md)
</div>

<div class="vy-card" markdown>
### :material-book-open-variant: Skill Pack 작업하기
AI 에이전트에게 사건을 다룰 조사 플레이북을 제공하세요.
→ [Skill Pack 작업하기](skillpacks.md)
</div>

<div class="vy-card" markdown>
### :material-graph: 캔버스
노드와 엣지의 그래프를 탐색하고, 배치하고, 스타일링하세요.
→ [캔버스](canvas.md)
</div>

<div class="vy-card" markdown>
### :material-progress-clock: 작업 및 실행
진행 중인 실행을 추적하고, 취소하고, 저장할 항목을 결정하세요.
→ [작업 및 실행](tasks.md)
</div>

</div>

## 다음 / 함께 보기

- [마켓플레이스 둘러보기](../marketplace.md) — 정적 마켓플레이스 브라우저
- [개발자 문서](../develop/index.md) — 자신만의 팩을 빌드 및 게시
- [레퍼런스](../reference/index.md) — 스키마 및 스코프
