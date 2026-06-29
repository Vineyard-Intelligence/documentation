# Browse & install Plugin Packs & Type Packs

This page covers browsing the Marketplace and the client-side install pipeline that runs when you click **Install**.

## Browsing the marketplace

The marketplace is a fully static catalog: every Plugin Pack and Type Pack lives in one metadata file, and all search, filtering, and sorting happen in your browser. There is no account, no server query, and no telemetry.

You can browse from two places, which share the same components and data:

- **The [Marketplace page](../marketplace.md) on this site** — the public, read-only browser.
- **The in-app mirror** inside the Vineyard app — the same card grid and detail view, wired with a direct callback so **Install** can hand off to the install pipeline immediately.

### Searching

The search box matches against an entry's **name**, **author**, and **description**. Type a fragment and the grid filters live as you go — there is nothing to submit. For example, searching `roulette` surfaces the Chaos pack, and searching `cidr` finds CIDR Expand.

### Filtering

Three facets narrow the grid, and they combine:

| Facet | What it does |
|---|---|
| **Type** | A segmented toggle: **All**, **Plugin Packs**, or **Type Packs**. |
| **Category** | A dropdown of Type Pack categories (e.g. `infrastructure`, `threat`). Shown when Type Packs are in view; an entry matches if it declares that category. |
| **Verified only** | A checkbox that hides every entry whose author is not on the verified list. |

### Sorting

A **Sort** dropdown reorders the visible cards:

- **Name A→Z** (default) and **Name Z→A**
- **Verified first** — verified authors float to the top, then alphabetical
- **Group by type** — Plugin Packs together, Type Packs together, alphabetical within each

### Reading a card

Each card is a compact summary:

- **Icon** and **name**.
- **Author**, followed by a **verified tick** (✓) when the author is verified.
- A one-line **description**.
- **Badges** in the footer, which differ by type:
    - For a **Plugin Pack**: one **platform** badge per supported platform (e.g. `web`), plus a permission summary — `network` if it calls a declared endpoint and `graph write` if it can modify the graph.
    - For a **Type Pack**: a `schema only` badge (Type Packs ship no code and request no scopes), plus counts such as the number of entity types and edge types.

### The detail view

Clicking a card opens a detail drawer with the full picture.

**Permissions.** For plugins, a **Permissions** panel restates each requested scope as a sentence derived from the scope strings and capability summary, for example:

- `node:read` + `node:delete` + `edge:delete` → *"Graph: read, delete nodes/edges in this project."*
- a `network` scope → *"Network: calls a declared external endpoint."*
- a `publish` capability → *"Publish: can post messages to the project."*
- a `config` requirement → *"Config: requires install-time configuration values."*

See [Scopes](../reference/scopes.md) for the full vocabulary (`node:read`, `edge:delete`, `message:post`, and so on).

**Type flow: consumes → produces.** When a plugin declares inputs or outputs, the drawer shows **type chips** describing its data flow, each using the qualified `category.name` form — for instance `consumes · infrastructure.ip_address` and `produces · infrastructure.cidr_block`. This tells you which [Type Packs](typepacks.md) a plugin expects to be installed first.

**Identity.** A sidebar lists the entry's stable facts, with a copy button on the identifier:

- **Identifier** — the reverse-DNS id, e.g. `run.vineyard.plugins.cidr_expand` (Type Packs use `run.vineyard.typepacks.*`).
- **Version**, **License**, and **Platforms** (for plugins).
- **Repository** and **Ref** — the author's repo and the immutable pinned ref the bundle is fetched from at install time (`repo@ref`).

**Type palette (Type Packs).** A Type Pack's detail view replaces the permissions panel with a **type palette** — the entity and edge types the pack contributes — alongside its categories and counts. Because Type Packs are schema only, there are no scopes to approve. See [Type Packs](typepacks.md).

### What "verified" means

The verified ✓ is **not self-asserted**. An entry shows the tick only when its author appears in the registry's `verified-authors.json` list, which is maintained by the Vineyard registry, not by the submitter. A plugin author cannot set their own `verified` flag to true. Verification attests to the *author's identity*, not to the safety or quality of any particular plugin — you should still review the permissions before installing.

## The install pipeline (app-side)

When you click **Install** on a card, the static page never downloads or runs anything itself — it produces a *reference* and hands it to your app, which runs the same pipeline every time:

