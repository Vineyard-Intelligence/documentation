# Plugin manifest

The plugin manifest is a `vineyard:plugin` document that fully describes one plugin: who made it, where it runs, what graph types it reads and writes, the form it shows before running, the authority it needs, and how it is distributed. It is the single source of truth — there is no separate server-side Plugin record.

This page explains how the manifest blocks fit together and the UX behaviour they drive, using the real [`cidr_expand`](plugin-manifest.md) plugin as the example. For the exhaustive, field-by-field schema — every type, pattern, and default — see the [plugin schema reference](../reference/plugin-schema.md), where the fully annotated `cidr_expand` manifest also lives.

The required top-level keys are `identifier`, `content_type`, `name`, `version`, `description`, `platforms`, `io`, `scopes`, `lifecycle`, and `distribution`.

## Identity

The identity block names and attributes the plugin: `identifier` (a reverse-DNS `run.vineyard.plugins.<slug>` string that the marketplace and update checks key off), the constant `content_type` of `vineyard:plugin`, the display `name`, a **SemVer** `version` (the registry orders releases by SemVer — see [Updates](updates.md)), a one- to two-sentence `description`, and the optional `author`, `license`, and `icon`. The `icon` value is **polymorphic**, resolved in order: a `data:`/`http(s):` image URI is drawn directly; otherwise a kebab-case **lucide** name (e.g. `sitemap`) renders as an SVG; otherwise a literal glyph/emoji. This is the same resolver used for Type Pack node icons. The optional presentation pointers `thumbnail_url`, `marketing_url`, and `latest_url` (the last participates in the update flow) are in the [schema reference](../reference/plugin-schema.md).

## Platforms

`platforms` declares where the plugin can execute. It requires at least one of `web` or `desktop`; `primary` names the preferred target. There are two web runtimes:

=== "web (sandbox-js)"

    ```json
    "platforms": {
      "primary": "web",
      "web": { "runtime": "sandbox-js", "entry": "dist/cidr.js" }
    }
    ```

    `sandbox-js` runs the author's bundled JavaScript inside a dedicated module Web Worker. Egress is governed by CSP. CIDR Expand is pure compute, so this is all it needs.

=== "web (web-proxy)"

    ```json
    "platforms": {
      "primary": "web",
      "web": {
        "runtime": "web-proxy",
        "entry": "dist/client.js",
        "proxy_endpoint": "https://api.example.com/run"
      }
    }
    ```

    `web-proxy` is the CORS escape hatch: the worker is a thin client that calls exactly **one** author-controlled endpoint. When `runtime` is `web-proxy`, `proxy_endpoint` is required and **must equal the single `scopes.network` entry** (no fan-out).

!!! warning "Desktop is DEFERRED"
    The schema accepts a `desktop` block (with runtimes `sandbox-js`, `native`, or `subprocess`), but the **desktop runtime is not yet shipped**. Today, author and test against `web`. A manifest may declare `desktop` for forward compatibility, but do not rely on it executing.

Each platform block may set `fallback` (`desktop`/`web`/`none`) describing what to tell the user when this platform cannot run the plugin. The installer **greys out** unsupported plugins rather than hiding them, so a web-only plugin still appears in the catalog with a clear, disabled state.

## io — consumes and produces

`io` ties the plugin to the graph by referencing entity types from Type Packs. Both `consumes` and `produces` are required arrays (either may be empty), and each entry is a type reference of `{ typepack, category, name, as? }` — `category` and `name` together form the qualified runtime type, so `Node.type` equals `<category>.<name>`.

```json
"io": {
  "consumes": [
    { "typepack": "run.vineyard.typepacks.infrastructure", "category": "infrastructure", "name": "netblock", "as": "cidr" }
  ],
  "produces": [
    { "typepack": "run.vineyard.typepacks.infrastructure", "category": "infrastructure", "name": "ip_address" }
  ]
}
```

`consumes` shapes the UX:

- A plugin appears on a node's **right-click menu** when that node's `type` matches one of its consumed type references. CIDR Expand surfaces on any `infrastructure.netblock` node.
- `as` (consumes only) is an optional binding alias: the consumed node's value is **pre-bound into `params` under this key** when the run form opens. Because of `"as": "cidr"`, clicking the menu item pre-fills the `cidr` param with the node's value, so the user usually just confirms and runs.
- A plugin with an **empty `consumes` array** is a whole-graph plugin: it does not attach to any node and is launched from the global **"Run plugin"** menu instead.

