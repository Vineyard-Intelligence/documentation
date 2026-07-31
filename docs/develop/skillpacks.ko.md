# Skill Pack

Skill Pack은 마켓플레이스 콘텐츠의 세 번째 종류입니다 — Plugin Pack(수집기)과 Type Pack(어휘)에 이어서요. 그것은 **텍스트**입니다: 에이전트가 참고할 수 있는 재사용 가능한 조사 *플레이북*이며, 절대 실행되는 코드가 아닙니다. 이 페이지는 문서 형식, 안전 모델, 그리고 팩이 레지스트리에 도달하는 방법을 다룹니다.

> **Skill Pack은 코드를 실행하지 않으며 자체적으로 권한을 요청하지 않습니다.** 에이전트가 따르는 지침으로, `list_skills` / `load_skill` 툴을 통해 제공됩니다. 유일한 의존성 표면은 단계가 호출하는 Plugin Pack이며, `requires`에 선언됩니다.

## 문서

Skill Pack은 단일 JSON 문서로, `content_type: "vineyard:skillpack"`이며, 플러그인 매니페스트나 Type Pack과 정확히 같은 방식으로 작성자 저장소의 고정 커밋에 존재합니다:

```jsonc
{
  "content_type": "vineyard:skillpack",
  "identifier": "run.vineyard.skillpacks.account_pivot",
  "name": "Account & identity pivoting",
  "description": "Turn one account or handle into the person's other accounts, and know when a shared username is NOT the same person.",
  "author": "vineyard-run",
  "version": "1.3.0",

  "applies_to": ["identity.handle", "identity.user_account", "identity.email_address", "identity.person"],
  "triggers": ["account", "username", "handle", "same person", "sock puppet", "계정", "핸들"],

  "requires": ["run.vineyard.pluginpacks.whatsmyname"],

  "overview": "Account & identity pivoting — from one handle or email to the accounts behind the same person…\nUse this when… Load a section: \"handles\" — …, \"corroborate\" — …",

  "sections": [
    { "id": "handles", "summary": "Spreading from one username across platforms.", "body": "From a USERNAME:\n- Run the account-search plugin…" }
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
| `identifier` | Reverse-DNS 기본 키, `run.vineyard.skillpacks.<name>`. 매니페스트 하나 = 식별자 하나(플러그인 팩과 달리 멤버 확장 없음). |
| `applies_to` | 플레이북이 다루는 노드 타입(`category.name`) — 언제 관련이 있는지에 대한 힌트. |
| `triggers` | 관련성에 대한 키워드 힌트, 분석가의 요청과 매칭됩니다. |
| `requires` | 플레이북의 단계가 호출하는 플러그인 팩 식별자. **모두 프로젝트에 설치된 경우에만 스킬을 사용할 수 있습니다**(마켓플레이스는 설치를 이에 따라 제한하고, 런타임도 같은 사실로 가용성을 제한합니다). 비어 있거나 없으면 = 플레이북이 내장 그래프 툴만 사용합니다. |
| `overview` | 라우터이지 절차가 아닙니다: 팩이 무엇을 위한 것인지, 어떤 섹션이 있는지. 에이전트가 먼저 읽습니다. |
| `sections` | 실제 단계. 각각 `id`(경로가 아닌 `load_skill(id, section)`으로 주소 지정 — 매니페스트가 허용 목록), 한 줄 `summary`(전부 로드하지 않고 섹션을 고를 수 있게), `body`를 가집니다. 요청 시 로드 — 점진적 공개. |
| `starters` | 실행을 시작하는 준비된 방법: `{{key}}` 빈칸이 있는 `prompt`와 `variables` 목록(key, label, placeholder, `required`, `multiline`). `category`가 선택기에서 그룹화하며, 첫 등장 순서로 렌더링됩니다. |

### 좋은 섹션 작성하기

- **overview는 라우터입니다.** 팩이 무엇을 위한 것인지, 언제 사용하는지, 어떤 상황에서 어떤 섹션을 로드할지 에이전트에게 말하세요. 짧게 유지하세요 — 세부 내용은 섹션에 있습니다.
- **섹션 하나, 상황 하나.** 섹션은 독립적으로 로드 가능해야 합니다: 에이전트는 다른 섹션 *대신* 이것을 읽을 것이기 때문입니다.
- **증거가 어떻게 생겼는지 말하세요.** 가장 좋은 플레이북은 무엇이 두 대상을 실제로 연결하는지(공유된 검증된 이메일, 재사용된 인증서)와 그렇지 않은 것(흔한 핸들, 공유 호스팅)을 명시하고 — 에이전트에게 증거가 담지 못하는 결론이 아닌, 증거에 대한 라벨로 엣지를 붙이라고 지시합니다.

## 안전 모델

스킬 텍스트는 툴 결과로 도착하는 **제3자 콘텐츠**이므로, 다른 신뢰할 수 없는 툴 출력처럼 처리됩니다:

- **스킬은 프롬프트에 주입되지 않습니다.** 툴을 통해 제공되고 요청 시 읽히므로, 사용하지 않을 때 비용이 들지 않고, 툴 출력을 기본적으로 신뢰하지 않는 기존 신뢰 경계 내부에 도착합니다.
- **로드된 모든 본문에는 프레임이 감싸집니다.** 에이전트가 섹션을 읽을 때, 호스트는 텍스트가 *콘텐츠이지 명령이 아님*을 명시하는 프레임을 앞에 붙입니다: 어떤 부분이 규칙을 무시하거나, 분석가의 검토를 건너뛰거나, 신뢰할 수 없는 텍스트를 명령처럼 다루라고 말한다면, 모델은 거부하고 그렇게 말해야 합니다. 앱의 안전에 중요한 프롬프트 블록은 항상 플레이북보다 우선합니다.
- **원격 필드는 경계에서 정화됩니다.** 라벨은 한 줄로 접히고 제어 문자를 제거합니다(매니페스트가 설명에 두 번째로 보이는 "SYSTEM: …" 줄을 밀반입할 수 없도록); 섹션 본문은 제한되며(~8,000자) 개행을 제외한 제어 문자를 제거합니다; starter는 단단히 제한됩니다(~1,200자 — starter는 문단이지 문서가 아닙니다).
- **턴당 로드 예산이 컨텍스트를 제한합니다.** 각 턴은 최대 12개의 (스킬, 섹션) 문서와 총 ~40,000자를 읽을 수 있습니다. 반복은 본문을 재전송하지 않고 장부에서 답변됩니다 — 모든 포인터를 따라가는 모델은 턴 전체를 문서를 읽는 데 쓸 수 없습니다.
- **감사 추적이 무엇을 참고했는지 기록합니다.** 어떤 스킬 **리비전**(고정 커밋)이 결론에 영향을 주었는지는 프로젝트의 추가 전용 감사 로그에 보고됩니다 — 식별자, 섹션, 커밋 SHA. 채팅 콘텐츠는 브라우저를 떠나지 않습니다; *참고된 문서*만 기록됩니다.

## 레지스트리에 게시

Skill Pack은 Plugin Pack 및 Type Pack과 정확히 같은 방식으로 배포됩니다: 문서는 **귀하의** 작성자 저장소에 남아 있고, 레지스트리는 `community-skillpacks.json`에 단일 간소화 항목을 보유합니다:

```json
{
  "identifier": "run.vineyard.skillpacks.account_pivot",
  "content_type": "vineyard:skillpack",
  "name": "Account & identity pivoting",
  "author": "vineyard-run",
  "description": "Turn one account or handle into the person's other accounts, and know when a shared username is NOT the same person.",
  "repo": "Vineyard-Intelligence/skillpack-account-identity-pivoting",
  "ref": "44305008e4ec16ec0d0d24595ffa993c0b6b6cb5",
  "path": "skillpacks/account-pivot.skill.json",
  "version": "1.2.0",
  "applies_to": ["identity.handle", "identity.user_account", "identity.email_address", "identity.person"],
  "section_count": 2,
  "requires": ["run.vineyard.pluginpacks.whatsmyname"]
}
```

`applies_to`, `section_count`, `requires` 필드는 병합 시 **파생**되어, 찾아보기 페이지가 모든 문서를 가져오지 않고도 렌더링할 수 있습니다. 전체 워크플로 — 포크, 불변 커밋 `ref` 고정, 항목 하나 추가, `VineyardReviewBot`을 위한 PR 열기 —는 [레지스트리에 게시](publishing.md)와 동일합니다.

## 다음 / 함께 보기

- [레지스트리에 게시](publishing.md) — 공유되는 포크 앤 PR 워크플로
- [배포](distribution.md) — 고정 ref, 무결성 해시, 클라이언트 측 캐싱
- [Skill Pack 사용하기 (사용자 가이드)](../guide/skillpacks.md) — 팩 설치 및 사용
- [SDK & 호스트 컨텍스트](sdk.md) — 스킬의 단계가 호출하는 플러그인 표면
