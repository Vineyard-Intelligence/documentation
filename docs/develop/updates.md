# Updates

How Vineyard detects and applies a new version of an installed plugin or Type Pack.

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

The check is a plain string compare on `version`, not a diff on the immutable `ref` — so it relies
on the author bumping `version` correctly rather than on a byte-exact comparison.

## Applying an update

Choosing **Update** PATCHes your project's pointer directly to the new entry's `{ identifier, url, version }`. This does not re-run the install pipeline, re-check any hash, or show the scope-approval dialog that a fresh install shows — a version bump can add scopes or endpoints without re-prompting you today.

A manifest carried over from an older draft may still declare the removed `publish` scope (`message:post`). It no longer exists — plugins cannot post chat messages — and because `scopes` is `additionalProperties: false` in the [plugin schema](../reference/plugin-schema.md), a version declaring it fails validation instead of being offered as an update.

## Gating: which version is even offered

### `compat.min_app_version`

Each registry entry may carry `compat.min_app_version` — the oldest Vineyard runtime that the entry's ref supports (a `MAJOR.MINOR.PATCH` string). Today this is informational only: the marketplace detail page shows it under "Min app version," but nothing compares it against your running app version.

### `status` (deprecated / withdrawn)

There is no separate deprecation file. Delisting a version is the registry entry's own `status` block — `{ state, reason, since, replacement }` — set by editing the pack's row in `packs/`, not a standalone list (see [Taking a pack down](publishing.md#taking-a-pack-down)). A **`withdrawn`** ref is never offered as an update, cannot be freshly installed, and a project that already has it refuses to load it on the next run — the analyst sees the reason instead. A **`deprecated`** ref keeps installing and updating normally; the analyst is just shown the notice once per project open.

## Type Packs update the same way

Type Packs follow the identical model: the `community-typepacks.json` entry is the latest pointer, and the update check is the same plain `version` string compare described above. Type Packs declare no scopes, and the registry-typepack-entry schema carries no `compat` field, so there is no min-version metadata to show. `status` (deprecated/withdrawn) exclusion applies the same as for Plugin Packs. See [Type Packs](typepacks.md) for the schema and [registry schema](../reference/registry-schema.md) for the entry projection.

## Next / See also

- [Distribution & storage](distribution.md) — immutable refs and where the bundle actually comes from.
- [Publishing](publishing.md) — how a new version becomes a new registry entry.
- [Registry schema](../reference/registry-schema.md) — `version`, `ref`, and `compat` fields.
