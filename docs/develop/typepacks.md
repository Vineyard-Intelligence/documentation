# Type Packs

A Type Pack is a `vineyard:typepack` document that defines the **node entity types** your graph and plugins work with. For the field-by-field contract see the [Type Pack schema reference](../reference/typepack-schema.md).

## What a Type Pack is

Plugins do not invent their own data shapes. They `consume` and `produce` node types that a Type Pack declares, addressed by a qualified string. Edges carry no type: a relationship is stated in the edge's free-text `label`. The shipping reference packs are [Infrastructure, Threat, Identity, Financial, Endpoint, Geospatial, Social Media, and Telegram](../guide/typepacks.md).

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
  "marketing_url": "https://vineyard.run/packs/infrastructure",
  "thumbnail_url": "https://vineyard.run/img/infra.png",
  "types": [ /* entity types — at least one required */ ]
}
```

`types[]` requires at least one entity type. The full required/optional field table is in the [Type Pack schema reference](../reference/typepack-schema.md).

!!! note "The reference packs are valid templates"
    The eight reference packs (`infrastructure.json`, `threat.json`, `identity.json`, `financial.json`, `endpoint.json` and `geo.json` in `typepack-basic`, `social.json` in `typepack-social`, `telegram.json` in `typepack-telegram`) follow this schema — explicit property types, structured validators, and the required top-level fields — so you can read any of them as a working template. `telegram.json` leaves `optional` out on some properties; write it on every property of your own pack (see [Property types](#property-types)). New authoring MUST follow the schema below.

## Entity types

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
    "country_code": { "type": "string", "validator": { "regex": "^[A-Z]{2}$" }, "optional": true },
    "asn":          { "type": "integer", "validator": { "min": 1, "max": 4294967295 }, "optional": true },
    "organization": { "type": "string", "optional": true }
  }
}
```

- `category` and `name` are **snake_case identifier segments** (`^[a-z][a-z0-9_]*$`, ≤31 chars).
- `properties` MUST be non-empty; each property key is also a snake_case segment.
- `label_property` names the key used as the node's display label. That key must exist in `properties` **and** be non-optional (`"optional": false`).
- `identity_properties` (optional) lists the keys — together — that identify one entity for de-duplication; defaults to `[label_property]`. Display and identity are different questions: `identity.account` has `username` as its `label_property` but is *identified* by `(username, platform)`, since the same username on two platforms is two different accounts. Every listed key MUST exist in `properties`.
- `label_template` (optional) builds the display label from several properties, e.g. `"{username} · {platform}"`. Falls back to `label_property` when a referenced field is empty, so a partially-filled node never shows a dangling separator. Display only — de-duplication always uses `identity_properties`.

## Property types

Every property MUST declare an explicit `type` from the enum (see the [schema reference](../reference/typepack-schema.md) for the full list). Write `optional` on every property, too. `"optional": false` makes the key required: a plugin or the agent creating a node without it is refused. `"optional": true` lets the key be absent from `Node.data`. A property that leaves `optional` out is marked required (`*`) in the Properties panel, but a create without it is accepted, so do not rely on the absent flag. You may supply a `default` (its value should match `type`), but the app never applies it: nothing fills an absent key from it, so it is documentation only. Three of the types need extra keys:

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

`validator` is a **structured object**, not a raw regex string. Its keys (`regex`, `min`/`max`, `min_length`/`max_length`, `format`) are tabulated in the [schema reference](../reference/typepack-schema.md).

```jsonc
"cvss_score": { "type": "number", "validator": { "min": 0, "max": 10 }, "optional": true }
```

A `regex` is tested as written, so a match anywhere in the value passes: `[A-Z]{2}` accepts `xxUSyy`. Anchor it with `^…$` when the whole value must match, as every reference pack does.

### What the app checks on node data

A Type Pack's property declarations are checked when a plugin or the AI agent calls `createNode` or `updateNode`, and when an analyst saves an edit in the Properties panel. A write that fails is refused with a message naming each problem (a plugin's call throws). Only the keys being written are checked, plus, on create, the required keys:

- **`type`**: a `string`, `text`, `hash`, `url`, `email`, `ip`, `date` or `datetime` value must be a string; `integer` a whole number; `number` a finite number; `boolean` a boolean; `array` an array; `object` an object that is not an array. A `reference` value is not checked.
- **`enum`**: the value must be one of the listed values.
- **`validator.regex`**: applied to string values as written (see above). It is skipped for values longer than 4,096 characters, for a pattern that does not compile, and for a pattern with a backtracking-prone shape such as `(a+)+`.
- **`validator.min` / `validator.max`**: applied to number values.
- **`"optional": false`**: on create only, the key must be present and not blank.

Not checked: `validator.min_length`, `max_length` and `format`, which are hints; keys the type does not declare; and blank values (`null`, `""`), which count as absent. A node created from the Types panel starts as an unchecked placeholder (`New <type>`); its values are checked as the analyst edits them.

## Visuals: icon and color

Both are per-entity-type and optional.

