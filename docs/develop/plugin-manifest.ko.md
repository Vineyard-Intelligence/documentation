# Plugin manifest

플러그인 매니페스트는 하나의 플러그인을 완전히 설명하는 `vineyard:plugin` 문서입니다: 누가 만들었는지, 어디서 실행되는지, 어떤 그래프 타입을 읽고 쓰는지, 실행 전에 표시되는 폼, 필요한 권한, 그리고 배포 방법. 이것이 단일 진실 공급원입니다.

이 페이지는 실제로 배포된 두 플러그인을 예제로 사용해 매니페스트 블록을 설명합니다: [IP Recon](https://github.com/Vineyard-Intelligence/pluginpack-ip-recon) 팩의 **RDAP IP**, 그리고 Wayback Machine 팩의 **Wayback Snapshot History**. 모든 타입, 패턴, 기본값을 포함한 필드별 전체 스키마는 [plugin schema reference](../reference/plugin-schema.md)를 참조하세요.

필수 최상위 키는 `identifier`, `content_type`, `name`, `version`, `description`, `platforms`, `io`, `scopes`, `lifecycle`, `distribution`입니다.

## 식별 정보

식별 정보 블록은 플러그인의 이름을 지정하고 속성을 부여합니다: `identifier`(마켓플레이스와 업데이트 확인이 키로 사용하는 reverse-DNS `<본인-네임스페이스>.plugins.<slug>` 문자열), 상수 `content_type`인 `vineyard:plugin`, 표시 `name`, **SemVer** `version`, 한두 문장의 `description`, 그리고 선택적 `author`, `license`, `icon`. `icon`은 케밥 케이스의 **lucide** 아이콘 이름(예: `sitemap`)이며, 그 외의 값은 기본 퍼즐 아이콘으로 렌더링됩니다. 선택적 프레젠테이션 포인터 `thumbnail_url`, `marketing_url`, `latest_url`은 [schema reference](../reference/plugin-schema.md)에 있습니다(업데이트 확인은 `latest_url`을 사용하지 않습니다: 카탈로그의 `version`이 설치된 버전보다 SemVer로 더 새로우면 업데이트가 제공됩니다 — [Updates](updates.md) 참조).

AI 에이전트는 `description`을 보고 플러그인을 고르므로, 플러그인이 무엇을 받아 무엇을 추가하는지 적으세요. 에이전트는 각 파라미터의 `description`(없으면 `title`)도 읽습니다. 에이전트의 플러그인 목록에서는 300자를 넘는 파라미터 설명이 첫 문장으로 잘리고, 에이전트가 그 플러그인을 따로 요청할 때 전체가 전달되므로, 핵심 규칙을 맨 앞에 두세요.

## 플랫폼 {#platforms}

`platforms`는 플러그인이 실행될 수 있는 위치를 선언합니다. `web` 또는 `desktop` 중 하나 이상이 필요하며, `primary`는 선호 대상을 지정합니다. 두 가지 웹 런타임이 있습니다:

=== "web (sandbox-js)"

    ```json
    "platforms": {
      "primary": "web",
      "web": { "runtime": "sandbox-js", "entry": "dist/pack.mjs" }
    }
    ```

    `sandbox-js`는 작성자의 번들 JavaScript를 자체 네트워크가 없는 전용 모듈 Web Worker 내에서 실행하며, 오직 호스트를 통해서만 나갑니다: `ctx.net.fetch`(선언된 `scopes.network` 엔드포인트로 제한), `ctx.service`(`scopes.services`), 또는 데스크톱 앱에서는 `ctx.net.probe`(`scopes.web_probe`). RDAP IP가 이 방식(`ctx.net.fetch`)을 씁니다.

=== "web (web-proxy)"

    ```json
    "platforms": {
      "primary": "web",
      "web": {
        "runtime": "web-proxy",
        "entry": "dist/client.js",
        "proxy_endpoint": "https://api.example.com/run"
      }
    }
    ```

    `web-proxy`는 CORS 탈출구로 설계되었습니다: 워커가 정확히 **하나의** 작성자 제어 엔드포인트만 호출하는 씬 클라이언트가 되고, `proxy_endpoint`는 필수이며 단일 `scopes.network` 항목과 동일해야 합니다(팬아웃 불가). **스키마는 이 값을 허용하지만, 아직 이를 실행하는 런타임은 없습니다** — 이에 의존하는 플러그인을 배포하지 마세요.

!!! warning "데스크톱: 앱은 `web` 진입점을 실행함; `native`/`subprocess`는 연기됨"
    스키마는 `desktop` 블록(런타임 `sandbox-js`, `native`, 또는 `subprocess`)을 허용하지만 호스트는 이를 읽지 않습니다: Electron 셸은 별도의 데스크톱 런타임이 아니라 같은 샌드박스 워커에서 플러그인의 `platforms.web` `sandbox-js` 진입점을 실행합니다. `native` 및 `subprocess` 런타임은 미래 지향적 설계입니다 — 아직 실행된다고 의존하지 마세요.

호스트는 웹과 데스크톱 앱 모두에서 `platforms.web`(런타임 `sandbox-js`)을 실행합니다 — `desktop` 블록과 두 `fallback` 필드는 스키마상 허용되지만 읽히지 않으므로, 모든 플러그인에는 `web` 블록이 필요합니다. `primary: "desktop"`은 플러그인을 데스크톱 전용으로 표시합니다: 브라우저에서는 숨겨지지 않고 Run plugins 패널의 **Desktop only** 아래에 회색으로, 실행 불가 상태로 계속 표시됩니다. 마켓플레이스는 이런 팩에 **Desktop only** 표시를 붙이지만, 브라우저에서도 설치는 됩니다.

## io — consumes 및 produces

`io`는 Type Pack의 엔티티 타입을 참조하여 플러그인을 그래프에 연결합니다. `consumes`와 `produces`는 모두 필수 배열이며(둘 중 하나는 비어 있을 수 있음), 각 항목은 `{ typepack, category, name, as? }` 형식의 타입 참조입니다 — `category`와 `name`이 함께 정규화된 런타임 타입을 구성하므로, `Node.type`은 `<category>.<name>`과 같습니다.

```json
"io": {
  "consumes": [
    { "typepack": "run.vineyard.typepacks.infrastructure", "category": "infrastructure", "name": "ip_address" }
  ],
  "produces": [
    { "typepack": "run.vineyard.typepacks.infrastructure", "category": "infrastructure", "name": "netblock" }
  ]
}
```

RDAP IP의 실제 `io`입니다: `infrastructure.ip_address` 노드를 받아 그 소유 `infrastructure.netblock`을 추가합니다.

`consumes`는 UX를 형성합니다:

- `consumes`는 **Run plugins…** 패널(노드나 캔버스의 우클릭 메뉴, 툴바, 메뉴 바에서 열림)에서 플러그인이 제공되는 위치를 결정합니다: 선택한 범위(Selected 또는 Whole project)에 소비 타입 중 하나라도 있으면 플러그인이 *Matches selection* / *Matches project data* 아래에 나열됩니다. RDAP IP는 범위 안에 `infrastructure.ip_address` 노드가 있으면 언제나 제공됩니다.
- 타입 참조는 선택적 `as` 바인딩 별칭(소비된 노드의 값을 그 키 아래 `params`에 미리 바인딩)도 허용합니다. 스키마는 이를 허용하지만 실행 폼은 아직 읽지 않습니다.
- **빈 `consumes` 배열**을 가진 플러그인은 전체 그래프 플러그인입니다. 대신 패널의 *Whole-graph / input via form* 섹션에 나열됩니다. 파라미터가 하나 이상인 전체 그래프 플러그인은 AI 에이전트에게 쿼리 도구로도 제공됩니다: 에이전트는 노드 없이 실행하고 `params`를 직접 채웁니다.

`produces`는 정보 제공용입니다 — 이 플러그인이 생성할 수 있는 노드 타입을 마켓플레이스와 캔버스에 알려줍니다. 이러한 타입이 정의되는 방식은 [Type Packs (develop)](typepacks.md)를 참조하세요.

## params — 실행 전 폼

`params`는 플러그인이 실행되기 전에 표시되는 폼을 설명하는 **JSON Schema (draft 2020-12)**입니다. 제출된 객체는 `ctx.params`로 `run`에 전달됩니다(실행의 작업 행에도 보관됨). 폼은 `title`(레이블), `description`(도움말 텍스트), `type`(텍스트 / 숫자 / 스위치), `enum`(선택 상자), `required`(채워질 때까지 Run 비활성)만 읽습니다. `default`, `pattern`, `minimum`, `maximum`은 적용되지 않으므로 검증과 기본값 처리는 `run` 안에서 하세요. `"format": "file"`인 속성은 로컬 파일 선택기를 렌더링하며(`accept`로 필터링, `"type": "array"`이면 여러 파일 허용) 플러그인은 `File` 객체(들)를 받습니다. Wayback Snapshot History의 실제 폼:

```json
"params": {
  "type": "object",
  "properties": {
    "from": { "type": "string", "pattern": "^\\d{8}$", "description": "Earliest capture date, YYYYMMDD. Empty = no lower bound." },
    "to": { "type": "string", "pattern": "^\\d{8}$", "description": "Latest capture date, YYYYMMDD. Empty = no upper bound." },
    "limit": { "type": "integer", "minimum": 1, "maximum": 500, "default": 50, "description": "Maximum captures to fetch per node, 1–500. Default 50." },
    "drop_duplicates": { "type": "boolean", "default": true, "description": "Keep only the newest capture of each content digest. On by default." }
  }
}
```

!!! danger "params에 시크릿 금지"
    `params`는 시크릿(API 키, 토큰, 비밀번호 등)을 포함해서는 **안 됩니다** — 제출된 값은 실행과 함께 기록됩니다. 자격 증명은 대신 `"secret": true`와 함께 `scopes.config` 항목으로 선언하세요 — 이 값들은 플러그인 자체 설정 폼에서 수집되며 어떤 레코드에도 기록되지 않습니다. [Secret handling](security.md)을 참조하세요.

## scopes — 권한 표면

`scopes`는 플러그인이 받는 **유일한** 권한입니다. 여기에 선언되지 않은 기능은 런타임에 단순히 존재하지 않습니다. RDAP IP는 소스 노드를 읽고, 결과를 쓰고, 엔드포인트 하나에서 가져옵니다:

```json
"scopes": {
  "graph": ["node:read", "node:create", "node:update", "edge:create"],
  "network": [
    { "endpoint": "https://rdap.org/", "methods": ["GET"], "purpose": "Look up each selected IP's netblock and owner in RDAP." }
  ]
}
```

여기서 반복할 가치가 있는 두 가지 규칙: **web-proxy** 플러그인의 경우 `network`는 반드시 `platforms.web.proxy_endpoint`와 동일한 정확히 하나의 항목이어야 하고, `sandbox-js` 플러그인의 `network` 항목은 대신 호스트의 이그레스 허용 목록으로 검사됩니다([security](security.md) 참조). `"secret": true`인 `config` 항목은 폼에서 마스킹되고, 로그인한 계정별로(데스크톱은 OS 키체인, 브라우저는 탭 세션 동안) 보관되며, 그것을 선언한 플러그인에게 전달됩니다. 이 실행의 `params` 읽기, `progress` 보고, `log` 쓰기, 협력적 취소 `signal`과 같은 것들은 **스코프가 아닙니다** — 항상 사용 가능합니다.

전체 스코프 어휘, 스코프 패밀리, 강제 모델은 [scopes reference](../reference/scopes.md)를 참조하세요.

## lifecycle

`lifecycle`은 실행의 타임아웃 예산을 선언합니다. RDAP IP:

```json
"lifecycle": {
  "persistence": "opt-in",
  "controls": ["progress", "cancel"],
  "progress": "determinate"
}
```

호스트가 실제로 강제하는 유일한 필드는 `timeout_ms`입니다 — 실행에 대한 wall-clock 예산이며, 이를 넘으면 호스트가 샌드박스를 종료하고 작업을 실패시킵니다. `timeout_ms`를 생략하면 호스트가 10분 기본값을 적용하고, 선언된 값은 60분으로 제한됩니다 — 매니페스트는 예산을 늘릴 수는 있지만 없앨 수는 없습니다. `controls`, `progress`, `persistence`는 스키마상 허용되지만 호스트가 오늘 읽지는 않습니다. [Lifecycle](lifecycle.md)과 사용자 대상 [Tasks](../guide/tasks.md) 페이지를 참조하세요.

## distribution

`distribution`은 공유 설명용 블록(플러그인과 Type Pack 모두에서 사용)이며, 호스트는 이를 읽지 않습니다. 클라이언트가 무엇을 실행할지는 레지스트리 항목이 결정합니다 — jsDelivr를 통해 `repo@ref/path`에서 매니페스트를 가져와 레지스트리가 기록한 다이제스트와 대조한 뒤, 같은 커밋에서 `platforms.web.entry`를 로드합니다.

```json
"distribution": {
  "kind": "inline",
  "integrity": { "algo": "sha256", "hash": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad" }
}
```

`kind`는 `git`, `zip`, 또는 `inline`입니다. 레지스트리 항목의 `ref`는 전체 커밋 SHA(40자 또는 64자 16진수)여야 하며 — 레지스트리 CI는 태그와 브랜치를 거부합니다([Distribution](distribution.md#integrity) 참조). `repository`, `path`, `archive`를 포함한 전체 distribution 블록은 [Distribution](distribution.md) 페이지와 [schema reference](../reference/plugin-schema.md)에서 다룹니다.

## 여러 플러그인 번들링

단일 번들은 하나 이상의 플러그인을 포함할 수 있습니다. 기본 내보내기는 하나의 플러그인, 배열, 또는 **팩**(`definePluginPack`)일 수 있습니다 — 예를 들어 **Chaos Reference Pack**은 6개의 그래프 조작 플러그인을 함께 배포합니다. 호스트는 팩을 개별적으로 주소 지정 가능한 플러그인으로 평탄화합니다. [Plugin Packs](plugin-packs.md)를 참조하세요.

## 다음 / 참고

- [Plugin schema reference](../reference/plugin-schema.md) — 전체 필드 테이블
- [Scopes reference](../reference/scopes.md)
- [Security & secret handling](security.md)
- [Lifecycle](lifecycle.md) · [Distribution](distribution.md) · [Publishing](publishing.md)
- [Quickstart](quickstart.md) 및 [SDK](sdk.md)
