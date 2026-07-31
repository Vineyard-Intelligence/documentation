# Quickstart — your first plugin

작동하는 Vineyard 플러그인을 엔드 투 엔드로 빌드, 테스트, 로컬 로드합니다. 이 과정을 마치면 `export default definePlugin({ manifest, run })`을 수행하는 단일 `main.js` 번들, 앱 없이 `run(ctx)`을 실행하는 단위 테스트, 그리고 Developer Mode를 통해 앱에 로드된 플러그인을 갖게 됩니다.

## 플러그인이란 무엇인가

플러그인은 기본 내보내기가 `definePlugin({ manifest, run })`의 결과인 **번들된 `main.js`**입니다. 런타임(웹)에서는 **DOM 없음, `window` 없음, `localStorage` 없음, 계정 토큰 없음** 상태로 전용 모듈 Web Worker 내에서 실행됩니다. 할 수 있는 모든 작업은 `run`에 전달된 `ctx` 객체를 통해 이루어지며 — `ctx` 멤버는 **해당 스코프가 부여되지 않으면 존재하지 않습니다**. 전체 모델은 [Architecture](architecture.md) 및 [Security](security.md)를 참조하세요.

## 1. 저장소 및 번들러 설정

하나의 JavaScript 파일을 배포합니다. 단일 ESM 파일을 생성할 수 있는 모든 번들러를 사용할 수 있습니다 — [esbuild](https://esbuild.github.io/)와 [Vite](https://vitejs.dev/) 모두 일급 지원됩니다.

```bash
mkdir my-plugin && cd my-plugin
npm init -y
npm i -D esbuild typescript
npm i @vineyard/plugin-sdk
```

=== "esbuild"

    ```jsonc
    // package.json (scripts)
    {
      "scripts": {
        "build": "esbuild src/main.ts --bundle --format=esm --outfile=dist/main.js",
        "watch": "esbuild src/main.ts --bundle --format=esm --outfile=dist/main.js --watch --servedir=dist"
      }
    }
    ```

=== "Vite"

    ```jsonc
    // package.json (scripts)
    {
      "scripts": {
        "build": "vite build",
        "dev": "vite"   // Developer Mode를 위한 핫 리로딩 개발 URL 제공
      }
    }
    ```

빌드 출력(`dist/main.js`)은 매니페스트의 `entry` 필드가 가리키는 대상이며, Developer Mode가 로드하는 대상입니다.

## 2. `definePlugin({ manifest, run })` 작성

여기에 최소한의 실제 전체 그래프 플러그인이 있습니다 — 참조 세트의 **Korean Roulette**입니다: 하나의 무작위 노드를 유지하고 나머지 모든 것을 삭제합니다. (`consumes: []`는 전체 그래프에서 작동하며 노드의 우클릭 메뉴 대신 전역 "Run plugin" 메뉴에서 시작됨을 의미합니다.)

```ts
// src/main.ts
import { definePlugin } from "@vineyard/plugin-sdk";

export default definePlugin({
  manifest: {
    identifier: "run.vineyard.plugins.korean_roulette",
    content_type: "vineyard:plugin",
    name: "Korean Roulette",
    version: "1.0.0",
    description: "Keep one random node; delete everything else.",
    platforms: {
      primary: "web",
      web: { runtime: "sandbox-js", entry: "dist/main.js" },
    },
    io: { consumes: [], produces: [] },
    scopes: { graph: ["node:read", "node:delete", "edge:delete"] },
    lifecycle: { persistence: "ephemeral", controls: ["progress", "cancel"] },
    distribution: { kind: "inline" },
  },
  async run(ctx) {
    const { nodes } = await ctx.graph!.list!();           // node:read
    if (nodes.length === 0) return { summary: "empty graph" };

    const survivor = nodes[Math.floor(Math.random() * nodes.length)];
    const doomed = nodes.filter((n) => n.id !== survivor.id).map((n) => n.id);

    await ctx.graph!.deleteNodes!(doomed);                // node:delete (엣지도 함께 삭제)
    return { summary: `survivor: ${survivor.id}`, counts: { deleted: doomed.length } };
  },
});
```

!!! note "왜 `!` 연산자를 사용하나요?"
    `ctx.graph`와 그 각 메서드는 타입상 선택적입니다 — **오직** 해당 스코프가 부여되었을 때만 존재합니다. 이 매니페스트가 `node:read`와 `node:delete`를 선언했기 때문에 `ctx.graph.list`와 `ctx.graph.deleteNodes`가 런타임에 존재합니다. 넌널 어서션(non-null assertions)은 이 계약을 문서화합니다. Dumb AI Optimizer와 같은 scope-`[]` 플러그인은 올바르게 `ctx.graph === undefined`를 보게 됩니다.

`run`은 선택적 `RunResult` (`{ summary?, counts? }`)를 반환합니다. 모든 그래프 효과는 `ctx`를 통해 발생합니다 — 반환 값은 [task](../guide/tasks.md) UI에 표시되는 요약일 뿐입니다.

## 3. 매니페스트 필수 사항

아래 모든 필드는 별도 표기가 없으면 필수입니다. 전체 스키마는 [plugin-schema](../reference/plugin-schema.md)에 문서화되어 있으며, 매니페스트 작성 가이드는 [plugin-manifest](plugin-manifest.md)입니다.

| 필드 | 참고 |
|---|---|
| `identifier` | Reverse-DNS, `run.vineyard.plugins.*`. |
| `content_type` | 반드시 리터럴 `vineyard:plugin`이어야 합니다. |
| `name`, `version`, `description` | `version`은 SemVer입니다. |
| `platforms.web` | `{ runtime: "sandbox-js", entry: "dist/main.js" }`. `sandbox-js`는 워커에서 JS를 실행합니다. `web-proxy`는 CORS 탈출구입니다(아래 참조). |
| `io` | `{ consumes: [], produces: [] }` — 빈 `consumes` = 전체 그래프 플러그인. 비어 있지 않은 항목은 `infrastructure.ip_address`와 같은 정규화된 타입이며 노드 메뉴를 구동합니다. [Type Packs](typepacks.md)를 참조하세요. |
| `scopes` | 플러그인이 얻는 유일한 권한. 여기서 `scopes.graph`는 `node:read`, `node:delete`, `edge:delete`를 나열합니다. [scopes](../reference/scopes.md)를 참조하세요. |
| `lifecycle` | `persistence: "ephemeral"`과 지원하는 `controls`(`progress`, `cancel`, …). [lifecycle](lifecycle.md)을 참조하세요. |
| `distribution` | 번들을 가져오는 방법. 로컬/개발용 `kind: "inline"`, 게시된 플러그인용 `git`/`zip`([distribution](distribution.md) 참조). |

!!! warning "`params`에 시크릿을 절대 넣지 마세요"
    설치 시 린트가 시크릿처럼 보이는 `params` 키(`api_key`, `token`, `secret`, `password`, `*_key`, …)를 **거부**합니다. 시크릿은 `secret: true`와 함께 `scopes.config`로 선언해야 하며, 웹에서는 데스크톱 플러그인으로 라우팅됩니다 — [Security](security.md)를 참조하세요. Korean Roulette은 시크릿과 네트워크가 필요 없기 때문에 깔끔한 첫 플러그인으로 적합합니다.

## 4. `createMockContext`로 단위 테스트

SDK는 **앱 없이, GitHub 없이, 서버 없이** `run(ctx)`을 실행할 수 있는 테스트 하네스를 제공합니다. `createMockContext({ nodes, edges, grantedScopes })`는 부여된 스코프에 대해서만 `graph`/`net`/`message` 멤버가 존재하는 `HostContext`를 빌드하며, 어서션을 위해 플러그인이 수행한 작업을 `ctx.mock`에 기록합니다.

```ts
// test/korean_roulette.test.ts
import { describe, it, expect } from "vitest";
import { createMockContext } from "@vineyard/plugin-sdk";
import plugin from "../src/main";

describe("Korean Roulette", () => {
  it("keeps exactly one node", async () => {
    const nodes = [
      { id: "a", type: "infrastructure.ip_address", data: {} },
      { id: "b", type: "infrastructure.ip_address", data: {} },
      { id: "c", type: "infrastructure.ip_address", data: {} },
    ];

    const ctx = createMockContext({
      nodes,
      grantedScopes: { graph: ["node:read", "node:delete", "edge:delete"] },
    });

    const result = await plugin.run(ctx);

    // n-1개의 노드가 삭제되었고, 정확히 하나만 생존합니다.
    expect(ctx.mock.deletedNodeIds.length).toBe(nodes.length - 1);
    expect(result?.counts?.deleted).toBe(nodes.length - 1);
  });
});
```

어서션에 유용한 `ctx.mock` 필드: `deletedNodeIds`, `deletedEdgeIds`, `createdNodes`, `messages`, `netCalls`, `progress`. 6개의 참조 플러그인(Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node)은 모두 이 방식으로 테스트할 수 있습니다.

!!! tip "행복 경로뿐만 아니라 스코프 경계도 테스트하세요"
    `grantedScopes: {}`를 전달하거나 `graph`를 생략하고, `ctx.graph`가 `undefined`일 때 플러그인이 정상적으로 저하되는지 어서션하세요. 이는 선언하지 않은 기능을 가정하는 가장 흔한 런타임 놀라움을 잡아냅니다.

## 5. 앱에 로드하기 (Developer Mode)

GitHub와 레지스트리는 **배포** 계층이며, 개발은 완전히 로컬에서 이루어집니다. 앱에서 **Developer Mode**를 열고 다음 세 가지 방법 중 하나로 플러그인을 로드하세요:

1. **파일 선택기** — `dist/main.js`를 가리킵니다. 이것이 `kind: "inline"` 경로입니다.
2. **로컬 개발 서버 URL** — `esbuild --watch --servedir` 또는 `vite`, 편집 시 핫 리로드.
3. **로컬 플러그인 폴더** — 데스크톱 전용.

!!! example "임시 프로젝트에서 Korean Roulette 시도하기"
    거의 모든 것을 삭제하므로, 먼저 스크래치 프로젝트에서 실행하세요. [task](../guide/tasks.md) 패널이 실행을 보여주고, 생존자 노드가 캔버스에 혼자 남는 것을 지켜보세요.

## 6. 로컬 개발 및 통합 테스트

단위 테스트가 통과하면 실제 그래프를 대상으로 플러그인을 엔드 투 엔드로 실행하세요. `:8000`의 Docker 백엔드와 `:3000`의 Vite로 개발 스택을 실행하고, Developer Mode(여기서는 개발 서버 URL 모드가 이상적)를 통해 플러그인을 사이드로드한 다음 실행을 트리거하세요. 그래프 변이는 **WebSocket**을 통해 적용되므로, `run(ctx)`이 실행될 때 노드와 엣지가 실시간으로 캔버스에 나타나거나 변경되거나 사라지는 것을 볼 수 있습니다. 이것은 게시 전 프로덕션 동작에 가장 가까운 방식입니다: 실제 쓰기, 실제 실행 토큰, 실제 WebSocket 팬아웃 — 단지 레지스트리 대신 로컬 번들에서 소싱될 뿐입니다.

!!! warning "Dev Mode는 두 가지 보호를 완화합니다"
    빠른 루프를 유지하기 위해, Developer Mode는 **스코프를 자동 승인하고 무결성 검사를 건너뛸 수 있습니다**. 즉, 개발 로드된 플러그인은 명시적으로 부여하지 않은 스코프로 실행될 수 있으며, 해당 바이트는 게시되어 레지스트리 설치된 플러그인처럼 해시로 고정되지 않습니다([Distribution](distribution.md) 및 [Updates](updates.md) 참조). Dev Mode는 자신이 작성했거나 신뢰하는 코드에만 사용하고, 의존하기 전에 *게시된* 아티팩트를 일반 설치 경로를 통해 다시 테스트하세요.

## 7. 실전 배포

플러그인이 로컬에서 작동하면 게시하세요: 작성자 저장소 → GitHub 릴리스(tag = `version`) → 단일 항목 레지스트리 PR. 전체 프로세스 — 저장소 레이아웃, 릴리스 태그, 불변 ref, 레지스트리 풀 리퀘스트 — 는 [Publishing](publishing.md)에 있습니다. 단일 번들에서 여러 플러그인을 배포하시나요? [Plugin Packs](plugin-packs.md)를 참조하세요(Chaos 팩은 이 방식으로 하나의 번들에서 6개의 참조 플러그인을 모두 배포합니다).

## 다음 / 참고

- [Architecture](architecture.md) — 워커 샌드박스, HostBridge, 실행 토큰
- [Plugin manifest](plugin-manifest.md) 및 [plugin schema](../reference/plugin-schema.md)
- [Scopes](../reference/scopes.md) 및 [scopes reference](../reference/scopes.md)
- [SDK](sdk.md) — 전체 `ctx` 표면과 `definePlugin`
- [Publishing](publishing.md)
- [Running plugins](../guide/running-plugins.md) — 6개의 검증 플러그인
