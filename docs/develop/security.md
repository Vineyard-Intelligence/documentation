# Sandbox & security

How Vineyard contains untrusted plugin JavaScript: a Web Worker sandbox with no ambient authority, browser-enforced egress, a one-time scoped run token in place of the user's account token, and secret-handling rules that keep API keys out of the graph and out of task history.

## Threat model in one line

A plugin is **third-party code the installing user chose to run**. Registry review (see [publishing](publishing.md)) catches some abuse, but a legitimately granted scope can be misused — a plugin with a `net` endpoint plus `node:read` can exfiltrate what it is allowed to read. Vineyard's job is to make sure a plugin can only ever touch what its [scopes](../reference/scopes.md) declare, on the project the user launched it in, for a short bounded window — and that secrets never become reachable in the first place.

## The Web Worker sandbox (web)

Untrusted `main.js` runs in a **dedicated module Web Worker**, not on the page. Inside that worker there is:

- no `DOM` and no `window`,
- no `localStorage` / `sessionStorage`,
- no account token, cookie, or session of any kind.

The main thread — the **HostBridge** — holds the scoped token and the run caps and exposes a [Comlink](sdk.md) proxy whose shape is **exactly the granted scopes**. A `ctx` member is *absent* unless its scope was granted, so there is nothing to bypass: a plugin with no graph scope literally has `ctx.graph === undefined`. Desktop runs the same plugin in the app's isolate (no CORS), but the worker model is the web baseline.

```ts
// Inside the worker, ctx is a Comlink proxy of the main-thread HostBridge.
// No fetch, no DOM, no token. graph/net/message exist only if their scope was granted.
export default definePlugin({
  manifest: { /* … */ },
  async run(ctx) {
    // ctx.run.runId  -> ties every write to this one run
    // ctx.graph?.list?() present only because node:read was granted
  },
});
```

## Egress is enforced by CSP, not by JavaScript

The real network boundary is the **browser**, not the worker code.

The worker is served from a dedicated origin whose `Content-Security-Policy: connect-src` is set to:

| Plugin kind | `connect-src` |
|---|---|
| Pure compute (`sandbox-js`, no `network` scope) | `'none'` — the worker cannot open any connection |
| Web-proxy (`web-proxy`) | exactly the single `proxy_endpoint` — and nothing else |

!!! warning "Deleting `fetch` is only defense-in-depth"
    The worker bootstrap also removes `self.fetch` / `XMLHttpRequest`, but that is **belt-and-suspenders**, not the boundary. CSP is what actually stops egress: even if a plugin reconstructed a request primitive, the browser would refuse any `connect-src` the policy doesn't list. This is why a web plugin's `network` scope **must be exactly one entry equal to `platforms.web.proxy_endpoint`** — there is no fan-out to enforce (see [scopes](../reference/scopes.md) and [plugin manifest](plugin-manifest.md)).

When the bridge does forward a request on the worker's behalf, it sanitizes it: `SafeRequestInit` carries no credentials, the bridge forces `credentials: "omit"`, and it strips `Authorization` / `Cookie` headers. The plugin cannot smuggle the user's session onto an allowed endpoint.

## The one-time scoped RunToken

The plugin path **never** uses the user's omnipotent DRF account token. Instead, launching a run mints a short-lived, narrowly scoped **RunToken**:

```
POST /v1/core/run-tokens/
  { plugin_id, project, granted_scopes }
->
  { run_token, run_id, expires_at }
```

That token is backed by a `RunToken` row:

| Field | Meaning |
|---|---|
| `run_id`, `project`, `created_by`, `plugin_id` | identity of this run |
| `granted_scopes` | server-clamped to **manifest ∩ the user's per-project capability** |
| `expires_at` | short TTL (~5 min), renewable while a task is live |
| `used_writes` / `max_writes` | atomic write cap for this run |
| `revoked` | set on cancel / terminal state |

Because `granted_scopes` is clamped server-side, a tampered client cannot widen a token beyond what the manifest asks for **and** what the human is allowed to do in that project.

### Only the bridge holds it

