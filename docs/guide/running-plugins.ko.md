# 플러그인 실행하기

플러그인이 프로젝트에 설치되면 노드의 우클릭 메뉴, 전역 "플러그인 실행" 메뉴, 또는 명령 팔레트의 세 가지 인터페이스 중 하나에서 실행하고, 작업 패널에서 실행을 감시하고 취소할 수 있습니다. 이 페이지에서는 각 인터페이스와 실행이 입력을 받는 방식을 다룹니다.

## 입력의 출처

모든 플러그인은 매니페스트에 입력을 선언하며, 그 선언이 플러그인이 어디에 표시되고 어떻게 미리 채워지는지 결정합니다:

- **`io.consumes`** — 플러그인이 작동하는 노드 유형. 유형을 소비하는 플러그인은 해당 유형의 모든 노드의 우클릭 메뉴에 나타나며, 소비된 값은 `as` 키를 통해 **`params`에 미리 바인딩**됩니다.
- **빈 `consumes`** — 플러그인은 전체 그래프에서 작동하며 전역 **플러그인 실행** 메뉴(또는 팔레트)에서 실행됩니다.
- **선택** — `consumes`와 관계없이 현재 선택된 노드가 항상 `ctx.input.selection`에 시드됩니다. 이는 **Black Hole**과 같은 플러그인이 어떤 노드에 작용할지 아는 방식입니다.

이 필드의 전체 형태는 [플러그인 매니페스트](../develop/plugin-manifest.md) 및 [스코프](../reference/scopes.md) 레퍼런스를 참조하세요.

## 실행 인터페이스 1: 노드 우클릭 메뉴

플러그인의 `io.consumes`가 노드의 `type`과 일치하면, 해당 노드의 우클릭 메뉴에 나타납니다. 선택하면 소비된 값이 이미 채워진 상태로 실행 전 params 양식이 열립니다.

CIDR Expand의 경우를 보면, 매니페스트가 `infrastructure.netblock` 노드를 소비하고 `cidr`로 바인딩합니다:

```jsonc
"io": {
  "consumes": [
    { "typepack": "run.vineyard.typepacks.infrastructure",
      "category": "infrastructure", "name": "netblock", "as": "cidr" }
  ],
  "produces": [
    { "typepack": "run.vineyard.typepacks.infrastructure",
      "category": "infrastructure", "name": "ip_address" }
  ]
}
```

`infrastructure.netblock` 노드를 우클릭 → **CIDR Expand**가 나열됨 → `cidr`이 해당 노드의 값으로 이미 설정된 양식이 열립니다. 그런 다음 `max_hosts`(또는 다른 매개변수)를 확인하고 실행합니다. 실행이 진행됨에 따라 새 `infrastructure.ip_address` 노드가 캔버스에 나타납니다.

!!! note "내장 노드 메뉴 작업"
    레퍼런스 UI의 노드 메뉴에는 그래프 편집 작업(복사, 복제, 연결 모드, 모든 연결 해제, 삭제)도 포함됩니다. 소비 플러그인은 이러한 유형별 작업과 함께 나열됩니다.

## 실행 인터페이스 2: 전역 플러그인 실행 메뉴

