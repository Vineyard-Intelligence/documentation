# Running plugins

Once a plugin is installed in a project, you launch it from one of three surfaces — a node's right-click menu, a global "Run plugin" menu, or the command palette — and watch and cancel the run from the Tasks panel. This page covers each surface and how a run gets its input.

## Where input comes from

Every plugin declares its inputs in its manifest, and that declaration decides where the plugin shows up and how it is pre-filled:

- **`io.consumes`** — the node type(s) the plugin operates on. A plugin that consumes a type appears on the right-click menu of any node of that type, and the consumed value is **pre-bound into `params`** through the `as` key.
- **Empty `consumes`** — the plugin operates on the whole graph and is launched from the global **Run plugin** menu (or the palette).
- **Selection** — the currently selected node(s) are always seeded into `ctx.input.selection`, regardless of `consumes`. This is how a plugin like **Black Hole** knows which node to act on.

See the [plugin manifest](../develop/plugin-manifest.md) and [scopes](../reference/scopes.md) references for the full shape of these fields.

## Launch surface 1: the node right-click menu

When a plugin's `io.consumes` matches a node's `type`, it appears on that node's right-click menu. Selecting it opens the pre-run params form with the consumed value already filled in.

Take **CIDR Expand**, whose manifest consumes an `infrastructure.netblock` node and binds it as `cidr`:

```jsonc
"io": {
  "consumes": [
    { "typepack": "run.vineyard.typepacks.infrastructure",
      "category": "infrastructure", "name": "netblock", "as": "cidr" }
  ],
  "produces": [
    { "typepack": "run.vineyard.typepacks.infrastructure",
      "category": "infrastructure", "name": "ip_address" }
  ]
}
```

Right-click an `infrastructure.netblock` node → **CIDR Expand** is listed → the form opens with `cidr` already set to that node's value. You then confirm `max_hosts` (or any other param) and run. New `infrastructure.ip_address` nodes appear on the canvas as the run progresses.

!!! note "Built-in node menu actions"
    The reference UI's node menu also includes graph editing actions (Copy, Duplicate, Connect mode, Disconnect all, Delete). Consuming plugins are listed alongside these per-type actions.

## Launch surface 2: the global Run plugin menu

A plugin with `consumes: []` acts on the whole graph and has no node to attach to, so it is launched from a global **Run plugin** menu rather than a node — for example the whole-graph plugins in the Chaos pack (Korean Roulette, Russian Roulette, Thanos Snap, Dumb AI Optimizer, Schrödinger's Node). See [The Chaos reference pack](#the-chaos-reference-pack) below for the full roster and scopes.

## The pre-run params form

Before a run starts, Vineyard shows a form generated from the manifest's `params` block, which is a JSON Schema. Field titles, types, defaults, and constraints come straight from the schema. For CIDR Expand:

```jsonc
"params": {
  "type": "object",
  "required": ["cidr"],
  "properties": {
    "cidr":      { "type": "string", "title": "CIDR block",
                   "pattern": "^\\d{1,3}(\\.\\d{1,3}){3}/\\d{1,2}$",
                   "description": "Pre-filled from the right-clicked netblock node." },
    "max_hosts": { "type": "integer", "title": "Max hosts to emit",
                   "minimum": 1, "maximum": 65536, "default": 1024 }
  }
}
```

This renders a text input for **CIDR block** (validated against the pattern, pre-filled when launched from a node) and a number input for **Max hosts to emit** defaulting to 1024. The values you submit become the run's `Task.input.params`.

!!! warning "No secrets in params"
    `params` is plain run input — never put API keys or credentials here. Secret-looking keys are rejected at install. Secrets belong in `scopes.config` with `secret: true`. See [security](../develop/security.md).

## Selection input

Some plugins act on whatever you have selected. The host always seeds `ctx.input.selection` with the selected node ids, so a plugin reads the selection rather than a param.

**Black Hole** is the canonical example: it consumes a **selected node** and deletes that node's 1-hop neighbors. Select a node (or right-click it), launch Black Hole, and the run reads your selection to find the target. If you launch a selection-driven plugin with nothing selected, there is no input to act on.

## The command palette

The command palette runs plugins by name, which is handy for whole-graph plugins and for keyboard-first work.

=== "List installed plugins"

    ```text
    /plugins
    ```

    Lists every plugin installed in the current project, each with its run command:

    ```text
    Available plugins:
    • /plugin korean_roulette — Korean Roulette: Keep one random node; delete everything else.
    • /plugin thanos_snap — Thanos Snap: ...
    ```

    If nothing is installed, it points you to **Menu → "Add from Marketplace"**.

=== "Run one plugin"

    ```text
    /plugin thanos_snap
    ```

    Runs the named plugin. The argument is the plugin's short name (the part after `run.vineyard.plugins.`) or its full identifier — so `/plugin thanos_snap` and `/plugin run.vineyard.plugins.thanos_snap` both work. Omitting the name prints a hint; naming a plugin that isn't installed tells you to install it from the Marketplace.

A palette launch uses the current node selection as its selection input, just like the menu surfaces.

## Progress and cancellation

Every run becomes a task with a live status badge, a progress bar for determinate plugins, and a **Stop** control that cancels cooperatively. See [Tasks & runs](tasks.md) for states, controls, and saving a run.

## The Chaos reference pack

The Chaos pack ships six pure client-side graph plugins in one bundle (`run.vineyard.pluginpacks.chaos`) — installing it adds all six at once. They are the SDK's validation set and run identically on web and desktop.

| Plugin | `scopes.graph` | `io.consumes` | Behavior |
|---|---|---|---|
| Korean Roulette | `node:read node:delete edge:delete` | — (whole graph) | keep one random node, delete all others |
| Russian Roulette | `node:read node:delete` | — | delete one random node (+its edges) |
| Thanos Snap | `node:read node:delete edge:delete` | — | delete `floor(n/2)` random nodes |
| Black Hole | `node:read node:delete edge:delete` | **selected node** | delete the 1-hop neighbors of the selected node |
| Dumb AI Optimizer | `[]` (no graph) | — | fake 3–5s progress, change nothing |
| Schrödinger's Node | `node:read node:delete` | — | pick a random node; 50% delete / 50% nothing |

Two SDK requirements these lock in:

1. **Selection input.** Black Hole operates on whatever the user has selected. The host seeds `ctx.input.selection` (selected node ids) and, for plugins that declare a typed `consumes` entry, pre-binds the consumed node into `ctx.params` via the `as` alias.
2. **Bulk delete + cap policy.** Mass deletion goes through `ctx.graph.deleteNodes(ids[])`. The run-token write-cap counts a bulk call as a **single bounded operation**, so a legitimate mass-delete (Korean Roulette wiping a 4,000-node graph) is not throttled to death one node at a time.

!!! tip "Try it safely"
    The Chaos pack is destructive by design. Run it on a throwaway graph (or use `/temp` to generate sample data first) so you can watch Korean Roulette, Thanos Snap, and Black Hole reshape the canvas without losing real work.

## Next / See also

- [Tasks & runs](tasks.md) — task states, progress, stop, and saving a run
- [CIDR Expand](../develop/plugin-manifest.md) — the pure-compute expansion plugin
- [Browse & install Plugin Packs & Type Packs](installing.md) — getting a plugin into your project
- [Plugin manifest](../develop/plugin-manifest.md) — `io.consumes`, `params`, and `as`
