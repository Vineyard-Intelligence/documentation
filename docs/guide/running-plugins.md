# Running plugins

Once a plugin is installed in a project, you open the **Run plugins** panel from a right-click on
a node, a selection or empty canvas, from the ▶ button on the canvas toolbar, from
**Run ▸ Run plugins…** in the top menu bar, or from the command palette (**⌘K**). You watch and cancel the run from the Tasks panel.

## Where a plugin shows up

Every installed plugin is listed in one panel, **Run plugins**. At the top, a scope switch picks
**Selected (N)** — the plugins that read nodes, each seeing only the selected ones of the type it
accepts — or **Whole graph (N)** — the plugins that take no node input at all. N counts nodes: in
**Selected** the selected nodes this run keeps (a chip you drop leaves the count), in **Whole graph**
every node in the project. A plugin that
declares an input type (`consumes`) runs only on nodes you picked; there is no "run it over every
node of that type" shortcut, the same way the agent's `invoke_plugin` refuses a call without
`node_ids`. Every plugin declares its inputs, and that declaration decides which group it appears
in:

- **Matches selection** → plugins whose `consumes` types are in the selection, with an
  "N targets" badge.
- **Whole-graph / input via form** → plugins that consume nothing (for example a query plugin that
  reads its form). They still receive your current selection, so select a node first when the
  plugin acts on the current selection.
- **Not applicable here** → installed, but none of their input types are in scope (greyed out).
- **Desktop only** → installed, but not runnable in a browser.

You can tick several plugins and press **Run (N)**. Once there are more than 6 plugins, a filter
box searches names, descriptions and types; its **×** clears it. Selection chips can be dropped from this run with their
×, which leaves the canvas selection unchanged.

A pack in which a plugin is not named as a plugin, or is named as one of the app's own writers (the
AI agent, a merge, a re-verification, **New node**), is not loaded at all, and none of its plugins is
listed or run. A red notice names it: *1 pack was not loaded — … so none of it was run. It needs a
corrected release; tell the pack author or the registry maintainers.*

<figure class="vy-shot" markdown="span">
  ![Run plugins panel](../assets/guide/run-plugins-panel.webp){ width="800" loading=lazy }
  <figcaption>Run plugins opened from a right-click on example.com: the scope switch, the selection chip, and the plugins that match it.</figcaption>
</figure>

## Launch surfaces {#launch-surfaces}

=== "Right-click a node"

    Right-click a node, a selection, or empty canvas and choose **Run plugins…**. The panel opens
    scoped to that node/selection, or to the whole project from empty canvas.

=== "The Run menu"

    The top menu bar's **Run** menu — `Run ▸ Run plugins…` — opens the same panel, scoped to your
    current selection, or to the whole project when nothing is selected. The ▶ button on the canvas
    toolbar does the same; its tooltip names the scope.

