# Reference

The normative reference for VINEYARD.RUN's plugin and Type Pack formats: the JSON-Schemas every document is validated against, the permission scope vocabulary, and the shared terminology used across the docs. Use these pages when you need exact field names, allowed values, and constraints rather than narrative guidance.

## Pages

| Page | What it documents |
|---|---|
| [Plugin manifest schema](plugin-schema.md) | The `vineyard:plugin` manifest — `identifier`, `version`, `platforms`, `io`, `scopes`, `lifecycle`, `distribution`. |
| [Type Pack schema](typepack-schema.md) | The `vineyard:typepack` document — type definitions in the qualified `category.name` form (e.g. `infrastructure.ip_address`). |
| [Registry entry schemas](registry-schema.md) | One row of `community-plugins.json` / `community-typepacks.json` — the metadata-only catalog rows the browser reads. |
| [Scopes](scopes.md) | The full permission vocabulary: `node:read`, `edge:delete`, `message:post`, and the rest. |

## Where the canonical artifacts live

The authoritative JSON-Schemas are not duplicated here — they live in the spec repository under `marketplace/schemas/`:

| File | Schema for |
|---|---|
| `schemas/plugin.schema.json` | A `vineyard:plugin` manifest. |
| `schemas/typepack.schema.json` | A `vineyard:typepack` document. |
| `schemas/registry-plugin-entry.schema.json` | One `community-plugins.json` row. |
| `schemas/registry-typepack-entry.schema.json` | One `community-typepacks.json` row. |

The reference pages summarize and explain these files; when the prose and the schema disagree, the schema in `marketplace/schemas/` wins.

## The Marketplace catalog the browser reads

The static [Marketplace browser](../marketplace.md) loads its catalog from `docs/data/registry.json` — a single metadata-only array combining Plugin Pack and Type Pack entries (each row carries a `type` of `pluginpack` or `typepack`). This file holds only listing metadata (`identifier`, `name`, `version`, `repo`, `ref`, `scopes_summary`, and similar); it never contains plugin bytes. Plugin Pack and Type Pack code is fetched from its GitHub source at install time, not from the registry.

## Naming, at a glance

- **Identifiers** are reverse-DNS: `run.vineyard.plugins.<name>`, `run.vineyard.pluginpacks.<name>`, and `run.vineyard.typepacks.<name>`.
- Every document carries a `content_type` discriminator: `vineyard:plugin`, `vineyard:pluginpack`, or `vineyard:typepack`.
- `version` is a SemVer string everywhere.
- Types are referenced in qualified `category.name` form (e.g. `infrastructure.ip_address`).

## Next / See also

- Conceptual orientation: [Developer guide](../develop/index.md) and [Architecture](../develop/architecture.md)
- Build something: [Plugin manifest](../develop/plugin-manifest.md) · [Type Packs](../develop/typepacks.md)
- Real examples: [Marketplace](../marketplace.md)
