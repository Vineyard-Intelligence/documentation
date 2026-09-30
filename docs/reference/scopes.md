# Scopes reference

A complete catalog of every scope string a plugin can declare in `manifest.scopes`, what each grants, and which `ctx` member it unlocks. A `ctx` member is absent unless its scope was granted. Declare least privilege: pick the narrowest verbs your plugin actually needs.

For how grants are enforced at runtime (the Web Worker sandbox, the egress allowlist, secret scrubbing), see [security](../develop/security.md).

The `scopes` block has exactly five keys, all optional:

```jsonc
"scopes": {
  "graph":     ["node:read", "edge:create"],               // fine-grained graph verbs
  "network":   [ { "endpoint": "https://...", "methods": ["POST"] } ],
  "web_probe": { "purpose": "check whether a profile page exists" },  // desktop only
  "services":  ["rdap"],                                   // Vineyard-operated services, by name
  "config":    [ { "key": "max_concurrency", "type": "number" } ]
}
```

## graph

Fine-grained verbs over nodes and edges (`node:*` / `edge:*` × read/create/update/delete). A plugin that deletes must declare `node:delete` / `edge:delete` explicitly. `ctx.graph` is present iff **at least one** graph verb is granted; each method below is present iff its specific verb is granted. (Source: the `@vineyard/plugin-sdk` package types — `GraphScope`, `HostContext.graph`.)

| Scope string | Grants | `ctx` member(s) |
| --- | --- | --- |
| `node:read` | Read individual nodes, list nodes (optionally by type) | `ctx.graph.get`, `ctx.graph.list` |
| `node:create` | Create nodes from `EntityDraft`s | `ctx.graph.createNode` |
| `node:update` | Patch a node's `data` | `ctx.graph.updateNode` |
| `node:delete` | Delete one node or many in a single bounded op | `ctx.graph.deleteNode`, `ctx.graph.deleteNodes` |
| `edge:read` | Read all edges; 1-hop neighborhood of a node | `ctx.graph.edges`, `ctx.graph.neighbors` |
| `edge:create` | Create edges; amend an existing edge (label/data) by its id | `ctx.graph.createEdge`, `ctx.graph.updateEdge` |
| `edge:update` | Accepted by the schema | *(backs no method — `updateEdge` is granted by `edge:create`)* |
| `edge:delete` | Delete one edge or many in a single bounded op | `ctx.graph.deleteEdge`, `ctx.graph.deleteEdges` |

!!! note "A write verb is not a write"
    Granting `node:create` (or any create/update/delete verb) does not let a plugin change the project. Writes are captured into the run's change set and reach the graph only when the analyst reviews that change set and applies it, under their own account.

!!! note "Bulk ops are one operation"
    `deleteNodes(ids[])` and `deleteEdges(ids[])` are a **single** bounded call, not N separate writes: a legitimate mass-delete (Russian Roulette, Thanos Snap) is issued once and the host caps its own concurrency.

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

`ctx.net.fetch` is limited to these endpoints. A URL is matched on its **parsed origin** (protocol, host and port) plus a path-segment boundary, never as a string prefix — `https://h/v1` covers `/v1/search` but not `/v1beta` — and on the declared `methods`.

