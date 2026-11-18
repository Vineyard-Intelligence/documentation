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
  kind of value it holds ([Reading values](properties.md#reading-values)). When you edit one,
  the value is checked against what the type declares: its kind, its allowed values, and any
  pattern or range (for example, `country_code` must be two capital letters and `asn` a whole
  number from 1 to 4294967295). A value that fails is not saved, and a message says why. A node
  can also hold fields its type does not declare: plugins write them, and you can add your own
  ([Adding and removing fields](properties.md#adding-and-removing-fields)).
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
selected right away so you can fill in its properties. A type whose nodes are hidden on the canvas is
dimmed here; hide or show a type from the canvas legend or **Filter** (see
[Hiding nodes and edges](canvas.md#hiding)).
The **Search types…** box at the top
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
list certificates by SHA-1 alone, and a SHA-1 cannot be computed from the SHA-256. The **abuse.ch** pack's SSLBL Certificate Check reads it.

`infrastructure.domain` takes a name under an internationalised top-level domain, such as
`.한국` (`xn--3e0b707e`) or `.рф` (`xn--p1ai`), from Infrastructure 4.3.0. Write it in Unicode
(`사이트.한국`) or in punycode (`xn--vf4b27jhrk.xn--3e0b707e`): the two spellings are one domain.
From 4.3.1 the punycode prefix may be in capitals too (`EXAMPLE.XN--P1AI`), as the rest of the name
always could. The AI agent's `extract_indicators` writes a name it reads in text in punycode. A
project on an earlier version refuses these names until the pack is updated (**Update** on its
card in the marketplace).

Each type ships its own icon and color.

### Endpoint — host artifacts

`run.vineyard.typepacks.endpoint` holds what an incident responder finds on a machine. The
**Host Artifacts** plugin pack fills it from exports you already have: its **Process Activity
Import** plugin reads Sysmon events 1, 3 and 22, or ECS process, network and DNS events, from files
you pick in the **Run plugins** panel (JSON, JSON lines, CSV or Windows event XML, parsed on your
device) and draws these links:

| From → to | Label | Edge data |
|---|---|---|
| `endpoint.process` → `endpoint.process` | `spawned` | none |
| `endpoint.process` → `endpoint.file` | `executed from` | none |
| `endpoint.process` → `infrastructure.ip_address` | `connected to`, or `accepted connection from` when every connection was inbound | `source`, `events`, `direction`, `first_seen`, `last_seen`, `ports`, `port_count`, `protocols`, `remote_hostnames` |
| `endpoint.process` → `infrastructure.domain` | `queried` | `source`, `events`, `first_seen`, `last_seen`, `answers`, `failed_events`, `statuses` |

A process is identified by its process GUID, image name and PID, so a record without a Sysmon
`ProcessGuid` or an ECS `process.entity_id` is skipped: without it, the same name and PID on two
hosts would become one node. The process type has no host field, so the plugin writes the computer
name to an extra `hostname` field, which the Properties panel shows. All events between one process
and one destination are one link, and its `events` counts connections or lookups rather than
records: Elastic Defend logs a connection when it opens and again when it closes, and that is one
event. A new link carries that summary from the first import. Importing a later export replaces it
rather than adding to it, and a key the later export has no value for becomes empty. The review
lists only the links whose summary changed, so importing the same export again stages nothing. A
link that is already in the project keeps its label, including one you renamed, and only its summary
is written: a `spawned` or `executed from` link you renamed is left as it is. A command line too
long for one node (Linux allows megabytes of arguments) is cut, keeping its start, and the node says
so in `command_line_truncated` and `command_line_length`.
Loopback and link-local traffic never comes in, and private-network addresses and internal names
only when you turn that on. A DNS query for a name under an internationalised top-level domain, such
as `update.example.xn--p1ai`, is a `queried` link to its Domain. A project still on Infrastructure
4.2 does not take such a name: the summary counts it with the names no Domain type takes (*… names
this project's Domain type does not accept (Infrastructure 4.3 or later takes internationalised
names)*), and it is not a failed write.

!!! warning "Host data on a server"
    Host names, user names and command lines become node fields. In a project on a Vineyard server
    they are stored on that server. For a case whose host data must stay on your computer, use the
    desktop app in local mode ([Signed in or local](modes.md)).

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

Most `network` values have a CAIP-2 chain id, the form other tools exchange: some only as a draft
or a proposal, and a few have none registered. The ids are not part of the identity, so a
correction to one never splits a node.
{#crypto-networks}

| `network` | CAIP-2 |
|---|---|
| `bitcoin` | `bip122:000000000019d6689c085ae165831e93` |
| `bitcoin_cash` | `bip122:000000000000000000651ef99cb9fcbe` |
| `bitcoin_sv` | `bsv:mainnet` (draft) |
| `bitcoin_gold` | none registered |
| `litecoin` | `bip122:12a765e31ffd4059bada1e25190f6e98` |
| `dogecoin` | `bip122:1a91e3dace36e2be3bf030a65679fe82` |
| `dash` | none registered |
| `zcash` | none registered |
| `monero` | `monero:418015bb9ae982a1975da7d79277c270` (draft) |
| `verge` | none registered |
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
| `unknown` | none: the network is not established |

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
| person or organization → address | `listed address` | `list` (e.g. OFAC SDN), `uid`, `program` (the entry's programmes), `listed_as` (the codes the list gives the address, e.g. USDT), `as_of`; `listed`, the value as the list wrote it, when it differs |
| URL or domain → address | `accepts payment to` | where the payment address was found |
| legacy `financial.crypto_address`, or a payment `web.tracking_id` → address | `same as` | why they are the same |

`sanctioned`, `sanctions_programs` and `sanctions_as_of` are a screening's answer for the list dated
`sanctions_as_of`: `false` means not on that list, not cleared. The **Sanctions Screening** plugin
pack writes them from OFAC's SDN list, with `sanctions_list` naming the list, and draws the
`listed address` links. It leaves an address alone that is already marked `sanctioned` from another
list or by hand.

The **Chain Explorer** plugin pack fills these types without an account or a key. It reads an
address's history and counterparties, a transaction's inputs and outputs, TRON and XRP Ledger first
funders, contract deployers and tokens, explorer labels, and USDT and USDC freezes. Its Identify
Crypto Network plugin decides the network of an `evm` or `unknown` address, a legacy Financial
address or a payment tracking ID, and draws the `same address on` and `same as` links above. An
address whose format several networks share is placed on each network where it has activity, once
every one of those networks has answered: while an explorer is not answering, the address is left
for the next run. An EVM address that has never sent a transaction and holds no coin or code stays
undecided. The pack covers Bitcoin, Litecoin, Bitcoin Cash, Dogecoin, Dash, Zcash, Ethereum, BNB
Smart Chain (the last 30 days), OP Mainnet, Avalanche C-Chain, Ethereum Classic, TRON, Solana, the
XRP Ledger and TON. History on Polygon, Arbitrum and Base needs a keyed pack.

The **Blockchair** plugin pack writes the transaction rows of the table above, `input to` and
`output to`, and `same address on`, for Bitcoin and six chains built like it.

The **Blockscout PRO** plugin pack fills these types and links on Ethereum, OP Mainnet, Ethereum
Classic and Arbitrum One with your own free key, and on Polygon PoS and Base with a paid Blockscout
plan.

**Solana through Helius.** The **Helius** plugin pack needs a Helius API key, and its free plan
covers history and first funder. A Solana wallet holds SPL tokens in token accounts it owns, so a
plain Solana RPC history leaves out a USDC payment to it; this pack's history includes the
transactions that change those token accounts. It writes `sent to` links with `summary_helius` and
`recent`, the latest 20 transfers merged into the list a link already holds. SOL a wallet wraps
into its own wSOL account is not counted as a payment. On the address it writes
`balance`, `last_seen`, `history_examined` and `history_complete`, with `first_seen` only when the
whole history was read. Its first-funder plugin writes `first_funder`, `first_funding_tx` and
`activated_at`, and adds `first_funding` to the funder's `sent to` link. That key's `source` says
how the funder was found: `helius funded-by` is Helius's own lookup, which needs a paid Helius plan
(Developer or above); `helius earliest SOL deposit` is the SOL transfer in the transaction where the
address's balance first rose from zero, the definition funded-by itself uses. A free key gets that
method, and so does an address funded-by has no record of. An address first credited by a program
rather than a transfer gets no funder. Helius's identity labels (`public_label`, `helius_category`,
and `attributed to` an exchange, service or firm) need a paid plan too. Token transfers before
December 2022 are not found through token accounts.

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
    Base58 address is compared exactly and the network is part of its identity. From
    Infrastructure 4.3.0 a domain, host or DNS record name matches without its trailing dot and
    in its punycode form, an IP address in its standard form (IPv6 as RFC 5952 writes it), and a
    URL however its scheme, host, default port or percent-encoding is written; a URL path keeps
    its case. The node keeps the spelling it already has: a matching write in another spelling
    adds its other fields and leaves the identity as it was. The most
    useful label is therefore one that is both readable *and* identifying. Most types key on a naturally-unique field (an IP, a CVE id, a tx
    hash, a WHOIS subject). Where a type's label is inherently non-unique — a
    `identity.person`'s name, an `identity.organization`'s name — distinct entities sharing
    that label will merge, so give them a distinguishing label (e.g. `John Smith (DOB 1990)`).
    These two types are identified by the label alone, so filling another property, such as a
    date of birth or a registration number, does not keep them apart. Phone numbers are
    identified as written, so `+82 10-1234-5678` and `010-1234-5678` are two
    `identity.phone_number` nodes; the **Phone Numbers** plugin pack writes the E.164 form they
    share as `e164` (Identity 2.4.0 and later), with `region` and a `line_type` estimated from
    the number's range, and leaves the label as it is; nodes that share an `e164` are found as
    duplicates (Identity 2.5.0 and later). Nodes you add **manually** are never auto-merged. Nodes
    that are one entity but are already two in the project are found and merged by the AI agent's
    `find_duplicates` and `merge_nodes`, through your review (see
    [Duplicates and merging](tasks.md#duplicates-and-merging)), or you merge them yourself (see
    [Merging nodes](canvas.md#merging-nodes)).

## In the Properties panel {#reading-values-in-the-properties-panel}

Selecting a node shows its fields in the [Properties panel](properties.md). Its Type Pack decides
much of what the panel can say about them:

- The fields the type declares are listed first, in the pack's order, and a required one is marked
  `*`. The fields the node holds that its type does not declare come after them, under **Added
  fields**.
- Each declared field is edited the way its type calls for, as long as its value fits: a choice
  from the listed values, a switch for true or false, a date picker, a number field
  ([Editing a value](properties.md#editing-a-value)).
- A value you change is checked against the declared type, allowed values, and pattern or range
  before it is saved ([Saving and checks](properties.md#saving-and-checks)). Added fields are not
  checked.

When the node's Type Pack is not installed or did not load, the panel still shows every field the
node holds, but marks none as required and checks no value.

## Versions

Type Packs use semantic versioning. A **MAJOR-version bump signals a breaking change** to the
type definitions — a renamed or removed type, for example — which can mean updating the nodes
that already use the old type. Minor and patch updates (new optional properties,
visual tweaks) do not break existing nodes.

## Next / See also

- [Working on the canvas](canvas.md) — how typed nodes render and connect
- [The Properties panel](properties.md) — reading and editing a node's fields
- [Running plugins](running-plugins.md) — plugins act on the types your Type Packs define
- [Skill Packs](skillpacks.md) — playbooks that pivot on these types
