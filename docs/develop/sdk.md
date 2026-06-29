# SDK & host context

`@vineyard/plugin-sdk` is the small author-facing TypeScript surface you build a plugin
against. It gives you two define helpers, the typed `HostContext` (`ctx`) your `run` function
receives, and an in-process mock for unit tests. The canonical source is
[`sdk/types.ts`](https://github.com/) in the marketplace repo — every member below is copied
from that file.

## The two define helpers

A plugin's bundle does a default export through one of two factory functions. Both are
identity functions — they exist purely to give you type-checking against the SDK shapes.

```ts
import { definePlugin, definePluginPack } from "@vineyard/plugin-sdk";

// A single plugin
export default definePlugin({ manifest, run });

// Or a pack — one bundle carrying many plugins (see plugin-packs.md)
export default definePluginPack({
  identifier: "run.vineyard.pluginpacks.chaos",
  name: "Chaos",
  version: "1.0.0",
  plugins: [koreanRoulette, russianRoulette, thanosSnap /* ... */],
});
```

| Helper | Signature | Shape it validates |
|---|---|---|
| `definePlugin` | `(p: VineyardPlugin) => VineyardPlugin` | `{ manifest, run }` |
| `definePluginPack` | `(pack: VineyardPluginPack) => VineyardPluginPack` | `{ identifier, name, version, plugins[] }` |

A bundle's default export may be a single plugin, an array of plugins, or a pack
(`PluginEntry`); the host flattens them with `flattenPlugins`. See
[Plugin Packs](plugin-packs.md) for the packaging rules.

`VineyardPlugin.run` is the entrypoint:

```ts
run(ctx: HostContext): Promise<RunResult | void>;
```

Graph effects happen through `ctx`; the return value (`{ summary?, counts? }`) is only a
human-readable summary surfaced in the [task UI](../guide/tasks.md).

## HostContext (`ctx`)

`ctx` is a Comlink proxy of the main-thread *HostBridge*. The bridge holds the
[one-time RunToken](security.md) and the write caps; the worker that runs your code never
sees a token, no ambient `fetch`, no DOM. Egress is enforced by the worker origin's CSP, not
by anything in the SDK.

!!! warning "A member is absent unless its scope was granted"
    `ctx.graph`, `ctx.message`, `ctx.net`, and `ctx.config` are **optional** and only exist
    when the corresponding [scope](../reference/scopes.md) was declared *and* granted. A no-scope plugin
    like **Dumb AI Optimizer** correctly sees `ctx.graph === undefined`. Guard with optional
    chaining or feature-test before use. Within `ctx.graph`, each *method* is likewise present
    only if its specific verb (`node:delete`, `edge:create`, …) was granted.

### Always present

These members exist on every run, regardless of scopes.

| Member | Type | What it gives you |
|---|---|---|
| `ctx.run` | `{ runId, projectId, pluginId, grantedScopes, platform }` | Identity of this run; `grantedScopes` is the server-clamped scope set; `platform` is `"web"` or `"desktop"`. |
| `ctx.input` | `{ selection: string[] }` | The node ids the user had selected when the run launched. **Black Hole** reads `ctx.input.selection`. |
| `ctx.params` | `Readonly<Record<string, unknown>>` | This run's user input, validated against the manifest `params` schema. A consumed node bound via a `TypeRef.as` alias is pre-bound here. |
| `ctx.progress` | `{ set?, log?, status? }` | Drives the continuously-managed task UI (details below). |
| `ctx.signal` | `AbortSignal` | Cooperative cancellation — you **must** observe it. |
| `ctx.onCancel` | `(handler) => void` | Register a cleanup handler invoked on cancel. |

!!! tip "Cancellation is cooperative"
    Nothing force-kills your `run`. Poll `ctx.signal.aborted`, pass `ctx.signal` to long
    awaits, or register `ctx.onCancel(...)`. A plugin that ignores the signal will keep
    running until it returns. Long-running plugins should set
    `lifecycle.controls: ["cancel"]` in the [manifest](plugin-manifest.md).

### Progress, status, and logging

These live under `ctx.progress` (each method optional but always available on the object):

```ts
ctx.progress?.set?.({ percent: 40, message: "Scanning neighbors", phase: "expand" });
ctx.progress?.log?.("found 12 candidate nodes");
ctx.progress?.status?.("waiting");   // "running" | "waiting"
```

`status("waiting")` is how you signal a backoff/rate-limit pause so the UI can show the
waiting state — see [`net.fetchWithBackoff`](#scope-gated-members) for the built-in path.

### Scope-gated members

Each of the following is `undefined` unless its scope was granted.

=== "graph (graph:* scopes)"

    Present iff at least one `graph` verb was granted. Each method present iff its verb was
    granted.

    ```ts
    // reads — node:read / edge:read
    ctx.graph?.get?(nodeId): Promise<GraphNode | null>
    ctx.graph?.list?(opts?): Promise<{ nodes: GraphNode[]; cursor?: string }>
    ctx.graph?.neighbors?(nodeId): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>

    // single writes — node:create / node:update / node:delete / edge:create / edge:delete
    ctx.graph?.createNode?(draft: EntityDraft): Promise<GraphNode>
    ctx.graph?.updateNode?(nodeId, data): Promise<GraphNode>
    ctx.graph?.deleteNode?(nodeId): Promise<void>
    ctx.graph?.createEdge?(edge: EdgeDraft): Promise<GraphEdge>
    ctx.graph?.deleteEdge?(edgeId): Promise<void>

    // bulk
    ctx.graph?.deleteNodes?(ids: string[]): Promise<{ deleted: number }>
    ctx.graph?.emit?(entities: EntityDraft[], edges?: EdgeDraft[]):
      Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>
    ```

    `list({ type, limit, cursor })` is cursor-paged whole-graph enumeration (used by
    whole-graph plugins like **Thanos Snap**). `neighbors` returns the 1-hop neighborhood
    (used by **Black Hole**). An `EntityDraft.key` is an optional client-side dedup key so
    re-runs upsert instead of duplicating; `EdgeDraft` references nodes by `key` or returned
    id, and `label` should match an activated [Type Pack](typepacks.md) edge type.

=== "message (message:post)"

    Present iff `message:post` was granted. Posts into the project chat/feed.

    ```ts
    ctx.message?.post?.(text: string, meta?: Record<string, unknown>): Promise<void>
    ```

    !!! note "Member name"
        The host context exposes this as **`ctx.message.post`** in `sdk/types.ts`. (The scope
        string is `message:post`.)

=== "net (network scope)"

    Present iff at least one [network scope](../reference/scopes.md) is declared. Limited to the
    `manifest.scopes.network` endpoints; the bridge forces `credentials: "omit"` and drops
    `Authorization`/`Cookie`. The six reference plugins use **no** network.

    ```ts
    ctx.net?.fetch?(input: string, init?: SafeRequestInit): Promise<SafeResponse>
    ctx.net?.fetchWithBackoff?(input, init?, opts?): Promise<SafeResponse>
    ```

    `fetchWithBackoff` is the single home for HTTP 429 / `Retry-After` handling and surfaces
    the waiting state for you.

=== "config (scopes.config)"

    Present iff `scopes.config` is declared. Read-only, declared values only.

    ```ts
    ctx.config?: Readonly<Record<string, string | number | boolean>>
    ```

    !!! warning "Secrets are never readable"
        `config.secret: true` values are **excluded** — they are injected at the network
        boundary by the host and never returned to the plugin. On web, secret config routes
        to the desktop plugin. See [secrets handling](security.md#secret-handling).

### Bulk ops and the write cap

`deleteNodes(ids[])` and `emit(entities, edges)` each count as a **single bounded operation**
against the RunToken's write cap. This is deliberate: a legitimate mass-delete (Korean
Roulette wiping the whole graph) is not throttled to death the way thousands of individual
`deleteNode` calls would be. Prefer the bulk forms for whole-graph mutations.

## A complete `run(ctx)` example

For a full worked example (Korean Roulette) and a `createMockContext` unit test, see
[quickstart](quickstart.md).

## Testing with `createMockContext`

`createMockContext` lets you unit-test `run(ctx)` with no app, no GitHub, and no server. It
builds a `HostContext` whose `graph` / `net` / `message` members exist **only for the granted
scopes**, so scope gating is exercised exactly as in production. The returned context carries
a `mock` record you can assert against.

`MockContextOptions` accepts `nodes`, `edges`, `params`, `config`, `selection`, `projectId`,
`pluginId`, `grantedScopes`, and `platform`. The `ctx.mock` record exposes `nodes`, `edges`,
`createdNodes`, `deletedNodeIds`, `deletedEdgeIds`, `messages`, `netCalls`, and `progress`.
See [quickstart](quickstart.md) for a full test example.

!!! note "Reference implementation"
    In `sdk/types.ts`, `createMockContext` is declared (`export declare function …`) with a
    reference sketch; the shipped SDK provides the implementation. Treat the names above as
    the stable contract.

## Next / See also

- [Plugin manifest](plugin-manifest.md) — the `manifest` you pass to `definePlugin`
- [Scopes reference](../reference/scopes.md) — what gates each `ctx` member
- [Security model](security.md) — the worker sandbox, RunToken, and write caps
- [Lifecycle](lifecycle.md) — progress, cancellation, and task states
- [Quickstart](quickstart.md) — Developer Mode and the test harness
- [Reference plugins](../guide/running-plugins.md) — the six Chaos plugins the SDK is validated against
