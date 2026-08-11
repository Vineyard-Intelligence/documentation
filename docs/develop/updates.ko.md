# Updates

Vineyard가 설치된 플러그인이나 Type Pack의 새 버전을 감지하고 적용하는 방식.

## 레지스트리 항목이 최신 포인터입니다

Vineyard는 업데이트를 위해 작성자 저장소를 폴링하지 않습니다. **레지스트리 항목이 표준 최신 포인터**입니다: `community-pluginpacks.json`(또는 `community-typepacks.json`)의 각 행은 현재 `version`, 불변 `ref`, 그리고 해당 ref의 매니페스트를 확인하는 `repo`/`path`를 가집니다. 마켓플레이스가 레지스트리를 가져올 때, 앱은 이미 설치된 모든 것의 최신 게시 버전을 알고 있습니다 — 저장소별 네트워크 팬아웃이 필요하지 않습니다.

작성자별 `manifest.latest_url` 필드는 기본 메커니즘이 아닌 **폴백** 포인터입니다. 이는 작성자의 항상 최신 매니페스트를 가리키며, 카탈로그 외부의 업데이트 확인(예: [로컬 개발](quickstart.md) 중 매니페스트 URL에서 직접 설치된 플러그인)을 위해 존재합니다. 레지스트리를 통해 게시된 모든 항목의 경우, 항목이 우선합니다.

!!! info "업데이트가 실제로 무엇인가"
    `ref`는 불변입니다 — 40자 커밋 SHA 또는 주석 태그이며, 브랜치는 거부됩니다([distribution](distribution.md) 참조). 제자리에서 업데이트하지 **않습니다**. 새 버전은 새 레지스트리 항목 투영으로 게시된 새 ref이며, 이를 적용하는 것은 해당 ref에서의 전체 재설치입니다.

## 앱이 업데이트를 감지하는 방법

앱은 프로젝트별로 `{ identifier, url, version }` 형태(`project-install.ts`의 `Pointer` 타입)의 설치
레코드를 보유합니다 — **`ref` 필드는 저장하지 않습니다.** 업데이트를 찾기 위해 설치된 `version`
문자열을 동일 식별자의 레지스트리 항목 `version`과 비교합니다:

- 같으면 현재 버전입니다.
- 항목의 `version`이 다르면, 마켓플레이스가 카드와 상세 페이지에 **"Update available"**을 표시합니다.

확인 방식은 불변 `ref` 비교가 아니라 `version` 문자열의 단순 비교입니다 — 바이트 단위 정확한
비교가 아니라 작성자가 `version`을 제대로 올렸는지에 의존합니다.

## 업데이트 적용

**Update**를 선택하면 프로젝트 포인터가 새 항목의 `{ identifier, url, version }`으로 **바로 PATCH**됩니다. 이는 설치 파이프라인을 다시 돌리지 않고, 해시를 다시 확인하지 않으며, 새로 설치할 때 뜨는 스코프 승인 대화상자도 띄우지 않습니다 — 지금은 버전을 올리는 것만으로 재확인 없이 스코프나 엔드포인트가 늘어날 수 있습니다.

예전 초안에서 가져온 매니페스트에는 제거된 `publish` 스코프(`message:post`)가 아직 선언되어 있을 수 있습니다. 이 스코프는 더 이상 존재하지 않으며(플러그인은 채팅 메시지를 게시할 수 없습니다), [플러그인 스키마](../reference/plugin-schema.md)에서 `scopes`가 `additionalProperties: false`이므로, 이를 선언한 버전은 업데이트로 제공되는 대신 검증에 실패합니다.

## 게이팅: 어떤 버전이 제공되는가

### `compat.min_app_version`

각 레지스트리 항목은 `compat.min_app_version`을 가질 수 있습니다 — 항목의 ref가 지원하는 가장 오래된 Vineyard 런타임(`MAJOR.MINOR.PATCH` 문자열)입니다. 현재는 정보 제공용일 뿐입니다: 마켓플레이스 상세 페이지가 "Min app version"으로 표시하지만, 실행 중인 앱 버전과 비교하는 로직은 없습니다.

### `status` (deprecated / withdrawn)

별도의 폐기 파일은 없습니다. 버전 게시 취소는 레지스트리 항목 자체의 `status` 블록 — `{ state, reason, since, replacement }` — 으로 이루어지며, `packs/`의 해당 팩 행을 수정하는 방식입니다. 독립된 목록 파일이 아닙니다([팩 내리기](publishing.ko.md) 참조). **`withdrawn`** ref는 업데이트로 제공되지 않고, 신규 설치도 불가능하며, 이미 설치한 프로젝트도 다음 실행에서 로드를 거부합니다 — 대신 사유가 표시됩니다. **`deprecated`** ref는 설치와 업데이트가 정상적으로 계속되며, 분석가에게는 프로젝트를 열 때마다 한 번 알림만 표시됩니다.

## Type Pack도 동일한 방식으로 업데이트됩니다

Type Pack은 동일한 모델을 따릅니다: `community-typepacks.json` 항목이 최신 포인터이고, 위에서 설명한 것과 같은 단순 `version` 문자열 비교로 업데이트를 확인합니다. Type Pack은 스코프를 선언하지 않고, registry-typepack-entry 스키마에는 `compat` 필드 자체가 없어 최소 버전 메타데이터도 없습니다. `status`(deprecated/withdrawn)에 따른 제외는 Plugin Pack과 동일하게 적용됩니다. 스키마는 [Type Packs](typepacks.md)를, 항목 투영은 [registry schema](../reference/registry-schema.md)를 참조하세요.

## 다음 / 참고

- [Distribution & storage](distribution.md) — 불변 ref와 번들이 실제로 오는 경로.
- [Publishing](publishing.md) — 새 버전이 새 레지스트리 항목이 되는 방식.
- [Registry schema](../reference/registry-schema.md) — `version`, `ref`, `compat` 필드.
