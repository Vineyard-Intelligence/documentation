# Skill Pack

Skill Pack은 **텍스트**입니다: 에이전트가 참고할 수 있는 재사용 가능한 조사 *플레이북*입니다.

> **Skill Pack은 코드를 실행하지 않으며 자체적으로 권한을 요청하지 않습니다.** 에이전트가 따르는 지침으로, `list_skills` / `load_skill` 툴을 통해 제공됩니다. 유일한 의존성 표면은 단계가 호출하는 Plugin Pack이며, `requires`에 선언됩니다.

## 문서

Skill Pack은 단일 JSON 문서로, `content_type: "vineyard:skillpack"`이며, 플러그인 매니페스트나 Type Pack과 정확히 같은 방식으로 작성자 저장소의 고정 커밋에 존재합니다:

```jsonc
{
  "content_type": "vineyard:skillpack",
  "identifier": "run.vineyard.skillpacks.account_identity_pivot",
  "name": "Account & identity pivoting",
  "description": "Turn one account or handle into the person's other accounts, and know when a shared username is NOT the same person.",
  "author": "VINEYARD",
  "version": "3.1.2",

  "applies_to": ["identity.handle", "identity.account", "identity.email_address", "identity.person"],
  "triggers": ["account", "username", "handle", "email", "same person", "sock puppet", "persona", "계정", "핸들", "아이디", "동일인", "부계정"],

  "requires": ["run.vineyard.pluginpacks.whatsmyname"],

  "overview": "Account & identity pivoting — from one handle or email to the accounts behind the same person…\nLoad the section for the lead you are holding:\n  - \"from-handle\"  - a username: spreading it across platforms\n  - \"from-email\"   - …\n  - \"corroborate\"  - deciding whether two accounts are one person\n…",

  "sections": [
    { "id": "from-handle", "summary": "From a username: spreading it across platforms.", "body": "JUDGE THE CROWD BEFORE THE SWEEP — …" },
    { "id": "from-email", "summary": "From an email address: the handles, keys and documents behind it.", "body": "…" },
    { "id": "from-profile", "summary": "From one profile page: every pivot it carries.", "body": "…" },
    { "id": "discriminate", "summary": "A candidate pair with a gap: the check that would settle it.", "body": "…" },
    { "id": "corroborate", "summary": "Judging whether two accounts are one person — how narrow is the population?", "body": "…" }
  ],

  "starters": [
    {
      "id": "deep-dive-handle",
      "label": "Deep-dive one handle",
      "category": "Find accounts",
      "summary": "Spread a single username across platforms, then work out which hits are the same person.",
      "prompt": "I want to deep dive on the user account \"{{handle}}\". For your information: {{context}}. …",
      "variables": [
        { "key": "handle", "label": "Handle or username", "placeholder": "example", "required": true },
        { "key": "context", "label": "What you already know (optional)", "placeholder": "looks South Korean, software developer", "multiline": true }
      ]
    }
  ]
}
```

| 필드 | 역할 |
| --- | --- |
| `identifier` | Reverse-DNS 기본 키, `<본인-네임스페이스>.skillpacks.<name>`. 매니페스트 하나 = 식별자 하나(플러그인 팩과 달리 멤버 확장 없음). |
| `applies_to` | 플레이북이 다루는 노드 타입(`category.name`) — 언제 관련이 있는지에 대한 힌트. |
| `triggers` | 에이전트가 Skill Pack 목록을 볼 때 함께 보는 키워드 힌트. |
| `requires` | 플레이북의 단계가 호출하는 플러그인 팩 식별자. **모두 프로젝트에 설치되어 있고 현재 빌드에서 실행 가능한 경우에만 스킬을 사용할 수 있습니다**(마켓플레이스가 함께 설치하며, 런타임에는 필요한 팩이 현재 플랫폼에서 차단된 경우 — 예: 웹에서의 데스크탑 전용 팩 — 설치되어 있어도 스킬이 숨겨집니다). 비어 있거나 없으면 = 플레이북이 내장 그래프 툴만 사용합니다. |
| `overview` | 라우터이지 절차가 아닙니다: 팩이 무엇을 위한 것인지, 어떤 섹션이 있는지. 에이전트가 먼저 읽습니다. |
| `sections` | 실제 단계. 각각 `id`(`load_skill(id, section)`으로 주소 지정), 한 줄 `summary`(전부 로드하지 않고 섹션을 고를 수 있게), `body`를 가집니다. 요청 시 로드 — 점진적 공개. |
| `starters` | 실행을 시작하는 준비된 방법: `{{key}}` 빈칸이 있는 `prompt`와 `variables` 목록(key, label, placeholder, `required`, `multiline`). `category`가 선택기에서 그룹화하며, 첫 등장 순서로 렌더링됩니다. |

