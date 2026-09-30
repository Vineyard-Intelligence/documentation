# Quickstart — your first plugin

Build, test, and locally load a working Vineyard plugin end to end. By the end you will have a single `main.js` bundle that does `export default definePlugin({ manifest, run })`, a unit test that runs `run(ctx)` with no app at all, and the plugin loaded in the app through the dev loader.

## What a plugin is

A plugin is a **bundled `main.js`** whose default export is the result of `definePlugin({ manifest, run })`. At runtime (web) it executes inside a dedicated module Web Worker with **no DOM, no `window`, no `localStorage`, and no account token**. Everything it can do flows through the `ctx` object passed to `run` — and a `ctx` member is **absent unless its scope was granted**. See [Architecture](architecture.md) and [Security](security.md) for the full model.

## 1. Set up a repo and bundler

You ship one JavaScript file. Use any bundler that can produce a single ESM file — [esbuild](https://esbuild.github.io/) and [Vite](https://vitejs.dev/) are both first-class.

```bash
mkdir my-plugin && cd my-plugin
npm init -y
npm i -D esbuild typescript vitest
```

There is no SDK package to install: the SDK is a single file. Copy `sdk.ts` — the app's SDK runtime copy, vendored e.g. as `src/sdk.ts` in the `pluginpack-otx` repo — into `src/` and import from `./sdk`.

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

    ```jsonc
    // package.json (scripts)
    {
      "scripts": {
        "build": "vite build",
        "dev": "vite"   // serves a hot-reloading dev URL for the dev loader
      }
    }
    ```

The build output (`dist/main.js`) is what the `entry` field in your manifest points at, and what the dev loader imports when the plugin runs.

## 2. Write `definePlugin({ manifest, run })`

Here is a minimal but real whole-graph plugin — **Korean Roulette**, from the reference set: it keeps one random node and deletes everything else. (`consumes: []` means it operates on the whole graph: it appears in the **Run plugins…** panel's "Whole-graph / input via form" section, whether the panel was opened from a node, the canvas, the toolbar or the menu bar.)

```ts
// src/main.ts
import { definePlugin } from "./sdk";

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
| `identifier` | Reverse-DNS, `<your-namespace>.plugins.*`. |
| `content_type` | Must be the literal `vineyard:plugin`. |
| `name`, `version`, `description` | `version` is SemVer. |
| `platforms.web` | `{ runtime: "sandbox-js", entry: "dist/main.js" }`. `sandbox-js` runs your JS in the worker — it is the only runtime the host executes. (`web-proxy` is accepted by the schema but not dispatched; see [plugin-manifest](plugin-manifest.md#platforms).) |
| `io` | `{ consumes: [], produces: [] }` — empty `consumes` = whole-graph plugin. Non-empty entries are qualified types like `infrastructure.ip_address` and decide where the plugin is offered in the **Run plugins…** panel. See [Type Packs](typepacks.md). |
| `scopes` | The only authority your plugin gets. Here, `scopes.graph` lists `node:read`, `node:delete`, `edge:delete`. See [scopes](../reference/scopes.md). |
| `lifecycle` | `persistence: "ephemeral"` plus the `controls` you support (`progress`, `cancel`, …). See [lifecycle](lifecycle.md). |
| `distribution` | Schema-required descriptive block (`kind`: `git`, `zip` or `inline`); the host does not read it. Installed code is fetched from the registry entry's pinned commit, dev code from the URL you load in the dev loader (see [distribution](distribution.md)). |

!!! warning "Never put secrets in `params`"
    Never put a secret-looking key in `params` — those values are recorded. Declare secrets as `scopes.config` with `secret: true`: they are entered in the plugin's settings form (masked), kept per signed-in account (encrypted with the OS keychain on desktop, in `sessionStorage` for the tab in the browser), never written to a record, and handed only to the plugin that declared them via `ctx.config` — see [Security](security.md). Korean Roulette needs no secrets and no network, which is exactly why it's a clean first plugin.

## 4. Unit test with `createMockContext`

The SDK ships a test harness so you can exercise `run(ctx)` with **no app, no GitHub, no server**. `createMockContext({ nodes, edges, grantedScopes })` builds a `HostContext` whose `graph` member (and each write method on it) exists only for the granted graph verbs; `net.fetch`/`net.probe` exist only when you pass `netHandler`/`probeHandler`, and `config` comes from the `config` option. It records what the plugin did under `ctx.mock` for assertions.

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

    // n-1 nodes were deleted; exactly one survives.
    expect(ctx.mock.deletedNodeIds.length).toBe(nodes.length - 1);
    expect(result?.counts?.deleted).toBe(nodes.length - 1);
  });
});
```

Useful `ctx.mock` fields for assertions: `deletedNodeIds`, `deletedEdgeIds`, `createdNodes`, `createdEdges`, `updatedNodes`, and `progress`. All six reference plugins (Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node) are testable exactly this way.

!!! tip "Test the scope boundary, not just the happy path"
    Pass `grantedScopes: {}` (or omit `graph`) and assert your plugin degrades gracefully when `ctx.graph` is `undefined`. This catches the most common runtime surprise: assuming a capability you didn't declare.

## 5. Load it in the app (dev loader)

GitHub and the registry are a **distribution** layer; during development the app loads your plugin from a URL you serve. The dev loader reads a JSON **manifest document**, not the bundle, so first write one next to `src/` — the manifest from step 2, as JSON:

```jsonc
// plugin.manifest.json
{
  "identifier": "run.vineyard.plugins.korean_roulette",
  "content_type": "vineyard:plugin",
  "name": "Korean Roulette",
  "version": "1.0.0",
  "description": "Keep one random node; delete everything else.",
  "platforms": { "primary": "web", "web": { "runtime": "sandbox-js", "entry": "dist/main.js" } },
  "io": { "consumes": [], "produces": [] },
  "scopes": { "graph": ["node:read", "node:delete", "edge:delete"] },
  "lifecycle": { "persistence": "ephemeral", "controls": ["progress", "cancel"] },
  "distribution": { "kind": "inline" }
}
```

Open **Settings → Plugins → Development → Load a pack from a URL**, choose **Plugin Pack**, and enter the absolute URL of your plugin's manifest document (a JSON file with `content_type: "vineyard:plugin"`, or a `vineyard:pluginpack` document, whose `platforms.web.entry` points at your bundle, e.g. `dist/main.js`, relative to the manifest's folder). Serve both from your dev server (`esbuild --watch --servedir` or `vite`). The URL is kept on this device for the account you are signed in with (local mode keeps its own list) and loads into every project you open under that account — reopen the project after adding it. The `identifier` in the JSON manifest must match the one in `definePlugin`, or the run fails with `plugin not loadable: <identifier>`.

!!! example "Try Korean Roulette on a throwaway project"
    Because it deletes nearly everything, run it against a scratch project first. Watch the [task](../guide/tasks.md) panel show the run, review and apply the staged deletions, then see the survivor node standing alone in the canvas.

## 6. Integration testing in the app

When unit tests pass, exercise the plugin end-to-end against a real graph. A plugin pack's
module must satisfy the app's script policy. On [vineyard.run](https://vineyard.run/) (and the
packaged desktop app) only the registry's CDN path may serve plugin code, so a dev-loaded plugin
pack's manifest loads but its code is refused when you run it. Iterate against a local dev build
of the app (e.g. `npm run dev`, which serves no CSP): load your manifest through the dev loader
(a dev-server URL is ideal while you iterate), trigger a run on a throwaway project, watch the
run in the Tasks panel, then open its staged change set and apply it to see the nodes and edges
change. This is the closest thing to production behavior before you publish: the same sandbox,
the same staged change set, and the same Review dialog — just sourced from your local bundle
instead of the registry. Remember that a dev build also lacks the worker's `connect-src 'none'`:
any direct `fetch`/XHR from your plugin will work there and fail in production — go through
`ctx.net`/`ctx.service` only.

