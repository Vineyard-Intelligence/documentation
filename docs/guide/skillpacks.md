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
    in a browser when a required pack is desktop-only, the skill quietly stops being offered to the
    agent and is no longer listed in **Run ▸ Skill packs**. For example, Account & identity pivoting
    requires the WhatsMyName pack, which runs only in the desktop app, so this skill is available
    only there; in the browser it is missing from the menu.

The current catalog ships two Skill Packs:

| Skill Pack | `applies_to` | Requires | What it does |
| --- | --- | --- | --- |
| **Account & identity pivoting** (`run.vineyard.skillpacks.account_identity_pivot`) | `identity.handle`, `identity.account`, `identity.email_address`, `identity.person` | `run.vineyard.pluginpacks.whatsmyname` (desktop app only) | Turn one account or handle into the person's other accounts — and know when a shared username is **not** the same person. |
| **Infrastructure pivoting** (`run.vineyard.skillpacks.infra_pivot`) | `infrastructure.ip_address`, `infrastructure.domain`, `infrastructure.certificate`, `infrastructure.autonomous_system` | — (none required; uses the graph tools plus whatever DNS/RDAP/certificate/ASN collection plugins the project has, and says which hops it cannot take without them) | Expand one indicator (IP/domain/cert) into its connected footprint, one verifiable hop at a time. |

## Using a Skill Pack

Open **Run ▸ Skill packs** in the top menu bar and pick a pack. The **Skill pack** panel
lists the pack on the left — **Overview** (what it is about, which plugins it needs, and the text the
agent reads first), every **section**, and the **starters** grouped by category (`Find accounts`,
`Corroborate`, `Report`, …) — and shows the one you pick on the right. The **Filter sections and
starters…** box above the list shows only the sections and starters that contain what you type. The
panel opens on the first starter, and like the other panels it can be moved and resized while you
keep working on the graph; **Esc** closes it.

<figure class="vy-shot" markdown="span">
  ![Skill pack panel](../assets/guide/skillpack-panel.webp){ width="800" loading=lazy }
  <figcaption>The Skill pack panel: overview, sections and starters on the left; the chosen starter, its blanks and the prompt preview on the right.</figcaption>
</figure>

Then either:

- start a run from it: pick a **starter** on the left, fill the blanks (required ones are marked),
  set **Work without stopping to confirm** and **Answer language** under *How to run* if you want
  (both are remembered on this device for your next run), check the preview, and press **Ask the
  agent to follow this**. The prompt is placed in the message box of a new AI agent conversation (one you already had open stays in Tasks); nothing is sent until you edit it as you like and send it; or
- just ask in your own words — the agent decides a pack is relevant (via `applies_to` / `triggers`)
  and reads it on its own.

!!! tip "Skills are guidance, not commands"
    The agent may adapt a playbook to the project. If a pack's steps cannot proceed
    (say, the hop needs a plugin the project does not have), the agent says so and stops that branch
    rather than filling the gap from memory.

## Your project's own skill packs {#custom-skill-packs}

Besides the packs installed from the Marketplace, a project can hold skill packs of its own: a copy of
an installed pack that you change, one written from scratch, or one imported from a file. They are
stored in the project rather than in the registry. In **Run ▸ Skill packs** they are listed after the
installed packs, and in the Skill pack panel they carry a **Custom** badge.

