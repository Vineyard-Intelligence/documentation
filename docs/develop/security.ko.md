# Sandbox & security

Vineyard가 신뢰할 수 없는 플러그인 JavaScript를 격리하는 방법: 주변 권한이 없는 Web Worker 샌드박스, 브라우저 강제 이그레스, 사용자 계정 토큰 대신 일회성 범위 지정 실행 토큰, API 키를 그래프와 작업 기록에서 제외하는 시크릿 처리 규칙.

## 한 줄로 보는 위협 모델

플러그인은 **설치 사용자가 실행하기로 선택한 타사 코드**입니다. 레지스트리 검토([publishing](publishing.md) 참조)가 일부 남용을 잡아내지만, 합법적으로 부여된 스코프가 오용될 수 있습니다 — `net` 엔드포인트와 `node:read`를 가진 플러그인은 읽도록 허용된 것을 유출할 수 있습니다. Vineyard의 역할은 플러그인이 [scopes](../reference/scopes.md)가 선언한 것만, 사용자가 실행한 프로젝트에서, 짧은 제한된 시간 동안만 접근할 수 있도록 보장하는 것입니다 — 그리고 시크릿이 애초에 도달 가능해지지 않도록 하는 것입니다.

## Web Worker 샌드박스 (웹)

신뢰할 수 없는 `main.js`는 페이지가 아닌 **전용 모듈 Web Worker**에서 실행됩니다. 해당 워커 내부에는:

- `DOM` 없음, `window` 없음,
- `localStorage` / `sessionStorage` 없음,
- 어떤 종류의 계정 토큰, 쿠키, 세션도 없음.

메인 스레드 — **HostBridge** — 는 범위 지정 토큰과 실행 권한을 보유하며, 형태가 **정확히 부여된 스코프**인 [Comlink](sdk.md) 프록시를 노출합니다. `ctx` 멤버는 해당 스코프가 부여되지 않으면 *존재하지 않으므로* 우회할 수 있는 것이 없습니다: 그래프 스코프가 없는 플러그인은 문자 그대로 `ctx.graph === undefined`입니다. 데스크톱은 앱의 격리 환경에서 동일한 플러그인을 실행하지만(CORS 없음), 워커 모델이 웹 기준선입니다.

```ts
// 워커 내부에서, ctx는 메인 스레드 HostBridge의 Comlink 프록시입니다.
// fetch 없음, DOM 없음, 토큰 없음. graph/net/message는 해당 스코프가 부여된 경우에만 존재.
export default definePlugin({
  manifest: { /* … */ },
  async run(ctx) {
    // ctx.run.runId  -> 모든 쓰기를 이 하나의 실행에 연결
    // ctx.graph?.list?() 는 node:read가 부여되었기 때문에만 존재
  },
});
```

## 이그레스는 JavaScript가 아닌 CSP에 의해 강제됩니다

실제 네트워크 경계는 워커 코드가 아닌 **브라우저**입니다.

워커는 `Content-Security-Policy: connect-src`가 다음과 같이 설정된 전용 오리진에서 제공됩니다:

| 플러그인 종류 | `connect-src` |
|---|---|
| 순수 연산 (`sandbox-js`, `network` 스코프 없음) | `'none'` — 워커가 어떤 연결도 열 수 없음 |
| Web-proxy (`web-proxy`) | 정확히 단일 `proxy_endpoint` — 그리고 그 외 아무것도 없음 |

!!! warning "`fetch` 삭제는 방어적 중복일 뿐입니다"
    워커 부트스트랩은 `self.fetch` / `XMLHttpRequest`도 제거하지만, 이는 **벨트 앤 서스펜더스**일 뿐 경계가 아닙니다. CSP가 실제로 이그레스를 막습니다: 플러그인이 요청 프리미티브를 재구성하더라도, 브라우저는 정책에 나열되지 않은 모든 `connect-src`를 거부합니다. 이것이 웹 플러그인의 `network` 스코프가 **반드시 `platforms.web.proxy_endpoint`와 동일한 정확히 하나의 항목이어야** 하는 이유입니다 — 강제할 팬아웃이 없습니다([scopes](../reference/scopes.md) 및 [plugin manifest](plugin-manifest.md) 참조).

