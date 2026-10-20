# 퀵스타트: 첫 플러그인

작동하는 Vineyard 플러그인을 엔드 투 엔드로 빌드, 테스트, 로컬 로드합니다. 이 과정을 마치면 `export default definePlugin({ manifest, run })`을 수행하는 단일 `main.js` 번들, 앱 없이 `run(ctx)`을 실행하는 단위 테스트, 그리고 개발 로더를 통해 앱에 로드된 플러그인을 갖게 됩니다.

## 플러그인이란 무엇인가

플러그인은 기본 내보내기가 `definePlugin({ manifest, run })`의 결과인 **번들된 `main.js`**입니다. 런타임(웹)에서는 **DOM 없음, `window` 없음, `localStorage` 없음, 자체 네트워크 없음** 상태로 전용 모듈 Web Worker 내에서 실행됩니다. 사이트의 다른 저장소도 로컬 개발 빌드를 포함한 모든 빌드에서 막혀 있습니다: IndexedDB, Cache Storage, `BroadcastChannel`, `navigator.storage`, Web Locks는 `undefined`이거나 `SecurityError`를 던지므로, 실행 중의 상태는 메모리에 두세요. 할 수 있는 모든 작업은 `run`에 전달된 `ctx` 객체를 통해 이루어지며 — `ctx` 멤버는 **해당 스코프가 부여되지 않으면 존재하지 않습니다**. 전체 모델은 [아키텍처 및 원칙](architecture.md) 및 [샌드박스 및 보안](security.md)을 참조하세요.

## 1. 저장소 및 번들러 설정

