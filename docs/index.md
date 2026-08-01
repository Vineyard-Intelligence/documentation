---
title: VINEYARD Documentation
hide:
  - navigation
  - toc
---

<div class="vy-hero" markdown>

# Build, share, and run packs for VINEYARD

Plugin Packs (JavaScript), Type Packs (JSON), and Skill Packs (investigation playbooks)
are distributed over a metadata-only GitHub registry, but they **run on the client**.

<div class="vy-hero-cta" markdown>
[Browse the marketplace](marketplace.md){ .md-button .md-button--primary }
[Read the user guide](guide/index.md){ .md-button }
[Build a pack](develop/index.md){ .md-button }
</div>
</div>

## Start here

<div class="vy-cardgrid" markdown>

<div class="vy-card" markdown>
### :material-account: For users
Browse the marketplace, install packs, run plugins on your graph, and manage runs.
→ [User Guide](guide/index.md)
</div>

<div class="vy-card" markdown>
### :material-code-braces: For developers
Author a Plugin Pack, Type Pack, or Skill Pack and publish it to the registry.
→ [Developer Guide](develop/index.md)
</div>

<div class="vy-card" markdown>
### :material-file-document: Reference
Field-by-field schemas for pack manifests and registry entries, plus the scopes catalog.
→ [Reference](reference/index.md)
</div>

</div>

## The mental model

```mermaid
flowchart LR
    A[Author repo on GitHub] -->|PR: one metadata entry| B[(Registry<br/>metadata only)]
    B -->|fetch reference| C[Marketplace<br/>community.vineyard.run]
    C -->|install reference| D[Vineyard app]
    D -->|fetch pack @ pinned ref| A
    D -->|run on the client| E[Your graph]
    style B fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    style D fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
```

## Key principles

- **Client-side execution** — the server never executes plugin code.
- **Ephemeral by default** — a run is not written to the database unless you opt in to save.
- **Least authority** — untrusted plugin JS runs in a Web Worker sandbox with only the
  scopes you approve, reached through a host bridge that holds a one-time, project-scoped,
  write-capped token — never your account token.
- **Distribution = GitHub + a metadata-only registry** — pointers, never code.

See [Architecture &amp; principles](develop/architecture.md) for the full design.