브리지가 워커를 대신하여 요청을 전달할 때는 이를 소독합니다: `SafeRequestInit`는 자격 증명을 포함하지 않으며, 브리지는 `credentials: "omit"`을 강제하고 `Authorization` / `Cookie` 헤더를 제거합니다. 플러그인은 사용자의 세션을 허용된 엔드포인트로 밀반입할 수 없습니다.

## 일회성 범위 지정 RunToken

플러그인 경로는 사용자의 전능한 DRF 계정 토큰을 **절대** 사용하지 않습니다. 대신, 실행을 시작하면 단기 수명의 좁은 범위 **RunToken**이 발행됩니다:

```
POST /v1/core/run-tokens/
  { plugin_id, project, granted_scopes }
->
  { run_token, run_id, expires_at }
```

해당 토큰은 `RunToken` 행으로 뒷받침됩니다:

| 필드 | 의미 |
|---|---|
| `run_id`, `project`, `created_by`, `plugin_id` | 이 실행의 식별 정보 |
| `granted_scopes` | **매니페스트 ∩ 프로젝트별 사용자 권한**으로 서버 클램프됨 |
| `expires_at` | 짧은 TTL(~5분), 작업이 살아있는 동안 갱신 가능 |
| `used_writes` / `max_writes` | 이 실행의 원자적 쓰기 한도 |
| `revoked` | 취소 / 종료 상태에서 설정됨 |

`granted_scopes`가 서버 측에서 클램프되므로, 변조된 클라이언트는 매니페스트가 요청하는 것 **그리고** 사용자가 해당 프로젝트에서 할 수 있는 것을 넘어 토큰을 확장할 수 없습니다.

### 오직 브리지만 이를 보유합니다

**메인 스레드의 HostBridge** — 워커가 아닌 — 가 그래프 및 게시 REST 호출에 `X-Vineyard-Run-Token`으로 토큰을 첨부합니다. 워커는 토큰을 절대 보지 않으므로, 신뢰할 수 없는 코드 내의 JavaScript 누출은 기껏해야 쓰기 엔드포인트만 공격할 수 있는 **짧은 TTL, 프로젝트 범위, 쓰기 제한** 자격 증명만 누출합니다. 다른 토큰을 발행하거나, 프로젝트 목록을 읽거나, WebSocket을 인증할 수 없습니다.

### 권한 계층에서 강제됨

권한은 토큰을 발행한 주체를 신뢰하는 것이 **아니라** 인증/권한 계층에서 확인됩니다. Node / Edge / Message 뷰셋의 전용 DRF 권한 클래스:

1. **프로젝트 불일치 거부** — `request.project != run_token.project`은 거부됩니다.
2. **동사 + 모델 → 스코프 매핑** — 예: `POST /nodes` → `node:create`, `DELETE /edges/{id}` → `edge:delete`, 메시지 `POST` → `message:post` — 해당 스코프가 `granted_scopes`에 없으면 거부합니다.
3. **쓰기 한도를 원자적으로 강제** — `max_writes`에 대해 `used_writes`를 감소/확인합니다.
4. **항상 행을 읽음** — 토큰 서명은 저렴한 사전 필터일 뿐입니다. 권위 있는 상태(취소됨? 만료됨? 남은 한도?)는 매번 데이터베이스에서 가져옵니다.
5. **취소 / 종료 시 취소** — 작업이 취소되거나 종료 상태에 도달하는 순간, 행이 취소됩니다.

!!! note "토큰은 절대 사용자를 초과할 수 없습니다"
    기존 `can_edit_graph` / `can_send_chat` 사용자 수준 확인은 **두 번째 게이트로 계속 유지**됩니다. RunToken은 권한을 좁힙니다. 사용자 자신이 해당 프로젝트에서 가진 것보다 더 많은 것을 부여할 수 없습니다.

!!! tip "벌크 작업과 쓰기 한도"
    전체 그래프 플러그인(예: **Korean Roulette**, **Thanos Snap**)은 `ctx.graph.deleteNodes(ids[])` 또는 `ctx.graph.emit(entities, edges)`를 호출합니다. 쓰기 한도는 벌크 호출을 **단일 제한 작업**으로 계산하므로, 합법적인 대량 삭제가 무분별하게 제한되지 않으면서도 폭주 루프는 여전히 `max_writes`에 도달합니다.