=== "The command palette"

    Press **⌘K** (**Ctrl+K**) and type the plugin's name. **Run WHOIS on the selection** (for a plugin
    that reads no nodes, **Run** and its name) opens the panel on your selection with that plugin
    ticked. If the panel was already open, it becomes the only plugin ticked. Nothing runs from the
    palette: you check the panel and press **Run**. **Run** takes the focus, or, when the plugin has
    a required field that is empty, that field does. See [Command palette](shortcuts.md#command-palette).

### Running the same plugins again {#running-the-same-plugins-again}

A pivot runs the same plugins hop after hop. After a run, **Run ▸ Run the last plugins again on the
selection** (also in the command palette) opens the panel on what is selected now, with the last
run's plugins ticked and the parameters you typed for them filled in, and **Run** focused, so
**Enter** runs them. Files you picked, list values, and anything a plugin marks as a password or a
secret are not kept, so a run that needs a file asks for it again. A parameter you have already typed in an open
panel is left as you typed it. The last run is forgotten when you leave the project.

The focus moves once, when the panel opens this way, and never while you fill it in. When a required
field is empty, the cursor goes to that field instead of **Run**. When the panel was already open
with other plugins ticked, they stay ticked and **Run** does not take the focus, so **Enter** never
runs a plugin you did not choose here.

## The pre-run form

When you tick a plugin that takes input, its fields appear under it in the Run plugins panel —
text, number, switch, dropdown, or a file drop zone. Required fields are marked * and **Run** stays
disabled until they are filled. **Esc** in a dropdown's open list closes only the list, so the plugins
you ticked and what you filled in stay; the next Esc closes the panel. The nodes a plugin runs on come from the panel's scope, not from
these fields. File inputs accept at most 25 MB per file, 50 files and 250 MB per run.

Plugins that need stored settings (for example an API key or gateway URL) show a collapsible
**Settings (x/y set)** block. These values are saved as you type and reused on later runs. Plugins
of the same pack that call the same destinations share one value, so a key typed for one of them
is filled in for the others that ask for it; a plugin published on its own, or one that declares
no network destination, keeps its own. A secret field names the hosts its value is sent to and,
when other plugins in the pack share it, how many (*Sent to … · shared with N other plugins in
this pack*). Press **Run (N)** to start every ticked plugin.

Some packs connect to a server whose address only you know, such as a self-hosted sharing platform
or an internal service. Their address field says where requests will go (*Requests from this plugin go to …*), or
why the address is not used, for example *This address is not used: it must start with https://*.
The plugin sends nothing there until the address is set. In the browser an `http://` address is not
used unless it is on this computer (`localhost`), because the browser blocks it from the https app:
use an https address, or the desktop app. In the desktop app, a server on this
computer or on your organisation's network can be read only once you trust it: press
**Trust … on this computer…** under the field and confirm the dialog. The origin is added to
**Additional trusted origins** in **Desktop Settings…**, applies in every project, and is removed
there.

Values are kept separately for each account on this device — in the browser only in this tab, gone
when it closes; in the desktop app encrypted and kept across launches (for the session only, on a
computer that cannot encrypt them). This separates accounts inside Vineyard, not from someone with
direct access to this computer. **Manage Keys & Secrets**, at the bottom of the panel, opens
**Settings → Keys & Secrets**. Its **Plugin keys** table lists every plugin key stored for your
account on this device, with **Pack**, **Key**, **Sent to** and **Value** columns; inside a project
it also lists the keys the project's packs declare that are not set yet. From a row you can show a
stored secret (**Show**), set or replace the value (**Set**, **Replace**) and remove it
(**Forget**); **Forget all…** removes every stored plugin key.

## Reviewing a run's changes {#reviewing-a-runs-changes}

A plugin never writes to the project directly. What it would add, change or delete is staged, and when
the run ends you get a toast ("N change(s) staged — review to apply") and a **needs review** badge
on its Tasks row. Click the row to open the Review dialog, untick anything you do not want, then
press **Apply (N)** (or **⌘Enter** / **Ctrl+Enter**) — or **Discard all**. **/** jumps to **Filter by keyword**. Nothing is written to the project until you apply; while the
Review dialog is open, the changes are only previewed on the canvas. A run that stages nothing ends
with a toast showing its summary (or "No changes"). A change that would leave an edge as it is, with
its label and the fields it already stores, is not staged, so running a plugin again over the same
data does not list those edges again.

The right side of the dialog shows the selected row's properties. For a node, they are what the
node will hold once the row is applied: for a change, its stored values with the proposed ones merged
in. A new node that is in the project by now, because a review you applied since this run staged
added it, is merged into that node instead of being added twice; the pane then says *This node is
already in the project* and shows the merged values, with the node's own spelling of the fields that
identify it (`Example.com` stays `Example.com` when the run found `example.com`), as the apply keeps
it. For an edge, **Recorded with this
link** below them lists what the edge will store besides its label and grade once the row is
applied: for a new edge, what the plugin recorded with it, such as where and when the link was
observed; for a change, the edge's stored values with the proposed ones in their place; for a
delete, what goes with the edge. The edge's Properties panel shows the same list (see
[Recorded with this link](properties.md#recorded-with-this-link)). Once the apply has finished, or
when you reopen the run from Tasks as history, the list is headed **Proposed by this change** and shows only
what the row itself proposed, since the edge may have changed since. The **Status** column says
whether it landed, and the edge's Properties panel shows what it stores now.

Unticking a node also leaves out the edges that need it, and the footer says how many (*N edges
excluded — their endpoint nodes are not being created*). If some links point at nodes from another
run that is still waiting for review, the footer says so: apply that review first. Applied before it,
those links stay staged in this run with the reason on each row, and they land when you apply this
run again after the other one. If the other run is discarded instead, they are skipped. The
optional **Why reject?** field beside **Discard all** gives your reason to the AI agent when the
changes came from one of its conversations.

Closing the dialog with the X or **Esc** keeps the run waiting for review, and keeps your choices
with it: what you unticked or ticked back on, and what you typed in **Why reject?**, are still there
when you reopen the review, even after opening another project and coming back. **Esc** closes the
dialog from anywhere in it, and also while nothing has focus, as right after **Apply**. That holds
after an **Apply** from the keyboard too (**Tab** to **Apply** and **Enter**, or **⌘Enter** /
**Ctrl+Enter** in **Why reject?**), whatever you clicked last: the AI agent, Run plugins or Skill pack
panel behind the review stays open. In the **Filter by keyword** field while it holds text, it clears
the filter first, as the field's **×** does. An Esc right after a click in another panel, such as the
AI agent's, is that panel's. While a review is open, an Esc pressed in Run plugins or the Skill pack
panel, or right after a click in it, closes that panel and leaves the review open; an Esc from
anywhere else leaves them open.

A run waiting for review is also kept on this device, under your account, so a reload, a restart, an
app update or a crash does not lose it. The next time you open the project it is waiting for review
again in Tasks, with your choices and your **Why reject?** text, even if the dialog was open when the
page went away. A plugin run or AI turn that a reload or a crash cut short comes back with what it had
staged by then. The Tasks row for what it staged is `cancelled`, as after **Stop**, and says *Cut short
by a reload*, and the review says *Cut short by a reload — this is what it had staged by then, not everything it would
have found.* A run whose apply was under way when the page went away comes back too, but the server
may already have written some of its rows: its review says *An apply of this set was under way when
the page went away — some of these rows may already be in the graph*, and a plugin run's Tasks row
says so as well. Check the graph before you apply or discard it. If you discard it, each row the
graph already holds, one that applying now would not change, is recorded as applied and the rest
as discarded, as after a partial apply (below), so the AI agent is told what landed and that you
rejected the rest. That needs the whole graph: discarded while the project is still loading, every
row is recorded as discarded.
A run is kept for 7 days after its last change, and longer while a tab has it open, and
then deleted. The footer of the dialog says where the review is kept: *Kept on this device only — a reload brings
this review back, for 7 days after its last change*, or *Held in this tab only — a reload loses this
review* when no account is signed in or this device's storage refuses it. While the storage refuses
it, a red notice also stays on screen (*Changes waiting for review are not being kept on this
device*), and leaving the project while a plugin run or an AI turn is still working says the changes
live in this tab only and a reload loses them (see [Ephemeral by default](tasks.md#ephemeral-by-default)).
Nothing of a run waiting for review is sent to the Vineyard server. A run waiting in a tab that is still open stays with that tab:
another tab shows it only once that tab has been closed, the next time it opens the project.

A change from the AI agent that edits a node's fields writes only the fields the agent changed. A
field that someone else changed after the agent read the node, in this tab or another, keeps its new
value, and the properties on the right show the node as it will be after the apply.

If some changes cannot be written, a **Partly applied** toast says how many. Those stay staged with
the reason on each row and the run is still waiting for review: reopen it to try them again. Once a
run is applied or discarded, clicking its row opens a read-only record of what was applied or
discarded.

If you press **Discard all** after part of a run has been applied, only the changes still staged are
thrown away; what was applied stays in the graph. The run is then recorded as applied, not
discarded: its badge reads **applied**, its record lists what was applied and marks the discarded
rows *excluded*, and when the run came from an AI agent conversation, the agent is told what landed
and that you rejected the rest.

<figure class="vy-shot" markdown="span">
  ![Review dialog](../assets/guide/review-changes.webp){ width="800" loading=lazy }
  <figcaption>The Review dialog for one run: the staged nodes and edges, the selected row's properties, and Apply (4) / Discard all.</figcaption>
</figure>

## Progress and cancellation

Every run you start becomes a **task** shown in the Tasks panel, with a live status badge, a
progress bar where the plugin reports one, and a **Stop** control. Stop asks the plugin to wind down;
if it has not finished within about 3 seconds, it is force-stopped. Any changes it had already staged
are kept for you to review, not thrown away. A run that exceeds its time budget (10 minutes by
default, at most 60) is stopped and marked failed. A run that fails discards anything it had staged:
that includes a run stopped for exceeding its time budget, a sandbox that did not start, and a
plugin error. Only **Stop**, or a reload that cuts the run short, keeps partial results. See
[Tasks & runs](tasks.md) for states and controls.

Each request a plugin makes also has its own deadline, by default a minute at most unless the
plugin sets another, so a host that does not answer fails that request instead of holding the run
for its whole budget. If such a run still completes but stages nothing, its toast is yellow and
names the hosts that did not answer (*no answer from …*). Read "No changes" there as "could not
check", not "nothing found".

Plugin runs the AI agent starts have no Tasks row of their own. Each one that staged something
appears as a change set in that conversation and is reviewed there, or applied at the end of the
turn under **Apply automatically**. Stopping the turn, or deleting the conversation, stops them. See
[What the agent can do](tasks.md#what-the-agent-can-do).

## Next / See also

- [Tasks & runs](tasks.md) — task states, progress, stop, and review
- [Browse & install](installing.md) — getting a plugin into your project
- [Working with Type Packs](typepacks.md) — the node types plugins act on
