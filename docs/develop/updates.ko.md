# Updates

Vineyard가 설치된 플러그인이나 Type Pack의 새 버전을 감지, 게이트, 적용하는 방식. 별도의 "업데이트" 파이프라인은 없습니다 — 업데이트는 단순히 새로운 불변 `ref`에서 [install](../guide/installing.md)을 재실행하며, 새로운 해시 확인과 스코프 차이를 수반합니다.

## 레지스트리 항목이 최신 포인터입니다

Vineyard는 업데이트를 위해 작성자 저장소를 폴링하지 않습니다. **레지스트리 항목이 표준 최신 포인터**입니다: `community-pluginpacks.json`(또는 `community-typepacks.json`)의 각 행은 현재 `version`, 불변 `ref`, 그리고 해당 ref의 매니페스트를 확인하는 `repo`/`path`를 가집니다. 마켓플레이스가 레지스트리를 가져올 때, 앱은 이미 설치된 모든 것의 최신 게시 버전을 알고 있습니다 — 저장소별 네트워크 팬아웃이 필요하지 않습니다.

작성자별 `manifest.latest_url` 필드는 기본 메커니즘이 아닌 **폴백** 포인터입니다. 이는 작성자의 항상 최신 매니페스트를 가리키며, 카탈로그 외부의 업데이트 확인(예: [로컬 개발](quickstart.md) 중 매니페스트 URL에서 직접 설치된 플러그인)을 위해 존재합니다. 레지스트리를 통해 게시된 모든 항목의 경우, 항목이 우선합니다.

!!! info "업데이트가 실제로 무엇인가"
    `ref`는 불변입니다 — 40자 커밋 SHA 또는 주석 태그이며, 브랜치는 거부됩니다([distribution](distribution.md) 참조). 제자리에서 업데이트하지 **않습니다**. 새 버전은 새 레지스트리 항목 투영으로 게시된 새 ref이며, 이를 적용하는 것은 해당 ref에서의 전체 재설치입니다.

## 앱이 업데이트를 감지하는 방법

앱은 프로젝트/사용자별로 `{ identifier, version, ref }` 형태의 설치 레코드를 보유합니다. 업데이트를 찾기 위해 각 설치된 `identifier@version`을 동일 식별자의 레지스트리 항목과 비교합니다:

- 항목 `ref`가 설치된 `ref`와 일치하면 현재 버전입니다.
- 항목이 해당 식별자에 대해 **더 새로운 `ref`**를 노출하면, 마켓플레이스가 카드와 상세 페이지에 **"Update available"**을 표시합니다.

비교가 불변 `ref`에서 이루어지므로(`version`이 SemVer 미러), 확인은 정확합니다: 보유한 바이트가 레지스트리가 현재 가리키는 바이트인지에 대한 모호함이 없습니다.

## 업데이트 적용

**Update**를 선택하면 새 ref에서 설치 파이프라인이 재실행됩니다 — [installing](../guide/installing.md)에 문서화된 동일한 파이프라인으로, 새로 다운로드된 바이트에 대한 `distribution.integrity`에 대한 **새로운 해시 확인**, **스코프 차이**(아래), 그리고 활성화가 포함됩니다. 이전 캐시 번들은 새 것으로 교체됩니다. 설치 레코드는 새 `{ version, ref }`로 업데이트됩니다.

## 스코프 차이

이것이 업데이트를 조용한 새로고침과 다르게 만드는 부분입니다. Vineyard는 새 버전이 요청하는 [scopes](../reference/scopes.md)를 이미 승인한 스코프와 비교합니다.

- 새 버전이 **새 권한을 요청하지 않으면**, 업데이트는 재확인 없이 적용됩니다.
- 새 버전이 **새 스코프를 요청하면**, 앱은 스코프 승인 대화상자를 **재표시**하며, **차이를 강조**합니다 — 추가되는 정확한 동사나 네트워크 엔드포인트.

