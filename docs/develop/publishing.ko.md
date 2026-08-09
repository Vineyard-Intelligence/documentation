# Publishing to the registry

Plugin Pack, Type Pack, Skill Pack을 공개 Vineyard 마켓플레이스에 게시하는 것은 레지스트리 저장소에 대한 단일 풀 리퀘스트입니다. **파일 하나**를 추가하면 CI가 검증하고, 사람이 병합하며, 다음 레지스트리 가져오기 시 항목이 라이브로 전환됩니다 — 앱 릴리스가 필요하지 않습니다.

## 레지스트리 저장소는 메타데이터만 보유합니다

제출은 **`Vineyard-Intelligence/registry`**로 이루어집니다. 저장소는 *포인터와 파생 측면*을 보유하며, 코드나 매니페스트 또는 번들의 복사본을 절대 보유하지 않습니다. 전체 매니페스트/Type Pack JSON, README, 스크린샷, 번들은 모두 **귀하의** 작성자 저장소에 고정된 `ref`에 남아 있습니다. 마켓플레이스 상세 페이지는 거기서 지연 하이드레이션됩니다.

| 경로 | 역할 |
|---|---|
| `packs/<identifier>.json` | **소스이자, 제출이 추가하는 유일한 파일.** 팩 하나당 파일 하나이며, 파일명은 해당 `identifier`입니다. |
| `registry/community-pluginpacks.json` | 게시되는 Plugin Pack 인덱스 — **생성물**. 팩당 하나의 간소화된 항목: identifier, name, author, description, repo, ref, path, version, platforms, `scopes_summary`, `verified`. |
| `registry/community-typepacks.json` | Type Pack용 대칭 항목. 스코프 대신 `categories`/`type_count`/`edge_count`를 가집니다(코드가 실행되지 않음). |
| `registry/community-skillpacks.json` | Skill Pack용 대칭 항목. 스코프 대신 `applies_to`/`section_count`/`requires`를 가집니다(텍스트만 있으며, 코드가 실행되지 않음). |
| `schemas/` | CI가 항목을 검증하는 기준이 되는 게시된 메타 스키마. |
| `verified-authors.json` | verified 배지를 달 수 있는 저자와 각자가 소유한 네임스페이스. **운영자 소유** — 제출이 편집하지 않습니다. |
| `SPEC.md` | 레지스트리 계약 전문 — 항목 형식, 고정 규칙, CI가 강제하는 항목. |

!!! warning "`registry/community-*.json`을 편집하지 마세요"
    이 세 파일은 `scripts/build_registry.py`가 `packs/`에서 빌드하며 병합 시 재생성되므로, 직접 편집하면 덮어써집니다. 항목이 어느 카탈로그에 들어갈지는 `content_type`이 결정하며 — 제출자가 고르지 않습니다.

    팩당 파일 하나라는 구조 덕분에 동시에 열린 제출들이 서로 충돌하지 않고, diff가 다른 작성자의 고정된 `ref`에 닿을 수 없으며, 식별자 중복이 누군가 기억해서 돌려야 하는 검사가 아니라 경로 충돌이 됩니다.

## 제출 워크플로

=== "단계"

    1. `Vineyard-Intelligence/registry`를 **포크**합니다.
    2. **불변 `ref` 고정** — 작성자 저장소의 릴리스 **커밋 SHA**. 태그와 브랜치는 가변이며 거부됩니다. `python scripts/resolve_ref.py owner/repo <태그-또는-브랜치>`로 커밋 SHA를 확인하세요.
    3. **파일 하나** `packs/<identifier>.json`을 추가합니다. 파일명은 항목의 `identifier`와 정확히 일치해야 합니다.
    4. **PR을 엽니다.** `validate` 워크플로가 검증 결과를 상태 확인으로 게시합니다.
    5. **실패를 수정**한 다음, 사람의 병합을 기다립니다.
    6. CI 통과 + 병합 후 카탈로그가 재생성되고, 항목은 **다음 레지스트리 가져오기 시 라이브**됩니다 — 클라이언트가 정적 JSON을 가져오며, 결합된 앱 릴리스가 없습니다.

