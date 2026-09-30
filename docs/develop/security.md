# Sandbox & security

How Vineyard contains plugin JavaScript: graph writes that are staged for the analyst's review instead of applied, a Web Worker sandbox with no ambient authority, a host-side egress allowlist, and secret-handling rules that keep API keys out of the graph and out of task history.

## What a plugin can reach

A plugin is **third-party code the installing user chose to run**. It can only touch what its [scopes](../reference/scopes.md) declare, on the project it was launched in. A `ctx` member is *absent* unless its scope was granted: a plugin with no graph scope has `ctx.graph === undefined`.

The whole authority a plugin can ask for is five manifest keys: `graph` verbs, `network`, `web_probe` (desktop only), `services`, and `config`. `services` names a Vineyard-operated service (`rdap`, `telegram`) the plugin calls through `ctx.service` by name, never by URL: the host fixes the destination and attaches the analyst's own credential.

!!! note "Plugins cannot post chat messages"
    There is no `ctx.message`, and there is no `publish` / `message:post` scope. If an older draft still declares `publish`, remove it.

## Graph writes are staged, not applied

`ctx.graph`'s write methods do not call the API. Reads come from the live graph, so the plugin sees the real graph, while its creates, updates and deletes accumulate as a **change set** belonging to that one run (`ctx.run.runId`).

Nothing reaches the project until the analyst opens that change set and approves it — per item, with anything they uncheck excluded. The approved items are then applied under the analyst's own account. Other runs and collaborators may have changed the graph since the edits were staged, so each item is applied independently and ends as **applied / skipped / failed** — "delete an already-deleted node" is a recorded skip, not a failed batch.

A plugin can never do more than the analyst who approves its changes is allowed to do.

!!! tip "Bulk ops and review"
    Whole-graph plugins (e.g. **Korean Roulette**, **Thanos Snap**) call `ctx.graph.deleteNodes(ids[])` or `ctx.graph.deleteEdges(ids[])`. Each affected node or edge is staged as its own reviewable item, so a mass-delete arrives as one change set the analyst can trim item by item before approving.

## The Web Worker sandbox

Plugin `main.js` runs in a **dedicated module Web Worker**, not on the page. Inside that worker there is:

- no `DOM` and no `window`,
- no `localStorage` / `sessionStorage`,
- no account token, cookie, or session of any kind,
- no network of its own: `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource` and a nested `new Worker` are all refused.

Staging, egress, progress and notifications live on the main thread, in the **HostBridge**. The worker reaches it through a [Comlink](sdk.md) proxy shaped exactly like the granted scopes, so every request goes through `ctx.net.fetch`, `ctx.service`, or `ctx.net.probe` on desktop. Desktop runs the same plugin in the same worker.

!!! warning "Direct `fetch` works in dev only"
    The dev server (`vite dev`) does not enforce the worker's network block, so a pack that calls `fetch` directly works in dev and fails in production. Use `ctx.net.fetch`.

```ts
// Inside the worker, ctx is a Comlink proxy of the main-thread HostBridge.
// No fetch, no DOM, no token. graph/net exist only if their scope was granted.
export default definePlugin({
  manifest: { /* … */ },
  async run(ctx) {
    // ctx.run.runId  -> groups every write into this one reviewable change set
    // ctx.graph?.list?() present only because node:read was granted
  },
});
```

## Egress is allowlisted on the host side

Every `ctx.net.fetch` is checked on the host against the manifest's declared `network` endpoints before the request is made:

| Rule | Effect |
|---|---|
| The **parsed origin** must match — protocol, host and port | a different host, protocol or port is refused, even if the URL starts with the declared one |
| A path prefix matches on a **segment boundary** | a scope of `https://h/v1` covers `/v1/search`, and does not cover `/v1beta` |
| The method must be in the scope's `methods` list | a `GET`-only endpoint cannot be `POST`ed to |
| A URL that will not parse **denies** | — |

Requests are sent without the analyst's cookies, and cancelling the run aborts anything still in flight. Headers you set, including `Authorization`, reach the endpoint as written.

A `sandbox-js` plugin may declare several `network` endpoints; each is checked this way. The schema's one-entry `proxy_endpoint` rule belongs to the deferred `web-proxy` runtime and is not enforced (see [scopes](../reference/scopes.md) and [plugin manifest](plugin-manifest.md)).

### Desktop

On desktop, declared endpoints are reachable even if they send no CORS headers.

`ctx.net.probe` (the `web_probe` scope) exists only on desktop: an anonymous cross-origin request made by the desktop app itself, for reading sites that decline CORS. It follows no redirects and is capped in size and time. In the web build `ctx.net.probe` is absent, so the plugin must fall back.

## Secret handling

API keys and secrets must **never** land in a task record or in AI-conversation history.

1. **A secret goes to the plugin that declared it.** A `config` value with `secret: true` reaches the plugin as `ctx.config[key]` at run time — a plugin only gets the keys its own manifest declared. The flag masks the field in the install/run form, and the value is kept in the OS keychain on desktop, or in the browser only for that tab's session (it has to be re-entered after the tab closes). The form says which of the two is in effect.
2. **Secrets are not params.** Never put credentials in `params`: the run form's values are recorded in the task. Declare credentials as `scopes.config` with `secret: true` instead — those are never written to a task record or an AI conversation.
3. **Type Packs may not declare secret property types.** A `secret` / `credential` property type is a **hard schema rejection** (see [Type Packs](../guide/typepacks.md)).
4. **Kept per account.** Config values and keys are kept separately for each account on the device: another account signing in on the same device does not get them, signing out keeps them, and deleting the account removes them. This separates accounts inside Vineyard; it is not protection against someone with direct access to the computer.

## Next / See also

- [Scopes reference](../reference/scopes.md) — the only authority a plugin gets, and how it maps to `ctx`
- [SDK](sdk.md) — the `ctx` surface and the Comlink proxy
- [Plugin manifest](plugin-manifest.md) — declaring platforms, `proxy_endpoint`, and scopes
- [Lifecycle](lifecycle.md) — the task states a run moves through, and how cancel unwinds one
- [Architecture](architecture.md) — where the bridge, worker, and server sit
