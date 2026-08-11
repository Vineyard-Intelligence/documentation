# Task lifecycle

Vineyard의 모든 플러그인 실행과 모든 AI 채팅 턴은 **작업(task)**이며, 클라이언트 측 `useTaskStore`에서 추적됩니다.

## 상태

작업은 곧바로 `running`으로 생성되어 다음 종료 상태 중 하나로 끝납니다:

```text
running → succeeded | failed | cancelled | incomplete
```

| 상태 | 의미 |
| --- | --- |
| `running` | 실행 중. |
| `succeeded` | 정상 완료. |
| `failed` | 오류로 완료. |
| `cancelled` | Tasks 패널의 Stop 버튼으로 중지됨. |
| `incomplete` | AI 채팅 전용 — 턴이 응답 없이, 미해결 tool call을 남긴 채 중단됨. |

실행마다 전용 Web Worker(`worker-host.ts`의 `runPluginInWorker`) 하나가 직접 생성됩니다 — 워커 풀이나 큐는 없습니다.

## 취소는 협력적입니다

작업 중지는 Web `AbortController` / `AbortSignal` 쌍 위에 구축된 **협력적** 방식입니다:

- 호스트가 컨트롤러를 중단합니다. 플러그인은 `ctx.signal`(`AbortSignal`)을 관찰하거나 `ctx.onCancel(handler)`을 등록합니다.
- 잘 동작하는 플러그인은 작업 단위 사이에 `ctx.signal.aborted`를 확인하고 깔끔하게 해제하며, 부분 결과를 보존합니다.

`ctx.signal` 체크포인트 예제는 [SDK](sdk.md)를 참조하세요.

!!! warning "사용자 Stop에 `worker.terminate()`를 사용하지 마세요"
    사용자 Stop 시 워커를 강제 종료하면 부분 결과가 버려집니다. 호스트는 일반 Stop에 `worker.terminate()`를 호출하지 **않습니다**. 이는 중단 신호를 따르기를 거부하는 워커를 위한 **최후의 수단 타임아웃 백스톱**으로 예약되어 있습니다. `run()`을 중단 가능하게 설계하세요 — [SDK](sdk.md) 및 [매니페스트의 lifecycle controls](plugin-manifest.md)를 참조하세요.

## `manifest.lifecycle.timeout_ms`

호스트가 실제로 강제하는 유일한 lifecycle 힌트는 실행 하나에 대한 wall-clock 예산입니다. 이를 넘으면 호스트가 샌드박스를 종료하고 작업을 실패시킵니다 — 이벤트 루프에 양보하지 않아 `ctx.signal`을 볼 기회조차 없는 플러그인을 위한 백스톱입니다.

```json
"lifecycle": {
  "timeout_ms": 30000
}
```

매니페스트 스키마는 `lifecycle` 아래 `controls`, `progress`, `persistence`도 받아들이지만, 호스트는 오늘 이들을 읽지 않습니다 — [plugin manifest](plugin-manifest.md)를 참조하세요.

## 다음 / 참고

- [SDK](sdk.md) — `ctx.signal`, `ctx.progress`
- [Plugin manifest](plugin-manifest.md) — `lifecycle.timeout_ms` 선언
- [Security model](security.md) — 샌드박스와 작업 스테이징
- [Architecture](architecture.md) — 워커와 HostBridge의 위치
- [Tasks (user guide)](../guide/tasks.md) — 사용자 관점의 Tasks 패널
