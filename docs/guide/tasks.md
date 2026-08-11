# Tasks & runs

Every plugin run and every AI-chat turn in Vineyard is a **task**, shown in the Tasks panel.

## How tasks work

When you run a plugin (or send a message in AI chat), Vineyard creates a task, runs it in its own dedicated worker, and shows it in the Tasks panel with a spinner and (when reported) a progress bar.

## Task states

| State | What it means |
| --- | --- |
| `running` | Actively executing. |
| `succeeded` | Finished successfully (terminal). |
| `failed` | Ended with an error (terminal). |
| `cancelled` | You stopped it before it finished (terminal). |
| `incomplete` | AI chat only — the turn stopped before finishing, with no answer yet (terminal). |

The only control on a running task is **Stop**.

!!! note "Stop is cooperative"
    **Stop** asks the task to wind down cleanly and preserves partial results. Vineyard does not terminate the worker out from under a running task on your Stop — a forced terminate is reserved as a last-resort backstop for a task that blows past its timeout.

## Ephemeral by default

Tasks live in your browser tab's memory for the duration of the session — nothing about a run is written to the server. Close the tab, and the task list is gone.

!!! tip "AI chat is stateless"
    Each AI turn is a streaming task; conversations and messages are not written to the server.

## Conversation compaction (token compression)

Long AI conversations are compressed **automatically** — there is no manual `/compact` command. When the conversation history would exceed the model's context window, Vineyard folds the oldest turns into a single dense summary so the agent keeps working on the whole case instead of forgetting its start.

How it works:

1. **Trigger.** Each turn, Vineyard estimates the history's token count — roughly 4 characters per token for Latin-script text, about 1 token per character for CJK/Hangul text (a flat divisor undercounted Korean case notes by roughly half), and self-calibrated by a correction factor learned from what the provider actually charged on prior steps — and compares it against a history budget — about 35% of the model's context window (64k-token fallback when the provider reports none). Compaction happens *before* the window is full, because the system prompt, tool schemas, tool results and the model's answer all share the same window.
2. **What survives verbatim.** The **most recent 4 turns** (two analyst exchanges) are always kept as-is, so immediate context is never summarized.
3. **What gets compressed.** Everything older is sent to the LLM (the same model you configured, so the summary is written in the same language and register as the conversation) with instructions to produce a dense factual summary of at most 200 words: indicators and entities discussed (domains, IPs, accounts, hashes), what was established about each and on what evidence, decisions made, what was rejected and why, and open questions. No speculation is added.
4. **The replacement.** The summary replaces the old turns as a single message prefixed `[earlier conversation, summarized]`. A previous summary is summarized again along with what followed it, so a long session converges instead of stacking summaries.
5. **Failure is silent-safe.** If the summarization call fails, the history is left **unchanged** — compaction never silently drops the earlier half of an investigation. You would see the provider error instead.

## Collaborator presence

When you share a project, Vineyard shows a live presence beacon for collaborators — their status and the subject of what they are doing — over the project's real-time connection. This is in-memory only: it carries no secrets and is not persisted.

## Next / See also

- [Running plugins](running-plugins.md) — how a run becomes a task.
- [Task lifecycle (internals)](../develop/lifecycle.md) — the developer-facing mechanics behind these states, `AbortController`/`ctx.signal`.
- [Getting started](getting-started.md) — orientation for the rest of the guide.
