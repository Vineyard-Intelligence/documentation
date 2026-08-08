# Working with Skill Packs

Skill Packs are the third kind of marketplace content, after Type Packs (the vocabulary) and Plugin
Packs (the collectors). A Skill Pack is **text**: a reusable investigation *playbook* the AI agent
can consult — never code it runs.

Where a plugin changes your graph, a Skill Pack changes **how the agent works**: it is guidance the
agent follows, surfaced to it through the `list_skills` / `load_skill` tools. It requests no
permissions of its own and executes nothing.

## What a Skill Pack contains

A Skill Pack is a single document with three parts:

| Part | Role |
| --- | --- |
| `overview` | What the playbook is for, and how to route through it — the agent reads this first. |
| `sections` | The actual steps, loaded **on demand** one at a time (progressive disclosure), so the agent does not pull the whole playbook into every turn. |
| `starters` | Ready-made ways to start a run — a prompt template with blanks (`{{handle}}`, `{{email}}`…) you fill in before sending. |

A pack also declares `applies_to` (the node types it is about) and `triggers` (keyword hints), so the
agent and the UI know when it is relevant.

## Installing a Skill Pack

Skill Packs install from the [Marketplace](../marketplace.md) exactly like plugins:

1. Open the Marketplace and find the pack (e.g. **Account & identity pivoting**).
2. If the pack declares `requires` (plugin packs its steps call), the Marketplace offers them for
   **co-install** — the skill is not usable without them.
3. Install once; the pack is now available to the agent in that project.

!!! note "Availability is gated on dependencies"
    A Skill Pack is only **available** in a project when every plugin pack in its `requires` is
    installed there. If you uninstall one later, the skill quietly stops being offered — the agent is
    never pointed at a playbook whose steps call a plugin the project does not have.

The current catalog ships two Skill Packs:

| Skill Pack | `applies_to` | Requires | What it does |
| --- | --- | --- | --- |
| **Account & identity pivoting** (`run.vineyard.skillpacks.account_identity_pivot`) | `identity.handle`, `identity.account`, `identity.email_address`, `identity.person` | `run.vineyard.pluginpacks.whatsmyname` | Turn one account or handle into the person's other accounts — and know when a shared username is **not** the same person. |
| **Infrastructure pivoting** (`run.vineyard.skillpacks.infra_pivot`) | `infrastructure.ip_address`, `infrastructure.domain`, `infrastructure.certificate`, `infrastructure.autonomous_system` | — (built-in graph tools) | Expand one indicator (IP/domain/cert) into its connected footprint, one verifiable hop at a time. |

## Using a Skill Pack

Start a run in the AI chat, then either:

- pick a **starter** — the pack's ready-made prompt shapes appear as one-click options, grouped by
  category (`Find accounts`, `Corroborate`, `Report`, …). Fill the blanks, hit **Use this**, and the
  agent starts the run following that shape; or
- just ask in your own words — the agent decides a pack is relevant (via `applies_to` / `triggers`)
  and reads it on its own.

Once the run starts, the agent consults the pack through the `load_skill` tool: it reads the
overview, then loads **only the sections it needs** for the current hop. It never dumps the whole
playbook into context.

!!! tip "Skills are guidance, not commands"
    Skill text arrives to the agent as **content**, not instructions. The agent may adapt it to the
    case — and its safety rules always outrank the playbook. If a pack's steps cannot proceed
    (say, the hop needs a plugin the project does not have), the agent says so and stops that branch
    rather than filling the gap from memory.

## Where the evidence goes

Which skill pack **revision** informed a conclusion is a chain-of-custody question: the same
identifier points at different text after the pack is updated. Every section the agent actually reads
during a turn is recorded — identifier, section, and the pinned commit it was served from — and
reported to the project's append-only **audit trail**. Chat content itself never leaves the browser;
only *which document was consulted* is recorded.

## Next / See also

- [Browse & install](installing.md) — the install flow shared with plugins and Type Packs
- [Running plugins](running-plugins.md) — how the agent executes the packs a skill's steps call
- [Writing Skill Packs](../develop/skillpacks.md) — authoring your own playbook
- [Tasks](tasks.md) — tracking a run that follows a skill pack
