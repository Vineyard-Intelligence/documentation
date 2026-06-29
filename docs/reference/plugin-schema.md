# Plugin manifest schema

The authoritative, field-by-field reference for `plugin.schema.json` — the JSON Schema (draft 2020-12) that every `vineyard:plugin` manifest validates against. For the prose walkthrough and authoring guidance, see the [manifest guide](../develop/plugin-manifest.md).

!!! info "Schema identity"
    - `$schema`: `https://json-schema.org/draft/2020-12/schema`
    - `$id`: `https://vineyard.run/schemas/plugin.json`
    - `title`: *VINEYARD Plugin Manifest*
    - Root: `type: object`, `additionalProperties: false` — unknown top-level keys are rejected.

The manifest is the single source of truth for a plugin; there is no separate server-side plugin record. Same naming family as the [Type Pack manifest](typepack-schema.md).

## Top-level properties

`additionalProperties: false`. **Required:** `identifier`, `content_type`, `name`, `version`, `description`, `platforms`, `io`, `scopes`, `lifecycle`, `distribution`.

| Property | Type | Req. | Allowed / constraints | Default | Meaning |
|---|---|---|---|---|---|
| `identifier` | string | yes | pattern `^run\.vineyard\.plugins\.[a-z0-9_]+$` | — | Reverse-DNS unique id, e.g. `run.vineyard.plugins.cidr_expand`. |
| `content_type` | string | yes | `const`: `vineyard:plugin` | — | Document discriminator; must be exactly this value. |
| `name` | string | yes | minLength 1, maxLength 128 | — | Human-readable display name. |
| `version` | string | yes | pattern `^\d+\.\d+\.\d+(?:[-+].+)?$` | — | SemVer string (not the legacy float), e.g. `1.0.0`, `2.1.0-beta.1`. |
| `description` | string | yes | minLength 1, maxLength 1024 | — | One-paragraph summary. |
| `author` | object | no | see [author](#author) | — | Authorship metadata. |
| `license` | string | no | — | — | SPDX license id, e.g. `MIT`. |
| `icon` | string | no | — | — | Icon shown in the node right-click menu. |
| `thumbnail_url` | string | no | `format: uri` | — | Marketplace thumbnail image URL. |
| `marketing_url` | string | no | `format: uri` | — | Landing / marketing page URL. |
| `latest_url` | string | no | `format: uri` | — | Per-author fallback pointer to the always-newest manifest (update check). The registry entry is the primary latest pointer; this is the fallback. |
| `platforms` | object | yes | see [platforms](#platforms) | — | Per-platform execution flags. |
| `io` | object | yes | see [io](#io) | — | Consumed/produced Type Pack entity types. |
| `params` | object | no | see [params](#params) | — | JSON-Schema for the pre-run form. |
| `scopes` | object | yes | see [scopes](#scopes) | — | The plugin's authority surface. |
| `lifecycle` | object | yes | see [lifecycle](#lifecycle) | — | Task execution model. |
| `distribution` | object | yes | see [distribution](#distribution) | — | How the bundle is fetched. |

### author

`type: object`, `additionalProperties: false`. All properties optional.

| Property | Type | Req. | Constraints | Meaning |
|---|---|---|---|---|
| `name` | string | no | — | Author or organization name. |
| `url` | string | no | `format: uri` | Author homepage. |
| `contact` | string | no | — | Contact handle, email, or URL. |

## platforms

Per-platform execution flags. `type: object`, `additionalProperties: false`, `minProperties: 1` — at least one of `web` / `desktop` must be present. `primary` is preferred.

| Property | Type | Req. | Allowed values | Default | Meaning |
|---|---|---|---|---|---|
| `primary` | string | no | `web`, `desktop` | — | Preferred platform when both are declared. |
| `web` | object | no | see [platforms.web](#platformsweb) | — | Web execution block. |
| `desktop` | object | no | see [platforms.desktop](#platformsdesktop) | — | Desktop execution block. |

!!! warning "What actually ships today"
    The launch runs web plugins only, with `platforms.web.runtime: "sandbox-js"`. The `desktop` block and the `web-proxy` runtime are valid in the schema as forward-looking design but are **deferred** — not built yet. Treat them as reserved, not as shipped behavior.

### platforms.web

`type: object`, `additionalProperties: false`. **Required:** `runtime`, `entry`.

| Property | Type | Req. | Allowed values | Default | Meaning |
|---|---|---|---|---|---|
| `runtime` | string | yes | `sandbox-js`, `web-proxy` | — | `sandbox-js` = author JS in the browser worker; `web-proxy` = thin client calling ONE author endpoint (deferred). |
| `entry` | string | yes | — | — | Entry path within the bundle, e.g. `dist/cidr.js`. |
| `proxy_endpoint` | string | conditional | `format: uri` | — | **Required when `runtime: web-proxy`.** The single endpoint; MUST equal the one `scopes.network` entry. |
| `fallback` | string | no | `desktop`, `none` | `none` | Where to fall back if web cannot run the plugin. |

### platforms.desktop

`type: object`, `additionalProperties: false`. **Required:** `runtime`, `entry`. *(Deferred — see warning above.)*

| Property | Type | Req. | Allowed values | Default | Meaning |
|---|---|---|---|---|---|
| `runtime` | string | yes | `sandbox-js`, `native`, `subprocess` | — | Desktop execution mode. `native`/`subprocess` run code the JS sandbox cannot contain (carried open issue). |
| `entry` | string | yes | — | — | Entry path within the bundle. |
| `min_app_version` | string | no | pattern `^\d+\.\d+\.\d+$` | — | Minimum desktop app version required. |
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
| `typepack` | string | yes | pattern `^run\.vineyard\.typepacks\.[a-z0-9]+(?:[._-][a-z0-9]+)*$` | The owning Type Pack identifier. |
| `category` | string | yes | — | Type category, e.g. `infrastructure`. |
| `name` | string | yes | — | Type name within the category, e.g. `ip_address`. |
| `as` | string | no | — | Optional binding alias; the consumed node's value is pre-bound into `params` under this key. |

!!! note "Open issue"
    `typeRef` does **not** yet carry a Type Pack version — type compatibility is resolved by identifier + qualified name only. Versioned type references are a carried open issue.

## params

JSON-Schema (draft 2020-12) describing the pre-run form. Whatever the user fills in becomes `Task.input`. `type: object`. Note this object is **not** `additionalProperties: false` — it is itself a JSON Schema and may carry any standard schema keywords; only the three keys below are explicitly modeled.

| Property | Type | Req. | Constraints | Meaning |
|---|---|---|---|---|
| `type` | string | no | `const`: `object` | The params form is always an object schema. |
| `properties` | object | no | — | Per-field JSON Schema definitions. |
| `required` | array | no | items: string | Names of required fields. |

!!! warning "No secrets in params"
    `params` MUST NOT contain secrets. Use a [`scopes.config`](#configvalue-scopesconfig-items) entry with `secret: true` for API keys and credentials. The registry rejects secret-looking param keys.

## scopes

The plugin's authority surface. `type: object`, `additionalProperties: false`. `ctx` members are absent unless granted; enforcement is by the sandbox plus a one-time scoped run-token. See the [scopes reference](scopes.md) for verb semantics.

| Property | Type | Req. | Items / constraints | Meaning |
|---|---|---|---|---|
| `graph` | array | no | `uniqueItems`; enum items (below) | Fine-grained node/edge verbs. Backed by the project `graph_edit` tier. |
| `publish` | array | no | `uniqueItems`; items enum: `message:post` | Post into the project chat/message stream. Backed by the `chat_send` tier. |
| `network` | array | no | items: [`networkScope`](#networkscope-scopesnetwork-items) | External XHR targets. |
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
    On **web**, `scopes.network` must contain exactly **one** entry, equal to `platforms.web.proxy_endpoint` (no fan-out). On **desktop** more entries are allowed — at the user's responsibility.

### networkScope (scopes.network items)

`$defs.networkScope`. `type: object`, `additionalProperties: false`. **Required:** `endpoint`, `methods`.

| Property | Type | Req. | Constraints | Meaning |
|---|---|---|---|---|
| `endpoint` | string | yes | `format: uri` | Exact origin/path prefix; no cross-host wildcards. |
| `methods` | array | yes | `uniqueItems`; items enum: `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | Allowed HTTP methods. |
| `purpose` | string | no | — | Human-readable reason, shown at install time. |

### configValue (scopes.config items)

`$defs.configValue`. `type: object`, `additionalProperties: false`. **Required:** `key`, `type`. Config values are injected at runtime only; `secret: true` values live in the keychain (desktop), are never returned to the browser, and are never recorded.

| Property | Type | Req. | Allowed values | Default | Meaning |
|---|---|---|---|---|---|
| `key` | string | yes | pattern `^[a-z0-9_]+$` | — | Stable config key. |
| `label` | string | no | — | — | Display label in the install form. |
| `type` | string | yes | `string`, `number`, `boolean`, `url`, `enum` | — | Value type. |
| `enum` | array | no | items: string | — | Allowed choices when `type: enum`. |
| `secret` | boolean | no | — | `false` | BYOK-style secret. On web, discouraged → guide to desktop. Never written to any record. |
| `scope` | string | no | `plugin`, `project`, `user` | `user` | Where the value is stored/shared. |
| `optional` | boolean | no | — | `false` | Whether the user may leave it blank. |

## lifecycle

Task execution model. `type: object`, `additionalProperties: false`. All properties optional with defaults.

| Property | Type | Req. | Allowed values | Default | Meaning |
|---|---|---|---|---|---|
| `long_running` | boolean | no | — | `false` | If true, the runtime continuously manages the task (status/pause/resume/cancel/retry/progress). |
| `controls` | array | no | `uniqueItems`; enum: `pause`, `resume`, `cancel`, `retry`, `progress` | — | Controls exposed to the user. |
| `progress` | string | no | `none`, `determinate`, `indeterminate` | `none` | Progress reporting style. |
| `persistence` | string | no | `ephemeral`, `opt-in`, `always` | `ephemeral` | `ephemeral` = no Task DB row, current browser only. |
| `states` | array | no | enum: `queued`, `running`, `waiting`, `paused`, `cancelled`, `succeeded`, `failed` | all 7 states | Canonical 7-state machine. |

!!! note "Retry mints a new task"
    `retry` is a control, not a state. Retrying creates a **new** task rather than transitioning the existing one. The default `states` array is the full canonical set: `queued`, `running`, `waiting`, `paused`, `cancelled`, `succeeded`, `failed`.

## distribution

`$defs.distribution` — the shared distribution block used by both plugins and Type Packs. `type: object`, `additionalProperties: false`. **Required:** `kind`. There is no server-side copy of the bundle; the client caches the fetched bundle locally.

| Property | Type | Req. | Allowed values / constraints | Meaning |
|---|---|---|---|---|
| `kind` | string | yes | `git`, `zip`, `inline` | How the bundle is delivered. |
| `repository` | string | no | `format: uri`, pattern `^https://github\.com/[^/]+/[^/]+$` | GitHub repo (git kind). |
| `ref` | string | no | — | IMMUTABLE: 40-char commit SHA or annotated tag. Branches are rejected by registry CI. |
| `path` | string | no | — | Path to `manifest.json` within `repo@ref` (git kind). |
| `integrity` | object | no | see [integrity](#distributionintegrity) | Optional integrity hash. |
| `archive` | object | no | see [archive](#distributionarchive) | Zip archive location + checksum (zip kind). |

### distribution.integrity

`type: object`, `additionalProperties: false`. **Required:** `algo`, `hash`. **Optional** block — detects a force-push at install.

| Property | Type | Req. | Allowed values / constraints | Meaning |
|---|---|---|---|---|
| `algo` | string | yes | `sha256`, `sha512` | Hash algorithm. |
| `hash` | string | yes | pattern `^[a-f0-9]{64,128}$` | Lowercase hex digest of the bundle. |

### distribution.archive

`type: object`, `additionalProperties: false`. **Required:** `url`, `sha256`.

| Property | Type | Req. | Constraints | Meaning |
|---|---|---|---|---|
| `url` | string | yes | `format: uri`, pattern `^https://.*\.zip$` | HTTPS URL ending in `.zip`. |
| `sha256` | string | yes | pattern `^[a-f0-9]{64}$` | SHA-256 of the archive. |

## Complete annotated example

A full, valid manifest — the **CIDR Expand** reference plugin. It consumes an `infrastructure.ip_range` node, emits `infrastructure.ip_address` nodes, does pure compute (no network), and runs identically on web and desktop.

```json title="cidr_expand.manifest.json"
{
  "identifier": "run.vineyard.plugins.cidr_expand", // (1)!
  "content_type": "vineyard:plugin",                // (2)!
  "name": "CIDR Expand",
  "version": "1.0.0",                               // (3)!
  "description": "Expand a CIDR block into its constituent IP address nodes. Pure compute, no network, runs identically on web and desktop.",
  "author": { "name": "VINEYARD.RUN", "url": "https://vineyard.run" },
  "license": "MIT",
  "icon": "sitemap",                                // (4)!
  "thumbnail_url": "https://vineyard.run/assets/plugins/cidr-expand.png",

  "platforms": {
    "primary": "web",                               // (5)!
    "web": { "runtime": "sandbox-js", "entry": "dist/cidr.js" },
    "desktop": { "runtime": "sandbox-js", "entry": "dist/cidr.js" }
  },

  "io": {
    "consumes": [
      { "typepack": "run.vineyard.typepacks.infrastructure",
        "category": "infrastructure", "name": "ip_range", "as": "cidr" } // (6)!
    ],
    "produces": [
      { "typepack": "run.vineyard.typepacks.infrastructure",
        "category": "infrastructure", "name": "ip_address" }
    ]
  },

  "params": {                                        // (7)!
    "type": "object",
    "required": ["cidr"],
    "properties": {
      "cidr": { "type": "string", "title": "CIDR block",
                "pattern": "^\\d{1,3}(\\.\\d{1,3}){3}/\\d{1,2}$",
                "description": "Pre-filled from the right-clicked ip_range node." },
      "max_hosts": { "type": "integer", "title": "Max hosts to emit",
                     "minimum": 1, "maximum": 65536, "default": 1024 }
    }
  },

  "scopes": {                                        // (8)!
    "graph": ["node:read", "node:create", "edge:create"],
    "publish": [],
    "network": [],
    "config": []
  },

  "lifecycle": {                                     // (9)!
    "long_running": false,
    "controls": ["cancel", "progress"],
    "progress": "determinate",
    "persistence": "ephemeral"
  },

  "distribution": {                                  // (10)!
    "kind": "inline",
    "integrity": { "algo": "sha256",
                   "hash": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad" }
  }
}
```

1. Reverse-DNS identifier matching `^run\.vineyard\.plugins\.[a-z0-9_]+$`.
2. The `const` discriminator — must be exactly `vineyard:plugin`.
3. SemVer, not the legacy float.
4. Icon shown in the node right-click menu.
5. `primary: web` is preferred. The `desktop` block is allowed by the schema but its runtime path is deferred; here both reuse the same `sandbox-js` entry.
6. `as: "cidr"` pre-binds the right-clicked node's value into `params.cidr`. Runtime `Node.type` for these refs is `infrastructure.ip_range` / `infrastructure.ip_address`.
7. JSON-Schema for the pre-run form; becomes `Task.input`. No secrets here.
8. Pure compute: graph verbs only, no `network` or `config`.
9. Short-lived, cancellable, determinate progress, ephemeral (no Task DB row).
10. `inline` distribution with an optional integrity hash.

## Next / See also

- [Plugin manifest guide](../develop/plugin-manifest.md) — narrative walkthrough of these fields.
- [Scopes reference](scopes.md) — full verb and tier semantics.
- [Type Pack manifest schema](typepack-schema.md) — the companion `vineyard:typepack` schema.
- [Registry schema](registry-schema.md) — how published manifests are indexed.
