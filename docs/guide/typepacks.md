# Working with Type Packs

A **Type Pack** is a small JSON bundle that defines the kinds of entities your graph can hold — IP addresses, domains, malware families, threat actors, and so on. Activating one makes those types available when you create nodes, and tells the canvas how each node should look.

## What a Type Pack gives you

A Type Pack declares **entity (node) types** and, optionally, **edge (relationship) types**. Each entity type carries:

- A **`label_property`** — the property whose value is shown as the node's name on the canvas. For an IP address that is the address itself; for a vulnerability it's the CVE id.
- A set of **properties** — the named fields you can fill in (e.g. `country_code`, `asn`, `registrar`). These appear in the Properties panel when a node is selected.
- An **`icon`** and a **`color`** — the visuals that drive how the node renders on the canvas and in the Types and Properties panels. The Type Pack author sets these; see [Authoring Type Packs](../develop/typepacks.md) for the icon/color rules.

## Activating a Type Pack

Install and activate a Type Pack the same way you install anything else (see [Installing](installing.md)). Once activated, its types show up in the **Types** panel and become selectable when you create a node. Until at least one Type Pack is active, there are no entity types to choose from.

When you create a node, you pick a type from an active Type Pack. Vineyard stores that choice as a **qualified string** in the form `category.name` — for example `infrastructure.ip_address` or `threat.malware`. That qualified string is the canonical identity of a node's type; plugins reference the same form when they declare what they consume and produce.

## The reference packs

Vineyard ships six official Type Packs. Each is self-contained — install the ones your
investigation needs — and they are designed to be used together, with edge types that
cross from one pack to another (a `threat.malware` that **communicates with** an
`infrastructure.ip_address`, a `financial.crypto_address` **controlled by** an
`identity.person`, and so on).

| Pack (`identifier`) | Category | Types | Models |
|---|---|---|---|
| **Infrastructure** (`…typepacks.infrastructure`) | `infrastructure` | 9 | The network you map during recon |
| **Threat** (`…typepacks.threat`) | `threat` | 8 | Threat-intelligence (STIX-aligned) |
| **Identity** (`…typepacks.identity`) | `identity` | 5 | People, orgs, and online personas |
| **Financial** (`…typepacks.financial`) | `financial` | 4 | The money trail |
| **Endpoint** (`…typepacks.endpoint`) | `endpoint` | 6 | Host / DFIR artifacts |
| **Geospatial** (`…typepacks.geo`) | `geo` | 3 | Places and physical context |

### Infrastructure

`run.vineyard.typepacks.infrastructure` models the network-side entities you map during
reconnaissance, all in the `infrastructure` category:

| Type (`category.name`) | Label shown | Notable properties |
|---|---|---|
| `infrastructure.ip_address` | the IP address | `version`, `country_code`, `asn`, `reverse_dns` |
| `infrastructure.domain` | the domain name | `registrar`, `created_date`, `name_servers` |
| `infrastructure.url` | the URL | `domain` (→ `infrastructure.domain`), `http_status` |
| `infrastructure.host` | the hostname | `ip_address`, `operating_system`, `open_ports` |
| `infrastructure.autonomous_system` | the ASN | `autonomous_system_name`, `registry` |
| `infrastructure.netblock` | the CIDR | `network_name`, `asn` |
| `infrastructure.dns_record` | the record name | `record_type`, `record_value`, `ttl` |
| `infrastructure.whois_record` | the subject (domain/IP) | `registrant`, `registrar`, `created_at` |
| `infrastructure.certificate` | the SHA-256 fingerprint | `subject_common_name`, `issuer`, `not_after` |

Edge types wire the recon graph together: `resolves_to`, `has_address`, `announced_by`,
`contains`, `has_record`, `subdomain_of`, `has_domain`, `redirects_to`, `has_whois`, and
`presents_certificate`. Each type ships its own icon and color, so an `ip_address`, a
`domain`, and a `certificate` are visually distinct at a glance.

### Threat

`run.vineyard.typepacks.threat` covers threat-intelligence entities (aligned with STIX 2.1
concepts), all in the `threat` category:

| Type (`category.name`) | Label shown | Notable properties |
|---|---|---|
| `threat.malware` | the malware name | `malware_type`, `platform`, `hash_sha256`, `first_seen` |
| `threat.campaign` | the campaign name | `status`, `objective`, `attribution`, `start_date` |
| `threat.threat_actor` | the actor name | `actor_type`, `motivation`, `sophistication`, `country` |
| `threat.vulnerability` | the CVE id | `cvss_score`, `severity`, `exploited_in_wild` |
| `threat.indicator` | the indicator value | `indicator_type`, `confidence`, `valid_from` |
| `threat.attack_pattern` | the technique name | `technique_id` (MITRE ATT&CK), `tactic` |
| `threat.tool` | the tool name | `tool_type`, `aliases` |
| `threat.signature` | the rule name | `signature_type` (YARA / Sigma / …), `rule` |

These connect through `uses`, `attributed_to`, `targets`, `exploits`, `indicates`,
`variant_of`, `detects`, `communicates_with`, and `refers_to` (which ties an abstract
indicator to the concrete typed node it identifies). For instance, a `threat.vulnerability`
validates its `cve_id` against the CVE format and is drawn with a `shield-alert` icon,
while a `threat.threat_actor` is drawn with a `venetian-mask` icon.

