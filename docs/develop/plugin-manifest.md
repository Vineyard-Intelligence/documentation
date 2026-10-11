# Plugin manifest

The plugin manifest is a `vineyard:plugin` document that fully describes one plugin: who made it, where it runs, what graph types it reads and writes, the form it shows before running, the authority it needs, and how it is distributed. It is the single source of truth.

This page walks through the manifest blocks using two real, shipped plugins as examples: **RDAP IP** (from the [IP Recon](https://github.com/Vineyard-Intelligence/pluginpack-ip-recon) pack) and **Wayback Snapshot History** (from the Wayback Machine pack). For the exhaustive, field-by-field schema — every type, pattern, and default — see the [plugin schema reference](../reference/plugin-schema.md).

The required top-level keys are `identifier`, `content_type`, `name`, `version`, `description`, `platforms`, `io`, `scopes`, `lifecycle`, and `distribution`.

## Identity

The identity block names and attributes the plugin: `identifier` (a reverse-DNS `<your-namespace>.plugins.<slug>` string that the marketplace and update checks key off), the constant `content_type` of `vineyard:plugin`, the display `name`, a **SemVer** `version`, a one- to two-sentence `description`, and the optional `author`, `license`, and `icon`. `icon` is a kebab-case **lucide** icon name (e.g. `sitemap`); anything else renders as the default puzzle icon. The optional presentation pointers `thumbnail_url`, `marketing_url`, and `latest_url` are in the [schema reference](../reference/plugin-schema.md) (the update check does not use `latest_url`: an update is offered when the catalog's `version` is newer than the installed one, compared as SemVer — see [Updates](updates.md)).

The AI agent chooses a plugin by its `description`, so say what the plugin takes and what it adds. It also reads each parameter's `description` (or `title`). In its plugin list, a parameter description longer than 300 characters is cut to its first sentence until the agent asks for that plugin, so put the essential rule first.

## Platforms

`platforms` declares where the plugin can execute. It requires at least one of `web` or `desktop`; `primary` names the preferred target. There are two web runtimes:

=== "web (sandbox-js)"

    ```json
    "platforms": {
      "primary": "web",
      "web": { "runtime": "sandbox-js", "entry": "dist/pack.mjs" }
    }
    ```

    `sandbox-js` runs the author's bundled JavaScript inside a dedicated module Web Worker that has no network of its own; it reaches out only through the host: `ctx.net.fetch` (limited to the declared `scopes.network` endpoints), `ctx.service` (`scopes.services`), or, in the desktop app, `ctx.net.probe` (`scopes.web_probe`). This is what RDAP IP uses (`ctx.net.fetch`).

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

!!! warning "Desktop: the app runs the `web` entry; `native`/`subprocess` deferred"
    The schema accepts a `desktop` block (with runtimes `sandbox-js`, `native`, or `subprocess`), but the host does not read it: the Electron shell runs the plugin's `platforms.web` `sandbox-js` entry in the same sandbox worker, not a separate desktop runtime. `native` and `subprocess` runtimes are forward-looking design — do not rely on them executing yet.

The host executes `platforms.web` (runtime `sandbox-js`) on both the web and the desktop app — the `desktop` block and both `fallback` fields are accepted by the schema but not read, so every plugin needs a `web` block. `primary: "desktop"` marks the plugin desktop-only: in a browser it stays listed in the Run plugins panel under **Desktop only**, greyed out and not runnable, rather than hidden. The marketplace labels such packs **Desktop only** but still installs them in the browser.

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

- `consumes` decides where a plugin is offered in the **Run plugins…** panel (opened from a node's or the canvas's right-click menu, the toolbar, or the menu bar): a plugin is listed under *Matches selection* / *Matches project data* when any consumed type is present in the chosen scope (Selected or Whole project). RDAP IP is offered whenever an `infrastructure.ip_address` node is in scope.
- A type reference also accepts an optional `as` binding alias (to pre-bind the consumed node's value into `params` under that key); the schema accepts it, but the run form does not read it yet.
- A plugin with an **empty `consumes` array** is a whole-graph plugin: it is listed in the panel's *Whole-graph / input via form* section instead. A whole-graph plugin with at least one parameter is also offered to the AI agent as a query tool: the agent runs it with no nodes and fills `params` itself.

`produces` is informational — it tells the marketplace and the canvas which node types this plugin can create. See [Type Packs (develop)](typepacks.md) for how these types are defined.

## params — the pre-run form

`params` is a **JSON Schema (draft 2020-12)** describing the form shown before the plugin runs. The submitted object is passed to `run` as `ctx.params` (and kept on the run's task row). The form reads `title` (label), `description` (help text), `type` (text / number / switch), `enum` (a select) and `required` (Run stays disabled until filled); `default`, `pattern`, `minimum` and `maximum` are not applied, so validate and default inside `run`. A property with `"format": "file"` renders a local file picker (`accept` filters it; `"type": "array"` allows several files) and the plugin receives the `File` object(s). Wayback Snapshot History's form:

```json
"params": {
  "type": "object",
  "properties": {
    "from": { "type": "string", "pattern": "^\\d{8}$", "description": "Earliest capture date, YYYYMMDD. Empty = no lower bound." },
    "to": { "type": "string", "pattern": "^\\d{8}$", "description": "Latest capture date, YYYYMMDD. Empty = no upper bound." },
    "limit": { "type": "integer", "minimum": 1, "maximum": 500, "default": 50, "description": "Maximum captures to fetch per node, 1–500. Default 50." },
    "drop_duplicates": { "type": "boolean", "default": true, "description": "Keep only the newest capture of each content digest. On by default." }
  }
}
```

!!! danger "No secrets in params"
    `params` MUST NOT carry secrets (API keys, tokens, passwords, and similar) — submitted values are recorded with the run. Declare credentials as a `scopes.config` entry with `"secret": true` instead — those are collected in the plugin's own settings form and never written to any record. See [Secret handling](security.md).

## scopes — the authority surface

`scopes` is the **only** authority a plugin receives. A capability that is not declared here is simply absent at runtime. RDAP IP reads the source node, writes its result, and fetches from one endpoint:

```json
"scopes": {
  "graph": ["node:read", "node:create", "node:update", "edge:create"],
  "network": [
    { "endpoint": "https://rdap.org/", "methods": ["GET"], "purpose": "Look up each selected IP's netblock and owner in RDAP." }
  ]
}
```

Two rules worth repeating here: for a **web-proxy** plugin, `network` must be exactly one entry equal to `platforms.web.proxy_endpoint`; a `sandbox-js` plugin's `network` entries are checked instead against the host's egress allowlist (see [security](security.md)). `config` entries with `"secret": true` are masked in the form, kept per signed-in account (in the OS keychain on desktop, for the tab session in the browser), and handed to the plugin that declared them. Things like reading this run's `params`, reporting `progress`, writing to `log`, and the cooperative cancel `signal` are **not scopes** — they are always available.

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

The one field the host actually enforces is `timeout_ms` — a wall-clock budget for the run, past which the host terminates the sandbox and fails the task. When `timeout_ms` is omitted the host applies a 10-minute default, and a declared value is clamped to 60 minutes — a manifest can raise its budget but not opt out of one. `controls`, `progress`, and `persistence` are accepted by the schema but not read by the host today. See [Lifecycle](lifecycle.md) and the user-facing [Tasks](../guide/tasks.md) page.

## distribution

`distribution` is the shared descriptive block (used by plugins and Type Packs alike); the host does not read it. What the client runs is decided by the registry entry — it fetches the manifest from `repo@ref/path` via jsDelivr, verifies it against the digest the registry recorded, and loads `platforms.web.entry` from the same commit.

```json
"distribution": {
  "kind": "inline",
  "integrity": { "algo": "sha256", "hash": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad" }
}
```

`kind` is `git`, `zip`, or `inline`. The registry entry's `ref` must be a full commit SHA (40- or 64-hex) — registry CI rejects tags and branches (see [Distribution](distribution.md#integrity)). The full distribution block, including `repository`, `path`, and `archive`, is covered on the [Distribution](distribution.md) page and in the [schema reference](../reference/plugin-schema.md).

## Bundling many plugins

A single bundle can carry more than one plugin. The default export may be one plugin, an array, or a **pack** (`definePluginPack`) — for example the **Chaos Reference Pack** ships six graph-manipulation plugins together. The host flattens packs into individually addressed plugins. See [Plugin Packs](plugin-packs.md).

## Next / See also

- [Plugin schema reference](../reference/plugin-schema.md) — exhaustive field table
- [Scopes reference](../reference/scopes.md)
- [Security & secret handling](security.md)
- [Lifecycle](lifecycle.md) · [Distribution](distribution.md) · [Publishing](publishing.md)
- [Quickstart](quickstart.md) and the [SDK](sdk.md)