!!! warning "The host bridge is the only way out"
    Plugin code has no network of its own: any `fetch`, XHR, WebSocket or nested worker the plugin opens itself is refused, on the web and in the desktop app. Use `ctx.net.fetch` (checked against these endpoints), [`ctx.net.probe`](#web_probe) or [`ctx.service`](#services). A dev server does not enforce this, so a pack that calls `fetch` directly works in development and fails in production. A sandbox-js plugin may declare several endpoints. Cookies are not sent; your request headers pass through as written, including `Authorization` (see [Sending a credential](plugin-schema.md#sending-a-credential)). On desktop, declared endpoints are reachable even without CORS headers.

## web_probe

A single object, **not** an array. It grants `ctx.net.probe` — one anonymous request against an *arbitrary* public host, for plugins such as account discovery that cannot list their endpoints in advance. (Source: the `@vineyard/plugin-sdk` package types — `WebProbeScope`, `HostContext.net.probe`.)

```jsonc
"web_probe": { "purpose": "check whether a username has a profile page" }
```

| Field | Type | Meaning |
| --- | --- | --- |
| `purpose` | `string` (optional) | Human-readable reason |

The host, not the plugin, sets the terms: no cookies and no credentials (`Cookie` / `Authorization` / `Host` are dropped), private and loopback targets refused, and `maxBytes` / `timeoutMs` clamped to a ceiling. Redirects are **not** followed — the caller sees the true status of the URL it asked for, which is what presence detection depends on (a 302 to a login page means "no account"), with the `Location` returned as `redirectUrl`.

!!! warning "Desktop only"
    In the web build `ctx.net.probe` is **absent** even when granted. Check for it before calling and fall back (the WhatsMyName pack does exactly this).

## services

Vineyard-operated services this plugin calls **by name**. Backs `ctx.service`, which takes a service name and a path; the base URL is fixed by the app.

```jsonc
"services": ["rdap"]
```

| Name | What it is |
| --- | --- |
| `rdap` | Cached IP RDAP lookups, normalized across every RIR |
| `telegram` | Read-only Telegram reconnaissance, on an account Vineyard operates |

A closed enum, so a typo fails at review. A service scope is **not** covered by
`scopes_summary.network` on the catalog card; it appears as its own `services` field.

```js
const res = await ctx.service('rdap', '8.8.8.8');
const who = await ctx.service('telegram', 'resolve', {
    method: 'POST',
    body: JSON.stringify({ target: 'durov' }),
});
```

`Authorization` on a service call is ignored — the host sets it. Some services are restricted to
named packs; `telegram` is one.

## config

Each entry is a `ConfigValue`. `ctx.config` is a read-only map of the declared keys the analyst has set a value for, secret ones included, coerced to the declared `type`. It is absent while none of them has a value, so read it as `ctx.config?.key ?? DEFAULT`. Values are kept per signed-in account — in the OS keychain on desktop, for the tab session in the browser. (Source: the `@vineyard/plugin-sdk` package types — `ConfigValue`, `HostContext.config`.)

| Field | Type | Meaning |
| --- | --- | --- |
| `key` | `string` | Identifier, pattern `^[a-z0-9_]+$` |
| `label` | `string` (optional) | Field label in the plugin's Settings section of the Run plugins dialog |
| `type` | `"string" \| "number" \| "boolean" \| "url" \| "enum"` | Value type |
| `enum` | `string[]` (optional) | Allowed values when `type` is `enum` |
| `secret` | `boolean` (optional) | BYOK-style credential; see below |
| `scope` | `"plugin" \| "project" \| "user"` (optional) | Where the value is stored. Accepted but not read today; values are stored per plugin |
| `optional` | `boolean` (optional) | If false/absent the field is marked "required by this plugin" (not enforced; the plugin must handle a missing value) |

!!! danger "secret semantics"
    `secret: true` **does not hide the value from the plugin**. The value IS delivered to the declaring plugin as `ctx.config[key]`, since the plugin is what calls the API with it. The flag masks the form field. The value is **never recorded** in a task record or an AI conversation, because credentials are kept out of `params`. See [security](../develop/security.md).

## Not scopes

The following are **always available** and grant no authority over data or network. They require no declaration. (Source: the `@vineyard/plugin-sdk` package types — `HostContext`.)

| Capability | `ctx` member | Notes |
| --- | --- | --- |
| `params` | `ctx.params` | This run's user input (read-only). Not validated against the `params` JSON Schema: the Run dialog only checks that `required` fields are filled, so validate types yourself |
| `progress` | `ctx.progress.set` | Drives the Task UI (`percent` / `message` / `phase`) |
| `log` | `ctx.progress.log` | Accepted but currently a no-op; nothing is recorded |
| `status` | `ctx.progress.status` | Accepted but currently a no-op; the task state is set by the runner |
| `signal` | `ctx.signal`, `ctx.onCancel` | Cooperative cancel — the plugin MUST observe it |

Two members are also always present and not gated: `ctx.run` (this run's identity — `runId`, `projectId`, `pluginId`, `grantedScopes`, `platform`) and `ctx.input` (the trigger context, including `selection`).

!!! example "A scope-0 plugin"
    The Chaos pack's **Dumb AI Optimizer** declares no scopes at all. It still gets `ctx.params`, `ctx.progress`, and `ctx.signal` — but `ctx.graph`, `ctx.net`, and `ctx.config` are all `undefined`.

## Next / See also

- [Security](../develop/security.md) — the worker sandbox, egress allowlist, secret scrubbing
- [Plugin schema](plugin-schema.md) — the full manifest reference
- [SDK](../develop/sdk.md) — `ctx` interface and `definePlugin`
