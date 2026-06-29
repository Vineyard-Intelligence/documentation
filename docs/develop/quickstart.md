# Quickstart — your first plugin

Build, test, and locally load a working Vineyard plugin end to end. By the end you will have a single `main.js` bundle that does `export default definePlugin({ manifest, run })`, a unit test that runs `run(ctx)` with no app at all, and the plugin loaded in the app via Developer Mode.

## What a plugin is

A plugin is a **bundled `main.js`** whose default export is the result of `definePlugin({ manifest, run })`. At runtime (web) it executes inside a dedicated module Web Worker with **no DOM, no `window`, no `localStorage`, and no account token**. Everything it can do flows through the `ctx` object passed to `run` — and a `ctx` member is **absent unless its scope was granted**. See [Architecture](architecture.md) and [Security](security.md) for the full model.

## 1. Set up a repo and bundler

You ship one JavaScript file. Use any bundler that can produce a single ESM file — [esbuild](https://esbuild.github.io/) and [Vite](https://vitejs.dev/) are both first-class.

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
        "dev": "vite"   // serves a hot-reloading dev URL for Developer Mode
      }
    }
    ```

The build output (`dist/main.js`) is what the `entry` field in your manifest points at, and what Developer Mode loads.

## 2. Write `definePlugin({ manifest, run })`

Here is a minimal but real whole-graph plugin — **Korean Roulette**, from the reference set: it keeps one random node and deletes everything else. (`consumes: []` means it operates on the whole graph and is launched from the global "Run plugin" menu rather than a node's right-click menu.)

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

    await ctx.graph!.deleteNodes!(doomed);                // node:delete (edges cascade)
    return { summary: `survivor: ${survivor.id}`, counts: { deleted: doomed.length } };
  },
});
```

!!! note "Why the `!` operators?"
    `ctx.graph` and each method on it are optional in the type — they exist **only** when the matching scope is granted. Because this manifest declares `node:read` and `node:delete`, `ctx.graph.list` and `ctx.graph.deleteNodes` are present at runtime. The non-null assertions document that contract; a scope-`[]` plugin like Dumb AI Optimizer would correctly see `ctx.graph === undefined`.

`run` returns an optional `RunResult` (`{ summary?, counts? }`). All graph effects happen through `ctx` — the return value is just a summary surfaced in the [task](../guide/tasks.md) UI.

## 3. Manifest essentials

Every field below is required unless noted. The full schema is documented in [plugin-schema](../reference/plugin-schema.md); the manifest authoring guide is [plugin-manifest](plugin-manifest.md).

| Field | Notes |
|---|---|
| `identifier` | Reverse-DNS, `run.vineyard.plugins.*`. |
| `content_type` | Must be the literal `vineyard:plugin`. |
| `name`, `version`, `description` | `version` is SemVer. |
| `platforms.web` | `{ runtime: "sandbox-js", entry: "dist/main.js" }`. `sandbox-js` runs your JS in the worker; `web-proxy` is the CORS escape hatch (see below). |
| `io` | `{ consumes: [], produces: [] }` — empty `consumes` = whole-graph plugin. Non-empty entries are qualified types like `infrastructure.ip_address` and drive the node menu. See [Type Packs](typepacks.md). |
| `scopes` | The only authority your plugin gets. Here, `scopes.graph` lists `node:read`, `node:delete`, `edge:delete`. See [scopes](../reference/scopes.md). |
| `lifecycle` | `persistence: "ephemeral"` plus the `controls` you support (`progress`, `cancel`, …). See [lifecycle](lifecycle.md). |
| `distribution` | How the bundle is fetched. `kind: "inline"` for local/dev; `git`/`zip` for published plugins (see [distribution](distribution.md)). |

!!! warning "Never put secrets in `params`"
    Install-time lint **rejects** secret-looking `params` keys (`api_key`, `token`, `secret`, `password`, `*_key`, …). Secrets must be declared as `scopes.config` with `secret: true`, and on the web they route to the desktop plugin — see [Security](security.md). Korean Roulette needs no secrets and no network, which is exactly why it's a clean first plugin.

## 4. Unit test with `createMockContext`

The SDK ships a test harness so you can exercise `run(ctx)` with **no app, no GitHub, no server**. `createMockContext({ nodes, edges, grantedScopes })` builds a `HostContext` whose `graph`/`net`/`message` members exist **only** for the granted scopes, and records what the plugin did under `ctx.mock` for assertions.

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

    // n-1 nodes were deleted; exactly one survives.
    expect(ctx.mock.deletedNodeIds.length).toBe(nodes.length - 1);
    expect(result?.counts?.deleted).toBe(nodes.length - 1);
  });
});
```

Useful `ctx.mock` fields for assertions: `deletedNodeIds`, `deletedEdgeIds`, `createdNodes`, `messages`, `netCalls`, and `progress`. All six reference plugins (Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node) are testable exactly this way.

!!! tip "Test the scope boundary, not just the happy path"
    Pass `grantedScopes: {}` (or omit `graph`) and assert your plugin degrades gracefully when `ctx.graph` is `undefined`. This catches the most common runtime surprise: assuming a capability you didn't declare.

## 5. Load it in the app (Developer Mode)

GitHub and the registry are a **distribution** layer; development is fully local. Open **Developer Mode** in the app and load your plugin one of three ways:

1. **File picker** — point it at `dist/main.js`. This is the `kind: "inline"` path.
2. **Local dev-server URL** — `esbuild --watch --servedir` or `vite`, with hot reload as you edit.
3. **Local plugins folder** — desktop only.

!!! example "Try Korean Roulette on a throwaway project"
    Because it deletes nearly everything, run it against a scratch project first. Watch the [task](../guide/tasks.md) panel show the run, then the survivor node standing alone in the canvas.

## 6. Local dev & integration testing

When unit tests pass, exercise the plugin end-to-end against a real graph. Run the development stack — the Docker backend on `:8000` plus Vite on `:3000` — sideload your plugin through Developer Mode (the dev-server URL mode is ideal here), and trigger a run. Graph mutations apply over the **WebSocket**, so you can watch nodes and edges appear, change, or vanish in the canvas in real time as `run(ctx)` executes. This is the closest thing to production behavior before you publish: real writes, real run token, real WebSocket fan-out — just sourced from your local bundle instead of the registry.

!!! warning "Dev Mode relaxes two protections"
    To keep the loop fast, Developer Mode **may auto-approve scopes and skip the integrity check**. That means a dev-loaded plugin can run with scopes you never explicitly granted, and its bytes are not pinned by hash the way a published, registry-installed plugin is (see [Distribution](distribution.md) and [Updates](updates.md)). Use Dev Mode only for code you wrote or trust, and re-test the *published* artifact through the normal install path before relying on it.

## 7. Going live

When the plugin works locally, publish it: author repo → GitHub release (tag = `version`) → a one-entry registry PR. The full process — repo layout, release tags, immutable refs, and the registry pull request — is in [Publishing](publishing.md). Shipping more than one plugin from a single bundle? See [Plugin Packs](plugin-packs.md) (the Chaos pack ships all six reference plugins from one bundle this way).

## Next / See also

- [Architecture](architecture.md) — worker sandbox, HostBridge, and the run token
- [Plugin manifest](plugin-manifest.md) and the [plugin schema](../reference/plugin-schema.md)
- [Scopes](../reference/scopes.md) and the [scopes reference](../reference/scopes.md)
- [SDK](sdk.md) — the full `ctx` surface and `definePlugin`
- [Publishing](publishing.md)
- [Running plugins](../guide/running-plugins.md) — the six validation plugins
