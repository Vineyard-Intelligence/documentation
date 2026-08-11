# Updates

How Vineyard detects and applies a new version of an installed plugin or Type Pack.

!!! warning "Current behavior is simpler — and less guarded — than the rest of this page used to claim"
    Clicking **Update** today directly re-points your project's installed pointer to the new version. It
    does **not** re-run the install pipeline, does **not** show a scope-approval dialog, and does **not**
    check any integrity hash — none of that exists in the code path yet (`updateItem()` in
    `project-install.ts`). Only a **fresh install** goes through
    the scope-approval dialog. This means a plugin version bump can silently add scopes/endpoints today —
    updating a plugin you trust is not yet re-verified the way installing a new one is. Treat the rest of
    this page's description of a "scope diff on update" as the intended design, not current behavior.

## The registry entry is the latest pointer

Vineyard does not poll author repos for updates. The **registry entry is the canonical latest pointer**: each row in `community-pluginpacks.json` (or `community-typepacks.json`) carries the current `version`, the immutable `ref`, and the `repo`/`path` that resolve to the manifest at that ref. When the marketplace fetches the registry, the app already knows the newest published version of everything you have installed — no per-repo network fan-out required.

The per-author `manifest.latest_url` field is a **fallback** pointer, not the primary mechanism. It points at the author's always-newest manifest and exists for update checks outside the catalog (for example, a plugin installed directly from a manifest URL during [local development](quickstart.md)). For anything published through the registry, the entry wins.

!!! info "What an update actually is"
    A `ref` is immutable — a 40-character commit SHA or an annotated tag, with branches rejected (see [distribution](distribution.md)). You never update *in place*. A new version is a new ref published as a new registry entry projection, and applying it is a full re-install at that ref.

## How the app detects an update

The app holds an install record per project of the form `{ identifier, url, version }` (the `Pointer`
type in `project-install.ts`) — **no `ref` field is stored**. To find updates it compares the installed
`version` string against the registry entry's `version` for the same identifier:

- If they match, you are current.
- If the entry's `version` is different, the marketplace shows **"Update available"** on the card and the detail page.

The check today is a plain string compare on `version`, not a diff on the immutable `ref` — so it relies
on the author bumping `version` correctly rather than on a byte-exact comparison.

## Applying an update

Choosing **Update** PATCHes your project's pointer directly to the new entry's `{ identifier, url, version }`. See the warning above: there is currently no re-run of the install pipeline, no fresh hash check, and no scope-approval dialog on this path.

## The scope diff (intended design — not yet wired to Update, see the warning above)

This is the part that is meant to make an update different from a silent refresh, once built. The
design: Vineyard compares the [scopes](../reference/scopes.md) requested by the new version against the
scopes you already approved.

- If the new version requests **no new authority**, the update applies without re-prompting.
- If the new version **requests new scopes**, the app **re-prompts** with the scope approval dialog, **highlighting the delta** — the exact verbs or network endpoints being added.

!!! warning "A new version cannot quietly expand its reach"
    Scopes are the only authority a plugin gets. A v1.1 that adds `node:delete`, `edge:delete`, a `network` endpoint, or a secret `config` value over what v1.0 had triggers a fresh approval showing precisely those additions. Granting an update is your decision, made on the diff — there is nothing for an author to widen behind your back. And an approved graph verb is not a direct write even after the update lands: a run's node and edge changes are captured into staging and applied only once you have reviewed the change set, under your own token.

The dialog uses the same `scopeToBadge()` rendering as the marketplace preview.

A manifest carried over from an older draft may still declare the removed `publish` scope (`message:post`). It no longer exists — plugins cannot post chat messages — and because `scopes` is `additionalProperties: false` in the [plugin schema](../reference/plugin-schema.md), a version declaring it fails validation instead of being offered as an update.

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

### `compat.min_app_version`

Each registry entry may carry `compat.min_app_version` — the oldest Vineyard runtime that the entry's ref supports (a `MAJOR.MINOR.PATCH` string). Today this is informational only: the marketplace detail page shows it under "Min app version," but nothing compares it against your running app version — the field does not currently gate whether an update is offered.

### `status` (deprecated / withdrawn)

There is no separate deprecation file. Delisting a version is the registry entry's own `status` block — `{ state, reason, since, replacement }` — set by editing the pack's row in `packs/`, not a standalone list (see [Taking a pack down](publishing.md#taking-a-pack-down)). A **`withdrawn`** ref is never offered as an update, cannot be freshly installed, and a client that already has it refuses to load it from cache — the analyst sees the reason instead. A **`deprecated`** ref keeps installing and updating normally; the analyst is just shown the notice once per project open.

## Type Packs update the same way

Type Packs follow the identical model: the `community-typepacks.json` entry is the latest pointer, and the update check is the same plain `version` string compare described above. Type Packs declare no scopes, so there is no scope diff either way — and the registry-typepack-entry schema carries no `compat` field at all, so there is no min-version metadata to show. `status` (deprecated/withdrawn) exclusion applies the same as for Plugin Packs. See [Type Packs](typepacks.md) for the schema and [registry schema](../reference/registry-schema.md) for the entry projection.

## Next / See also

- [Installing](../guide/installing.md) — the install pipeline that updates re-run.
- [Distribution & storage](distribution.md) — immutable refs, the integrity hash, client-side caching.
- [Publishing](publishing.md) — how a new version becomes a new registry entry.
- [Scopes reference](../reference/scopes.md) — what the scope diff compares.
- [Registry schema](../reference/registry-schema.md) — `version`, `ref`, and `compat` fields.