=== "참고"

    - 항목의 `identifier`는 `manifest.identifier`(또는 `typepack.identifier`)와 동일해야 하며 reverse-DNS 형식 `<본인-네임스페이스>.pluginpacks.*` / `.typepacks.*` / `.skillpacks.*`을 사용합니다 — [세 가지 콘텐츠 유형](index.md) 참조.
    - `ref`가 코드를 고정하는 유일한 요소입니다. 새 버전을 배포하려면 해당 팩의 파일을 그 자리에서 새 `ref`와 `version`으로 수정하세요 — [Updates](updates.md)를 참조하세요.
    - 파생 필드(`platforms`, `scopes_summary`, `categories`, `type_count`, …)는 전체 매니페스트/Type Pack의 투영이므로, 찾아보기 페이지가 모든 매니페스트를 가져오지 않고도 렌더링됩니다. CI가 고정된 문서에서 이들을 전부 다시 계산해 불일치하면 항목을 거부합니다 — 카드에 뜨는 권한 배지는 설명이 아니라 사실 진술입니다.

## CI가 강제하는 것

아래는 모두 **차단** 검사입니다 — 전부 통과해야 풀 리퀘스트를 병합할 수 있습니다. `.github/workflows/validate.yml`에서 실행됩니다.

### 항목

- **파일명이 `identifier`와 일치하고, `content_type`이 알려진 네 종류 중 하나여야 합니다.** (`build_registry.py`)
- **레지스트리 항목 스키마.** 항목이 `schemas/registry-plugin-entry`, `registry-typepack-entry`, `registry-skillpack-entry` 중 하나에 대해 유효성을 검사합니다. (`validate.py`)
- **선언한 의존성이 해석되고, 아직 살아 있어야 합니다.** Skill Pack의 `requires`와 Plugin Pack의 `typepacks`는 이 카탈로그에 있는 팩을 가리켜야 합니다 — 마켓플레이스가 그 목록으로 동반 설치 제안을 만들기 때문에, 해석되지 않는 식별자는 필요한 의존성 없이 설치된다는 뜻입니다. **같은** 풀 리퀘스트에 추가된 팩도 인정되므로, Type Pack과 그것을 쓰는 플러그인을 함께 올릴 수 있습니다. 게시가 취소된(아래 「팩 내리기」) 팩을 의존성으로 두는 것도 같은 이유로 거부됩니다 — 레지스트리가 이미 거둬들인 팩을 동반 설치로 넘기게 되기 때문입니다. (`validate.py`) `verified-authors.json`에 등재된 네임스페이스는 소유자만 게시할 수 있고, 등재된 저자명은 자기 네임스페이스 안에서만 쓸 수 있습니다 — 따라서 `run.vineyard.*`도 `author: vineyard-run`도 타인이 주장할 수 없습니다. `verified`는 운영자가 정하며, 제출이 이를 선언하면 거부됩니다. (`validate.py`)

### 고정(pin)

- **불변 `ref`.** 반드시 **커밋 SHA**(40-16진수 또는 64-16진수)여야 합니다. 태그와 브랜치는 가변적이며 — 검토 후 다른 코드로 재지정 가능 — **거부**됩니다. (`verify_pinned.py`)
- **고정된 문서가 항목과 일치해야 합니다.** `repo@ref/path`의 문서를 가져와 그 `identifier`, `content_type`, `version`이 항목이 광고하는 값과 같아야 합니다. `ref`를 다시 고정하지 않고 메타데이터만 올린 항목은 여기서 실패합니다.
- **요약 필드는 신뢰하지 않고 다시 계산합니다.** `scopes_summary`, `platforms`, `plugin_count`, `section_count`, `type_count`, `edge_count`를 고정된 문서에서 유도해 작성값과 대조합니다. `scopes_summary.network`는 멤버가 `network` **또는** `web_probe`를 선언하면 true입니다 — probe는 임의 호스트에 도달하므로 더 좁은 게 아니라 더 넓은 이그레스입니다. 이 검사가 없던 탓에 도입 시점에 라이브 항목 5건이 자기 매니페스트와 어긋나 있었고, 그중 3건은 팩이 하는 일을 축소해서 광고하고 있었습니다.

### 타입 그래프

모든 `io.consumes` / `io.produces` 항목을 **이 카탈로그에 게시된** Type Pack에 대해 해석합니다:

- `category.name`이 실제로 어떤 게시된 Type Pack이 정의하는 타입이어야 합니다.
- `typepack` 필드가 실제 정의 주체를 가리켜야 합니다.
- 그 Type Pack이 엔트리의 `typepacks` 목록에 있어야 합니다.

레지스트리에 없는 Type Pack은 **허용되지 않습니다** — 설치 흐름은 해석 가능한 것만 동반 설치로 제안할 수 있으므로, 외부 참조는 검증이 안 된 정도가 아니라 모든 사용자에게 깨진 상태입니다. Type Pack을 먼저 게시하고, 그 다음 그것을 쓰는 플러그인을 게시하세요.

