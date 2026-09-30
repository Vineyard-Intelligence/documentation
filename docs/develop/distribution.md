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
    The registry entry's `ref` (the one in `packs/<identifier>.json`) must be a commit SHA, 40-hex or 64-hex. Branches and tags are **rejected** by the entry schema and by `verify_pinned.py`, because they can be moved after review. `distribution.ref` inside the manifest is not checked by CI or read by the client. See [updates](updates.md) for how a *new* `ref` surfaces as an offered upgrade.

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

    `inline` is an accepted `kind` in the schema, but the app cannot run it. A plugin whose `platforms.web.entry` is `inline` (or missing), with no pack-level entry to inherit, is not listed as runnable.

    ```jsonc
    "distribution": {
      "kind": "inline",
      "integrity": { "algo": "sha256", "hash": "..." }
    }
    ```

## Storage: metadata only

- The registry holds **path/metadata only** (plus, in its approved-ref lists, a SHA-256 of each approved document). There is **no server-side copy** of the bundle content.
- The **client** fetches the bundle via jsDelivr, pinned to the entry's commit SHA, each time a project opens. There is no persistent local cache.

### `integrity`

`distribution.integrity` is accepted by the schema but not read by anything. Verification comes from the registry instead: the client loads a pack only if its `repo@ref/path` is listed in `registry/approved-{plugin,type,skill}packs.json` and the fetched document matches the SHA-256 recorded there. If the registry is unreachable, a pointer this device has verified before still loads, and any other is held. CI checks that the plugin code module (`platforms.web.entry`) declares the same version and licence as the manifest (see [publishing](publishing.md#the-pin)).

## Where it fits in the install flow

Installing a Plugin Pack fetches the document at the entry's `repo@ref/path` (via jsDelivr) for the permission view in the install dialog (a Skill Pack's is fetched for its overview), then stores a `{identifier, url, version}` pointer on the project. When the project opens, each pointer is verified against the registry as above, and a plugin's `platforms.web.entry` is resolved against the same pinned commit and loaded in the sandbox worker. For the submission/review gates, see [publishing](publishing.md).

## Next / See also

- [publishing](publishing.md) — submit a one-entry PR; the immutable-`ref` and integrity gates.
- [updates](updates.md) — how a newer `ref` becomes an offered upgrade.
- [quickstart](quickstart.md) — Developer Mode loads bundles without GitHub.
- [plugin manifest](plugin-manifest.md) and [Type Pack schema](../reference/typepack-schema.md) — both embed this block.
- [registry schema](../reference/registry-schema.md) — what the metadata-only entry stores.