The **HostBridge on the main thread** — never the worker — attaches the token as `X-Vineyard-Run-Token` on graph and publish REST calls. The worker never sees a token, so a JavaScript leak inside untrusted code leaks, at worst, a **short-TTL, project-scoped, write-capped** credential that can only hit the write endpoints. It cannot mint another token, read project lists, or authenticate the WebSocket.

### Enforced at the permission layer

Authority is checked at the auth/permission layer, **not** by trusting whoever minted the token. A dedicated DRF permission class on the Node / Edge / Message viewsets:

1. **Rejects project mismatch** — `request.project != run_token.project` is denied.
2. **Maps verb + model → scope** — e.g. `POST /nodes` → `node:create`, `DELETE /edges/{id}` → `edge:delete`, `POST` a message → `message:post` — and denies if that scope isn't in `granted_scopes`.
3. **Enforces the write cap atomically** — decrements / checks `used_writes` against `max_writes`.
4. **Always reads the row** — the token signature is only a cheap pre-filter; the authoritative state (revoked? expired? caps left?) comes from the database every time.
5. **Revokes on cancel / terminal** — the moment a task is cancelled or reaches a terminal state, the row is revoked.

!!! note "A token can never exceed the human"
    The existing `can_edit_graph` / `can_send_chat` human-tier check **stays in place as a second gate**. The RunToken narrows authority; it can never grant more than the user themselves has in that project.

!!! tip "Bulk ops and the write cap"
    Whole-graph plugins (e.g. **Korean Roulette**, **Thanos Snap**) call `ctx.graph.deleteNodes(ids[])` or `ctx.graph.emit(entities, edges)`. The write cap counts a bulk call as a **single bounded operation**, so a legitimate mass-delete is not throttled to death while a runaway loop still hits `max_writes`.

## Secret handling

API keys and secrets must **never** land in a task record or in AI-conversation history. Six rules enforce this — see SPEC §6.

1. **Secrets are never readable by the plugin.** A `config` value with `secret: true` is injected at the network boundary by the host (desktop keychain via `safeStorage` / keyring). There is no "read my secret config" call, so a plugin cannot reflect a key back into its own output.
2. **Secrets are not params.** Install-time lint **rejects** secret-looking `params` keys — `api_key`, `token`, `secret`, `password`, `authorization`, and any `*_key`. Such values must live in `scopes.config` with `secret: true`. On web, secret config is unsupported and the user is guided to the desktop plugin.
3. **The graph-write path is scrubbed.** Because `Node.data` / `Edge.data` persist unscrubbed, the bridge/server scrubs them on create against the same exclude-list — a plugin could otherwise write a key it received in an API response into a node.
4. **Type Packs may not declare secret property types.** A `secret` / `credential` property type is a **hard schema rejection** (see [Type Packs](../guide/typepacks.md)).
5. **Serializable state uses a safe-field allowlist** (not a denylist). Tokens and secrets live only in worker memory for the task lifetime and are never serialized to IndexedDB, BroadcastChannel, or the presence beacon.
6. **BYOK on web is unsupported by design** — bring-your-own-key routes to the desktop plugin.

!!! warning "BYOK / desktop secrets are DEFERRED"
    Secret handling that depends on the desktop keychain (rules 1, 2, and 6) belongs to the **desktop runtime**, which is specified but **not yet built**. The browser-only initial build does not support secret config; plugins that need a key are directed to a desktop build that does not ship yet.

## What is and isn't shipped

| Control | Status |
|---|---|
| Web Worker sandbox + CSP egress (`sandbox-js`) | shipping (browser-first) |
| One-time RunToken + DRF permission class | shipping |
| Param secret-key lint, graph-write scrub, safe-field allowlist | shipping |
| `web-proxy` runtime (single proxy endpoint) | **DEFERRED** |
| Desktop isolate, keychain-backed secrets, BYOK | **DEFERRED** |

## Next / See also

- [Scopes reference](../reference/scopes.md) — the only authority a plugin gets, and how it maps to `ctx`
- [SDK](sdk.md) — the `ctx` surface and the Comlink proxy
- [Plugin manifest](plugin-manifest.md) — declaring platforms, `proxy_endpoint`, and scopes
- [Lifecycle](lifecycle.md) — cancel/terminal states that revoke the RunToken
- [Architecture](architecture.md) — where the bridge, worker, and server sit
