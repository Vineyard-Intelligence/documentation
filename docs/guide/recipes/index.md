# Investigation recipes

Each recipe follows one investigation from what you start with to where it stops: the packs it
needs, what you click or ask the AI agent at each step, what to look for in the result, and the
mistakes that are easy to make on the way. The controls themselves are described on the other
pages of this guide, and the recipes link to them instead of repeating them.

<div class="vy-cardgrid" markdown>

<div class="vy-card" markdown>
### :material-web: From a phishing domain to its infrastructure
One reported domain: its records and registration, the address it sits on, and which neighbours share an operator rather than only a provider.
→ [Phishing domain to infrastructure](phishing-domain.md)
</div>

<div class="vy-card" markdown>
### :material-account-search: Pivoting on an account or handle
One handle and an e-mail address: the accounts that carry the name, and the evidence that ties two of them to one person or keeps them apart.
→ [Account or handle](account-pivot.md)
</div>

<div class="vy-card" markdown>
### :material-bitcoin: Tracing a crypto address
One payment address: the network it is really on, where the funds went hop by hop, and the exchange or issuer a request goes to.
→ [Crypto address](crypto-trace.md)
</div>

<div class="vy-card" markdown>
### :material-scale-balance: Reading the review and evidence grades
What a review shows before anything is applied, what a link's grade and its corroboration say afterwards, and how to ask again.
→ [Review and evidence grades](review-and-grades.md)
</div>
</div>

## About the examples {#about-the-examples}

Every name, address and result on these pages is made up for them:

- domains under the reserved top-level domains `.example` and `.test`;
- IP addresses from the documentation ranges `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`
  and `2001:db8::/32`, and AS numbers from the documentation range AS64496–AS64511;
- handles, e-mail addresses, organisations and crypto addresses coined for these pages. The crypto
  addresses contain characters their network does not allow, so they belong to nobody.

None of them resolves, so a plugin run on them finds nothing: follow the steps on your own case.
The one real value is a public token contract, which the crypto recipe offers for a practice
lookup.

## Before any recipe {#before-any-recipe}

- A project you can edit. Only the project owner installs packs
  ([Browse & install](../installing.md)); the type packs a plugin pack writes, and the plugin packs a
  skill pack requires, are installed with it.
- For the steps that ask the AI agent: a provider, model and key in the AI agent panel under
  **Setup → Settings** ([The AI agent panel](../tasks.md#the-ai-agent-panel)).
- While you learn, keep the agent's first chip on **Review everything**, or on **Review everything
  (AI-assisted)**, the default, so that every change it proposes waits for you
  ([Review and apply](../tasks.md#review-and-apply)).
- Nothing a plugin or the agent finds reaches the project until you apply it in a review. If you
  have not applied one before, start with
  [Reading the review and evidence grades](review-and-grades.md).

## Next / See also

- [Running plugins](../running-plugins.md) — the Run plugins panel, keys and the review
- [Working with Skill Packs](../skillpacks.md) — the playbooks three of these recipes use
- [Tasks & runs](../tasks.md) — the AI agent, its tools and its settings
