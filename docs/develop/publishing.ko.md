# Publishing to the registry

Plugin Pack, Type Pack, Skill Pack을 공개 Vineyard 마켓플레이스에 게시하는 것은 레지스트리 저장소에 대한 단일 풀 리퀘스트입니다. **파일 하나**를 추가하면 CI가 검증하고, 사람이 병합하며, 다음 레지스트리 가져오기 시 항목이 라이브로 전환됩니다 — 앱 릴리스가 필요하지 않습니다.

## 레지스트리 저장소는 메타데이터만 보유합니다

제출은 **`Vineyard-Intelligence/registry`**로 이루어집니다. 저장소는 *포인터와 파생 측면*을 보유하며, 코드나 매니페스트 또는 번들의 복사본을 절대 보유하지 않습니다. 전체 매니페스트/Type Pack JSON, README, 스크린샷, 번들은 모두 **귀하의** 작성자 저장소에 고정된 `ref`에 남아 있습니다. 마켓플레이스 상세 페이지는 거기서 지연 하이드레이션됩니다. Plugin Pack의 코드는 예외입니다: 앱은 `https://cdn.jsdelivr.net/gh/Vineyard-Intelligence/`에서 서빙되는 팩 코드만 실행합니다. 다른 GitHub 소유자의 저장소에 호스팅된 Plugin Pack은 CI를 통과하고 설치될 수는 있지만, 플러그인을 실행할 때 그 `platforms.web.entry` 모듈이 거부됩니다. Type Pack과 Skill Pack은 데이터이므로 어느 저장소에서든 로드됩니다.

| 경로 | 역할 |
|---|---|
| `packs/<identifier>.json` | **소스이자, 제출이 추가하는 유일한 파일.** 팩 하나당 파일 하나이며, 파일명은 해당 `identifier`입니다. |
| `registry/community-pluginpacks.json` | 게시되는 Plugin Pack 인덱스 — **생성물**. 팩당 하나의 간소화된 항목: identifier, name, author, description, repo, ref, path, version, platforms, `scopes_summary`, `verified`. |
| `registry/community-typepacks.json` | Type Pack용 대칭 항목. 스코프 대신 `categories`/`type_count`/`edge_count`를 가집니다(코드가 실행되지 않음). |
| `registry/community-skillpacks.json` | Skill Pack용 대칭 항목. 스코프 대신 `applies_to`/`section_count`/`requires`를 가집니다(텍스트만 있으며, 코드가 실행되지 않음). |
| `registry/approved-*.json` | `scripts/build_approved.py`가 `packs/`의 이력에서 **생성**. 레지스트리가 지금까지 승인한 모든 `repo@ref/path`와 그 문서의 SHA-256을 나열합니다. 앱은 이 목록에 있고 바이트가 다이제스트와 일치하는 포인터만 로드합니다. |
| `schemas/` | CI가 항목을 검증하는 기준이 되는 게시된 메타 스키마. |
| `verified-authors.json` | verified 배지를 달 수 있는 저자와 각자가 소유한 네임스페이스. **운영자 소유** — 제출이 편집하지 않습니다. |
| `SPEC.md` | 레지스트리 계약 전문 — 항목 형식, 고정 규칙, CI가 강제하는 항목. |

!!! warning "`registry/community-*.json`과 `registry/approved-*.json`을 편집하지 마세요"
    세 카탈로그는 `scripts/build_registry.py`가, 세 승인 ref 목록은 `scripts/build_approved.py`가 `packs/`에서 빌드합니다. 둘 다 병합 시 재생성되어 커밋되므로, 직접 편집하면 덮어써집니다. 항목이 어느 카탈로그에 들어갈지는 `content_type`이 결정하며 — 제출자가 고르지 않습니다.

## 제출 워크플로

