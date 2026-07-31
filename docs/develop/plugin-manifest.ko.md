# Plugin manifest

플러그인 매니페스트는 하나의 플러그인을 완전히 설명하는 `vineyard:plugin` 문서입니다: 누가 만들었는지, 어디서 실행되는지, 어떤 그래프 타입을 읽고 쓰는지, 실행 전에 표시되는 폼, 필요한 권한, 그리고 배포 방법. 이것이 단일 진실 공급원이며 — 별도의 서버 측 Plugin 레코드는 없습니다.

이 페이지는 실제 [`cidr_expand`](plugin-manifest.md) 플러그인을 예제로 사용하여 매니페스트 블록이 어떻게 구성되고 어떤 UX 동작을 구동하는지 설명합니다. 모든 타입, 패턴, 기본값을 포함한 필드별 전체 스키마는 [plugin schema reference](../reference/plugin-schema.md)를 참조하세요. 완전히 주석이 달린 `cidr_expand` 매니페스트도 거기에 있습니다.

필수 최상위 키는 `identifier`, `content_type`, `name`, `version`, `description`, `platforms`, `io`, `scopes`, `lifecycle`, `distribution`입니다.

## 식별 정보

식별 정보 블록은 플러그인의 이름을 지정하고 속성을 부여합니다: `identifier`(마켓플레이스와 업데이트 확인이 키로 사용하는 reverse-DNS `run.vineyard.plugins.<slug>` 문자열), 상수 `content_type`인 `vineyard:plugin`, 표시 `name`, **SemVer** `version`(레지스트리는 SemVer로 릴리스를 정렬합니다 — [Updates](updates.md) 참조), 한두 문장의 `description`, 그리고 선택적 `author`, `license`, `icon`. `icon` 값은 **다형적**이며 순서대로 해석됩니다: `data:`/`http(s):` 이미지 URI는 직접 그려집니다. 그 외에는 케밥 케이스의 **lucide** 이름(예: `sitemap`)이 SVG로 렌더링됩니다. 그 외에는 리터럴 글리프/이모지로 처리됩니다. 이는 Type Pack 노드 아이콘에 사용되는 것과 동일한 리졸버입니다. 선택적 프레젠테이션 포인터 `thumbnail_url`, `marketing_url`, `latest_url`(마지막은 업데이트 흐름에 참여)은 [schema reference](../reference/plugin-schema.md)에 있습니다.

## 플랫폼

`platforms`는 플러그인이 실행될 수 있는 위치를 선언합니다. `web` 또는 `desktop` 중 하나 이상이 필요하며, `primary`는 선호 대상을 지정합니다. 두 가지 웹 런타임이 있습니다:

=== "web (sandbox-js)"

    ```json
    "platforms": {
      "primary": "web",
      "web": { "runtime": "sandbox-js", "entry": "dist/cidr.js" }
    }
    ```

    `sandbox-js`는 작성자의 번들 JavaScript를 전용 모듈 Web Worker 내에서 실행합니다. 이그레스는 CSP에 의해 제어됩니다. CIDR Expand는 순수 연산이므로 이것만으로 충분합니다.

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

    `web-proxy`는 CORS 탈출구입니다: 워커는 정확히 **하나의** 작성자 제어 엔드포인트를 호출하는 씬 클라이언트입니다. `runtime`이 `web-proxy`일 때, `proxy_endpoint`는 필수이며 **반드시 단일 `scopes.network` 항목과 동일해야** 합니다(팬아웃 불가).

!!! warning "데스크톱: `sandbox-js`는 배포됨; `native`/`subprocess`는 연기됨"
    스키마는 `desktop` 블록(런타임 `sandbox-js`, `native`, 또는 `subprocess`)을 허용합니다. `sandbox-js` 데스크톱 런타임은 Electron 셸을 통해 **현재 배포되어** 있습니다. `native` 및 `subprocess` 런타임은 미래 지향적 설계입니다 — 아직 실행된다고 의존하지 마세요.

