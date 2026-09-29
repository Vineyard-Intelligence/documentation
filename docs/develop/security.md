# Sandbox & security

How Vineyard contains untrusted plugin JavaScript: graph writes that are staged for the analyst's review instead of applied, a Web Worker sandbox with no ambient authority, a host-side egress allowlist, and secret-handling rules that keep API keys out of the graph and out of task history.

## Threat model in one line

A plugin is **third-party code the installing user chose to run**. Registry review (see [publishing](publishing.md)) catches some abuse, but a legitimately granted scope can be misused — a plugin with a `net` endpoint plus `node:read` can exfiltrate what it is allowed to read. Vineyard's job is to make sure a plugin can only ever touch what its [scopes](../reference/scopes.md) declare, on the project the user launched it in; that nothing it writes reaches the project until a person has approved it; and that secrets never become reachable in the first place.

## What actually bounds a plugin

Three controls, listed in the order in which they carry weight:

1. **Staged writes + analyst review** — a plugin's graph writes never hit the API directly. They are captured and applied only after a person approves them. This is the real boundary.
2. **The Web Worker sandbox** — the untrusted code has no DOM, no storage and no token; only the declared scopes reach it. Since the worker's own response carries `connect-src 'none'; worker-src 'none'` (web and desktop), it also has no network of its own: every request has to cross the bridge.
3. **The egress allowlist** — every outbound request is checked against the manifest's declared endpoints, on the host side, before it is made.

The whole authority surface a plugin can ask for is five manifest keys: `graph` verbs, `network`, `web_probe` (desktop only), `services`, and `config`. `services` is different in kind from `network` — it names a Vineyard-operated service (`rdap`, `telegram`) the plugin calls through `ctx.service` by name, never by URL, so the host fixes the destination and attaches the analyst's own credential. There is nothing else to grant.

!!! note "Plugins cannot post chat messages"
    There is no `ctx.message`, and there is no `publish` / `message:post` scope. The published plugin schema's `scopes` block is `additionalProperties: false`, so a manifest that still declares `publish` now **fails validation** — drop it from any draft that carries it.

## Graph writes are staged, not applied

Every caller launches a plugin in **capture mode**. `ctx.graph`'s write methods record into the staging store instead of calling REST; reads still come from the live in-memory stores, so the plugin sees the real graph while its creates, updates and deletes accumulate as a **change set** belonging to that one run (`ctx.run.runId`).

Nothing reaches the project until the analyst opens that change set and approves it — per item, with anything they uncheck excluded from the apply. The apply then runs **under the analyst's own token**, and that is the point: by that line a person has looked at each change and made it theirs. The whole approved change set goes to the server as one request, `POST /v1/core/projects/<id>/batch-changes/` — the endpoint hand-drawn edges use too, behind the same `graph_edit` check. The server applies the valid rows inside one transaction, still reports each row's outcome (which the client files as applied / skipped / failed), and broadcasts one `graph_batch_changes` frame over the WebSocket, exactly as for a hand-drawn edit.

The apply is deliberately defensive rather than all-or-nothing: other runs and other collaborators may have moved the graph since the edits were staged, so each item is applied independently and resolves to **applied / skipped / failed** — "delete an already-deleted node" is a recorded skip, not a crashed batch — and commits are serialized so two approvals cannot interleave.

!!! tip "Bulk ops and review"
    Whole-graph plugins (e.g. **Korean Roulette**, **Thanos Snap**) call `ctx.graph.deleteNodes(ids[])` or `ctx.graph.deleteEdges(ids[])`. In capture mode each affected node or edge is staged as its own reviewable item, so a legitimate mass-delete arrives as one change set the analyst can trim item by item before approving.

## The Web Worker sandbox (web)

Untrusted `main.js` runs in a **dedicated module Web Worker**, not on the page. Inside that worker there is:

- no `DOM` and no `window`,
- no `localStorage` / `sessionStorage`,
- no account token, cookie, or session of any kind,
- no network: `fetch`, `XMLHttpRequest`, `WebSocket` and `EventSource` are all refused, and so is a nested `new Worker`. The plugin worker's own response carries a second CSP, `connect-src 'none'; worker-src 'none'` — on the web from `frontend/public/_headers` (rule `/assets/plugin-worker-*`), on desktop as `PLUGIN_WORKER_POLICY` in `desktop/src/main/csp.ts`, attached in `protocol.ts`. A dedicated worker takes its policy from its own response, so the engine refuses these requests however the code reaches them. The old `self.fetch = undefined` strip is gone: it only shadowed an inherited property. Pack loading is unaffected, since `import()` of pack code is governed by `script-src`. `vite dev` serves no CSP, so in dev the worker *does* have network — a pack that calls `fetch` directly works in dev and fails in production.

