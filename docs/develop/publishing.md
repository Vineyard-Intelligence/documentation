# Publishing to the registry

Publishing a Plugin Pack, Type Pack, or Skill Pack to the public Vineyard marketplace is a single pull request against the registry repo. You add **one file**, CI validates it, a human merges it, and your entry goes live on the next registry fetch — no app release required.

## The registry repo holds metadata only

Submissions go to **`Vineyard-Intelligence/registry`**. The repo carries *pointers and derived facets*, never code and never copies of your manifest or bundle. Your full manifest/Type Pack JSON, README, screenshots, and bundle all stay in **your** author repo at the pinned `ref`; the marketplace detail page hydrates from there lazily. Plugin Pack code is the exception: the app only runs pack code served from `https://cdn.jsdelivr.net/gh/Vineyard-Intelligence/`. A Plugin Pack hosted in another GitHub owner's repo can pass CI and install, but its `platforms.web.entry` module is refused when a plugin runs. Type Packs and Skill Packs are data and load from any repo.

| Path | Role |
|---|---|
| `packs/<identifier>.json` | **The source, and the only thing a submission adds.** One file per pack, named for its `identifier`. |
| `registry/community-pluginpacks.json` | Published index of Plugin Packs — **generated**, one lean entry per pack: identifier, name, author, description, repo, ref, path, version, platforms, `scopes_summary`, `verified`. |
| `registry/community-typepacks.json` | Symmetric for Type Packs; carries `categories`/`type_count`/`edge_count` instead of scopes (no code executes). |
| `registry/community-skillpacks.json` | Symmetric for Skill Packs; carries `applies_to`/`section_count`/`requires` instead of scopes (text only, no code executes). |
| `registry/approved-*.json` | **Generated** from the history of `packs/` by `scripts/build_approved.py`. Lists every `repo@ref/path` the registry has ever approved, with a SHA-256 of that document. The app loads only pointers on this list whose bytes match the digest. |
| `schemas/` | The published meta-schemas CI validates entries against. |
| `verified-authors.json` | Who may show the verified badge, and the namespaces each owns. **Operator-owned** — a submission never edits it. |
| `SPEC.md` | The registry contract in full — entry format, the pinning rule, what CI enforces. |

!!! warning "Do not edit `registry/community-*.json` or `registry/approved-*.json`"
    The three catalogs are built from `packs/` by `scripts/build_registry.py`, and the three approved-ref lists by `scripts/build_approved.py`. Both are rebuilt and committed on merge, so a hand edit is overwritten. Your `content_type` decides which catalog your entry joins — you never pick one.

## Submission workflow

1. **Fork** `Vineyard-Intelligence/registry`.
2. **Pin an immutable `ref`** — the **commit SHA** of the release in your author repo. Tags and branches are mutable and rejected; resolve a tag/branch to its commit SHA with `python scripts/resolve_ref.py owner/repo <tag-or-branch>`.
3. **Add one file**, `packs/<identifier>.json`, holding your entry. The filename must match the entry's `identifier` exactly.
4. **Open a PR.** The `validate` workflow posts its result as a status check.
5. **Fix any failures**, then wait for a human merge.
6. After green CI + merge, the catalogs are rebuilt and your entry is **live on the next registry fetch** — clients pull the static JSON.

A few things worth knowing going in:

