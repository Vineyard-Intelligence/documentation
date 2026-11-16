# Tracing a crypto address

The victim of a fake investment desk sent 2,400 USDT on TRON to an address a "support agent" gave in
a chat, on 2026-10-29 around 21:10 KST. You have the address, the amount and the time. The question
is where the money went, which exchange or stablecoin issuer can freeze it or name the account
holder, and whether anything on the way is sanctioned.

!!! note "The addresses on this page are fictional"
    Every address below is made up for this page and labelled as such. Each contains characters a
    TRON address cannot (`0`, `I`, `l`), so it belongs to nobody, and a lookup on it finds nothing.
    Follow the steps with the address from your own case.

| Role in this example | Address (fictional) |
|---|---|
| Where the victim paid | `TFictionalScamDepositAddress000001` |
| Where most of it went next | `TFictionalIntermediaryAddress00002` |
| An exchange wallet the explorer labels | `TFictionalExchangeHotWallet0000003` |
| Who first funded the deposit address | `TFictionalFirstFunderAddress000004` |

## What you start with {#what-you-start-with}

- An address, and its network if the victim's wallet or receipt names it. A USDT payment marked
  TRC-20 is on `tron`.
- The amount and the time, which pick the right transfer out of an address's history.
- A transaction hash is as good a start (starter **Start from a transaction**), and so is a text that
  holds addresses, such as a complaint or a chat export (starter **Pull addresses out of a text**).

## Before you start {#before-you-start}

Install from **Project → Add from Marketplace…**:

| Pack | What it adds | Needs |
|---|---|---|
| **Crypto fund-flow tracing** (Skill Pack) | The playbook the AI agent follows for a trace | It requires Chain Explorer, which is installed with it |
| **Chain Explorer** | Address history and transactions on fifteen networks, which network a bare address is on, TRON and XRP Ledger first funders, contracts and tokens, explorer labels, USDT and USDC freezes | No key; the browser and the desktop app |
| **Sanctions Screening** | Addresses checked against OFAC's SDN list | No key |

For more depth where the keyless sources stop, these keyed packs are optional:

| Pack | Where it reaches further | Needs |
|---|---|---|
| **Blockscout PRO** | Ethereum, OP Mainnet, Ethereum Classic and Arbitrum One with a free key, Polygon PoS and Base with a paid plan, and first funders on EVM chains | A Blockscout PRO key; the desktop app |
| **Helius** | Solana history including the SPL tokens paid into a wallet's token accounts, and who sent a wallet its first SOL | A Helius key; its wallet identity labels need a paid plan |
| **Blockchair** | Bitcoin, Bitcoin Cash, Litecoin, Bitcoin SV, Dogecoin, Dash and Zcash | A Blockchair key |

The type packs these plugins write (Cryptocurrency, and for Sanctions Screening and Helius also
Identity and Financial) are installed with them.

Who sees it: each explorer and API a plugin calls receives the addresses and transactions you look
up. Nothing reaches the addresses' owners. Chain Explorer's free sources promise no uptime and have
daily limits.

!!! tip "A practice lookup on a real contract"
    To see what the pack writes before you work a case, add a Crypto Address for Tether's USDT
    contract on TRON, `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` with `network` `tron`, and run **Crypto
    Contract and Token** on it. The address gets `address_kind` (a contract), and a Crypto Token,
    `USDT · tron`, is linked to it by **token contract**.

## Steps {#steps}

### 1. Put the address on the canvas {#seed}

In the **Types** panel, click **Crypto Address**. In the Properties panel, type the address into
`address` exactly as the victim's wallet shows it, and choose `tron` for `network`.

