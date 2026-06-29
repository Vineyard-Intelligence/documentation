# Publishing to the registry

Publishing a Plugin Pack or Type Pack to the public Vineyard marketplace is a single pull request against the registry repo. You append **one** metadata entry, the `VineyardReviewBot` validates it, a human merges it, and your entry goes live on the next registry fetch — no app release required.

## The registry repo holds metadata only

Submissions go to **`vineyard-run/vineyard-releases`**. The repo carries *pointers and derived facets*, never code and never copies of your manifest or bundle. Your full manifest/Type Pack JSON, README, screenshots, and bundle all stay in **your** author repo at the pinned `ref`; the marketplace detail page hydrates from there lazily.

| File | Role |
|---|---|
| `community-plugins.json` | One lean entry per plugin (or pack): identifier, name, author, description, repo, ref, path, version, platforms, `scopes_summary`, `verified`. |
| `community-typepacks.json` | Symmetric for Type Packs; carries `categories`/`type_count`/`edge_count` instead of scopes (no code executes). |
| `community-plugin-stats.json` / `community-typepack-stats.json` | Install/activation counts — maintained by Vineyard infra, **not** the submitter. |
| `deprecation.json` / `removed.json` | Withdrawn versions / delisted entries. |
| `verified-authors.json` | Source of the "verified" badge. CI mirrors membership into the entry — it is never self-asserted. |
| `schemas/` | The published meta-schemas the CI bot validates entries against. |

You only ever edit **one** of the two catalog files in a submission, and you only append a single entry.

## Submission workflow

=== "Steps"

    1. **Fork** `vineyard-run/vineyard-releases`.
    2. **Pin an immutable `ref`** in your author repo — a 40-character commit SHA or an *annotated* tag. Branches are rejected.
    3. **Append one entry** to `community-plugins.json` (Plugin Packs) or `community-typepacks.json` (Type Packs). Do not edit the stats, deprecation, removed, or verified-authors files — those are not submitter-owned.
    4. **Open a PR.** `VineyardReviewBot` posts its validation result as a status check.
    5. **Fix any blocking failures**, then wait for a human merge.
    6. After green CI + merge, the entry is **live on the next registry fetch** — clients pull the static JSON; there is no coupled app release.

=== "Notes"

    - The `identifier` in the entry must equal `manifest.identifier` (or `typepack.identifier`) and uses the reverse-DNS form `run.vineyard.plugins.*` / `run.vineyard.typepacks.*`.
    - `ref` is the only thing pinning your code. Because it is immutable, publishing a new version means appending a new entry at a new `ref` — see [Updates](updates.md).
    - Derived fields (`platforms`, `scopes_summary`, `categories`, `type_count`, …) are projections of the full manifest/Type Pack so the browse page renders without fetching every manifest.

## What the bot validates

The `VineyardReviewBot` has two tiers. **Blocking** checks must pass before a human can merge. **Advisory** checks are surfaced as notes but never block.

### Blocking (must pass)

- **Registry-entry schema.** The entry validates against `schemas/registry-plugin-entry` or `schemas/registry-typepack-entry`.
- **Identifier uniqueness across BOTH catalogs.** An identifier cannot collide with any existing Plugin Pack *or* Type Pack entry.
- **Immutable `ref`.** Must be a 40-character commit SHA or an annotated tag (which must equal `manifest.version`). Mutable branch refs are rejected.
- **Full manifest/Type Pack validates** against the published plugin/Type Pack schema at `repo@ref/path` — not just the lean registry row.
- **`web-proxy` ⇒ exactly one `network` endpoint, and it equals `proxy_endpoint`.** A web-proxy plugin may declare only its single proxy host. See [scopes](../reference/scopes.md).
- **No secret-looking parameter keys.** Param keys that look like credentials (api_key, token, secret, …) are rejected; secrets belong in `scopes.config` with `secret: true` (desktop-only), not in user-facing params.
- **Type Pack cross-field invariants:** `label_property` exists and is **non-optional**; every `enum`/`default` matches its property type; each edge type's `from`/`to` resolves to a declared node type.

### Advisory (never blocking)

- Use of `node:delete` / `edge:delete` (graph-destructive verbs).
- `net + node:read` combinations (data leaves the graph + network egress).
- Minified-only bundles (no readable source to inspect).

!!! tip "Advisory ≠ rejection"
    The Chaos pack — Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node — leans entirely on `node:delete`/`edge:delete`. It still publishes fine; those flags are *informational*.

## Sample registry entries

A **Plugin Pack** entry appended to `community-plugins.json`. Note `plugin_count` marks a pack with multiple plugins (one file → many plugins) so the marketplace shows one card and installs all contained plugins together:

```json
{
  "identifier": "run.vineyard.plugins.chaos",
  "content_type": "vineyard:plugin",
  "name": "Chaos Reference Pack",
  "author": "vineyard-run",
  "description": "A bundle of 6 graph-manipulation plugins for demo/validation: Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node. Installing once adds all 6 together.",
  "repo": "vineyard-run/chaos-pack",
  "ref": "v1.0.0",
  "path": "plugins/chaos-pack.manifest.json",
  "version": "1.0.0",
  "platforms": ["web"],
  "scopes_summary": { "network": false, "graph_write": true, "publish": false, "secret_config": false },
  "plugin_count": 6,
  "compat": { "min_app_version": "1.0.0" },
  "verified": true
}
```

A Type Pack entry appended to `community-typepacks.json` (no scopes; `categories`/`type_count`/`edge_count` drive the facets):

```json
{
  "identifier": "run.vineyard.typepacks.infrastructure",
  "content_type": "vineyard:typepack",
  "name": "Infrastructure",
  "author": "vineyard-run",
  "description": "A base Type Pack defining network-infrastructure entities (IP address, domain, URL, autonomous system, certificate).",
  "repo": "vineyard-run/typepacks",
  "ref": "v1.0.0",
  "path": "typepacks/infrastructure.json",
  "version": "1.0.0",
  "categories": ["infrastructure"],
  "type_count": 5,
  "edge_count": 0,
  "verified": true
}
```

!!! note "Field reference"
    The required fields are `identifier`, `content_type`, `name`, `author`, `description`, `repo`, `ref`, `path`. `content_type` is the literal `vineyard:plugin` or `vineyard:typepack`. The full field list and constraints live in [registry-schema](../reference/registry-schema.md).

## After merge

There is no build step on Vineyard's side and no app version bump. Once the PR is merged, the static catalog JSON is updated, and the next time a client fetches the registry your entry appears in the browser with its derived badges. Install/activation counts begin accruing in the stats files (maintained by Vineyard infra). The `verified` badge follows your membership in `verified-authors.json`, set by CI.

## Next / See also

- [Distribution](distribution.md) — how the bundle is packaged and fetched (`distribution.kind`: zip asset / git tree / inline).
- [Updates](updates.md) — shipping a new version by appending a new immutable `ref`.
- [registry-schema](../reference/registry-schema.md) — full field-by-field schema reference.
- [scopes](../reference/scopes.md) — scope strings and the web-proxy endpoint rule.
- [Marketplace](../marketplace.md) — the static marketplace browser your entry lands in.