`consumes: []`인 플러그인은 전체 그래프에서 작동하며 연결할 노드가 없으므로, 노드가 아닌 전역 **플러그인 실행** 메뉴에서 실행됩니다 — 예를 들어 Chaos 팩의 전체 그래프 플러그인(Korean Roulette, Russian Roulette, Thanos Snap, Dumb AI Optimizer, Schrödinger's Node). 전체 명단과 스코프는 아래 [Chaos 레퍼런스 팩](#chaos-레퍼런스-팩)을 참조하세요.

## 실행 전 params 양식

실행이 시작되기 전에, Vineyard는 JSON Schema인 매니페스트의 `params` 블록에서 생성된 양식을 표시합니다. 필드 제목, 유형, 기본값, 제약 조건은 스키마에서 직접 가져옵니다. CIDR Expand의 경우:

```jsonc
"params": {
  "type": "object",
  "required": ["cidr"],
  "properties": {
    "cidr":      { "type": "string", "title": "CIDR block",
                   "pattern": "^\\d{1,3}(\\.\\d{1,3}){3}/\\d{1,2}$",
                   "description": "우클릭한 netblock 노드에서 미리 채워집니다." },
    "max_hosts": { "type": "integer", "title": "Max hosts to emit",
                   "minimum": 1, "maximum": 65536, "default": 1024 }
  }
}
```

이것은 **CIDR block**용 텍스트 입력(패턴에 대해 유효성 검사, 노드에서 실행 시 미리 채워짐)과 **Max hosts to emit**용 숫자 입력(기본값 1024)을 렌더링합니다. 제출한 값은 실행의 `Task.input.params`가 됩니다.

!!! warning "params에 비밀 금지"
    `params`는 일반 실행 입력입니다 — API 키나 자격 증명을 여기에 넣지 마세요. 비밀로 보이는 키는 설치 시 거부됩니다. 비밀은 `secret: true`가 있는 `scopes.config`에 속합니다. [보안](../develop/security.md)을 참조하세요.

## 선택 입력

일부 플러그인은 선택한 항목에 대해 작동합니다. 호스트는 항상 `ctx.input.selection`에 선택된 노드 ID를 시드하므로, 플러그인은 매개변수가 아닌 선택 항목을 읽습니다.

**Black Hole**이 대표적인 예입니다: **선택된 노드**를 소비하고 해당 노드의 1-홉 이웃을 삭제합니다. 노드를 선택(또는 우클릭)하고 Black Hole을 실행하면, 실행이 선택 항목을 읽어 대상을 찾습니다. 선택 기반 플러그인을 아무것도 선택하지 않은 상태로 실행하면 작용할 입력이 없습니다.

## 명령 팔레트

명령 팔레트는 이름으로 플러그인을 실행하며, 전체 그래프 플러그인과 키보드 중심 작업에 편리합니다.

=== "설치된 플러그인 나열"

    ```text
    /plugins
    ```

    현재 프로젝트에 설치된 모든 플러그인을 각 실행 명령과 함께 나열합니다:

    ```text
    Available plugins:
    • /plugin korean_roulette — Korean Roulette: 임의의 노드 하나를 유지하고 나머지 모두 삭제합니다.
    • /plugin thanos_snap — Thanos Snap: ...
    ```

    설치된 것이 없으면 **메뉴 → "마켓플레이스에서 추가"**를 안내합니다.

=== "플러그인 하나 실행"

    ```text
    /plugin thanos_snap
    ```

    지정된 플러그인을 실행합니다. 인수는 플러그인의 짧은 이름(`run.vineyard.plugins.` 이후 부분) 또는 전체 식별자입니다 — 따라서 `/plugin thanos_snap`과 `/plugin run.vineyard.plugins.thanos_snap` 모두 작동합니다. 이름을 생략하면 힌트가 표시되고, 설치되지 않은 플러그인 이름을 지정하면 마켓플레이스에서 설치하라는 안내가 표시됩니다.

팔레트 실행은 메뉴 인터페이스와 마찬가지로 현재 노드 선택을 선택 입력으로 사용합니다.

## 진행률 및 취소

모든 실행은 실시간 상태 배지, 결정적 플러그인을 위한 진행률 막대, 협력적 취소를 위한 **중지** 컨트롤이 있는 작업이 됩니다. 상태, 컨트롤, 실행 저장에 대해서는 [작업 및 실행](tasks.md)을 참조하세요.

## Chaos 레퍼런스 팩

Chaos 팩은 하나의 번들(`run.vineyard.pluginpacks.chaos`)에 6개의 순수 클라이언트 측 그래프 플러그인을 제공합니다 — 설치하면 6개 모두가 한 번에 추가됩니다. 이들은 SDK의 검증 세트이며 웹과 데스크톱에서 동일하게 실행됩니다.

| 플러그인 | `scopes.graph` | `io.consumes` | 동작 |
|---|---|---|---|
| Korean Roulette | `node:read node:delete edge:delete` | — (전체 그래프) | 임의의 노드 하나를 유지하고 나머지 모두 삭제 |
| Russian Roulette | `node:read node:delete` | — | 임의의 노드 하나(+엣지) 삭제 |
| Thanos Snap | `node:read node:delete edge:delete` | — | 임의의 `floor(n/2)`개 노드 삭제 |
| Black Hole | `node:read node:delete edge:delete` | **선택된 노드** | 선택된 노드의 1-홉 이웃 삭제 |
| Dumb AI Optimizer | `[]` (그래프 없음) | — | 3~5초 가짜 진행, 아무 변경 없음 |
| Schrödinger's Node | `node:read node:delete` | — | 임의의 노드 선택; 50% 삭제 / 50% 아무것도 안 함 |

이들이 확정하는 두 가지 SDK 요구사항:

1. **선택 입력.** Black Hole은 사용자가 선택한 것에 대해 작동합니다. 호스트는 `ctx.input.selection`(선택된 노드 ID)을 시드하고, 타입이 지정된 `consumes` 항목을 선언한 플러그인의 경우 `as` 별칭을 통해 소비된 노드를 `ctx.params`에 미리 바인딩합니다.
2. **대량 삭제 + 캡 정책.** 대량 삭제는 `ctx.graph.deleteNodes(ids[])`를 통해 진행됩니다. 실행 토큰 쓰기 캡은 대량 호출을 **단일 제한 작업**으로 간주하므로, 합법적인 대량 삭제(Korean Roulette가 4,000개 노드 그래프를 지우는 것)가 노드 하나씩 제한되어 죽지 않습니다.

!!! tip "안전하게 시도하세요"
    Chaos 팩은 의도적으로 파괴적입니다. 일회용 그래프에서 실행하거나(`/temp`를 사용하여 먼저 샘플 데이터 생성) Korean Roulette, Thanos Snap, Black Hole이 실제 작업을 잃지 않고 캔버스를 재구성하는 모습을 관찰하세요.

## 다음 / 함께 보기

- [작업 및 실행](tasks.md) — 작업 상태, 진행률, 중지, 실행 저장
- [CIDR Expand](../develop/plugin-manifest.md) — 순수 계산 확장 플러그인
- [Plugin Pack 및 Type Pack 둘러보기 및 설치](installing.md) — 프로젝트에 플러그인 가져오기
- [플러그인 매니페스트](../develop/plugin-manifest.md) — `io.consumes`, `params`, `as`