1. **Resolve the entry.** Read the lean registry entry (identifier, repo, immutable `ref`, path, version).
2. **Fetch the full manifest** from the author repo at `repo@ref/path` — the complete
   [`vineyard:plugin`](../reference/plugin-schema.md) or
   [`vineyard:typepack`](../reference/typepack-schema.md) JSON, not the denormalized catalog copy.
3. **Fetch the bundle** from the GitHub release, according to the manifest's `distribution.kind`:
   `zip` (release archive), `git` (a file in the repo tree), or `inline` (bundled in the
   manifest).
4. **Optional integrity check.** If the manifest declares `distribution.integrity`
   (`{ algo: "sha256", hash: ... }`), the app verifies the downloaded bytes against it. This
   detects a force-push at install time.
5. **Cache the bytes — client-side only.** On web this is **IndexedDB**; on desktop it would be
   the local filesystem. There is no server-side content copy at any point.
6. **Scope approval dialog.** For plugins, the app shows the requested
   [scopes](../reference/scopes.md) in plain language (the same `scopeToBadge()` mapping you saw
   in the web preview), e.g. `node:read`, `node:delete`, `edge:delete`, `message:post`. You
   approve or cancel here.
7. **Activate.** The plugin becomes available to run.

Installing records that you *have* a plugin (see [Install records](#install-records-and-removing)). But tasks are **ephemeral by default** — running a plugin writes nothing to the server, like a temporary chat. See [Running plugins](running-plugins.md) and [Tasks](tasks.md).

## The three install bridges

The static page can't run the pipeline itself, so it passes the reference to the app through one of three bridges:

=== "Deep link"

    ```text
    vineyard://install?manifest=<url>&type=pluginpack&ref=<ref>
    ```

    A `vineyard://` deep link (there's also `vineyard://show-plugin?id=...` to open a detail
    view). This is **reliable on desktop**. On the public web page it may not register a handler,
    which is why the copy-URL fallback exists.

=== "Copy install URL"

    A **"Copy install URL"** button that gives you the reference to paste into your app. This is
    the dependable path for the **web** page, where the `vineyard://` handler is not guaranteed.

=== "In-app mirror"

    The same browse/detail UI rendered **inside the app**, where **Install** is a direct callback
    into the pipeline — no protocol handler, no copy-paste.

## Installing a Type Pack

Type Packs ([`vineyard:typepack`](typepacks.md)) are pure JSON — they define node and edge
**types**, nothing executable. Their install is the same fetch-and-cache flow, with two
differences:

- **No scopes.** A Type Pack requests no permissions, so there is **no scope-approval dialog** —
  the marketplace card shows "schema only" instead of a permission summary.
- **Activation = schema only.** Activating a Type Pack makes its qualified types available to the
  canvas and to plugin `io`. Types are addressed as `category.name`
  (e.g. `infrastructure.ip_address`, `threat.indicator`).

!!! tip "Plugins can depend on Type Packs"
    A plugin whose `io.consumes`/`produces` reference a Type Pack's types needs that Type Pack
    activated first. The marketplace shows an **unresolved-Type Pack** state ("install the Type Pack
    first") when a dependency is missing. See [Type Packs](typepacks.md).

## Install records and removing

Installs are tracked as per-project / per-user **install records**:

```jsonc
{ "identifier": "run.vineyard.plugins.korean_roulette", "version": "1.0.0", "ref": "9f1c2ad7...e6f7" }
```

That record (identifier, version, ref) is what the app diffs against the registry to offer
[updates](../develop/updates.md). The verified bundle stays in the client-side cache. Removing /
uninstalling drops the install record and its cached bytes — and because runs are never persisted,
there's no run history to clean up.

## Web CORS caveat

On the web, your **browser** fetches the bundle directly from GitHub. GitHub release assets are
CORS-open today, so this works. But if a plugin's bundle is hosted somewhere that is **not**
CORS-open, the web install will fail — **by design**, not by bug.

!!! warning "Desktop fallback is DEFERRED"
    The intended answer for a non-CORS bundle host is "use the desktop app," which runs in the
    app's own isolate without CORS restrictions. **The desktop runtime is deferred — not built
    yet.** Today, web is the only shipping runtime
    (`platforms.web.runtime: "sandbox-js"`). Treat desktop install as forward-looking design.

## Next / See also

- [Running plugins](running-plugins.md) — what happens after activation
- [Type Packs](typepacks.md) — activating type schemas
- [Tasks](tasks.md) — why runs are ephemeral
- [Updates](../develop/updates.md) — how the app diffs install records against the registry
- [Distribution & storage](../develop/distribution.md) and [Scopes](../reference/scopes.md)
