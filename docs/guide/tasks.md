# Tasks & runs

Every plugin run you start, and every AI-chat conversation, is a **task** shown in the Tasks panel (one row per conversation; each new turn updates it).

## How tasks work

Each plugin run executes in its own dedicated sandbox worker. A running task shows a **running** badge and, when the plugin reports it, a progress bar.

## Task states

| State | What it means |
| --- | --- |
| `running` | Actively executing. |
| `succeeded` | Finished successfully (terminal). |
| `failed` | Ended with an error (terminal). |
| `cancelled` | You stopped it before it finished (terminal). |
| `incomplete` | AI chat only — the turn stopped before finishing, with no answer yet (terminal). |

A running plugin task has a **Stop** button (stop an AI turn from the AI chat panel). Click a row to open it: an AI task reopens its conversation, a plugin task opens its review. After a run with changes, the badge shows the review state instead — **needs review** (or **N to review**), **applied**, or **discarded** — and an AI task with pending changes also has a **Review staged changes** button.

!!! note "Stop is cooperative"
    **Stop** asks the plugin to wind down cleanly. If it has not returned within about 3 seconds, the worker is terminated. Either way, the changes it had already staged are kept and offered for review. A run that exceeds its time budget (10 minutes by default, at most 60) is terminated and marked failed.

## Ephemeral by default

Plugin-run tasks live only in your browser tab's memory; close the tab and they are gone. AI conversations are saved in this browser (localStorage, per project) and come back as Tasks rows after a reload, so you can reopen them. Staged changes that were still waiting for review do not survive a reload. Neither task rows nor AI chat content are sent to the Vineyard server; only changes you apply are written to the case.

!!! tip "AI chat stays in your browser"
    Conversations and messages are kept in this browser only and are never written to the server.

## Conversation compaction (token compression)

Long AI conversations are compressed **automatically** — there is no manual `/compact` command. When the conversation history would exceed the model's context window, Vineyard folds the oldest turns into a single dense summary so the agent keeps working on the whole case instead of forgetting its start.

How it works:

1. **Trigger.** Each turn, Vineyard estimates the history's token count — roughly 4 characters per token for Latin-script text, about 1 token per character for CJK/Hangul text (a flat divisor undercounted Korean case notes by roughly half), and self-calibrated by a correction factor learned from what the provider actually charged on prior steps — and compares it against a history budget — about 35% of the model's context window (64k-token fallback when the provider reports none). Compaction happens *before* the window is full, because the system prompt, tool schemas, tool results and the model's answer all share the same window.
2. **What survives verbatim.** The **most recent 4 turns** (two analyst exchanges) are always kept as-is, so immediate context is never summarized.
3. **What gets compressed.** Everything older is sent to the LLM (the same model you configured, so the summary is written in the same language and register as the conversation) with instructions to produce a dense factual summary of at most 200 words: indicators and entities discussed (domains, IPs, accounts, hashes), what was established about each and on what evidence, decisions made, what was rejected and why, and open questions. No speculation is added.
4. **The replacement.** The summary replaces the old turns as a single message prefixed `[earlier conversation, summarized]`. A previous summary is summarized again along with what followed it, so a long session converges instead of stacking summaries.
5. **Failure is silent-safe.** If the summarization call fails, the history is left **unchanged** — compaction never silently drops the earlier half of an investigation. You would see the provider error instead.

## Collaborator presence

When you share a project, participants see collaborator badges next to the project title, each with the collaborator's avatar and colour and what they currently have selected; click a badge to jump to it. Presence is sent only to project participants — people viewing through a public link see no roster or headcount. The live roster is not stored, but each signed-in connection is recorded as a session (who, when it started and ended) so that edits in the audit log can be attributed to it.

## Next / See also

- [Running plugins](running-plugins.md) — how a run becomes a task.
- [Task lifecycle (internals)](../develop/lifecycle.md) — the developer-facing mechanics behind these states, `AbortController`/`ctx.signal`.
- [Getting started](getting-started.md) — orientation for the rest of the guide.
