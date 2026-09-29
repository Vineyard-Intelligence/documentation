# Getting started

A first-run walkthrough: open the Vineyard app, create a project, install a **Type Pack** and a **plugin** from the Marketplace, then run that plugin against your graph.

## 1. Open the app

Vineyard runs in your browser, or as the Vineyard desktop app. Sign in, and you land on your dashboard (reopening the app while still signed in goes to the last project you opened instead, if you chose that under **Settings → General → Start view**). The desktop app can also run in local mode with no account, and then it opens on your project list.

Plugins and Type Packs **execute on the client**: the server stores your graph and brokers collaboration, but it never runs plugin code.

## 2. Open or create a project

A **project** owns a graph (nodes + edges), its collaborators, and its installed set of packs.

- **Existing project:** pick it from the list.
- **New project:** choose **Add New** on the project list or **New project** on the dashboard, give it a name and optionally an organization, click **Create**, and you're dropped straight onto its canvas.

!!! note "Installs belong to the project"
    Packs are installed **onto a project**, not your account, so every collaborator on that project gets the same vocabulary and tools. Only the project owner can change the installed set.

## 3. Meet the canvas

The canvas is your working surface — a node/edge graph you can pan, zoom, and lay out. For the full tour of menus, context menus, and side panels, see [The canvas](canvas.md).

A brand-new project has **no entity types** yet. That's what a Type Pack fixes.

## 4. Open the Marketplace

From the canvas, choose **Project → Add from Marketplace…**. Search by name/author/description, filter by type and verified status, sort by name, author, or kind, then open a card for details. See [Browse & install](installing.md) for the full tour.

## 5. Add a Type Pack (entity types)

A **Type Pack** is pure JSON that defines the **entity types** (and optional edge types) your nodes can be. Install one before plugins, because a plugin's inputs and outputs are expressed in terms of Type Pack types.

In the Marketplace, switch to Type Packs and install **Infrastructure** (`run.vineyard.typepacks.infrastructure`). It ships entity types such as `infrastructure.ip_address`, `infrastructure.netblock`, and `infrastructure.domain`. More in [Type Packs](typepacks.md).

## 6. Install a plugin

A **plugin** is JavaScript that reads and/or writes your graph, asking your approval for the permissions it needs. One good first install covers both scopes a run can have:

- **Chaos Reference Pack** — one bundle with six small, pure-compute, no-network plugins for learning the run loop on a throwaway graph. Two of them show the two scopes a run can have: **Black Hole** acts on the node you have selected (right-click it → **Run plugins…**), and **Korean Roulette** acts on the whole graph (**Run ▸ Run plugins…**).

When you install, an **approval dialog** lists the plugin's permissions in plain language so you can see what it can touch before you grant it. Full details in [Browse & install](installing.md).

## 7. Run it

Every plugin launches from the same **Run plugins** panel; what it **consumes** decides when it is listed:

- **Right-click a node → Run plugins…** opens the Run plugins panel scoped to your selection. It lists the plugins that consume the selected node types, plus plugins that take no node type (such as Black Hole, which acts on the selected node).
- **Run ▸ Run plugins…** with nothing selected (or right-clicking empty canvas) opens the same panel on the whole project. Use it for whole-graph plugins such as Korean Roulette.

Tick the plugins you want. If a plugin takes input, its fields appear under it in the panel; fill in the required ones. Then press **Run**. The node you right-clicked is the run's target, not a form value.

Watch it in the **Tasks** panel. A task starts `running` and ends `succeeded`, `failed`, or `cancelled`, with a **Stop** control while it runs. A run never edits the graph directly: its changes are staged, and the task shows **needs review**. Click it to open the Review dialog, check the changes, and press **Apply** (or **Discard all**). For Black Hole, the target node's 1-hop neighbours disappear from the canvas when you apply.

## 8. Runs are ephemeral

Nothing about a run is written to the server by the run itself. Its changes reach your graph only when you approve them with **Apply** in the run's review; **Discard all** throws them away. See [Tasks & runs](tasks.md) for details.

## Next / See also

- [Browse & install](installing.md) — search, filter, install, and scope approval
- [Running plugins](running-plugins.md) — launch paths and the Tasks panel
- [Type Packs](typepacks.md) — what entity types do and how to manage them
