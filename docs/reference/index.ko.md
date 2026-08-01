# Reference

VINEYARD의 plugin 및 Type Pack 형식에 대한 규범적 참조 자료: 모든 문서가 검증되는 JSON-Schema, 권한 scope 어휘, 문서 전반에서 사용되는 공유 용어입니다. 서사적 안내보다는 정확한 필드 이름, 허용 값, 제약 조건이 필요할 때 이 페이지를 사용하세요.

## Pages

| Page | What it documents |
|---|---|
| [Plugin manifest schema](plugin-schema.md) | `vineyard:plugin` manifest — `identifier`, `version`, `platforms`, `io`, `scopes`, `lifecycle`, `distribution`. |
| [Type Pack schema](typepack-schema.md) | `vineyard:typepack` 문서 — 정규화된 `category.name` 형식(예: `infrastructure.ip_address`)의 type 정의. |
| [Registry entry schemas](registry-schema.md) | `community-pluginpacks.json` / `community-typepacks.json`의 한 행 — 브라우저가 읽는 메타데이터 전용 카탈로그 행. |
| [Scopes](scopes.md) | 전체 권한 어휘: `node:read`, `edge:delete`, `message:post` 등. |

## Where the canonical artifacts live

권위 있는 JSON-Schema는 여기에 중복되어 있지 않습니다 — spec 저장소의 `marketplace/schemas/` 아래에 있습니다:

| File | Schema for |
|---|---|
| `schemas/plugin.schema.json` | `vineyard:plugin` manifest. |
| `schemas/typepack.schema.json` | `vineyard:typepack` 문서. |
| `schemas/registry-plugin-entry.schema.json` | 하나의 `community-pluginpacks.json` 행. |
| `schemas/registry-typepack-entry.schema.json` | 하나의 `community-typepacks.json` 행. |

참조 페이지는 이 파일들을 요약하고 설명합니다. 산문과 스키마가 불일치할 경우 `marketplace/schemas/`의 스키마가 우선합니다.

## The Marketplace catalog the browser reads

정적 [Marketplace browser](../marketplace.md)는 `docs/data/registry.json`에서 카탈로그를 로드합니다 — Plugin Pack과 Type Pack 항목을 결합한 단일 메타데이터 전용 배열입니다(각 행은 `pluginpack` 또는 `typepack`의 `type`을 가집니다). 이 파일은 목록 메타데이터(`identifier`, `name`, `version`, `repo`, `ref`, `scopes_summary` 등)만 보유하며, plugin 바이트를 절대 포함하지 않습니다. Plugin Pack 및 Type Pack 코드는 설치 시 GitHub 소스에서 가져오며, registry에서 가져오지 않습니다.

## Naming, at a glance

- **식별자(Identifier)** 는 reverse-DNS입니다: `run.vineyard.plugins.<name>`, `run.vineyard.pluginpacks.<name>`, `run.vineyard.typepacks.<name>`.
- 모든 문서는 `content_type` 판별자를 가집니다: `vineyard:plugin`, `vineyard:pluginpack`, 또는 `vineyard:typepack`.
- `version`은 모든 곳에서 SemVer 문자열입니다.
- Type은 정규화된 `category.name` 형식으로 참조됩니다(예: `infrastructure.ip_address`).

## Next / See also

- 개념적 오리엔테이션: [Developer guide](../develop/index.md) 및 [Architecture](../develop/architecture.md)
- 무언가 빌드하기: [Plugin manifest](../develop/plugin-manifest.md) · [Type Packs](../develop/typepacks.md)
- 실제 예제: [Marketplace](../marketplace.md)