이 검사가 차단인 이유는 실패가 시끄럽지 않고 **보이지 않기** 때문입니다. 실행 다이얼로그는 `consumes`에서 허용 시드 타입 집합을 만들어 노드 타입과 대조하는데, 아무것도 정의하지 않은 타입은 어떤 노드와도 매칭되지 않습니다 — 플러그인은 설치되고 승인까지 됐는데 목록에 나타나지 않고, 에러도 없습니다. 정의 없는 `produces` 타입은 더 조용히 나쁩니다: 수집은 성공하고 아이콘도 색도 label property도 없는 노드만 남습니다. 그리고 설치 흐름이 매니페스트가 아니라 엔트리의 `typepacks`를 읽으므로, 쓰면서 선언하지 않은 Type Pack은 그냥 함께 설치되지 않습니다.

### 사람이 판단하는 것

**번들에 대한 정적 분석은 의도적으로 하지 않습니다.** 패턴 매칭 스캐너는 게이트의 권한을 가진 린트입니다 — 같은 동작을 다르게 쓰면 우회되고, 룰을 공개하면 통과하는 형태의 목록을 넘겨주는 셈입니다. 실제로 성립하는 경계는 구조적인 쪽입니다: 샌드박스 워커에는 스토리지도 주변 자격 증명도 없고, `ctx.net`이 파싱된 오리진과 경로 세그먼트 기준으로 매니페스트의 엔드포인트 허용목록을 강제하며, 모든 그래프 쓰기는 분석가가 본인 토큰으로 승인하도록 스테이징됩니다.

따라서 코드 검토는 사람이 번들을 읽는 일이며, 아래가 그 판단 항목입니다. 어느 것도 자동 거부 사유가 아닙니다:

- 팩이 실제로 필요로 하는 것 대비 요청한 스코프의 범위.
- `node:delete` / `edge:delete` 사용(그래프 파괴적 동사).
- `network` + `node:read` 조합(데이터가 그래프를 떠나고, 이그레스가 있음).
- 난독화 전용 번들 — 읽을 수 있는 소스가 없음. 빠른 검토를 원하면 읽히는 코드를 제출하세요.
- 시크릿처럼 보이는 `params` 키. 자격 증명은 사용자 대상 params가 아니라 `secret: true`와 함께 `scopes.config`에 있어야 합니다.
- `native`/`subprocess` 데스크탑 런타임 — 현재 앱이 실행하지 않고, JavaScript처럼 들여다볼 수도 없습니다.

!!! tip "파괴적 ≠ 거부"
    Chaos 팩 — Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node — 은 전적으로 `node:delete`/`edge:delete`에 의존합니다. 문제없이 게시됩니다.

## 제출 예시

`packs/run.vineyard.pluginpacks.chaos.json`으로 제출하는 **Plugin Pack**입니다. `plugin_count`는 여러 플러그인이 있는 팩(하나의 파일 → 여러 플러그인)을 표시하여 마켓플레이스가 하나의 카드를 보여주고 포함된 모든 플러그인을 함께 설치합니다:

```json
{
  "identifier": "run.vineyard.pluginpacks.chaos",
  "content_type": "vineyard:pluginpack",
  "name": "Chaos Reference Pack",
  "author": "vineyard-run",
  "description": "A bundle of 6 graph-manipulation plugins for demo/validation: Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node. Installing once adds all 6 together.",
  "repo": "Vineyard-Intelligence/pluginpack-chaos",
  "ref": "7261823f654395204d9c79f7d597448d97d135f1",
  "path": "plugins/chaos-pack.manifest.json",
  "version": "1.0.0",
  "platforms": ["web"],
  "scopes_summary": { "network": false, "graph_write": true, "secret_config": false },
  "plugin_count": 6,
  "compat": { "min_app_version": "1.0.0" },
  "verified": true
}
```

`packs/run.vineyard.typepacks.infrastructure.json`으로 제출하는 **Type Pack**입니다(스코프 없음. `categories`/`type_count`/`edge_count`가 측면을 구동):

```json
{
  "identifier": "run.vineyard.typepacks.infrastructure",
  "content_type": "vineyard:typepack",
  "name": "Infrastructure",
  "author": "vineyard-run",
  "description": "Network-infrastructure and web OSINT entities and their relationships.",
  "repo": "Vineyard-Intelligence/typepack-basic",
  "ref": "a78c53defbec417eeb8b9f50029c376926cb8c6d",
  "path": "typepacks/infrastructure.json",
  "version": "2.2.0",
  "categories": ["infrastructure", "web"],
  "type_count": 13,
  "edge_count": 11,
  "verified": true
}
```

