# Task lifecycle

Every plugin run and every AI agent turn in Vineyard is a **task**, tracked client-side. A plugin run the AI agent launches gets no Tasks row of its own: it belongs to the agent's conversation, where each such run that staged something appears as its own change set.

## States

A task is created directly in `running` and ends in one of these terminal states:

```text
running → succeeded | failed | cancelled | incomplete
```

| State | Meaning |
| --- | --- |
| `running` | Executing. |
| `succeeded` | Completed normally. |
| `failed` | Completed with an error. |
| `cancelled` | Stopped: the Tasks panel's Stop button, or leaving the project (a run the agent launched is also cancelled when its turn is stopped). Changes it had already staged stay available for review. |
| `incomplete` | AI agent only — the turn ended before the agent finished. While the app is open, that means the turn ended holding tool calls it never got answers for. When the project is reopened, a turn that ran out of steps or was cut off by the app closing also comes back as `incomplete`, and so, usually, does a turn you stopped; its last answer then offers **Continue**. What it did is kept and can be continued. |

Each run gets one dedicated Web Worker, spawned directly — there is no worker pool or queue.

## Cancel is cooperative

Stopping a task is **cooperative**, built on the Web `AbortController` / `AbortSignal` pair:

- The host aborts the controller; the plugin observes `ctx.signal` (an `AbortSignal`) or registers `ctx.onCancel(handler)`.
- A well-behaved plugin checks `ctx.signal.aborted` between units of work and unwinds cleanly, preserving any partial results.

See the [SDK](sdk.md) for a `ctx.signal` checkpoint example.

!!! warning "Stop gives the plugin 3 seconds"
    Stop does not kill the worker at once. The host aborts `ctx.signal` and gives the plugin a **3-second grace period** to unwind and return; only a worker still running after that is terminated. A plugin that returns in time finishes like any other run, with what it staged held for review; one that throws after Stop, whatever the error, or is terminated ends `cancelled`, and the changes it had already staged still stay available for review. The host decides this from its own Stop, not from the error's type. Design `run()` to be interruptible — see [SDK](sdk.md) and [lifecycle controls in the manifest](plugin-manifest.md).

## `manifest.lifecycle.timeout_ms`

The one lifecycle hint the host actually enforces is a wall-clock budget for one run. Past it, the host terminates the sandbox and fails the task — the backstop for a plugin that stops yielding to its event loop and so can never see `ctx.signal`.

Every run has a budget. Without `timeout_ms` it is 10 minutes, and a declared value is capped at 60 minutes, so a pack may raise its budget but cannot opt out of having one. A timed-out run fails with "plugin exceeded its time budget (…s) and was terminated". Like every failed run, whether it timed out, its sandbox did not start or the plugin threw an error, it discards the changes it had staged; only a Stop keeps them.

```json
"lifecycle": {
  "timeout_ms": 30000
}
```

The manifest schema accepts `long_running`, `controls`, `progress`, `persistence`, and `states` under `lifecycle` (it does not list `timeout_ms`), but nothing in the host reads them today — see [plugin manifest](plugin-manifest.md).

## Other limits

These end a run as `failed`, separately from the budget:

- **Loading.** The sandbox and the pack's code, including its top-level code, must load within 60 seconds, or the run fails with `the plugin's code did not load within 60s from <host>`.
- **Starting.** If the sandbox's own script fails to load, or throws before the pack has loaded, the run fails at once with `the plugin sandbox did not start: …`.
- **Messages.** A reply from the sandbox that the app cannot read fails the run with `the plugin sandbox sent a reply the app could not read`.
- **Storage.** In a browser where the sandbox cannot block site storage, the pack is not loaded and the run fails with `the plugin sandbox could not block site storage in this browser` (see the [sandbox](security.md#the-web-worker-sandbox)).

## Next / See also

- [SDK](sdk.md) — `ctx.signal`, `ctx.progress`
- [Plugin manifest](plugin-manifest.md) — declaring `lifecycle.timeout_ms`
- [Security model](security.md) — sandbox and task staging
- [Architecture](architecture.md) — where the worker sits
- [Tasks (user guide)](../guide/tasks.md) — the Tasks panel from a user's point of view
