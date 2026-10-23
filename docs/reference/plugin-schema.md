# Plugin manifest schema

The authoritative, field-by-field reference for `plugin.schema.json` — the JSON Schema (draft 2020-12) that defines the `vineyard:plugin` manifest format. It is the format contract, not a gate: neither registry CI nor the app validates pack documents against `plugin.schema.json` or `pluginpack.schema.json`. For the prose walkthrough and authoring guidance, see the [manifest guide](../develop/plugin-manifest.md).

!!! info "Schema identity"
    - `$schema`: `https://json-schema.org/draft/2020-12/schema`
    - `$id`: `https://vineyard.run/schemas/plugin.json`
    - `title`: *VINEYARD Plugin Manifest*
    - Root: `type: object`, `additionalProperties: false` — the schema allows no unknown top-level keys.

The manifest is the single source of truth for a plugin; there is no separate server-side plugin record.

## Top-level properties

`additionalProperties: false`. **Required:** `identifier`, `content_type`, `name`, `version`, `description`, `platforms`, `io`, `scopes`, `lifecycle`.

| Property | Type | Req. | Allowed / constraints | Default | Meaning |
|---|---|---|---|---|---|
| `identifier` | string | yes | pattern `^(?:[a-z0-9]+(?:-[a-z0-9]+)*\.){2,}plugins\.[a-z0-9_]+$` | — | Reverse-DNS unique id, e.g. `run.vineyard.plugins.rdap_ip`. |
| `content_type` | string | yes | `const`: `vineyard:plugin` | — | Document discriminator; must be exactly this value. |
| `name` | string | yes | minLength 1, maxLength 128 | — | Human-readable display name. |
| `version` | string | yes | pattern `^\d+\.\d+\.\d+(?:[-+].+)?$` | — | SemVer string, e.g. `1.0.0`, `2.1.0-beta.1`. |
| `description` | string | yes | minLength 1, maxLength 1024 | — | One-paragraph summary. |
| `author` | object | no | see [author](#author) | — | Authorship metadata. |
| `license` | string | no | — | — | SPDX license id, e.g. `MIT`. |
| `icon` | string | no | — | — | Icon (lucide name) shown next to the plugin in the Marketplace pack detail. |
| `thumbnail_url` | string | no | maxLength 512; repo-relative path, no leading slash or `.`/`..` | — | Card thumbnail, e.g. `assets/thumbnail.png`. Resolved only at the pinned commit: `https://cdn.jsdelivr.net/gh/{repo}@{ref}/{path}`, falling back to `https://raw.githubusercontent.com/{repo}/{ref}/{path}`. Absolute URLs are rejected. 1:1 PNG/WebP, 256×256 recommended, ≤256KB, shown at 40–56px. |
| `marketing_url` | string | no | `format: uri` | — | Landing / marketing page URL. Accepted but not read by the app. |
| `latest_url` | string | no | `format: uri` | — | Designed as a per-author pointer to the newest manifest. Accepted but not read: the update check compares the registry catalog's `version` (see [Updates](../develop/updates.md)). |
| `platforms` | object | yes | see [platforms](#platforms) | — | Per-platform execution flags. |
| `io` | object | yes | see [io](#io) | — | Consumed/produced Type Pack entity types. |
| `params` | object | no | see [params](#params) | — | JSON-Schema for the pre-run form. |
| `scopes` | object | yes | see [scopes](#scopes) | — | The plugin's authority surface. |
| `lifecycle` | object | yes | see [lifecycle](#lifecycle) | — | Task execution model. |

### author

`type: object`, `additionalProperties: false`. All properties optional.

| Property | Type | Req. | Constraints | Meaning |
|---|---|---|---|---|
| `name` | string | no | — | Author or organization name. |
| `url` | string | no | `format: uri` | Author homepage. |
| `contact` | string | no | — | Contact handle, email, or URL. |

## platforms

Per-platform execution flags. `type: object`, `additionalProperties: false`, `minProperties: 1` — at least one property, and `primary` counts, so `{ "primary": "web" }` alone satisfies the schema. The host needs a `web` block (see the warning below). `primary` is preferred.

| Property | Type | Req. | Allowed values | Default | Meaning |
|---|---|---|---|---|---|
| `primary` | string | no | `web`, `desktop` | — | Platform contract. `desktop` makes the plugin desktop-only: the web build lists it greyed out ("Desktop only — …") and will not run it. `web` or absent runs everywhere. |
| `web` | object | no | see [platforms.web](#platformsweb) | — | Web execution block. |
| `desktop` | object | no | see [platforms.desktop](#platformsdesktop) | — | Desktop execution block. |

!!! warning "What actually ships today"
    Plugins execute from `platforms.web` (`runtime: "sandbox-js"`, `entry`) in both the browser and the desktop Electron shell. A plugin without one is not runnable (a pack member without its own entry inherits the pack's). The host does not read `platforms.desktop` (`runtime`, `entry`, `fallback`) or `platforms.web.fallback`, and the `web-proxy` runtime and `native`/`subprocess` desktop runtimes are valid in the schema as forward-looking design but are **deferred** — not built yet. Treat those fields as reserved, not as shipped behavior.

### platforms.web

`type: object`, `additionalProperties: false`. **Required:** `runtime`, `entry`.

| Property | Type | Req. | Allowed values | Default | Meaning |
|---|---|---|---|---|---|
| `runtime` | string | yes | `sandbox-js`, `web-proxy` | — | `sandbox-js` = author JS in the browser worker; `web-proxy` = thin client calling ONE author endpoint (deferred). |
| `entry` | string | yes | — | — | The module the plugin worker imports: a path relative to the repo root, e.g. `dist/pack.mjs`, or an absolute URL. Registry CI refuses `inline`, which names no module. |
| `proxy_endpoint` | string | conditional | `format: uri` | — | **Required when `runtime: web-proxy`.** The single endpoint; MUST equal the one `scopes.network` entry. |
| `fallback` | string | no | `desktop`, `none` | `none` | Where to fall back if web cannot run the plugin. |

### platforms.desktop

`type: object`, `additionalProperties: false`. **Required:** `runtime`, `entry`. *(Deferred — see warning above.)*

| Property | Type | Req. | Allowed values | Default | Meaning |
|---|---|---|---|---|---|
| `runtime` | string | yes | `sandbox-js`, `native`, `subprocess` | — | Desktop execution mode. |
| `entry` | string | yes | — | — | Entry path within the bundle. |
| `fallback` | string | no | `web`, `none` | `none` | Where to fall back if desktop cannot run the plugin. |

## io

Entity types the plugin references from Type Packs. `type: object`, `additionalProperties: false`. **Required:** `consumes`, `produces`. An empty `consumes` array means a whole-graph plugin (global launch rather than a per-node right-click action).

| Property | Type | Req. | Items | Meaning |
|---|---|---|---|---|
| `consumes` | array | yes | [`typeRef`](#typeref) | Node types the plugin reads as input. |
| `produces` | array | yes | [`typeRef`](#typeref) | Node types the plugin emits. |

### typeRef (io.consumes / io.produces items) { #typeref }

`$defs.typeRef`. `type: object`, `additionalProperties: false`. **Required:** `typepack`, `category`, `name`. At runtime, `Node.type = "<category>.<name>"` (e.g. `infrastructure.ip_address`).

| Property | Type | Req. | Constraints | Meaning |
|---|---|---|---|---|
| `typepack` | string | yes | pattern `^(?:[a-z0-9]+(?:-[a-z0-9]+)*\.){2,}typepacks\.[a-z0-9]+(?:[._-][a-z0-9]+)*$` | The owning Type Pack identifier. |
| `category` | string | yes | — | Type category, e.g. `infrastructure`. |
| `name` | string | yes | — | Type name within the category, e.g. `ip_address`. |
| `as` | string | no | — | Designed as a binding alias to pre-bind the consumed node's value into `params` under this key. Accepted by the schema; no shipped plugin declares it and the run form does not read it yet. |

!!! note "Open issue"
    `typeRef` does **not** yet carry a Type Pack version — type compatibility is resolved by identifier + qualified name only.

## params

JSON-Schema (draft 2020-12) describing the pre-run form. The submitted object is passed to `run` as `ctx.params` (and kept on the run's task row). `type: object`. Note this object is **not** `additionalProperties: false` — it is itself a JSON Schema and may carry any standard schema keywords; only the three keys below are explicitly modeled.

| Property | Type | Req. | Constraints | Meaning |
|---|---|---|---|---|
| `type` | string | no | `const`: `object` | The params form is always an object schema. |
| `properties` | object | no | — | Per-field JSON Schema definitions. |
| `required` | array | no | items: string | Names of required fields. |

!!! warning "No secrets in params"
    `params` MUST NOT contain secrets. Use a [`scopes.config`](#configvalue-scopesconfig-items) entry with `secret: true` for API keys and credentials instead.

### File fields

A field declared `"format": "file"` renders as a drop zone — drag files onto it, or click to browse. Declaring it `"type": "array"` makes it **multi-select**; anything else takes a single file, and dropping two on it is refused rather than silently truncated. A dropped folder is expanded recursively.

| Property | Type | Req. | Meaning |
|---|---|---|---|
| `format` | string | yes | `file`. Without it the field is an ordinary input. |
| `type` | string | no | `array` for many files; omit (or use any other type) for one. |
| `accept` | string | no | MIME filter, e.g. `image/*`. Unlike a bare file input's `accept`, this also rejects non-matching files **during the drag**. No filter when omitted. |

The value your `run(ctx)` receives is the **`File` object itself** (or an array of them) — not a data: URL, not a path. Read it with `await file.arrayBuffer()`, and take the file name from `file.name`. There is no companion "file name" field.

```json
"params": {
  "type": "object",
  "properties": {
    "images": { "type": "array", "format": "file", "accept": "image/*",
                "title": "Image files",
                "description": "One or more JPEG photos, read locally (never uploaded)." }
  },
  "required": ["images"]
}
```

!!! note "One run, one batch"
    A multi-file field hands the whole selection to a **single** run — the host does not fan out one run per file. Loop over them yourself and report progress with `ctx.progress.set({ percent })`; check `ctx.signal.aborted` each iteration so Stop works.

    The host caps a pick at 25 MB per file, 250 MB per run, and 50 files. Files cross into the sandbox as blob handles, so the memory cost is whatever your plugin materialises — read one file at a time rather than `Promise.all`-ing the batch.

## scopes

The plugin's authority surface. `type: object`, `additionalProperties: false`. `ctx` members are absent unless granted, and graph writes are held for the analyst's review before they are applied. See the [scopes reference](scopes.md) for verb semantics.

| Property | Type | Req. | Items / constraints | Meaning |
|---|---|---|---|---|
| `graph` | array | no | `uniqueItems`; enum items (below) | Fine-grained node/edge verbs. Backed by the project `graph_edit` tier. |
| `web_probe` | object | no | `{ purpose?: string }` — an object, not an array | **Desktop only.** One anonymous request to an *arbitrary* public host. Backs `ctx.net.probe`, which is absent in the web build. |
| `network` | array | no | items: [`networkScope`](#networkscope-scopesnetwork-items) | External XHR targets. |
| `services` | array | no | `uniqueItems`; enum: `rdap`, `telegram` | Vineyard-operated services called by **name** through `ctx.service` — never by URL. See the [scopes reference](scopes.md#services). |
| `config` | array | no | items: [`configValue`](#configvalue-scopesconfig-items) | Install-time values injected at runtime only. |

`scopes.graph` enum values (each may appear at most once):

| Value | Meaning |
|---|---|
| `node:read` | Read nodes. |
| `node:create` | Create nodes. |
| `node:update` | Update node fields. |
| `node:delete` | Delete nodes. |
| `edge:read` | Read edges. |
| `edge:create` | Create edges. |
| `edge:update` | Update edge fields. |
| `edge:delete` | Delete edges. |

!!! warning "Network fan-out rule"
    For a **web-proxy** plugin, `scopes.network` must contain exactly **one** entry, equal to `platforms.web.proxy_endpoint` (no fan-out). A **sandbox-js** plugin's entries are checked instead against the host's egress allowlist — see [security](../develop/security.md). A sandbox-js plugin may declare several entries, in the browser and in the desktop app alike.

### networkScope (scopes.network items)

`$defs.networkScope`. `type: object`, `additionalProperties: false`. **Required:** `endpoint`, `methods`.

| Property | Type | Req. | Constraints | Meaning |
|---|---|---|---|---|
| `endpoint` | string | yes | `format: uri` | Exact origin/path prefix; no cross-host wildcards. |
| `methods` | array | yes | `uniqueItems`; items enum: `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | Allowed HTTP methods. An empty list allows every method: the schema sets no `minItems`, and the host treats an empty list as no restriction. |
| `purpose` | string | no | — | Human-readable reason, shown at install time. |

#### Sending a credential

`ctx.net.fetch` passes your request headers through unchanged, **including `Authorization`**. If
your endpoint needs a key, put it there:

```js
await ctx.net.fetch(url, { headers: { Authorization: `Bearer ${ctx.config.api_key}` } });
```

A request that carries a header or a body does not follow a redirect: a 3xx answer rejects the call
with an error that begins `redirect not followed`, and the plugin does not see the 3xx response. So
a key in `Authorization` or in a custom header (`X-Api-Key`, `api-key`, …) only reaches the endpoint
you declared. A request with neither header nor body still follows redirects. Avoid a key in the query
string, because it ends up in logs.

`Cookie` cannot be set, and no cookies are sent with plugin requests.

### configValue (scopes.config items)

`$defs.configValue`. `type: object`, `additionalProperties: false`. **Required:** `key`, `type`. Config values are entered by the analyst in the plugin's Settings section of the Run plugins dialog, or under **Settings → Keys & Secrets**, and read by the declaring plugin as `ctx.config`. Members of the same pack that declare a key and call the same set of network origins (scheme, host and port of their `scopes.network` endpoints) share one value, entered once; a plugin published on its own, or one with no `scopes.network` entry, keeps its own. Each plugin still receives only the keys its own manifest declares — see [scopes → config](scopes.md#config). Values are kept per signed-in account — in the OS keychain on desktop (only until the app quits on a computer that cannot encrypt them), for the tab session in the browser. `secret: true` masks the field. Values are never recorded in a task or conversation.

| Property | Type | Req. | Allowed values | Default | Meaning |
|---|---|---|---|---|---|
| `key` | string | yes | pattern `^[a-z0-9_]+$` | — | Stable config key. |
| `label` | string | no | — | — | Field label in the Run plugins Settings section and in Settings → Keys & Secrets. |
| `type` | string | yes | `string`, `number`, `boolean`, `url`, `enum` | — | Value type. |
| `enum` | array | no | items: string | — | Allowed choices when `type: enum`. |
| `secret` | boolean | no | — | `false` | BYOK-style secret: masked field. Never written to any record. |
| `scope` | string | no | `plugin`, `project`, `user` | `user` | Where the value is stored/shared. Accepted but not read; values are stored and shared by the pack and network-origin rule above. |
| `optional` | boolean | no | — | `false` | Whether the user may leave it blank. Not enforced: a non-optional field is only marked "required by this plugin", and the run proceeds without it. |

## lifecycle

Task execution model. `type: object`, `additionalProperties: false`. All properties optional with defaults.

| Property | Type | Req. | Allowed values | Default | Meaning |
|---|---|---|---|---|---|
| `long_running` | boolean | no | — | `false` | Designed to have the runtime manage the task continuously (status/pause/resume/cancel/retry/progress). Accepted but not read. |
| `controls` | array | no | `uniqueItems`; enum: `pause`, `resume`, `cancel`, `retry`, `progress` | — | Controls exposed to the user. |
| `progress` | string | no | `none`, `determinate`, `indeterminate` | `none` | Progress reporting style. |
| `persistence` | string | no | `ephemeral`, `opt-in`, `always` | `ephemeral` | `ephemeral` = no Task DB row, in-memory only. |
| `states` | array | no | enum: `queued`, `running`, `waiting`, `paused`, `cancelled`, `succeeded`, `failed` | all 7 states | Canonical 7-state machine. |

!!! warning "What the host actually reads"
    `long_running`, `controls`, `progress`, `persistence`, and `states` are accepted here but not read by the host today — the Tasks panel's only control is Stop, and a task's real terminal states are `succeeded` / `failed` / `cancelled` (plus `incomplete` for AI turns). See [Lifecycle](../develop/lifecycle.md).

    The host does read `lifecycle.timeout_ms`, a wall-clock budget per run (default 10 minutes, capped at 60). Past it, the sandbox is terminated and the task fails. It is not in `plugin.schema.json` yet; since nothing validates manifests against the schema, a manifest can declare it. See [Lifecycle](../develop/lifecycle.md#manifestlifecycletimeout_ms).

## Complete annotated example

A real, shipped plugin manifest — **RDAP IP**, a member of the [IP Recon](https://github.com/Vineyard-Intelligence/pluginpack-ip-recon) pack. It consumes an `infrastructure.ip_address` node and adds the owning `infrastructure.netblock`.

```json title="ip-recon.manifest.json (rdap_ip member)"
{
  "identifier": "run.vineyard.plugins.rdap_ip", // (1)!
  "content_type": "vineyard:plugin",            // (2)!
  "name": "RDAP IP",
  "version": "1.1.1",                           // (3)!
  "description": "Looks up each selected IP Address in RDAP. Creates a Netblock node (CIDR, network name, country) linked \"within netblock\" and fills the IP's organization and country_code if empty.",
  "icon": "boxes",                              // (4)!

  "platforms": {
    "primary": "web",                           // (5)!
    "web": { "runtime": "sandbox-js", "entry": "dist/pack.mjs" }
  },

  "io": {
    "consumes": [
      { "typepack": "run.vineyard.typepacks.infrastructure",
        "category": "infrastructure", "name": "ip_address" }
    ],
    "produces": [
      { "typepack": "run.vineyard.typepacks.infrastructure",
        "category": "infrastructure", "name": "netblock" }
    ]
  },

  "scopes": {                                    // (6)!
    "graph": ["node:read", "node:create", "node:update", "edge:create"],
    "network": [
      { "endpoint": "https://rdap.org/", "methods": ["GET"],
        "purpose": "Look up each selected IP's netblock and owner in RDAP." }
    ]
  },

  "lifecycle": {                                 // (7)!
    "persistence": "opt-in",
    "controls": ["progress", "cancel"],
    "progress": "determinate"
  }
}
```

This manifest ships as one of four members inside the IP Recon pack, so its `platforms.web.entry` names the pack's bundle (see [Plugin Packs](../develop/plugin-packs.md)).

1. Reverse-DNS identifier matching `^(?:[a-z0-9]+(?:-[a-z0-9]+)*\.){2,}plugins\.[a-z0-9_]+$`.
2. The `const` discriminator — must be exactly `vineyard:plugin`.
3. SemVer — `MAJOR.MINOR.PATCH`, optionally with a pre-release or build suffix.
4. Icon shown next to the plugin in the Marketplace pack detail — here a lucide name.
5. `primary: web` with the `sandbox-js` runtime, the only web runtime that actually executes today.
6. `graph` verbs plus one `network` endpoint, checked against the host's egress allowlist at runtime.
7. `persistence`/`controls`/`progress` are declarative only — see the warning above.

## Next / See also

- [Plugin manifest guide](../develop/plugin-manifest.md) — narrative walkthrough of these fields.
- [Scopes reference](scopes.md) — full verb and tier semantics.
- [Type Pack manifest schema](typepack-schema.md) — the companion `vineyard:typepack` schema.
- [Registry schema](registry-schema.md) — how published manifests are indexed.
