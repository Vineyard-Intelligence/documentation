# Working with Type Packs

A **Type Pack** is a small JSON bundle that defines the kinds of entities your graph can hold —
IP addresses, domains, malware families, threat actors, and so on. Activating one makes those
types available when you create nodes, and tells the canvas how each node should look.

## What a Type Pack gives you

A Type Pack declares **entity (node) types** and, optionally, **edge (relationship) types**.
Each entity type carries:

- A **`label_property`** — the property whose value is shown as the node's name on the canvas.
  For an IP address that is the address itself; for a vulnerability it's the CVE id.
- A set of **properties** — the named fields you can fill in (e.g. `country_code`, `asn`,
  `registrar`). These appear in the Properties panel when a node is selected.
- An **`icon`** and a **`color`** — the visuals that drive how the node renders on the canvas and
  in the Types and Properties panels.

## Activating a Type Pack

Install and activate a Type Pack the same way you install anything else (see
[Installing](installing.md)). Once activated, its types show up in the **Types** panel and become
selectable when you create a node. Until at least one Type Pack is active, there are no entity
types to choose from.

In the Types panel, types are grouped by **category**, not by pack, so one pack can fill several
groups (the Infrastructure pack appears under both Infrastructure and Web), each with a count.
Hover a type to see its description, its **Category:** and the **Type pack:** it comes from.
Click a type to create a new node of that type (a placeholder labelled `New <type>`), which is
selected right away so you can fill in its properties. With no Type Pack installed, the panel
says so and offers **Browse the marketplace**.

When you create a node, you pick a type from an active Type Pack. Vineyard stores that choice as
a qualified string in the form `category.name` — for example `infrastructure.ip_address` or
`threat.malware`. Plugins reference the same form when they declare what they consume and
produce.

## The reference packs

Vineyard ships several official Type Packs. Each is self-contained — install the ones your
investigation needs — and they are designed to be used together, with edge types that cross from
one pack to another (a `threat.malware` that **communicates with** an
`infrastructure.ip_address`, a `financial.crypto_address` **controlled by** an
`identity.person`, and so on).

| Pack (`identifier`) | Category | Types | Models |
|---|---|---|---|
| **Infrastructure** (`…typepacks.infrastructure`) | `infrastructure`, `web` | 14 | The network you map during recon, plus the web resource (URL), web-fingerprint (header, favicon, DOM hash) and tracking-ID entities observed on it |
| **Threat** (`…typepacks.threat`) | `threat` | 10 | Threat-intelligence (STIX-aligned) |
| **Identity** (`…typepacks.identity`) | `identity` | 7 | People, orgs, and online personas |
| **Financial** (`…typepacks.financial`) | `financial` | 4 | The money trail |
| **Endpoint** (`…typepacks.endpoint`) | `endpoint` | 6 | Host / DFIR artifacts |
| **Geospatial** (`…typepacks.geo`) | `geo` | 3 | Places and physical context |
| **Social Media** (`…typepacks.social`) | `social` | 5 | Platform-agnostic accounts, posts, hashtags, groups, and media |
| **Telegram** (`…typepacks.telegram`) | `telegram` | 4 | Accounts, channels, supergroups, and posts, collected without joining |

### Infrastructure — a closer look

`run.vineyard.typepacks.infrastructure` models the network-side entities you map during
reconnaissance, in the `infrastructure` category:

| Type (`category.name`) | Label shown | Notable properties |
|---|---|---|
| `infrastructure.ip_address` | the IP address | `version`, `country_code`, `asn`, `reverse_dns` |
| `infrastructure.domain` | the domain name | `registrar`, `created_date`, `name_servers` |
| `infrastructure.host` | the hostname | `operating_system`, `open_ports`, `hosting_provider` |
| `infrastructure.autonomous_system` | the ASN | `autonomous_system_name`, `registry` |
| `infrastructure.netblock` | the CIDR | `network_name`, `asn` |
| `infrastructure.dns_record` | the record name | `record_type`, `record_value`, `ttl` |
| `infrastructure.whois_record` | the subject (domain/IP) | `registrant`, `registrar`, `created_at` |
| `infrastructure.certificate` | the SHA-256 fingerprint | `subject_common_name`, `issuer`, `not_after` |
| `infrastructure.technologies` | the technology name | `kind`, `vendor`, `version`, `cpe` |

The same pack also ships five types in a separate `web` category:

| Type (`category.name`) | Label shown | Notable properties |
|---|---|---|
| `web.url` | the URL | `domain` (→ `infrastructure.domain`), `http_status` |
| `web.hhhash` | the HTTP header hash | `header_count`, `server_hint` |
| `web.favicon_hash` | the favicon hash | `hash_algorithm`, `favicon_url` |
| `web.dom_hash` | the DOM structure hash | `tag_count` |
| `web.tracking_id` | the namespaced identifier (e.g. `adsense:ca-pub-…`) | `provider`, `kind` |

Edge types wire the recon graph together across both categories: `resolves_to`, `has_address`,
`announced_by`, `contains`, `has_record`, `subdomain_of`, `has_domain`, `redirects_to`,
`has_whois`, `presents_certificate`, `runs_technology` (which links a host, IP, domain, or
URL to the software, hardware, or third-party service — such as Cloudflare — it runs or is
served by), `carries_tracking_id` (a page, domain, or IP embeds a third-party ad/analytics
account ID), and `payment_recipient` (a page's payment form is addressed to an
`identity.email_address`). Each type ships its own icon and color.

The other packs follow the same shape — for example the **Threat** pack adds
`threat.malware`, `threat.threat_actor`, `threat.indicator`, and `threat.operation` (a bounded
operation within a campaign — one campaign can contain several operations), while **Identity**
adds the people and personas behind the activity.

!!! tip "Mixing Type Packs"
    Activate as many Type Packs as you need — they share one qualified-type namespace and
    interlink by design. You might link a `threat.malware` to the `infrastructure.ip_address`
    it beacons to, attribute a `threat.campaign` to an `identity.organization`, and trace a
    ransom `financial.crypto_transaction`.

!!! note "Identity & de-duplication"
    When a plugin or AI task adds a node, Vineyard de-duplicates by **type + the type's
    identity fields** — its `identity_properties` when it declares them (e.g. `identity.account`
    → username + platform; `endpoint.file` → SHA-256, file name, path, host; `endpoint.process`
    → process GUID, name, PID), otherwise its `label_property` value. Two nodes with the same
    type and identity are merged and their properties combined. Fields the pack marks
    case-insensitive (domains, hostnames, emails, handles…) match regardless of case. The most
    useful label is therefore one that is both readable *and* identifying. Most types key on a naturally-unique field (an IP, a CVE id, a tx
    hash, a WHOIS subject). Where a type's label is inherently non-unique — a
    `identity.person`'s name, an `identity.organization`'s name — distinct entities sharing
    that label will merge, so give them a distinguishing label (e.g. `John Smith (DOB 1990)`)
    or populate the stable id the type provides. Nodes you add **manually** are never
    auto-merged.

## Versions

Type Packs use semantic versioning. A **MAJOR-version bump signals a breaking change** to the
type definitions — a renamed or removed type, for example — which can require a migration pass
over the nodes that already use the old type. Minor and patch updates (new optional properties,
visual tweaks) do not break existing nodes.

## Next / See also

- [Working on the canvas](canvas.md) — how typed nodes render and connect
- [Running plugins](running-plugins.md) — plugins act on the types your Type Packs define
- [Skill Packs](skillpacks.md) — playbooks that pivot on these types