| Action | Where | What it does |
| --- | --- | --- |
| **Make a copy** | Skill pack panel, beside the pack's name | Saves an independent copy in the project and opens it in the editor. The copy is named *Copy of …*, gets an identifier such as `local.project.skillpacks.account_identity_pivot_copy`, version `1.0.0` and you as author. Updating or withdrawing the original does not change it. |
| **New skill pack** | **Run ▸ Skill packs** | Opens an empty pack in the editor; the first **Save** creates it. Unavailable once the project has 32 packs of its own. |
| **Import skill pack…** | **Run ▸ Skill packs** | Opens a skill pack JSON file of 1 MB or less in the editor, unsaved: it reaches the project only when you press **Save**. Fields that are not part of a skill pack are left out, and the panel names them. A file that is not a skill pack is refused, and so is one with problems, which are listed by their place in the file. An empty or missing author does not stop the import; the editor asks for one before **Save**. |
| **Edit** | Skill pack panel, own packs | Opens the pack in the editor. |
| **Export JSON** | Skill pack panel, own packs | Downloads the pack as a `.skill.json` file in the format published packs use. |
| **Delete** | Skill pack panel, own packs | Shows *Deleting this pack removes it from this project for everyone.*; **Delete pack** confirms. |

When the file you import has the identifier of one of the project's own packs, the import stops with
*A custom pack with this identifier already exists.* **Replace it** opens that pack in the editor with
the file's content, so saving replaces it; **Import as a copy** imports the file as a new pack; **Cancel**
imports nothing. A file whose identifier is in the `run.vineyard` namespace, or already belongs to
another pack in the project such as an installed one, is imported as a new pack the same way. Such a
pack is re-keyed like a copy: it gets a new `local.project.skillpacks.*` identifier, a name another
pack already uses becomes *Copy of …*, and an author of `VINEYARD` becomes your username.

**The editor.** The left column lists **Details** (identifier, name, description, author, version,
**Applies to**, **Triggers** and **Requires**), **Overview**, **Sections** and **Starters**, with **New
section** and **New starter** to add one. The bar at the bottom counts *problems*, which block
**Save**, and *warnings*, which do not (for example a section the overview never mentions, or a
required plugin that cannot run in this project); click a count to go to the first one. Nothing is
written until you press **Save**. **Discard changes** drops your edits, and **Done** goes back to
reading once there is nothing left to save. If the pack was changed in another session meanwhile, the
save is refused with *This pack changed elsewhere, so your changes were not saved.*, and **Reload
pack** replaces your draft with the stored pack. In local mode there is no username, so **Author**
starts empty and is listed as a problem until you fill it in; **Export JSON** stays unavailable until
the saved pack has an author.

- **Who can see and change them.** Everyone who can edit the project sees its own packs in **Run ▸
  Skill packs**, can read them, start runs from them and export them, and their AI agent can use
  them. People who can only view the project do not see them. Only the project owner can make a copy,
  create, import, edit or delete one, and only the owner is shown the buttons and menu items for it.
- **Limits.** A project keeps up to 32 packs of its own, each at most 256 KB. Signed in, they may
  also take at most 1 MB together. Each field has a length limit as well; the editor shows it and
  refuses text over it.
- **Reserved names.** The `run.vineyard` namespace and the author name `VINEYARD` belong to the
  official packs, and the editor refuses both. New packs and copies start in the
  `local.project.skillpacks.*` namespace; you can change the identifier to another of the same
  form, such as `org.example.skillpacks.my_pack`, outside `run.vineyard`. An identifier or name
  that another pack in the project already uses is refused.
- **Not reviewed by the registry.** The registry never sees these packs. The agent is told that such
  a pack was *written in this project by its owner; not reviewed by the registry*, and the app's own
  rules outrank it as they outrank any pack.
- **Packs whose plugins cannot run.** One of the project's own packs whose required plugin packs
  cannot run in this project is not offered to the agent. It stays in **Run ▸ Skill packs**, dimmed
  and marked *needs plugins*, so you can still open it to fix, export or delete it. The panel says
  *The agent does not use this pack while a plugin it needs cannot run in this project.*, and **Ask
  the agent to follow this** is unavailable.

## Next / See also

- [Browse & install](installing.md) — the install flow shared with plugins and Type Packs
- [Running plugins](running-plugins.md) — how the agent executes the packs a skill's steps call
- [Writing Skill Packs](../develop/skillpacks.md) — authoring your own playbook
- [Tasks](tasks.md) — tracking a run that follows a skill pack
