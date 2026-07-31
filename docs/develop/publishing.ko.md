# Publishing to the registry

Plugin Pack이나 Type Pack을 공개 Vineyard 마켓플레이스에 게시하는 것은 레지스트리 저장소에 대한 단일 풀 리퀘스트입니다. **하나의** 메타데이터 항목을 추가하면, `VineyardReviewBot`이 유효성을 검사하고, 사람이 병합하며, 다음 레지스트리 가져오기 시 항목이 라이브로 전환됩니다 — 앱 릴리스가 필요하지 않습니다.

## 레지스트리 저장소는 메타데이터만 보유합니다

제출은 **`Vineyard-Intelligence/registry`**로 이루어집니다. 저장소는 *포인터와 파생 측면*을 보유하며, 코드나 매니페스트 또는 번들의 복사본을 절대 보유하지 않습니다. 전체 매니페스트/Type Pack JSON, README, 스크린샷, 번들은 모두 **귀하의** 작성자 저장소에 고정된 `ref`에 남아 있습니다. 마켓플레이스 상세 페이지는 거기서 지연 하이드레이션됩니다.

| 파일 | 역할 |
|---|---|
| `community-pluginpacks.json` | 플러그인(또는 팩)당 하나의 간소화된 항목: identifier, name, author, description, repo, ref, path, version, platforms, `scopes_summary`, `verified`. |
| `community-typepacks.json` | Type Pack용 대칭 항목. 스코프 대신 `categories`/`type_count`/`edge_count`를 가집니다(코드가 실행되지 않음). |
| `community-skillpacks.json` | Skill Pack용 대칭 항목. 스코프 대신 `applies_to`/`section_count`/`requires`를 가집니다(텍스트만 있으며, 코드가 실행되지 않음). |
| `community-plugin-stats.json` / `community-typepack-stats.json` | 설치/활성화 횟수 — Vineyard 인프라가 유지 관리하며, **제출자가 아님**. |
| `deprecation.json` / `removed.json` | 철회된 버전 / 목록 제외된 항목. |
| `verified-authors.json` | "verified" 배지의 출처. CI가 멤버십을 항목에 미러링하며 — 절대 자체 주장되지 않음. |
| `schemas/` | CI 봇이 항목을 검증하는 기준이 되는 게시된 메타 스키마. |

제출 시 세 카탈로그 파일 중 **하나**만 편집하며, 단일 항목만 추가합니다.

## 제출 워크플로

=== "단계"

    1. `Vineyard-Intelligence/registry`를 **포크**합니다.
    2. **불변 `ref` 고정** — 작성자 저장소의 릴리스 **커밋 SHA**. 태그와 브랜치는 가변이며 거부됩니다. `scripts/resolve_ref.py`로 태그/브랜치를 커밋 SHA로 확인하세요.
    3. `community-pluginpacks.json`(Plugin Pack), `community-typepacks.json`(Type Pack) 또는 `community-skillpacks.json`(Skill Pack)에 **항목 하나를 추가**합니다. 통계, 폐기, 제거, verified-authors 파일은 편집하지 마세요 — 이들은 제출자 소유가 아닙니다.
    4. **PR을 엽니다.** `VineyardReviewBot`이 검증 결과를 상태 확인으로 게시합니다.
    5. **차단 실패를 수정**한 다음, 사람의 병합을 기다립니다.
    6. CI 통과 + 병합 후, 항목은 **다음 레지스트리 가져오기 시 라이브**됩니다 — 클라이언트가 정적 JSON을 가져오며, 결합된 앱 릴리스가 없습니다.

=== "참고"

    - 항목의 `identifier`는 `manifest.identifier`(또는 `typepack.identifier`)와 동일해야 하며 reverse-DNS 형식 `run.vineyard.plugins.*` / `run.vineyard.typepacks.*`을 사용합니다.
    - `ref`가 코드를 고정하는 유일한 요소입니다. 불변이므로, 새 버전을 게시한다는 것은 새로운 `ref`에 새 항목을 추가하는 것을 의미합니다 — [Updates](updates.md)를 참조하세요.
    - 파생 필드(`platforms`, `scopes_summary`, `categories`, `type_count`, …)는 전체 매니페스트/Type Pack의 투영이므로, 찾아보기 페이지가 모든 매니페스트를 가져오지 않고도 렌더링됩니다.

## 봇이 검증하는 것

`VineyardReviewBot`에는 두 계층이 있습니다. **차단** 검사는 사람이 병합하기 전에 통과해야 합니다. **권고** 검사는 참고로 표시되지만 절대 차단하지 않습니다.

### 차단 (통과 필수)

