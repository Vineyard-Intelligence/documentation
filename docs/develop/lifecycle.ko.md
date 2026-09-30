# Task lifecycle

Vineyard의 모든 플러그인 실행과 모든 AI 채팅 턴은 **작업(task)**이며, 클라이언트 측에서 추적됩니다.

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
| `cancelled` | 중지됨: Tasks 패널의 Stop 버튼, 또는 프로젝트에서 나가기(에이전트가 시작한 실행은 그 턴이 중지될 때도 취소됨). 이미 스테이징한 변경은 계속 검토할 수 있습니다. |
| `incomplete` | AI 채팅 전용 — 턴이 응답 없이, 미해결 tool call을 남긴 채 중단됨. |

실행마다 전용 Web Worker 하나가 직접 생성됩니다 — 워커 풀이나 큐는 없습니다.

## 취소는 협력적입니다

작업 중지는 Web `AbortController` / `AbortSignal` 쌍 위에 구축된 **협력적** 방식입니다:

- 호스트가 컨트롤러를 중단합니다. 플러그인은 `ctx.signal`(`AbortSignal`)을 관찰하거나 `ctx.onCancel(handler)`을 등록합니다.
- 잘 동작하는 플러그인은 작업 단위 사이에 `ctx.signal.aborted`를 확인하고 깔끔하게 해제하며, 부분 결과를 보존합니다.

`ctx.signal` 체크포인트 예제는 [SDK](sdk.md)를 참조하세요.

!!! warning "Stop은 플러그인에 3초를 줍니다"
    Stop은 워커를 즉시 종료하지 않습니다. 호스트는 `ctx.signal`을 중단하고 플러그인이 정리하고 반환할 수 있도록 **3초의 유예 기간**을 주며, 그 뒤에도 실행 중인 워커만 종료합니다. 시간 안에 반환한 플러그인은 다른 실행과 똑같이 끝나고 스테이징한 것은 검토를 위해 보관됩니다. `AbortError`를 던지거나 종료된 플러그인은 `cancelled`로 끝나며, 이미 스테이징한 변경은 이 경우에도 계속 검토할 수 있습니다. `run()`을 중단 가능하게 설계하세요 — [SDK](sdk.md) 및 [매니페스트의 lifecycle controls](plugin-manifest.md)를 참조하세요.

## `manifest.lifecycle.timeout_ms`

호스트가 실제로 강제하는 유일한 lifecycle 힌트는 실행 하나에 대한 wall-clock 예산입니다. 이를 넘으면 호스트가 샌드박스를 종료하고 작업을 실패시킵니다 — 이벤트 루프에 양보하지 않아 `ctx.signal`을 볼 기회조차 없는 플러그인을 위한 백스톱입니다.

모든 실행에는 예산이 있습니다. `timeout_ms`가 없으면 10분이고, 선언된 값은 60분으로 제한되므로 팩은 예산을 늘릴 수는 있어도 예산을 없앨 수는 없습니다. 시간을 초과한 실행은 "plugin exceeded its time budget (…s) and was terminated"로 실패하며, Stop과 달리 스테이징한 변경은 폐기됩니다.

```json
"lifecycle": {
  "timeout_ms": 30000
}
```

매니페스트 스키마는 `lifecycle` 아래 `long_running`, `controls`, `progress`, `persistence`, `states`를 받아들이지만(`timeout_ms`는 목록에 없습니다), 호스트는 오늘 이들을 읽지 않습니다 — [plugin manifest](plugin-manifest.md)를 참조하세요.

## 다음 / 참고

- [SDK](sdk.md) — `ctx.signal`, `ctx.progress`
- [Plugin manifest](plugin-manifest.md) — `lifecycle.timeout_ms` 선언
- [Security model](security.md) — 샌드박스와 작업 스테이징
- [Architecture](architecture.md) — 워커의 위치
- [Tasks (user guide)](../guide/tasks.md) — 사용자 관점의 Tasks 패널
