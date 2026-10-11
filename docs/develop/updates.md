# Updates

How Vineyard detects and applies a new version of an installed Plugin Pack, Type Pack or Skill Pack.

## The registry entry is the latest pointer

Vineyard does not poll author repos for updates. The **registry entry is the canonical latest pointer**: each row in `community-pluginpacks.json` (or `community-typepacks.json`) carries the current `version`, the immutable `ref`, and the `repo`/`path` that resolve to the manifest at that ref. When the marketplace fetches the registry, the app already knows the newest published version of everything you have installed.

A manifest's `latest_url` field is accepted but not used; the app has no update check outside the catalog. A pack loaded from a URL during [local development](quickstart.md) is not installed. It is re-fetched from that URL on every load, so it is always the current build.

!!! info "What an update actually is"
    A `ref` is immutable: a commit SHA (40-hex, or 64-hex for SHA-256 repos). Tags and branches are rejected because they can be moved (see [publishing](publishing.md#the-pin)). You never update *in place*. A new version is a new ref published as a new registry entry projection, and applying it is a full re-install at that ref.

## How the app detects an update

The app holds an install record per project of the form `{ identifier, url, version }` — **no `ref` field is stored**. To find updates it compares the installed `version` with the registry entry's `version` for the same identifier, as SemVer: only a **newer** catalog version is offered (`1.10.0` is newer than `1.9.0`, and a release is newer than its own pre-releases). An equal or lower version, or one that is not SemVer, offers nothing.

When a newer version is in the catalog, the marketplace shows an **Update** button on the card and **Update available** in the detail drawer.

The check compares `version`, not `ref`: re-pinning a new `ref` without raising `version` never reaches projects that already have the pack.

## Applying an update

Choosing **Update** opens the same approval dialog as a fresh install, and nothing changes until the analyst confirms. For a Plugin Pack, every permission the new version adds is marked **New**. Packs the new version needs and the project does not have yet — Type Packs for a Plugin Pack, Plugin Packs for a Skill Pack — are listed under **Also installs** and added in the same step. If one of them is missing from the catalog or withdrawn, the update is refused. Confirming re-points the project's pointer to the new entry's `{ identifier, url, version }`.

`publish` is not in the scopes schema; the app ignores it and grants nothing, so remove it if your manifest declares it.

## Gating: which version is even offered

### `compat.min_app_version`

Each registry entry may carry `compat.min_app_version` — the oldest Vineyard runtime that the entry's ref supports (a `MAJOR.MINOR.PATCH` string). Today this is informational only: the marketplace detail page shows it under "Min app version," but nothing compares it against your running app version.

### `status` (deprecated / withdrawn)

There is no separate deprecation file. Delisting a version is the registry entry's own `status` block — `{ state, reason, since, replacement }` — set by editing the pack's row in `packs/` (see [Taking a pack down](publishing.md#taking-a-pack-down)). A **`withdrawn`** ref is never offered as an update, cannot be freshly installed, and a project that already has it refuses to load it on the next run — the analyst sees the reason instead. A **`deprecated`** ref keeps installing and updating normally; the analyst is just shown the notice once per project open.

## Type Packs update the same way

Type Packs follow the identical model: the `community-typepacks.json` entry is the latest pointer, and the update check is the same SemVer comparison described above. Type Packs declare no scopes, and the registry-typepack-entry schema carries no `compat` field, so there is no min-version metadata to show. `status` (deprecated/withdrawn) exclusion applies the same as for Plugin Packs. Skill Packs do too: the `community-skillpacks.json` entry is the latest pointer, and Update re-points the project's `skills` pointer. See [Type Packs](typepacks.md) for the schema and [registry schema](../reference/registry-schema.md) for the entry projection.

## Next / See also

- [Distribution & storage](distribution.md) — immutable refs and where the bundle actually comes from.
- [Publishing](publishing.md) — how a new version becomes a new registry entry.
- [Registry schema](../reference/registry-schema.md) — `version`, `ref`, and `compat` fields.
