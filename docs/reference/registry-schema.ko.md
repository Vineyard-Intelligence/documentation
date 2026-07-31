# Registry entry schemas

두 가지 **registry entry** 스키마에 대한 참조 — `community-pluginpacks.json`의 한 행과 `community-typepacks.json`의 한 행입니다. 각 항목은 정적 브라우저가 모든 업스트림 manifest를 가져오지 않고도 카드를 렌더링할 수 있게 하는 간결하고 비정규화된 포인터입니다.

스키마는 다음 위치에 있습니다:

- [`schemas/registry-plugin-entry.schema.json`](https://vineyard.run/schemas/registry/plugin-entry/1.0.0.json)
- [`schemas/registry-typepack-entry.schema.json`](https://vineyard.run/schemas/registry/typepack-entry/1.0.0.json)

## What a registry entry is (and is not)

registry 저장소 (`Vineyard-Intelligence/registry`)는 **경로와 메타데이터만 저장하며 — 코드나 복사본은 없습니다**. 전체 [plugin manifest](plugin-schema.md) 또는 [Type Pack](typepack-schema.md) JSON, README, 번들은 모두 고정된 `ref`의 **저자 저장소**에 남아 있습니다.

따라서 registry 항목은 **카탈로그 프로젝션**입니다: 브라우저에서 항목을 검색, 필터링, 배지 표시하기에 충분한 필드와, 상세 페이지가 실제 항목을 하이드레이트하는 데 사용하는 `repo@ref/path` 포인터입니다.

!!! info "Denormalized — the manifest is the source of truth"
    `platforms`, `scopes_summary`, `categories`, `type_count`, `edge_count`는 **파생된** 필드로, 병합 시점에 업스트림 manifest에서 계산됩니다. 업데이트 사이에 실제 manifest와 차이가 발생할 수 있습니다. marketplace **상세 페이지는 `repo@ref/path`의 실제 manifest에서 이를 다시 파생해야 합니다**. 카탈로그 값은 탐색 그리드가 단일 JSON 페치로 렌더링되도록 하기 위해서만 존재합니다. 의심스러운 경우 manifest가 우선합니다.

## Plugin entry

`community-pluginpacks.json`의 한 행. 스키마는 `additionalProperties: false`를 설정하므로, 알 수 없는 키는 리뷰 봇에 의해 거부됩니다.

**필수:** `identifier`, `content_type`, `name`, `author`, `description`, `repo`, `ref`, `path`.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `identifier` | string | yes | Reverse-DNS 기본 키, `^run\.vineyard\.(?:plugins\|pluginpacks)\.[a-z0-9_]+$` (`plugins.*` = 단일 plugin, `pluginpacks.*` = 번들). `manifest.identifier`와 동일. **전체** registry(두 카탈로그 모두)에서 고유합니다. |
| `content_type` | string | yes | `vineyard:plugin` (단일 plugin) 또는 `vineyard:pluginpack` (번들: 하나의 파일 → 여러 plugin). |
| `name` | string | yes | 표시 이름, 1–128자. |
| `author` | string | yes | 저자 핸들, `verified-authors.json`과 대조됨. |
| `description` | string | yes | ≤250자, 문장형 대소문자, 마침표로 끝남, 이모지 없음. |
| `repo` | string | yes | `owner/name` GitHub 경로 (`^[^/]+/[^/]+$`). 코드를 가리키는 **유일한** 포인터. |
| `ref` | string | yes | **불변 커밋 SHA** (40자 16진수 SHA-1 또는 64자 16진수 SHA-256), PR 시점에 캡처됨. **태그와 브랜치는 거부됩니다** (둘 다 재지정 가능) — 카탈로그가 다른 코드를 제공할 수 없도록 정확히 리뷰된 커밋을 고정합니다. `version`은 사람이 읽을 수 있는 릴리스를 전달합니다. |
| `path` | string | yes | `repo@ref` 내 `manifest.json`까지의 경로. |
| `version` | string | no | 이 `ref`에서 `manifest.version`의 SemVer 미러 (`^\d+\.\d+\.\d+(?:[-+].+)?$`). |
| `platforms` | string[] | no | `platforms.{web,desktop}` + `web.runtime`에서 **파생된** 배지 세트. 항목: `web`, `web-proxy`, `desktop` (고유). |
| `scopes_summary` | object | no | **파생된** 필터 패싯 (아래 참조). |
| `scopes_summary.network` | boolean | no | `scopes.network`가 비어 있지 않으면 `true`. |
| `scopes_summary.graph_write` | boolean | no | `node:`/`edge:` create/update/delete 동사가 있으면 `true`. |
| `scopes_summary.publish` | boolean | no | `scopes.publish`가 비어 있지 않으면 `true` (예: `message:post`). |
| `scopes_summary.secret_config` | boolean | no | `scopes.config` 항목에 `secret: true`가 있으면 `true` (데스크톱 전용 키를 의미). |
| `plugin_count` | integer | no | **파생됨**: `identifier`가 **pack**을 명명할 때 번들된 plugin 수 (하나의 파일 → 여러 plugin). 단일 plugin 항목의 경우 생략되거나 `1`. 카드는 포함된 모든 plugin을 함께 설치합니다. 최소 `1`. |
| `compat` | object | no | 런타임 호환성 (`versions.json`과 유사). |
| `compat.min_app_version` | string | no | 이 `ref`가 지원하는 가장 오래된 Vineyard 런타임 (`^\d+\.\d+\.\d+$`). 업데이터가 제공할 버전을 제한합니다. |
| `thumbnail_url` | string (uri) | no | 선택적 카드 아이콘. |
| `verified` | boolean | no | `verified-authors.json` 멤버십의 미러. CI에 의해 설정되며, **자체 주장되지 않음**. 기본값 `false`. |

### Example plugin row

이것은 실제 Chaos 참조 팩입니다 — 6개의 그래프 조작 plugin(Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node)을 번들하는 단일 `identifier`이므로 `plugin_count`는 `6`입니다.

```json
{
  "identifier": "run.vineyard.pluginpacks.chaos",
  "content_type": "vineyard:pluginpack",
  "name": "Chaos Reference Pack",
  "author": "vineyard-run",
  "description": "A bundle of 6 graph-manipulation plugins for demo/validation: Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node. Installing once adds all 6 together.",
  "repo": "Vineyard-Intelligence/chaos-pack",
  "ref": "a62f42b507e495fda884289fce5316915475d4f5",
  "path": "plugins/chaos-pack.manifest.json",
  "version": "1.0.0",
  "platforms": ["web"],
  "scopes_summary": { "network": false, "graph_write": true, "publish": false, "secret_config": false },
  "plugin_count": 6,
  "compat": { "min_app_version": "1.0.0" },
  "verified": true
}
```

!!! example "Reading the facets"
    `scopes_summary.graph_write`는 Chaos plugin이 그래프를 변경(노드/엣지 삭제 및 재배치)하기 때문에 `true`입니다. `network`는 `false` — 이 plugin들은 완전히 클라이언트 측에서 실행되며 엔드포인트를 호출하지 않으므로 — 카드는 "graph-write" 패싯을 표시하고 **network** 배지는 표시하지 않습니다. 브라우저는 이들을 필터로 표시합니다.

## Type Pack entry

`community-typepacks.json`의 한 행으로, plugin 항목과 대칭적입니다. Type Pack은 **scope를 가지지 않으며** — 코드가 실행되지 않으므로 — `scopes_summary` 패싯은 카테고리 필터를 구동하는 `categories`로 대체됩니다. 역시 `additionalProperties: false`.

**필수:** `identifier`, `content_type`, `name`, `author`, `description`, `repo`, `ref`, `path`.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `identifier` | string | yes | Reverse-DNS 기본 키, `^run\.vineyard\.typepacks\.[a-z0-9]+(?:[._-][a-z0-9]+)*$`. `typepack.identifier`와 동일. |
| `content_type` | string | yes | 상수 `vineyard:typepack`. |
| `name` | string | yes | 표시 이름, 1–128자. |
| `author` | string | yes | 저자 핸들. |
| `description` | string | yes | ≤250자 (plugin 항목과 동일한 산문 규칙). |
| `repo` | string | yes | `owner/name` GitHub 경로. |
| `ref` | string | yes | **불변**: 커밋 SHA 또는 주석 태그, `typepack.version`과 동일. |
| `path` | string | yes | `repo@ref` 내 Type Pack JSON 경로 (`distribution.path`와 동일). |
| `version` | string | no | SemVer (`^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$`). |
| `categories` | string[] | no | **파생됨**: 고유한 `types[].category` 값 (각각 `^[a-z][a-z0-9_]*$`, 고유). 카테고리 패싯을 구동합니다. |
| `type_count` | integer | no | **파생됨**: `types[].length`. 최소 `1`. |
| `edge_count` | integer | no | **파생됨**: `edge_types[].length`. 최소 `0`. |
| `thumbnail_url` | string (uri) | no | 선택적 카드 아이콘. |
| `verified` | boolean | no | plugin 항목과 동일 — CI 설정 `verified-authors.json`의 미러. 기본값 `false`. |

### Example Type Pack row

5개의 네트워크 인프라 엔티티 유형(예: 정규화된 type `infrastructure.ip_address`, 도메인, URL, 자율 시스템, 인증서)을 정의하는 실제 Infrastructure 기본 팩입니다:

```json
{
  "identifier": "run.vineyard.typepacks.infrastructure",
  "content_type": "vineyard:typepack",
  "name": "Infrastructure",
  "author": "vineyard-run",
  "description": "A base Type Pack defining network-infrastructure entities (IP address, domain, URL, autonomous system, certificate).",
  "repo": "Vineyard-Intelligence/typepacks",
  "ref": "ef35dab0513de207dc32a54a42e7e93d57d15af3",
  "path": "typepacks/infrastructure.json",
  "version": "1.0.0",
  "categories": ["infrastructure"],
  "type_count": 5,
  "edge_count": 0,
  "verified": true
}
```

동반 Threat 팩은 `categories: ["threat"]` 및 `type_count: 4`로 동일한 형태입니다.

## How entries are validated and merged

제출은 `vineyard-releases`에 하나의 항목을 추가하는 포크 앤 PR로, 차단 CI 검사(스키마, 식별자 고유성, 불변 `ref`, 업스트림 manifest 검증)와 사람 병합에 의해 게이트됩니다. 전체 설명은 [Publishing](../develop/publishing.md)을 참조하세요.

## Next / See also

- [Plugin manifest schema](plugin-schema.md) — plugin 항목이 가리키는 업스트림 문서.
- [Type Pack schema](typepack-schema.md) — Type Pack 항목이 가리키는 업스트림 문서.
- [Scopes reference](scopes.md) — `scopes_summary` 뒤의 동사들.
- [Publishing](../develop/publishing.md) — registry에 항목 제출하기.
- [Updates](../develop/updates.md) — 새로운 `ref`가 "Update available"이 되는 방식.
- [Marketplace browser](../marketplace.md) — 이 항목들이 공급하는 정적 사이트.
