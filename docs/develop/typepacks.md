# Type Packs

A Type Pack is a `vineyard:typepack` document that defines the **node entity types** and (optionally) the **edge types** your graph and plugins work with. This page covers authoring one end to end; for the field-by-field contract see the [Type Pack schema reference](../reference/typepack-schema.md).

## What a Type Pack is

Plugins do not invent their own data shapes. They `consume` and `produce` node types that a Type Pack declares, addressed by a qualified string. A Type Pack that ships only `types` contributes node types; adding `edge_types` lets it describe the relationships between them. The six shipping reference packs are [Infrastructure, Threat, Identity, Financial, Endpoint, and Geospatial](../guide/typepacks.md).

## Top-level fields

```jsonc
{
  "identifier": "run.vineyard.typepacks.infrastructure",
  "content_type": "vineyard:typepack",           // const
  "version": "1.0.0",                             // SemVer of the PACK CONTENT
  "name": "Infrastructure",
  "description": "Network infrastructure entities.",
  "authors": [{ "name": "Vineyard", "url": "https://vineyard.run" }],
  "license": "Apache-2.0",                        // SPDX expression
  "distribution": { /* shared distribution block, see Distribution */ },
  "marketing_url": "https://vineyard.run/packs/infrastructure",
  "thumbnail_url": "https://vineyard.run/img/infra.png",
  "types": [ /* entity types — at least one required */ ],
  "edge_types": [ /* optional relationship types */ ]
}
```

`types[]` requires at least one entity type; `edge_types[]` is optional. The full required/optional field table is in the [Type Pack schema reference](../reference/typepack-schema.md).

!!! note "The reference packs are valid templates"
    The six shipped packs (`infrastructure.json`, `threat.json`, `identity.json`, `financial.json`, `endpoint.json`, `geo.json`) follow this schema — explicit property types, structured validators, `distribution`, and the required top-level fields — so you can read any of them as a working template. New authoring MUST follow the schema below.

## Entity types

Each item in `types[]` declares one node entity type.

```jsonc
{
  "category": "infrastructure",        // snake_case identifier segment
  "name": "ip_address",                // snake_case identifier segment
  "display_name": "IP Address",        // optional human label
  "description": "IPv4/IPv6 network address with geo and ASN context.",
  "icon": "network",                   // see Visuals
  "color": "#60a5fa",                  // see Visuals
  "label_property": "ip_address",      // a key in properties; MUST exist and be non-optional
  "properties": {                      // at least one property
    "ip_address":   { "type": "ip", "optional": false },
    "country_code": { "type": "string", "validator": { "regex": "^[A-Z]{2}$" }, "optional": false },
    "asn":          { "type": "string", "optional": true },
    "organization": { "type": "string", "optional": true }
  }
}
```

- `category` and `name` are **snake_case identifier segments** (`^[a-z][a-z0-9_]*$`, ≤31 chars).
- `properties` MUST be non-empty; each property key is also a snake_case segment.
- `label_property` names the key used as the node's display label. The cross-field lint requires that key to exist in `properties` **and** be non-optional.

## Property types

Every property MUST declare an explicit `type` from the enum (see the [schema reference](../reference/typepack-schema.md) for the full list). A property is required by default; set `"optional": true` to make the key absent-allowed in `Node.data`. You may supply a `default` (its value must match `type`). Three of the types need extra keys:

=== "enum"

    ```jsonc
    "malware_type": {
      "type": "enum",
      "enum": ["trojan", "ransomware", "worm", "rootkit"],   // required when type=enum
      "optional": false
    }
    ```

=== "reference"

    A `reference` property links to another node type. Provide a `reference.target` as a qualified `category.name` (or `*` for any):

    ```jsonc
    "observed_on": {
      "type": "reference",
      "reference": { "target": "infrastructure.ip_address" },
      "optional": true
    }
    ```

=== "validated string"

    ```jsonc
    "cve_id": {
      "type": "string",
      "validator": { "regex": "^CVE-\\d{4}-\\d{4,}$" },
      "optional": false
    }
    ```

A Type Pack may **not** declare a `secret` or `credential` property type — there is no such enum value, so the schema hard-rejects it. API keys and tokens are not graph data; secrets are handled exclusively through plugin `config` with `secret: true` (see [security](security.md)).

### The structured validator

