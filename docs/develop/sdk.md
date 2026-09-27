# SDK & host context

The plugin SDK is the small author-facing TypeScript surface you build a plugin
against. It gives you two define helpers, the typed `HostContext` (`ctx`) your `run` function
receives, and an in-process mock for unit tests. The SDK is a single TypeScript file, `sdk.ts`
(the in-app runtime copy, vendored e.g. as `src/sdk.ts` in the `pluginpack-otx`
repo). Copy it into your repo and import from `./sdk`.

## The two define helpers

A plugin's bundle does a default export through one of two factory functions. Both are
identity functions — they exist purely to give you type-checking against the SDK shapes.

```ts
import { definePlugin, definePluginPack } from "./sdk";

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

`ctx` is a Comlink proxy of the main-thread *HostBridge*. The worker that runs your code holds
no token, no ambient `fetch`, and no DOM — only the members its scopes granted. Your graph
writes do not reach the API from the run: the bridge captures them, and the analyst applies
them under their own account after reviewing the change set. Network egress is checked by the
bridge against the endpoints your manifest declared, not by anything in the SDK. See the
[security model](security.md).

!!! warning "A member is absent unless its scope was granted"
    `ctx.graph`, `ctx.net`, and `ctx.config` are **optional** and only exist when the
    corresponding [scope](../reference/scopes.md) was declared *and* granted. A no-scope plugin
    like **Dumb AI Optimizer** correctly sees `ctx.graph === undefined`. Guard with optional
    chaining or feature-test before use. Within `ctx.graph`, each *method* is likewise present
    only if its specific verb (`node:delete`, `edge:create`, …) was granted.

### Always present

These members exist on every run, regardless of scopes.

| Member | Type | What it gives you |
|---|---|---|
| `ctx.run` | `{ runId, projectId, pluginId, grantedScopes, platform }` | Identity of this run; `grantedScopes` is the manifest's scope set as approved at install; `platform` is `"web"` or `"desktop"`. |
| `ctx.input` | `{ selection: string[] }` | The node ids this run targets. From the Run plugins panel: for a plugin with `consumes`, the selected nodes of a consumed type (scope *Selected*) or every node of those types in the case (scope *Whole project*); for a consumes-less plugin, the current selection. `run` is called **once** with the whole list — iterate all of it. **Black Hole** reads `ctx.input.selection[0]`. |
| `ctx.params` | `Readonly<Record<string, unknown>>` | This run's user input from the pre-run form (only `required` is enforced — `pattern`/`minimum`/`maximum`/`default` are not applied, so validate and default in `run`). File fields arrive as `File` objects. |
| `ctx.progress` | `{ set?, log?, status? }` | Drives the continuously-managed task UI (details below). |
| `ctx.signal` | `AbortSignal` | Cooperative cancellation — you **must** observe it. |
| `ctx.onCancel` | `(handler) => void` | Register a cleanup handler invoked on cancel. |

!!! tip "Cancellation is cooperative"
    Cancellation is cooperative but bounded. Poll `ctx.signal.aborted`, pass `ctx.signal` to long
    awaits, or register `ctx.onCancel(...)`: after Stop the host waits 3 seconds for `run` to
    return, then terminates the worker. Whatever the run staged before stopping is kept for
    review. Independently, every run has a wall-clock budget (`lifecycle.timeout_ms`, default
    10 minutes, max 60) after which the worker is terminated and the run fails.

### Progress, status, and logging

These live under `ctx.progress` (each method optional but always available on the object):

```ts
ctx.progress?.set?.({ percent: 40, message: "Scanning neighbors", phase: "expand" });
ctx.progress?.log?.("found 12 candidate nodes");
ctx.progress?.status?.("waiting");   // "running" | "waiting"
```

Only `set` is surfaced: `percent` drives the Tasks row's progress and `message` is shown after
the plugin name (`phase` is ignored). `log` and `status` are accepted but currently discarded —
to show a rate-limit pause, report it through `set({ message: "waiting for rate limit…" })`. The
SDK has no built-in backoff helper.

### Scope-gated members

Each of the following is `undefined` unless its scope was granted.

#### `graph` (`graph:*` scopes)

Present iff at least one `graph` verb was granted. Each method present iff its verb was
granted.

```ts
// reads — node:read
ctx.graph?.get?(nodeId): Promise<GraphNode | null>
ctx.graph?.list?(opts?: { type?: string }): Promise<{ nodes: GraphNode[] }>