### Identity

`run.vineyard.typepacks.identity` models the people and online personas behind activity,
all in the `identity` category:

| Type (`category.name`) | Label shown | Notable properties |
|---|---|---|
| `identity.person` | the full name | `aliases`, `nationality`, `occupation` |
| `identity.organization` | the org name | `org_type`, `country`, `industry`, `website` |
| `identity.email_address` | the email | `domain`, `breached` |
| `identity.phone_number` | the number | `country_code`, `carrier`, `line_type` |
| `identity.user_account` | the username | `platform`, `profile_url`, `followers` |

Relationships include `owns`, `member_of`, `affiliated_with`, `controls`, and the
undirected `same_as` for tying personas together during attribution.

### Financial

`run.vineyard.typepacks.financial` follows the money. It records **public identifiers
only** — never private keys, full card numbers, or credentials — in the `financial`
category:

| Type (`category.name`) | Label shown | Notable properties |
|---|---|---|
| `financial.crypto_address` | the address | `currency`, `balance`, `owner_label` |
| `financial.crypto_transaction` | the tx hash | `currency`, `amount`, `fee`, `timestamp` |
| `financial.exchange` | the exchange name | `country`, `kyc_level` |
| `financial.bank_account` | the account identifier | `bank_name`, `account_holder`, `country` |

Edge types `transfers_to`, `input_to`, `output_to`, `hosted_at`, and `controlled_by`
let you reconstruct a flow of funds and tie it back to a controlling identity.

### Endpoint

`run.vineyard.typepacks.endpoint` captures host-level forensic (DFIR) artifacts so you can
map malware behavior on a machine, all in the `endpoint` category:

| Type (`category.name`) | Label shown | Notable properties |
|---|---|---|
| `endpoint.file` | the file name | `file_path`, `sha256`, `signed` |
| `endpoint.process` | the process name | `pid`, `parent_pid`, `command_line` |
| `endpoint.registry_key` | the key path | `hive`, `value_name`, `value_data` |
| `endpoint.service` | the service name | `binary_path`, `start_type`, `state` |
| `endpoint.mutex` | the mutex name | `created_by` |
| `endpoint.persistence` | the entry name | `mechanism`, `trigger`, `action` |

Behavioral edges `spawned`, `executed`, `wrote`, `created_mutex`, `installed`, and
`dropped` reconstruct an execution chain, and `observed_on` anchors any artifact to the
host (`infrastructure.host`) it was seen on.

### Geospatial

`run.vineyard.typepacks.geo` anchors the *where* of an investigation, in the `geo`
category:

| Type (`category.name`) | Label shown | Notable properties |
|---|---|---|
| `geo.location` | the place name | `latitude`, `longitude`, `city`, `country` |
| `geo.address` | the formatted address | `street`, `postal_code`, `country` |
| `geo.facility` | the facility name | `facility_type`, `operator` |

Its `located_at` edge accepts **any** source type (`from: ["*"]`), so you can pin a person,
a host, or an organization to a place; `located_in` and the undirected `near` relate places
to one another.

!!! tip "Mixing Type Packs"
    Activate as many Type Packs as you need — they share one qualified-type namespace and
    interlink by design. You might link a `threat.malware` to the `infrastructure.ip_address`
    it beacons to, attribute a `threat.campaign` to an `identity.organization`, trace a
    ransom `financial.crypto_transaction`, then run a plugin like
    [CIDR Expand](../develop/plugin-manifest.md) to enumerate the surrounding address space.

!!! note "Identity & de-duplication"
    When a plugin or AI task adds a node, Vineyard de-duplicates by **type + the
    `label_property` value** — two nodes of the same type with the same label are merged and
    their properties combined. The most useful label is therefore one that is both readable
    *and* identifying. Most types key on a naturally-unique field (an IP, a CVE id, a tx
    hash, a WHOIS subject). Where a type's label is inherently non-unique — a
    `identity.person`'s name, an `endpoint.process`'s image name — distinct entities sharing
    that label will merge, so give them a distinguishing label (e.g. `John Smith (DOB 1990)`)
    or populate the stable id the type provides (`endpoint.process.process_guid`,
    `endpoint.file.sha256`). Nodes you add **manually** are never auto-merged.

## Versions and migrations

Type Packs use semantic versioning. A **MAJOR-version bump signals a breaking change** to the type definitions — a renamed or removed type, for example. Activating a new major version can therefore require a **migration pass** over the nodes that already use the old type so their stored `category.name` stays valid. Minor and patch updates (new optional properties, visual tweaks) do not break existing nodes.

!!! note "Type version pinning is an open issue"
    Today a plugin's input/output references do not pin a specific Type Pack version, so a major Type Pack bump could affect a plugin that consumes those types. This is a tracked design item, not shipped behavior — see the canonical [specification](../develop/index.md) for the current state.

## Next / See also

- [Authoring Type Packs](../develop/typepacks.md) — define your own types, icons, validators, and edge types.
- [Type Pack schema](../reference/typepack-schema.md) — the full `vineyard:typepack` format reference.
- [Working on the canvas](canvas.md) — how typed nodes render and connect.
- [Running plugins](running-plugins.md) — plugins act on the types your Type Packs define.
