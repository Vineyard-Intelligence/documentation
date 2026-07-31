# Running plugins

Once a plugin is installed in a project, you launch it from one of three surfaces — a node's
right-click menu, a global "Run plugin" menu, or the command palette — and watch and cancel the
run from the Tasks panel.

## Where a plugin shows up

Every plugin declares its inputs, and that declaration decides where it appears:

- **Operates on a node type** (e.g. an IP-address expander that consumes a netblock node) → it
  appears on the **right-click menu** of any matching node, with that node pre-bound as input.
- **Operates on the whole graph** (e.g. the Chaos pack's roulettes) → it is launched from the
  global **Run plugin** menu or the palette.
- **Uses your selection** → some plugins act on whatever node(s) you have selected, so select a
  node first — the run reads your selection as its input.

## Launch surfaces

=== "Right-click a node"

    Right-click a node whose type matches what the plugin consumes — the plugin is listed in the
    menu. Selecting it opens the pre-run form with the consumed node's value already filled in.

=== "The global Run plugin menu"

    Whole-graph plugins have no node to attach to, so they live in a global **Run plugin** menu
    instead.

=== "The command palette"

    The palette runs plugins by name, handy for keyboard-first work:

    - `/plugins` — lists every plugin installed in the current project, each with its run command.
    - `/plugin thanos_snap` — runs the named plugin. The argument is the plugin's short name (the
      part after `run.vineyard.plugins.`) or its full identifier. Naming a plugin that isn't
      installed points you to the Marketplace.

## The pre-run form

If a plugin takes input, a small form appears before the run starts — for example a text field
for a CIDR block, or a number field for a limit. Required fields are marked, defaults are
pre-filled, and values are validated as you type. When launched from a node, the consumed value
comes pre-filled. Confirm, and the run starts.

## Progress and cancellation

Every run becomes a **task** shown in the Tasks panel, with a live status badge, a progress bar
where the plugin reports one, and a **Stop** control that cancels cooperatively — partial results
are kept, not thrown away. See [Tasks & runs](tasks.md) for states, controls, and saving a run.

## The Chaos reference pack

The Chaos pack is a single bundle (`run.vineyard.pluginpacks.chaos`) of six small plugins that
reshape your graph for learning the run loop:

| Plugin | What it does |
|---|---|
| Korean Roulette | Keeps one random node, deletes all others |
| Russian Roulette | Deletes one random node |
| Thanos Snap | Deletes half the nodes at random |
| Black Hole | Deletes the 1-hop neighbors of the selected node |
| Dumb AI Optimizer | Shows fake progress for a few seconds, changes nothing |
| Schrödinger's Node | Picks a random node; 50% delete, 50% nothing |

!!! tip "Try it safely"
    The Chaos pack is destructive by design. Run it on a throwaway graph so you can watch
    Korean Roulette, Thanos Snap, and Black Hole reshape the canvas without losing real work.

## Next / See also

- [Tasks & runs](tasks.md) — task states, progress, stop, and saving a run
- [Browse & install](installing.md) — getting a plugin into your project
- [Type Packs](typepacks.md) — the node types plugins act on