하나의 JavaScript 파일을 배포합니다. 단일 ESM 파일을 생성할 수 있는 모든 번들러를 사용할 수 있습니다 — [esbuild](https://esbuild.github.io/)와 [Vite](https://vitejs.dev/) 모두 일급 지원됩니다.

```bash
mkdir my-plugin && cd my-plugin
npm init -y
npm i -D esbuild typescript vitest
```

설치할 SDK 패키지는 없습니다. SDK는 단일 파일입니다: 앱이 쓰는 사본인 [`sdk.ts`](../assets/sdk/sdk.ts){ download="sdk.ts" }(첫 줄에 날짜가 있음)를 내려받아 `src/`에 두고 `./sdk`에서 가져오세요. 게시된 팩 저장소에 포함된 사본은 더 오래되어 `SafeRequestInit.timeoutMs` 같은 새 필드가 없을 수 있으므로, 이 파일을 쓰세요.

=== "esbuild"

    ```jsonc
    // package.json (scripts)
    {
      "scripts": {
        "build": "esbuild src/main.ts --bundle --format=esm --outfile=dist/main.js",
        "watch": "esbuild src/main.ts --bundle --format=esm --outfile=dist/main.js --watch --servedir=. --cors-origin=http://localhost:3000"
      }
    }
    ```

=== "Vite"

    Vite로 단일 ESM 파일을 만들려면 라이브러리 모드가 필요합니다(`npm i -D vite`):

    ```ts
    // vite.config.ts
    import { defineConfig } from "vite";

    export default defineConfig({
      build: {
        lib: { entry: "src/main.ts", formats: ["es"], fileName: () => "main.js" },
        emptyOutDir: false, // 개발 서버가 dist/main.js의 재빌드를 매번 반영하도록
      },
    });
    ```

    ```jsonc
    // package.json (scripts)
    {
      "scripts": {
        "build": "vite build",
        "watch": "vite build --watch",  // 저장할 때마다 dist/main.js를 다시 빌드
        "dev": "vite"                   // 개발 로더용으로 이 폴더(매니페스트와 dist/main.js)를 서빙
      }
    }
    ```

    `watch`와 `dev`를 함께 실행하세요.

빌드 출력(`dist/main.js`)은 매니페스트의 `entry` 필드가 가리키는 대상이며, 플러그인이 실행될 때 개발 로더가 가져오는 대상입니다.

## 2. `definePlugin({ manifest, run })` 작성

여기에 최소한의 전체 그래프 플러그인이 있습니다. Chaos 참조 팩의 **Korean Roulette**를 예시 네임스페이스(`com.example`, 실제로는 본인 것을 쓰세요) 아래에 단순화해 옮긴 것으로, 하나의 무작위 노드를 유지하고 나머지 모든 것을 삭제합니다. (`consumes: []`는 전체 그래프에서 작동함을 의미합니다: 패널을 노드, 캔버스, 툴바, 메뉴 바 중 어디서 열었든 **Run plugins…** 패널의 "Whole-graph / input via form" 섹션에 나타납니다.)

```ts
// src/main.ts
import { definePlugin } from "./sdk";

export default definePlugin({
  manifest: {
    identifier: "com.example.plugins.korean_roulette",
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

아래 모든 필드는 별도 표기가 없으면 필수입니다. 전체 스키마는 [플러그인 매니페스트 스키마](../reference/plugin-schema.md)에 문서화되어 있으며, 매니페스트 작성 가이드는 [플러그인 매니페스트](plugin-manifest.md)입니다.

| 필드 | 참고 |
|---|---|
| `identifier` | Reverse-DNS, `<본인-네임스페이스>.plugins.*`. |
| `content_type` | 반드시 리터럴 `vineyard:plugin`이어야 합니다. |
| `name`, `version`, `description` | `version`은 SemVer입니다. |
| `platforms.web` | `{ runtime: "sandbox-js", entry: "dist/main.js" }`. `sandbox-js`는 워커에서 JS를 실행합니다 — 호스트가 실행하는 유일한 런타임입니다. (`web-proxy`는 스키마상 허용되지만 디스패치되지 않습니다. [플러그인 매니페스트](plugin-manifest.md#platforms) 참조.) 설치된 코드는 레지스트리 항목의 고정 커밋에서, 개발 코드는 개발 로더에 넣은 URL에서 가져옵니다([배포](distribution.md) 참조). |
| `io` | `{ consumes: [], produces: [] }` — 빈 `consumes` = 전체 그래프 플러그인. 비어 있지 않은 항목은 `infrastructure.ip_address`와 같은 정규화된 타입이며 **Run plugins…** 패널에서 플러그인이 제공되는 위치를 결정합니다. [Type Pack](typepacks.md)을 참조하세요. |
| `scopes` | 플러그인이 얻는 유일한 권한. 여기서 `scopes.graph`는 `node:read`, `node:delete`, `edge:delete`를 나열합니다. [스코프 레퍼런스](../reference/scopes.md)를 참조하세요. |
| `lifecycle` | `persistence: "ephemeral"`과 지원하는 `controls`(`progress`, `cancel`, …). [작업 생명주기](lifecycle.md)를 참조하세요. |

!!! warning "`params`에 시크릿을 절대 넣지 마세요"
    시크릿처럼 보이는 키를 `params`에 절대 넣지 마세요 — 그 값은 기록됩니다. 시크릿은 `secret: true`와 함께 `scopes.config`로 선언하세요: 플러그인 설정 폼에서 (마스킹되어) 입력되고, 로그인한 계정별로 (데스크톱에서는 OS 키체인에, 브라우저에서는 탭 세션 동안) 보관되며, 이를 선언한 플러그인에게만 `ctx.config`로 전달됩니다 — [샌드박스 및 보안](security.md)을 참조하세요. Korean Roulette은 시크릿과 네트워크가 필요 없기 때문에 깔끔한 첫 플러그인으로 적합합니다.

## 4. `createMockContext`로 단위 테스트

SDK는 **앱 없이, GitHub 없이, 서버 없이** `run(ctx)`을 실행할 수 있는 테스트 하네스를 제공합니다. `createMockContext({ nodes, edges, grantedScopes })`는 `HostContext`를 빌드합니다: `graph` 멤버(와 그 각 쓰기 메서드)는 부여된 graph 동사에 대해서만 존재하고, `net.fetch`/`net.probe`는 `netHandler`/`probeHandler`를 전달했을 때만 존재하며, `config`는 `config` 옵션에서 옵니다. 또한 어서션을 위해 플러그인이 수행한 작업을 `ctx.mock`에 기록합니다.

```ts
// test/korean_roulette.test.ts
import { describe, it, expect } from "vitest";
import { createMockContext } from "../src/sdk";
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

어서션에 유용한 `ctx.mock` 필드: `deletedNodeIds`, `deletedEdgeIds`, `createdNodes`, `createdEdges`, `updatedNodes`, `progress`. 6개의 참조 플러그인(Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node)은 모두 이 방식으로 테스트할 수 있습니다.

!!! tip "행복 경로뿐만 아니라 스코프 경계도 테스트하세요"
    `grantedScopes: {}`를 전달하거나 `graph`를 생략하고, `ctx.graph`가 `undefined`일 때 플러그인이 정상적으로 저하되는지 어서션하세요. 이는 선언하지 않은 기능을 가정하는 가장 흔한 런타임 놀라움을 잡아냅니다. 다만 읽기 스코프는 이것으로 증명되지 않습니다: mock은 graph 동사가 하나라도 부여되면 `get`, `list`, `edges`, `neighbors`를 제공하지만, 앱은 이 메서드에 `node:read` / `edge:read`를 요구합니다. [`createMockContext`로 테스트하기](sdk.md#createmockcontext)를 참조하세요.

## 5. 앱에 로드하기 (개발 로더)

GitHub와 레지스트리는 **배포** 계층이며, 개발 중에는 여러분이 직접 서빙하는 URL에서 앱이 플러그인을 로드합니다. 개발 로더는 번들이 아니라 JSON **매니페스트 문서**를 읽으므로, 먼저 `src/` 옆에 하나 작성하세요 — 2단계의 매니페스트를 JSON으로 옮긴 것입니다:

```jsonc
// plugin.manifest.json
{
  "identifier": "com.example.plugins.korean_roulette",
  "content_type": "vineyard:plugin",
  "name": "Korean Roulette",
  "version": "1.0.0",
  "description": "Keep one random node; delete everything else.",
  "platforms": { "primary": "web", "web": { "runtime": "sandbox-js", "entry": "dist/main.js" } },
  "io": { "consumes": [], "produces": [] },
  "scopes": { "graph": ["node:read", "node:delete", "edge:delete"] },
  "lifecycle": { "persistence": "ephemeral", "controls": ["progress", "cancel"] }
}
```

**Settings → Plugins → Development → Load a pack from a URL**을 열고 **Plugin Pack**을 선택한 뒤, 플러그인 매니페스트 문서의 절대 URL을 입력하세요(`content_type: "vineyard:plugin"`인 JSON 파일 또는 `vineyard:pluginpack` 문서이며, 그 `platforms.web.entry`는 매니페스트 폴더 기준 상대 경로로 번들을 가리킵니다. 예: `dist/main.js`). 둘 다 개발 서버(`esbuild --watch --servedir` 또는 `vite`)에서 서빙하세요. URL은 이 기기에 로그인한 계정별로 보관되며 여는 모든 프로젝트에 로드됩니다 — 추가한 뒤 프로젝트를 다시 여세요. JSON 매니페스트의 `identifier`는 `definePlugin`의 것과 일치해야 하며, 그렇지 않으면 실행이 `plugin not loadable: <identifier>`로 실패합니다.

!!! example "임시 프로젝트에서 Korean Roulette 시도하기"
    거의 모든 것을 삭제하므로, 먼저 스크래치 프로젝트에서 실행하세요. [task](../guide/tasks.md) 패널이 실행을 보여주면, 스테이징된 삭제를 검토·적용한 뒤 생존자 노드가 캔버스에 혼자 남는 것을 확인하세요.

## 6. 앱에서 통합 테스트

단위 테스트가 통과하면 실제 그래프를 대상으로 플러그인을 엔드 투 엔드로 실행하세요. [app.vineyard.run](https://app.vineyard.run/)(및 패키징된 데스크톱 앱)에서는 플러그인 코드를 레지스트리의 CDN에서만 로드하므로, 개발 로드한 플러그인 팩은 매니페스트는 로드되지만 실행할 때 코드가 거부됩니다. 앱의 로컬 개발 빌드(예: `npm run dev`)를 대상으로 반복하세요: 개발 로더로 매니페스트를 로드하고(반복 중에는 개발 서버 URL이 이상적), 폐기용 프로젝트에서 실행을 트리거한 뒤, Tasks 패널에서 실행을 지켜보고, 스테이징된 변경 세트를 열어 적용하면 노드와 엣지가 바뀌는 것을 볼 수 있습니다. 개발 빌드는 플러그인 자체의 네트워크 접근을 막지 않습니다: 플러그인에서 직접 호출한 `fetch`/XHR은 거기서는 작동하지만 프로덕션에서는 실패합니다 — `ctx.net`/`ctx.service`만 사용하세요.

!!! tip "디버깅"
    플러그인 워커의 `console.log` 출력은 로컬 개발 빌드의 브라우저 DevTools 콘솔에 표시됩니다. `ctx.progress.log`는 버려지므로, 상태를 보여주려면 `ctx.progress.set({ message })`를 쓰세요: 그 메시지가 Tasks 행에서 플러그인 이름 뒤에 표시됩니다. 패키징된 데스크톱 앱에는 DevTools가 없습니다.

!!! warning "개발 로더는 두 가지 보호를 완화합니다"
    빠른 루프를 유지하기 위해, 개발 로더는 **스코프를 자동 승인하고 무결성 검사를 건너뛸 수 있습니다**(레지스트리 다이제스트 검증 없음, 커밋 고정 없음 — [배포](distribution.md) 및 [업데이트](updates.md) 참조). 개발 로더는 자신이 작성했거나 신뢰하는 코드에만 사용하고, 의존하기 전에 *게시된* 아티팩트를 일반 설치 경로를 통해 다시 테스트하세요.

## 7. 실전 배포

플러그인이 로컬에서 작동하면 게시하세요: 버전을 저장소에 푸시한 뒤, 그 커밋 SHA를 단일 항목 레지스트리 PR에 고정합니다. 전체 프로세스 — 저장소 레이아웃, 불변 ref, 레지스트리 풀 리퀘스트 — 는 [레지스트리에 배포하기](publishing.md)에 있습니다. 단일 번들에서 여러 플러그인을 배포하시나요? [플러그인 팩](plugin-packs.md)을 참조하세요(Chaos 팩은 이 방식으로 하나의 번들에서 6개의 참조 플러그인을 모두 배포합니다).

## 다음 / 참고

- [아키텍처 및 원칙](architecture.md) — 워커 샌드박스, 스테이징된 쓰기
- [플러그인 매니페스트](plugin-manifest.md) 및 [플러그인 매니페스트 스키마](../reference/plugin-schema.md)
- [스코프 레퍼런스](../reference/scopes.md)
- [SDK 및 호스트 컨텍스트](sdk.md) — 전체 `ctx` 표면과 `definePlugin`
- [레지스트리에 배포하기](publishing.md)
- [플러그인 실행](../guide/running-plugins.md) — 6개의 검증 플러그인