### 좋은 섹션 작성하기

- **overview는 라우터입니다.** 팩이 무엇을 위한 것인지, 언제 사용하는지, 어떤 상황에서 어떤 섹션을 로드할지 에이전트에게 말하세요. 짧게 유지하세요 — 세부 내용은 섹션에 있습니다.
- **섹션 하나, 상황 하나.** 섹션은 독립적으로 로드 가능해야 합니다: 에이전트는 다른 섹션 *대신* 이것을 읽을 것이기 때문입니다.
- **증거가 어떻게 생겼는지 말하세요.** 가장 좋은 플레이북은 무엇이 두 대상을 실제로 연결하는지(공유된 검증된 이메일, 재사용된 인증서)와 그렇지 않은 것(흔한 핸들, 공유 호스팅)을 명시하고 — 에이전트에게 증거가 담지 못하는 결론이 아닌, 증거에 대한 라벨로 엣지를 붙이라고 지시합니다.

## 안전 모델

스킬 텍스트는 프롬프트에 주입되지 않고 에이전트가 필요할 때 툴 결과로 읽으므로, 사용하지 않을 때는 비용이 들지 않습니다.

- **앱 자체 규칙이 플레이북보다 우선합니다.** 규칙을 무시하거나, 분석가의 검토를 건너뛰거나, 신뢰할 수 없는 텍스트를 명령처럼 다루라는 텍스트는 거부됩니다.
- **필드는 다듬어집니다.** 라벨은 한 줄로 접히고 제어 문자를 제거합니다. 섹션 본문은 제한되며(~8,000자) 개행을 제외한 제어 문자를 제거합니다. starter는 단단히 제한됩니다(~1,200자 — starter는 문단이지 문서가 아닙니다).
- **턴당 로드 예산이 컨텍스트를 제한합니다.** 각 턴은 최대 12개의 (스킬, 섹션) 문서와 총 ~40,000자를 읽을 수 있으며, 재읽기도 다른 읽기와 똑같이 예산에 계상됩니다.

## 레지스트리에 게시 {#publishing-to-the-registry}

Skill Pack은 Plugin Pack 및 Type Pack과 정확히 같은 방식으로 배포됩니다: 문서는 **귀하의** 작성자 저장소에 남아 있고, 레지스트리는 `community-skillpacks.json`에 단일 간소화 항목을 보유합니다:

```json
{
  "identifier": "run.vineyard.skillpacks.account_identity_pivot",
  "content_type": "vineyard:skillpack",
  "name": "Account & identity pivoting",
  "author": "VINEYARD",
  "description": "Turn one account or handle into the person's other accounts, and know when a shared username is NOT the same person.",
  "repo": "Vineyard-Intelligence/skillpack-account-identity-pivoting",
  "ref": "0ea57eaa9f00c0fe9c8a0393b158cdb85354c480",
  "path": "skillpacks/account-pivot.skill.json",
  "version": "3.1.2",
  "applies_to": ["identity.handle", "identity.account", "identity.email_address", "identity.person"],
  "section_count": 5,
  "requires": ["run.vineyard.pluginpacks.whatsmyname"]
}
```

`applies_to`, `section_count`, `requires`는 찾아보기 페이지가 모든 문서를 가져오지 않고도 렌더링할 수 있도록 작성자가 항목에 직접 적습니다. CI는 고정된 문서에서 `section_count`를 다시 계산해 불일치하면 거부하고, 모든 `requires` 식별자가 카탈로그의 살아 있는 팩인지 확인합니다. `applies_to`는 검사하지 않으므로 문서에서 그대로 옮겨 적으세요. 전체 워크플로 — 포크, 불변 커밋 `ref` 고정, `packs/<identifier>.json` 파일 하나 추가, PR 열기 —는 [레지스트리에 게시](publishing.md)와 동일합니다.

## 다음 / 함께 보기

- [레지스트리에 게시](publishing.md) — 공유되는 포크 앤 PR 워크플로
- [배포](distribution.md) — 고정 ref와 가져온 문서를 검증하는 방식
- [Skill Pack 사용하기 (사용자 가이드)](../guide/skillpacks.md) — 팩 설치 및 사용
- [SDK & 호스트 컨텍스트](sdk.md) — 스킬의 단계가 호출하는 플러그인 표면
