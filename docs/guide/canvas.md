# The canvas

The canvas is where a Vineyard project lives: nodes and edges laid out on a graph you can pan, zoom, re-layout, and annotate. This page documents every control available in the on-canvas toolbar and in the top menu bar (**Project / Edit / View / Run**).

## Two ways to reach the same actions

The view controls are exposed twice, and both stay in sync:

- **On-canvas toolbar** — a compact vertical bar pinned to the top-left edge of the canvas, for the controls you reach for most while working.
- **Top menu bar** — the `Project`, `Edit`, and `View` menus, which add data and navigation actions alongside the view toggles (a fourth menu, `Run`, launches plugins and the AI agent — see [Running plugins](running-plugins.md)).

## View controls (toolbar + View menu)

Toolbar toggle buttons appear highlighted when on; menu items are checkmarked when on.

| Control | Action | Surfaces |
| --- | --- | --- |
| **Zoom in** | Zooms the canvas in (1.2×). | Toolbar |
| **Zoom out** | Zooms the canvas out (0.8×). | Toolbar |
| **Fit view** | Frames the entire graph so every node is visible. | Toolbar, View |
| **Layout** | Applies one of the built-in layouts (see below). The active layout is checkmarked. | Toolbar, View |
| **Grid** | Toggles the background alignment grid. | Toolbar, View |
| **Minimap** | Toggles the minimap overview panel (bottom-right). | Toolbar, View |
| **Legend** | Toggles the node-type legend (bottom-left). | Toolbar, View |
| **Snapline** | Toggles alignment guides shown while dragging nodes. | Toolbar, View |
| **Reset panel layout** | Restores the project workspace's panel arrangement to its default. | View |

!!! note "Reset panel layout resets panels, not the graph"
    *Reset panel layout* restores the surrounding workspace panels (the canvas, side panels, etc.) to their initial split. It does **not** re-run a graph layout or move your nodes. To re-arrange nodes, pick a **Layout** instead.

## Other toolbar buttons

Below the view controls, the toolbar repeats the **Edit** menu's selection actions (Select all, connected neighbors, outbound, inbound (1 hop), Invert, Select isolated, Clear). It ends with **Run plugins**, whose tooltip names the scope — "Run plugins on N selected nodes", or "nothing selected" for the whole project — and **Ask the AI agent**; with nodes selected, the agent's chat opens pre-filled with a question about them.

## Top menu bar

### Project

