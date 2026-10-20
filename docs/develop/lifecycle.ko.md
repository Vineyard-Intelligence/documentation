# 작업 생명주기

Vineyard의 모든 플러그인 실행과 모든 AI 에이전트 턴은 **작업(task)**이며, 클라이언트 측에서 추적됩니다. AI 에이전트가 시작한 플러그인 실행에는 자체 Tasks 행이 없습니다. 그 실행은 에이전트의 대화에 속하며, 무언가를 스테이징한 실행은 그 대화에 각각 별도의 변경 세트로 나타납니다.

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
| `incomplete` | AI 에이전트 전용 — 에이전트가 끝내기 전에 턴이 멈춤. 앱이 열려 있는 동안에는 응답받지 못한 도구 호출을 남긴 채 끝난 턴입니다. 프로젝트를 다시 열면, 단계를 다 썼거나 실행 중에 앱이 닫혀 끊긴 턴도 `incomplete`로 돌아오며, 직접 중지한 턴도 대개 그렇습니다. 이때 마지막 답변에 **Continue** 버튼이 표시됩니다. 그때까지 한 작업은 남아 있으며 이어서 진행할 수 있습니다. |

실행마다 전용 Web Worker 하나가 직접 생성됩니다 — 워커 풀이나 큐는 없습니다.

## 취소는 협력적입니다

작업 중지는 Web `AbortController` / `AbortSignal` 쌍 위에 구축된 **협력적** 방식입니다:

- 호스트가 컨트롤러를 중단합니다. 플러그인은 `ctx.signal`(`AbortSignal`)을 관찰하거나 `ctx.onCancel(handler)`을 등록합니다.
- 잘 동작하는 플러그인은 작업 단위 사이에 `ctx.signal.aborted`를 확인하고 깔끔하게 해제하며, 부분 결과를 보존합니다.

`ctx.signal` 체크포인트 예제는 [SDK 및 호스트 컨텍스트](sdk.md)를 참조하세요.

!!! warning "Stop은 플러그인에 3초를 줍니다"
    Stop은 워커를 즉시 종료하지 않습니다. 호스트는 `ctx.signal`을 중단하고 플러그인이 정리하고 반환할 수 있도록 **3초의 유예 기간**을 주며, 그 뒤에도 실행 중인 워커만 종료합니다. 시간 안에 반환한 플러그인은 다른 실행과 똑같이 끝나고 스테이징한 것은 검토를 위해 보관됩니다. Stop 이후 어떤 오류든 던지거나 종료된 플러그인은 `cancelled`로 끝나며, 이미 스테이징한 변경은 이 경우에도 계속 검토할 수 있습니다. 호스트는 오류의 타입이 아니라 자신이 Stop을 보냈는지로 이를 판단합니다. `run()`을 중단 가능하게 설계하세요 — [SDK 및 호스트 컨텍스트](sdk.md) 및 [매니페스트의 lifecycle controls](plugin-manifest.md)를 참조하세요.

## `manifest.lifecycle.timeout_ms`

호스트가 실제로 강제하는 유일한 lifecycle 힌트는 실행 하나에 대한 wall-clock 예산입니다. 이를 넘으면 호스트가 샌드박스를 종료하고 작업을 실패시킵니다 — 이벤트 루프에 양보하지 않아 `ctx.signal`을 볼 기회조차 없는 플러그인을 위한 백스톱입니다.

모든 실행에는 예산이 있습니다. `timeout_ms`가 없으면 10분이고, 선언된 값은 60분으로 제한되므로 팩은 예산을 늘릴 수는 있어도 예산을 없앨 수는 없습니다. 시간을 초과한 실행은 "plugin exceeded its time budget (…s) and was terminated"로 실패합니다. 시간 초과든, 샌드박스가 시작되지 않았든, 플러그인이 오류를 던졌든, 실패한 실행은 모두 스테이징한 변경을 폐기하며, 변경이 유지되는 것은 Stop으로 중지했을 때뿐입니다.

```json
"lifecycle": {
  "timeout_ms": 30000
}
```

매니페스트 스키마는 `lifecycle` 아래 `long_running`, `controls`, `progress`, `persistence`, `states`를 받아들이지만(`timeout_ms`는 목록에 없습니다), 호스트는 오늘 이들을 읽지 않습니다 — [플러그인 매니페스트](plugin-manifest.md)를 참조하세요.

## 그 밖의 제한

다음은 예산과 별개로 실행을 `failed`로 끝냅니다:

- **로드.** 샌드박스와 팩 코드(최상위 코드 포함)는 60초 안에 로드되어야 하며, 그렇지 않으면 실행은 `the plugin's code did not load within 60s from <host>`로 실패합니다.
- **시작.** 샌드박스 자체 스크립트가 로드되지 않거나 팩 로드가 끝나기 전에 예외를 던지면, 실행은 곧바로 `the plugin sandbox did not start: …`로 실패합니다.
- **메시지.** 앱이 읽을 수 없는 응답이 샌드박스에서 오면 실행은 `the plugin sandbox sent a reply the app could not read`로 실패합니다.
- **저장소.** 샌드박스가 사이트 저장소를 차단할 수 없는 브라우저에서는 팩이 로드되지 않고, 실행은 `the plugin sandbox could not block site storage in this browser`로 실패합니다([샌드박스](security.md#the-web-worker-sandbox) 참조).

## 다음 / 참고

- [SDK 및 호스트 컨텍스트](sdk.md) — `ctx.signal`, `ctx.progress`
- [플러그인 매니페스트](plugin-manifest.md) — `lifecycle.timeout_ms` 선언
- [샌드박스 및 보안](security.md) — 샌드박스와 작업 스테이징
- [아키텍처 및 원칙](architecture.md) — 워커의 위치
- [작업 및 실행 (사용자 가이드)](../guide/tasks.md) — 사용자 관점의 Tasks 패널
