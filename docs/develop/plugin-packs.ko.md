# Plugin Packs

**Plugin Pack**은 여러 플러그인을 하나의 번들로 배포하는 방식으로 — 여러 `types`를 포함하는 Type Pack의 플러그인 측 유사체입니다. 호스트는 팩을 개별적으로 주소 지정 가능한 플러그인으로 평탄화하고, 레지스트리는 단일 카드로 표시하며, 설치하면 포함된 모든 플러그인이 한 번에 추가됩니다.

## 하나의 파일, 여러 플러그인

플러그인 번들의 기본 내보내기가 단일 플러그인일 필요는 없습니다. 다음과 같을 수 있습니다:

- **단일 플러그인** — `export default definePlugin({ manifest, run })`,
- **플러그인 배열** — `export default [definePlugin(...), definePlugin(...)]`, 또는
- **팩** — `export default definePluginPack({ ..., plugins: [...] })`.

호스트는 세 가지 형태를 모두 허용하고 정규화합니다. 이를 통해 하나의 작성자 저장소, 하나의 빌드, 하나의 레지스트리 항목으로 관련 플러그인 패밀리를 제공할 수 있습니다 — 예를 들어 [Chaos reference pack](../guide/running-plugins.md)의 6개 그래프 조작 도구가 그렇습니다.

## `definePluginPack`

팩은 SDK(`@vineyard/plugin-sdk`)의 `definePluginPack`으로 선언됩니다. 팩 수준 필드는 *번들*을 설명하며, `plugins`의 각 항목은 자체 매니페스트와 `run`을 가진 완전한 플러그인 정의입니다.

```ts
import { definePlugin, definePluginPack } from "@vineyard/plugin-sdk";

export default definePluginPack({
  identifier: "run.vineyard.pluginpacks.chaos",   // 팩 ID
  content_type: "vineyard:pluginpack",
  name: "Chaos Reference Pack",
  version: "1.0.0",
  plugins: [
    definePlugin({ manifest: {/* … */}, run: koreanRoulette }),
    definePlugin({ manifest: {/* … */}, run: russianRoulette }),
    /* …추가… */
  ],
});
```

| 필드          | 참고 |
| -------------- | ----- |
| `identifier`   | **팩 ID**, reverse-DNS 문자열 `run.vineyard.pluginpacks.*` (예: `run.vineyard.pluginpacks.chaos`). 포함된 개별 플러그인이 아닌 번들의 이름입니다. |
| `content_type` | `vineyard:pluginpack` — 번들 자체의 종류. 포함된 각 플러그인은 여전히 `vineyard:plugin`을 가집니다. |
| `name`         | 마켓플레이스 카드에 표시되는 사람이 읽을 수 있는 팩 이름. |
| `version`      | 번들 전체에 대한 SemVer. |
| `plugins`      | `definePlugin(...)` 항목의 배열. 각각은 **자체** `identifier`, `scopes`, `io`, `lifecycle`을 가집니다. |

포함된 플러그인은 종속적이지 않습니다: 각각 자체 `identifier`, `scopes`, 라이프사이클을 선언합니다. 팩은 순전히 패키징 편의를 위한 것입니다 — 평탄화된 후에는 포함된 플러그인이 독립적으로 게시된 것과 정확히 동일하게 동작합니다.

## 호스트가 팩을 평탄화하는 방법

클라이언트가 번들을 로드할 때, 모듈이 기본 내보낸 것이 무엇이든 `flattenPlugins`을 호출합니다. 팩, 배열, 단일 항목 모두 동일한 것으로 축소됩니다: **각각 자체 `identifier`로 주소 지정되는** 플러그인의 평면 목록.

```text
default export (pack | array | single)
        │  flattenPlugins(...)
        ▼
run.vineyard.plugins.korean_roulette
run.vineyard.plugins.russian_roulette
run.vineyard.plugins.thanos_snap
run.vineyard.plugins.black_hole
run.vineyard.plugins.dumb_ai_optimizer
run.vineyard.plugins.schrodingers_node
```

평탄화 후에는 특별한 "팩" 런타임 객체가 없습니다 — 오직 플러그인만 있습니다. Korean Roulette은 선언된 스코프(`node:read`, `node:delete`, `edge:read`, `edge:delete`)만으로 자체 샌드박스 Web Worker에서 실행되며, 6개가 하나의 파일로 배포되었음에도 다른 5개와 독립적입니다.

## 레지스트리에서 팩이 표시되는 방식

Marketplace 레지스트리는 **메타데이터 전용**(코드가 아닌 포인터 저장)이며, 각 항목은 작성자 저장소에 있는 전체 매니페스트의 간소화된 투영입니다. 팩은 여전히 **단일 레지스트리 항목**을 차지하며, 팩 식별자로 키가 지정됩니다. 두 개의 파생 필드가 팩을 목록에서 이해할 수 있게 만듭니다:

- `plugin_count` — 번들된 플러그인 수(Chaos 팩의 경우 6; 일반 단일 플러그인 항목의 경우 생략 또는 `1`). 마켓플레이스는 이를 사용해 카드에 레이블을 지정하고("6 plugins") 한 번 설치하면 모두 함께 추가됨을 알립니다.
- `scopes_summary` — 포함된 플러그인 권한의 롤업(예: `graph_write: true`). 각 매니페스트를 가져오지 않고도 카드가 전체 팩의 기능을 요약할 수 있습니다.

포함된 플러그인 식별자의 전체 목록은 `repo@ref/path`의 **매니페스트**에 있습니다. 간소화된 카탈로그 행은 개수를 가지며, 클라이언트는 가져온 번들에서 개별 플러그인을 확인합니다. 정확한 레지스트리 항목 형태 — `plugin_count`, `scopes_summary`, 간소화된 투영 — 는 [Publishing](publishing.md)에 문서화되어 있습니다.

마켓플레이스는 팩을 **하나의 카드**로 표시하고 포함된 모든 플러그인을 함께 설치합니다 — 그러나 일단 설치되면 각각은 자체적으로 실행, 범위 지정, 실행됩니다.

## 팩을 사용해야 하는 경우

여러 플러그인이 저장소, 빌드 파이프라인, 테마, 또는 릴리스 주기를 공유할 때 — 데모/검증 세트나 일관된 툴킷처럼 — 팩을 사용하세요. 두 플러그인이 진정으로 관련이 없다면, 사용자가 원하는 것만 설치할 수 있도록 별도 항목으로 배포하세요.

## 다음 / 참고

- [Plugin manifest](plugin-manifest.md) — 각 팩 항목이 가지는 플러그인별 필드.
- [Scopes reference](../reference/scopes.md) — 각 포함된 플러그인이 독립적으로 선언하는 권한.
- [SDK](sdk.md) — `definePlugin`, `definePluginPack`, `run` 계약.
- [Running plugins](../guide/running-plugins.md) — Chaos 팩 및 기타 최초 구현체.
- [Registry schema](../reference/registry-schema.md) — `plugin_count`, `scopes_summary`, 간소화된 카탈로그 투영.
