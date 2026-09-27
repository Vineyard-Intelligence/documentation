# Distribution

The `distribution` block records where a plugin's or Type Pack's source lives. The shared schema accepts it, but the Vineyard client does not read it today. What the app loads is decided by the registry entry (`repo`, `ref`, `path`) and, for plugins, by `platforms.web.entry`. One identical block shape is used by both content types — there is no separate plugin vs. Type Pack distribution format.

## The shared block

```jsonc
"distribution": {
  "kind": "git",                            // git | zip | inline
  "repository": "https://github.com/owner/repo",
  "ref": "9f1c2ad7...e6f7",                 // informational; the registry entry's ref is what is pinned
  "path": "manifest.json",                  // file within repo@ref (git kind)
  "integrity": { "algo": "sha256", "hash": "..." },          // OPTIONAL
  "archive": { "url": "https://....zip", "sha256": "..." }   // optional (zip kind)
}
```

The full field-by-field reference lives in the [registry schema](../reference/registry-schema.md); the plugin/Type Pack schemas that embed this block are in [plugin manifest](plugin-manifest.md) and [Type Pack schema](../reference/typepack-schema.md).

!!! warning "`ref` must be immutable — branches and tags are rejected"
    The registry entry's `ref` (the one in `packs/<identifier>.json`) must be a commit SHA, 40-hex or 64-hex. Branches and tags are **rejected** by the entry schema and by `verify_pinned.py`, because they can be moved after review. `distribution.ref` inside the manifest is not checked by CI or read by the client. Pinning the entry to a commit is what makes an installed `identifier@version` reproducible. See [updates](updates.md) for how a *new* `ref` surfaces as an offered upgrade.

## `kind` values

=== "git"

    Fetch the bundle directly from a pinned tree in a GitHub repository. `path` selects the file within `repo@ref`.

    ```jsonc
    "distribution": {
      "kind": "git",
      "repository": "https://github.com/Vineyard-Intelligence/cidr-expand",
      "ref": "4d2f8b19c0a7e6f3b1d5a4c9e8f70123456789ab",
      "path": "manifest.json",
      "integrity": { "algo": "sha256", "hash": "e3b0c44298fc1c149afbf4c8996fb924..." }
    }
    ```

=== "zip"

    Fetch a prebuilt archive (typically a GitHub release asset) named by `archive.url`. `archive.sha256` is required whenever `archive` is present.

    ```jsonc
    "distribution": {
      "kind": "zip",
      "repository": "https://github.com/Vineyard-Intelligence/chaos-pack",
      "ref": "v1.2.0",
      "archive": {
        "url": "https://github.com/Vineyard-Intelligence/chaos-pack/releases/download/v1.2.0/chaos-pack.zip",
        "sha256": "9b74c9897bac770ffc029102a200c5de..."
      }
    }
    ```

=== "inline"

    `inline` is still an accepted `kind` in the schema, but no shipped pack uses it and the app cannot run one. Packs are no longer bundled into the app, and a plugin whose `platforms.web.entry` is `inline` (or missing), with no pack-level entry to inherit, is not listed as runnable. The Chaos pack's six [reference plugins](../guide/running-plugins.md) (Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node) are loaded from `dist/pack.mjs` at the pack's pinned commit, like every other pack.

    ```jsonc
    "distribution": {
      "kind": "inline",
      "integrity": { "algo": "sha256", "hash": "..." }
    }
    ```

## Storage: metadata only

The most important property of Vineyard distribution is what the registry **does not** store:

- The registry holds **path/metadata only** (plus, in its approved-ref lists, a SHA-256 of each approved document). There is **no server-side copy** of the bundle content.
- The **client** fetches the bundle (via jsDelivr, pinned to the entry's immutable commit SHA) and runs it directly — fetched on project load, with the pack document (not the code module) checked against the approved list and its recorded SHA-256, not a persistent local cache (no IndexedDB, no on-disk cache on desktop).

### `integrity`

`distribution.integrity` is accepted by the schema but not read by anything. Verification comes from the registry instead. CI publishes `registry/approved-{plugin,type,skill}packs.json`, which lists every `repo@ref/path` the registry has ever approved, with a SHA-256 of that document's bytes. Before loading a pack, the client requires its pointer to be on that list and requires the fetched document to hash to the recorded digest. If the registry is unreachable, a pointer this device has verified before still loads, and any other is held. The plugin code module (`platforms.web.entry`) is not hashed by the client. CI checks that it declares the same version and licence as the manifest (see [publishing](publishing.md#the-pin)).

## Where it fits in the install flow

Installing a single Plugin Pack fetches the document at the entry's `repo@ref/path` (via jsDelivr) for the permission view in
the install dialog (a Skill Pack's is fetched for its overview). Installing stores a `{identifier, url, version}` pointer on the project. When the project
opens, each pointer must appear in the registry's approved-ref lists. The document is fetched and its
SHA-256 checked against the digest the registry recorded. A plugin's `platforms.web.entry` is resolved
against the same pinned commit and loaded with `import()` in the sandbox worker. There is **no persistent
local cache**, and the code module itself is not digest-checked. For the full pipeline and the submission/review gates, see [publishing](publishing.md).

## Next / See also

- [publishing](publishing.md) — submit a one-entry PR; the immutable-`ref` and integrity gates.
- [updates](updates.md) — how a newer `ref` becomes an offered upgrade.
- [quickstart](quickstart.md) — Developer Mode loads bundles without GitHub.
- [plugin manifest](plugin-manifest.md) and [Type Pack schema](../reference/typepack-schema.md) — both embed this block.
- [registry schema](../reference/registry-schema.md) — what the metadata-only entry stores.
