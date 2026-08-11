# Task lifecycle

Every plugin run and every AI-chat turn in Vineyard is a **task**, tracked client-side in `useTaskStore`.

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
| `cancelled` | Stopped via the Tasks panel's Stop button. |
| `incomplete` | AI-chat only — the turn stopped before finishing, holding unanswered tool calls. |

Each run gets one dedicated Web Worker (`runPluginInWorker` in `worker-host.ts`), spawned directly — there is no worker pool or queue.

## Cancel is cooperative

Stopping a task is **cooperative**, built on the Web `AbortController` / `AbortSignal` pair:

- The host aborts the controller; the plugin observes `ctx.signal` (an `AbortSignal`) or registers `ctx.onCancel(handler)`.
- A well-behaved plugin checks `ctx.signal.aborted` between units of work and unwinds cleanly, preserving any partial results.

See the [SDK](sdk.md) for a `ctx.signal` checkpoint example.

!!! warning "Never `worker.terminate()` on the user's Stop"
    Hard-killing the worker on a user Stop throws away partial results. The host **does not** call `worker.terminate()` for a normal Stop. It is reserved as a **last-resort timeout backstop** for a worker that refuses to honour the abort signal. Design `run()` to be interruptible — see [SDK](sdk.md) and [lifecycle controls in the manifest](plugin-manifest.md).

## `manifest.lifecycle.timeout_ms`

The one lifecycle hint the host actually enforces is a wall-clock budget for one run. Past it, the host terminates the sandbox and fails the task — the backstop for a plugin that stops yielding to its event loop and so can never see `ctx.signal`.

```json
"lifecycle": {
  "timeout_ms": 30000
}
```

The manifest schema also accepts `controls`, `progress`, and `persistence` under `lifecycle`, but nothing in the host reads them today — see [plugin manifest](plugin-manifest.md).

## Next / See also

- [SDK](sdk.md) — `ctx.signal`, `ctx.progress`
- [Plugin manifest](plugin-manifest.md) — declaring `lifecycle.timeout_ms`
- [Security model](security.md) — sandbox and task staging
- [Architecture](architecture.md) — where the worker and HostBridge sit
- [Tasks (user guide)](../guide/tasks.md) — the Tasks panel from a user's point of view