Look for: the address row shows which chain the address's format belongs to and whether its checksum
holds ([Reading values](../properties.md#reading-values)). A failing checksum on a real address is a
typo; fix it before any lookup, because a lookup on a mistyped address finds nothing. When you do
not know the network, choose `unknown`, or `evm` for a `0x…` address whose chain nobody gave, and
take step 2.

### 2. Settle the network (for `evm`, `unknown` or a legacy address) {#network}

Select the address and open **Run plugins…**. **Identify Crypto Network** takes no node type, so it is
listed under **Whole-graph / input via form**; tick it and press **Run**. It works on the selection.

Look for: a Crypto Address on each network where the string has activity, linked **same address on**
from the original, with the reason on the link. The original is left as it is. A `0x…` string active
on Ethereum and on BNB Smart Chain becomes two nodes, two accounts that happen to share a string.
Trace from the new nodes. An address that an explorer did not answer for is left for the next run,
and an EVM address that has never sent a transaction and holds nothing stays undecided.

### 3. Read the first hop {#first-hop}

Select the TRON address and run **Crypto Address History**. **Pages per list** sets how far back it
reads (2 pages by default) and **Most counterparties linked per address** how many links it draws
(50). Review and apply.

Look for:

- **sent to** links to and from the address's counterparties. Click one and read **Recorded with
  this link** in the Properties panel ([Recorded with this link](../properties.md#recorded-with-this-link)):
  `summary_trongrid` (`summary_tronscan` when TronGrid refused) gives the figures per asset under
  `assets` (`symbol`, `count`, `total`, `first`, `last`), the window they cover (`window_from`,
  `window_to`) and `complete`; `recent` lists the latest 20 transfers with `tx_hash`, `amount` and
  `time`.
- On the address: `balance`, `history_examined` and `history_complete`. `false` means older history
  was not read, and the run's summary says to raise **Pages per list**. Do that before you conclude
  anything about the address's early transfers.
- The transfer to follow. The victim's 2,400 USDT arrive at 21:10; about forty minutes later
  2,380 USDT leave on one link, to `TFictionalIntermediaryAddress00002` (fictional). Follow by asset,
  amount and time, not by the largest figure on the canvas.

Amounts are decimal strings in the asset's own unit: USDT, not its smallest unit.

### 4. Take the next hop {#next-hop}

Select the next address and choose **Run ▸ Run the last plugins again on the selection**: the panel
opens with Crypto Address History ticked and your values filled in, and **Enter** runs it
([Running the same plugins again](../running-plugins.md#running-the-same-plugins-again)). Each hop is
one run and one review.

Stop the branch at an address with hundreds of counterparties. That is a service, not a person: an
exchange's deposit or hot wallet, a payment processor, a bridge.

### 5. Check what the trace reached {#checks}

Select the addresses on the trace and run these together:

- **Crypto Public Labels** writes the label a block explorer publishes as `public_label`, with
  `label_source`: on TRON, Tronscan's public tag, such as `Ostrevan Exchange Hot Wallet 2` on
  `TFictionalExchangeHotWallet0000003` (both fictional). A label is the explorer's claim, not an
  attribution.
- **Stablecoin Freeze Status** asks the issuers' contracts: USDT and USDC on Ethereum, USDT on TRON. A
  frozen address gets `frozen_by_issuer`, such as `USDT (Tether)`, and every address checked gets
  `frozen_checked_at`.
- **Crypto Activation and First Funder** (TRON and XRP Ledger) writes `activated_at`, `first_funder`
  and `first_funding_tx`, and adds `first_funding` to the funder's **sent to** link: here
  `TFictionalFirstFunderAddress000004` (fictional). On TRON it follows the account's activation, and
  when that was not a plain transfer it says it could not tell.
- **OFAC Address Screening** (Sanctions Screening) writes `sanctioned`, `sanctions_list`,
  `sanctions_programs` and `sanctions_as_of`. `false` means not on OFAC's SDN list of that date, not
  cleared ([Screening against sanctions lists](../running-plugins.md#sanctions)).

### 6. Let the agent carry the trace {#ask-the-agent}

Choose **Run ▸ Skill packs**, pick **Crypto fund-flow tracing**, and choose the starter **Trace funds
from an address**. Fill **Address** and **What you already know (optional)**
(`2,400 USDT on TRON, sent 2026-10-29 around 21:10 KST`), press **Ask the agent to follow this**,
and send the prompt.

How the trace goes:

- The playbook has the agent settle the network before any hop, and never hop from an address on
  `evm` or `unknown`.
- What a hop stages can be read only once it is applied, so the trace advances one hop per turn.
  Under **Review everything** you apply each turn's change sets and ask it to continue. Under **Apply
  automatically**, **Follow-up** (**Keep working after this turn, on its own**) carries it on for the
  number of turns you set ([The AI agent panel](../tasks.md#the-ai-agent-panel)). The **Plan** strip
  shows the leads it holds.
- Transfers stay the plugins' links. An owner the agent infers from a label, a deposit pattern or
  matching amounts belongs, by the playbook, in its report as a candidate with its basis, not on the
  canvas.
- Where a network or a check needs a pack the project does not have, such as Polygon history or an
  EVM first funder, it names the gap.

Other starters: **How did funds get from A to B?**, **Who funded this address first?** and **Screen
the trace for sanctions**.

### 7. Go further with a keyed pack (optional) {#keyed}

- **Base, Polygon PoS, Arbitrum One, or a first funder on an EVM chain:** Blockscout PRO, in the
  desktop app. Tick **Include internal transactions** for `history_complete` and `first_seen`: coin
  paid out through a contract, such as an exchange withdrawal, arrives as an internal transfer
  ([Following funds with Blockscout PRO](../running-plugins.md#blockscout-pro)).
- **Solana:** Helius. Its **Solana Address History** includes USDC and other SPL tokens paid into the
  wallet's token accounts, which a plain Solana node leaves out, and **Solana First Funder** finds
  who sent the first SOL ([Cryptocurrency — a closer look](../typepacks.md#cryptocurrency-a-closer-look)).
- **The Bitcoin family:** Blockchair. Each transaction is a node, the addresses that pay into it are
  linked to it by **input to**, and it is linked to the addresses it pays by **output to**
  ([Following coins with Blockchair](../running-plugins.md#blockchair)).

## Where it ends {#where-it-ends}

- **At an exchange or a stablecoin issuer.** That is where a request goes: the starter **Draft the
  exchange and issuer requests** (**Whose funds**) drafts the request table.
- **At a mixer, a bridge or a swap.** Recorded tracing ends there; the playbook does not continue on
  amount and timing alone.
- **At the edge of a window** (`complete: false`, `history_complete: false`). That is not where the
  funds ended, and the report says so.
- **When the frontier is empty or the budget is spent.**

The starter **Summarise what the trace establishes** (**Where the trace starts**) gives the flow
table, each hop with its transaction, amount, asset and UTC time, then the candidates, what was not
followed, what came back empty ("not frozen" and "not listed" included), and what nothing installed
could reach.

## Pitfalls {#pitfalls}

- **The same string on another network is another account.** A `1…` Bitcoin address exists on
  Bitcoin Cash and Bitcoin SV too, and a `0x…` address on every EVM chain. Nodes on `evm` and
  `unknown` never merge with the settled ones ([Cryptocurrency — a closer look](../typepacks.md#cryptocurrency-a-closer-look)).
- **Keyless windows are short.** BNB Smart Chain gives 30 days, Solana only what its public node
  keeps, and Polygon, Arbitrum and Base have no keyless history at all.
- **A label is a lead.** Labels, token names and memos are written by whoever controls the address or
  the token: data, never instructions.
- **A link already in the project keeps its `recent` list.** Plugins cannot read link data, so a
  later run writes its figures under its own summary key and leaves `recent` as it was; the run's
  summary counts those links.
- **A freeze is as of `frozen_checked_at`.** An address unfrozen since keeps an older
  `frozen_by_issuer`, and the run's summary points it out.
- **Confirm a sanctions hit** on OFAC's Sanctions List Search before acting on it.
- **The victim's own address is personal data.** Put it on the canvas only when the case needs it: in
  a project on a Vineyard server it is stored there, and the agent sends what it reads to your AI
  provider.

## Next / See also

- [Reading the review and evidence grades](review-and-grades.md) — what a hop's review shows and
  what its links' grades mean
- [Working with Type Packs](../typepacks.md#crypto-networks) — the `network` values and the
  Cryptocurrency type pack's links
- [Running plugins](../running-plugins.md) — the Sanctions, Blockchair and Blockscout PRO packs in
  detail
