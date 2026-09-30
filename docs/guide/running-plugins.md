# Running plugins

Once a plugin is installed in a project, you open the **Run plugins** panel from a right-click on
a node, a selection or empty canvas, from the ▶ button on the canvas toolbar, or from
**Run ▸ Run plugins…** in the top menu bar. You can also type `/plugin <name>` in the project's chat
panel (MESSAGES); this is available only to people who can edit the project, and it runs the plugin
straight away on the selected node with no form. You watch and cancel the run from the Tasks panel.

## Where a plugin shows up

Every installed plugin is listed in one panel, **Run plugins**. At the top, a scope switch picks
**Selected (N)** — only the selected nodes, each plugin seeing only nodes of the type it accepts —
or **Whole project (N)** — bulk: every node of each plugin's input type in the project. Every
plugin declares its inputs (`consumes`), and that declaration decides which group it appears in:

- **Matches selection** / **Matches project data** → plugins whose `consumes` types are in scope,
  with an "N targets" badge.
- **Whole-graph / input via form** → plugins that consume nothing (e.g. the Chaos pack). They still
  receive your current selection, so for one like Black Hole select a node first.
- **Not applicable here** → installed, but none of their input types are in scope (greyed out).
- **Desktop only** → installed, but not runnable in a browser.

You can tick several plugins and press **Run (N)**. Once there are more than 6 plugins, a filter
box searches names, descriptions and types. Selection chips can be dropped from this run with their
×, which leaves the canvas selection unchanged.

## Launch surfaces

=== "Right-click a node"

    Right-click a node, a selection, or empty canvas and choose **Run plugins…**. The panel opens
    scoped to that node/selection, or to the whole project from empty canvas.

=== "The Run menu"

    The top menu bar's **Run** menu — `Run ▸ Run plugins…` — opens the same panel, scoped to your
    current selection, or to the whole project when nothing is selected. The ▶ button on the canvas
    toolbar does the same; its tooltip names the scope.

=== "The chat panel (`/plugin`)"

    The chat panel runs plugins by name, handy for keyboard-first work:

    - Type `/` to see every plugin installed in the current project as an autocomplete suggestion
      (`/plugin <name>`), each labeled with its description.
    - `/plugin thanos_snap` — runs the named plugin. The argument is the plugin's short name (the
      part after `run.vineyard.plugins.`) or its full identifier. Naming a plugin that isn't
      installed shows an error instead of running it — install it from the Marketplace first.

## The pre-run form

When you tick a plugin that takes input, its fields appear under it in the Run plugins panel —
text, number, switch, dropdown, or a file drop zone. Required fields are marked * and **Run** stays
disabled until they are filled. The nodes a plugin runs on come from the panel's scope, not from
these fields. File inputs accept at most 25 MB per file, 50 files and 250 MB per run.

Plugins that need stored settings (for example an API key or gateway URL) show a collapsible
**Settings (x/y set)** block. These values are saved as you type and reused on later runs. They are
kept separately for each account on this device — in the browser only for this session, in the
desktop app encrypted and kept across launches. This separates accounts inside Vineyard, not from
someone with direct access to this computer. Values saved by earlier versions were discarded — enter
them once more. Press **Run (N)** to start every ticked plugin.

## Reviewing a run's changes

A plugin never writes to the project directly. What it would add, change or delete is staged, and when
the run ends you get a toast ("N change(s) staged — review to apply") and a **needs review** badge
on its Tasks row. Click the row to open the Review dialog, untick anything you do not want, then
press **Apply (N)** — or **Discard all**. Nothing is written to the project until you apply; while the
Review dialog is open, the changes are only previewed on the canvas. A run that stages nothing ends
with a toast showing its summary (or "No changes").

## Progress and cancellation

Every run becomes a **task** shown in the Tasks panel, with a live status badge, a progress bar
where the plugin reports one, and a **Stop** control. Stop asks the plugin to wind down; if it has
not finished within about 3 seconds, it is force-stopped. Any changes it had already staged are
kept for you to review, not thrown away. A run that exceeds its time budget (10 minutes by default,
at most 60) is stopped and marked failed. See [Tasks & runs](tasks.md) for states and controls.

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

- [Tasks & runs](tasks.md) — task states, progress, stop, and review
- [Browse & install](installing.md) — getting a plugin into your project
- [Type Packs](typepacks.md) — the node types plugins act on