| Item | Action |
| --- | --- |
| **Share…** | Opens the Share & permissions dialog with the project link. Only the project owner or an owner/admin of its workspace can change who can view and edit it; others see the settings read-only, and a public-link viewer sees only the link. |
| **Members…** | Opens the project's members page. The project owner or a workspace owner/admin can invite members (View only / Can edit). An invitee gets access only after accepting the invitation, which appears on their dashboard; until then the member shows as "Invitation pending" and the invite can be cancelled. |
| **Project settings…** | Opens the project's settings page. |
| **Leave project…** | Shown to collaborators only. Opens the project settings page, where the **Leave** card removes you from the project. |
| **Export graph (JSON)** | Downloads the current graph as a JSON file (see [Export graph](#export-graph-json)). |
| **Import graph (JSON)…** | Opens a dialog to load a previously exported JSON file back into the project. |
| **Activity log…** | Opens the project's activity log. |
| **Add from Marketplace…** | Opens the [Marketplace](../marketplace.md) scoped to this project so you can add plugins and Type Packs. |

If you opened the project only through its public link, **Members…**, **Project settings…** and **Activity log…** are disabled — they are for project members only.

### Edit

| Item | Action |
| --- | --- |
| **Select all** | Marks every node as selected. |
| **Select connected neighbors (1 hop)** | Adds the 1-hop neighbors of the current selection to it. |
| **Select outbound 1-hop nodes** | Adds the nodes the selection points to (follows only edges leaving a selected node). |
| **Select inbound 1-hop nodes** | Adds the nodes that point to the selection (follows only edges entering a selected node). |
| **Invert selection** | Selects every unselected node and deselects every selected one. |
| **Select isolated nodes** | Selects every node with no edges. |
| **Clear selection** | Deselects all nodes and clears the selection count. |

The three 1-hop actions add to the selection, so pressing one again walks one more hop; they are disabled until something is selected.

!!! note "Adding a node"
    New nodes are created from the **Types** panel — pick an active type there — not from this menu.

### Run

| Item | Action |
| --- | --- |
| **Ask the AI agent…** | Opens the AI chat to start or continue an agent turn. |
| **Run plugins…** | Opens the run panel, scoped to the current selection if any nodes are selected. |
| *(Skill packs)* | Every skill pack installed in the project is listed below a divider; picking one opens it for reading, it does not run anything (see [Skill Packs](skillpacks.md)). |

## Right-click menus

- **Node** — Run plugins… (on this node), Duplicate, Connect to… (see [Drawing edges](#drawing-edges)), Disconnect all (deletes every edge touching the node), Delete.
- **Edge** — Reverse direction, Delete.
- **Selection** — right-click empty canvas with anything selected, or a node inside a multi-item selection; the header shows the count (*Selected: N nodes, M edges*). Run plugins… and Connect to… (when nodes are selected), Delete (N), Select all, Fit view.
- **Empty canvas** (nothing selected, headed *Nothing selected — whole project*) — Run plugins… on the whole project, Select all, Fit view.

## Layouts

Applying a layout re-computes node positions and then fits the view.

| Layout | Description |
| --- | --- |
| **Concentric** | Arranges nodes in concentric rings; overlap is prevented. |
| **ForceAtlas2** | Force-directed layout (Gephi's ForceAtlas2) that pushes nodes apart and pulls connected ones together; built for link-analysis graphs. |
| **D3 Force** | A D3-based force-directed variant. |
| **Circular** | Places nodes evenly around a single circle. |
| **Grid** | Lays nodes out on a regular grid; overlap is prevented. |
| **Hierarchical (Dagre)** | Top-down layered layout, good for directed / tree-like graphs. |
| **Hierarchical (AntV Dagre)** | AntV's own Dagre variant — also top-down and layered, typically faster on wide graphs. |

!!! tip
    ForceAtlas2 and D3 Force are the best starting point for an unfamiliar graph; switch to Hierarchical (Dagre) when the relationships are directional and you want clear layers.

## Overlays

### Search

The **Search entities…** field at the top-right of the canvas finds nodes by type or by any of their property values. Picking a result selects that node and centers it. While the project is still loading, an empty result means the node has not arrived yet, not that it doesn't exist.

### Grid

A subtle background grid that follows the canvas as you pan and zoom, giving you a visual reference for aligning nodes.

### Minimap

A translucent overview panel docked at the bottom-right corner. It shows the whole graph in miniature with a viewport rectangle marking your current view — useful for orienting yourself in a large project.

### Legend

A translucent, minimap-style panel at the bottom-left that lists the node **types currently present** in the graph. Each entry shows a colored swatch matching the node's type color, the type's name (the raw type string if no installed pack defines it), and a per-type **count** of how many nodes of that type exist. Entries are sorted alphabetically by label. When the graph is empty the legend reads "No nodes."

Click a row to select every node of that type, or Shift-click to add them to the current selection. Hovering (or focusing) a row dims every other type on the canvas.

Below the types, an **Evidence** key lists the edge confidence grades present in the project (assessed, asserted, recorded, circumstantial, contested, unassessed), strongest first, each drawn with the same line style (dash, width, opacity) the canvas uses for that grade and with a count. Hover a grade for what it means.

The legend reflects whatever Type Packs the project uses — for example, an investigation built on the [Infrastructure Type Pack](typepacks.md) might show counts for `infrastructure.ip_address`, `infrastructure.domain`, and so on, each resolved to its Type Pack-defined name and color.

### Snapline

When enabled, dragging a node near another node's edges or center shows alignment guides (vertical and horizontal lines) and snaps the node into alignment. Unlike the grid, minimap, and legend, snaplines have no persistent panel — they appear only while you are actively dragging.

### Parallel edges

When two or more edges connect the same pair of nodes — in either direction — the canvas bends
them apart into arcs instead of drawing one on top of the other, so each edge stays visible and
individually clickable.

## Drawing edges

Select the node(s) you want to link from, then **⌘-click** (Mac) or **Ctrl-click** (Windows/Linux) the node to link them to. A small box opens at the click; type the relation (free text, e.g. `resolves to`) and press **Enter**. One edge is created from every selected node to the clicked node. Hold **Shift** while clicking, or press **Reverse** in the box, to link the other way (clicked node → selection). You can also right-click a node or a selection and choose **Connect to…**, then plain-click the target. **Esc** cancels at either step, and nothing is written until you press Enter. An edge is unique per ordered pair of nodes, so pairs that are already connected are skipped and counted as "already connected"; the reverse direction is a separate edge. If nothing is selected, the click only shows a hint to select the nodes first.

## Export graph (JSON) {#export-graph-json}

`Project ▸ Export graph (JSON)` downloads the project's current nodes and edges as a JSON file named after the project. The export captures a snapshot of the graph data:

```json
{
  "project": "my-investigation",
  "exported_at": "2026-06-28T12:00:00.000Z",
  "nodes": [ /* … */ ],
  "edges": [ /* … */ ]
}
```

While the project is still loading (for example while it re-syncs after a reconnect), export is refused with *The project is still loading — export again once it has finished.* When the export succeeds, a toast reports how many nodes and edges were written.

## Add from Marketplace

`Project ▸ Add from Marketplace…` opens the [Marketplace](../marketplace.md) scoped to the current project, where you can add plugins and Type Packs that are wired straight to it. See [Installing](installing.md) for the full flow.

## Next / See also

- [Running plugins](running-plugins.md) — execute plugins against nodes on the canvas.
- [Type Packs](typepacks.md) — how node types, colors, and labels drive the legend.
- [Tasks](tasks.md) — track long-running plugin runs.
- [Browse the Marketplace](../marketplace.md) — find packs to add.