- The `identifier` in the entry must equal `manifest.identifier` (or `typepack.identifier`) and uses the reverse-DNS form `<your-namespace>.pluginpacks.*` / `.typepacks.*` / `.skillpacks.*` — see [the three content types](index.md#the-three-content-types).
- `ref` is the only thing pinning your code. To ship a new version, edit your pack's file in place with the new `ref` and a higher `version` — see [Updates](updates.md).
- Derived fields (`platforms`, `scopes_summary`, `categories`, `type_count`, …) are projections of the full manifest/Type Pack so the browse page renders without fetching every manifest. CI recomputes `scopes_summary`, `platforms`, `services`, `plugin_count`, `desktop_only`, `icon`, `section_count`, `type_count` and `edge_count` from the pinned document and rejects the entry if any it carries disagree. `categories` and a Skill Pack's `applies_to`/`requires` are not recomputed, so keep them accurate yourself.

## What CI enforces

Every check below is **blocking** — a pull request cannot merge until they all pass. They run in `.github/workflows/validate.yml`.

### The entry

- **Filename matches `identifier`, and `content_type` is one of the four known kinds.** (`build_registry.py`)
- **Registry-entry schema.** The entry validates against `schemas/registry-plugin-entry`, `registry-typepack-entry`, or `registry-skillpack-entry`. (`validate.py`)
- **Declared dependencies resolve, and are still live.** A Skill Pack's `requires` and a Plugin Pack's `typepacks` must name packs that are in this catalog — the marketplace builds its co-install offer from those lists. A pack added in the *same* pull request counts, so a Type Pack and the plugin that uses it can land together. A dependency that has been [delisted](#taking-a-pack-down) is also rejected. (`validate.py`)
- **Namespace and authorship.** A namespace listed in `verified-authors.json` may only be published under by its owner, and an author name listed there may only be worn inside its own namespaces — so neither `run.vineyard.*` nor `author: VINEYARD` can be claimed by anyone else. (`validate.py`) `verified` is derived, not submitted. `build_registry.py` sets it to true when the identifier's namespace is claimed in `verified-authors.json` by the handle in `author`, and discards any value in the submission.

### The pin

- **Immutable `ref`.** Must be a **commit SHA** (40-hex or 64-hex). Tags and branches can be moved and are **rejected**. (`verify_pinned.py`)
- **The pinned document matches the entry.** The document at `repo@ref/path` is fetched and its `identifier`, `content_type`, and `version` must equal what your entry advertises. An entry whose metadata was bumped without re-pinning the `ref` fails here.
- **Every summary field is recomputed, not trusted.** `scopes_summary`, `platforms`, `services`, `plugin_count`, `desktop_only`, `icon`, `section_count`, `type_count` and `edge_count` are derived from the pinned document and compared to what you wrote. `scopes_summary.network` is true when a member declares `network` **or** `web_probe`.
- **The bundle matches the manifest.** For Plugin Packs, the module named by `platforms.web.entry` is fetched at the pinned commit. The `version` and `license` it declares for the pack and for each member must equal the manifest's. A manifest edited without rebuilding `dist/` fails here, and so does an entry that 404s. (`verify_pinned.py`)

### The type graph

Every `io.consumes` / `io.produces` entry is resolved against the Type Packs **published in this catalog**:

- the `category.name` must be a type some published Type Pack actually defines;
- the `typepack` field must name the pack that really defines it;
- that Type Pack must appear in your entry's `typepacks` list.

A Type Pack the registry does not carry is **not** acceptable. Publish the Type Pack first, then the plugin that uses it.

Type Packs get two checks of their own here. A `category.name` may be defined by only one published Type Pack. Every `identity_properties` key must name an existing property of that type that is not `array`, `object` or `json`.

### What a human weighs

There is no automated static analysis of your bundle; a person reads it and weighs the following. None is an automatic rejection:

- Breadth of requested scopes against what the pack plausibly needs.
- `node:delete` / `edge:delete` usage (graph-destructive verbs).
- `network` + `node:read` together (data leaves the graph, and there is egress).
- Minified-only bundles — no readable source to inspect. Ship readable code if you want a fast review.
- Secret-looking `params` keys. Credentials belong in `scopes.config` with `secret: true`, never in user-facing params.
- A `native` or `subprocess` desktop runtime, which the app does not run today.

!!! tip "Destructive ≠ rejected"
    The Chaos pack — Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node — leans entirely on `node:delete`/`edge:delete`. It publishes fine.

## Sample submissions

A **Plugin Pack**, filed as `packs/run.vineyard.pluginpacks.chaos.json`. Note `plugin_count` marks a pack with multiple plugins (one file → many plugins):

```json
{
  "identifier": "run.vineyard.pluginpacks.chaos",
  "content_type": "vineyard:pluginpack",
  "name": "Chaos Reference Pack",
  "author": "VINEYARD",
  "description": "Six graph-manipulation plugins for demos and validation.",
  "repo": "Vineyard-Intelligence/pluginpack-chaos",
  "ref": "4501ffcf55e8e0b563520549c79f7c0627ca32a5",
  "path": "plugins/chaos-pack.manifest.json",
  "version": "1.0.2",
  "platforms": ["web"],
  "scopes_summary": { "network": false, "graph_write": true, "secret_config": false },
  "plugin_count": 6,
  "icon": "boxes",
  "compat": { "min_app_version": "1.0.0" },
  "typepacks": []
}
```

A **Type Pack**, filed as `packs/run.vineyard.typepacks.infrastructure.json` (no scopes; `categories`/`type_count`/`edge_count` drive the facets):

```json
{
  "identifier": "run.vineyard.typepacks.infrastructure",
  "content_type": "vineyard:typepack",
  "name": "Infrastructure",
  "author": "VINEYARD",
  "description": "Network-infrastructure and web OSINT entities (IPs, domains, URLs, hosts, ASNs, netblocks, DNS/WHOIS records, TLS certificates, SSH host keys, technologies, web fingerprints and tracking/ad-account identifiers) and their relationships.",
  "repo": "Vineyard-Intelligence/typepack-basic",
  "ref": "81dd71ddeeebfbeba47762d87dd3f89ecd7d11df",
  "path": "typepacks/infrastructure.json",
  "version": "3.0.0",
  "categories": ["infrastructure", "web"],
  "type_count": 15,
  "icon": "network",
  "edge_count": 14
}
```

!!! note "Field reference"
    The required fields are `identifier`, `content_type`, `name`, `author`, `description`, `repo`, `ref`, `path`. `content_type` is the literal `vineyard:plugin`, `vineyard:pluginpack`, `vineyard:typepack`, or `vineyard:skillpack`. The full field list and constraints live in [registry-schema](../reference/registry-schema.md).

## After merge

Merging triggers a rebuild of the three catalog files and the three approved-ref lists from `packs/`, committed straight back to `main`. The next time a client fetches the registry your entry appears in the browser with its derived badges.

## Taking a pack down

Deleting your entry is **not** how a pack is retired: the pack disappears from the browse page, but every project that already has it goes on loading it from the pinned commit. Instead, the row stays and gains a `status` block:

```json
"status": {
  "state": "deprecated",
  "reason": "Unmaintained since the API it collects from shut down.",
  "since": "2026-08-09",
  "replacement": "com.acme.pluginpacks.recon"
}
```

| State | In the catalog | In a project that has it |
|---|---|---|
| `deprecated` | Still browsable and installable, badged | Loads normally; the analyst is told once per project open |
| `withdrawn` | Hidden from browse unless the project has it; install refused | **Not loaded** — the reason is shown instead |

`reason` reaches analysts verbatim, so write it for them: what happened, and what to do. `replacement` must name a live pack of the same kind.

Deprecating your own pack is an ordinary pull request. **Withdrawal is the operator's call**, reserved for content that turned out to be harmful or has disappeared.

Two things to expect:

- **Fix the dependants first.** A live pack may not `require` (or list in `typepacks`) a delisted one, so CI will name every pack that depends on yours. Update them, or delist them in the same pull request.
- **A withdrawn entry is not pin-verified**, so its content may be gone. A deprecated pack is still pin-verified, so it must still resolve.

Removing the row outright is only for an entry nobody could have installed: a mistaken submission, or a duplicate.

## Next / See also

- [Distribution](distribution.md) — the `distribution` block, and how pack content is actually fetched and verified.
- [Updates](updates.md) — shipping a new version by re-pinning to a new immutable `ref`.
- [registry-schema](../reference/registry-schema.md) — full field-by-field schema reference.
- [scopes](../reference/scopes.md) — scope strings and the endpoint allowlist rule.
- [Marketplace](../marketplace.md) — the static marketplace browser your entry lands in.
