# Scopes reference

A complete catalog of every scope string a plugin can declare in `manifest.scopes`, what each grants, and which `ctx` member it unlocks. Scopes are the **only** authority a plugin gets — a `ctx` member is absent unless its scope was granted, so there is nothing to bypass. Declare least privilege: pick the narrowest verbs your plugin actually needs.

For how grants are enforced at runtime (the one-time RunToken, CSP egress, secret scrubbing), see [security](../develop/security.md).

The `scopes` block has exactly four keys, all optional:

```jsonc
"scopes": {
  "graph":   ["node:read", "edge:create"],                 // fine-grained graph verbs
  "publish": ["message:post"],                              // post to project feed
  "network": [ { "endpoint": "https://...", "methods": ["POST"] } ],
  "config":  [ { "key": "max_concurrency", "type": "number" } ]
}
```

## graph

Fine-grained verbs over nodes and edges (`node:*` / `edge:*` × read/create/update/delete). A plugin that deletes must declare `node:delete` / `edge:delete` explicitly. `ctx.graph` is present iff **at least one** graph verb is granted; each method below is present iff its specific verb is granted. (Source: `sdk/types.ts` `GraphScope`, `HostContext.graph`.)

| Scope string | Grants | `ctx` member(s) |
| --- | --- | --- |
| `node:read` | Read individual nodes, enumerate the graph, list neighbors | `ctx.graph.get`, `ctx.graph.list`, `ctx.graph.neighbors` |
| `node:create` | Create nodes from `EntityDraft`s; bulk upsert | `ctx.graph.createNode`, `ctx.graph.emit` |
| `node:update` | Patch a node's `data` | `ctx.graph.updateNode` |
| `node:delete` | Delete one node or many in a single bounded op | `ctx.graph.deleteNode`, `ctx.graph.deleteNodes` |
| `edge:read` | Read edges (returned alongside neighbor/list queries) | `ctx.graph.neighbors`, `ctx.graph.list` |
| `edge:create` | Create edges; bulk upsert edges | `ctx.graph.createEdge`, `ctx.graph.emit` |
| `edge:update` | Update edge data | *(reserved; no dedicated method in `sdk/types.ts`)* |
| `edge:delete` | Delete an edge | `ctx.graph.deleteEdge` |

!!! note "Bulk ops count as one write"
    `deleteNodes(ids[])` and `emit(entities, edges)` count as a **single** bounded operation against the RunToken's `max_writes` cap, so a legitimate mass-delete (Korean Roulette, Thanos Snap) is not throttled to death. See [security](../develop/security.md).

!!! info "Emit needs both verbs"
    `ctx.graph.emit(entities, edges)` upserts nodes *and* edges. To use it for both, grant `node:create` and `edge:create`. With only `node:create`, pass `emit(entities)` with no edges.

## publish

| Scope string | Grants | `ctx` member |
| --- | --- | --- |
| `message:post` | Post a text message (with optional metadata) into the project chat/feed | `ctx.message.post` |

`ctx.message` is present iff `message:post` is granted. (Source: `sdk/types.ts` `PublishScope`, `HostContext.message`.)

## network

Each entry is a `NetworkScope` object, **not** a bare string. `ctx.net` is present iff at least one network scope is declared. (Source: `sdk/types.ts` `NetworkScope`, `HostContext.net`.)

```jsonc
"network": [
  { "endpoint": "https://api.example.com/v1/lookup",
    "methods": ["POST"],
    "purpose": "shown at install" }
]
```

| Field | Type | Meaning |
| --- | --- | --- |
| `endpoint` | `string` | Exact origin/path prefix the plugin may reach |
| `methods` | `HttpMethod[]` | Allowed verbs: `GET` `POST` `PUT` `PATCH` `DELETE` |
| `purpose` | `string` (optional) | Human-readable reason, shown at install time |

`ctx.net.fetch` / `ctx.net.fetchWithBackoff` are limited to these endpoints.

!!! warning "Web: exactly one endpoint == proxy_endpoint"
    For a **web** plugin the `network` array MUST contain exactly **one** entry whose `endpoint` equals `platforms.web.proxy_endpoint` — no fan-out. Egress is enforced by the worker origin's `Content-Security-Policy: connect-src`, not by JS. Desktop may declare more endpoints (the user's responsibility). The bridge forces `credentials: "omit"` and drops `Authorization` / `Cookie` headers (`SafeRequestInit`).

## config

Each entry is a `ConfigValue`. Declaring any `config` entry makes `ctx.config` present — a read-only map of the **non-secret** declared values. (Source: `sdk/types.ts` `ConfigValue`, `HostContext.config`.)

| Field | Type | Meaning |
| --- | --- | --- |
| `key` | `string` | Identifier, pattern `^[a-z0-9_]+$` |
| `label` | `string` (optional) | Display label in the install form |
| `type` | `"string" \| "number" \| "boolean" \| "url" \| "enum"` | Value type |
| `enum` | `string[]` (optional) | Allowed values when `type` is `enum` |
| `secret` | `boolean` (optional) | BYOK-style credential; see below |
| `scope` | `"plugin" \| "project" \| "user"` (optional) | Where the value is stored |
| `optional` | `boolean` (optional) | If false/absent, the value is required at install |

!!! danger "secret semantics"
    `secret: true` means **keychain/desktop only**. The value is injected at the network boundary by the host (desktop keychain via `safeStorage`/keyring); it is **never returned to the browser**, **never recorded** in any task record or AI conversation, and the plugin gets no "read my secret config" call — it cannot reflect a key into its own output. Secret values are therefore **excluded from `ctx.config`** on web; a web install with secret config guides the user to the desktop plugin. BYOK in the browser is unsupported by design. See [security](../develop/security.md) and SPEC §6.

## Not scopes

The following are **always available** and grant no authority over data or network. They require no declaration. (Source: SPEC §4; `sdk/types.ts` `HostContext`.)

| Capability | `ctx` member | Notes |
| --- | --- | --- |
| `params` | `ctx.params` | This run's user input, validated against the `params` JSON Schema (read-only) |
| `progress` | `ctx.progress.set` | Drives the Task UI (`percent` / `message` / `phase`) |
| `log` | `ctx.progress.log` | Append a log line to the run |
| `status` | `ctx.progress.status` | Report `"running"` / `"waiting"` |
| `signal` | `ctx.signal`, `ctx.onCancel` | Cooperative cancel — the plugin MUST observe it |

Two members are also always present and not gated: `ctx.run` (this run's identity — `runId`, `projectId`, `pluginId`, `grantedScopes`, `platform`) and `ctx.input` (the trigger context, including `selection`).

!!! example "A scope-0 plugin"
    The Chaos pack's **Dumb AI Optimizer** declares no scopes at all. It still gets `ctx.params`, `ctx.progress`, and `ctx.signal` — but `ctx.graph`, `ctx.net`, `ctx.message`, and `ctx.config` are all `undefined`.

## Next / See also

- [Security](../develop/security.md) — RunToken, CSP egress, secret scrubbing
- [Plugin schema](plugin-schema.md) — the full manifest reference
- [SDK](../develop/sdk.md) — `ctx` interface and `definePlugin`
