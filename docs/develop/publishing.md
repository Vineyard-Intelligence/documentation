# Publishing to the registry

Publishing a Plugin Pack, Type Pack, or Skill Pack to the public Vineyard marketplace is a single pull request against the registry repo. You add **one file**, CI validates it, a human merges it, and your entry goes live on the next registry fetch — no app release required.

## The registry repo holds metadata only

Submissions go to **`Vineyard-Intelligence/registry`**. The repo carries *pointers and derived facets*, never code and never copies of your manifest or bundle. Your full manifest/Type Pack JSON, README, screenshots, and bundle all stay in **your** author repo at the pinned `ref`; the marketplace detail page hydrates from there lazily.

| Path | Role |
|---|---|
| `packs/<identifier>.json` | **The source, and the only thing a submission adds.** One file per pack, named for its `identifier`. |
| `registry/community-pluginpacks.json` | Published index of Plugin Packs — **generated**, one lean entry per pack: identifier, name, author, description, repo, ref, path, version, platforms, `scopes_summary`, `verified`. |
| `registry/community-typepacks.json` | Symmetric for Type Packs; carries `categories`/`type_count`/`edge_count` instead of scopes (no code executes). |
| `registry/community-skillpacks.json` | Symmetric for Skill Packs; carries `applies_to`/`section_count`/`requires` instead of scopes (text only, no code executes). |
| `schemas/` | The published meta-schemas CI validates entries against. |
| `verified-authors.json` | Who may show the verified badge, and the namespaces each owns. **Operator-owned** — a submission never edits it. |
| `SPEC.md` | The registry contract in full — entry format, the pinning rule, what CI enforces. |

!!! warning "Do not edit `registry/community-*.json`"
    Those three files are built from `packs/` by `scripts/build_registry.py` and rebuilt on merge, so a hand edit is overwritten. Your `content_type` decides which catalog your entry joins — you never pick one.

    One file per pack is what keeps concurrent submissions from conflicting, stops a diff from reaching another author's pinned `ref`, and turns a duplicate identifier into a path collision instead of a check somebody has to remember to run.

## Submission workflow

=== "Steps"

    1. **Fork** `Vineyard-Intelligence/registry`.
    2. **Pin an immutable `ref`** — the **commit SHA** of the release in your author repo. Tags and branches are mutable and rejected; resolve a tag/branch to its commit SHA with `python scripts/resolve_ref.py owner/repo <tag-or-branch>`.
    3. **Add one file**, `packs/<identifier>.json`, holding your entry. The filename must match the entry's `identifier` exactly.
    4. **Open a PR.** The `validate` workflow posts its result as a status check.
    5. **Fix any failures**, then wait for a human merge.
    6. After green CI + merge, the catalogs are rebuilt and your entry is **live on the next registry fetch** — clients pull the static JSON; there is no coupled app release.

