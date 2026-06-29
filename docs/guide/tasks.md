# Tasks & runs

Every plugin run and every AI-chat turn in Vineyard is a **task** in a single client-side queue. The Tasks panel shows each task's current state and gives you the right controls — Stop, Pause, Resume, Cancel, Retry — for whatever it is doing right now.

## How tasks work

When you run a plugin (or send a message in AI chat), Vineyard creates a task and places it in **one client-side queue**. Tasks execute in a Web Worker pool with a concurrency cap, so a few run at once while the rest wait their turn. If you have the same project open in multiple browser tabs, a single tab actually executes each task (coordinated via the Web Locks API) so work is not duplicated.

!!! info "Ephemeral by default"
    Tasks live in your browser. Nothing about a run is written to the server unless you explicitly **Save** it. See [Ephemeral by default](#ephemeral-by-default) below.

## Task states

A task moves through up to seven states:

```
queued  → running | cancelled
running → waiting | paused | succeeded | failed | cancelled
waiting → running | paused | cancelled        (auto-resumes when the block clears)
paused  → queued  | cancelled
succeeded | failed | cancelled = terminal
```

| State | What it means |
| --- | --- |
| `queued` | Created and waiting for a free worker slot. Nothing is running yet. |
| `running` | Actively executing in a worker, with a spinner and (when reported) progress. |
| `waiting` | Started, but temporarily blocked on something outside the task. Auto-resumes when the block clears. A worker slot may be released while waiting. |
| `paused` | You paused it. It will not resume on its own. |
| `succeeded` | Finished successfully (terminal). |
| `failed` | Ended with an error (terminal). |
| `cancelled` | You cancelled it before it finished (terminal). |

The three terminal states — `succeeded`, `failed`, and `cancelled` — never change on their own. To run the work again you create a new task (see [Retry](#retry-mints-a-new-task)).

### Why a task is `waiting`

`waiting` is more general than a simple "rate-limited" pause. The Tasks panel shows which kind of block applies:

| Substate | Meaning |
| --- | --- |
| `rate_limit` | The upstream API asked the task to back off (for example, a `Retry-After`). It resumes automatically when the window passes. |
| `awaiting_user_input` | The task needs a decision or input from you before it can continue. |
| `external_poll` | The task is polling a long-running external job and waiting for it to report progress. |
| `cors_blocked` | A browser CORS restriction is blocking a request the task needs to make. |
| `token_refresh` | A credential is being refreshed before the task can continue. |

In each case the task resumes by itself once the condition is resolved — you usually do not need to do anything except, for `awaiting_user_input`, provide what it asks for.

## Controls per state

The buttons in the Tasks panel change with the task's state:

=== "queued"

    - **Cancel** — remove it from the queue before it starts.

=== "running"

    - **Stop** — request a cooperative stop (see the *Stop is cooperative* note below).
    - **Pause** — move it to `paused`.
    - A spinner and progress indicator show that it is active.

=== "waiting"

    - **Resume now** — skip the wait and try again immediately, instead of waiting for the countdown.
    - **Cancel** — give up on it.
    - A countdown shows when it will auto-resume (for time-based blocks such as `rate_limit`).

=== "paused"

    - **Resume** — re-queue it to continue.
    - **Cancel** — abandon it.

=== "terminal"

    For `succeeded` / `failed` / `cancelled`:

    - **Retry** — run the work again as a **new** task.
    - **Reopen** (AI chat tasks) — bring the conversation back to continue it.
    - **Save to history** — persist a snapshot to the server (opt-in).

!!! note "Stop is cooperative"
    **Stop** asks the task to wind down cleanly and preserves partial results. Vineyard does not terminate the worker out from under a running task on your Stop — a forced terminate is reserved as a last-resort backstop (for example, an unresponsive task that blows past a timeout).

## Retry mints a new task

**Retry is not a state.** When you retry a terminal task, Vineyard creates a brand-new task that records which task it came from (a `retry_of` reference back to the original). The original stays in your list as-is. This keeps history honest: you can see that a run failed, then see the fresh attempt as its own entry rather than mutating the old one.

## Ephemeral by default

Tasks are stored in tiers, and the default is to keep them out of the server entirely:

1. **Tab memory** — the authoritative copy, held in the in-tab store while the tab is open.
2. **IndexedDB mirror (optional)** — a scrubbed local cache so tasks can survive a reload within the same browser. It is a cache only; it is never synced to the server.
3. **Server (Postgres)** — **nothing by default.** Only when you use **Save to history** does Vineyard write a sanitized snapshot row to the server.

!!! tip "AI chat is stateless unless you save"
    AI chat no longer auto-persists. Each turn is a streaming task; conversations and messages are not written to the server unless you explicitly save them.

## Collaborator presence

When you share a project, Vineyard shows a live presence beacon for collaborators — their status and the subject of what they are doing — over the project's real-time connection. This is in-memory only: it carries no secrets and is not persisted.

## Next / See also

- [Running plugins](running-plugins.md) — how a run becomes a task.
- [Task lifecycle (internals)](../develop/lifecycle.md) — the developer-facing mechanics behind these states, `AbortController`/`ctx.signal`, and `TaskSnapshot`.
- [Getting started](getting-started.md) — orientation for the rest of the guide.
