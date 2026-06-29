# Getting started

A first-run walkthrough: open the Vineyard app, create a project, install a **Type Pack** and a **plugin** from the Marketplace, then run that plugin against your graph. The core loop is *project → types → plugins → ephemeral runs*.

## 1. Open the app

Vineyard runs in your browser today. Sign in, and you land on your project list.

Plugins and Type Packs **execute on the client**: the server stores your graph and brokers collaboration, but it never runs plugin code. See [Architecture](../develop/architecture.md) for the why.

## 2. Open or create a project

A **project** owns a graph (nodes + edges), its collaborators, and its installed set of Type Packs and plugins.

- **Existing project:** pick it from the list.
- **New project:** choose *Create*, give it a name, and you're dropped straight onto its canvas.

!!! note "Installs belong to the project"
    Type Packs and plugins are installed **onto a project**, not your account, so every collaborator on that project gets the same vocabulary and tools. Only the project owner can change the installed set.

## 3. Meet the canvas

The canvas is your working surface — a node/edge graph you can pan, zoom, and lay out. For the full tour of menus, context menus, and side panels, see [The canvas](canvas.md).

A brand-new project has **no entity types** yet. That's what a Type Pack fixes.

## 4. Open the Marketplace

From the canvas, choose **Project → Add from Marketplace…**. Search by name/author/description, filter by `?type=pluginpack` / `?type=typepack`, platform, category, and verified status, then open a card for details. See [Browse & install](installing.md) for the full tour.

## 5. Add a Type Pack (entity types)

A **Type Pack** is pure JSON that defines the **entity types** (and optional edge types) your nodes can be. Install one before plugins, because a plugin's inputs and outputs are expressed in terms of Type Pack types.

In the Marketplace, switch to Type Packs and install **Infrastructure** (`run.vineyard.typepacks.infrastructure`). It ships entity types such as `infrastructure.ip_address`, `infrastructure.netblock`, and `infrastructure.domain`, each addressed as `category.name`. More in [Type Packs](typepacks.md).

## 6. Install a plugin

A **plugin** is JavaScript that reads and/or writes your graph, declaring exactly which **scopes** it needs (e.g. `node:read`, `node:create`, `edge:create`). Two good first installs:

- **CIDR Expand** — pure compute, no network. Consumes an `infrastructure.netblock` node and **produces** the individual `infrastructure.ip_address` nodes inside it. (This is why you installed Infrastructure first.)
- **Chaos Reference Pack** (`run.vineyard.plugins.chaos`) — one bundle, many plugins: Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, and Schrödinger's Node. They're destructive-but-harmless toys for learning the run loop on a throwaway graph.

When you install, an **approval dialog** lists the plugin's scopes so you can see what it can touch before you grant it, then the bundle is cached locally. Full details in [Browse & install](installing.md).

## 7. Run it

How a plugin launches depends on what it **consumes**:

- **Targets a node type** (e.g. CIDR Expand consumes `infrastructure.netblock`) → it appears in the **right-click menu of a matching node**, with that node pre-bound as input.
- **Operates on the whole graph** (e.g. Korean Roulette, which consumes nothing) → launch it from the global **Run plugin** menu.

If the plugin declares input `params`, a small pre-run form appears (for CIDR Expand, the CIDR block — already filled from the node you right-clicked). Confirm, and the run starts.

Watch it in the **Tasks** panel. A task moves through `queued → running → {succeeded | failed | cancelled}` (with `waiting`/`paused` for rate limits or user input), and you get **Stop**, **Pause**, and progress controls while it runs. For CIDR Expand, you'll see new `infrastructure.ip_address` nodes appear on the canvas as it emits them.

## 8. Runs are ephemeral

By default nothing about a run is saved to the server — use the explicit **Save** action on a finished task to keep a result. See [Tasks & runs](tasks.md) for details.

## Next / See also

- [Browse & install](installing.md) — search, filter, the install pipeline, scope approval, and local caching.
- [Running plugins](running-plugins.md) — launch paths, the Tasks panel, and run lifecycle in depth.
- [Type Packs (user guide)](typepacks.md) — what entity types do and how to manage them.
- [Architecture](../develop/architecture.md) — why plugins run on the client.
