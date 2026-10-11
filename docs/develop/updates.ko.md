# Updates

Vineyard가 설치된 Plugin Pack, Type Pack, Skill Pack의 새 버전을 감지하고 적용하는 방식.

## 레지스트리 항목이 최신 포인터입니다

Vineyard는 업데이트를 위해 작성자 저장소를 폴링하지 않습니다. **레지스트리 항목이 표준 최신 포인터**입니다: `community-pluginpacks.json`(또는 `community-typepacks.json`)의 각 행은 현재 `version`, 불변 `ref`, 그리고 해당 ref의 매니페스트를 확인하는 `repo`/`path`를 가집니다. 마켓플레이스가 레지스트리를 가져올 때, 앱은 이미 설치된 모든 것의 최신 게시 버전을 알고 있습니다.

매니페스트의 `latest_url` 필드는 허용되지만 사용되지 않습니다. 앱에는 카탈로그 밖의 업데이트 확인이 없습니다. [로컬 개발](quickstart.md) 중 URL에서 로드한 팩은 설치된 것이 아니며, 로드할 때마다 그 URL에서 다시 가져오므로 항상 현재 빌드입니다.

!!! info "업데이트가 실제로 무엇인가"
    `ref`는 불변입니다: 커밋 SHA(40-16진수, SHA-256 저장소는 64-16진수)입니다. 태그와 브랜치는 옮겨질 수 있으므로 거부됩니다([publishing](publishing.md#the-pin) 참조). 제자리에서 업데이트하지 **않습니다**. 새 버전은 새 레지스트리 항목 투영으로 게시된 새 ref이며, 이를 적용하는 것은 해당 ref에서의 전체 재설치입니다.

## 앱이 업데이트를 감지하는 방법

앱은 프로젝트별로 `{ identifier, url, version }` 형태의 설치 레코드를 보유합니다 — **`ref` 필드는 저장하지 않습니다.** 업데이트를 찾기 위해 설치된 `version`을 동일 식별자의 레지스트리 항목 `version`과 SemVer로 비교합니다: 카탈로그 버전이 **더 새로울** 때만 업데이트가 제공됩니다(`1.10.0`은 `1.9.0`보다 새롭고, 정식 릴리스는 자신의 프리릴리스보다 새롭습니다). 같거나 낮은 버전, 또는 SemVer가 아닌 버전이면 아무것도 제공되지 않습니다.

카탈로그에 더 새로운 버전이 있으면 마켓플레이스가 카드에 **Update** 버튼을, 상세 드로어에 **Update available**을 표시합니다.

확인은 `ref`가 아니라 `version`을 비교합니다: `version`을 올리지 않고 새 `ref`만 다시 고정하면, 이미 팩을 설치한 프로젝트에는 절대 전달되지 않습니다.

## 업데이트 적용

**Update**를 선택하면 새로 설치할 때와 같은 승인 대화상자가 열리며, 분석가가 확인하기 전에는 아무것도 바뀌지 않습니다. Plugin Pack의 경우 새 버전이 추가하는 권한마다 **New** 표시가 붙습니다. 새 버전에 필요하지만 프로젝트에 아직 없는 팩 — Plugin Pack에는 Type Pack, Skill Pack에는 Plugin Pack — 은 **Also installs** 아래에 나열되고 같은 단계에서 함께 추가됩니다. 그중 하나라도 카탈로그에 없거나 `withdrawn` 상태이면 업데이트가 거부됩니다. 확인하면 프로젝트 포인터가 새 항목의 `{ identifier, url, version }`을 가리키도록 바뀝니다.

`publish`는 스코프 스키마에 없으며, 앱은 이를 무시하고 아무 권한도 주지 않으므로 매니페스트에 선언되어 있다면 제거하세요.

## 게이팅: 어떤 버전이 제공되는가

### `compat.min_app_version`

각 레지스트리 항목은 `compat.min_app_version`을 가질 수 있습니다 — 항목의 ref가 지원하는 가장 오래된 Vineyard 런타임(`MAJOR.MINOR.PATCH` 문자열)입니다. 현재는 정보 제공용일 뿐입니다: 마켓플레이스 상세 페이지가 "Min app version"으로 표시하지만, 실행 중인 앱 버전과 비교하는 로직은 없습니다.

### `status` (deprecated / withdrawn)

별도의 폐기 파일은 없습니다. 버전 게시 취소는 레지스트리 항목 자체의 `status` 블록 — `{ state, reason, since, replacement }` — 으로 이루어지며, `packs/`의 해당 팩 행을 수정하는 방식입니다([팩 내리기](publishing.md#taking-a-pack-down) 참조). **`withdrawn`** ref는 업데이트로 제공되지 않고, 신규 설치도 불가능하며, 이미 설치한 프로젝트도 다음 실행에서 로드를 거부합니다 — 대신 사유가 표시됩니다. **`deprecated`** ref는 설치와 업데이트가 정상적으로 계속되며, 분석가에게는 프로젝트를 열 때마다 한 번 알림만 표시됩니다.

## Type Pack도 동일한 방식으로 업데이트됩니다

Type Pack은 동일한 모델을 따릅니다: `community-typepacks.json` 항목이 최신 포인터이고, 위에서 설명한 것과 같은 SemVer 비교로 업데이트를 확인합니다. Type Pack은 스코프를 선언하지 않고, registry-typepack-entry 스키마에는 `compat` 필드 자체가 없어 최소 버전 메타데이터도 없습니다. `status`(deprecated/withdrawn)에 따른 제외는 Plugin Pack과 동일하게 적용됩니다. Skill Pack도 마찬가지입니다: `community-skillpacks.json` 항목이 최신 포인터이고, Update는 프로젝트의 `skills` 포인터를 새 항목으로 바꿉니다. 스키마는 [Type Packs](typepacks.md)를, 항목 투영은 [registry schema](../reference/registry-schema.md)를 참조하세요.

## 다음 / 참고

- [Distribution & storage](distribution.md) — 불변 ref와 번들이 실제로 오는 경로.
- [Publishing](publishing.md) — 새 버전이 새 레지스트리 항목이 되는 방식.
- [Registry schema](../reference/registry-schema.md) — `version`, `ref`, `compat` 필드.