- **레지스트리 항목 스키마.** 항목이 `schemas/registry-plugin-entry` 또는 `schemas/registry-typepack-entry`에 대해 유효성을 검사합니다.
- **양쪽 카탈로그에서의 식별자 고유성.** 식별자가 기존 Plugin Pack *또는* Type Pack 항목과 충돌할 수 없습니다.
- **불변 `ref`.** 반드시 **커밋 SHA**(40-16진수 또는 64-16진수)여야 합니다. 태그와 브랜치는 가변적이며(다른 코드로 재지정 가능) **거부**됩니다 — 검토된 정확한 커밋을 고정하세요(`version`은 사람이 읽을 수 있는 미러).
- **전체 매니페스트/Type Pack이** `repo@ref/path`에서 게시된 플러그인/Type Pack 스키마에 대해 유효성 검사 — 간소화된 레지스트리 행뿐만 아니라.
- **`web-proxy` ⇒ 정확히 하나의 `network` 엔드포인트, 그리고 `proxy_endpoint`와 동일.** web-proxy 플러그인은 단일 프록시 호스트만 선언할 수 있습니다. [scopes](../reference/scopes.md)를 참조하세요.
- **시크릿처럼 보이는 파라미터 키 없음.** 자격 증명처럼 보이는 파라미터 키(api_key, token, secret, …)는 거부됩니다. 시크릿은 사용자 대상 params가 아닌 `secret: true`와 함께 `scopes.config`에 있어야 합니다(데스크톱 전용).
- **Type Pack 교차 필드 불변성:** `label_property`가 존재하고 **non-optional**이어야 함. 모든 `enum`/`default`가 해당 프로퍼티 타입과 일치해야 함. 각 엣지 타입의 `from`/`to`가 선언된 노드 타입으로 해석되어야 함.

### 권고 (절대 차단하지 않음)

- `node:delete` / `edge:delete` 사용(그래프 파괴적 동사).
- `net + node:read` 조합(데이터가 그래프를 떠남 + 네트워크 이그레스).
- 난독화 전용 번들(검사할 읽을 수 있는 소스 없음).

!!! tip "권고 ≠ 거부"
    Chaos 팩 — Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node — 은 전적으로 `node:delete`/`edge:delete`에 의존합니다. 여전히 잘 게시됩니다. 이러한 플래그는 *정보 제공용*입니다.

## 샘플 레지스트리 항목

`community-pluginpacks.json`에 추가되는 **Plugin Pack** 항목입니다. `plugin_count`는 여러 플러그인이 있는 팩(하나의 파일 → 여러 플러그인)을 표시하여 마켓플레이스가 하나의 카드를 보여주고 포함된 모든 플러그인을 함께 설치합니다:

```json
{
  "identifier": "run.vineyard.pluginpacks.chaos",
  "content_type": "vineyard:pluginpack",
  "name": "Chaos Reference Pack",
  "author": "vineyard-run",
  "description": "A bundle of 6 graph-manipulation plugins for demo/validation: Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node. Installing once adds all 6 together.",
  "repo": "Vineyard-Intelligence/chaos-pack",
  "ref": "v1.0.0",
  "path": "plugins/chaos-pack.manifest.json",
  "version": "1.0.0",
  "platforms": ["web"],
  "scopes_summary": { "network": false, "graph_write": true, "publish": false, "secret_config": false },
  "plugin_count": 6,
  "compat": { "min_app_version": "1.0.0" },
  "verified": true
}
```

`community-typepacks.json`에 추가되는 Type Pack 항목(스코프 없음. `categories`/`type_count`/`edge_count`가 측면을 구동):

```json
{
  "identifier": "run.vineyard.typepacks.infrastructure",
  "content_type": "vineyard:typepack",
  "name": "Infrastructure",
  "author": "vineyard-run",
  "description": "A base Type Pack defining network-infrastructure entities (IP address, domain, URL, autonomous system, certificate).",
  "repo": "Vineyard-Intelligence/typepacks",
  "ref": "v1.0.0",
  "path": "typepacks/infrastructure.json",
  "version": "1.0.0",
  "categories": ["infrastructure"],
  "type_count": 5,
  "edge_count": 0,
  "verified": true
}
```

!!! note "필드 참조"
    필수 필드는 `identifier`, `content_type`, `name`, `author`, `description`, `repo`, `ref`, `path`입니다. `content_type`은 리터럴 `vineyard:plugin`, `vineyard:pluginpack`, 또는 `vineyard:typepack`입니다. 전체 필드 목록과 제약 조건은 [registry-schema](../reference/registry-schema.md)에 있습니다.

## 병합 후

Vineyard 측 빌드 단계도 없고 앱 버전 변경도 없습니다. PR이 병합되면 정적 카탈로그 JSON이 업데이트되고, 다음에 클라이언트가 레지스트리를 가져올 때 귀하의 항목이 파생 배지와 함께 찾아보기에 나타납니다. 설치/활성화 횟수가 통계 파일에 누적되기 시작합니다(Vineyard 인프라가 유지 관리). `verified` 배지는 CI에 의해 설정된 `verified-authors.json`의 멤버십을 따릅니다.

## 다음 / 참고

- [Distribution](distribution.md) — 번들이 패키징되고 가져와지는 방식 (`distribution.kind`: zip 자산 / git 트리 / inline).
- [Updates](updates.md) — 새로운 불변 `ref`를 추가하여 새 버전 배포.
- [registry-schema](../reference/registry-schema.md) — 필드별 전체 스키마 참조.
- [scopes](../reference/scopes.md) — 스코프 문자열과 web-proxy 엔드포인트 규칙.
- [Marketplace](../marketplace.md) — 귀하의 항목이 등록되는 정적 마켓플레이스 브라우저.