=== "Notes"

    - The `identifier` in the entry must equal `manifest.identifier` (or `typepack.identifier`) and uses the reverse-DNS form `<your-namespace>.pluginpacks.*` / `.typepacks.*` / `.skillpacks.*` — see [the three content types](index.md#the-three-content-types).
    - `ref` is the only thing pinning your code. To ship a new version, edit your pack's file in place with the new `ref` and `version` — see [Updates](updates.md).
    - Derived fields (`platforms`, `scopes_summary`, `categories`, `type_count`, …) are projections of the full manifest/Type Pack so the browse page renders without fetching every manifest. CI recomputes every one of them from the pinned document and rejects the entry if they disagree — the permission badges on your card are a statement of fact, not a description.

## What CI enforces

Every check below is **blocking** — a pull request cannot merge until they all pass. They run in `.github/workflows/validate.yml`.

### The entry

- **Filename matches `identifier`, and `content_type` is one of the four known kinds.** (`build_registry.py`)
- **Registry-entry schema.** The entry validates against `schemas/registry-plugin-entry`, `registry-typepack-entry`, or `registry-skillpack-entry`. (`validate.py`)
- **Declared dependencies resolve.** A Skill Pack's `requires` and a Plugin Pack's `typepacks` must name packs that are in this catalog — the marketplace builds its co-install offer from those lists, so an identifier that resolves to nothing means the pack installs without the dependency it needs. A pack added in the *same* pull request counts, so a Type Pack and the plugin that uses it can land together. (`validate.py`)
- **Namespace and authorship.** A namespace listed in `verified-authors.json` may only be published under by its owner, and an author name listed there may only be worn inside its own namespaces — so neither `run.vineyard.*` nor `author: vineyard-run` can be claimed by anyone else. `verified` is operator-set: a submission that asserts it is rejected. (`validate.py`)

### The pin

- **Immutable `ref`.** Must be a **commit SHA** (40-hex or 64-hex). Tags and branches are mutable — re-pointable to other code after review — and are **rejected**. (`verify_pinned.py`)
- **The pinned document matches the entry.** The document at `repo@ref/path` is fetched and its `identifier`, `content_type`, and `version` must equal what your entry advertises. An entry whose metadata was bumped without re-pinning the `ref` fails here.
- **Every summary field is recomputed, not trusted.** `scopes_summary`, `platforms`, `plugin_count`, `section_count`, `type_count` and `edge_count` are derived from the pinned document and compared to what you wrote. `scopes_summary.network` is true when a member declares `network` **or** `web_probe` — the probe reaches an arbitrary host, so it is the broader egress, not a lesser one. This exists because the check did not: five live entries disagreed with their own manifests when it was added, three of them understating what the pack does.

### The type graph

Every `io.consumes` / `io.produces` entry is resolved against the Type Packs **published in this catalog**:

- the `category.name` must be a type some published Type Pack actually defines;
- the `typepack` field must name the pack that really defines it;
- that Type Pack must appear in your entry's `typepacks` list.

A Type Pack the registry does not carry is **not** acceptable — the install flow can only offer co-installs it can resolve, so an outside reference is broken for every user, not merely unverified. Publish the Type Pack first, then the plugin that uses it.

This one is blocking because its failure is invisible rather than loud. The run dialog builds the set of acceptable seed types from `consumes` and matches it against node types; a type nothing defines matches no node, so the plugin installs, is approved, and then never appears — with no error anywhere. A `produces` type nothing defines is worse in a quieter way: collection succeeds and leaves nodes with no icon, no colour and no label property. And because the install flow reads the entry's `typepacks` rather than your manifest, a Type Pack you use but did not declare simply does not get installed alongside.

### The bytes

`scan.py` fetches the JavaScript that will actually execute — every `platforms.web.entry` **and** `platforms.desktop.entry` in your pack — and rejects it for:

| Finding | Why |
|---|---|
| `eval(` / `new Function(` | A pack is a data transform over `ctx`; building code at run time defeats review of the bytes you published. |
| `import()` of anything but a complete literal | The measured exfiltration path: `import("https://…" + caseData)` carries case data past the egress allowlist in a URL. |
| `importScripts(` | Runs arbitrary script in the worker, bypassing the published bundle. |
| `localStorage` / `sessionStorage` / `indexedDB` / `document.cookie` | A Web Worker has none of these, so the code is dead or was written to run somewhere it should not. |
| Bare `fetch(` / `XMLHttpRequest` / `WebSocket` | Outbound requests must go through `ctx.net.fetch`, which enforces your manifest's endpoint allowlist. |

Comments and string contents are blanked before these rules run, so prose that happens to contain `fetch (` is not a finding.

A `native` or `subprocess` desktop runtime is rejected outright: it runs outside the JS sandbox, so the scanner cannot read it, and reporting "no findings" on the one artifact it never opened would be its worst failure mode.

Skill Pack text is scanned too, for instructions that try to countermand the agent's system prompt, route around analyst review, or solicit credentials.

### What a human weighs

Not automated, and not automatic rejections — a reviewer forms a judgment:

- Breadth of requested scopes against what the pack plausibly needs.
- `node:delete` / `edge:delete` usage (graph-destructive verbs).
- `network` + `node:read` together (data leaves the graph, and there is egress).
- Minified-only bundles — no readable source to inspect.
- Secret-looking `params` keys. Credentials belong in `scopes.config` with `secret: true`, never in user-facing params.

!!! tip "Destructive ≠ rejected"
    The Chaos pack — Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node — leans entirely on `node:delete`/`edge:delete`. It publishes fine.

## Sample submissions

A **Plugin Pack**, filed as `packs/run.vineyard.pluginpacks.chaos.json`. Note `plugin_count` marks a pack with multiple plugins (one file → many plugins) so the marketplace shows one card and installs all contained plugins together:

```json
{
  "identifier": "run.vineyard.pluginpacks.chaos",
  "content_type": "vineyard:pluginpack",
  "name": "Chaos Reference Pack",
  "author": "vineyard-run",
  "description": "A bundle of 6 graph-manipulation plugins for demo/validation: Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node. Installing once adds all 6 together.",
  "repo": "Vineyard-Intelligence/pluginpack-chaos",
  "ref": "7261823f654395204d9c79f7d597448d97d135f1",
  "path": "plugins/chaos-pack.manifest.json",
  "version": "1.0.0",
  "platforms": ["web"],
  "scopes_summary": { "network": false, "graph_write": true, "secret_config": false },
  "plugin_count": 6,
  "compat": { "min_app_version": "1.0.0" },
  "verified": true
}
```

A **Type Pack**, filed as `packs/run.vineyard.typepacks.infrastructure.json` (no scopes; `categories`/`type_count`/`edge_count` drive the facets):

```json
{
  "identifier": "run.vineyard.typepacks.infrastructure",
  "content_type": "vineyard:typepack",
  "name": "Infrastructure",
  "author": "vineyard-run",
  "description": "Network-infrastructure and web OSINT entities and their relationships.",
  "repo": "Vineyard-Intelligence/typepack-basic",
  "ref": "a78c53defbec417eeb8b9f50029c376926cb8c6d",
  "path": "typepacks/infrastructure.json",
  "version": "2.2.0",
  "categories": ["infrastructure", "web"],
  "type_count": 13,
  "edge_count": 11,
  "verified": true
}
```

!!! note "Field reference"
    The required fields are `identifier`, `content_type`, `name`, `author`, `description`, `repo`, `ref`, `path`. `content_type` is the literal `vineyard:plugin`, `vineyard:pluginpack`, `vineyard:typepack`, or `vineyard:skillpack`. The full field list and constraints live in [registry-schema](../reference/registry-schema.md).

## After merge

Merging triggers a rebuild of the three catalog files from `packs/`, committed straight back to `main` — GitHub Pages serves the branch directly, so the published bytes have to exist in the tree. There is no app version bump. The next time a client fetches the registry your entry appears in the browser with its derived badges.

## Next / See also

- [Distribution](distribution.md) — how the bundle is packaged and fetched (`distribution.kind`: zip asset / git tree / inline).
- [Updates](updates.md) — shipping a new version by re-pinning to a new immutable `ref`.
- [registry-schema](../reference/registry-schema.md) — full field-by-field schema reference.
- [scopes](../reference/scopes.md) — scope strings and the endpoint allowlist rule.
- [Marketplace](../marketplace.md) — the static marketplace browser your entry lands in.