Everything with real authority — staging, egress, progress and notifications — lives on the main thread, in the **HostBridge**. The worker reaches it through a [Comlink](sdk.md) proxy whose shape is **exactly the granted scopes**. A `ctx` member is *absent* unless its scope was granted, so there is nothing to bypass: a plugin with no graph scope literally has `ctx.graph === undefined`. The bridge is exposed on its own MessageChannel behind a message filter: only a `GET` or `APPLY` of one of the bridge's own members gets through, with plain arguments (a proxied callback only for `onAbort`), plus Comlink's `RELEASE`. `SET`, `CONSTRUCT` and multi-segment paths are dropped unanswered, so code that grabs the port cannot reach the main thread's prototypes; `graphCall` likewise dispatches only to the graph's own methods. Desktop runs the same plugin through the same worker, inside the shell's renderer.

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

Every outbound call a plugin makes crosses the Comlink boundary to the HostBridge (`ctx.net.fetch`, `ctx.net.probe` on desktop, `ctx.service`), and `ctx.net.fetch` is checked *there*, before any request is made.

!!! note "The worker itself has no network"
    Since security-review item C13 the plugin worker's own response carries
    `connect-src 'none'; worker-src 'none'` on both the web build and the desktop shell. The
    bypasses measured on 2026-09-02 — `Object.getPrototypeOf(self).fetch` and a nested
    `new Worker(URL.createObjectURL(...))` — are now refused by the engine, so the bridge is the
    only way out.

    The supply chain still matters: a pack must be pinned to a commit, digest-checked and on the
    approved list before its code runs, and `script-src` admits executable pack code only from the
    registry's org path. (Not under `vite dev`, which serves no CSP.)

The check is `endpointCovers` in `plugins/net-allowlist.ts`, and its shape is the control:

| Rule | Effect |
|---|---|
| The **parsed origin** must match — protocol, host and port | `https://api.example.com.attacker.test/steal` *starts with* `https://api.example.com` and is refused; so is a protocol or port change |
| A path prefix must end on a **segment boundary** | a scope of `https://h/v1` covers `/v1/search`, and does not cover `/v1beta` |
| The method must be in the scope's `methods` list | a `GET`-only endpoint cannot be `POST`ed to |
| A URL that will not parse on either side **denies** | this is an allowlist: "I could not tell" is not "yes" |

The forwarded request carries no credential of its own: `SafeRequestInit` has no credentials field, the bridge forces `credentials: "omit"` so the analyst's cookie jar never rides along, and the run's `AbortSignal` cancels anything still in flight.

The bridge does **not** strip `Authorization` or `Cookie`. This page claimed it did, long after the strip was deliberately removed: `Cookie` is a forbidden header name a script cannot set anyway, and dropping `Authorization` only pushed packs onto custom headers — which survive a cross-origin redirect, where `Authorization` does not. Your header reaches the endpoint as written.

One consequence to know before you send one: the main thread's `fetch` is patched for token renewal, and on a request to Vineyard's own API it **replaces** an existing `Authorization: Token …` with the analyst's live token. Send `Authorization: Token <anything>` to `BACKEND_URL` and it goes out authenticated as the analyst; a request with no `Authorization` header, or with another scheme, is left as written.

!!! warning "On the web, this allowlist is the whole boundary"
    `endpointCovers` on the main thread is what stands between a plugin and an arbitrary host — there is no dedicated-origin CSP behind it yet. The one-entry `proxy_endpoint` rule in the schema belongs to the deferred `web-proxy` runtime and is not enforced: a `sandbox-js` web plugin may declare several `network` endpoints, and each one is checked by `endpointCovers` (see [scopes](../reference/scopes.md) and [plugin manifest](plugin-manifest.md)).

### Desktop

The desktop shell serves the app over `app://` with a CSP, and the honest reading of it is that it is an **XSS and code-source control, not an exfiltration control**: `script-src` is path-scoped to the pack CDN prefix, so org-published packs may execute while the rest of that CDN may not, whereas `connect-src` is deliberately broad because plugin fetch targets *are* project data. What limits reading cross-origin responses there is the shell's CORS waiver list, not the CSP. The list holds the shipped LLM provider origins, the origins declared by packs installed in the currently open project (in memory, replaced whenever the installed set changes), and origins the analyst added by hand. The configured backend is deliberately not on it, because it answers CORS for `app://vineyard` itself. The one exception to the broad `connect-src` is the plugin worker, whose own response adds `connect-src 'none'; worker-src 'none'`.

