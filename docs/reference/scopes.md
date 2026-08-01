# Scopes reference

A complete catalog of every scope string a plugin can declare in `manifest.scopes`, what each grants, and which `ctx` member it unlocks. Scopes are the **only** authority a plugin gets — a `ctx` member is absent unless its scope was granted, so there is nothing to bypass. Declare least privilege: pick the narrowest verbs your plugin actually needs.

For how grants are enforced at runtime (the Web Worker sandbox, the egress allowlist, secret scrubbing), see [security](../develop/security.md).

The `scopes` block has exactly four keys, all optional:

```jsonc
"scopes": {
  "graph":     ["node:read", "edge:create"],               // fine-grained graph verbs
  "network":   [ { "endpoint": "https://...", "methods": ["POST"] } ],
  "web_probe": { "purpose": "check whether a profile page exists" },  // desktop only
  "config":    [ { "key": "max_concurrency", "type": "number" } ]
}
```

!!! warning "There is no `publish` scope"
    A plugin cannot post into the project chat or feed — `ctx.message` does not exist. If you have a draft manifest carrying `"publish": ["message:post"]`, delete the key: `scopes` is `additionalProperties: false`, so the manifest now fails schema validation.

## graph

Fine-grained verbs over nodes and edges (`node:*` / `edge:*` × read/create/update/delete). A plugin that deletes must declare `node:delete` / `edge:delete` explicitly. `ctx.graph` is present iff **at least one** graph verb is granted; each method below is present iff its specific verb is granted. (Source: the `@vineyard/plugin-sdk` package types — `GraphScope`, `HostContext.graph`.)

| Scope string | Grants | `ctx` member(s) |
| --- | --- | --- |
| `node:read` | Read individual nodes, enumerate the graph, list neighbors | `ctx.graph.get`, `ctx.graph.list`, `ctx.graph.neighbors` |
| `node:create` | Create nodes from `EntityDraft`s; bulk upsert | `ctx.graph.createNode`, `ctx.graph.emit` |
| `node:update` | Patch a node's `data` | `ctx.graph.updateNode` |
| `node:delete` | Delete one node or many in a single bounded op | `ctx.graph.deleteNode`, `ctx.graph.deleteNodes` |
| `edge:read` | Read edges (returned alongside neighbor/list queries) | `ctx.graph.neighbors`, `ctx.graph.list` |
| `edge:create` | Create edges; bulk upsert edges | `ctx.graph.createEdge`, `ctx.graph.emit` |
| `edge:update` | Update edge data | *(reserved; no dedicated method in the SDK types)* |
| `edge:delete` | Delete an edge | `ctx.graph.deleteEdge` |

!!! note "A write verb is not a write"
    Granting `node:create` (or any create/update/delete verb) does not let a plugin change the case. Writes are captured into the run's change set and reach the graph only when the analyst reviews that change set and applies it, under their own account. That review — not the scope string — is what actually bounds an untrusted plugin.

!!! note "Bulk ops are one operation"
    `deleteNodes(ids[])` and `deleteEdges(ids[])` are a **single** bounded call, not N separate writes: a legitimate mass-delete (Russian Roulette, Thanos Snap) is issued once and the host caps its own concurrency.

!!! info "Emit needs both verbs"
    `ctx.graph.emit(entities, edges)` upserts nodes *and* edges. To use it for both, grant `node:create` and `edge:create`. With only `node:create`, pass `emit(entities)` with no edges.

## network

Each entry is a `NetworkScope` object, **not** a bare string. `ctx.net.fetch` is present iff at least one network scope is declared. (Source: the `@vineyard/plugin-sdk` package types — `NetworkScope`, `HostContext.net`.)

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

`ctx.net.fetch` / `ctx.net.fetchWithBackoff` are limited to these endpoints. A URL is matched on its **parsed origin** plus a path-segment boundary, never as a string prefix — `https://h/v1` covers `/v1/search` but not `/v1beta`, and nothing at all on `https://h.attacker.test` (`plugins/net-allowlist.ts`, `endpointCovers`).

!!! warning "Web: exactly one endpoint == proxy_endpoint"
    For a **web** plugin the `network` array MUST contain exactly **one** entry whose `endpoint` equals `platforms.web.proxy_endpoint` — no fan-out. Desktop may declare more endpoints (the user's responsibility) and adds a CSP on top; in the web build the allowlist check is the egress boundary. The bridge forces `credentials: "omit"` and drops `Authorization` / `Cookie` headers (`SafeRequestInit`), so a plugin can never smuggle the analyst's session onto an allowed endpoint.

## web_probe

A single object, **not** an array. It grants `ctx.net.probe` — one anonymous request against an *arbitrary* public host. Where `network` is an allowlist (the plugin names the endpoints it will call), `web_probe` is the opposite shape: a plugin such as account discovery cannot know in advance which of hundreds of sites it will hit, so it declares the *manner* of access instead and the host constrains it. (Source: the `@vineyard/plugin-sdk` package types — `WebProbeScope`, `HostContext.net.probe`.)

```jsonc
"web_probe": { "purpose": "check whether a username has a profile page" }
```

| Field | Type | Meaning |
| --- | --- | --- |
| `purpose` | `string` (optional) | Human-readable reason |

The host, not the plugin, sets the terms: no cookies and no credentials (`Cookie` / `Authorization` / `Host` are dropped), private and loopback targets refused, and `maxBytes` / `timeoutMs` clamped to a ceiling. Redirects are **not** followed — the caller sees the true status of the URL it asked for, which is what presence detection depends on (a 302 to a login page means "no account"), with the `Location` returned as `redirectUrl`.

!!! warning "Desktop only"
    `ctx.net.probe` is performed by the Electron main process — the only place a cross-origin response can be read from a host that declines CORS. In the web build the capability has no backing, so `ctx.net.probe` is **absent** even when granted. Check for it before calling and fall back (the WhatsMyName pack does exactly this).

## config

Each entry is a `ConfigValue`. Declaring any `config` entry makes `ctx.config` present — a read-only map of the **non-secret** declared values. (Source: the `@vineyard/plugin-sdk` package types — `ConfigValue`, `HostContext.config`.)

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

The following are **always available** and grant no authority over data or network. They require no declaration. (Source: SPEC §4; the `@vineyard/plugin-sdk` package types — `HostContext`.)

| Capability | `ctx` member | Notes |
| --- | --- | --- |
| `params` | `ctx.params` | This run's user input, validated against the `params` JSON Schema (read-only) |
| `progress` | `ctx.progress.set` | Drives the Task UI (`percent` / `message` / `phase`) |
| `log` | `ctx.progress.log` | Append a log line to the run |
| `status` | `ctx.progress.status` | Report `"running"` / `"waiting"` |
| `signal` | `ctx.signal`, `ctx.onCancel` | Cooperative cancel — the plugin MUST observe it |

Two members are also always present and not gated: `ctx.run` (this run's identity — `runId`, `projectId`, `pluginId`, `grantedScopes`, `platform`) and `ctx.input` (the trigger context, including `selection`).

!!! example "A scope-0 plugin"
    The Chaos pack's **Dumb AI Optimizer** declares no scopes at all. It still gets `ctx.params`, `ctx.progress`, and `ctx.signal` — but `ctx.graph`, `ctx.net`, and `ctx.config` are all `undefined`.

## Next / See also

- [Security](../develop/security.md) — the worker sandbox, egress allowlist, secret scrubbing
- [Plugin schema](plugin-schema.md) — the full manifest reference
- [SDK](../develop/sdk.md) — `ctx` interface and `definePlugin`