## 시크릿 처리

API 키와 시크릿은 작업 기록이나 AI 대화 기록에 **절대** 포함되어서는 안 됩니다. 여섯 가지 규칙이 이를 강제합니다 — SPEC §6 참조.

1. **시크릿은 플러그인이 절대 읽을 수 없습니다.** `secret: true`인 `config` 값은 호스트(데스크톱 키체인, `safeStorage` / keyring 사용)에 의해 네트워크 경계에서 주입됩니다. "내 시크릿 config 읽기" 호출이 없으므로, 플러그인이 키를 자신의 출력으로 반사할 수 없습니다.
2. **시크릿은 params가 아닙니다.** 설치 시 린트가 시크릿처럼 보이는 `params` 키 — `api_key`, `token`, `secret`, `password`, `authorization`, 모든 `*_key` — 를 **거부**합니다. 이러한 값은 `secret: true`와 함께 `scopes.config`에 있어야 합니다. 웹에서는 시크릿 config가 지원되지 않으며 사용자는 데스크톱 플러그인으로 안내됩니다.
3. **그래프 쓰기 경로가 스크럽됩니다.** `Node.data` / `Edge.data`가 스크럽 없이 지속되므로, 브리지/서버는 생성 시 동일한 제외 목록으로 이들을 스크럽합니다 — 그렇지 않으면 플러그인이 API 응답에서 받은 키를 노드에 쓸 수 있습니다.
4. **Type Pack은 시크릿 프로퍼티 타입을 선언할 수 없습니다.** `secret` / `credential` 프로퍼티 타입은 **강력한 스키마 거부**입니다([Type Packs](../guide/typepacks.md) 참조).
5. **직렬화 가능한 상태는 안전 필드 허용 목록을 사용**합니다(거부 목록이 아님). 토큰과 시크릿은 작업 수명 동안 워커 메모리에만 존재하며 IndexedDB, BroadcastChannel, 존재 비콘에 직렬화되지 않습니다.
6. **웹에서 BYOK는 설계상 지원되지 않습니다** — bring-your-own-key는 데스크톱 플러그인으로 라우팅됩니다.

!!! warning "BYOK / 데스크톱 시크릿은 연기됨"
    데스크톱 키체인에 의존하는 시크릿 처리(규칙 1, 2, 6)는 **연기**되었습니다. 데스크톱 Electron 셸은 현재 배포되어 있으며 `sandbox-js` 격리 환경에서 플러그인을 실행하지만, 키체인 기반 `config.secret:true` 주입 및 BYOK는 아직 구현되지 않았습니다. 시크릿 키가 필요한 플러그인은 현재 어떤 플랫폼에서도 자동으로 이를 얻을 수 없습니다.

## 배포된 것과 아닌 것

| 통제 | 상태 |
|---|---|
| Web Worker 샌드박스 + CSP 이그레스 (`sandbox-js`, 브라우저) | 배포됨 |
| 데스크톱 Electron 셸 + 샌드박스 격리 (`sandbox-js`, 데스크톱) | 배포됨 |
| 일회성 RunToken + DRF 권한 클래스 | 배포됨 |
| Param 시크릿 키 린트, 그래프 쓰기 스크럽, 안전 필드 허용 목록 | 배포됨 |
| `web-proxy` 런타임 (단일 프록시 엔드포인트) | **연기됨** |
| 키체인 기반 시크릿 config, BYOK | **연기됨** |

## 다음 / 참고

- [Scopes reference](../reference/scopes.md) — 플러그인이 얻는 유일한 권한, 그리고 `ctx`에 매핑되는 방식
- [SDK](sdk.md) — `ctx` 표면과 Comlink 프록시
- [Plugin manifest](plugin-manifest.md) — 플랫폼, `proxy_endpoint`, 스코프 선언
- [Lifecycle](lifecycle.md) — RunToken을 취소하는 취소/종료 상태
- [Architecture](architecture.md) — 브리지, 워커, 서버의 위치
