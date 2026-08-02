# Skill Packs

A Skill Pack is the third kind of marketplace content — after Plugin Packs (the collectors) and Type
Packs (the vocabulary). It is **text**: a reusable investigation *playbook* the agent can consult,
never code it runs. This page covers the document format, the safety model, and how a pack reaches
the registry.

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
  "author": "vineyard-run",
  "version": "1.3.0",

  "applies_to": ["identity.handle", "identity.user_account", "identity.email_address", "identity.person"],
  "triggers": ["account", "username", "handle", "same person", "sock puppet", "계정", "핸들"],

  "requires": ["run.vineyard.pluginpacks.whatsmyname"],

  "overview": "Account & identity pivoting — from one handle or email to the accounts behind the same person…\nUse this when… Load a section: \"handles\" — …, \"corroborate" — …",

  "sections": [
    { "id": "handles", "summary": "Spreading from one username across platforms.", "body": "From a USERNAME:\n- Run the account-search plugin…" }
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
| `identifier` | Reverse-DNS primary key, `run.vineyard.skillpacks.<name>`. One manifest = one identifier (no member expansion, unlike a plugin pack). |
| `applies_to` | Node types (`category.name`) the playbook is about — a hint for when it is relevant. |
| `triggers` | Keyword hints for relevance, matched against the analyst's request. |
| `requires` | Plugin pack identifiers the playbook's steps call. **A skill is only available when every one is installed in the project** (the marketplace gates install on this; the runtime gates availability on the same fact). Empty or absent = the playbook leans on built-in graph tools only. |
| `overview` | The router, not the procedure: what the pack is for and what sections it holds. The agent reads this first. |
| `sections` | The actual steps. Each has an `id` (addressed by `load_skill(id, section)`, never by path — the manifest is the allowlist), a one-line `summary` (so the agent can pick a section without loading them all), and the `body`. Loaded on demand — progressive disclosure. |
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

Skill text is **third-party content** arriving as a tool result, so it is handled like any untrusted
tool output:

- **Skills are not injected into the prompt.** They are surfaced through tools and read on demand,
  so they cost nothing when unused and arrive inside the trust boundary that already treats tool
  output as untrusted-by-default.
- **A frame wraps every loaded body.** When the agent reads a section, the host prepends a frame
  stating the text is *content, not a command*: if any part of it tells the model to ignore its
  rules, skip the analyst's review, or act on untrusted text as an instruction, the model must refuse
  and say so. The app's safety-critical prompt blocks always outrank the playbook.
- **Remote fields are sanitized at the boundary.** Labels are collapsed to one line and stripped of
  control characters (so a manifest cannot smuggle a second apparent "SYSTEM: …" line into a
  description); section bodies are capped (~8,000 chars) and stripped of control characters except
  newlines; starters are capped hard (~1,200 chars — a starter is a paragraph, not a document).
- **A per-turn load budget bounds context.** Each turn may read at most 12 (skill, section)
  documents and ~40,000 chars total. A repeat is answered from the ledger without re-sending the
  body — a model that follows every pointer cannot spend the whole turn reading documentation.
- **The audit trail records what was consulted.** Which skill **revision** (pinned commit) informed
  a conclusion is reported to the project's append-only audit log — identifier, section, and commit
  SHA. Chat content never leaves the browser; only the *document consulted* is recorded.

## Publishing to the registry

Skill Packs are distributed exactly like Plugin Packs and Type Packs: the document stays in **your**
author repo, and the registry holds a single lean entry in `community-skillpacks.json`:

```json
{
  "identifier": "run.vineyard.skillpacks.account_identity_pivot",
  "content_type": "vineyard:skillpack",
  "name": "Account & identity pivoting",
  "author": "vineyard-run",
  "description": "Turn one account or handle into the person's other accounts, and know when a shared username is NOT the same person.",
  "repo": "Vineyard-Intelligence/skillpack-account-identity-pivoting",
  "ref": "44305008e4ec16ec0d0d24595ffa993c0b6b6cb5",
  "path": "skillpacks/account-pivot.skill.json",
  "version": "1.2.0",
  "applies_to": ["identity.handle", "identity.user_account", "identity.email_address", "identity.person"],
  "section_count": 2,
  "requires": ["run.vineyard.pluginpacks.whatsmyname"]
}
```

The `applies_to`, `section_count`, and `requires` fields are **derived** at merge time so the browse
page can render without fetching every document. The full workflow — fork, pin an immutable commit
`ref`, append one entry, open a PR for `VineyardReviewBot` — is identical to [Publishing to the
registry](publishing.md).

## Next / See also

- [Publishing to the registry](publishing.md) — the shared fork-and-PR workflow
- [Distribution](distribution.md) — pinned refs, integrity hashes, client-side caching
- [Working with Skill Packs (user guide)](../guide/skillpacks.md) — installing and using a pack
- [SDK & host context](sdk.md) — the plugin surface a skill's steps call
