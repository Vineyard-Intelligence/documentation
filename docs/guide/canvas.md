# The canvas

The canvas is where a Vineyard project lives: nodes and edges laid out on a graph you can pan, zoom, re-layout, and annotate. This page documents every control available in the on-canvas toolbar and in the top menu bar (**Project / Edit / View**).

## Two ways to reach the same actions

The view controls are exposed twice, and both drive the **same** live graph state, so they always stay in sync:

- **On-canvas toolbar** — a compact vertical bar pinned to the top-left edge of the canvas, for the controls you reach for most while working.
- **Top menu bar** — the `Project`, `Edit`, and `View` menus, which add data and navigation actions alongside the view toggles.

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
| **Export graph (JSON)** | Downloads the current graph as a JSON file (see [Export graph](#export-graph-json)). |
| **Add from Marketplace…** | Opens the [Marketplace](../marketplace.md) scoped to this project so you can add plugins and Type Packs. |
| **Project list** | Navigates back to your list of projects. |

### Edit

| Item | Action |
| --- | --- |
| **Add node** | Creates a new node on the canvas. |
| **Select all** | Marks every node as selected. |
| **Clear selection** | Deselects all nodes and clears the selection count. |

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