각 플랫폼 블록은 이 플랫폼에서 플러그인을 실행할 수 없을 때 사용자에게 표시할 내용을 설명하는 `fallback`(`desktop`/`web`/`none`)을 설정할 수 있습니다. 설치 프로그램은 지원되지 않는 플러그인을 숨기지 않고 **회색으로 표시**하므로, 웹 전용 플러그인이 명확한 비활성화 상태로 카탈로그에 계속 표시됩니다.

## io — consumes 및 produces

`io`는 Type Pack의 엔티티 타입을 참조하여 플러그인을 그래프에 연결합니다. `consumes`와 `produces`는 모두 필수 배열이며(둘 중 하나는 비어 있을 수 있음), 각 항목은 `{ typepack, category, name, as? }` 형식의 타입 참조입니다 — `category`와 `name`이 함께 정규화된 런타임 타입을 구성하므로, `Node.type`은 `<category>.<name>`과 같습니다.

```json
"io": {
  "consumes": [
    { "typepack": "run.vineyard.typepacks.infrastructure", "category": "infrastructure", "name": "netblock", "as": "cidr" }
  ],
  "produces": [
    { "typepack": "run.vineyard.typepacks.infrastructure", "category": "infrastructure", "name": "ip_address" }
  ]
}
```

`consumes`는 UX를 형성합니다:

- 플러그인은 노드의 `type`이 소비된 타입 참조 중 하나와 일치할 때 해당 노드의 **우클릭 메뉴**에 나타납니다. CIDR Expand는 모든 `infrastructure.netblock` 노드에서 표시됩니다.
- `as`(consumes 전용)는 선택적 바인딩 별칭입니다: 소비된 노드의 값이 실행 폼이 열릴 때 이 키 아래 **`params`에 미리 바인딩**됩니다. `"as": "cidr"` 때문에, 메뉴 항목을 클릭하면 `cidr` 파라미터가 노드 값으로 미리 채워지므로, 사용자는 보통 확인만 하고 실행합니다.
- **빈 `consumes` 배열**을 가진 플러그인은 전체 그래프 플러그인입니다. 어떤 노드에도 연결되지 않으며, 대신 전역 **"Run plugin"** 메뉴에서 시작됩니다.

`produces`는 정보 제공용입니다 — 이 플러그인이 생성할 수 있는 노드 타입을 마켓플레이스와 캔버스에 알려줍니다. 이러한 타입이 정의되는 방식은 [Type Packs (develop)](typepacks.md)를 참조하세요.

## params — 실행 전 폼

`params`는 플러그인이 실행되기 전에 표시되는 폼을 설명하는 **JSON Schema (draft 2020-12)**입니다. 제출되고 검증된 객체는 `Task.input`이 되어 플러그인의 `run` 함수에 전달됩니다. 표준 JSON Schema 키워드가 렌더링된 폼과 클라이언트 측 유효성 검사를 구동합니다: `title`은 레이블, `description`은 도움말 텍스트, `default`는 미리 채워진 값, `required`/`pattern`/`minimum`/`maximum`/`enum`은 제약 조건을 강제합니다. `io.consumes` `as`(여기서는 `cidr`)로 바인딩된 필드는 소비된 노드에서 미리 채워져 도착합니다.

!!! danger "params에 시크릿 금지 — 린트에서 거부됨"
    `params`는 시크릿을 포함해서는 **안 됩니다**. 레지스트리 린터가 시크릿처럼 보이는 파라미터 키(API 키, 토큰, 비밀번호 등)를 **거부**합니다. 시크릿은 실행 폼을 통해 절대 제출되지 않습니다. 해당 값이 `Task.input`에 기록되기 때문입니다. 자격 증명은 대신 `"secret": true`와 함께 `scopes.config` 항목으로 선언하세요 — 이 값들은 런타임에만 주입되며 어떤 레코드에도 기록되지 않습니다. [Secret handling](security.md)을 참조하세요.

## scopes — 권한 표면

`scopes`는 플러그인이 받는 **유일한** 권한입니다. 여기에 선언되지 않은 기능은 런타임에 단순히 존재하지 않습니다 — 우회할 수 있는 것이 없습니다. CIDR Expand는 소스 노드를 읽고 노드와 엣지를 생성하기만 하면 됩니다:

