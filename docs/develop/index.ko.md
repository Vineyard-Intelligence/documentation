# 개발자 가이드

자신의 GitHub 저장소에서 **Plugin Pack**, **Type Pack** 또는 **Skill Pack**을 작성한
다음, 레지스트리에 한 줄짜리 포인터를 게시하여 Vineyard용 확장 기능을 빌드하세요.
이 섹션은 작동하는 아이디어에서 게시된 설치 가능한 팩까지 단계별로 안내합니다.

## 한 문단으로 보는 모델

**자신의 저장소**에서 팩을 작성합니다. 배포하려면 Marketplace 레지스트리에 **단일
메타데이터 항목**(코드가 아닌 포인터)을 추가하는 풀 리퀘스트를 엽니다. 사용자가 팩을
설치하면 Vineyard 앱이 고정된 커밋에서 귀하의 저장소에서 팩을 가져와 로컬에
캐시합니다. 서버는 플러그인 코드를 실행하지 않고, 플러그인 바이트를 저장하지
않으며, 기본적으로 플러그인이 생성하는 실행을 기록하지 않습니다.

## 세 가지 콘텐츠 유형

모든 Vineyard 팩은 `content_type` 구분자를 가지며, 식별자는 reverse-DNS입니다:

| 콘텐츠 유형 | `content_type` | 식별자 형식 | 설명 |
|---|---|---|---|
| **Plugin Pack** | `vineyard:pluginpack` | `run.vineyard.pluginpacks.<name>` | `definePlugin({ manifest, run })`을 내보내는 하나 이상의 번들 JS 모듈로, 그래프를 읽고 변경 사항을 분석가 검토용으로 스테이징합니다. |
| **Type Pack** | `vineyard:typepack` | `run.vineyard.typepacks.<name>` | 노드 **엔티티 타입**과 선택적 **엣지 타입**(아이콘, 색상, 프로퍼티, 유효성 검사기)을 정의하는 JSON입니다. |
| **Skill Pack** | `vineyard:skillpack` | `run.vineyard.skillpacks.<name>` | JSON 텍스트: 에이전트가 따르는 조사 **플레이북**. 코드도 권한도 없습니다. |

세 시스템은 함께 작동하도록 설계되었습니다 — 플러그인의 `io`는 Type Pack 타입을
정규화된 `category.name` 형식으로 참조하고, Skill Pack의 단계는 `requires`에 선언된
플러그인 팩을 호출합니다 — 하지만 각각 독립적으로 게시할 수 있습니다.

## 사전 요구 사항

- **Plugin Pack**은 JavaScript 또는 TypeScript, SDK(`@vineyard/plugin-sdk`), 번들러
  (esbuild, Vite, Rollup 또는 유사)가 필요합니다. 플러그인은 매니페스트의
  `platforms.web.entry`에서 참조되는 단일 번들 모듈로 배포됩니다.
- **Type Pack과 Skill Pack**은 일반 JSON입니다 — 도구 체인 없이 아무 편집기에서나
  작성할 수 있습니다.
- **릴리스가 있는 GitHub 저장소.** 레지스트리는 포인터만 저장하며, 실제 팩 콘텐츠는
  클라이언트가 다운로드하고 캐시하는 귀하의 저장소에서 호스팅됩니다.

!!! note "초기 범위는 브라우저 + 데스크톱"
    **브라우저** 런타임(`platforms.web.runtime: "sandbox-js"`)과 **데스크톱** Electron
    셸(`platforms.desktop.runtime: "sandbox-js"`) 모두 현재 배포되어 있습니다.
    `web-proxy` CORS 우회, `native`/`subprocess` 데스크톱 런타임, 키체인 기반 시크릿
    등은 스키마에 미래 지향적 설계로 존재하지만 **연기**된 상태로, 아직 빌드되지
    않았습니다.

## 다음 단계

=== "플러그인 작성하기"

    - [Quickstart](quickstart.md) — 스캐폴딩, 번들링, 로컬에서 플러그인 테스트.
    - [Plugin manifest](plugin-manifest.md) — `cidr_expand` 예제와 함께 모든 필드 설명.
    - [Plugin Packs](plugin-packs.md) — 하나의 번들, 여러 플러그인.
    - [SDK](sdk.md) — `definePlugin`, `HostContext`, 샌드박스.

=== "타입 정의하기"

    - [Type Packs](typepacks.md) — 엔티티 타입, 엣지 타입, 아이콘, 유효성 검사기.

=== "플레이북 작성하기"

    - [Skill Packs](skillpacks.md) — 문서 형식, 섹션, 스타터.

=== "권한 및 배포"

    - [Scopes](../reference/scopes.md) — 플러그인이 얻는 유일한 권한.
    - [Security](security.md) — 워커 샌드박스, 스테이징된 쓰기, 이그레스 허용목록, 시크릿.
    - [Publishing](publishing.md) — 모든 팩 유형에 대한 레지스트리 PR.
    - [Updates](updates.md) — 새 버전 배포.

## 참고

- [Architecture](architecture.md) — 클라이언트 측 실행, 레지스트리, 임시 작업이 어떻게
  함께 작동하는지.
- [Home](../index.md) · [Marketplace](../marketplace.md)
