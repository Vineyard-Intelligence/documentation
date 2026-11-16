# Publishing to the registry

Publishing a Plugin Pack, Type Pack, or Skill Pack to the public Vineyard marketplace is a single pull request against the registry repo. You add **one file**, CI validates it, a human merges it, and your entry goes live on the next registry fetch — no app release required.

## The registry repo holds metadata only

Submissions go to **`Vineyard-Intelligence/registry`**. The repo carries *pointers and derived facets*, never code and never copies of your manifest or bundle. Your full manifest/Type Pack JSON, README, screenshots, and bundle all stay in **your** author repo at the pinned `ref`; the marketplace detail page hydrates from there lazily. The app and the marketplace fetch that pinned content through `https://cdn.jsdelivr.net/gh/{repo}@{ref}/{path}`, and any GitHub owner is served: the app runs plugin code from the CDN's `/gh/` path, not from one organization, so a Plugin Pack in your own repo runs like any other. What decides whether a pack is loaded is the registry's approved-ref list — the app loads only a `repo@ref/path` on it, checks the fetched document against the SHA-256 recorded there, and checks a plugin's code module against the SHA-256 recorded for it before running it. The reviewed, immutable commit is the unit of trust.

| Path | Role |
|---|---|
| `packs/<identifier>.json` | **The source, and the only thing a submission adds.** One file per pack, named for its `identifier`. |
| `registry/community-pluginpacks.json` | Published index of Plugin Packs — **generated**, one lean entry per pack: identifier, name, author, summary, repo, ref, path, version, platforms, `scopes_summary`, `verified`. |
| `registry/community-typepacks.json` | Symmetric for Type Packs; carries `categories`/`type_count` instead of scopes (no code executes). |
| `registry/community-skillpacks.json` | Symmetric for Skill Packs; carries `applies_to`/`section_count`/`requires` instead of scopes (text only, no code executes). |
| `registry/approved-*.json` | **Generated** from the history of `packs/` by `scripts/build_approved.py`. Lists every `repo@ref/path` the registry has ever approved, with a SHA-256 of that document and, for a Plugin Pack, of each code module it runs (`bundle_sha256`). The app loads only pointers on this list whose bytes match the digest, and runs only code whose bytes match its own. |
| `schemas/` | The published meta-schemas CI validates entries against. |
| `verified-authors.json` | Who may show the verified badge, the namespaces each owns, and the GitHub numeric id their pack repository must be owned by. **Operator-owned** — a submission never edits it. |
| `SPEC.md` | The registry contract in full — entry format, the pinning rule, what CI enforces. |

!!! warning "Do not edit `registry/community-*.json` or `registry/approved-*.json`"
    The three catalogs are built from `packs/` by `scripts/build_registry.py`, and the three approved-ref lists by `scripts/build_approved.py`. Both are rebuilt and committed on merge, so a hand edit is overwritten. Your `content_type` decides which catalog your entry joins — you never pick one.

## Submission workflow

1. **Fork** `Vineyard-Intelligence/registry`.
2. **Pin an immutable `ref`** — the **commit SHA** of the release in your author repo. Tags and branches are mutable and rejected; resolve a tag/branch to its commit SHA with `python scripts/resolve_ref.py owner/repo <tag-or-branch>`. The commit must be on a branch or tag of the repository named in `repo` — push or merge your release there before you pin it, and keep it there.
3. **Add one file**, `packs/<identifier>.json`, holding your entry. The filename must match the entry's `identifier` exactly.
4. **Open a PR.** The `validate` workflow posts its result as a status check.
5. **Fix any failures**, then wait for a human merge.
6. After green CI + merge, the catalogs are rebuilt and your entry is **live on the next registry fetch** — clients pull the static JSON.

A few things worth knowing going in:

