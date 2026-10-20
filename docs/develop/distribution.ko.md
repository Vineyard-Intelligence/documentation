# 배포

앱이 무엇을 로드할지는 레지스트리 항목(`repo`, `ref`, `path`)과, 플러그인의 경우 `platforms.web.entry`가 결정합니다. 팩 문서는 자신이 어디에 게시되는지 기술하지 않으며, 그것을 가리키는 레지스트리 항목이 그 역할을 합니다.

## 고정된 포인터

레지스트리 항목(`packs/<identifier>.json`)은 콘텐츠 저장소(`repo`, `owner/name` 형식), 로드할 커밋(`ref`), 그 커밋 안의 문서 경로(`path`)를 지정합니다. 클라이언트는 `https://cdn.jsdelivr.net/gh/{repo}@{ref}/{path}`를 가져옵니다. 전체 필드별 참조는 [레지스트리 엔트리 스키마](../reference/registry-schema.md)에 있습니다.

!!! warning "`ref`는 불변이어야 합니다 — 브랜치와 태그는 거부됨"
    레지스트리 항목의 `ref`는 40-16진수 또는 64-16진수 커밋 SHA여야 합니다. 브랜치와 태그는 검토 후 옮겨질 수 있으므로 항목 스키마와 `verify_pinned.py`가 **거부**합니다. 새 버전이 업데이트로 제공되는 방식은 [업데이트](updates.md)를 참조하세요.

## 코드 모듈: `platforms.web.entry`

플러그인의 `platforms.web.entry`는 플러그인 워커가 임포트하는 모듈을 지정합니다: 같은 고정 커밋을 기준으로 해석되는 저장소 루트 기준 상대 경로(예: `dist/pack.mjs`), 또는 절대 URL입니다. 자체 `platforms.web` 블록이 없는 팩 멤버는 팩의 모듈을 실행합니다. 실행할 entry가 없는 플러그인은 실행 가능 목록에 나타나지 않으며, 모듈을 가리키지 않는 `inline` entry는 레지스트리 CI가 거부합니다.

## 저장: 메타데이터 전용

- 레지스트리는 **경로/메타데이터만** 보유합니다(승인된 ref 목록에 기록되는 각 승인 문서의 SHA-256 포함). 번들 콘텐츠의 **서버 측 복사본이 없습니다**.
- **클라이언트**는 팩 콘텐츠를 jsDelivr 경유로, 항목의 커밋 SHA에 고정해 가져옵니다: 팩 문서는 프로젝트를 열 때마다, 플러그인 코드 모듈은 실행할 때마다 가져옵니다. 영속 로컬 캐시는 없습니다.

### 검증

클라이언트는 팩의 `repo@ref/path`가 `registry/approved-{plugin,type,skill}packs.json`에 있고, 가져온 문서가 거기 기록된 SHA-256과 일치할 때만 로드합니다. 레지스트리에 닿을 수 없으면 이 기기가 전에 검증한 포인터는 계속 로드되고, 나머지는 보류됩니다. 플러그인 코드 모듈(`platforms.web.entry`)이 매니페스트와 같은 버전과 라이선스를 선언하는지는 CI가 확인합니다([레지스트리에 배포하기](publishing.md#the-pin) 참조).

## 설치 흐름에서의 위치

Plugin Pack을 설치하면 설치 대화상자의 권한 보기를 위해 항목의 `repo@ref/path`에 있는 문서를 (jsDelivr 경유로) 가져오고(Skill Pack은 개요를 위해 가져옵니다), 프로젝트에 `{identifier, url, version}` 포인터를 저장합니다. 프로젝트를 열 때 각 포인터는 위와 같이 레지스트리 기준으로 검증되고, 플러그인의 `platforms.web.entry`는 같은 고정 커밋을 기준으로 해석되어 샌드박스 워커에서 로드됩니다. 제출/검토 게이트는 [레지스트리에 배포하기](publishing.md)를 참조하세요.

## 다음 / 참고

- [레지스트리에 배포하기](publishing.md) — 단일 항목 PR 제출. 불변 `ref` 및 무결성 게이트.
- [업데이트](updates.md) — 새 버전이 업데이트로 제공되는 방식.
- [퀵스타트: 첫 플러그인](quickstart.md) — **Settings → Plugins → Development → Load a pack from a URL**은 작성 중인 팩을 URL에서 이 기기에만 로드합니다.
- [플러그인 매니페스트](plugin-manifest.md) — `platforms.web.entry`와 나머지 매니페스트.
- [레지스트리 엔트리 스키마](../reference/registry-schema.md) — 메타데이터 전용 항목이 저장하는 것.