!!! warning "새 버전이 조용히 범위를 확장할 수 없습니다"
    스코프는 플러그인이 얻는 유일한 권한입니다. v1.0에 비해 `node:delete`, `edge:delete`, `network` 엔드포인트, 또는 `message:post`를 추가한 v1.1은 이러한 추가 사항을 정확히 보여주는 새로운 승인을 트리거합니다. 업데이트 승인은 차이에 기반한 귀하의 결정입니다 — 작성자가 귀하의 등 뒤에서 확장할 수 있는 것이 없습니다.

대화상자는 마켓플레이스 미리보기와 동일한 `scopeToBadge()` 렌더링을 사용합니다.

=== "v1.0.0 스코프 (이미 승인됨)"

    ```jsonc
    "scopes": {
      "graph": ["node:read", "node:create", "edge:create"]
    }
    ```

=== "v1.1.0 스코프 (업데이트 제공됨)"

    ```jsonc
    "scopes": {
      "graph": ["node:read", "node:create", "edge:create",
                "node:delete"],                              // + 신규 — 재확인
      "network": [                                           // + 신규 — 재확인
        { "endpoint": "https://api.example.com", "methods": ["POST"], "purpose": "enrich" }
      ]
    }
    ```

이 예제에서 업데이트 대화상자는 `node:delete`와 단일 네트워크 엔드포인트의 두 가지 추가 사항을 강조합니다. 승인할 때까지 새 ref는 활성화되지 않습니다.

## 게이팅: 어떤 버전이 제공되는가

두 가지 레지스트리 신호가 더 새로운 ref가 귀하에게 제공될지 여부를 결정합니다.

### `compat.min_app_version`

각 레지스트리 항목은 `compat.min_app_version`을 가질 수 있습니다 — 항목의 ref가 지원하는 가장 오래된 Vineyard 런타임(`MAJOR.MINOR.PATCH` 문자열)입니다. 앱은 귀하의 실행 중인 앱 버전에 대해 **제공된 버전을 게이트**합니다: 더 새로운 ref가 귀하의 것보다 더 새로운 런타임을 요구하면, 해당 버전은 업데이트로 제공되지 않습니다. 앱 자체를 업데이트할 때까지 현재 버전을 유지합니다. 이는 런타임이 실행할 수 없는 번들을 가져오는 것을 방지합니다.

### `deprecation.json`

레지스트리 저장소(`Vineyard-Intelligence/registry`)는 철회된 버전을 나열하는 `deprecation.json`을 유지 관리합니다. **`deprecation.json`에 나열된 ref는 절대 설치되지 않습니다** — 신규 설치나 업데이트 대상으로 모두 해당됩니다. 최신 항목이 폐기된 경우, 앱은 이를 제공하지 않습니다. 이전에 설치되었지만 지금은 폐기된 ref는 로컬 캐시에서 계속 작동하지만 현재로 광고되는 것은 중단됩니다.

## Type Pack도 동일한 방식으로 업데이트됩니다

Type Pack은 동일한 모델을 따릅니다: `community-typepacks.json` 항목이 최신 포인터이며, `identifier@version`/`ref`에서 차이가 계산되고, 더 새로운 ref가 새 해시 확인과 함께 해당 ref에서 재설치됩니다. Type Pack은 스코프를 선언하지 않으므로 스코프 차이는 없습니다 — 그러나 `compat.min_app_version` 게이팅과 `deprecation.json` 제외는 동일하게 적용됩니다. 스키마는 [Type Packs](typepacks.md)를, 항목 투영은 [registry schema](../reference/registry-schema.md)를 참조하세요.

## 다음 / 참고

- [Installing](../guide/installing.md) — 업데이트가 재실행하는 설치 파이프라인.
- [Distribution & storage](distribution.md) — 불변 ref, 무결성 해시, 클라이언트 측 캐싱.
- [Publishing](publishing.md) — 새 버전이 새 레지스트리 항목이 되는 방식.
- [Scopes reference](../reference/scopes.md) — 스코프 차이가 비교하는 것.
- [Registry schema](../reference/registry-schema.md) — `version`, `ref`, `compat` 필드.
