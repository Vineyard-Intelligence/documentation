# Updates

How Vineyard detects, gates, and applies a new version of an installed plugin or Type Pack. There is no separate "update" pipeline — an update simply re-runs [install](../guide/installing.md) at a newer immutable `ref`, with a fresh hash check and a scope diff.

## The registry entry is the latest pointer

Vineyard does not poll author repos for updates. The **registry entry is the canonical latest pointer**: each row in `community-plugins.json` (or `community-typepacks.json`) carries the current `version`, the immutable `ref`, and the `repo`/`path` that resolve to the manifest at that ref. When the marketplace fetches the registry, the app already knows the newest published version of everything you have installed — no per-repo network fan-out required.

The per-author `manifest.latest_url` field is a **fallback** pointer, not the primary mechanism. It points at the author's always-newest manifest and exists for update checks outside the catalog (for example, a plugin installed directly from a manifest URL during [local development](quickstart.md)). For anything published through the registry, the entry wins.

!!! info "What an update actually is"
    A `ref` is immutable — a 40-character commit SHA or an annotated tag, with branches rejected (see [distribution](distribution.md)). You never update *in place*. A new version is a new ref published as a new registry entry projection, and applying it is a full re-install at that ref.

## How the app detects an update

The app holds an install record per project/user of the form `{ identifier, version, ref }`. To find updates it diffs each installed `identifier@version` against the registry entry for the same identifier:

- If the entry `ref` matches the installed `ref`, you are current.
- If the entry exposes a **newer `ref`** for that identifier, the marketplace shows **"Update available"** on the card and the detail page.

Because the diff is on the immutable `ref` (with `version` as the SemVer mirror), the check is exact: there is no ambiguity about whether the bytes you have are the bytes the registry now points at.

## Applying an update

Choosing **Update** re-runs the install pipeline at the new ref — the same pipeline documented under [installing](../guide/installing.md), including a **fresh hash check** of the freshly downloaded bytes against `distribution.integrity`, followed by the **scope diff** (below) and activation. The old cached bundle is replaced by the new one; the install record is updated to the new `{ version, ref }`.

## The scope diff

This is the part that makes an update different from a silent refresh. Vineyard compares the [scopes](../reference/scopes.md) requested by the new version against the scopes you already approved.

- If the new version requests **no new authority**, the update applies without re-prompting.
- If the new version **requests new scopes**, the app **re-prompts** with the scope approval dialog, **highlighting the delta** — the exact verbs or network endpoints being added.

!!! warning "A new version cannot quietly expand its reach"
    Scopes are the only authority a plugin gets. A v1.1 that adds `node:delete`, `edge:delete`, a `network` endpoint, or `message:post` over what v1.0 had triggers a fresh approval showing precisely those additions. Granting an update is your decision, made on the diff — there is nothing for an author to widen behind your back.

The dialog uses the same `scopeToBadge()` rendering as the marketplace preview.

=== "v1.0.0 scopes (already approved)"

    ```jsonc
    "scopes": {
      "graph": ["node:read", "node:create", "edge:create"]
    }
    ```

=== "v1.1.0 scopes (update offered)"

    ```jsonc
    "scopes": {
      "graph": ["node:read", "node:create", "edge:create",
                "node:delete"],                              // + new — re-prompts
      "network": [                                           // + new — re-prompts
        { "endpoint": "https://api.example.com", "methods": ["POST"], "purpose": "enrich" }
      ]
    }
    ```

In this example the update dialog highlights two additions: `node:delete` and a single network endpoint. Until you approve, the new ref is not activated.

## Gating: which version is even offered

Two registry signals decide whether a newer ref is offered to you at all.

### `compat.min_app_version`

Each registry entry may carry `compat.min_app_version` — the oldest Vineyard runtime that the entry's ref supports (a `MAJOR.MINOR.PATCH` string). The app **gates the offered version** against your running app version: if a newer ref requires a runtime newer than yours, that version is not offered as an update. You keep the version you have until you update the app itself. This prevents pulling a bundle your runtime cannot execute.

### `deprecation.json`

The registry repo (`vineyard-run/vineyard-releases`) maintains a `deprecation.json` listing withdrawn versions. **Refs listed in `deprecation.json` are never installed** — not as a fresh install and not as an update target. If the latest entry has been deprecated, the app will not offer it; a previously-installed-but-now-deprecated ref keeps working from its local cache but stops being advertised as current.

## Type Packs update the same way

Type Packs follow the identical model: the `community-typepacks.json` entry is the latest pointer, the diff is on `identifier@version`/`ref`, and a newer ref re-installs at that ref with a fresh hash check. Type Packs declare no scopes, so there is no scope diff — but `compat.min_app_version` gating and `deprecation.json` exclusion apply equally. See [Type Packs](typepacks.md) for the schema and [registry schema](../reference/registry-schema.md) for the entry projection.

## Next / See also

- [Installing](../guide/installing.md) — the install pipeline that updates re-run.
- [Distribution & storage](distribution.md) — immutable refs, the integrity hash, client-side caching.
- [Publishing](publishing.md) — how a new version becomes a new registry entry.
- [Scopes reference](../reference/scopes.md) — what the scope diff compares.
- [Registry schema](../reference/registry-schema.md) — `version`, `ref`, and `compat` fields.
