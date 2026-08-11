# The canvas

The canvas is where a Vineyard project lives: nodes and edges laid out on a graph you can pan, zoom, re-layout, and annotate. This page documents every control available in the on-canvas toolbar and in the top menu bar (**Project / Edit / View / Run**).

## Two ways to reach the same actions

The view controls are exposed twice, and both drive the **same** live graph state, so they always stay in sync:

- **On-canvas toolbar** — a compact vertical bar pinned to the top-left edge of the canvas, for the controls you reach for most while working.
- **Top menu bar** — the `Project`, `Edit`, and `View` menus, which add data and navigation actions alongside the view toggles (a fourth menu, `Run`, launches plugins and the AI agent — see [Running plugins](running-plugins.md)).

Toggling the grid from the menu bar, for example, flips the same switch the toolbar button shows, and vice versa.

## View controls (toolbar + View menu)

These controls appear in both the on-canvas toolbar and the `View` menu and drive the same state. Toolbar toggle buttons appear highlighted when on; menu items are checkmarked when on.

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

## Top menu bar

### Project

| Item | Action |
| --- | --- |
| **Share…** | Opens the share dialog to manage who can view and edit the project. |
| **Members…** | Opens the project's members page to manage who has access. |
| **Project settings…** | Opens the project's settings page. |
| **Export graph (JSON)** | Downloads the current graph as a JSON file (see [Export graph](#export-graph-json)). |
| **Import graph (JSON)…** | Opens a dialog to load a previously exported JSON file back into the project. |
| **Activity log…** | Opens the project's activity log. |
| **Add from Marketplace…** | Opens the [Marketplace](../marketplace.md) scoped to this project so you can add plugins and Type Packs. |

### Edit

| Item | Action |
| --- | --- |
| **Select all** | Marks every node as selected. |
| **Select connected neighbors (1 hop)** | Adds the 1-hop neighbors of the current selection to it. |
| **Invert selection** | Selects every unselected node and deselects every selected one. |
| **Select isolated nodes** | Selects every node with no edges. |
| **Clear selection** | Deselects all nodes and clears the selection count. |

!!! note "Adding a node"
    New nodes are created from the **Types** panel — pick an active type there — not from this menu.

### Run

| Item | Action |
| --- | --- |
| **Ask the AI agent…** | Opens the AI chat to start or continue an agent turn. |
| **Run plugins…** | Opens the run panel, scoped to the current selection if any nodes are selected. |
| *(Skill packs)* | Every skill pack installed in the project is listed below a divider; picking one opens it for reading, it does not run anything (see [Skill Packs](skillpacks.md)). |

## Layouts

Both the toolbar's layout menu and the `View ▸ Layout` submenu offer the same set. Applying a layout re-computes node positions and then fits the view.

| Layout | Description |
| --- | --- |
| **Concentric** | Arranges nodes in concentric rings; overlap is prevented. |
| **Force** | Force-directed layout that pushes nodes apart and pulls connected ones together. |
| **D3 Force** | A D3-based force-directed variant. |
| **Circular** | Places nodes evenly around a single circle. |
| **Radial** | Spreads nodes outward from a focal node. |
| **Grid** | Lays nodes out on a regular grid; overlap is prevented. |
| **Hierarchical (Dagre)** | Top-down layered layout, good for directed / tree-like graphs. |

!!! tip
    Force and D3 Force are the best starting point for an unfamiliar graph; switch to Hierarchical (Dagre) when the relationships are directional and you want clear layers.

## Overlays

### Grid

A subtle background grid that follows the canvas as you pan and zoom, giving you a visual reference for aligning nodes.

### Minimap

A translucent overview panel docked at the bottom-right corner. It shows the whole graph in miniature with a viewport rectangle marking your current view — useful for orienting yourself in a large project.

### Legend

A translucent, minimap-style panel at the bottom-left that lists the node **types currently present** in the graph. Each entry shows a colored swatch matching the node's type color, the type's display name, and a per-type **count** of how many nodes of that type exist. Entries are sorted alphabetically by label. When the graph is empty the legend reads "No nodes."

The legend reflects whatever Type Packs the project uses — for example, an investigation built on the [Infrastructure Type Pack](typepacks.md) might show counts for `infrastructure.ip_address`, `infrastructure.domain`, and so on, each resolved to its Type Pack-defined label and color.

### Snapline

When enabled, dragging a node near another node's edges or center shows alignment guides (vertical and horizontal lines) and snaps the node into alignment. Unlike the grid, minimap, and legend, snaplines have no persistent panel — they appear only while you are actively dragging.

### Parallel edges

When two or more edges connect the same pair of nodes — in either direction — the canvas bends
them apart into arcs instead of drawing one on top of the other, so each edge stays visible and
individually clickable. This matters because an edge's label is its own finding with its own
provenance: two overlapping edges are two distinct pieces of evidence, not one.

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

## Add from Marketplace

`Project ▸ Add from Marketplace…` opens the [Marketplace](../marketplace.md) scoped to the current project, where you can add plugins and Type Packs that are wired straight to it. See [Installing](installing.md) for the full flow.

## Next / See also

- [Running plugins](running-plugins.md) — execute plugins against nodes on the canvas.
- [Type Packs](typepacks.md) — how node types, colors, and labels drive the legend.
- [Tasks](tasks.md) — track long-running plugin runs.
- [Browse the Marketplace](../marketplace.md) — find packs to add.
