# Working with Skill Packs

A Skill Pack is **text**: a reusable investigation *playbook* the AI agent can consult.

Where a plugin changes your graph, a Skill Pack changes **how the agent works**: it is guidance the
agent follows. It requests no permissions of its own and executes nothing.

## What a Skill Pack contains

A Skill Pack is a single document with three parts:

| Part | Role |
| --- | --- |
| `overview` | What the playbook is for, and how to route through it — the agent reads this first. |
| `sections` | The actual steps, which the agent loads **on demand**, one at a time. |
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
    installed there **and can run on this platform**. If you uninstall one later, or open the project
    in a browser when a required pack is desktop-only, the skill quietly stops being offered. For
    example, Account & identity pivoting requires the WhatsMyName pack, which runs only in the
    desktop app, so this skill is available only there.

The current catalog ships two Skill Packs:

| Skill Pack | `applies_to` | Requires | What it does |
| --- | --- | --- | --- |
| **Account & identity pivoting** (`run.vineyard.skillpacks.account_identity_pivot`) | `identity.handle`, `identity.account`, `identity.email_address`, `identity.person` | `run.vineyard.pluginpacks.whatsmyname` (desktop app only) | Turn one account or handle into the person's other accounts — and know when a shared username is **not** the same person. |
| **Infrastructure pivoting** (`run.vineyard.skillpacks.infra_pivot`) | `infrastructure.ip_address`, `infrastructure.domain`, `infrastructure.certificate`, `infrastructure.autonomous_system` | — (none required; uses the graph tools plus whatever DNS/RDAP/certificate/ASN collection plugins the project has, and says which hops it cannot take without them) | Expand one indicator (IP/domain/cert) into its connected footprint, one verifiable hop at a time. |

## Using a Skill Pack

Open **Run ▸ Skill packs** in the top menu bar and pick an installed pack. The **Skill pack** reader
shows what it is about, which plugins it needs, and its full text (the overview and every section).
Then either:

- start a run from it: pick a category (`Find accounts`, `Corroborate`, `Report`, …) and a
  **starter**, fill the blanks (required ones are marked), set the run options and answer language
  if you want, check the preview, and press **Ask the agent to follow this**. The prompt is placed in
  the AI chat composer for you to edit and send; or
- just ask in your own words — the agent decides a pack is relevant (via `applies_to` / `triggers`)
  and reads it on its own.

!!! tip "Skills are guidance, not commands"
    The agent may adapt a playbook to the project. If a pack's steps cannot proceed
    (say, the hop needs a plugin the project does not have), the agent says so and stops that branch
    rather than filling the gap from memory.

## Next / See also

- [Browse & install](installing.md) — the install flow shared with plugins and Type Packs
- [Running plugins](running-plugins.md) — how the agent executes the packs a skill's steps call
- [Writing Skill Packs](../develop/skillpacks.md) — authoring your own playbook
- [Tasks](tasks.md) — tracking a run that follows a skill pack