`produces` is informational — it tells the marketplace and the canvas which node types this plugin can create. See [Type Packs (develop)](typepacks.md) for how these types are defined.

## params — the pre-run form

`params` is a **JSON Schema (draft 2020-12)** describing the form shown before the plugin runs. The submitted, validated object becomes `Task.input` and is passed to the plugin's `run` function. Standard JSON Schema keywords drive the rendered form and its client-side validation: `title` becomes the label, `description` the help text, `default` the prefilled value, and `required`/`pattern`/`minimum`/`maximum`/`enum` enforce constraints. A field bound by `io.consumes` `as` (here `cidr`) arrives pre-filled from the consumed node.

!!! danger "No secrets in params — rejected at lint"
    `params` MUST NOT carry secrets. The registry linter **rejects** secret-looking param keys (API keys, tokens, passwords, and similar). Secrets are never submitted through the run form because that value would land in `Task.input`. Declare credentials as a `scopes.config` entry with `"secret": true` instead — those are injected at runtime only and never written to any record. See [Secret handling](security.md).

## scopes — the authority surface

`scopes` is the **only** authority a plugin receives. A capability that is not declared here is simply absent at runtime — there is nothing to bypass. CIDR Expand needs only to read the source node and create nodes and edges:

```json
"scopes": {
  "graph": ["node:read", "node:create", "edge:create"]
}
```

Two rules worth repeating here: for a **web** plugin, `network` must be exactly one entry equal to `platforms.web.proxy_endpoint`; and `config` entries with `"secret": true` are desktop/keychain-only and never returned to the browser. Things like reading this run's `params`, reporting `progress`, writing to `log`, and the cooperative cancel `signal` are **not scopes** — they are always available.

For the full scope vocabulary, the scope families, and the enforcement model, see the [scopes reference](../reference/scopes.md).

## lifecycle

`lifecycle` declares how the runtime manages the task. CIDR Expand is a short, cancellable, ephemeral job that reports determinate progress:

```json
"lifecycle": {
  "long_running": false,
  "controls": ["cancel", "progress"],
  "progress": "determinate",
  "persistence": "ephemeral"
}
```

- **`long_running`** — when `true`, the runtime continuously manages the task (status/pause/resume/cancel/retry/progress). Defaults to `false`.
- **`controls`** — which controls the UI exposes, from `pause`, `resume`, `cancel`, `retry`, `progress`.
- **`progress`** — `none`, `determinate`, or `indeterminate`.
- **`persistence`** — `ephemeral` (no Task DB row, current browser only), `opt-in`, or `always`. Defaults to `ephemeral`.

The canonical task state machine is the 7 states `queued → running → waiting → paused → cancelled → succeeded → failed`; retry mints a **new** task rather than being a state. See [Lifecycle](lifecycle.md) and the user-facing [Tasks](../guide/tasks.md) page.

## distribution

`distribution` is the shared block (used by plugins and Type Packs alike) that tells the client where to fetch the bundle. There is no server-side copy; the client caches the fetched bundle locally.

```json
"distribution": {
  "kind": "inline",
  "integrity": { "algo": "sha256", "hash": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad" }
}
```

`kind` is `git`, `zip`, or `inline`. For `git`, the `ref` must be an **immutable** 40-char commit SHA or annotated tag (branches are rejected by registry CI). The optional `integrity` hash detects a force-push at install. The full distribution block, including `repository`, `path`, and `archive`, is covered on the [Distribution](distribution.md) page and in the [schema reference](../reference/plugin-schema.md).

## Bundling many plugins

A single bundle can carry more than one plugin. The default export may be one plugin, an array, or a **pack** (`definePluginPack`) — for example the **Chaos Reference Pack** ships six graph-manipulation plugins together. The host flattens packs into individually addressed plugins. See [Plugin Packs](plugin-packs.md).

## Next / See also

- [Plugin schema reference](../reference/plugin-schema.md) — exhaustive field table
- [Scopes reference](../reference/scopes.md)
- [Security & secret handling](security.md)
- [Lifecycle](lifecycle.md) · [Distribution](distribution.md) · [Publishing](publishing.md)
- [Quickstart](quickstart.md) and the [SDK](sdk.md)
