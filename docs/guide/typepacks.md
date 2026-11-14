# Working with Type Packs

A **Type Pack** is a small JSON bundle that defines the kinds of entities your graph can hold —
IP addresses, domains, malware families, threat actors, and so on. Installing one in a project
makes those types available when you create nodes, and tells the canvas how each node should look.

## What a Type Pack gives you

A Type Pack declares **entity (node) types**. Edges carry no type: each edge has a free-text
label, written by you when you [draw it](canvas.md#drawing-edges) or by the plugin that found
the link. Each entity type carries:

- A **`label_property`** — the property whose value is shown as the node's name on the canvas.
  For an IP address that is the address itself; for a vulnerability it's the CVE id. Some types
  build the label from several properties instead (a
  [`label_template`](../develop/typepacks.md#entity-types)), and fall back to the
  `label_property` until all of them are filled.
- A set of **properties** — the named fields you can fill in (e.g. `country_code`, `asn`,
  `registrar`). These appear in the Properties panel when a node is selected, each shown by the
  kind of value it holds ([Reading values in the Properties panel](#reading-values-in-the-properties-panel)). When you edit one,
  the value is checked against what the type declares: its kind, its allowed values, and any
  pattern or range (for example, `country_code` must be two capital letters and `asn` a whole
  number from 1 to 4294967295). A value that fails is not saved, and a message says why.
- An **`icon`** and a **`color`** — the visuals that drive how the node renders on the canvas and
  in the Types and Properties panels.

## Installing a Type Pack

Install a Type Pack the same way you install anything else (see [Browse & install](installing.md)).
Once it is installed, its types show up in the **Types** panel and become selectable when you
create a node. Until at least one Type Pack is installed, there are no entity types to choose
from.

In the Types panel, types are grouped by **category**, not by pack, so one pack can fill several
groups (the Infrastructure pack appears under both Infrastructure and Web), each with a count.
Hover a type to see its description, its **Category:** and the **Type pack:** it comes from.
Click a type to create a new node of that type (a placeholder labelled `New <type>`), which is
selected right away so you can fill in its properties. The **Search types…** box at the top
filters the list by type name, category, description or pack name; a panel too narrow for it
shows only the type icons. With no Type Pack installed, the panel says so and offers **Browse the
marketplace**, except to a visitor reading a shared project without signing in.

<figure class="vy-shot" markdown="span">
  ![Types panel with the ip_address tooltip](../assets/guide/types-panel.webp){ width="410" loading=lazy }
  <figcaption>The Types panel groups types by category; hovering one shows its description, category and type pack.</figcaption>
</figure>

When you create a node, you pick a type from an installed Type Pack. Vineyard stores that choice as
a qualified string in the form `category.name` — for example `infrastructure.ip_address` or
`threat.malware`. Plugins reference the same form when they declare what they consume and
produce.

## The reference packs

Vineyard ships several official Type Packs. Each is self-contained — install the ones your
investigation needs — and they are designed to be used together: an edge can join nodes from
different packs (a `threat.malware` that **communicates with** an
`infrastructure.ip_address`, a `cryptocurrency.crypto_address` **controlled by** an
`identity.person`, and so on).

| Pack (`identifier`) | Category | Types | Models |
|---|---|---|---|
| **Infrastructure** (`…typepacks.infrastructure`) | `infrastructure`, `web` | 15 | The network you map during recon, plus the web resource (URL), web-fingerprint (header, favicon, DOM hash) and tracking-ID entities observed on it |
| **Threat** (`…typepacks.threat`) | `threat` | 10 | Threat-intelligence (STIX-aligned) |
| **Identity** (`…typepacks.identity`) | `identity` | 7 | People, orgs, and online personas |
| **Financial** (`…typepacks.financial`) | `financial` | 4 | Exchanges and other virtual-asset service providers, bank accounts, and two legacy crypto types |
| **Cryptocurrency** (`…typepacks.cryptocurrency`) | `cryptocurrency` | 4 | Addresses, transactions, tokens and non-custodial services on every chain, identified by network |
| **Endpoint** (`…typepacks.endpoint`) | `endpoint` | 6 | Host / DFIR artifacts |
| **Geospatial** (`…typepacks.geo`) | `geo` | 3 | Places and physical context |
| **Social Media** (`…typepacks.social`) | `social` | 5 | Platform-agnostic accounts, posts, hashtags, groups, and media |
| **Telegram** (`…typepacks.telegram`) | `telegram` | 4 | Accounts, channels, supergroups, and posts, collected without joining |

### Financial — bank accounts

An account number is unique only within its bank, so `financial.bank_account` is identified by
`bank_code` and `account_identifier` together: the same number at two banks is two nodes, and the
label names the bank (`123456789012 · KB Kookmin`). Write both without spaces or hyphens. A value
such as `123-456-789012` is refused, and the message says what form to write. `bank_code` is the
country's own bank code where it has one (Korea's three digits, such as `004`, `088` or `090`),
otherwise the SWIFT/BIC, never the bank's name: `KB` or `SHINHAN` is refused. Leave it empty for
an IBAN, which already names its bank.

The AI agent is told which fields identify a bank account and how to write the bank code. An
account written without one still shares a node with any other account of the same number and no
code, whichever bank holds it, so check that the agent's bank accounts carry a bank code when you
review them.

The status of a reported account has its own fields:

| Property | What it records |
|---|---|
| `fraud_registration` | `registered` as a fraud-use account (in Korea, 사기이용계좌), `not_registered` when checked and not found, or `released` after a registration was lifted |
| `payment_suspended_at` | When payments from the account were suspended (in Korea, 지급정지) |
| `report_channels` | Where the account was reported, one per line (112, 1332, the holding bank…) |
| `status_checked_at`, `status_source` | When the status was last confirmed, and by whom |

`account_holder` is the holder of record, who is often not the person who used the account. Record
whoever operated it as an `identity.person` linked by an edge. The AI agent reads a bank account's
properties like any other node's, so its number and holder name go to your AI provider when the
agent reads the node. Leave `account_holder` empty when the case does not need the name.

Bank accounts created before Financial 2.0.0 have no bank code, so a new write of the same account
becomes a separate node. Give an old node its bank code and remove any hyphens from its number,
and later writes of that account land on it; a duplicate already written stays separate. The agent
can still record the status of an old account whose number has hyphens: an edit is checked only on
the values it changes.

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
| `infrastructure.dns_record` | name, type and value (e.g. `www.example.com A 93.184.216.34`); the record name until type and value are filled | `record_type`, `record_value`, `ttl` |
| `infrastructure.whois_record` | the subject (domain/IP) | `registrant`, `registrar`, `created_at` |
| `infrastructure.certificate` | the SHA-256 fingerprint | `fingerprint_sha1`, `subject_common_name`, `issuer`, `not_after` |
| `infrastructure.ssh_host_key` | the SHA-256 of the key (hex) | `key_type` |
| `infrastructure.technologies` | the technology name | `kind`, `vendor`, `version`, `cpe` |

The same pack also ships five types in a separate `web` category:

| Type (`category.name`) | Label shown | Notable properties |
|---|---|---|
| `web.url` | the URL | `domain` (the hostname as plain text; an edge links a domain node), `http_status` |
| `web.hhhash` | the HTTP header hash | `header_count`, `server_hint` |
| `web.favicon_hash` | the Shodan-style MMH3 hash (signed decimal) | `mmh3_hex`, `md5`, `sha256`, `phash`, `dhash`, `favicon_url` |
| `web.dom_hash` | the DOM structure hash | `tag_count` |
| `web.tracking_id` | the identifier as the page carries it (e.g. `G-SXM8TFRYSW`); identity is `provider` + `value` | `provider`, `kind` |

`web.favicon_hash` holds one favicon in every form the search services index it under: `hash_value`
for Shodan, FOFA, Censys and ZoomEye, `mmh3_hex` for Criminal IP, `md5` for Censys, ZoomEye,
360 Quake, Hunter.how, ONYPHE and VirusTotal, `sha256` for Censys, Netlas and urlscan.io, and the
perceptual `phash` and `dhash`, which are compared by how many of their bits differ. The AI agent
compares them with `similar_hashes`, and the **Shared-Attribute Clustering** pack links favicons
whose `phash` or `dhash` differ in at most 10 of 64 bits (adjustable per run) with a
`similar favicon` edge. A blank or single-colour icon hashes the same whatever its colour, and a
symmetric logo's `phash` lies within a few bits of that value, so neither compares a hash at or
near it; the favicon's other hash is still compared.

`infrastructure.certificate` is identified by its SHA-256. When the source reports the SHA-1 too
(Shodan, Censys and VirusTotal do), it goes in `fingerprint_sha1`: blocklists such as abuse.ch SSLBL
list certificates by SHA-1 alone, and a SHA-1 cannot be computed from the SHA-256.

Each type ships its own icon and color.

The other packs follow the same shape — for example the **Threat** pack adds
`threat.malware`, `threat.threat_actor`, `threat.indicator`, and `threat.operation` (a bounded
operation within a campaign — one campaign can contain several operations), while **Identity**
adds the people and personas behind the activity.

### Cryptocurrency — a closer look

`run.vineyard.typepacks.cryptocurrency` covers every chain with one set of types, in the
`cryptocurrency` category, and says which chain with `network`. The same string is a different
account on another network — a `1…` address on Bitcoin and on Bitcoin Cash, one `0x…` address on
Ethereum and on BSC — so `network` is part of the identity, and two such nodes never merge.

| Type (`category.name`) | Label shown | Identity | Notable properties |
|---|---|---|---|
| `cryptocurrency.crypto_address` | the address and its network | `network` + `address` + `memo` | `address_kind`, `balance`, `first_funder`, `public_label`, `sanctioned` |
| `cryptocurrency.crypto_transaction` | the hash and its network | `network` + `tx_hash` | `block_height`, `block_time`, `status`, `fee` |
| `cryptocurrency.crypto_token` | the symbol and its network | `network` + `contract_address` | `standard`, `decimals`, `issuer` |
| `cryptocurrency.crypto_service` | the name | `name` | `service_type` (mixer, bridge, gambling, merchant, defi) |

- **Letter case.** Hex, bech32, CashAddr and TON raw values match whatever their case, so an EIP-55
  checksummed address and its lower-case form are one node, and a 64-hex hash matches with or
  without `0x`. Base58 values (legacy Bitcoin, TRON, Solana, Monero, XRPL) are compared exactly.
- **`evm` and `unknown`** are networks not established yet: a `0x…` address whose chain the source
  did not give, and any other address whose network neither the source nor its format settles.
  They stay separate nodes: once the network is established, the `evm` or `unknown` node links to
  the node on that network with `same address on`.
- **Exchanges** and anything else that holds customers' funds (OTC desks, custodial wallets,
  payment processors) are `financial.exchange`; `crypto_service` is for services that do not.
- **Amounts** (`balance`, `fee`) are decimal strings in the network's native unit: full precision,
  but they do not sort as numbers.
- **The Financial pack's** `crypto_address` and `crypto_transaction` remain for older nodes and are
  shown as "(legacy)". They do not merge with the new types. With both packs installed, the short
  name `crypto_address` means the Cryptocurrency pack's type.

Each `network` has a CAIP-2 chain id, the form other tools exchange; the ids are not part of the
identity, so a correction to one never splits a node.

| `network` | CAIP-2 |
|---|---|
| `bitcoin` | `bip122:000000000019d6689c085ae165831e93` |
| `bitcoin_cash` | `bip122:000000000000000000651ef99cb9fcbe` |
| `bitcoin_sv` | `bsv:mainnet` (draft) |
| `bitcoin_gold` | — |
| `litecoin` | `bip122:12a765e31ffd4059bada1e25190f6e98` |
| `dogecoin` | `bip122:1a91e3dace36e2be3bf030a65679fe82` |
| `dash` | — |
| `zcash` | — |
| `monero` | `monero:418015bb9ae982a1975da7d79277c270` (draft) |
| `verge` | — |
| `ethereum` | `eip155:1` |
| `ethereum_classic` | `eip155:61` |
| `bsc` | `eip155:56` |
| `polygon` | `eip155:137` |
| `arbitrum` | `eip155:42161` |
| `optimism` | `eip155:10` |
| `base` | `eip155:8453` |
| `avalanche_c` | `eip155:43114` |
| `evm` | none: the chain is not established |
| `tron` | `tron:728126428` |
| `solana` | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` |
| `xrpl` | `xrpl:0` |
| `ton` | `tvm:-239` |
| `cardano` | proposed: `cardano:1-764824073` |
| `bnb_beacon` | `cosmos:Binance-Chain-Tigris` (draft) |
| `unknown` | none |

Edges carry no type, so the Cryptocurrency pack fixes the labels and data keys that collectors use.
A pair of nodes has one link: a collector adds its data keys to a link that is already there rather
than relabelling it, and figures from different sources go under keys of their own.

| From → to | Label | Data |
|---|---|---|
| address → address | `sent to` | `network`; per source `summary_<source>` (`asset`, `symbol`, `count`, `total`, `first`, `last`, `window_from`, `window_to`, `complete`); `recent`, the latest 20 (`tx_hash`, `asset`, `amount`, `time`); `first_funding`; `deployment` |
| address → address | `deployed` | `deployment` (`tx_hash`), when the pair has no link yet |
| address → transaction | `input to` | `amount`, `inputs` (`index`, `amount`, `prev_txid`, `prev_vout`) |
| transaction → address | `output to` | `amount`, `outputs` (`index`, `amount`) |
| contract address → token | `token contract` | — |
| address → exchange, service or organization | `attributed to` | per source `attribution_<source>` (`label`, `label_kind`: verified, prediction or public_tag, `as_of`) |
| `evm` or `unknown` address → address | `same address on` | how the network was decided. For a contract it does not mean the same owner |
| person or organization → address | `listed address` | `list` (e.g. OFAC SDN), `uid`, `program`, `as_of` |
| URL or domain → address | `accepts payment to` | where the payment address was found |
| legacy `financial.crypto_address`, or a payment `web.tracking_id` → address | `same as` | why they are the same |

!!! tip "Mixing Type Packs"
    Install as many Type Packs as you need — they share one qualified-type namespace and
    interlink by design. You might link a `threat.malware` to the `infrastructure.ip_address`
    it beacons to, attribute a `threat.campaign` to an `identity.organization`, and trace a
    ransom `cryptocurrency.crypto_transaction`.

!!! note "Identity & de-duplication"
    When a plugin or AI task adds a node, Vineyard de-duplicates by **type + the type's
    identity fields** — its `identity_properties` when it declares them (e.g. `identity.account`
    → username + platform; `endpoint.file` → SHA-256, file name, path, host; `endpoint.process`
    → process GUID, name, PID; `financial.bank_account` → bank code + account number), otherwise
    its `label_property` value. Two nodes with the same
    type and identity are merged and their properties combined. Fields the pack marks
    case-insensitive (domains, hostnames, emails, handles…) match regardless of case. A crypto
    address or transaction hash matches whatever the case of its hex or bech32 form, while a
    Base58 address is compared exactly and the network is part of its identity. The most
    useful label is therefore one that is both readable *and* identifying. Most types key on a naturally-unique field (an IP, a CVE id, a tx
    hash, a WHOIS subject). Where a type's label is inherently non-unique — a
    `identity.person`'s name, an `identity.organization`'s name — distinct entities sharing
    that label will merge, so give them a distinguishing label (e.g. `John Smith (DOB 1990)`).
    These two types are identified by the label alone, so filling another property, such as a
    date of birth or a registration number, does not keep them apart. Nodes you add
    **manually** are never auto-merged.

## Reading values in the Properties panel

The Properties panel shows each value by what it is, not only by the type that declares it: a URL
with its host picked out, a hash shortened with its algorithm beside it, a list written into one
text field as separate entries. What changes is how the value is shown. The stored value stays as
it is until you edit it.

A chevron (**›**) at the end of a value opens a view of the whole value under its row.

| Value | In the grid | Under the row |
|---|---|---|
| Long text (`description`, `bio`, a post) | The first line, and how many lines follow (`+3 lines`). | The whole text with its line breaks, **Find** and **Copy**. |
| A list written into one text field (`name_servers`, `open_ports`, `user_ids`, `tags`) | The first entries as chips, and how many there are. | One entry per row, with the host of each URL. **Copy, one per line**, **Copy defanged**, and **Edit as text**. |
| URL | The URL as stored, its host highlighted. A badge marks a URL the browser cannot read (`unreadable`) and one with a user name or password before the host (`credentials`). | Scheme, host (and its Unicode form when it is punycode), port, path, each query parameter decoded, fragment. **Defanged** shows it as `hxxps://example[.]com`, in the grid too. The other nodes with the same host. |
| Hash | The first and last eight characters, and the algorithm read from the property name or the length (`MD5`, `SHA-1`, `SHA-256`, `mmh3`, `ssdeep`, `TLSH`…). The algorithm is a label; nothing is computed. | The whole hash, **Copy**, **Lower case** for a hex hash written in capitals, and the other nodes with the same value. |
| IP address or CIDR block | The value, `v4` or `v6`, and a special-purpose range such as `private`, `loopback` or `documentation`. A block written from a host address is marked `host bits set`. | The canonical form of an address, or a block's network, netmask, first and last address and size. The other nodes in the same /24 (IPv6: /64), or with an address in the block. |
| E-mail address | The domain highlighted. | The local part, the tag after a `+`, and the domain (and its Unicode form). |
| Size, count or amount (`size_bytes`, `*_count`, `followers`, `balance`) | Digits grouped in thousands, a size also in KiB, MiB or GiB, an amount with the node's currency. | — |
| Code: a detection rule, an armored key, a raw record, a command line | Monospace, the first line. | Line numbers, highlighting for YARA, Sigma, PGP armor and WHOIS (up to 8,000 characters), **Find**, **Wrap**, **Copy**, **Download**, and **Edit**, a code editor that saves when you press **Save**. |
| Cryptocurrency address | The chain its format belongs to, and whether its checksum holds (EIP-55, Base58Check, Bech32 and Bech32m). Solana addresses and all-lowercase EVM addresses carry no checksum, and Monero's is not checked. A Base58Check address whose version byte names no chain Vineyard knows (Bitcoin Gold, Dash) shows `checksum ok` without a chain. | The format, the chain, what the node's own currency or network field says, and a link to a block explorer: the one for the network the node names, or for the format's own chain when it names none. The link asks before it opens, because the explorer sees your IP address, the time and the address you looked up. |
| JSON | One line, as before, with **{ }** to edit it. | A tree: fold and unfold, click a key to copy its path (`rdap.events[0].action`), **Find**, and **Raw** for the indented JSON. |

A legacy Bitcoin address is the same string on Bitcoin Cash and Bitcoin SV, and an EVM address the
same string on every EVM chain, each a different account. So no explorer link is offered when the
node names a network of another format, a network Vineyard has no explorer for (Ethereum Classic,
Bitcoin Gold, Dash and others), or only `evm` or `unknown` for an address several chains share. The
view under the row says which.

Dates, times, choices, true/false values and colors are shown as before. A date and time that names
no time zone, an EXIF time (`2021:12:14 11:58:18`) and an epoch number are shown as stored, without
being read as a moment in time.

Which kind a value is, is read from its declared type, the property name and the value itself, so
it can be wrong for an unusual value; a wrong reading changes only how the value is shown. The list
of other nodes appears in the node panel, not in the Review dialog.

### Editing a value

- Click a value, or move to it with **Tab**, to edit it. Long text and code grow in place.
- **Esc** puts the value back as stored and leaves the field. In a one-line field **Enter** saves;
  in long text and code **Enter** adds a line and **⌘Enter** (Mac) or **Ctrl+Enter** saves. A
  value is also saved when you leave the field.
- A list written into one text field is edited as entries: type one and press **Enter**, or remove
  one with its **×**. It is saved with the separator the value already used, one per line or `, `.
  To fix an entry where it stands, without moving it to the end, open the row and choose **Edit as
  text**: the field is then the text as stored. **Edit as entries** turns it back.
- While you type, the field stays the one you clicked, even when what you have typed so far reads
  as a URL, an address or a list. It shows as that kind when you leave it.
- While you edit a URL, an e-mail or IP address, a hash or a cryptocurrency address, a line under
  the field says what is wrong with it: a rule of its type, or a checksum that fails. The type's
  rules decide what is saved.
- In a panel marked *View only*, values are shown and opened the same way and cannot be edited.

## Versions

Type Packs use semantic versioning. A **MAJOR-version bump signals a breaking change** to the
type definitions — a renamed or removed type, for example — which can mean updating the nodes
that already use the old type. Minor and patch updates (new optional properties,
visual tweaks) do not break existing nodes.

## Next / See also

- [Working on the canvas](canvas.md) — how typed nodes render and connect
- [Running plugins](running-plugins.md) — plugins act on the types your Type Packs define
- [Skill Packs](skillpacks.md) — playbooks that pivot on these types