```json
"scopes": {
  "graph": ["node:read", "node:create", "edge:create"]
}
```

여기서 반복할 가치가 있는 두 가지 규칙: **웹** 플러그인의 경우, `network`는 반드시 `platforms.web.proxy_endpoint`와 동일한 정확히 하나의 항목이어야 합니다. 그리고 `"secret": true`인 `config` 항목은 데스크톱/키체인 전용이며 브라우저에 반환되지 않습니다. 이 실행의 `params` 읽기, `progress` 보고, `log` 쓰기, 협력적 취소 `signal`과 같은 것들은 **스코프가 아닙니다** — 항상 사용 가능합니다.

전체 스코프 어휘, 스코프 패밀리, 강제 모델은 [scopes reference](../reference/scopes.md)를 참조하세요.

## lifecycle

`lifecycle`은 런타임이 작업을 관리하는 방식을 선언합니다. CIDR Expand는 짧고, 취소 가능하며, 결정적 진행률을 보고하는 임시 작업입니다:

```json
"lifecycle": {
  "long_running": false,
  "controls": ["cancel", "progress"],
  "progress": "determinate",
  "persistence": "ephemeral"
}
```

- **`long_running`** — `true`일 때, 런타임이 작업을 지속적으로 관리합니다(상태/일시정지/재개/취소/재시도/진행률). 기본값은 `false`.
- **`controls`** — UI가 노출할 컨트롤: `pause`, `resume`, `cancel`, `retry`, `progress`.
- **`progress`** — `none`, `determinate`, 또는 `indeterminate`.
- **`persistence`** — `ephemeral`(Task DB 행 없음, 인메모리 전용), `opt-in`, 또는 `always`. 기본값은 `ephemeral`.

표준 작업 상태 머신은 7가지 상태 `queued → running → waiting → paused → cancelled → succeeded → failed`입니다. 재시도는 상태가 아닌 **새로운** 작업을 발행합니다. [Lifecycle](lifecycle.md)과 사용자 대상 [Tasks](../guide/tasks.md) 페이지를 참조하세요.

## distribution

`distribution`은 클라이언트가 번들을 가져올 위치를 알려주는 공유 블록(플러그인과 Type Pack 모두에서 사용)입니다. 서버 측 복사본은 없으며, 클라이언트가 가져온 번들을 로컬에 캐시합니다.

```json
"distribution": {
  "kind": "inline",
  "integrity": { "algo": "sha256", "hash": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad" }
}
```

`kind`는 `git`, `zip`, 또는 `inline`입니다. `git`의 경우, `ref`는 **불변** 40자 커밋 SHA 또는 주석 태그여야 합니다(브랜치는 레지스트리 CI에서 거부됨). 선택적 `integrity` 해시는 설치 시 강제 푸시를 감지합니다. `repository`, `path`, `archive`를 포함한 전체 distribution 블록은 [Distribution](distribution.md) 페이지와 [schema reference](../reference/plugin-schema.md)에서 다룹니다.

## 여러 플러그인 번들링

단일 번들은 하나 이상의 플러그인을 포함할 수 있습니다. 기본 내보내기는 하나의 플러그인, 배열, 또는 **팩**(`definePluginPack`)일 수 있습니다 — 예를 들어 **Chaos Reference Pack**은 6개의 그래프 조작 플러그인을 함께 배포합니다. 호스트는 팩을 개별적으로 주소 지정 가능한 플러그인으로 평탄화합니다. [Plugin Packs](plugin-packs.md)를 참조하세요.

## 다음 / 참고

- [Plugin schema reference](../reference/plugin-schema.md) — 전체 필드 테이블
- [Scopes reference](../reference/scopes.md)
- [Security & secret handling](security.md)
- [Lifecycle](lifecycle.md) · [Distribution](distribution.md) · [Publishing](publishing.md)
- [Quickstart](quickstart.md) 및 [SDK](sdk.md)
