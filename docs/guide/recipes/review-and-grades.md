# Reading the review and evidence grades

Whatever a plugin, the AI agent, a merge or a re-verification proposes waits in a review before it
reaches the project, and every link it applies carries an evidence grade. This recipe takes one
plugin run through its review, then reads the grades of the links it drew, and asks again with
Re-verify. The example continues [From a phishing domain to its infrastructure](phishing-domain.md);
its names and addresses are made up ([About the examples](index.md#about-the-examples)).

## What you start with {#what-you-start-with}

A change set waiting for review. It shows as one of these:

- a **needs review** badge (or **N to review**) on a row in **Tasks**, after a toast such as
  *Certificate Transparency Subdomains: 14 change(s) staged — review to apply*;
- in an AI agent conversation, the line *N change(s) across M change sets need review* above the
  message box, with **Review**;
- a **Merge** or a *Re-verification* row in Tasks.

## Steps {#steps}

### 1. Open the review {#open}

Click the Tasks row, or **Review** in the AI agent panel. The dialog's title names the run, such as
*Review: Certificate Transparency Subdomains*. Nothing is written while it is open: the canvas
previews the changes, and what they would change or delete is drawn even when your canvas filter
hides it ([Hiding nodes and edges](../canvas.md#hiding)).

### 2. Read the list {#list}

- The tabs **All**, **Add**, **Update** and **Delete** count the rows of each kind, and the line
  beside them how many of the rows shown are ticked (*12 of 14 selected*).
- Each row has **Op** (Add, Update or Delete), **Kind** (node or edge), **Label** and **Type**. When
  the independent check ran, a **Check** column gives its verdict; after an apply, **Status** says
  what happened to the row.
- **Filter by keyword (label, type, data…)**, or **/**, searches what the rows hold, not only their
  labels: `cloudflare` finds every row whose data names it, so that you can untick those.
- A row you untick is left out of the apply. Unticking a node leaves out the links that need it too,
  and the footer counts them (*N edges excluded — their endpoint nodes are not being created*).

Look for **Update** rows on links. An Update on a link means the pair already has one. When the new
writer used other words, the row proposes its wording in place of the current one: in the step 4 run
of the phishing recipe, OTX's `resolved to (2026-09-14 → 2026-11-02)` over DNS Lookup's
`resolves to`. Untick the row to keep the wording you have. An Update that keeps the wording adds
what the new writer stored with the link, and when the new writer is another collector drawing the
same link in the same words, it adds that writer to `corroborated_by` (step 6).

### 3. Read the focused row {#focused-row}

Click a row, or move with **↑** and **↓**. The pane on the right shows what the row will write:

- **A node:** its fields as they will be once the row is applied, an Update's proposed values merged
  over the stored ones. *This node is already in the project* means a node of the same identity has
  reached the project since this run was staged, for example through a review you applied in the
  meantime: applying adds these fields to it, and the values shown are what it will hold.
- **A link:** `from`, `relation` and `to`, and under **Recorded with this link** what the writer stored
  with it, such as the `first_seen` and `last_seen` OTX keeps. For an Update that rewords a link, the
  pane shows `current_relation`, who wrote it (`current_relation_written_by`) and `proposed_relation`.
  *Edited here* there means the words about to be replaced are yours.

### 4. Read the check, when it ran {#check}

The independent check runs on the AI agent's change sets while **Have an independent check test each
inference** is on, and on every re-verification. Its verdict is in the **Check** column:

| Verdict | Reads as | If you apply the link |
|---|---|---|
| *supported* | The check argued against it and it held | `assessed` |
| *weak*, *unresolved* | Consistent, but thin | `circumstantial` |
| *refuted* | The check argued it down | `contested`: it stays because you kept it |
| *not checked*, *check failed* | Nothing judged the row | The grade it would have had without the check |
| *dropped* | The agent withdrew the change | — |

The **Independent check** pane under the list gives, for the focused row, the **Claim**, the **Case
against**, **Prevalence** (how common the attribute the claim rests on is) and what it **Would be
settled by**. Drag its top edge to make it taller. Under **Review everything (AI-assisted)**, the
default, the rows the agent advises against arrive unticked.

### 5. Apply, or say why not {#apply}

Press **Apply (N)** (**⌘Enter**, or **Ctrl+Enter**). The footer counts the rows as they land and ends
with *Done N/N*. A row that could not be written stays staged with its reason, and the run is still
waiting for review: reopen it to try again. **Discard all** throws away what is still staged. When the
change set came from an AI agent conversation, **Why reject? (optional — the agent is told)** gives
the agent your reason, so that it does not propose the same thing again.

Closing the dialog with **×** or **Esc** keeps the run, what you ticked and what you typed; reopen it
from Tasks. Once a run is applied or discarded, its row opens a read-only record (*History — N applied,
M skipped, K failed*) with a **Status** for every row.

### 6. Read a link's grade {#grade}

Click one of the links the run drew. The Properties panel shows ([A link](../properties.md#a-link)):

- its two ends, `from → to`, and who wrote its label: *Written by*
  `run.vineyard.plugins.crtsh_subdomains`;
- *Evidence:* the grade, who set it (*Graded by* the same plugin), and one line on what the grade
  says;
- under **Recorded with this link**, what the writer stored, and `corroborated_by`, the other writers
  that drew the same link.

How a link gets its grade when it is applied, without any model:

| The link | Its grade |
|---|---|
| A plugin's link between the node you ran it on and a node the run found: DNS Lookup's `resolves to`, Certificate Transparency's `subdomain` | `recorded` |
| A link where one end's own fields name the other, such as an account whose `profile_url` holds the URL the link points at | `recorded` |
| The same link in the same words, drawn by a second collector: OTX Passive DNS's `subdomain` where crt.sh already drew one | `recorded`, and OTX's plugin is added to `corroborated_by`. The same plugin running again adds nothing, and nor does the AI agent agreeing. |
| A plugin's link between two nodes already in the graph, stating a shared value: Shared-Attribute Clustering's `shared nameserver: …` | `unassessed` |
| An AI agent's link that nothing checked and whose ends do not name each other | `unassessed` |
| An AI agent's link that the check judged | From its verdict (step 4) |
| A link you draw yourself | `asserted` |

`recorded` says a tool recorded the link, not that anyone verified it. A grade records what was known
when the link was written: it does not change by itself as the graph grows, only when the link is
written again with new evidence, by a person, or by a re-verification you apply. All six grades are
in [Evidence grades](../properties.md#evidence-grades).

### 7. Read the canvas by grade {#canvas}

Each grade has its own line on the canvas: `assessed` a plain line, `asserted` long dashes,
`recorded` shorter dashes, `circumstantial` short dashes, `unassessed` dots, and `contested` a
heavier amber line. The legend's **Evidence** key lists the grades in the project with a count; click
one to hide its links ([Legend](../canvas.md#legend)), or untick it under **Filter → Evidence**.

To see what a conclusion rests on, ask the AI agent, for example: *Which links does the connection
between kestrune-redelivery.example and kestrune-parcel-fee.test rest on, weakest first?* The agent
reads each link's grade, who gave it, who wrote its label and who corroborated it, and is told that a
conclusion is as strong as its weakest link. Infrastructure pivoting's starter **Check a link the
project already draws** audits one link against its evidence.

### 8. Ask again with Re-verify {#re-verify}

Click a link and press **Re-verify** in its Properties panel
([Re-verify](../properties.md#re-verify)). It needs the model key set in the AI agent panel, and it
writes nothing: the verdict arrives as a change set named *Re-verification*, opens in the Review
dialog and keeps a row in Tasks. Its one row is an **Update** of the link. The pane shows
`relation`, `relation_written_by` and `re_verified`, such as `supported — still valid`, and the
**Check** column and the **Independent check** pane give the reasoning.

Applying it sets the grade: *still valid* `assessed`, *inconclusive* `circumstantial`, *stale*
`contested`. A re-verification that could not run never lowers the grade, and none proposes deleting
the link. The arrow beside the button holds **Re-collect with the agent**, which opens a new
conversation with a request to collect fresh evidence for the link, filled in and not sent.

## Where it ends {#where-it-ends}

The review ends when every row is applied or left out on purpose. The reading ends when you can say,
for each link a conclusion rests on, how far its evidence goes and what would raise it. For a report,
a node's **Document** view lists its links grouped by label with how many carry each grade, and
**Copy as Markdown** copies the page
([Document and JSON views](../properties.md#document-and-json-views)).

## Pitfalls {#pitfalls}

- **`recorded` is not `verified`.** A DNS answer recorded today says nothing about who controls the
  domain.
- **`asserted` is a judgement, not a measurement.** It says that a person vouched for the link, and
  nothing about whether anything checked it.
- **No grade is a gate.** Nothing stops you from editing, deleting or building on a link, whatever
  its grade, and a `contested` link stays until a person removes it.
- **Inconclusive is not false.** A dead page or one failed lookup is not staleness, and the check is
  told so.
- **"No changes" can mean "could not check".** A run whose hosts did not answer ends with a yellow
  toast that names them.
- **A partly applied run stays applied.** **Discard all** after a partial apply throws away only what
  is still staged; the run is recorded as applied.
- **Label and grade are separate.** Rewording a link does not change who graded it, and grading it
  does not make the words yours.

## Next / See also

- [The Properties panel](../properties.md#a-link) — every field of a link's panel
- [Running plugins](../running-plugins.md#reviewing-a-runs-changes) — the Review dialog in full
- [Tasks & runs](../tasks.md#review-and-apply) — the apply mode and the independent check
