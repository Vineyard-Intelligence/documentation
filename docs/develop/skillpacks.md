# Skill Packs

A Skill Pack is **text**: a reusable investigation *playbook* the agent can consult.

> **A Skill Pack runs no code and requests no permissions of its own.** It is guidance the agent
> follows, surfaced through the `list_skills` / `load_skill` tools. Its only dependency surface is
> the Plugin Pack(s) its steps call, declared in `requires`.

## The document

A Skill Pack is a single JSON document, `content_type: "vineyard:skillpack"`, living in an author
repo at a pinned commit (exactly like a plugin manifest or Type Pack):

```jsonc
{
  "content_type": "vineyard:skillpack",
  "identifier": "run.vineyard.skillpacks.account_identity_pivot",
  "name": "Account & identity pivoting",
  "description": "Turn one account or handle into the person's other accounts, and know when a shared username is NOT the same person.",
  "author": "VINEYARD",
  "version": "3.1.2",

  "applies_to": ["identity.handle", "identity.account", "identity.email_address", "identity.person"],
  "triggers": ["account", "username", "handle", "email", "same person", "sock puppet", "persona", "계정", "핸들", "아이디", "동일인", "부계정"],

  "requires": ["run.vineyard.pluginpacks.whatsmyname"],

  "overview": "Account & identity pivoting — from one handle or email to the accounts behind the same person…\nLoad the section for the lead you are holding:\n  - \"from-handle\"  - a username: spreading it across platforms\n  - \"from-email\"   - …\n  - \"corroborate\"  - deciding whether two accounts are one person\n…",

  "sections": [
    { "id": "from-handle", "summary": "From a username: spreading it across platforms.", "body": "JUDGE THE CROWD BEFORE THE SWEEP — …" },
    { "id": "from-email", "summary": "From an email address: the handles, keys and documents behind it.", "body": "…" },
    { "id": "from-profile", "summary": "From one profile page: every pivot it carries.", "body": "…" },
    { "id": "discriminate", "summary": "A candidate pair with a gap: the check that would settle it.", "body": "…" },
    { "id": "corroborate", "summary": "Judging whether two accounts are one person — how narrow is the population?", "body": "…" }
  ],

  "starters": [
    {
      "id": "deep-dive-handle",
      "label": "Deep-dive one handle",
      "category": "Find accounts",
      "summary": "Spread a single username across platforms, then work out which hits are the same person.",
      "prompt": "I want to deep dive on the user account \"{{handle}}\". For your information: {{context}}. …",
      "variables": [
        { "key": "handle", "label": "Handle or username", "placeholder": "example", "required": true },
        { "key": "context", "label": "What you already know (optional)", "placeholder": "looks South Korean, software developer", "multiline": true }
      ]
    }
  ]
}
```

| Field | Role |
| --- | --- |
| `identifier` | Reverse-DNS primary key, `<your-namespace>.skillpacks.<name>`. One manifest = one identifier (no member expansion, unlike a plugin pack). |
| `applies_to` | Node types (`category.name`) the playbook is about — a hint for when it is relevant. |
| `triggers` | Keyword hints the agent sees when it lists skill packs. |
| `requires` | Plugin pack identifiers the playbook's steps call. **A skill is only available when every one is installed in the project and can run on this build** (the marketplace co-installs them; at runtime a required pack that is blocked on the current platform, such as a desktop-only pack on the web, hides the skill even though it is installed). Empty or absent = the playbook leans on built-in graph tools only. |
| `overview` | The router, not the procedure: what the pack is for and what sections it holds. The agent reads this first. |
| `sections` | The actual steps. Each has an `id` (addressed by `load_skill(id, section)`), a one-line `summary` (so the agent can pick a section without loading them all), and the `body`. Loaded on demand — progressive disclosure. |
| `starters` | Ready-made ways to start a run: a `prompt` with `{{key}}` blanks and a `variables` list (key, label, placeholder, `required`, `multiline`). `category` groups them in the picker, rendered in first-appearance order. |

### Writing good sections

- **The overview is a router.** Tell the agent what the pack is *for*, when to reach for it, and
  which section to load for which situation. Keep it short — the detail lives in sections.
- **One section, one situation.** A section should be loadable on its own: the agent is going to
  read it *instead of* the others, not after them.
- **Say what evidence looks like.** The best playbooks state what actually ties two things together
  (a shared verified email, a reused cert) versus what does not (a common handle, shared hosting) —
  and tell the agent to label edges for the evidence, never for a conclusion the evidence does not
  carry.

## The safety model

Skill text is read by the agent on demand as a tool result, not injected into the prompt, so it
costs nothing when unused.

- **The app's own rules outrank the playbook.** Text telling the agent to ignore its rules, skip
  the analyst's review, or treat untrusted text as an instruction is refused.
- **Fields are trimmed.** Labels are collapsed to one line and stripped of control characters;
  section bodies are capped (~8,000 chars) and stripped of control characters except newlines;
  starters are capped hard (~1,200 chars — a starter is a paragraph, not a document).
- **A per-turn load budget bounds context.** Each turn may read at most 12 (skill, section)
  documents and ~40,000 chars total; a re-read is charged like any other read.

## Publishing to the registry

Skill Packs are distributed exactly like Plugin Packs and Type Packs: the document stays in **your**
author repo, and the registry holds a single lean entry in `community-skillpacks.json`:

```json
{
  "identifier": "run.vineyard.skillpacks.account_identity_pivot",
  "content_type": "vineyard:skillpack",
  "name": "Account & identity pivoting",
  "author": "VINEYARD",
  "description": "Turn one account or handle into the person's other accounts, and know when a shared username is NOT the same person.",
  "repo": "Vineyard-Intelligence/skillpack-account-identity-pivoting",
  "ref": "0ea57eaa9f00c0fe9c8a0393b158cdb85354c480",
  "path": "skillpacks/account-pivot.skill.json",
  "version": "3.1.2",
  "applies_to": ["identity.handle", "identity.account", "identity.email_address", "identity.person"],
  "section_count": 5,
  "requires": ["run.vineyard.pluginpacks.whatsmyname"]
}
```

You write `applies_to`, `section_count` and `requires` into the entry so the browse page can render
without fetching every document. CI recomputes `section_count` from the pinned document and rejects a
mismatch. It checks that every `requires` identifier is a live pack in the catalog. `applies_to` is
not checked, so copy it from your document. The full workflow — fork, pin an immutable commit
`ref`, add one `packs/<identifier>.json`, open a PR — is identical to [Publishing to the
registry](publishing.md).

## Next / See also

- [Publishing to the registry](publishing.md) — the shared fork-and-PR workflow
- [Distribution](distribution.md) — pinned refs and how fetched documents are verified
- [Working with Skill Packs (user guide)](../guide/skillpacks.md) — installing and using a pack
- [SDK & host context](sdk.md) — the plugin surface a skill's steps call