`validator` is a **structured object**, not a raw regex string. (The precedent packs used a bare string; that form is replaced.) Its keys (`regex`, `min`/`max`, `min_length`/`max_length`, `format`) are tabulated in the [schema reference](../reference/typepack-schema.md).

```jsonc
"cvss_score": { "type": "number", "validator": { "min": 0, "max": 10 }, "optional": true }
```

## Visuals: icon and color

Both are per-entity-type and optional; the canvas and the Types/Properties panels use one shared resolver.

- **`icon`** is polymorphic, resolved in order:
    1. a `data:` / `http(s):` image URI → drawn as the node icon;
    2. otherwise a kebab-case **lucide** icon name (e.g. `shield-alert`) → serialized to an SVG and tinted to `color`;
    3. otherwise a literal **glyph/emoji**.

    When `icon` is absent, the node renders with `color` only. (lucide is the default icon set; a host renders an unknown lucide name as the color fallback.)
- **`color`** is `#rrggbb`. When absent, a stable color is hashed from `category.name`.

The Threat pack, for example, uses lucide names like `bug` (malware), `shield-alert` (vulnerability), and `venetian-mask` (threat actor).

## Edge types

`edge_types[]` declares directed relationships. Each requires `category`, `name`, `label`, `from`, and `to`.

```jsonc
{
  "category": "threat",
  "name": "exploits",
  "label": "exploits",                 // stored verbatim in Edge.label, <= 64 chars
  "directed": true,                     // default true
  "from": ["threat.malware"],           // allowed source node-type refs (category.name); '*' = any
  "to":   ["threat.vulnerability"],     // allowed target node-type refs; '*' = any
  "properties": {                       // optional, stored in Edge.data; same grammar as node props
    "confidence": { "type": "enum", "enum": ["low", "medium", "high"], "optional": true }
  }
}
```

`from`/`to` constrain the endpoint node types by qualified `category.name`; the install-time lint verifies those refs resolve. `label` is stored verbatim in `Edge.label`. Optional edge `properties` follow the same property grammar as nodes and are stored in `Edge.data`.

## Type identity & storage

A node type is addressed as the qualified string `"<category>.<name>"` — e.g. `infrastructure.ip_address` or `threat.malware`. This qualified form is what `Node.type` stores and what a plugin's `io.consumes` / `io.produces` and `emit` reference. Edge types map to `Edge.label`; edge properties (when used) live in `Edge.data`.

## Versioning

`version` is the SemVer of the **pack content**.

- **MAJOR** = a breaking change: a renamed or removed type. This requires a **node migration pass on activation** so existing nodes are remapped.
- **MINOR / PATCH** = additive or fix-level changes that don't break existing `Node.type` values.

!!! note "Open issue: Type Pack version pinning"
    A plugin's `typeRef` does **not** yet carry a Type Pack version or range, so a MAJOR Type Pack bump can silently break a plugin's `io`. The resolution (`typeRef.version_range` + CI cross-check, or resolve-against-activated-version) is still a tracked open issue, not shipped behavior. Treat MAJOR bumps conservatively.

## Validation checklist

The install-time lint enforces cross-field invariants beyond raw JSON Schema:

- [ ] `content_type` is `vineyard:typepack`.
- [ ] `identifier` is a valid `run.vineyard.typepacks.*` reverse-DNS string.
- [ ] At least one entity type; every entity type has ≥1 property.
- [ ] Each property declares an explicit `type` from the enum (no `secret`/`credential`).
- [ ] `validator`, when present, is the structured object — not a raw regex string.
- [ ] `label_property` exists in `properties` and is non-optional.
- [ ] `enum` properties supply `enum`; `reference` properties supply `reference.target`; any `default` matches `type`.
- [ ] Edge `from`/`to` refs resolve to declared node types (or `*`).

## Next / See also

- [Type Pack schema reference](../reference/typepack-schema.md) — the authoritative field contract.
- [Scopes reference](../reference/scopes.md) — what plugins are allowed to do with these types.
- [Plugin manifest](plugin-manifest.md) — how a plugin's `io` references Type Pack types.
- [Security](security.md) — why secrets never become graph properties.
- [Distribution](distribution.md) — the shared `git`/`zip`/`inline` block.
- Catalog: the [six reference packs](../guide/typepacks.md) — Infrastructure, Threat, Identity, Financial, Endpoint, Geospatial.
