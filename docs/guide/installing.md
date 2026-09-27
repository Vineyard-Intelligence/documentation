# Browse & install

## Browsing the marketplace

The marketplace is a fully static catalog: three index files (Plugin Packs, Type Packs, Skill
Packs) list every pack, each pack's full document is fetched from its repository only when you
open it, and all search, filtering, and sorting happen in your browser. There is no account, no server query,
and no telemetry.

You can browse from two places. Both read the same registry data, but they are separate,
independently-built browsers, so their filters aren't identical:

- **The [Marketplace page](../marketplace.md) on this site** — the public, read-only browser.
- **The in-app mirror** inside the Vineyard app — its own card grid and detail view, wired so
  **Install** hands off to the install pipeline immediately.

### Searching and filtering

The search box matches an entry's **name**, **author**, **description**, and **identifier** (on
this site, also its categories) and filters the grid live as you type. On this site's browser, three facets narrow it further, and they combine:

| Facet | What it does |
|---|---|
| **Type** | A segmented toggle: **All**, **Plugin Packs**, **Type Packs**, or **Skill Packs**. |
| **Category** | A dropdown of Type Pack categories (e.g. `infrastructure`, `threat`). Always shown; since only Type Packs have categories, picking one leaves only Type Packs in the grid. |
| **Verified only** | A checkbox that hides every entry whose author is not on the verified list. |

A **Sort** dropdown reorders the visible cards — by name, or with verified authors first.

The in-app browser has a lighter filter set: the same Type toggle and a Verified-only switch, but no
category facet, and it sorts by name, author, or kind instead.

### Reading a card

Each card is a compact summary: an **icon** and **name**, the **author** (with a verified tick ✓
when verified), a one-line **description**, and badges in the footer:

- For a **Plugin Pack**: a platform badge (e.g. `web`) plus a permission summary — `network` if it
  calls a declared endpoint and `graph write` if it can modify the graph.
- For a **Type Pack**: a `schema only` badge (no code, no permissions) and type counts.
- For a **Skill Pack**: its section count, and either how many plugins it needs or a *no permissions*
  badge. The node types it applies to are listed in the detail view.

### The detail view

Clicking a card opens a detail drawer. For a Plugin Pack, a **Permissions** panel restates what
the whole pack requests in plain language — in the app, for example *"Delete nodes"* or
*"Network request: https://rdap.org/ (…)"*; this site shows a coarser summary such as
*"Network: calls a declared external endpoint."* — read this before installing. Below it is the
list of plugins the pack includes. The drawer also shows the pack's **identifier** (e.g.
`run.vineyard.pluginpacks.ip_recon`), **version**, **license**, and repository. In the app, the
Type Packs a Plugin Pack needs are shown on its card as a *Needs N typepacks* badge and are installed with it.

!!! note "What "verified" means"
    The verified ✓ attests to the *author's identity* — it is set by the registry, not by the
    author. It says nothing about the safety or quality of a particular pack: always review the
    permissions yourself before installing.

## Installing

Click **Install** on a card and Vineyard takes care of the rest — it fetches the pack from the
author's repository at a pinned commit and runs it directly; there is no server-side copy of the
pack content at any point, and no offline cache — each run fetches fresh.

For a **plugin**, an **approval dialog** then lists the permissions it requests in plain
language. Approve, and the plugin becomes available to run in the project.

A **Type Pack** or **Skill Pack** carries no permissions, but it goes through the same install
dialog: it shows what will be added (the Type Pack's type count, or the Skill Pack's overview, plus any
packs it pulls in) and installs when you press **Install**.

!!! tip "Packs install their dependencies automatically"
    A plugin whose inputs/outputs reference a Type Pack's types needs that Type Pack installed
    first — the marketplace resolves this for you: installing a Plugin Pack also installs every
    Type Pack its plugins `consume`/`produce`, and installing a Skill Pack pulls in the Plugin
    Packs it requires **and their Type Packs** (skill → plugin → typepack, resolved against the
    catalog in one pass). Already-installed packs are skipped; a dependency that cannot be
    resolved (not in the catalog) blocks the install rather than leaving a pack that fails at
    run time. An installed plugin whose Type Packs were never installed is repaired the next
    time its Skill Pack is installed.

## Installing into a project

Installs belong to a **project**, not your account — every collaborator on the project gets the
same vocabulary and tools. Only the project owner can change the installed set. Uninstalling a
pack drops it from the project's installed set; because runs are never persisted, there is no
run history to clean up.

To add several packs at once, tick their cards (or **Select all**) and choose **Install N
selected**; one dialog shows everything that will be added. Installs are pinned to the version you
installed: when the catalog has a newer one, the card shows **Update** and nothing changes until
you click it. To uninstall, open the pack and click **Installed — click to remove**; if nodes in
the project still use a Type Pack's types, you are shown how many first and can **Remove anyway**.
A pack the registry has retired is badged **Deprecated** (still installable) or **Withdrawn** (can
no longer be installed).

## Next / See also

- [Running plugins](running-plugins.md) — what happens after activation
- [Type Packs](typepacks.md) — activating type schemas
- [Skill Packs](skillpacks.md) — using investigation playbooks
- [Tasks](tasks.md) — why runs are ephemeral
