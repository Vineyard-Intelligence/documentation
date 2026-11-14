# Distribution

What the app loads is decided by the registry entry — `repo`, `ref` and `path` — and, for plugins, by `platforms.web.entry`. A pack document does not describe where it is published; the registry entry that points at it does.

## The pinned pointer

A registry entry (`packs/<identifier>.json`) names the content repo (`repo`, as `owner/name`), the commit to load (`ref`) and the document's path within that commit (`path`). The client fetches `https://cdn.jsdelivr.net/gh/{repo}@{ref}/{path}`. The full field-by-field reference lives in the [registry schema](../reference/registry-schema.md).

!!! warning "`ref` must be immutable — branches and tags are rejected"
    The registry entry's `ref` must be a commit SHA, 40-hex or 64-hex. Branches and tags are **rejected** by the entry schema and by `verify_pinned.py`, because they can be moved after review. See [updates](updates.md) for how a new version becomes an offered update.

## The code module: `platforms.web.entry` {#entry}

A plugin's `platforms.web.entry` names the module the plugin worker imports: a path inside the repository, relative to the repo root (for example `dist/pack.mjs`), resolved against the same pinned commit as the manifest. A pack member without its own `platforms.web` block runs the pack's module. A plugin with no entry to run is not listed as runnable, and registry CI refuses an entry of `inline`, which names no module.

The entry cannot name code outside that commit, because the commit is what was reviewed. It must be `/`-separated segments made only of ASCII letters, digits, `.`, `_` and `-`, and no segment may be `.` or `..`. Anything else fails registry CI: an absolute URL, a leading `/`, a backslash and a percent-escape, but also a name such as `dist/pack@1.2.0.mjs` or `dist/vt+community.mjs`. When a project opens, the app does not load a published pack whose entry, the pack's own or a member's, does not resolve to such a path inside the pinned commit: none of its plugins load, and the project shows a notice naming the pack.

!!! note "Packs loaded for development"
    A pack loaded from **Settings → Plugins → Development → Load a pack from a URL** is not held to this rule, since it reaches only this device: its entry may be an absolute URL, such as your dev server's. See [quickstart](quickstart.md).

## Storage: metadata only

- The registry holds **path/metadata only** (plus, in its approved-ref lists, a SHA-256 of each approved document). There is **no server-side copy** of the bundle content.
- The **client** fetches pack content via jsDelivr, pinned to the entry's commit SHA: the pack document each time a project opens, and a plugin's code module each time it runs. There is no persistent local cache.

### Verification

The client loads a pack only if its `repo@ref/path` is listed in `registry/approved-{plugin,type,skill}packs.json` and the fetched document matches the SHA-256 recorded there. If the registry is unreachable, a pointer this device has verified before still loads, and any other is held. CI checks that the plugin code module (`platforms.web.entry`) is inside the pinned commit and declares the same version and licence as the manifest (see [publishing](publishing.md#the-pin)).

## Where it fits in the install flow

Installing a Plugin Pack fetches the document at the entry's `repo@ref/path` (via jsDelivr) for the permission view in the install dialog (a Skill Pack's is fetched for its overview), then stores a `{identifier, url, version}` pointer on the project. When the project opens, each pointer is verified against the registry as above, and a plugin's `platforms.web.entry` is resolved against the same pinned commit and loaded in the sandbox worker. For the submission/review gates, see [publishing](publishing.md).

## Next / See also

- [publishing](publishing.md) — submit a one-entry PR; the immutable-`ref` and integrity gates.
- [updates](updates.md) — how a new version becomes an offered update.
- [quickstart](quickstart.md) — **Settings → Plugins → Development → Load a pack from a URL** loads a pack you are writing from a URL, on this device only.
- [plugin manifest](plugin-manifest.md) — `platforms.web.entry` and the rest of the manifest.
- [registry schema](../reference/registry-schema.md) — what the metadata-only entry stores.
