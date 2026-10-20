# Type Pack schema

Exhaustive field reference for `typepack.schema.json` — the authoring contract for a `vineyard:typepack` document. Neither registry CI nor the app validates a document against it; run it in your own CI, as the reference pack repos do. A Type Pack declares the **node entity types** that extend the graph's vocabulary. For a conceptual walkthrough and authoring guidance, see [Developing Type Packs](../develop/typepacks.md).

!!! info "Canonical schema"
    `$id`: `https://vineyard.run/schemas/typepack.json` · JSON Schema draft 2020-12. The document is the source of truth; this page enumerates it field-by-field.

## Top-level object

The root is an object with `additionalProperties: false` — unknown keys fail schema validation.

**Required:** `identifier`, `name`, `content_type`, `version`, `types`.

| Field | Type | Req | Constraints / default | Meaning |
|-------|------|-----|-----------------------|---------|
| `identifier` | string | yes | pattern `^(?:[a-z0-9]+(?:-[a-z0-9]+)*\.){2,}typepacks\.[a-z0-9]+(?:[._-][a-z0-9]+)*$` | Reverse-DNS id, e.g. `run.vineyard.typepacks.infrastructure`. |
| `content_type` | string | yes | `const: "vineyard:typepack"` | Discriminator marking the document as a Type Pack. |
| `name` | string | yes | `minLength: 1`, `maxLength: 128` | Human-readable pack name. |
| `version` | string | yes | SemVer pattern `^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$` | SemVer of the pack **content**. MAJOR = breaking type change; nodes that use the changed type may need updating. |
| `description` | string | no | `maxLength: 1024` | Short summary of what the pack models. |
| `authors` | array&lt;object&gt; | no | see [Authors](#authors) | Attribution list. |
| `license` | string | no | — | SPDX expression, e.g. `MIT`, `Apache-2.0`, `CC-BY-4.0`. |
| `marketing_url` | string | no | `format: uri` | Landing page for the pack. |
| `thumbnail_url` | string | no | `format: uri` | Icon/thumbnail image. |
| `types` | array&lt;[entityType](#entity-type-types)&gt; | yes | `minItems: 1` | Node entity type definitions. |

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
| `identity_properties` | array&lt;string&gt; | no | `minItems: 1`, `uniqueItems`; each item MUST name a key in `properties` | Keys that together identify one entity, for de-duplication. Defaults to `[label_property]`. E.g. `identity.account` has `username` as its `label_property` but is identified by `(username, platform)`. |
| `label_template` | string | no | referenced keys MUST exist in `properties` | Display label built from several properties, e.g. `"{username} · {platform}"`. Falls back to `label_property` when any referenced field is empty, so a partially-filled node never shows a dangling separator. Display only — de-duplication uses `identity_properties`. |

The fully qualified type reference is `category.name` (e.g. `infrastructure.ip_address`). That qualified form is what `Node.type` stores and what `reference` targets point at.

!!! info "Icon resolution order"
    `icon` is polymorphic and resolved in order: a `data:` / `http(s):` image URI; else a kebab-case [lucide](https://lucide.dev) icon name (e.g. `shield-alert`); else a literal glyph/emoji. Any kebab-case lucide name resolves.

## Property object

The schema for each value in a `properties` map (`#/$defs/property`, `additionalProperties: false`). **Required:** `type` — every property must declare an explicit type.

| Field | Type | Req | Constraints / default | Meaning |
|-------|------|-----|-----------------------|---------|
| `type` | string (enum) | yes | see [type enum](#property-type-enum) | Logical property type. |
| `description` | string | no | — | Human description of the property. |
| `optional` | boolean | no | `default: false` | `false` ⇒ required key in `Node.data`. Write it on every property: creating a node refuses a missing key only when the property says `"optional": false` explicitly. With `optional` left out, the Properties panel marks the property required (`*`), but a create without it is accepted. |
| `case_insensitive` | boolean | no | `default: false` | Fold case when this property is part of the de-duplication identity; display and storage keep what was written. Right for handles, domains, hostnames, emails and hex digests; wrong for Base58/EIP-55 crypto addresses, URL paths and case-sensitive file paths. A missing flag produces a visible, mergeable duplicate, while a wrong one silently merges two entities. |
| `default` | any | no | should match `type` (not checked) | Accepted but not applied: nothing in the app fills an absent key from it. |
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

`additionalProperties: false`. Structured validation. All fields are optional; combine as needed.

| Field | Type | Constraints | Meaning |
|-------|------|-------------|---------|
| `regex` | string | — | ECMAScript regex tested against a string value as written, with no implicit anchoring: write `^…$` to require a full match. Skipped for values over 4,096 characters, for a pattern that does not compile, and for a pattern with a backtracking-prone shape. |
| `min` | number | — | Minimum numeric value. |
| `max` | number | — | Maximum numeric value. |
| `min_length` | integer | `minimum: 0` | Minimum string length. A hint; the app does not check it. |
| `max_length` | integer | `minimum: 0` | Maximum string length. A hint; the app does not check it. |
| `format` | string | — | Named format hint, e.g. `ipv4`, `sha256`, `iso8601`. The app does not check it. |

### reference object

Required when `type = "reference"`. `additionalProperties: false`.

| Field | Type | Meaning |
|-------|------|---------|
| `target` | string | Qualified `category.name` of the referenced node type, or `*` for any. |

## Annotated example: Infrastructure Type Pack

A trimmed, fully valid `vineyard:typepack` showing the top-level block, two node types (covering `ip`, `enum`, `string` and `integer` property types plus `validator` variants). Comments are annotations only — JSON does not permit them.

```jsonc
{
  "identifier": "run.vineyard.typepacks.infrastructure", // reverse-DNS id
  "content_type": "vineyard:typepack",                 // discriminator (const)
  "version": "1.0.0",                                  // pack CONTENT SemVer
  "name": "VINEYARD Type Pack - Infrastructure",
  "description": "Network infrastructure CTI entities.",
  "authors": [{ "name": "VINEYARD", "url": "https://vineyard.run" }],
  "license": "Apache-2.0",                             // SPDX expression
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
          "validator": { "regex": "^[A-Z]{2}$" }       // anchored: the whole value must match
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
  ]
}
```

!!! example "More patterns in the real pack"
    The shipped Infrastructure pack also shows that `category` does not have to match within one pack (it defines both `infrastructure.*` and `web.*` types), and the `hash`/`date`/`datetime`/`text` types (in `whois_record` and `certificate`). See the [Type Packs guide](../guide/typepacks.md).

## Validation notes

- Every top-level, entity, property, and nested block sets `additionalProperties: false` — unknown keys fail validation.
- `label_property` must name a key that exists in `properties` **and** is non-optional.
- `enum` is required precisely when `type = "enum"`; `reference` is required precisely when `type = "reference"`.
- The last two are authoring rules. The schema states them only in descriptions, so even a schema validator does not enforce them, and nothing else does.
- Registry CI checks a Type Pack document only for this: its `identifier`, `content_type` and `version` match the entry; `type_count`, and `icon` when the entry carries one, match the document; every `identity_properties` key names an existing property that is not `array`, `object` or `json`; and no other published Type Pack defines the same `category.name` (see [Publishing](../develop/publishing.md#what-ci-enforces)).
- The app checks node data against the declared properties when a node is written; see [What the app checks on node data](../develop/typepacks.md#what-the-app-checks-on-node-data).
- The registry entry that lists a pack pins it to an immutable commit SHA; registry CI rejects tags and branches (see [registry schema](registry-schema.md)).

## Next / See also

- [Developing Type Packs](../develop/typepacks.md) — authoring guide and lifecycle
- [Plugin schema reference](plugin-schema.md) — the sibling `vineyard:plugin` meta-schema
- [Registry schema reference](registry-schema.md) — how packs are listed
- [Scopes reference](scopes.md) — capability strings plugins request
- [Type Packs guide](../guide/typepacks.md) — Type Packs in use
