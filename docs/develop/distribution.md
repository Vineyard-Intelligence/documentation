# Distribution

The `distribution` block tells the Vineyard client **where to fetch the bundle** for a plugin or Type Pack and, optionally, **how to verify it**. One identical block shape is used by both content types — there is no separate plugin vs. Type Pack distribution format.

## The shared block

```jsonc
"distribution": {
  "kind": "git",                            // git | zip | inline
  "repository": "https://github.com/owner/repo",
  "ref": "9f1c2ad7...e6f7",                 // IMMUTABLE: 40-char SHA or annotated tag (branches rejected)
  "path": "manifest.json",                  // file within repo@ref (git kind)
  "integrity": { "algo": "sha256", "hash": "..." },          // OPTIONAL
  "archive": { "url": "https://....zip", "sha256": "..." }   // optional (zip kind)
}
```

The full field-by-field reference lives in the [registry schema](../reference/registry-schema.md); the plugin/Type Pack schemas that embed this block are in [plugin manifest](plugin-manifest.md) and [Type Pack schema](../reference/typepack-schema.md).

!!! warning "`ref` must be immutable — branches are rejected"
    A `ref` that is not a commit SHA — a branch like `main`, but equally a tag, which can be moved after review — is **rejected** by CI at submission. Pin to a 40-char commit SHA so that `repo@ref` always resolves to the exact bytes that were reviewed. This is what makes an installed `identifier@version` reproducible. See [updates](updates.md) for how a *new* `ref` surfaces as an offered upgrade.

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

    Fetch a prebuilt archive (typically a GitHub release asset) named by `archive.url`, with an optional `archive.sha256`.

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

    The bundle ships **inline** in the manifest itself — used by the six [reference plugins](../guide/running-plugins.md) (Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node) and other tiny, fully self-contained plugins. No external fetch is required.

    ```jsonc
    "distribution": {
      "kind": "inline",
      "integrity": { "algo": "sha256", "hash": "..." }
    }
    ```

## Storage: metadata only

The most important property of Vineyard distribution is what the registry **does not** store:

- The registry holds **path/metadata only**. There is **no server-side copy** of the bundle content.
- The **client** fetches the bundle (via jsDelivr, pinned to the entry's immutable commit SHA) and runs it directly — a plain `fetch()` per run today, not a persistent local cache (no IndexedDB, no on-disk cache on desktop).

### What `integrity` actually does today

**Not currently enforced.** The `integrity` field is accepted by the schema and can be attached to a
submission, but nothing in the client's load path (`plugins/remote.ts`) reads or checks it — a bundle
is fetched and run regardless of whether this field is present or matches. Treat it as reserved for a
future enforcement layer, not as an active protection. The guarantee you can actually rely on today is
the **immutable commit-SHA pin** on `ref` (see [publishing](publishing.md)) plus jsDelivr serving that
exact commit — that is what stops a moved tag or a force-push from silently changing what runs, not a
client-side hash check.

## Where it fits in the install flow

The app-side install pipeline resolves the entry, fetches the full manifest at `repo@ref/path`, fetches
the bundle according to `distribution.kind` (zip asset / git tree / inline) with a plain fetch — **no
local persistent cache and no integrity check today** — then shows the scope-approval dialog and
activates. For the full pipeline and the submission/review gates, see [publishing](publishing.md).

## Next / See also

- [publishing](publishing.md) — submit a one-entry PR; the immutable-`ref` and integrity gates.
- [updates](updates.md) — how a newer `ref` becomes an offered upgrade with a scope diff.
- [quickstart](quickstart.md) — Developer Mode loads bundles without GitHub.
- [plugin manifest](plugin-manifest.md) and [Type Pack schema](../reference/typepack-schema.md) — both embed this block.
- [registry schema](../reference/registry-schema.md) — what the metadata-only entry stores.
