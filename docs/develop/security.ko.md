# Sandbox & security

Vineyard가 플러그인 JavaScript를 격리하는 방법: 바로 적용되지 않고 분석가의 검토를 위해 스테이징되는 그래프 쓰기, 주변 권한이 없는 Web Worker 샌드박스, 호스트 측 이그레스 허용 목록, API 키를 그래프와 작업 기록에서 제외하는 시크릿 처리 규칙.

## 플러그인이 접근할 수 있는 것

플러그인은 **설치 사용자가 실행하기로 선택한 타사 코드**입니다. 플러그인은 [scopes](../reference/scopes.md)가 선언한 것만, 실행된 프로젝트에서만 접근할 수 있습니다. `ctx` 멤버는 해당 스코프가 부여되지 않으면 *존재하지 않습니다*: 그래프 스코프가 없는 플러그인은 `ctx.graph === undefined`입니다.

플러그인이 요청할 수 있는 권한 전체는 매니페스트의 다섯 개 키입니다: `graph` 동사, `network`, `web_probe`(데스크톱 전용), `services`, `config`. `services`는 플러그인이 `ctx.service`를 통해 URL이 아니라 이름으로 호출하는 Vineyard 운영 서비스(`rdap`, `telegram`)를 가리킵니다: 목적지는 호스트가 고정하고 호출에는 분석가 본인의 자격 증명이 붙습니다.

!!! note "플러그인은 채팅 메시지를 게시할 수 없습니다"
    `ctx.message`는 존재하지 않으며, `publish` / `message:post` 스코프도 없습니다. 예전 초안에 `publish`가 남아 있다면 제거하세요.

## 그래프 쓰기는 적용되지 않고 스테이징됩니다

`ctx.graph`의 쓰기 메서드는 API를 호출하지 않습니다. 읽기는 라이브 그래프에서 오므로 플러그인은 실제 그래프를 보고, 그 생성·수정·삭제는 해당 실행 하나에 속한 **변경 세트**로 쌓입니다(`ctx.run.runId`).

분석가가 그 변경 세트를 열어 승인하기 전까지는 아무것도 프로젝트에 도달하지 않습니다 — 항목 단위로 승인하며, 체크를 해제한 항목은 제외됩니다. 승인된 항목은 분석가 자신의 계정으로 적용됩니다. 편집이 스테이징된 이후 다른 실행이나 협업자가 그래프를 바꿨을 수 있으므로, 각 항목은 독립적으로 적용되어 **applied / skipped / failed** 로 끝납니다 — "이미 삭제된 노드를 삭제"는 기록된 SKIP이지 실패한 배치가 아닙니다.

플러그인은 그 변경을 승인하는 분석가에게 허용된 것 이상을 절대 할 수 없습니다.

!!! tip "벌크 작업과 검토"
    전체 그래프 플러그인(예: **Korean Roulette**, **Thanos Snap**)은 `ctx.graph.deleteNodes(ids[])` 또는 `ctx.graph.deleteEdges(ids[])`를 호출합니다. 영향을 받는 각 노드·엣지가 개별 검토 항목으로 스테이징되므로, 대량 삭제는 분석가가 승인 전에 항목 단위로 추려낼 수 있는 하나의 변경 세트로 도착합니다.

## Web Worker 샌드박스

플러그인의 `main.js`는 페이지가 아닌 **전용 모듈 Web Worker**에서 실행됩니다. 해당 워커 내부에는:

- `DOM` 없음, `window` 없음,
- `localStorage` / `sessionStorage` 없음,
- 어떤 종류의 계정 토큰, 쿠키, 세션도 없음,
- 자체 네트워크 없음: `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, 중첩된 `new Worker`가 모두 거부됩니다.

스테이징, 이그레스, 진행률, 알림은 메인 스레드의 **HostBridge**에 있습니다. 워커는 형태가 정확히 부여된 스코프인 [Comlink](sdk.md) 프록시를 통해 이에 접근하므로, 모든 요청은 `ctx.net.fetch`, `ctx.service`, 또는 데스크톱의 `ctx.net.probe`를 거칩니다. 데스크톱도 동일한 워커로 같은 플러그인을 실행합니다.

!!! warning "`fetch` 직접 호출은 개발 환경에서만 동작합니다"
    개발 서버(`vite dev`)는 워커의 네트워크 차단을 강제하지 않으므로, `fetch`를 직접 호출하는 팩은 개발 환경에서는 동작하고 프로덕션에서는 실패합니다. `ctx.net.fetch`를 사용하세요.

```ts
// 워커 내부에서, ctx는 메인 스레드 HostBridge의 Comlink 프록시입니다.
// fetch 없음, DOM 없음, 토큰 없음. graph/net은 해당 스코프가 부여된 경우에만 존재.
export default definePlugin({
  manifest: { /* … */ },
  async run(ctx) {
    // ctx.run.runId  -> 모든 쓰기를 검토 가능한 하나의 변경 세트로 묶음
    // ctx.graph?.list?() 는 node:read가 부여되었기 때문에만 존재
  },
});
```

## 이그레스는 호스트 측에서 허용 목록으로 통제됩니다

모든 `ctx.net.fetch`는 요청이 만들어지기 전에 호스트에서 매니페스트가 선언한 `network` 엔드포인트와 대조됩니다:

| 규칙 | 효과 |
|---|---|
| **파싱된 오리진**이 일치해야 함 — 프로토콜, 호스트, 포트 | URL이 선언된 것으로 시작하더라도 호스트, 프로토콜, 포트가 다르면 거부됩니다 |
| 경로 프리픽스는 **세그먼트 경계**에서 일치 | `https://h/v1` 스코프는 `/v1/search`를 포함하고, `/v1beta`는 포함하지 않습니다 |
| 메서드가 스코프의 `methods` 목록에 있어야 함 | `GET`만 허용된 엔드포인트에 `POST`할 수 없습니다 |
| 파싱되지 않는 URL은 **거부** | — |

