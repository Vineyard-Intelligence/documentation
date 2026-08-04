# Browse & install

This page covers browsing the Marketplace and what happens when you click **Install**.

## Browsing the marketplace

The marketplace is a fully static catalog: every pack lives in one metadata file, and all
search, filtering, and sorting happen in your browser. There is no account, no server query,
and no telemetry.

You can browse from two places, which share the same components and data:

- **The [Marketplace page](../marketplace.md) on this site** — the public, read-only browser.
- **The in-app mirror** inside the Vineyard app — the same card grid and detail view, wired so
  **Install** hands off to the install pipeline immediately.

### Searching and filtering

The search box matches an entry's **name**, **author**, and **description** and filters the
grid live as you type. Three facets narrow it further, and they combine:

| Facet | What it does |
|---|---|
| **Type** | A segmented toggle: **All**, **Plugin Packs**, **Type Packs**, or **Skill Packs**. |
| **Category** | A dropdown of Type Pack categories (e.g. `infrastructure`, `threat`). Shown when Type Packs are in view. |
| **Verified only** | A checkbox that hides every entry whose author is not on the verified list. |

A **Sort** dropdown reorders the visible cards — by name, or with verified authors first.

### Reading a card

Each card is a compact summary: an **icon** and **name**, the **author** (with a verified tick ✓
when verified), a one-line **description**, and badges in the footer:

- For a **Plugin Pack**: a platform badge (e.g. `web`) plus a permission summary — `network` if it
  calls a declared endpoint and `graph write` if it can modify the graph.
- For a **Type Pack**: a `schema only` badge (no code, no permissions) and type counts.
- For a **Skill Pack**: the node types it applies to.

### The detail view

Clicking a card opens a detail drawer. For plugins, a **Permissions** panel restates each
requested scope as a sentence, for example *"Graph: read, delete nodes/edges in this project."*
or *"Network: calls a declared external endpoint."* — read this before installing. The drawer
also shows the pack's **identifier** (e.g. `run.vineyard.plugins.cidr_expand`), **version**,
**license**, and for plugins the **consumes → produces** type chips telling you which Type Packs
it expects to be installed first.

!!! note "What "verified" means"
    The verified ✓ attests to the *author's identity* — it is set by the registry, not by the
    author. It says nothing about the safety or quality of a particular pack: always review the
    permissions yourself before installing.

## Installing

Click **Install** on a card and Vineyard takes care of the rest — it fetches the pack from the
author's repository at a pinned commit and caches it locally, so it works offline afterwards.
There is no server-side copy of the pack content at any point.

For a **plugin**, an **approval dialog** then lists the permissions it requests in plain
language. Approve, and the plugin becomes available to run in the project.

For a **Type Pack** or **Skill Pack** there is no approval step — they carry no permissions —
and the install completes immediately.

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
pack drops it from the project and its locally cached bytes; because runs are never persisted,
there is no run history to clean up.

## Next / See also

- [Running plugins](running-plugins.md) — what happens after activation
- [Type Packs](typepacks.md) — activating type schemas
- [Skill Packs](skillpacks.md) — using investigation playbooks
- [Tasks](tasks.md) — why runs are ephemeral
