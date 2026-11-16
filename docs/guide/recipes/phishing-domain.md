# From a phishing domain to its infrastructure

A text message impersonating a parcel service, Kestrune Post, sends its recipients to
`hxxps://kestrune-redelivery[.]example/redeliver`. You have that one URL. The question is what else
the same operator runs, so that it can be blocked or taken down together, and what the domain only
shares with thousands of unrelated sites. The names and addresses here are made up
([About the examples](index.md#about-the-examples)).

## What you start with {#what-you-start-with}

- One domain, `kestrune-redelivery.example`, and the URL on it.
- When the message was seen, if you know: here 2026-11-03.

## Before you start {#before-you-start}

Install these from **Project → Add from Marketplace…**:

| Pack | What it adds | Needs |
|---|---|---|
| **Infrastructure pivoting** (Skill Pack) | The playbook the AI agent follows for this kind of question | Nothing; it works with whatever collection plugins the project has |
| **Domain Recon** | DNS records, RDAP registration, Certificate Transparency subdomains | No key |
| **IP Recon** | RDAP IP (netblock and organisation), Shodan InternetDB (ports, tags, names), IP Geolocation | No key |
| **IP to ASN (Team Cymru - DoH Based)** | The autonomous system that announces an address | No key |
| **CDN / WAF Detection (cdncheck)** | Whether an address or a name is a CDN or WAF front | No key |
| **Shared-Attribute Clustering** | Links nodes already in the graph that share a registrar, a name server, an ASN, a certificate or a similar favicon | No key; reads only the graph |
| **AlienVault OTX** | Passive DNS: the names an address served in the past, and when | A free OTX API key |
| **Web Recon**, **Ad Tags** | The page's favicon, header and DOM hashes, and the tracking IDs in its markup | The desktop app |

The type packs these plugins write (Infrastructure, Threat and Geospatial, and for Ad Tags also
Identity and Cryptocurrency) are installed with them.

Where the requests go: Domain Recon, IP to ASN and CDN / WAF Detection ask public DNS-over-HTTPS
resolvers (Cloudflare and Google); RDAP goes to rdap.org, Certificate Transparency to crt.sh,
InternetDB to Shodan and Passive DNS to AlienVault. None of them contacts the phishing site. Web
Recon and Ad Tags do: they request the page from your computer, so its server sees your address
and the time. They come last here, for a case where that is acceptable.

## Steps {#steps}

### 1. Put the domain on the canvas {#seed}

In the **Types** panel, click **Domain**. The new node is selected: in the Properties panel, type
`kestrune-redelivery.example` into `domain_name` and press Enter. Write the value refanged; `[.]`
and `hxxps` belong in a report, not in a node. To fingerprint the page later (step 7), add a
**URL** node for `https://kestrune-redelivery.example/redeliver` the same way.

When the report holds many indicators, paste it into the AI agent panel and ask the agent to put
them on the graph. It reads defanged spellings, and the nodes it finds wait for your review.

### 2. Resolve the domain {#resolve}

Right-click the domain and choose **Run plugins…** (or select it and press **R**). Tick **DNS Lookup
(A Record)**, **DNS Lookup (AAAA Record)**, **DNS Lookup (NS Record)**, **DNS Lookup (MX Record)**,
**RDAP Domain** and **Certificate Transparency Subdomains**, then press **Run (6)**.

Each plugin is a run of its own: six rows appear in **Tasks**, and each reads **needs review** when
it ends. Click a row, check what it staged and press **Apply**; the
[review recipe](review-and-grades.md) shows what to read on the way.

Look for:

- **RDAP Domain** fills the domain's `registrar`, `created_date`, `expiration_date`, `status` and
  `name_servers`, and creates no node. A `created_date` a few days before the message was seen,
  here 2026-10-30, is what a domain registered for one campaign looks like.
- The A and AAAA records become IP Address nodes linked **resolves to**: `203.0.113.47` and
  `2001:db8:4f2::47`. The Properties panel badges them `documentation`; on a real case, a badge
  such as `private` or `loopback` in that place marks an address that is not on the internet.
- The NS and MX records become DNS Record nodes linked **has record**, here
  `ns1.dovrapark-dns.test` and `ns2.dovrapark-dns.test`.
- **Certificate Transparency Subdomains** adds the names certificates were issued for, up to 150,
  linked **subdomain**: `track.kestrune-redelivery.example`, `pay.kestrune-redelivery.example`.

### 3. Ask whose address it is {#whose-address}

Select both addresses (click one, **Shift**-click the other) and open **Run plugins…**. Tick **IP →
ASN**, **RDAP IP**, **Shodan InternetDB** and **Detect CDN/WAF (IP)**, then **Run (4)**.

Look for:

- **Detect CDN/WAF (IP)** sets an address's `organization` to the provider when the address is in a
  known CDN or WAF range, such as `cloudflare (WAF)`. The domain then sits behind a front, and every
  other name on that address is another customer of the same provider. Stop pivoting on the
  address; the Infrastructure pivoting starter **Find the origin behind a CDN** goes on from there.
- **IP → ASN** creates the Autonomous System, linked **announced by**, and sets the address's `asn`.
  **RDAP IP** creates the Netblock, linked **within netblock**, and fills `organization` and
  `country_code` when they are empty. Here: `203.0.113.0/24`, announced by AS64500, a small hosting
  company.
- **Shodan InternetDB** creates a Host with the open ports (**exposes**), the CVEs it knows of
  (**affected by**), the names that point back at the address (**resolves to**, from the address),
  and writes `shodan_tags` such as `cdn`, `cloud` or `self-signed`.

### 4. Find the names the address served {#neighbours}

Select `203.0.113.47` and run **OTX Passive DNS**. The first time, paste your OTX key into the
plugin's **Settings** block in the Run plugins panel. It is kept on this device for your account, in
a browser tab only until the tab closes ([Running plugins](../running-plugins.md)).

Look for:

- The Domain nodes that resolved to the address, each linked with the dates in its label:
  `resolved to (2026-09-14 → 2026-11-02)`. The link also stores `first_seen` and `last_seen`.
- Names built like the seed and seen in the same weeks: `kestrune-parcel-fee.test`,
  `kestrune-customs.example`. They are candidates. A shared address says only that both names were
  served from it at some time.
- How many names there are. Dozens of unrelated names on one address, such as
  `ombrisel-florist.example`, mean shared hosting, which groups nobody.

OTX draws `resolved to (…)` from the seed domain too, where DNS Lookup already drew `resolves to`.
One pair of nodes holds one link, so that row is an **Update** proposing the OTX wording in place of
the current one. Untick it to keep `resolves to`.

### 5. Compare the candidates' registration {#compare}

Select the candidate domains and run **RDAP Domain** on them. Then select them together with the seed
and run **Shared-Attribute Clustering**, which is listed under **Whole-graph / input via form** and
works on the selection (on the whole graph when nothing is selected).

Look for:

- Links between the domains such as `shared nameserver: ns1.dovrapark-dns.test` or
  `shared registrar: …`. The plugin uses only what the nodes already hold and sends no request.
- What the shared value is. One small DNS host's name server, shared by three brand-like domains
  registered in the same week, narrows the field. A mainstream registrar or a large DNS provider's
  name servers group nobody. The plugin skips a value that more than 30 of the nodes it compares
  share, but a value that is rare among them can still be common on the internet.
- The links' grade. They join nodes that were already in the graph and state a shared value, not an
  observation, so they are applied as `unassessed` and drawn dotted. That is the honest reading of
  them.

### 6. Ask the agent to weigh it {#ask-the-agent}

Choose **Run ▸ Skill packs** and pick **Infrastructure pivoting**. Under the starters, choose
**Related, or just shared hosting?**, fill **First indicator** (`kestrune-redelivery.example`) and
**Second indicator** (`kestrune-parcel-fee.test`), and press **Ask the agent to follow this**. The
prompt is placed in the message box of a new conversation: read it and send it.

Other starters fit other moments: **Expand one indicator** from the start, **Find the origin behind
a CDN** after step 3, **Strip out shared-hosting noise** on a graph that has grown, and **Fingerprint
a URL** and **What did it look like before?** in the desktop app.

Look for, in the answer:

- An estimate rather than a bare verdict: how many unrelated parties share each attribute, what that
  figure rests on, and the check that would settle the question.
- Its changes, waiting for review as change sets. Each link it stages is labelled for what was
  observed (`resolves to`, `shares certificate`), not for a conclusion such as "same operator".
- The hops it could not take. A hop that needs a plugin the project does not have is named, not
  filled in from memory.

### 7. Fingerprint the page (desktop app, optional) {#fingerprint}

This step requests the page from your computer. Select the URL node and run **Favicon Hash**, **HTTP
Header Hash (HHHash)**, **DOM Structure Hash** and **Ad Tag Extract**.

Look for:

- A Tracking ID that another site in the project carries too. Both sites link to the same Tracking
  ID node by **carries tracking ID**, a strong lead and still a candidate: a cloned kit keeps the
  analytics ID of the site it was cloned from.
- Favicon hashes. Run Shared-Attribute Clustering again, and favicons whose perceptual hashes differ
  in at most 10 of 64 bits are linked `similar favicon: …`. A blank or single-colour icon is not
  compared.

## Where it ends {#where-it-ends}

A branch stops when the next hop would reach only background values (a CDN front, shared hosting, a
mainstream registrar), when it reaches someone who can act (the registrar RDAP names, the
organisation behind the netblock), or when no installed plugin can take it. Ask for the summary with
the starter **Summarise the footprint** (**Starting indicator**): it walks the chain hop by hop with
the evidence for each, names the branches that stopped and why, and lists what was run and came back
empty.

For a briefing, **View ▸ Saved views** keeps the arrangement ([Saved views](../canvas.md#saved-views)),
a node's **Document** view has **Copy as Markdown**
([Document and JSON views](../properties.md#document-and-json-views)), and **Edit ▸ Copy labels,
defanged** copies the selected indicators for a ticket.

When a page or a registration record names a person, an e-mail address or a handle, go on with
[Pivoting on an account or handle](account-pivot.md).

## Pitfalls {#pitfalls}

- **A front is not the operator.** The addresses of a domain behind a CDN belong to the CDN, and so
  do the names that share them.
- **Shared is not related.** A registrar, a name server or an ASN that thousands use links nobody.
  Shared-Attribute Clustering's limit of 30 counts the nodes it compares, not the internet.
- **Passive DNS is history.** A name that resolved to the address two years ago does not share it
  now; read the dates in the label.
- **Certificate logs list names, not live hosts.** A subdomain from crt.sh had a certificate issued
  for it once.
- **"No changes" can mean "could not check".** A run whose hosts did not answer ends with a yellow
  toast that names them ([Progress and cancellation](../running-plugins.md#progress-and-cancellation)).
- **Several plugins, several reviews.** A link in one run to a node another run has not created yet
  waits until that review is applied, and the footer of the review says so.
- **Some steps touch the site.** Web Recon and Ad Tags fetch the page from your computer. To keep the
  agent off a host altogether, such as the impersonated brand's own `kestrunepost.example`, add it in
  the AI agent panel under **Setup → Session scope → Hosts nothing may collect from**.

## Next / See also

- [Reading the review and evidence grades](review-and-grades.md) — what each review in this recipe
  shows, and what the links' grades mean
- [Running plugins](../running-plugins.md) — the Run plugins panel and the review
- [Working with Type Packs](../typepacks.md) — the Infrastructure types and what identifies each
