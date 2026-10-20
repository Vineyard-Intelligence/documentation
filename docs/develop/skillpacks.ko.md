# Skill Pack

Skill Pack은 **텍스트**입니다: 에이전트가 참고할 수 있는 재사용 가능한 조사 *플레이북*입니다.

> **Skill Pack은 코드를 실행하지 않으며 자체적으로 권한을 요청하지 않습니다.** 에이전트가 따르는 지침으로, `list_skills` / `load_skill` 툴을 통해 제공됩니다. 유일한 의존성 표면은 단계가 호출하는 Plugin Pack이며, `requires`에 선언됩니다.

## 문서 {#the-document}

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

## 안전 모델 {#the-safety-model}

스킬 텍스트는 프롬프트에 주입되지 않고 에이전트가 필요할 때 툴 결과로 읽으므로, 사용하지 않을 때는 비용이 들지 않습니다.

- **앱 자체 규칙이 플레이북보다 우선합니다.** 규칙을 무시하거나, 분석가의 검토를 건너뛰거나, 신뢰할 수 없는 텍스트를 명령처럼 다루라는 텍스트는 거부됩니다.
- **필드는 다듬어집니다.** 한 줄 필드(이름, 설명, 요약, 라벨, id, 목록 항목)는 한 줄로 접히고 제어 문자가 제거됩니다. overview, 섹션 본문, starter 프롬프트는 개행과 탭은 유지하고 그 밖의 제어 문자는 모두 제거됩니다. 그다음 각 필드는 [한도](#loader-limits)에 맞춰 잘립니다: starter 프롬프트는 1,200자에서 끊깁니다. starter는 문단이지 문서가 아니기 때문입니다.
- **턴당 로드 예산이 컨텍스트를 제한합니다.** 각 턴은 최대 12개의 (스킬, 섹션) 문서와 총 ~40,000자를 읽을 수 있으며, 재읽기도 다른 읽기와 똑같이 예산에 계상됩니다.

### 로더 한도 {#loader-limits}

로더는 레지스트리에서 설치한 팩이든 프로젝트에서 작성한 팩이든 모든 팩에 다음 한도를 적용합니다:

| 필드 | 한도 |
| --- | --- |
| `identifier` | 200자 |
| `name`, `description`, 각 섹션 `summary`, 각 `applies_to` / `triggers` / `requires` 항목 | 240자 |
| `overview`, 각 섹션 `body` | 8,000자 |
| `applies_to`, `triggers`, `requires` | 각각 32개 항목 |
| `sections` | 64개, 각 `id` 120자 |
| `starters` | 48개, 각 `id` 120자, `label` 80자, `summary` 200자, `category` 40자, `prompt` 1,200자 |
| starter 하나의 `variables` | 8개, 각 `key` 40자, `label` 80자, `placeholder` 120자 |

이 처리는 모두 알림 없이 이루어집니다. 한도를 넘는 텍스트는 잘리고, 개수를 넘는 항목은 버려지며, `id`가 없는 섹션과 `id`, `label`, `prompt` 중 하나라도 없는 starter도 버려집니다. 두 섹션이나 두 starter가 같은 `id`를 쓰면 첫 번째만 남습니다.

**게시하기 전에 starter를 확인하세요.** 로더는 starter의 프롬프트와 `variables`를 대조하지 않습니다. starter가 선언하지 않은 `{{key}}`에는 입력칸이 생기지 않고, 빈칸이 모두 비어 있는 줄은 프롬프트에서 빠집니다. 프롬프트가 쓰지 않는 선언된 변수는 분석가가 쓸모없이 채우는 입력칸이 됩니다. 앱은 키가 ASCII 영문자, 숫자, `_`, `.`, `-`로만 이루어진 빈칸만 채웁니다. 참조 팩의 CI인 [`validate.yml`](https://github.com/Vineyard-Intelligence/skillpack-account-identity-pivoting/blob/main/.github/workflows/validate.yml)은 선언되지 않았거나 쓰이지 않는 변수, 중복된 starter `id`, 비어 있거나 앞뒤에 공백이 있거나 40자를 넘는 `category`에서 실패하므로, 이를 자신의 저장소에 복사해 두세요. 레지스트리는 이 검사를 실행하지 않습니다.

### 앱에서 팩 초안 작성하기

프로젝트 소유자는 **Run ▸ Skill packs ▸ New skill pack**으로, 또는 설치된 팩을 **Make a copy**해서 Vineyard 안에서 팩을 작성하고 **Export JSON**으로 다운로드할 수도 있습니다([프로젝트 자체 Skill Pack](../guide/skillpacks.md#custom-skill-packs) 참조). 내보낸 파일은 이 페이지에서 설명하는 것과 같은 문서입니다. 게시하기 전에 편집기의 **Details**나 파일에서 `local.project.skillpacks.*` 식별자를 자신의 네임스페이스로 바꾸세요. 편집기는 로더가 잘라내거나 버릴 내용과 함께 알 수 없는 필드, 선언되지 않았거나 쓰이지 않는 starter 변수를 거부하므로, 편집기에서 저장되는 팩은 작성한 그대로 에이전트에게 전달됩니다.

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

`applies_to`, `section_count`, `requires`는 찾아보기 페이지가 모든 문서를 가져오지 않고도 렌더링할 수 있도록 작성자가 항목에 직접 적습니다. CI는 고정된 문서에서 `section_count`를 다시 계산해 불일치하면 거부하고, 모든 `requires` 식별자가 카탈로그의 살아 있는 팩인지 확인합니다. `applies_to`는 검사하지 않으므로 문서에서 그대로 옮겨 적으세요. 전체 워크플로 — 포크, 불변 커밋 `ref` 고정, `packs/<identifier>.json` 파일 하나 추가, PR 열기 —는 [레지스트리에 배포하기](publishing.md)와 동일합니다.

## 다음 / 함께 보기

- [레지스트리에 배포하기](publishing.md) — 공유되는 포크 앤 PR 워크플로
- [배포](distribution.md) — 고정 ref와 가져온 문서를 검증하는 방식
- [Skill Pack 사용하기 (사용자 가이드)](../guide/skillpacks.md) — 팩 설치 및 사용
- [SDK 및 호스트 컨텍스트](sdk.md) — 스킬의 단계가 호출하는 플러그인 표면