// reads — edge:read
ctx.graph?.edges?(): Promise<GraphEdge[]>
ctx.graph?.neighbors?(nodeId): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>

// single writes — node:create / node:update / node:delete / edge:create / edge:delete
ctx.graph?.createNode?(draft: EntityDraft): Promise<GraphNode>
ctx.graph?.updateNode?(nodeId, data): Promise<void>
ctx.graph?.deleteNode?(nodeId): Promise<void>
ctx.graph?.createEdge?(edge: EdgeDraft): Promise<void>
ctx.graph?.updateEdge?(edgeId, patch: { label?: string; data?: Record<string, unknown> }): Promise<void>   // edge:create
ctx.graph?.deleteEdge?(edgeId): Promise<void>

// bulk
ctx.graph?.deleteNodes?(ids: string[]): Promise<{ deleted: number }>
ctx.graph?.deleteEdges?(ids: string[]): Promise<{ deleted: number }>
```

`list({ type })` filters by node type over the whole graph in one call — it is not
cursor-paginated (used by whole-graph plugins like **Thanos Snap**). `neighbors` returns
the 1-hop neighborhood (used by **Black Hole**). `updateNode` and `createEdge` take a
delta/draft and stage it for review rather than returning the resulting record, so both
resolve `void` — re-read via `get`/`list` if you need the applied state. `createNode`
de-duplicates by identity — the canonical type plus that type's `identity_properties` (else its label property, else `value`): if
a live node (or one this run already created) has the same identity, it is reused and your
fields are merged in, and that node is returned. It throws if `type` is not defined by an
installed [Type Pack](typepacks.md) or the data fails the type's property checks.
`EdgeDraft.from`/`to` are node ids — live ids or the ids `createNode` returned. `label` is free
text describing the relationship (Type Pack `edge_types` are not consulted).

`updateEdge` is gated by `edge:create` (the `edge:update` scope currently grants nothing). Omit
`label` to leave the wording and its grade alone. `EdgeDraft`/`updateEdge` accept an optional
`data` object that is merged into the edge; `confidence`, `confidence_source`, `label_source` and
`corroborated_by` are host-owned and rejected. There is one edge per ordered node pair, so
`createEdge` on a pair that is already linked proposes a relabel of that edge instead of adding
one.

#### `net` (network scope)

Present iff a [`network` scope](../reference/scopes.md) is declared (or, in the desktop app,
`web_probe` — then only `probe` exists). `fetch` is limited to the `manifest.scopes.network`
endpoints and their declared `methods`; the bridge forces `credentials: "omit"` so the analyst's
cookies never ride along, follows redirects, and passes your request headers — including
`Authorization` — through unchanged, so put an API key there rather than in a custom header.
The six reference plugins use **no** network.

```ts
ctx.net?.fetch?(input: string, init?: SafeRequestInit): Promise<SafeResponse>
```

There is no built-in retry/backoff helper — handle HTTP `429`/`Retry-After` yourself and
report the pause with `ctx.progress?.set?.({ message: "waiting for rate limit…" })` while you wait.

#### `net.probe` (`web_probe` scope, desktop only)

Present iff `scopes.web_probe` is declared **and** the plugin is running in the desktop
shell — it stays absent in the web build even when the scope is granted. Performs ONE
anonymous request to an arbitrary public host from the Electron main process: no cookies,
no `Origin`, redirects are not followed (the caller sees the true status), and
private/loopback hosts are refused. This is the capability behind account-discovery
plugins that cannot know in advance which of hundreds of sites they will probe. Only the default
ports (80/443) and methods GET/HEAD/POST are allowed; `cookie`, `authorization`, `host` and
forwarding headers are dropped. `maxBytes` defaults to 512 KiB (max 2 MiB) and `timeoutMs` to
8 s (max 20 s); the shell runs at most 48 probes at once. A refused or failed probe resolves with
`status: 0` and `error` set rather than throwing.

```ts
ctx.net?.probe?(input: string, init?: SafeProbeInit): Promise<SafeProbeResponse>
```

#### `service` (`scopes.services`)

Present iff `scopes.services` names at least one Vineyard-operated service (currently
`rdap`, open to any pack, and `telegram`, reserved for `run.vineyard.pluginpacks.telegram` —
other packs calling it get an error). Calls throw in a build running without a Vineyard account
(local mode). The destination is a NAME, not a URL — the host resolves it and
attaches the analyst's credential, so the plugin cannot redirect the call elsewhere and
the request headers a plugin passes cannot override `Authorization`.

```ts
ctx.service?(name: string, path: string, init?: SafeRequestInit): Promise<SafeResponse>
```

#### `config` (`scopes.config`)

Present iff `scopes.config` is declared **and** the analyst has set at least one of its keys. Read-only, declared values only.

```ts
ctx.config?: Readonly<Record<string, string | number | boolean>>
```

!!! warning "Secrets reach only the plugin that declared them"
    `secret: true` only changes how the value is entered (a masked field) — the value is still
    handed to the plugin that declared it, as `ctx.config.<key>`; only keys your own manifest
    declares ever reach you. Values are encrypted with the OS keychain on desktop, kept in
    `sessionStorage` for the tab in the browser, and are never written to a record. See
    [secrets handling](security.md#secret-handling).

!!! note "There is no `publish` scope"
    A plugin cannot post into the project chat/feed — there is no `ctx.message`, and `publish`
    is not part of the scopes schema. `scopes` sets `additionalProperties: false`, so a draft
    manifest still declaring it **fails validation**. Report what you found by writing it into
    the graph instead.

### Bulk ops

`deleteNodes(ids[])` and `deleteEdges(ids[])` are each a **single bridge call** that stages one
delete per id in one batch, rather than hundreds of round trips. The whole call is refused
(`no node <id> in this project` / `no edge <id> in this project`) if any id is unknown, so pass
only ids you read from the graph. Prefer the bulk forms for whole-graph mutations: a legitimate
mass-delete (Korean Roulette wiping the whole graph) should not be thousands of individual
`deleteNode` calls. Each affected node and edge still appears as its own line in the change set
the analyst reviews, so bulk does not mean unreviewable.

## A complete `run(ctx)` example

For a full worked example (Korean Roulette) and a `createMockContext` unit test, see
[quickstart](quickstart.md).

## Testing with `createMockContext`

`createMockContext` lets you unit-test `run(ctx)` with no app, no GitHub, and no server. It
builds a `HostContext` over an in-memory graph: `graph` exists when any graph verb is granted and
its **write** methods only for their verbs (the read methods are always present in the mock —
production also requires `node:read`/`edge:read`); `net.fetch`/`net.probe` exist when you pass
`netHandler`/`probeHandler`; `config` is whatever you pass (default `{}`). `updateEdge` and
identity de-dup are not mocked. The returned context carries a `mock` record you can assert
against.

`MockContextOptions` accepts `nodes`, `edges`, `params`, `config`, `selection`, `grantedScopes`,
`projectId`, `pluginId`, `signal`, `netHandler`, and `probeHandler`. The `ctx.mock` record
exposes `nodes`, `edges`, `createdNodes`, `createdEdges`, `deletedNodeIds`, `deletedEdgeIds`,
`updatedNodes`, and `progress`. See [quickstart](quickstart.md) for a full test example.

!!! note "Reference implementation"
    `createMockContext` is implemented in `sdk.ts` itself; treat the names above as the stable
    contract.

## Next / See also

- [Plugin manifest](plugin-manifest.md) — the `manifest` you pass to `definePlugin`
- [Scopes reference](../reference/scopes.md) — what gates each `ctx` member
- [Security model](security.md) — the worker sandbox, egress allowlist, and staged writes
- [Lifecycle](lifecycle.md) — progress, cancellation, and task states
- [Quickstart](quickstart.md) — the dev loader and the test harness
- [Reference plugins](../guide/running-plugins.md) — the six Chaos plugins the SDK is validated against