1. `Vineyard-Intelligence/registry`를 **포크**합니다.
2. **불변 `ref` 고정** — 작성자 저장소의 릴리스 **커밋 SHA**. 태그와 브랜치는 가변이며 거부됩니다. `python scripts/resolve_ref.py owner/repo <태그-또는-브랜치>`로 커밋 SHA를 확인하세요.
3. **파일 하나** `packs/<identifier>.json`을 추가합니다. 파일명은 항목의 `identifier`와 정확히 일치해야 합니다.
4. **PR을 엽니다.** `validate` 워크플로가 검증 결과를 상태 확인으로 게시합니다.
5. **실패를 수정**한 다음, 사람의 병합을 기다립니다.
6. CI 통과 + 병합 후 카탈로그가 재생성되고, 항목은 **다음 레지스트리 가져오기 시 라이브**됩니다 — 클라이언트가 정적 JSON을 가져옵니다.

시작하기 전에 알아둘 것:

- 항목의 `identifier`는 `manifest.identifier`(또는 `typepack.identifier`)와 동일해야 하며 reverse-DNS 형식 `<본인-네임스페이스>.pluginpacks.*` / `.typepacks.*` / `.skillpacks.*`을 사용합니다 — [세 가지 콘텐츠 유형](index.md#the-three-content-types) 참조.
- `ref`가 코드를 고정하는 유일한 요소입니다. 새 버전을 배포하려면 해당 팩의 파일을 그 자리에서 새 `ref`와 더 높은 `version`으로 수정하세요 — [Updates](updates.md)를 참조하세요.
- 파생 필드(`platforms`, `scopes_summary`, `categories`, `type_count`, …)는 전체 매니페스트/Type Pack의 투영이므로, 찾아보기 페이지가 모든 매니페스트를 가져오지 않고도 렌더링됩니다. CI가 고정된 문서에서 `scopes_summary`, `platforms`, `services`, `plugin_count`, `desktop_only`, `icon`, `section_count`, `type_count`, `edge_count`를 다시 계산해, 항목에 적힌 값 중 하나라도 불일치하면 거부합니다. `categories`와 Skill Pack의 `applies_to`/`requires`는 다시 계산하지 않으므로 직접 정확하게 유지하세요.

## CI가 강제하는 것

아래는 모두 **차단** 검사입니다 — 전부 통과해야 풀 리퀘스트를 병합할 수 있습니다. `.github/workflows/validate.yml`에서 실행됩니다.

### 항목

- **파일명이 `identifier`와 일치하고, `content_type`이 알려진 네 종류 중 하나여야 합니다.** (`build_registry.py`)
- **레지스트리 항목 스키마.** 항목이 `schemas/registry-plugin-entry`, `registry-typepack-entry`, `registry-skillpack-entry` 중 하나에 대해 유효성을 검사합니다. (`validate.py`)
- **선언한 의존성이 해석되고, 아직 살아 있어야 합니다.** Skill Pack의 `requires`와 Plugin Pack의 `typepacks`는 이 카탈로그에 있는 팩을 가리켜야 합니다 — 마켓플레이스가 그 목록으로 동반 설치 제안을 만듭니다. **같은** 풀 리퀘스트에 추가된 팩도 인정되므로, Type Pack과 그것을 쓰는 플러그인을 함께 올릴 수 있습니다. [게시가 취소된](#taking-a-pack-down) 팩을 의존성으로 두는 것도 거부됩니다. (`validate.py`)
- **네임스페이스와 저자.** `verified-authors.json`에 등재된 네임스페이스는 소유자만 게시할 수 있고, 등재된 저자명은 자기 네임스페이스 안에서만 쓸 수 있습니다 — 따라서 `run.vineyard.*`도 `author: VINEYARD`도 타인이 주장할 수 없습니다. (`validate.py`) `verified`는 제출하는 값이 아니라 파생되는 값입니다. `build_registry.py`는 식별자의 네임스페이스가 `verified-authors.json`에서 `author`의 핸들 소유로 등재되어 있으면 true로 설정하고, 제출에 적힌 값은 버립니다.

### 고정(pin) {#the-pin}

- **불변 `ref`.** 반드시 **커밋 SHA**(40-16진수 또는 64-16진수)여야 합니다. 태그와 브랜치는 옮겨질 수 있으므로 **거부**됩니다. (`verify_pinned.py`)
- **고정된 문서가 항목과 일치해야 합니다.** `repo@ref/path`의 문서를 가져와 그 `identifier`, `content_type`, `version`이 항목이 광고하는 값과 같아야 합니다. `ref`를 다시 고정하지 않고 메타데이터만 올린 항목은 여기서 실패합니다.
- **요약 필드는 신뢰하지 않고 다시 계산합니다.** `scopes_summary`, `platforms`, `services`, `plugin_count`, `desktop_only`, `icon`, `section_count`, `type_count`, `edge_count`를 고정된 문서에서 유도해 작성값과 대조합니다. `scopes_summary.network`는 멤버가 `network` **또는** `web_probe`를 선언하면 true입니다.
- **번들이 매니페스트와 일치해야 합니다.** Plugin Pack의 경우 `platforms.web.entry`가 가리키는 모듈을 고정된 커밋에서 가져옵니다. 그 모듈이 팩과 각 멤버에 대해 선언하는 `version`과 `license`는 매니페스트의 값과 같아야 합니다. `dist/`를 다시 빌드하지 않고 매니페스트만 수정했거나, entry가 404이면 여기서 실패합니다. (`verify_pinned.py`)

### 타입 그래프

모든 `io.consumes` / `io.produces` 항목을 **이 카탈로그에 게시된** Type Pack에 대해 해석합니다:

- `category.name`이 실제로 어떤 게시된 Type Pack이 정의하는 타입이어야 합니다.
- `typepack` 필드가 실제 정의 주체를 가리켜야 합니다.
- 그 Type Pack이 엔트리의 `typepacks` 목록에 있어야 합니다.

레지스트리에 없는 Type Pack은 **허용되지 않습니다**. Type Pack을 먼저 게시하고, 그 다음 그것을 쓰는 플러그인을 게시하세요.

Type Pack에는 여기서 자체 검사 두 가지가 더 있습니다. 하나의 `category.name`은 게시된 Type Pack 하나만 정의할 수 있습니다. 모든 `identity_properties` 키는 그 타입에 실제로 존재하며 `array`, `object`, `json`이 아닌 프로퍼티를 가리켜야 합니다.

### 사람이 판단하는 것

번들에 대한 자동 정적 분석은 없습니다. 사람이 번들을 읽고 아래 항목을 판단합니다. 어느 것도 자동 거부 사유가 아닙니다:

- 팩이 실제로 필요로 하는 것 대비 요청한 스코프의 범위.
- `node:delete` / `edge:delete` 사용(그래프 파괴적 동사).
- `network` + `node:read` 조합(데이터가 그래프를 떠나고, 이그레스가 있음).
- 난독화 전용 번들 — 읽을 수 있는 소스가 없음. 빠른 검토를 원하면 읽히는 코드를 제출하세요.
- 시크릿처럼 보이는 `params` 키. 자격 증명은 사용자 대상 params가 아니라 `secret: true`와 함께 `scopes.config`에 있어야 합니다.
- `native`/`subprocess` 데스크탑 런타임 — 현재 앱이 실행하지 않습니다.

!!! tip "파괴적 ≠ 거부"
    Chaos 팩 — Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node — 은 전적으로 `node:delete`/`edge:delete`에 의존합니다. 문제없이 게시됩니다.

## 제출 예시

`packs/run.vineyard.pluginpacks.chaos.json`으로 제출하는 **Plugin Pack**입니다. `plugin_count`는 여러 플러그인이 있는 팩(하나의 파일 → 여러 플러그인)을 표시합니다:

```json
{
  "identifier": "run.vineyard.pluginpacks.chaos",
  "content_type": "vineyard:pluginpack",
  "name": "Chaos Reference Pack",
  "author": "VINEYARD",
  "description": "Six graph-manipulation plugins for demos and validation.",
  "repo": "Vineyard-Intelligence/pluginpack-chaos",
  "ref": "4501ffcf55e8e0b563520549c79f7c0627ca32a5",
  "path": "plugins/chaos-pack.manifest.json",
  "version": "1.0.2",
  "platforms": ["web"],
  "scopes_summary": { "network": false, "graph_write": true, "secret_config": false },
  "plugin_count": 6,
  "icon": "boxes",
  "compat": { "min_app_version": "1.0.0" },
  "typepacks": []
}
```

`packs/run.vineyard.typepacks.infrastructure.json`으로 제출하는 **Type Pack**입니다(스코프 없음. `categories`/`type_count`/`edge_count`가 측면을 구동):

```json
{
  "identifier": "run.vineyard.typepacks.infrastructure",
  "content_type": "vineyard:typepack",
  "name": "Infrastructure",
  "author": "VINEYARD",
  "description": "Network-infrastructure and web OSINT entities (IPs, domains, URLs, hosts, ASNs, netblocks, DNS/WHOIS records, TLS certificates, SSH host keys, technologies, web fingerprints and tracking/ad-account identifiers) and their relationships.",
  "repo": "Vineyard-Intelligence/typepack-basic",
  "ref": "81dd71ddeeebfbeba47762d87dd3f89ecd7d11df",
  "path": "typepacks/infrastructure.json",
  "version": "3.0.0",
  "categories": ["infrastructure", "web"],
  "type_count": 15,
  "icon": "network",
  "edge_count": 14
}
```

!!! note "필드 참조"
    필수 필드는 `identifier`, `content_type`, `name`, `author`, `description`, `repo`, `ref`, `path`입니다. `content_type`은 리터럴 `vineyard:plugin`, `vineyard:pluginpack`, `vineyard:typepack`, `vineyard:skillpack`입니다. 전체 필드 목록과 제약 조건은 [registry-schema](../reference/registry-schema.md)에 있습니다.

## 병합 후

병합되면 `packs/`에서 세 카탈로그 파일과 세 승인 ref 목록이 재생성되어 `main`에 바로 커밋됩니다. 다음에 클라이언트가 레지스트리를 가져올 때 귀하의 항목이 파생 배지와 함께 찾아보기에 나타납니다.

## 팩 내리기 {#taking-a-pack-down}

항목을 삭제하는 것은 팩을 내리는 방법이 **아닙니다**. 행을 지우면 찾아보기에서만 사라지고, 이미 설치한 프로젝트는 고정된 커밋에서 계속 로드합니다. 대신 행은 남기고 `status` 블록을 추가합니다:

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

자기 팩을 `deprecated`로 두는 것은 일반 풀 리퀘스트입니다. **`withdrawn`은 운영자의 판단이며**, 유해한 것으로 드러났거나 콘텐츠가 사라진 경우에만 씁니다.

예상해야 할 두 가지:

- **의존하는 쪽을 먼저 고쳐야 합니다.** 살아 있는 팩은 게시 취소된 팩을 `requires`(또는 `typepacks`)에 둘 수 없으므로, CI가 귀하의 팩에 의존하는 팩을 전부 짚어줍니다. 그것들을 갱신하거나, 같은 풀 리퀘스트에서 함께 내리십시오.
- **`withdrawn` 항목은 고정 검증을 받지 않으므로**, 콘텐츠가 사라져 있어도 됩니다. `deprecated` 팩은 고정 검증을 그대로 받으므로 계속 해석되어야 합니다.

행을 통째로 지우는 것은 아무도 설치할 수 없었던 항목 — 잘못 낸 제출이나 중복 — 에만 해당합니다.

## 다음 / 참고

- [Distribution](distribution.md) — `distribution` 블록, 그리고 팩 콘텐츠를 실제로 가져오고 검증하는 방식.
- [Updates](updates.md) — 새로운 불변 `ref`로 다시 고정하여 새 버전 배포.
- [registry-schema](../reference/registry-schema.md) — 필드별 전체 스키마 참조.
- [scopes](../reference/scopes.md) — 스코프 문자열과 엔드포인트 허용목록 규칙.
- [Marketplace](../marketplace.md) — 귀하의 항목이 등록되는 정적 마켓플레이스 브라우저.
