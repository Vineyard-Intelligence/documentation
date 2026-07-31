# Developer Guide

자신의 GitHub 저장소에서 JavaScript **플러그인** 및/또는 JSON **Type Pack**을 작성한 다음, 레지스트리에 한 줄짜리 포인터를 게시하여 Vineyard용 확장 기능을 빌드하세요. 이 섹션은 작동하는 아이디어에서 게시된 설치 가능한 확장 기능까지 단계별로 안내합니다.

## 한 문단으로 보는 모델

**자신의 저장소**에서 플러그인(JavaScript) 및/또는 Type Pack(JSON)을 작성하고 그곳에서 번들을 빌드합니다. 배포하려면 Marketplace 레지스트리에 **단일 메타데이터 항목**(코드가 아닌 포인터)을 추가하는 풀 리퀘스트를 엽니다. 사용자가 확장 기능을 설치하면 Vineyard 앱이 사용자의 릴리스에서 번들을 다운로드하고, 로컬에 캐시한 다음, **클라이언트 측 샌드박스에서** 실행합니다. 서버는 플러그인 코드를 실행하지 않고, 플러그인 바이트를 저장하지 않으며, 기본적으로 플러그인이 생성하는 작업을 기록하지 않습니다. 설치하는 사용자는 매니페스트가 선언한 스코프만 부여하고, 코드는 단기 수명의 스코프 클램프 토큰을 보유한 호스트 브리지를 통해 접근되는 Web Worker에서 실행됩니다.

## 두 가지 콘텐츠 유형

모든 Vineyard 문서는 `content_type` 구분자를 가지며, 식별자는 reverse-DNS입니다:

| 콘텐츠 유형 | `content_type` | 식별자 형식 | 설명 |
|---|---|---|---|
| **Type Pack** | `vineyard:typepack` | `run.vineyard.typepacks.<name>` | 노드 **엔티티 타입**과 선택적 **엣지 타입**(아이콘, 색상, 프로퍼티, 유효성 검사기)을 정의하는 JSON입니다. |
| **Plugin** | `vineyard:plugin` | `run.vineyard.plugins.<name>` | `definePlugin({ manifest, run })`을 내보내는 번들 JS 모듈로, 그래프를 읽고 씁니다. |

플러그인의 `io` 블록은 Type Pack 타입을 정규화된 `category.name` 형식(예: `infrastructure.ip_address`)으로 참조하므로, 두 시스템은 함께 배송되도록 설계되었지만 각각 독립적으로 게시할 수 있습니다.

## 사전 요구 사항

- **JavaScript 또는 TypeScript.** SDK(`@vineyard/plugin-sdk`)는 타입이 지정되어 있으며 TypeScript를 권장하지만 필수는 아닙니다.
- **번들러**(esbuild, Vite, Rollup 또는 유사). 플러그인은 매니페스트의 `platforms.web.entry`에서 참조되는 단일 번들 모듈(예: `dist/cidr.js`)로 배포됩니다.
- **릴리스가 있는 GitHub 저장소.** 레지스트리는 포인터만 저장하며, 실제 번들은 클라이언트가 다운로드하고 캐시하는 귀하의 저장소에서 호스팅됩니다.

!!! note "초기 범위는 브라우저 + 데스크톱"
    **브라우저** 런타임(`platforms.web.runtime: "sandbox-js"`)과 **데스크톱** Electron 셸(`platforms.desktop.runtime: "sandbox-js"`) 모두 현재 배포되어 있습니다. `web-proxy` CORS 우회, `native`/`subprocess` 데스크톱 런타임, 키체인 기반 시크릿 등은 스키마에 미래 지향적 설계로 존재하지만 **연기**된 상태로, 아직 빌드되지 않았습니다. 페이지에서 web-proxy나 native/subprocess를 언급하는 경우, 배포된 기능이 아닌 설계 의도로 간주하세요.

## 다음 단계

=== "빌드 시작하기"

    - [Quickstart](quickstart.md) — 스캐폴딩, 번들링, 로컬에서 플러그인 테스트.
    - [Architecture](architecture.md) — 클라이언트 측 실행, 레지스트리, 임시 작업이 어떻게 함께 작동하는지.

=== "매니페스트 작성하기"

    - [Plugin manifest](plugin-manifest.md) — `cidr_expand` 예제와 함께 모든 필드 설명.
    - [Plugin Packs](plugin-packs.md) — 하나의 번들, 여러 플러그인.
    - [Type Packs](typepacks.md) — 엔티티 타입, 엣지 타입, 아이콘, 유효성 검사기.

=== "권한 및 배포"

    - [Scopes](../reference/scopes.md) — 플러그인이 얻는 유일한 권한.
    - [SDK](sdk.md) — `definePlugin`, `HostContext`, 샌드박스.
    - [Security](security.md) — 시크릿, RunToken, CSP 이그레스.
    - [Publishing](publishing.md) — 레지스트리 PR.

## 참고

- [Reference: scopes](../reference/scopes.md) 및 용어집
- [Running plugins](../guide/running-plugins.md)
- [Home](../index.md) · [Marketplace](../marketplace.md)
