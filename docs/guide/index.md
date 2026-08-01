# User Guide

VINEYARD is a client-side graph-analysis tool. You build a graph of
entities and relationships, then extend the app with **packs** that you browse,
install, and run entirely in your own session.

## What packs give you

There are three kinds of pack:

- **Plugin Packs** — JavaScript actions that read, create, or modify your graph's
  nodes and edges (and, with permission, call the network).
- **Type Packs** — JSON definitions of the **entity types** and **edge types** your
  graph understands, giving nodes their properties, validation rules, icons, and colors.
- **Skill Packs** — investigation playbooks the AI agent can follow when working on your
  case. Text only — no code, no permissions.

## The mental model

You **browse the Marketplace** for a pack, **install** that reference
into the app, and then the app **runs it client-side on your graph**. The Vineyard
server only serves metadata pointers — it never executes plugin code, never stores
plugin bytes, and by default never records your runs. Each run is **ephemeral**
unless you choose to save it, much like a temporary chat.

## Where to go next

<div class="vy-cardgrid" markdown>

<div class="vy-card" markdown>
### :material-rocket-launch: Getting started
Set up your graph and run your first plugin in a few minutes.
→ [Getting started](getting-started.md)
</div>

<div class="vy-card" markdown>
### :material-download: Browse & install
Find packs, review what they can access, and install them.
→ [Browse & install](installing.md)
</div>

<div class="vy-card" markdown>
### :material-play: Running plugins
Launch plugins from a node's right-click menu or the global Run menu.
→ [Running plugins](running-plugins.md)
</div>

<div class="vy-card" markdown>
### :material-shape: Working with Type Packs
Add entity and edge types so your graph recognizes new kinds of data.
→ [Working with Type Packs](typepacks.md)
</div>

<div class="vy-card" markdown>
### :material-book-open-variant: Working with Skill Packs
Give the AI agent investigation playbooks to follow on your case.
→ [Working with Skill Packs](skillpacks.md)
</div>

<div class="vy-card" markdown>
### :material-graph: The canvas
Explore, lay out, and style your graph of nodes and edges.
→ [The canvas](canvas.md)
</div>

<div class="vy-card" markdown>
### :material-progress-clock: Tasks & runs
Track in-progress runs, cancel them, and decide what to save.
→ [Tasks &amp; runs](tasks.md)
</div>

</div>

## Next / See also

- [Browse the Marketplace](../marketplace.md) — the static marketplace browser
- [Developer documentation](../develop/index.md) — build and publish your own packs
- [Reference](../reference/index.md) — schemas and scopes
