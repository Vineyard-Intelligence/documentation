# SDK & host context

The plugin SDK is the small author-facing TypeScript surface you build a plugin
against. It gives you two define helpers, the typed `HostContext` (`ctx`) your `run` function
receives, and an in-process mock for unit tests. The SDK is a single TypeScript file,
[`sdk.ts`](../assets/sdk/sdk.ts), which matches the app as of this release. Copy it into your repo
and import from `./sdk`. Copies vendored in published pack repos can be older and lack newer
fields such as `SafeRequestInit.timeoutMs`.

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

`ctx` is a Comlink proxy to the host. The worker that runs your code has no DOM and no network
of its own — only the members its scopes granted. Your graph writes are staged: they are applied
only after the analyst reviews and approves the change set, except for a run the AI agent launched
under **Apply automatically** (see the [security model](security.md#graph-writes-are-staged-not-applied)).
Network requests are checked by the
host against the endpoints your manifest declared. See the [security model](security.md).

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
| `ctx.input` | `{ selection: string[] }` | The node ids this run targets. From the Run plugins panel: for a plugin with `consumes`, the selected nodes of a consumed type (scope *Selected*) or every node of those types in the project (scope *Whole project*); for a consumes-less plugin, the current selection. `run` is called **once** with the whole list — iterate all of it. **Black Hole** reads `ctx.input.selection[0]`. When the AI agent runs a plugin, `selection` holds the live node ids the agent passed. They are not filtered to your consumed types, and the agent is asked, but not forced, to pass none to a plugin with an empty `consumes`. Check each node's type, and have a whole-graph plugin ignore `selection`. |
| `ctx.params` | `Readonly<Record<string, unknown>>` | This run's user input from the pre-run form (only `required` is enforced — `pattern`/`minimum`/`maximum`/`default` are not applied, so validate and default in `run`). File fields arrive as `File` objects. Nothing is enforced when the AI agent fills `params`, not even `required`, so validate and default every value in `run`. |
| `ctx.progress` | `{ set?, log?, status? }` | Drives the continuously-managed task UI (details below). |
| `ctx.signal` | `AbortSignal` | Cooperative cancellation — you **must** observe it. |
| `ctx.onCancel` | `(handler) => void` | Register a cleanup handler invoked on cancel. |

!!! tip "Cancellation is cooperative"
    Cancellation is cooperative but bounded. Poll `ctx.signal.aborted`, pass `ctx.signal` to long
    awaits, or register `ctx.onCancel(...)`: after Stop the host waits 3 seconds for `run` to
    return, then terminates the worker. Whatever the run staged before stopping is kept for
    review. Independently, every run has a wall-clock budget (`lifecycle.timeout_ms`, default
    10 minutes, max 60) after which the worker is terminated and the run fails. A run that fails,
    for this or any other reason, discards what it had staged; only Stop keeps partial results.

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
resolve `void` — re-read via `get`/`list` if you need the applied state. `updateNode` merges:
values you pass replace those fields and every other field is kept, including on a node your run
just created. Empty strings and `null` are ignored, so it cannot clear a field. It throws on an
id that is not in the project. `createNode`
de-duplicates by identity — the canonical type plus that type's `identity_properties` (else its label property, else `value`): if
a live node (or one this run already created) has the same identity, it is reused and your
fields are merged in, and that node is returned. It throws if `type` is not defined by an
installed [Type Pack](typepacks.md). Both `createNode` and `updateNode` throw when the data fails
the type's property checks; see
[What the app checks on node data](typepacks.md#what-the-app-checks-on-node-data).
`EdgeDraft.from`/`to` are node ids — live ids or the ids `createNode` returned. `label` is free
text describing the relationship; edges have no type.

`updateEdge` is gated by `edge:create` (the `edge:update` scope currently grants nothing). Omit
`label` to leave the wording and its grade alone. `EdgeDraft`/`updateEdge` accept an optional
`data` object that is merged into the edge; `confidence`, `confidence_source`, `label_source` and
`corroborated_by` are host-owned and rejected. There is one edge per ordered node pair, so
`createEdge` on a pair that is already linked proposes a relabel of that edge instead of adding
one.

Edges read back through `edges` and `neighbors` carry only `id`, `from_node_id`, `to_node_id` and
`label`. Their `data` is not returned, although the `GraphEdge` type declares it, so a plugin cannot
read back the `data` it wrote, nor an edge's `confidence` or `label_source`.

<div id="net-network"></div>

#### `net` (network scope)

Present iff a [`network` scope](../reference/scopes.md) is declared (or, in the desktop app,
`web_probe` — then only `probe` exists). `fetch` is limited to the `manifest.scopes.network`
endpoints and their declared `methods`. Requests are sent without cookies and pass your request
headers, including `Authorization`, through unchanged. A request that carries any header or a body
does not follow a redirect: a 3xx answer rejects with an `Error` whose message starts with
`redirect not followed`. A request with neither follows redirects as the browser does.
The six reference plugins use **no** network.

```ts
ctx.net?.fetch?(input: string, init?: SafeRequestInit): Promise<SafeResponse>
```

Each request has a deadline covering the whole response, body included: 60 s by default. Set
`init.timeoutMs` to change it (at least 1 s, at most 10 minutes); `0`, a negative number or a value
that is not a number gives the 60 s default. A request that misses it rejects with an `Error` named
`TimeoutError`, whose message names only the method and origin, e.g.
`GET https://api.example.com did not answer within 60s`; an `AbortError` means the run was
stopped. The run's wall-clock budget still applies on top.

The host remembers which origins did not answer in time, so a plugin that catches `TimeoutError`
can still return normally and the gap is reported for it. If the run succeeds without staging
anything, its notification turns yellow and ends `(no answer from <origins>)`; for a run the AI
agent launched, the agent is told which hosts did not answer, whatever the outcome.

There is no built-in retry/backoff helper — handle HTTP `429`/`Retry-After` yourself and
report the pause with `ctx.progress?.set?.({ message: "waiting for rate limit…" })` while you wait.

#### `net.probe` (`web_probe` scope, desktop only)

Present iff `scopes.web_probe` is declared **and** the plugin is running in the desktop
shell — it stays absent in the web build even when the scope is granted. Performs ONE
anonymous request to an arbitrary public host, for plugins that cannot know their target hosts
in advance: no cookies, no `Origin`, redirects are not followed (the caller sees the true
status), and private/loopback hosts are refused. Only the default
ports (80/443) and methods GET/HEAD/POST are allowed; `cookie`, `authorization`, `host` and
forwarding headers are dropped; unless you set `User-Agent`, a desktop-browser one is sent.
`maxBytes` defaults to 512 KiB (max 2 MiB). `timeoutMs` bounds the connection and response: 8 s by
default, at least 1 s and at most 20 s. The shell runs at most 48 probes at once, and the clock
starts only once a probe has a slot and its host name has been checked (DNS has its own 3 s
deadline, tried twice), so a probe can take longer than `timeoutMs`. Up to 2048 probes wait for a
slot; past that a probe resolves at once with `error: "too many queued probes"`. A refused or
failed probe resolves with `status: 0` and `error` set rather than throwing.

Two options change what comes back:

- `bodyEncoding: "base64"` returns the body base64-encoded, for binary content such as a favicon.
  Check `response.bodyEncoding === "base64"` before decoding.
- `headerNames: true` (GET or HEAD only) makes the request over HTTP/1.1 and returns
  `headerNames`: the response header names exactly as the server sent them — order, case and
  repeats. The body is not read.

```ts
ctx.net?.probe?(input: string, init?: SafeProbeInit): Promise<SafeProbeResponse>
```

#### `service` (`scopes.services`)

Present iff `scopes.services` names at least one Vineyard-operated service (currently
`rdap`, open to any pack, and `telegram`, reserved for `run.vineyard.pluginpacks.telegram` —
other packs calling it get an error). Calls throw in a build running without a Vineyard account
(local mode). The destination is a NAME, not a URL — the host resolves it and
attaches the analyst's credential; an `Authorization` header you pass cannot override it.

```ts
ctx.service?(name: string, path: string, init?: SafeRequestInit): Promise<SafeResponse>
```

`init.timeoutMs` and the request deadline work as for `net.fetch`.

`path` is resolved against the service's root: a leading slash is dropped, so `"/8.8.8.8"` and
`"8.8.8.8"` reach the same place. A path that would leave the root, through a `..` that climbs out
or an absolute URL, throws `service path '<path>' escapes the '<name>' service root`. Because a
service request always carries the analyst's credential, it never follows a redirect: a 3xx answer
rejects with an `Error` whose message starts with `redirect not followed`. A `401` means the
analyst's Vineyard session has ended, not that the service is broken.

#### `config` (`scopes.config`)

Present iff `scopes.config` is declared **and** the analyst has set at least one of its keys. Read-only, declared values only.

```ts
ctx.config?: Readonly<Record<string, string | number | boolean>>
```

!!! warning "Secrets reach only the plugin that declared them"
    `secret: true` only changes how the value is entered (a masked field) — the value is still
    handed to the plugin that declared it, as `ctx.config.<key>`; only keys your own manifest
    declares ever reach you. Members of one pack that declare the same key and call the same
    network origins share one value, so the analyst enters it once. Values are kept per signed-in
    account — in the OS keychain on desktop (for that session only on a desktop that cannot
    encrypt them), in that tab only in the browser. See
    [secrets handling](security.md#secret-handling).

!!! note "There is no `publish` scope"
    A plugin cannot post into the project chat/feed — there is no `ctx.message`. `publish` is
    not in the scopes schema; the app ignores it and grants nothing, so remove it. Report what
    you found by writing it into the graph instead.

### Bulk ops

`deleteNodes(ids[])` and `deleteEdges(ids[])` are each a **single bridge call** that stages one
delete per id in one batch, rather than hundreds of round trips. The whole call is refused
(`no node <id> in this project` / `no edge <id> in this project`) if any id is unknown, so pass
only ids you read from the graph. Prefer the bulk forms for whole-graph mutations (e.g. Korean
Roulette wiping the whole graph). Each affected node and edge still appears as its own line in the
change set the analyst reviews.

## A complete `run(ctx)` example

For a full worked example (Korean Roulette) and a `createMockContext` unit test, see
[quickstart](quickstart.md).

<div id="createmockcontext"></div>

## Testing with `createMockContext`

`createMockContext` lets you unit-test `run(ctx)` with no app, no GitHub, and no server. It
builds a `HostContext` over an in-memory graph: `graph` exists when any graph verb is granted and
its **write** methods only for their verbs (the read methods are always present in the mock —
production also requires `node:read`/`edge:read`); `net.fetch`/`net.probe` exist when you pass
`netHandler`/`probeHandler`; `config` is whatever you pass (default `{}`). `updateEdge` and
identity de-dup are not mocked. The returned context carries a `mock` record you can assert
against.

The mock differs from the app in ways a passing test can hide:

- Writes land in the mock's graph at once, so `get`, `list`, `edges` and `neighbors` see what the
  run created or changed and stop seeing what it deleted. In the app these reads come from the
  live graph, where staged changes do not show until they are applied; only `get` also finds a
  node the run created.
- `list({ type })` ignores `type` and returns every node.
- `edges` and `neighbors` return the edges you passed in, `data` included; the app returns no edge
  `data`.
- `ctx.signal` is `undefined` unless you pass `signal`, so code that reads `ctx.signal.aborted`
  needs one in tests; `onCancel` handlers are never called.
- `ctx.config` is `{}` when you pass no `config`; in the app it is absent until the analyst sets one
  of the declared keys.
- There is no `ctx.service`. `net.fetch` hands every request to your `netHandler`, with no check
  against your declared endpoints and methods, no deadline and no redirect rule.
- `createNode` does not check the type against installed Type Packs, nor the data against the
  type's property checks.
- `updateNode` writes `""` and `null` over a field; the app ignores them.
- `createEdge` stores no `data` on the edge (the draft you passed, `data` included, is recorded in
  `mock.createdEdges`), does not refuse the host-owned `data` keys, and always adds a new edge
  instead of relabelling an already-linked pair.
- `updateNode`, `deleteNode`, `deleteEdge` and the bulk deletes do not refuse unknown ids.
- `run.platform` is always `"web"`.

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