요청은 분석가의 쿠키 없이 전송되며, 실행을 취소하면 진행 중인 요청도 중단됩니다. 직접 설정한 헤더는 `Authorization`을 포함해 작성한 그대로 엔드포인트에 도달합니다.

`sandbox-js` 플러그인은 여러 `network` 엔드포인트를 선언할 수 있고, 각각이 이렇게 검사됩니다. 스키마의 단일 항목 `proxy_endpoint` 규칙은 연기된 `web-proxy` 런타임에 속하며 강제되지 않습니다([scopes](../reference/scopes.md) 및 [plugin manifest](plugin-manifest.md) 참조).

### 데스크톱

데스크톱에서는 선언된 엔드포인트가 CORS 헤더를 보내지 않아도 접근할 수 있습니다.

`ctx.net.probe`(`web_probe` 스코프)는 데스크톱에만 있습니다: 데스크톱 앱 자체가 수행하는 익명 크로스 오리진 요청으로, CORS를 거부하는 사이트를 읽기 위한 것입니다. 리다이렉트를 따르지 않으며 크기와 시간에 상한이 있습니다. 웹 빌드에서는 `ctx.net.probe`가 존재하지 않으므로 플러그인은 폴백해야 합니다.

## 시크릿 처리 {#secret-handling}

API 키와 시크릿은 작업 기록이나 AI 대화 기록에 **절대** 포함되어서는 안 됩니다.

1. **시크릿은 그것을 선언한 플러그인에게 전달됩니다.** `secret: true`인 `config` 값은 실행 시 `ctx.config[key]`로 플러그인에 도달합니다 — 플러그인은 자신의 매니페스트가 선언한 키만 받습니다. 이 플래그는 설치/실행 폼에서 필드를 마스킹하며, 값은 데스크톱에서는 OS 키체인에, 브라우저에서는 해당 탭의 세션 동안만 보관됩니다(탭을 닫으면 다시 입력해야 합니다). 둘 중 어느 쪽인지는 폼이 명시합니다.
2. **시크릿은 params가 아닙니다.** 자격 증명을 `params`에 넣지 마세요: 실행 폼의 값은 작업에 기록됩니다. 자격 증명은 `secret: true`와 함께 `scopes.config`로 선언하세요 — 이 값은 작업 기록이나 AI 대화에 절대 기록되지 않습니다.
3. **Type Pack은 시크릿 프로퍼티 타입을 선언할 수 없습니다.** `secret` / `credential` 프로퍼티 타입은 **강력한 스키마 거부**입니다([Type Packs](../guide/typepacks.md) 참조).
4. **계정별로 보관됩니다.** config 값과 키는 기기에서 계정마다 따로 보관됩니다: 같은 기기에서 다른 계정으로 로그인해도 받지 못하고, 로그아웃해도 남으며, 계정을 삭제하면 지워집니다. 이것은 Vineyard 안에서 계정을 서로 분리하는 것이지, 컴퓨터에 직접 접근할 수 있는 사람으로부터 보호하는 것은 아닙니다.

## 다음 / 참고

- [Scopes reference](../reference/scopes.md) — 플러그인이 얻는 유일한 권한, 그리고 `ctx`에 매핑되는 방식
- [SDK](sdk.md) — `ctx` 표면과 Comlink 프록시
- [Plugin manifest](plugin-manifest.md) — 플랫폼, `proxy_endpoint`, 스코프 선언
- [Lifecycle](lifecycle.md) — 실행이 거치는 작업 상태와 취소가 실행을 되감는 방식
- [Architecture](architecture.md) — 브리지, 워커, 서버의 위치
