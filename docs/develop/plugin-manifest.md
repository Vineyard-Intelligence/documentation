# Plugin manifest

The plugin manifest is a `vineyard:plugin` document that fully describes one plugin: who made it, where it runs, what graph types it reads and writes, the form it shows before running, the authority it needs, and how it is distributed. It is the single source of truth — there is no separate server-side Plugin record.

This page walks through the manifest blocks using two real, shipped plugins as examples: **RDAP IP** (from the [IP Recon](https://github.com/Vineyard-Intelligence/pluginpack-ip-recon) pack) and **Wayback Snapshot History** (from the Wayback Machine pack). For the exhaustive, field-by-field schema — every type, pattern, and default — see the [plugin schema reference](../reference/plugin-schema.md).

The required top-level keys are `identifier`, `content_type`, `name`, `version`, `description`, `platforms`, `io`, `scopes`, `lifecycle`, and `distribution`.

## Identity

The identity block names and attributes the plugin: `identifier` (a reverse-DNS `<your-namespace>.plugins.<slug>` string that the marketplace and update checks key off), the constant `content_type` of `vineyard:plugin`, the display `name`, a **SemVer** `version` (the registry orders releases by SemVer — see [Updates](updates.md)), a one- to two-sentence `description`, and the optional `author`, `license`, and `icon`. The `icon` value is **polymorphic**, resolved in order: a `data:`/`http(s):` image URI is drawn directly; otherwise a kebab-case **lucide** name (e.g. `sitemap`) renders as an SVG; otherwise a literal glyph/emoji. This is the same resolver used for Type Pack node icons. The optional presentation pointers `thumbnail_url`, `marketing_url`, and `latest_url` (the last participates in the update flow) are in the [schema reference](../reference/plugin-schema.md).

## Platforms

`platforms` declares where the plugin can execute. It requires at least one of `web` or `desktop`; `primary` names the preferred target. There are two web runtimes:

=== "web (sandbox-js)"

    ```json
    "platforms": {
      "primary": "web",
      "web": { "runtime": "sandbox-js", "entry": "dist/pack.mjs" }
    }
    ```

    `sandbox-js` runs the author's bundled JavaScript inside a dedicated module Web Worker, reaching out only through `ctx.net.fetch` against the host's egress allowlist. This is what RDAP IP uses.

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

    `web-proxy` is designed as the CORS escape hatch: the worker would be a thin client calling exactly **one** author-controlled endpoint, with `proxy_endpoint` required to equal the single `scopes.network` entry (no fan-out). **The schema accepts this value, but no runtime dispatches it yet** — do not ship a plugin that depends on it.

!!! warning "Desktop: `sandbox-js` ships; `native`/`subprocess` deferred"
    The schema accepts a `desktop` block (with runtimes `sandbox-js`, `native`, or `subprocess`). The `sandbox-js` desktop runtime **ships today** via the Electron shell. `native` and `subprocess` runtimes are forward-looking design — do not rely on them executing yet.

Each platform block may set its own `fallback` describing what to tell the user when this platform cannot run the plugin — `web.fallback` is `desktop` or `none`; `desktop.fallback` is `web` or `none`. The installer **greys out** unsupported plugins rather than hiding them, so a web-only plugin still appears in the catalog with a clear, disabled state.

## io — consumes and produces

`io` ties the plugin to the graph by referencing entity types from Type Packs. Both `consumes` and `produces` are required arrays (either may be empty), and each entry is a type reference of `{ typepack, category, name, as? }` — `category` and `name` together form the qualified runtime type, so `Node.type` equals `<category>.<name>`.

```json
"io": {
  "consumes": [
    { "typepack": "run.vineyard.typepacks.infrastructure", "category": "infrastructure", "name": "ip_address" }
  ],
  "produces": [
    { "typepack": "run.vineyard.typepacks.infrastructure", "category": "infrastructure", "name": "netblock" }
  ]
}
```

This is RDAP IP's `io`: it takes an `infrastructure.ip_address` node and adds the owning `infrastructure.netblock`.

`consumes` shapes the UX:

- A plugin appears on a node's **right-click menu** when that node's `type` matches one of its consumed type references. RDAP IP surfaces on any `infrastructure.ip_address` node.
- A type reference also accepts an optional `as` binding alias, meant to pre-bind the consumed node's value into `params` under that key. The field is accepted by the schema, but no shipped plugin declares it and the run form does not read it yet.
- A plugin with an **empty `consumes` array** is a whole-graph plugin: it does not attach to any node and is launched from the global **"Run plugin"** menu instead.

`produces` is informational — it tells the marketplace and the canvas which node types this plugin can create. See [Type Packs (develop)](typepacks.md) for how these types are defined.

## params — the pre-run form

`params` is a **JSON Schema (draft 2020-12)** describing the form shown before the plugin runs. The submitted, validated object becomes `Task.input` and is passed to the plugin's `run` function. Standard JSON Schema keywords drive the rendered form and its client-side validation: `title` becomes the label, `description` the help text, `default` the prefilled value, and `required`/`pattern`/`minimum`/`maximum`/`enum` enforce constraints. Wayback Snapshot History's form:

```json
"params": {
  "type": "object",
  "properties": {
    "from": { "type": "string", "pattern": "^\\d{8}$", "description": "Earliest capture date, YYYYMMDD. Empty = no lower bound." },
    "to": { "type": "string", "pattern": "^\\d{8}$", "description": "Latest capture date, YYYYMMDD. Empty = no upper bound." },
    "limit": { "type": "integer", "minimum": 1, "maximum": 500, "default": 50, "description": "Maximum captures to fetch." },
    "drop_duplicates": { "type": "boolean", "default": true, "description": "Drop captures whose content digest repeats an earlier one." }
  }
}
```

!!! danger "No secrets in params"
    `params` MUST NOT carry secrets (API keys, tokens, passwords, and similar) — a submitted value lands in `Task.input`. Declare credentials as a `scopes.config` entry with `"secret": true` instead — those are injected at runtime only and never written to any record. See [Secret handling](security.md).

## scopes — the authority surface

`scopes` is the **only** authority a plugin receives. A capability that is not declared here is simply absent at runtime — there is nothing to bypass. RDAP IP reads the source node, writes its result, and fetches from one endpoint:

```json
"scopes": {
  "graph": ["node:read", "node:create", "node:update", "edge:create"],
  "network": [
    { "endpoint": "https://rdap.org/", "methods": ["GET"], "purpose": "RDAP bootstrap → authoritative RIR" }
  ]
}
```

Two rules worth repeating here: for a **web-proxy** plugin, `network` must be exactly one entry equal to `platforms.web.proxy_endpoint`; a `sandbox-js` plugin's `network` entries are checked instead against the host's egress allowlist (see [security](security.md)). `config` entries with `"secret": true` are desktop/keychain-only and never returned to the browser. Things like reading this run's `params`, reporting `progress`, writing to `log`, and the cooperative cancel `signal` are **not scopes** — they are always available.

For the full scope vocabulary, the scope families, and the enforcement model, see the [scopes reference](../reference/scopes.md).

## lifecycle

`lifecycle` declares the run's timeout budget. RDAP IP:

```json
"lifecycle": {
  "persistence": "opt-in",
  "controls": ["progress", "cancel"],
  "progress": "determinate"
}
```

The one field the host actually enforces is `timeout_ms` — a wall-clock budget for the run, past which the host terminates the sandbox and fails the task. `controls`, `progress`, and `persistence` are accepted by the schema but not read by the host today. See [Lifecycle](lifecycle.md) and the user-facing [Tasks](../guide/tasks.md) page.

## distribution

`distribution` is the shared block (used by plugins and Type Packs alike) that tells the client where to fetch the bundle. There is no server-side copy; the client fetches it directly (via jsDelivr, pinned to the immutable commit SHA) on each run.

```json
"distribution": {
  "kind": "inline",
  "integrity": { "algo": "sha256", "hash": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad" }
}
```

`kind` is `git`, `zip`, or `inline`. For `git`, the `ref` must be an **immutable** 40-char commit SHA or annotated tag (branches are rejected by registry CI) — that pin, not the optional `integrity` hash, is what stops a force-push from changing what runs (see [Distribution](distribution.md#integrity)). The full distribution block, including `repository`, `path`, and `archive`, is covered on the [Distribution](distribution.md) page and in the [schema reference](../reference/plugin-schema.md).

## Bundling many plugins

A single bundle can carry more than one plugin. The default export may be one plugin, an array, or a **pack** (`definePluginPack`) — for example the **Chaos Reference Pack** ships six graph-manipulation plugins together. The host flattens packs into individually addressed plugins. See [Plugin Packs](plugin-packs.md).

## Next / See also

- [Plugin schema reference](../reference/plugin-schema.md) — exhaustive field table
- [Scopes reference](../reference/scopes.md)
- [Security & secret handling](security.md)
- [Lifecycle](lifecycle.md) · [Distribution](distribution.md) · [Publishing](publishing.md)
- [Quickstart](quickstart.md) and the [SDK](sdk.md)
