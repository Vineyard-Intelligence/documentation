# Registry entry schemas

Reference for the two **registry entry** schemas — one row in `community-plugins.json` and one row in `community-typepacks.json`. Each entry is a lean, denormalized pointer that lets the static browser render a card without fetching every upstream manifest.

The schemas live at:

- [`schemas/registry-plugin-entry.schema.json`](https://vineyard.run/schemas/registry/plugin-entry/1.0.0.json)
- [`schemas/registry-typepack-entry.schema.json`](https://vineyard.run/schemas/registry/typepack-entry/1.0.0.json)

## What a registry entry is (and is not)

The registry repo (`vineyard-run/vineyard-releases`) stores **path and metadata only — no code, no copies**. The full [plugin manifest](plugin-schema.md) or [Type Pack](typepack-schema.md) JSON, the README, and the bundle all stay in the **author repo** at the pinned `ref`.

A registry entry is therefore a **catalog projection**: enough fields to search, filter, and badge an item in the browser, plus the `repo@ref/path` pointer that the detail page uses to hydrate the real thing.

!!! info "Denormalized — the manifest is the source of truth"
    `platforms`, `scopes_summary`, `categories`, `type_count`, and `edge_count` are **derived** fields, computed from the upstream manifest at merge time. They can drift from the live manifest between updates. The marketplace **detail page must re-derive these from the live manifest** at `repo@ref/path`; the catalog values exist only so the browse grid renders from a single JSON fetch. When in doubt, the manifest wins.

## Plugin entry

A row in `community-plugins.json`. The schema sets `additionalProperties: false`, so unknown keys are rejected by the review bot.

**Required:** `identifier`, `content_type`, `name`, `author`, `description`, `repo`, `ref`, `path`.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `identifier` | string | yes | Reverse-DNS primary key, `^run\.vineyard\.(?:plugins\|pluginpacks)\.[a-z0-9_]+$` (`plugins.*` = single plugin, `pluginpacks.*` = bundle). Equals `manifest.identifier`. Unique across the **whole** registry (both catalogs). |
| `content_type` | string | yes | `vineyard:plugin` (a single plugin) or `vineyard:pluginpack` (a bundle: one file → many plugins). |
| `name` | string | yes | Display name, 1–128 chars. |
| `author` | string | yes | Author handle, matched against `verified-authors.json`. |
| `description` | string | yes | ≤250 chars, sentence case, ends with a period, no emoji. |
| `repo` | string | yes | `owner/name` GitHub path (`^[^/]+/[^/]+$`). The **only** pointer to code. |
| `ref` | string | yes | **Immutable commit SHA** (40-hex SHA-1 or 64-hex SHA-256), captured at PR time. **Tags and branches are rejected** (both re-pointable) — pin the exact reviewed commit so the catalog can never serve different code. `version` carries the human-readable release. |
| `path` | string | yes | Path to `manifest.json` within `repo@ref`. |
| `version` | string | no | SemVer mirror of `manifest.version` at this `ref` (`^\d+\.\d+\.\d+(?:[-+].+)?$`). |
| `platforms` | string[] | no | **Derived** badge set from `platforms.{web,desktop}` + `web.runtime`. Items: `web`, `web-proxy`, `desktop` (unique). |
| `scopes_summary` | object | no | **Derived** filter facets (see below). |
| `scopes_summary.network` | boolean | no | `true` if `scopes.network` is non-empty. |
| `scopes_summary.graph_write` | boolean | no | `true` if any `node:`/`edge:` create/update/delete verb is present. |
| `scopes_summary.publish` | boolean | no | `true` if `scopes.publish` is non-empty (e.g. `message:post`). |
| `scopes_summary.secret_config` | boolean | no | `true` if any `scopes.config` entry has `secret: true` (implies a desktop-only key). |
| `plugin_count` | integer | no | **Derived**: number of plugins bundled when the `identifier` names a **pack** (one file → many plugins). Omitted or `1` for a single-plugin entry. The card installs all contained plugins together. Minimum `1`. |
| `compat` | object | no | Runtime compatibility (the `versions.json` analog). |
| `compat.min_app_version` | string | no | Oldest Vineyard runtime this `ref` supports (`^\d+\.\d+\.\d+$`). Gates the version the updater will offer. |
| `thumbnail_url` | string (uri) | no | Optional card icon. |
| `verified` | boolean | no | Mirror of `verified-authors.json` membership. Set by CI, **not self-asserted**. Default `false`. |

### Example plugin row

This is the real Chaos reference pack — a single `identifier` that bundles six graph-manipulation plugins (Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node), so `plugin_count` is `6`.

```json
{
  "identifier": "run.vineyard.pluginpacks.chaos",
  "content_type": "vineyard:pluginpack",
  "name": "Chaos Reference Pack",
  "author": "vineyard-run",
  "description": "A bundle of 6 graph-manipulation plugins for demo/validation: Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node. Installing once adds all 6 together.",
  "repo": "vineyard-run/chaos-pack",
  "ref": "a62f42b507e495fda884289fce5316915475d4f5",
  "path": "plugins/chaos-pack.manifest.json",
  "version": "1.0.0",
  "platforms": ["web"],
  "scopes_summary": { "network": false, "graph_write": true, "publish": false, "secret_config": false },
  "plugin_count": 6,
  "compat": { "min_app_version": "1.0.0" },
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
| `identifier` | string | yes | Reverse-DNS primary key, `^run\.vineyard\.typepacks\.[a-z0-9]+(?:[._-][a-z0-9]+)*$`. Equals `typepack.identifier`. |
| `content_type` | string | yes | Constant `vineyard:typepack`. |
| `name` | string | yes | Display name, 1–128 chars. |
| `author` | string | yes | Author handle. |
| `description` | string | yes | ≤250 chars (same prose rules as the plugin entry). |
| `repo` | string | yes | `owner/name` GitHub path. |
| `ref` | string | yes | **Immutable**: commit SHA or annotated tag, equal to `typepack.version`. |
| `path` | string | yes | Path to the Type Pack JSON within `repo@ref` (equals `distribution.path`). |
| `version` | string | no | SemVer (`^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$`). |
| `categories` | string[] | no | **Derived**: distinct `types[].category` values (each `^[a-z][a-z0-9_]*$`, unique). Drives the category facet. |
| `type_count` | integer | no | **Derived**: `types[].length`. Minimum `1`. |
| `edge_count` | integer | no | **Derived**: `edge_types[].length`. Minimum `0`. |
| `thumbnail_url` | string (uri) | no | Optional card icon. |
| `verified` | boolean | no | Same as the plugin entry — CI-set mirror of `verified-authors.json`. Default `false`. |

### Example Type Pack row

The real Infrastructure base pack, defining five network-infrastructure entity types (e.g. the qualified type `infrastructure.ip_address`, plus domain, URL, autonomous system, and certificate):

```json
{
  "identifier": "run.vineyard.typepacks.infrastructure",
  "content_type": "vineyard:typepack",
  "name": "Infrastructure",
  "author": "vineyard-run",
  "description": "A base Type Pack defining network-infrastructure entities (IP address, domain, URL, autonomous system, certificate).",
  "repo": "vineyard-run/typepacks",
  "ref": "ef35dab0513de207dc32a54a42e7e93d57d15af3",
  "path": "typepacks/infrastructure.json",
  "version": "1.0.0",
  "categories": ["infrastructure"],
  "type_count": 5,
  "edge_count": 0,
  "verified": true
}
```

The companion Threat pack is the same shape with `categories: ["threat"]` and `type_count: 4`.

## How entries are validated and merged

Submission is a fork-and-PR that appends one entry to `vineyard-releases`, gated by blocking CI checks (schema, identifier uniqueness, immutable `ref`, upstream manifest validation) plus a human merge; see [Publishing](../develop/publishing.md) for the full walkthrough.

## Next / See also

- [Plugin manifest schema](plugin-schema.md) — the upstream document a plugin entry points to.
- [Type Pack schema](typepack-schema.md) — the upstream document a Type Pack entry points to.
- [Scopes reference](scopes.md) — the verbs behind `scopes_summary`.
- [Publishing](../develop/publishing.md) — submit an entry to the registry.
- [Updates](../develop/updates.md) — how a new `ref` becomes an "Update available".
- [Marketplace browser](../marketplace.md) — the static site these entries feed.
