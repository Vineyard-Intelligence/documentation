# Plugin Packs

A **Plugin Pack** is one bundle that ships many plugins — the plugin-side analog of a Type Pack carrying many `types`. The host flattens the pack into individually addressed plugins, the registry shows it as a single card, and installing it adds every contained plugin at once.

## One file, many plugins

A plugin bundle's default export does not have to be a single plugin. It may be:

- **a single plugin** — `export default definePlugin({ manifest, run })`,
- **an array of plugins** — `export default [definePlugin(...), definePlugin(...)]`, or
- **a pack** — `export default definePluginPack({ ..., plugins: [...] })`.

The host accepts all three shapes and normalizes them. This lets one author repository, one build, and one registry entry deliver a family of related plugins — for example the six graph-manipulation tools in the [Chaos reference pack](../guide/running-plugins.md).

## `definePluginPack`

A pack is declared with `definePluginPack` from the SDK (`@vineyard/plugin-sdk`). The pack-level fields describe the *bundle*, while each entry in `plugins` is a full plugin definition with its own manifest and `run`.

```ts
import { definePlugin, definePluginPack } from "@vineyard/plugin-sdk";

export default definePluginPack({
  identifier: "run.vineyard.pluginpacks.chaos",   // the pack id
  content_type: "vineyard:pluginpack",
  name: "Chaos Reference Pack",
  version: "1.0.0",
  plugins: [
    definePlugin({ manifest: {/* … */}, run: koreanRoulette }),
    definePlugin({ manifest: {/* … */}, run: russianRoulette }),
    /* …more… */
  ],
});
```

| Field          | Notes |
| -------------- | ----- |
| `identifier`   | The **pack id**, a reverse-DNS string `run.vineyard.pluginpacks.*` (e.g. `run.vineyard.pluginpacks.chaos`). It names the bundle, not any one contained plugin. |
| `content_type` | `vineyard:pluginpack` — the bundle's own kind. Each contained plugin still carries `vineyard:plugin`. |
| `name`         | Human-readable pack name shown on the marketplace card. |
| `version`      | SemVer for the bundle as a whole. |
| `plugins`      | The array of `definePlugin(...)` entries. Each carries its **own** `identifier`, `scopes`, `io`, and `lifecycle`. |

Contained plugins are not subordinate: each declares its own `identifier`, `scopes`, and lifecycle. The pack is purely a packaging convenience — once flattened, the contained plugins behave exactly like independently published ones.

## How the host flattens a pack

When the client loads a bundle, it calls `flattenPlugins` on whatever the module default-exported. Packs, arrays, and singles all collapse to the same thing: a flat list of plugins, **each addressed by its own `identifier`**.

```text
default export (pack | array | single)
        │  flattenPlugins(...)
        ▼
run.vineyard.plugins.korean_roulette
run.vineyard.plugins.russian_roulette
run.vineyard.plugins.thanos_snap
run.vineyard.plugins.black_hole
run.vineyard.plugins.dumb_ai_optimizer
run.vineyard.plugins.schrodingers_node
```

After flattening there is no special "pack" runtime object — there are just plugins. Korean Roulette runs in its own sandboxed Web Worker with only its declared scopes (`node:read`, `node:delete`, `edge:read`, `edge:delete`), independent of the other five, even though all six shipped in one file.

## How a pack appears in the registry

The Marketplace registry is **metadata-only** (it stores pointers, not code), and each entry is a lean projection of the full manifest that lives in the author's repo. A pack still occupies a **single registry entry**, keyed by the pack identifier. Two derived fields make a pack legible from the listing:

- `plugin_count` — the number of plugins bundled (6 for the Chaos pack; omitted or `1` for an ordinary single-plugin entry). The marketplace uses it to label the card ("6 plugins") and to signal that installing once adds all of them together.
- `scopes_summary` — a roll-up of the contained plugins' authority (e.g. `graph_write: true`) so the card can summarize what the whole pack does without fetching each manifest.

The full list of contained plugin identifiers lives in the **manifest** at `repo@ref/path`; the lean catalog row carries the count, and the client resolves the individual plugins from the fetched bundle. The exact registry-entry shape — `plugin_count`, `scopes_summary`, and the lean projection — is documented in [Publishing](publishing.md).

The marketplace shows a pack as **one card** and installs all contained plugins together — but once installed, each is launched, scoped, and run on its own.

## When to use a pack

Reach for a pack when several plugins share a repo, a build pipeline, a theme, or a release cadence — like a demo/validation set or a coherent toolkit. If two plugins are genuinely unrelated, ship them as separate entries instead so users can install only what they want.

## Next / See also

- [Plugin manifest](plugin-manifest.md) — the per-plugin fields that each pack entry carries.
- [Scopes reference](../reference/scopes.md) — the authority each contained plugin declares independently.
- [SDK](sdk.md) — `definePlugin`, `definePluginPack`, and the `run` contract.
- [Running plugins](../guide/running-plugins.md) — the Chaos pack and the other first implementations.
- [Registry schema](../reference/registry-schema.md) — `plugin_count`, `scopes_summary`, and the lean catalog projection.