!!! warning "The dev loader relaxes two protections"
    To keep the loop fast, the dev loader **may auto-approve scopes and skip the integrity check**. That means a dev-loaded plugin can run with scopes you never explicitly granted, and its manifest is not checked against a registry digest nor its code pinned to a commit, as a published, registry-installed plugin's are (see [Distribution](distribution.md) and [Updates](updates.md)). Use the dev loader only for code you wrote or trust, and re-test the *published* artifact through the normal install path before relying on it.

## 7. Going live

When the plugin works locally, publish it: author repo → GitHub release (tag = `version`) → a one-entry registry PR. The full process — repo layout, release tags, immutable refs, and the registry pull request — is in [Publishing](publishing.md). Shipping more than one plugin from a single bundle? See [Plugin Packs](plugin-packs.md) (the Chaos pack ships all six reference plugins from one bundle this way).

## Next / See also

- [Architecture](architecture.md) — worker sandbox, HostBridge, and staged writes
- [Plugin manifest](plugin-manifest.md) and the [plugin schema](../reference/plugin-schema.md)
- [Scopes](../reference/scopes.md) and the [scopes reference](../reference/scopes.md)
- [SDK](sdk.md) — the full `ctx` surface and `definePlugin`
- [Publishing](publishing.md)
- [Running plugins](../guide/running-plugins.md) — the six validation plugins
