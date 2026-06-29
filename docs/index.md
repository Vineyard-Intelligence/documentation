---
title: VINEYARD.RUN Documentation
hide:
  - navigation
  - toc
---

<div class="vy-hero" markdown>

# Build, share, and run Plugin Packs & Type Packs for VINEYARD.RUN

Plugins (JavaScript) and Type Packs (JSON) are distributed over a
metadata-only GitHub registry, but they **execute on the client**.

<div class="vy-hero-cta" markdown>
[Browse the marketplace](marketplace.md){ .md-button .md-button--primary }
[Read the user guide](guide/index.md){ .md-button }
[Build a plugin](develop/quickstart.md){ .md-button }
</div>
</div>

## Start here

<div class="vy-cardgrid" markdown>

<div class="vy-card" markdown>
### :material-account: For users
Browse the marketplace, install plugins and Type Packs, run them on your graph, and
manage runs. → [User Guide](guide/index.md)
</div>

<div class="vy-card" markdown>
### :material-code-braces: For developers
Write a plugin with the SDK, define a Type Pack, declare scopes, and publish to the
registry. → [Developer Guide](develop/quickstart.md)
</div>

<div class="vy-card" markdown>
### :material-file-document: Reference
Field-by-field schemas for the plugin manifest, Type Packs, and registry entries, plus
the scopes catalog. → [Reference](reference/index.md)
</div>

</div>

## The mental model

```mermaid
flowchart LR
    A[Author repo on GitHub] -->|PR: one metadata entry| B[(Registry<br/>metadata only)]
    B -->|fetch reference| C[Marketplace<br/>community.vineyard.run]
    C -->|install reference| D[Vineyard app]
    D -->|fetch bundle @ pinned ref| A
    D -->|run in Web Worker sandbox| E[Your graph]
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
