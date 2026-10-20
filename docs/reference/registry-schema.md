# Registry entry schemas

Reference for the **registry entry** schemas — one row in `community-pluginpacks.json`, one row in `community-typepacks.json`, and one row in `community-skillpacks.json`. Each entry is a lean, denormalized pointer that lets the static browser render a card without fetching every upstream manifest. This page covers all three.

The schemas live at:

- [`schemas/registry-plugin-entry.schema.json`](https://registry.vineyard.run/schemas/registry-plugin-entry.schema.json)
- [`schemas/registry-typepack-entry.schema.json`](https://registry.vineyard.run/schemas/registry-typepack-entry.schema.json)
- [`schemas/registry-skillpack-entry.schema.json`](https://registry.vineyard.run/schemas/registry-skillpack-entry.schema.json) 

## What a registry entry is (and is not)

The registry repo (`Vineyard-Intelligence/registry`) stores **path and metadata only — no code, no copies**. The full [plugin manifest](plugin-schema.md) or [Type Pack](typepack-schema.md) JSON, the README, and the bundle all stay in the **author repo** at the pinned `ref`.

A registry entry is therefore a **catalog projection**: enough fields to search, filter, and badge an item in the browser, plus the `repo@ref/path` pointer that the detail page uses to hydrate the real thing.

!!! info "Denormalized — the manifest is the source of truth"
    `platforms`, `scopes_summary`, `services`, `plugin_count`, `desktop_only`, `icon`, `type_count` and `section_count` are **derived** fields. You write them in the entry, and CI recomputes each one from the pinned document and rejects the entry if any disagree. `categories` and `applies_to` are also projections of the document, but CI does not recompute them, so copy them from your document yourself. `typepacks` and `requires` are not derived: you declare them, and CI checks them. They can drift from the live manifest between updates. When in doubt, the manifest wins.

## Plugin entry

A row in `community-pluginpacks.json`. The schema sets `additionalProperties: false`, so unknown keys are rejected by registry CI.

**Required:** `identifier`, `content_type`, `name`, `author`, `description`, `repo`, `ref`, `path`.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `identifier` | string | yes | Reverse-DNS primary key, `^(?:[a-z0-9]+(?:-[a-z0-9]+)*\.){2,}(?:plugins|pluginpacks)\.[a-z0-9_]+$` (`plugins.*` = single plugin, `pluginpacks.*` = bundle). Equals `manifest.identifier`. Unique across the **whole** registry (all three catalogs). |
| `content_type` | string | yes | `vineyard:plugin` (a single plugin) or `vineyard:pluginpack` (a bundle: one file → many plugins). |
| `name` | string | yes | Display name, 1–128 chars. |
| `author` | string | yes | Author handle, matched against `verified-authors.json`. |
| `description` | string | yes | ≤250 chars, sentence case, ends with a period, no emoji. |
| `repo` | string | yes | `owner/name` GitHub path (`^[^/]+/[^/]+$`). The **only** pointer to code. |
| `ref` | string | yes | **Immutable commit SHA** (40-hex SHA-1 or 64-hex SHA-256), captured at PR time. **Tags and branches are rejected** (both re-pointable). `version` carries the human-readable release. |
| `path` | string | yes | Path to `manifest.json` within `repo@ref`. |
| `version` | string | no | SemVer mirror of `manifest.version` at this `ref` (`^\d+\.\d+\.\d+(?:[-+].+)?$`). |
| `platforms` | string[] | no | **Derived**: the platform keys the pack's plugins declare under `platforms` (`web`, `desktop`), without `primary`; unique. The schema's enum also allows `web-proxy`, but CI never derives it, so an entry that lists it fails. |
| `scopes_summary` | object | no | **Derived** filter facets (see below). |
| `scopes_summary.network` | boolean | no | `true` if `scopes.network` is non-empty **or** the plugin declares `web_probe`. |
| `scopes_summary.graph_write` | boolean | no | `true` if any `node:`/`edge:` create/update/delete verb is present. |
| `scopes_summary.secret_config` | boolean | no | `true` if any `scopes.config` entry has `secret: true` (a key the analyst must supply). |
| `plugin_count` | integer | no | **Derived**: number of plugins bundled when the `identifier` names a **pack** (one file → many plugins). Omitted or `1` for a single-plugin entry. The card installs all contained plugins together. Minimum `1`. |
| `desktop_only` | string | no | **Derived**: `all` when every plugin in the pack runs only on the desktop app, `some` when at least one but not all do. Omitted when none do. |
| `icon` | string | no | **Derived**: the manifest's `icon` when it is a kebab-case [lucide](https://lucide.dev/icons/) icon name. Omitted otherwise. |
| `typepacks` | string[] | no | **Declared** by you and checked by CI: the Type Pack identifiers the pack's plugins consume/produce (`io.consumes`/`io.produces`), unique. Every type an `io` entry references must come from a Type Pack listed here, and each listed pack must be in the catalog. The marketplace offers these for co-install the same way a skillpack's `requires` offers pluginpacks; a plugin that writes a type from a pack the project never installed fails at node-create time. |
| `services` | string[] | no | **Derived**: Vineyard services the pack's plugins call by name (`rdap`, `telegram`). Its own field, not a `scopes_summary` flag. See [scopes](scopes.md#services). |
| `thumbnail_url` | string (uri) | no | Optional card icon. |
| `verified` | boolean | no | `true` only when the identifier's namespace is claimed in `verified-authors.json` by the handle in `author`. Set by CI, **not self-asserted**. Default `false`. |
| `status` | object | no | Present only on a **delisted** pack: `{ state: "deprecated" | "withdrawn", reason, since, replacement? }`. The row stays in the catalog; deleting it would signal nothing to projects that already installed the pack. `deprecated` still loads and warns; `withdrawn` is refused at install and dropped at load. See [Publishing → Taking a pack down](../develop/publishing.md#taking-a-pack-down). |

### Example plugin row

This is the real Chaos reference pack — a single `identifier` that bundles six graph-manipulation plugins (Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node), so `plugin_count` is `6`.

```json
{
  "identifier": "run.vineyard.pluginpacks.chaos",
  "content_type": "vineyard:pluginpack",
  "name": "Chaos Reference Pack",
  "author": "VINEYARD",
  "description": "Six graph-manipulation plugins for demos and validation.",
  "repo": "Vineyard-Intelligence/pluginpack-chaos",
  "ref": "1ec7b4cab527ef6aa4d683330dc6191e4c21dbd8",
  "path": "plugins/chaos-pack.manifest.json",
  "version": "1.0.3",
  "platforms": ["web"],
  "scopes_summary": { "network": false, "graph_write": true, "secret_config": false },
  "plugin_count": 6,
  "icon": "boxes",
  "typepacks": [],
  "verified": true
}
```

!!! example "Reading the facets"
    `scopes_summary.graph_write` is `true` because the Chaos plugins mutate the graph (deleting and reshuffling nodes/edges). `network` is `false` — these plugins run entirely client-side and call no endpoints — so the card shows a "graph-write" facet and **no** network badge. The browser surfaces these as filters.

## Type Pack entry

A row in `community-typepacks.json`, symmetric with the plugin entry. Type Packs carry **no scopes** — no code executes — so the `scopes_summary` facet is replaced by `categories`, which drives the category filter. Again `additionalProperties: false`.

**Required:** `identifier`, `content_type`, `name`, `author`, `description`, `repo`, `ref`, `path`.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `identifier` | string | yes | Reverse-DNS primary key, `^(?:[a-z0-9]+(?:-[a-z0-9]+)*\.){2,}typepacks\.[a-z0-9]+(?:[._-][a-z0-9]+)*$`. Equals `typepack.identifier`. |
| `content_type` | string | yes | Constant `vineyard:typepack`. |
| `name` | string | yes | Display name, 1–128 chars. |
| `author` | string | yes | Author handle. |
| `description` | string | yes | ≤250 chars (same prose rules as the plugin entry). |
| `repo` | string | yes | `owner/name` GitHub path. |
| `ref` | string | yes | **Immutable commit SHA** (40-hex SHA-1 or 64-hex SHA-256), captured at PR time. Tags and branches are rejected (both re-pointable). `version` carries the human-readable release. |
| `path` | string | yes | Path to the Type Pack JSON within `repo@ref`. |
| `version` | string | no | SemVer (`^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$`). |
| `categories` | string[] | no | **Derived**: distinct `types[].category` values (each `^[a-z][a-z0-9_]*$`, unique). Drives the category facet. |
| `type_count` | integer | no | **Derived**: `types[].length`. Minimum `1`. |
| `icon` | string | no | **Derived**: the first type's `icon` when it is a kebab-case [lucide](https://lucide.dev/icons/) icon name. Omitted otherwise. |
| `thumbnail_url` | string (uri) | no | Optional card icon. |
| `verified` | boolean | no | Same as the plugin entry — CI-set mirror of `verified-authors.json`. Default `false`. |
| `status` | object | no | Present only on a **delisted** pack: `{ state: "deprecated" | "withdrawn", reason, since, replacement? }`. The row stays in the catalog; deleting it would signal nothing to projects that already installed the pack. `deprecated` still loads and warns; `withdrawn` is refused at install and dropped at load. See [Publishing → Taking a pack down](../develop/publishing.md#taking-a-pack-down). |

### Example Type Pack row

The real Infrastructure base pack, defining fifteen infrastructure and web entity types:

```json
{
  "identifier": "run.vineyard.typepacks.infrastructure",
  "content_type": "vineyard:typepack",
  "name": "Infrastructure",
  "author": "VINEYARD",
  "description": "Network-infrastructure and web OSINT entities (IPs, domains, URLs, hosts, ASNs, netblocks, DNS/WHOIS records, TLS certificates, SSH host keys, technologies, web fingerprints and tracking/ad-account identifiers) and their relationships.",
  "repo": "Vineyard-Intelligence/typepack-basic",
  "ref": "2e6dc6f762709dbc8a460a5ad5ad2417c86fe6cb",
  "path": "typepacks/infrastructure.json",
  "version": "4.0.0",
  "categories": ["infrastructure", "web"],
  "type_count": 15,
  "icon": "network",
  "verified": true
}
```

The companion Threat pack is the same shape with `categories: ["threat"]` and `type_count: 10`.

## Skill Pack entry

A row in `community-skillpacks.json`, the same pointer shape as the two above. A Skill Pack is text, so it carries no scopes; its only dependencies are the Plugin Packs in `requires`. Again `additionalProperties: false`.

**Required:** `identifier`, `content_type`, `name`, `author`, `description`, `repo`, `ref`, `path`.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `identifier` | string | yes | Reverse-DNS primary key, `^(?:[a-z0-9]+(?:-[a-z0-9]+)*\.){2,}skillpacks\.[a-z0-9_]+$`. Equals the skill document's `identifier`. |
| `content_type` | string | yes | Constant `vineyard:skillpack`. |
| `name`, `author`, `description`, `repo`, `ref`, `path` | string | yes | Same rules as the plugin entry; `path` is the skill JSON within `repo@ref`. |
| `version` | string | no | SemVer mirror of the document's `version` at this `ref`. |
| `applies_to` | string[] | no | **Derived**: node types (`category.name`) the playbook is about, shown in the detail view. Not recomputed by CI — copy it from your document. |
| `section_count` | integer | no | **Derived**: number of `sections` in the document. Recomputed by CI. Minimum `0`. |
| `requires` | string[] | no | Plugin Pack identifiers the playbook's steps call. Each must be a live pack in the catalog. The marketplace offers them for co-install. |
| `thumbnail_url` | string (uri) | no | Optional card icon. |
| `verified` | boolean | no | Same as the plugin entry. Default `false`. |
| `status` | object | no | Same as the plugin entry. |

The real row for Account & identity pivoting is shown on [Skill Packs](../develop/skillpacks.md#publishing-to-the-registry).

## How entries are validated and merged

Submission is a fork-and-PR that adds one `packs/<identifier>.json` file — the catalogs are generated from it — gated by blocking CI checks plus a human merge. CI checks the entry against its schema, that `ref` is an immutable commit SHA, that the pinned document matches the entry (`identifier`, `content_type`, `version` and the derived fields), that a Plugin Pack's bundle declares the manifest's version and licence, and that declared dependencies and typeRefs resolve. It does not validate the pinned document against its own schema. See [What CI enforces](../develop/publishing.md#what-ci-enforces) for the full list, and [Publishing](../develop/publishing.md) for the walkthrough.

## Next / See also

- [Plugin manifest schema](plugin-schema.md) — the upstream document a plugin entry points to.
- [Type Pack schema](typepack-schema.md) — the upstream document a Type Pack entry points to.
- [Scopes reference](scopes.md) — the verbs behind `scopes_summary`.
- [Publishing](../develop/publishing.md) — submit an entry to the registry.
- [Updates](../develop/updates.md) — how a new version becomes an "Update available".
- [Marketplace browser](../marketplace.md) — the static site these entries feed.