- The `identifier` in the entry must equal `manifest.identifier` (or `typepack.identifier`) and uses the reverse-DNS form `<your-namespace>.pluginpacks.*` / `.typepacks.*` / `.skillpacks.*` — see [the three content types](index.md#the-three-content-types). Inside a Plugin Pack, every plugin and member is `<your-namespace>.plugins.<name>`, and none may be one of the ids the app's own writers use (`run.vineyard.agent`, `.merge`, `.retest`, `.value`): the app refuses the whole pack otherwise, whatever the registry accepted (see [Plugin Packs](plugin-packs.md#how-a-pack-appears-in-the-registry)).
- `ref` is the only thing pinning your code. To ship a new version, edit your pack's file in place with the new `ref` and a higher `version` — see [Updates](updates.md).
- Derived fields (`platforms`, `scopes_summary`, `categories`, `type_count`, …) are projections of the full manifest/Type Pack so the browse page renders without fetching every manifest. CI recomputes `scopes_summary`, `platforms`, `services`, `plugin_count`, `desktop_only`, `icon`, `section_count` and `type_count` from the pinned document and rejects the entry if any it carries disagree. `categories` and a Skill Pack's `applies_to`/`requires` are not recomputed, so keep them accurate yourself.

## A pack's line and its page {#pack-page}

A Plugin Pack, a Type Pack and a Skill Pack each carry two texts at pack level, the way a browser
extension store shows a short line under the name and an About section below. **Both are required.**

| Field | What it is | Limit | Who reads it |
| --- | --- | --- | --- |
| `summary` | The line under the name: what the pack does, standing on its own. | 250 characters, one line | Every card, picker and the agent's lists |
| `description` | The pack's page, its About section, in Markdown: what it is for, what each plugin adds, what it costs, what it needs, what it exposes. | 16,000 characters | The marketplace drawer when a pack is opened, and the agent only when it asks for that one pack by id |

The page is rendered as Markdown with its headings, lists, tables and code, and with nothing that
acts: **an image is never loaded** (its address is shown instead, so opening a pack never tells its
author who looked at it), **a link is not clickable** (its text is shown with the full address beside
it), and raw HTML is dropped.

Write the page for the analyst deciding whether to install the pack. The agent does not read it when
it lists plugins or skill packs; it gets a pack's page from `list_plugins` with `pack_id` only when a
plugin's own entry does not say enough, and it treats the page as data, never as instructions. A
Skill Pack's page is never sent to the agent at all: the `overview` and the sections are the text
written for it. Individual plugins keep their own `description` unchanged.

**Documents from before the page.** A document without `summary` was written before the page existed,
and there `description` is the one line. The app still reads one, so every project pinned to such a
commit keeps loading it, but the registry lists none: move the old line into `summary`, write the
page into `description`, and re-pin. A lone `vineyard:plugin` document cannot carry both, because its
`description` is the plugin's own; list it as a Plugin Pack of one.

## What CI enforces

Every check below is **blocking** — a pull request cannot merge until they all pass. They run in `.github/workflows/validate.yml`.

### The entry

- **Filename matches `identifier`, and `content_type` is one of the four known kinds.** (`build_registry.py`)
- **Registry-entry schema.** The entry validates against `schemas/registry-plugin-entry`, `registry-typepack-entry`, or `registry-skillpack-entry`. (`validate.py`)
- **Declared dependencies resolve, and are still live.** A Skill Pack's `requires` and a Plugin Pack's `typepacks` must name packs that are in this catalog — the marketplace builds its co-install offer from those lists. A pack added in the *same* pull request counts, so a Type Pack and the plugin that uses it can land together. A dependency that has been [delisted](#taking-a-pack-down) is also rejected. (`validate.py`)
- **Namespace and authorship.** A namespace listed in `verified-authors.json` may only be published under by its owner, and an author name listed there may only be worn inside its own namespaces — so neither `run.vineyard.*` nor `author: VINEYARD` can be claimed by anyone else. (`validate.py`) `verified` is derived, not submitted. `build_registry.py` sets it to true when the identifier's namespace is claimed in `verified-authors.json` by the handle in `author`, and discards any value in the submission. Each author listed there also carries `github.id` and `github.handle`: `validate.py` resolves the pack repository's owner and requires `owner.id == github.id`, so an entry cannot borrow VINEYARD's namespace and author while pointing at someone else's repository. The handle is display text; verification never compares it.

### The pin

- **Immutable `ref`.** Must be a **commit SHA** (40-hex or 64-hex). Tags and branches can be moved and are **rejected**. (`verify_pinned.py`)
- **The commit belongs to `repo`.** Some branch or tag of the repository named in `repo` must contain the pinned commit. A commit that no branch or tag contains is **refused** — one that exists only in a fork, for example, or a pull request's own commit after a squash merge (pin the commit the merge created instead). Push or merge it into `repo` (or tag it there) and pin that; `resolve_ref.py` gives you the commit a branch or tag points at. A commit on the default branch, or the one a tag or branch points at, is found. This applies to every entry, verified or not, and is checked when your pull request adds the entry or changes its `repo` or `ref`. Keep that branch or tag for as long as the entry is listed — tagging each release is the simplest way — and do not rewrite its history: a commit nothing in `repo` holds any more is not guaranteed to stay available. (`validate.py`) The November 2026 rewrites of the `Vineyard-Intelligence` pack repositories broke this rule on purpose, once to remove machine hostnames from commit identities and once to remove Claude co-author trailers and Claude identities: each moved ref has a twin row in `approved-baseline.json` (the frozen input to `registry/approved-*.json`) with the same tree and digest, and the old row stays approved, so a project pinned to the old commit keeps loading it and the new commit is approved for the same content.
- **The pinned document matches the entry.** The document at `repo@ref/path` is fetched and its `identifier`, `content_type`, and `version` must equal what your entry advertises. An entry whose metadata was bumped without re-pinning the `ref` fails here.
- **The pack states both texts, and the card line is the document's own.** The pinned document must have `summary` and a non-empty `description`, and your entry's `summary` must equal the document's exactly — the entry mirrors the line the document states. The page stays in the document; the marketplace reads it from the pinned commit when the pack is opened. (`verify_pinned.py`)
- **The line and the page are well formed.** `summary` is one line of at most 250 characters; the page is text of at most 16,000 characters with no control characters but newlines and tabs; a lone `vineyard:plugin` document is refused. See [A pack's line and its page](#pack-page). (`verify_pinned.py`)
- **Every plugin is named in its schema's shape, and none as one of the app's own writers.** In a Plugin Pack document the pack's `identifier` must be `<reverse-DNS>.pluginpacks.<name>` and each member's `<reverse-DNS>.plugins.<name>`, matched against the patterns the schemas themselves give, and none may be `run.vineyard.agent`, `run.vineyard.merge`, `run.vineyard.retest` or `run.vineyard.value`, the ids the app stages its own writes under. The entry's pattern admits either kind segment and names no member, so this is checked on the pinned document. The app refuses such a document whole (see [Plugin Packs](plugin-packs.md#how-a-pack-appears-in-the-registry)), so such a pack, were it listed, would fail to load for everyone who installs it. (`verify_pinned.py`, `test_plugin_ids.py`)
- **Every summary field is recomputed, not trusted.** `scopes_summary`, `platforms`, `services`, `plugin_count`, `desktop_only`, `icon`, `section_count` and `type_count` are derived from the pinned document and compared to what you wrote. `scopes_summary.network` is true when a member declares `network`, `network_configurable` **or** `web_probe`.
- **A configurable endpoint reads the plugin's own address setting.** Every [`network_configurable`](../reference/scopes.md#network_configurable) entry of the pack and of each member must name a `scopes.config` key of `type: "url"` that the same plugin declares, list its `methods` from `GET`, `POST`, `PUT`, `PATCH` and `DELETE` (upper case, each once), list only `https` and `http` in `schemes` when it has one, and carry no field but `config_key`, `methods`, `purpose` and `schemes`. The app grants nothing for an entry that does not read such a setting, and matches methods exactly, so such a pack would install and then have every request refused. (`verify_pinned.py`, `test_scopes.py`)
- **The bundle is in the pinned commit and matches the manifest.** For Plugin Packs, `platforms.web.entry` of the pack and of each member must be a path inside the repository, relative to its root (`dist/pack.mjs`). Each segment of that path may use only ASCII letters, digits, `.`, `_` and `-`, and may not be `.` or `..`. Anything else, such as an absolute URL, a leading `/`, a backslash or a `%`, fails here before anything is fetched. The module it names is fetched at the pinned commit, and the `version` and `license` it declares for the pack and for each member must equal the manifest's. A manifest edited without rebuilding `dist/` fails here, and so does an entry that 404s. (`verify_pinned.py`)
- **The approved list records your code's digest.** After merge, the SHA-256 of each module your pack runs is recorded on its approved row, read out of the pinned manifest, and the app refuses a module whose bytes do not match it. The digest is taken from GitHub at the pinned commit, and the build also fetches the same file through jsDelivr and fails if the bytes differ. Every pack the catalog lists must have one: the build fails, and nothing is published, when a listed pack's document or modules cannot be hashed, so the pinned commit has to be on GitHub when your entry merges. The module must be [one self-contained file](distribution.md#one-file). (`build_approved.py`, `test_approved.py`)

### The type graph

Every `io.consumes` / `io.produces` entry is resolved against the Type Packs **published in this catalog**:

- the `category.name` must be a type some published Type Pack actually defines;
- the `typepack` field must name the pack that really defines it;
- that Type Pack must appear in your entry's `typepacks` list.

A Type Pack the registry does not carry is **not** acceptable. Publish the Type Pack first, then the plugin that uses it.

Type Packs get four checks of their own here. A `category.name` may be defined by only one published Type Pack. Every `identity_properties` key must name an existing property of that type that is not `array`, `object` or `json`. Every `normalize` must be one of `crypto_address`, `hex`, `hostname`, `ip`, `cidr` and `url`, may sit beside `"case_insensitive": true` only for `hostname`, `ip` and `cidr`, and must be on a property that is not `array`, `object` or `json`, because an app that does not know a rule falls back to the flag without a word. Every `duplicate_key` must be a boolean on such a property, outside the identity.

### What a human weighs

There is no automated static analysis of your bundle; a person reads it and weighs the following. None is an automatic rejection:

- Breadth of requested scopes against what the pack plausibly needs.
- `node:delete` / `edge:delete` usage (graph-destructive verbs).
- `network` + `node:read` together (data leaves the graph, and there is egress).
- `network_configurable`: it reaches whatever server the analyst names, often one on their own network. The reviewer reads what the bundle sends there, and whether anything it reads there leaves for a fixed `network` endpoint.
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
  "summary": "Six graph-manipulation plugins for demos and validation.",
  "repo": "Vineyard-Intelligence/pluginpack-chaos",
  "ref": "024c36cf17011abb4a7fc6004ced208751c13473",
  "path": "plugins/chaos-pack.manifest.json",
  "version": "1.0.3",
  "platforms": ["web"],
  "scopes_summary": { "network": false, "graph_write": true, "secret_config": false },
  "plugin_count": 6,
  "icon": "boxes",
  "typepacks": []
}
```

A **Type Pack**, filed as `packs/run.vineyard.typepacks.infrastructure.json` (no scopes; `categories`/`type_count` drive the facets):

```json
{
  "identifier": "run.vineyard.typepacks.infrastructure",
  "content_type": "vineyard:typepack",
  "name": "Infrastructure",
  "author": "VINEYARD",
  "summary": "Network-infrastructure and web OSINT entities (IPs, domains, URLs, hosts, ASNs, netblocks, DNS/WHOIS records, TLS certificates, SSH host keys, technologies, web fingerprints and tracking/ad-account identifiers) and their relationships.",
  "repo": "Vineyard-Intelligence/typepack-basic",
  "ref": "721e3fdab2bdcace019cd9329b47b1014d8acdbb",
  "path": "typepacks/infrastructure.json",
  "version": "4.0.0",
  "categories": ["infrastructure", "web"],
  "type_count": 15,
  "icon": "network"
}
```

!!! note "Field reference"
    The required fields are `identifier`, `content_type`, `name`, `author`, `summary`, `repo`, `ref`, `path`. `content_type` is the literal `vineyard:plugin`, `vineyard:pluginpack`, `vineyard:typepack`, or `vineyard:skillpack`. The full field list and constraints live in [registry-schema](../reference/registry-schema.md).

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

- **Fix the dependants first.** A live pack may not list a delisted one in `requires` (or `typepacks`), so CI will name every pack that depends on yours. Update them, or delist them in the same pull request.
- **A withdrawn entry is not pin-verified**, so its content may be gone. A deprecated pack is still pin-verified, so it must still resolve.

Removing the row outright is only for an entry nobody could have installed: a mistaken submission, or a duplicate.

## Next / See also

- [Distribution](distribution.md) — how pack content is actually fetched and verified.
- [Updates](updates.md) — shipping a new version by re-pinning to a new immutable `ref`.
- [registry-schema](../reference/registry-schema.md) — full field-by-field schema reference.
- [scopes](../reference/scopes.md) — scope strings and the endpoint allowlist rule.
- [Marketplace](../marketplace.md) — the static marketplace browser your entry lands in.
