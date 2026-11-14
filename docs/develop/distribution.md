# Distribution

What the app loads is decided by the registry entry — `repo`, `ref` and `path` — and, for plugins, by `platforms.web.entry`. A pack document does not describe where it is published; the registry entry that points at it does.

## The pinned pointer

A registry entry (`packs/<identifier>.json`) names the content repo (`repo`, as `owner/name`), the commit to load (`ref`) and the document's path within that commit (`path`). The client fetches `https://cdn.jsdelivr.net/gh/{repo}@{ref}/{path}`. The full field-by-field reference lives in the [registry schema](../reference/registry-schema.md).

!!! warning "`ref` must be immutable — branches and tags are rejected"
    The registry entry's `ref` must be a commit SHA, 40-hex or 64-hex. Branches and tags are **rejected** by the entry schema and by `verify_pinned.py`, because they can be moved after review. See [updates](updates.md) for how a new version becomes an offered update.

## The code module: `platforms.web.entry` {#entry}

A plugin's `platforms.web.entry` names the module the plugin worker imports: a path inside the repository, relative to the repo root (for example `dist/pack.mjs`), resolved against the same pinned commit as the manifest. A pack member without its own `platforms.web` block runs the pack's module. A plugin with no entry to run is not listed as runnable, and registry CI refuses an entry of `inline`, which names no module.

The entry cannot name code outside that commit, because the commit is what was reviewed. It must be `/`-separated segments made only of ASCII letters, digits, `.`, `_` and `-`, and no segment may be `.` or `..`. Anything else fails registry CI: an absolute URL, a leading `/`, a backslash and a percent-escape, but also a name such as `dist/pack@1.2.0.mjs` or `dist/vt+community.mjs`. When a project opens, the app does not load a published pack whose entry, the pack's own or a member's, does not resolve to such a path inside the pinned commit: none of its plugins load, and the project shows a notice naming the pack.

### One self-contained file {#one-file}

The worker does not import the module from its URL. The app fetches it, checks it (see [verification](#verification)), and hands the worker those bytes as a `blob:` URL, so the module cannot reach a file next to it. It must be one self-contained ES module:

- no static or dynamic `import` of another file, relative or absolute, and no `import.meta.url` to find assets by;
- no WebAssembly, and no `eval` or `new Function`: the worker refuses them;
- everything else bundled in, for example with `esbuild --bundle --format=esm`.

Every published pack's `dist/pack.mjs` is such a file. A `new Blob([...])` built at run time works; turning one into a URL (`URL.createObjectURL`) does not.

!!! note "Packs loaded for development"
    A pack loaded from **Settings → Plugins → Development → Load a pack from a URL** is not held to this rule, since it reaches only this device: its entry may be an absolute URL, such as your dev server's. See [quickstart](quickstart.md).

## Storage: metadata only

- The registry holds **path/metadata only** (plus, in its approved-ref lists, a SHA-256 of each approved document and of each code module a Plugin Pack runs). There is **no server-side copy** of the bundle content.
- The **client** fetches pack content via jsDelivr, pinned to the entry's commit SHA: the pack document each time a project opens, and a plugin's code module each time it runs. There is no persistent local cache.

### Verification {#verification}

The client loads a pack only if its `repo@ref/path` is listed in `registry/approved-{plugin,type,skill}packs.json` and the fetched document matches the SHA-256 recorded there. If the registry is unreachable, a pointer this device has verified before still loads, checked against the digests this device kept the last time the registry listed it, and any other is held. CI checks that the plugin code module (`platforms.web.entry`) is inside the pinned commit and declares the same version and licence as the manifest (see [publishing](publishing.md#the-pin)).

The code is checked the same way. A Plugin Pack's approved row also records the SHA-256 of each code module the pack runs, the pack's and any member's own (`bundle_sha256`). Each time a plugin runs, the app fetches its module from jsDelivr, refuses bytes that do not match, and gives the plugin worker only the bytes it checked. A pack whose row records these digests but not one for a module the pack runs is not loaded at all, with the same notice as an entry outside the commit. Both digests are of the bytes GitHub holds at the pinned commit, never of what the CDN served the registry: the registry fetches each file from GitHub and from jsDelivr, records GitHub's digest, and fails its build when the two differ. A row approved before code digests were recorded, or whose code GitHub could not serve when the registry was built, has none, and its code is checked by its listing alone; a pack the catalog lists today always has them, because the registry does not publish a list in which one lacks them. While the registry is unreachable, a pack is held to the digests this device kept for it; one this device has not seen listed since it began keeping them is checked by its listing alone. The app runs plugin code only from `https://cdn.jsdelivr.net/gh/`, including a pack loaded for development, except in the frontend's own `npm run dev` build.

## Where it fits in the install flow

Installing a Plugin Pack fetches the document at the entry's `repo@ref/path` (via jsDelivr) for the permission view in the install dialog (a Skill Pack's is fetched for its overview), then stores a `{identifier, url, version}` pointer on the project. When the project opens, each pointer is verified against the registry as above, and a plugin's `platforms.web.entry` is resolved against the same pinned commit and loaded in the sandbox worker. For the submission/review gates, see [publishing](publishing.md).

## Next / See also

- [publishing](publishing.md) — submit a one-entry PR; the immutable-`ref` and integrity gates.
- [updates](updates.md) — how a new version becomes an offered update.
- [quickstart](quickstart.md) — **Settings → Plugins → Development → Load a pack from a URL** loads a pack you are writing from a URL, on this device only.
- [plugin manifest](plugin-manifest.md) — `platforms.web.entry` and the rest of the manifest.
- [registry schema](../reference/registry-schema.md) — what the metadata-only entry stores.