`web_probe` is a second, differently shaped egress path, and desktop-only. Where `ctx.net.fetch` is an endpoint allowlist over the browser's own fetch, `ctx.net.probe` is an anonymous cross-origin request performed by the Electron main process — the only way to read a response from a site that declines CORS. The main process enforces the limits (anonymity, SSRF guard, no redirects, size and time caps). In the web build the capability has no backing, so `ctx.net.probe` is absent and the plugin must fall back.

## REST calls carry the analyst's own token

Graph reads come from the in-memory stores the WebSocket already populates. The bridge has no REST path of its own: the live-write branch and its REST helper were deleted, so none of its graph verbs can write to the API. Two kinds of request are given **the analyst's own access token** by the host — the same short-lived, revocable credential (`Authorization: Token <key>`) the rest of the app uses: the post-approval apply (`commit.ts`), and a `ctx.service` call, whose destination the host fixes. (A `ctx.net.fetch` to `BACKEND_URL` that sets its own `Authorization: Token …` header ends up carrying it too, through the fetch patch described above.) The worker never sees the token: it has no storage access, and no bridge member returns it.

The server is unimpressed by who is calling. DRF authenticates with `tenant.authentication.AccessTokenAuthentication` — an hour-lived, revocable access token issued alongside an HttpOnly refresh cookie, which replaced the old permanent `rest_framework.authentication.TokenAuthentication` — and with nothing else: `SessionAuthentication` has been removed, so a Django session (including the admin's) cannot call the API. `IsAuthenticated` is the default permission, and per-project authority is the tier system in `core/access.py` — audience rank `public < members < collaborators < owner`, with each capability naming the minimum rank allowed, so `graph_edit` gates node/edge writes and also reading and posting chat. There is no separate chat tier any more, and a public link or view-only grant opens the graph but none of the chat. A write also requires being able to view the project, and a collaborator granted `view` cannot write even where the tier admits collaborators (unless they also qualify as an org member at that tier).

!!! note "A plugin can never exceed the human"
    The tier check is the same one a manual edit passes, and the apply happens under the analyst's token after the analyst approved it — so a plugin's effect on a project is bounded by what that person may do in that project, by construction rather than by a second mechanism.

## Secret handling

API keys and secrets must **never** land in a task record or in AI-conversation history.

1. **A secret goes to the plugin that declared it — that is the design.** A `config` value with `secret: true` reaches the plugin as `ctx.config[key]` at run time, deliberately (SPEC §6.1): a plugin whose job is calling an API with the analyst's key needs the key, and there is no host-side seam that could send it for them. There is no "network boundary" injection anywhere in the code. What `secret: true` actually buys is **storage and display**: the install/run form renders it as a password field, and the value lives in the desktop keychain (Electron `safeStorage`, encrypted at rest, this machine only) or, in the browser, in `sessionStorage` for that tab. It is protection from the sandbox (a Web Worker has no storage of any kind, and `configFor` hands a pack only the keys its OWN manifest declared) and, on desktop, from another user of the same machine — not from the plugin holding it. See `frontend/…/plugins/plugin-config.ts`.
2. **Secrets are not params.** A `params` key that names a credential is an authoring error: the run form's values land in `Task.input`. Declare credentials as `scopes.config` with `secret: true` instead — those are never written to a task record or an AI conversation.
3. **Type Packs may not declare secret property types.** A `secret` / `credential` property type is a **hard schema rejection** (see [Type Packs](../guide/typepacks.md)).
4. **BYOK on web works, but only for the session.** The browser store is `sessionStorage`, so a key typed there is gone when the tab closes and has to be re-entered; the desktop app is what persists it. The form says which of the two is in effect, because "I typed my key and it vanished" is otherwise indistinguishable from a bug.

## What's shipped

| Control | Status |
|---|---|
| Staged graph writes + analyst review before apply | shipping |
| Web Worker sandbox (`sandbox-js`, browser) | shipping |
| Plugin worker has no network (`connect-src 'none'; worker-src 'none'` on the worker's own response, web + desktop) and a GET/APPLY-only bridge filter | shipping |
| Host-side egress allowlist (parsed origin + path-segment boundary) | shipping |
| Desktop Electron shell + sandbox isolate (`sandbox-js`, desktop) | shipping |
| Keychain-backed secret config (desktop) | shipping |

## Next / See also

- [Scopes reference](../reference/scopes.md) — the only authority a plugin gets, and how it maps to `ctx`
- [SDK](sdk.md) — the `ctx` surface and the Comlink proxy
- [Plugin manifest](plugin-manifest.md) — declaring platforms, `proxy_endpoint`, and scopes
- [Lifecycle](lifecycle.md) — the task states a run moves through, and how cancel unwinds one
- [Architecture](architecture.md) — where the bridge, worker, and server sit