!!! note "필드 참조"
    필수 필드는 `identifier`, `content_type`, `name`, `author`, `description`, `repo`, `ref`, `path`입니다. `content_type`은 리터럴 `vineyard:plugin`, `vineyard:pluginpack`, `vineyard:typepack`, `vineyard:skillpack`입니다. 전체 필드 목록과 제약 조건은 [registry-schema](../reference/registry-schema.md)에 있습니다.

## 병합 후

병합되면 `packs/`에서 세 카탈로그 파일이 재생성되어 `main`에 바로 커밋됩니다 — GitHub Pages가 브랜치를 그대로 서빙하므로 게시되는 바이트가 트리에 존재해야 하기 때문입니다. 앱 버전 변경은 없습니다. 다음에 클라이언트가 레지스트리를 가져올 때 귀하의 항목이 파생 배지와 함께 찾아보기에 나타납니다.

## 팩 내리기

항목을 삭제하는 것은 팩을 내리는 방법이 **아닙니다**. 프로젝트는 `repo@ref/path`를 가리키는 포인터 — 절대 경로의 불변 CDN URL — 를 저장하는 방식으로 팩을 설치하며, 이후 로드 경로에서 카탈로그에 다시 묻지 않습니다. 행을 지우면 찾아보기에서만 사라지고, 이미 설치한 프로젝트는 고정된 커밋에서 영원히 계속 로드합니다.

그래서 행은 남기고 `status` 블록을 추가합니다:

```json
"status": {
  "state": "deprecated",
  "reason": "Unmaintained since the API it collects from shut down.",
  "since": "2026-08-09",
  "replacement": "com.acme.pluginpacks.recon"
}
```

| 상태 | 카탈로그에서 | 이미 설치한 프로젝트에서 |
|---|---|---|
| `deprecated` | 계속 찾아보기·설치 가능, 배지 표시 | 정상 로드되며, 프로젝트를 열 때마다 한 번 알림 |
| `withdrawn` | 해당 프로젝트가 갖고 있지 않으면 찾아보기에서 숨김, 설치 거부 | **로드하지 않음** — 대신 사유를 표시 |

`reason`은 분석가에게 그대로 노출되므로, 레지스트리가 아니라 분석가를 향해 쓰십시오: 무슨 일이 있었고 무엇을 하면 되는지. `replacement`는 같은 종류의 살아 있는 팩이어야 합니다.

자기 팩을 `deprecated`로 두는 것은 일반 풀 리퀘스트입니다. **`withdrawn`은 운영자의 판단입니다** — 지금 잘 돌아가는 프로젝트에서 팩을 비활성화시키는 조치이며, 유해한 것으로 드러났거나 콘텐츠가 사라진 경우에만 씁니다.

예상해야 할 두 가지:

- **의존하는 쪽을 먼저 고쳐야 합니다.** 살아 있는 팩은 게시 취소된 팩을 `requires`(또는 `typepacks`)에 둘 수 없으므로, CI가 귀하의 팩에 의존하는 팩을 전부 짚어줍니다. 그것들을 갱신하거나, 같은 풀 리퀘스트에서 함께 내리십시오.
- **`withdrawn` 항목은 더 이상 고정 검증을 받지 않습니다.** 콘텐츠가 사라져 있어도 되며 — 보통 그게 이유입니다 — 그래서 pin 검사가 건너뜁니다. `deprecated` 팩은 사용자에게 여전히 로드되므로 고정 검증도 그대로 받습니다.

행을 통째로 지우는 것은 아무도 설치할 수 없었던 항목 — 잘못 낸 제출이나 중복 — 에만 해당합니다.

## 다음 / 참고

- [Distribution](distribution.md) — 번들이 패키징되고 가져와지는 방식 (`distribution.kind`: zip 자산 / git 트리 / inline).
- [Updates](updates.md) — 새로운 불변 `ref`로 다시 고정하여 새 버전 배포.
- [registry-schema](../reference/registry-schema.md) — 필드별 전체 스키마 참조.
- [scopes](../reference/scopes.md) — 스코프 문자열과 엔드포인트 허용목록 규칙.
- [Marketplace](../marketplace.md) — 귀하의 항목이 등록되는 정적 마켓플레이스 브라우저.