- **`icon`** is polymorphic, resolved in order:
    1. a `data:` / `http(s):` image URI → drawn as the node icon;
    2. otherwise a kebab-case **lucide** icon name (e.g. `shield-alert`) → serialized to an SVG and tinted to `color`;
    3. otherwise a literal **glyph/emoji**.

    When `icon` is absent, the node renders with `color` only. lucide is the default icon set:
    the host bundles the complete set, so **any** kebab-case lucide name resolves; a name that
    is not a lucide icon falls back to `color`.
- **`color`** is `#rrggbb`. When absent, a stable color is hashed from `category.name`.

The Threat pack, for example, uses lucide names like `bug` (malware), `shield-alert` (vulnerability), and `venetian-mask` (threat actor).

## Type identity & storage

A node type is addressed as the qualified string `"<category>.<name>"` — e.g. `infrastructure.ip_address` or `threat.malware`. This qualified form is what `Node.type` stores and what a plugin's `io.consumes` / `io.produces` and `emit` reference. Edges have no type field; the relationship is stated in the free-text `Edge.label`.

**De-duplication keys on the exact qualified type.** When a plugin or AI task adds a node, the
host de-duplicates by `"<category>.<name>"` + the identifying value, resolved in order:
`identity_properties` (joined, when the type declares it), else `label_property`, else `value`,
else `name`. Values are compared exactly unless the property sets `"case_insensitive": true`,
which folds case for de-duplication only (display and storage keep what was written). Set it where
case carries no meaning, such as handles, domains, hostnames, emails and hex digests. Never set it on
Base58/EIP-55 crypto addresses, URL paths or case-sensitive file paths, where two different entities
can differ by case alone. The type is resolved by its exact qualified key only — a node whose type
is not defined by an installed pack keeps its raw type string, so a pack that moves a type to
another category (e.g. `url` from `infrastructure` to `web`) never merges old nodes with the new
type's creates. Creating a node with a type no installed pack defines is refused outright.
(Each `io.consumes`/`io.produces` typeRef resolves to the Type Pack that defines it. The plugin's
registry entry must list those packs in `typepacks`, which CI enforces. The marketplace installs the
packs in that list alongside the plugin.)

## Versioning

`version` is the SemVer of the **pack content**.

- **MAJOR** = a breaking change: a renamed or removed type. Nothing remaps existing nodes when a new MAJOR is installed; they keep the old `type` string. A node whose stored type no longer exists renders through any installed type with the same bare `name` (the first in pack-identifier order), so a type moved to another category still draws with its new definition, though it never merges with new creates. Only a node whose bare name matches no installed type renders unresolved. Nodes record, at write time, the pack revision that resolved their type as `Node.type_pack` (`"<identifier>@<version>"`), so a later remapping can tell which revision produced them.
- **MINOR / PATCH** = additive or fix-level changes that don't break existing `Node.type` values.

!!! note "Open issue: Type Pack version pinning"
    A plugin's `typeRef` does **not** carry a Type Pack version or range, so a MAJOR Type Pack bump can silently break a plugin's `io`. Treat MAJOR bumps conservatively.

## Validation checklist

Nothing validates a Type Pack against this checklist at install time: the app loads any document with `content_type: vineyard:typepack`. Treat it as an authoring checklist, and validate your document against [`typepack.schema.json`](https://registry.vineyard.run/schemas/typepack.schema.json) in your own CI, as the reference pack repos do. Registry CI enforces only these: the pinned document's `identifier`, `content_type` and `version` match the entry; `type_count` matches; `icon`, when the entry carries one, equals the first type's lucide icon; every `identity_properties` key names an existing, scalar (not `array`/`object`/`json`) property; and no `category.name` is already defined by another published Type Pack.

- [ ] `content_type` is `vineyard:typepack`.
- [ ] `identifier` is a valid `<your-namespace>.typepacks.*` reverse-DNS string.
- [ ] At least one entity type; every entity type has ≥1 property.
- [ ] Each property declares an explicit `type` from the enum (no `secret`/`credential`).
- [ ] `validator`, when present, is the structured object — not a raw regex string.
- [ ] `label_property` exists in `properties` and is non-optional.
- [ ] Every property writes `optional` explicitly; each required one says `"optional": false`.
- [ ] Every `validator.regex` that must match the whole value is anchored with `^…$`.
- [ ] `enum` properties supply `enum`; `reference` properties supply `reference.target`; any `default` matches `type`.

## Next / See also

- [Type Pack schema reference](../reference/typepack-schema.md) — the authoritative field contract.
- [Scopes reference](../reference/scopes.md) — what plugins are allowed to do with these types.
- [Plugin manifest](plugin-manifest.md) — how a plugin's `io` references Type Pack types.
- [Security](security.md) — why secrets never become graph properties.
- [Distribution](distribution.md) — how pinned pack documents are fetched and verified.
- Catalog: the [reference packs](../guide/typepacks.md) — Infrastructure, Threat, Identity, Financial, Endpoint, Geospatial, Social Media, Telegram.
