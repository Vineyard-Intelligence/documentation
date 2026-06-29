# Type Pack schema

Exhaustive field reference for `typepack.schema.json` — the meta-schema that every `vineyard:typepack` document is validated against. A Type Pack declares **node entity types** and optional **edge types** that extend the graph's vocabulary. For a conceptual walkthrough and authoring guidance, see [Developing Type Packs](../develop/typepacks.md).

!!! info "Canonical schema"
    `$id`: `https://vineyard.run/schemas/typepack.json` · JSON Schema draft 2020-12. The document is the source of truth; this page enumerates it field-by-field.

## Top-level object

The root is an object with `additionalProperties: false` — unknown keys are rejected.

**Required:** `identifier`, `name`, `content_type`, `version`, `distribution`, `types`.

| Field | Type | Req | Constraints / default | Meaning |
|-------|------|-----|-----------------------|---------|
| `identifier` | string | yes | pattern `^run\.vineyard\.typepacks\.[a-z0-9]+(?:[._-][a-z0-9]+)*$` | Reverse-DNS id, e.g. `run.vineyard.typepacks.infrastructure`. |
| `content_type` | string | yes | `const: "vineyard:typepack"` | Discriminator marking the document as a Type Pack. |
| `name` | string | yes | `minLength: 1`, `maxLength: 128` | Human-readable pack name. |
| `version` | string | yes | SemVer pattern `^(0\|[1-9]\d*)\.(0\|[1-9]\d*)\.(0\|[1-9]\d*)$` | SemVer of the pack **content**. MAJOR = breaking type change requiring node migration. |
| `description` | string | no | `maxLength: 1024` | Short summary of what the pack models. |
| `authors` | array&lt;object&gt; | no | see [Authors](#authors) | Attribution list. |
| `license` | string | no | — | SPDX expression, e.g. `MIT`, `Apache-2.0`, `CC-BY-4.0`. |
| `distribution` | object | yes | see [Distribution](#distribution) | Where the document lives (git / zip / inline). |
| `marketing_url` | string | no | `format: uri` | Landing page for the pack. |
| `thumbnail_url` | string | no | `format: uri` | Icon/thumbnail image. |
| `types` | array&lt;[entityType](#entity-type-types)&gt; | yes | `minItems: 1` | Node entity type definitions. |
| `edge_types` | array&lt;[edgeType](#edge-types-edge_types)&gt; | no | — | Relationship type definitions. Absent ⇒ the pack contributes node types only. |

### identifierSegment

Several keys (`category`, `name`, property keys) reuse the `identifierSegment` definition:

| Rule | Value |
|------|-------|
| type | string |
| pattern | `^[a-z][a-z0-9_]*$` (snake_case, must start with a lowercase letter) |
| `maxLength` | 31 |

## Authors

`authors[]` — array of objects, each `additionalProperties: false`.

| Field | Type | Req | Constraints |
|-------|------|-----|-------------|
| `name` | string | yes | — |
| `email` | string | no | `format: email` |
| `url` | string | no | `format: uri` |

## Distribution

Shared block used by both plugins and Type Packs (`#/$defs/distribution`). `additionalProperties: false`; **required:** `kind`. The relevant fields per `kind` are: `git` → `repository` + `ref` + `path`; `zip` → `archive`; `inline` → document is embedded.

| Field | Type | Req | Constraints | Meaning |
|-------|------|-----|-------------|---------|
| `kind` | string (enum) | yes | `git` \| `zip` \| `inline` | Source mechanism. |
| `repository` | string | no | `format: uri`, pattern `^https://github\.com/[^/]+/[^/]+$` | HTTPS repo URL, no trailing `.git` or slash. |
| `ref` | string | no | — | **Immutable** ref: 40-char commit SHA or annotated tag. Branches are rejected by registry CI. |
| `path` | string | no | — | Path to the document within `repo@ref`, e.g. `typepacks/infrastructure.json`. |
| `integrity` | object | no | see below | Optional integrity block; detects a force-push at install. |
| `archive` | object | no | see below | Optional verifiable zip mirror (`kind=zip`). |

**`integrity`** (`additionalProperties: false`; required `algo`, `hash`):

| Field | Type | Constraints |
|-------|------|-------------|
| `algo` | string (enum) | `sha256` \| `sha512` |
| `hash` | string | pattern `^[a-f0-9]{64,128}$` |

**`archive`** (`additionalProperties: false`; required `url`, `sha256`):

| Field | Type | Constraints |
|-------|------|-------------|
| `url` | string | `format: uri`, pattern `^https://.*\.zip$` |
| `sha256` | string | pattern `^[a-f0-9]{64}$` |

## Entity type (`types[]`)

Each item in `types` defines one **node** entity type (`#/$defs/entityType`, `additionalProperties: false`). **Required:** `category`, `name`, `label_property`, `properties`.

| Field | Type | Req | Constraints / default | Meaning |
|-------|------|-----|-----------------------|---------|
| `category` | identifierSegment | yes | snake_case, ≤31 | Grouping namespace, e.g. `infrastructure`. |
| `name` | identifierSegment | yes | snake_case, ≤31 | Type name within the category, e.g. `ip_address`. |
| `display_name` | string | no | — | Human label for the type. |
| `description` | string | no | — | What the type represents. |
| `label_property` | string | yes | must name a key in `properties` that is **non-optional** | The property key used as the node's display label. |
| `icon` | string | no | polymorphic (see below) | Node icon. When absent, the node renders with `color` only. |
| `color` | string | no | pattern `^#[0-9a-fA-F]{6}$` | Node color `#rrggbb`. When absent, a stable color is derived from `category.name`. |
| `properties` | object | yes | `minProperties: 1`; keys are identifierSegment; values are [property](#property-object) | property key → property schema. Must be non-empty. |

The fully qualified type reference is `category.name` (e.g. `infrastructure.ip_address`). That qualified form is what edge endpoints and `reference` targets point at.

!!! info "Icon resolution order"
    `icon` is polymorphic and resolved in order: a `data:` / `http(s):` image URI; else a kebab-case [lucide](https://lucide.dev) icon name (e.g. `shield-alert`); else a literal glyph/emoji.

## Property object

The schema for each value in a `properties` map (`#/$defs/property`, `additionalProperties: false`). **Required:** `type` — every property must declare an explicit type.

| Field | Type | Req | Constraints / default | Meaning |
|-------|------|-----|-----------------------|---------|
| `type` | string (enum) | yes | see [type enum](#property-type-enum) | Logical property type. |
| `description` | string | no | — | Human description of the property. |
| `optional` | boolean | no | `default: false` | `false` (default) ⇒ required key in `Node.data`. |
| `default` | any | no | type must match `type` | Default applied when the key is absent. |
| `validator` | object | no | see [validator](#validator-object) | Structured validation rules. |
| `enum` | array | conditional | `minItems: 1`; items `string`\|`number`\|`boolean` | **Required when `type = "enum"`.** |
| `reference` | object | conditional | see [reference](#reference-object) | **Required when `type = "reference"`.** |

### Property `type` enum

`type` must be one of:

`string`, `text`, `number`, `integer`, `boolean`, `date`, `datetime`, `enum`, `url`, `ip`, `hash`, `email`, `reference`, `array`, `object`

| Value | Notes |
|-------|-------|
| `string` | Single-line string. |
| `text` | Multi-line / long text. |
| `number` | Floating-point number. |
| `integer` | Whole number. |
| `boolean` | true/false. |
| `date` | Calendar date. |
| `datetime` | Timestamp. |
| `enum` | Constrained set — see `enum` array. |
| `url` | URL string. |
| `ip` | IP address (IPv4/IPv6). |
| `hash` | Hash digest. |
| `email` | Email address. |
| `reference` | Link to another node type — see `reference` object. |
| `array` | List value. |
| `object` | Nested object value. |

!!! warning "No secret/credential types"
    The enum deliberately omits `secret` and `credential`. Do not model API keys, tokens, or passwords as node/edge properties.

### validator object

`additionalProperties: false`. Structured validation that replaces the older raw-regex-string precedent. All fields are optional; combine as needed.

| Field | Type | Constraints | Meaning |
|-------|------|-------------|---------|
| `regex` | string | — | ECMAScript regex the string form must **fully** match. |
| `min` | number | — | Minimum numeric value. |
| `max` | number | — | Maximum numeric value. |
| `min_length` | integer | `minimum: 0` | Minimum string length. |
| `max_length` | integer | `minimum: 0` | Maximum string length. |
| `format` | string | — | Named format hint, e.g. `ipv4`, `sha256`, `iso8601`. |

### reference object

Required when `type = "reference"`. `additionalProperties: false`.

| Field | Type | Meaning |
|-------|------|---------|
| `target` | string | Qualified `category.name` of the referenced node type, or `*` for any. |

## Edge types (`edge_types[]`)

Each item defines a directed relationship type (`#/$defs/edgeType`, `additionalProperties: false`). **Required:** `category`, `name`, `label`, `from`, `to`. The `label` is stored verbatim in `Edge.label`. `from`/`to` constrain the endpoint node types.

| Field | Type | Req | Constraints / default | Meaning |
|-------|------|-----|-----------------------|---------|
| `category` | identifierSegment | yes | snake_case, ≤31 | Grouping namespace. |
| `name` | identifierSegment | yes | snake_case, ≤31 | Edge type name. |
| `label` | string | yes | `maxLength: 64` | Stored verbatim in `Edge.label`. |
| `display_name` | string | no | — | Human label. |
| `description` | string | no | — | What the relationship means. |
| `directed` | boolean | no | `default: true` | Whether the edge is directional. |
| `from` | array&lt;string&gt; | yes | items are `category.name` refs; `*` = any | Allowed source node-type refs. |
| `to` | array&lt;string&gt; | yes | items are `category.name` refs; `*` = any | Allowed target node-type refs. |
| `properties` | object | no | keys identifierSegment; values [property](#property-object) | Optional edge property schema (stored in `Edge.data`). Same grammar as node properties. |

## Annotated example: Infrastructure Type Pack

A trimmed, fully valid `vineyard:typepack` showing the top-level block, two node types (covering `ip`, `enum`, `string`, `integer`, `reference` property types plus `validator` variants), and one edge type. Comments are annotations only — JSON does not permit them.

```jsonc
{
  "identifier": "run.vineyard.typepacks.infrastructure", // reverse-DNS id
  "content_type": "vineyard:typepack",                 // discriminator (const)
  "version": "1.0.0",                                  // pack CONTENT SemVer
  "name": "VINEYARD.RUN Type Pack - Infrastructure",
  "description": "Network infrastructure CTI entities and their relationships.",
  "authors": [{ "name": "VINEYARD.RUN", "url": "https://vineyard.run" }],
  "license": "Apache-2.0",                             // SPDX expression
  "distribution": {                                    // immutable git source
    "kind": "git",
    "repository": "https://github.com/vineyard-run/typepacks",
    "ref": "v1.0.0",                                   // annotated tag or 40-char SHA
    "path": "infrastructure/typepack.json"
  },
  "marketing_url": "https://vineyard.run/typepacks/infrastructure",
  "thumbnail_url": "https://vineyard.run/typepacks/infrastructure/icon.png",

  "types": [
    {
      "category": "infrastructure",                    // qualified type => infrastructure.ip_address
      "name": "ip_address",
      "display_name": "IP Address",
      "description": "An IPv4 or IPv6 network address.",
      "label_property": "ip_address",                  // MUST be a non-optional property below
      "icon": "network",                               // lucide icon name
      "color": "#60a5fa",                              // #rrggbb
      "properties": {
        "ip_address": {
          "type": "ip",
          "description": "The IP address.",
          "optional": false,                           // => required key in Node.data
          "validator": { "format": "ip" }              // named format hint
        },
        "version": {
          "type": "enum",
          "optional": true,
          "enum": ["ipv4", "ipv6"]                     // required for type=enum
        },
        "country_code": {
          "type": "string",
          "optional": true,
          "validator": { "regex": "^[A-Z]{2}$" }       // must fully match
        }
      }
    },
    {
      "category": "infrastructure",
      "name": "autonomous_system",
      "display_name": "Autonomous System",
      "label_property": "autonomous_system_number",
      "icon": "waypoints",
      "color": "#818cf8",
      "properties": {
        "autonomous_system_number": {
          "type": "integer",
          "optional": false,
          "validator": { "min": 0, "max": 4294967295 } // numeric bounds
        },
        "autonomous_system_name": { "type": "string", "optional": true }
      }
    }
  ],

  "edge_types": [
    {
      "category": "infrastructure",
      "name": "announced_by",
      "label": "announced_by",                         // stored in Edge.label (<=64)
      "display_name": "Announced By",
      "description": "An IP address is announced by an autonomous system.",
      "from": ["infrastructure.ip_address"],           // qualified endpoint refs
      "to": ["infrastructure.autonomous_system"]
    }
  ]
}
```

!!! example "More patterns in the real pack"
    The shipped Infrastructure pack also demonstrates a `reference` property (`infrastructure.url.domain` → `{ "target": "infrastructure.domain" }`), `hash`/`date`/`datetime`/`text` types (in `whois_record` and `certificate`), and multi-source edges where `from`/`to` list several node types (e.g. `resolves_to` from `infrastructure.domain` **and** `infrastructure.url`). See the [Type Packs guide](../guide/typepacks.md).

## Validation notes

- Every top-level, entity, edge, property, and nested block sets `additionalProperties: false` — unknown keys fail validation.
- `label_property` must name a key that exists in `properties` **and** is non-optional.
- `enum` is required precisely when `type = "enum"`; `reference` is required precisely when `type = "reference"`.
- `ref` must be immutable (commit SHA or annotated tag); registry CI rejects branch refs.

## Next / See also

- [Developing Type Packs](../develop/typepacks.md) — authoring guide and lifecycle
- [Plugin schema reference](plugin-schema.md) — the sibling `vineyard:plugin` meta-schema
- [Registry schema reference](registry-schema.md) — how packs are listed
- [Scopes reference](scopes.md) — capability strings plugins request
- [Type Packs guide](../guide/typepacks.md) — Type Packs in use
