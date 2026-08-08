# Skill Pack 사용하기

Skill Pack은 마켓플레이스 콘텐츠의 세 번째 종류입니다 — Type Pack(어휘)과 Plugin Pack(수집기)에 이어서요. Skill Pack은 **텍스트**입니다: AI 에이전트가 참고할 수 있는 재사용 가능한 조사 *플레이북*이며, 절대 실행되는 코드가 아닙니다.

플러그인이 그래프를 바꾸는 곳에서, Skill Pack은 **에이전트가 일하는 방식을** 바꿉니다: 에이전트가 따르는 지침으로, `list_skills` / `load_skill` 툴을 통해 제공됩니다. 자체적인 권한을 요청하지 않으며 아무것도 실행하지 않습니다.

## Skill Pack이 담고 있는 것

Skill Pack은 세 부분으로 이루어진 단일 문서입니다:

| 부분 | 역할 |
| --- | --- |
| `overview` | 플레이북이 무엇을 위한 것인지, 어떻게 라우팅하는지 — 에이전트가 먼저 읽습니다. |
| `sections` | 실제 단계. **요청 시** 하나씩 로드됩니다(점진적 공개), 그래서 에이전트가 매 턴 전체 플레이북을 불러오지 않습니다. |
| `starters` | 실행을 시작하는 준비된 방법 — 채워 넣을 빈칸(`{{handle}}`, `{{email}}`…)이 있는 프롬프트 템플릿입니다. |

팩은 또한 `applies_to`(관련된 노드 타입)와 `triggers`(키워드 힌트)를 선언하므로, 에이전트와 UI가 언제 관련이 있는지 알 수 있습니다.

## Skill Pack 설치

Skill Pack은 플러그인과 정확히 같은 방식으로 [마켓플레이스](../marketplace.md)에서 설치합니다:

1. 마켓플레이스를 열고 팩을 찾습니다 (예: **Account & identity pivoting**).
2. 팩이 `requires`(단계가 호출하는 플러그인 팩)를 선언하면, 마켓플레이스가 **동시 설치**를 제안합니다 — 이들 없이는 스킬을 사용할 수 없습니다.
3. 한 번 설치하면, 팩은 해당 프로젝트의 에이전트에게 제공됩니다.

!!! note "가용성은 의존성에 따라 결정됩니다"
    Skill Pack은 `requires`의 모든 플러그인 팩이 해당 프로젝트에 설치된 경우에만 **사용 가능**합니다. 나중에 하나를 제거하면, 스킬은 조용히 제공되지 않습니다 — 에이전트는 프로젝트에 없는 플러그인을 호출하는 플레이북으로 안내되지 않습니다.

현재 카탈로그에는 두 개의 Skill Pack이 있습니다:

| Skill Pack | `applies_to` | 요구 사항 | 하는 일 |
| --- | --- | --- | --- |
| **Account & identity pivoting** (`run.vineyard.skillpacks.account_identity_pivot`) | `identity.handle`, `identity.account`, `identity.email_address`, `identity.person` | `run.vineyard.pluginpacks.whatsmyname` | 하나의 계정이나 핸들을 그 사람의 다른 계정들로 확장 — 그리고 공유된 사용자명이 **같은 사람이 아닌** 경우를 구분합니다. |
| **Infrastructure pivoting** (`run.vineyard.skillpacks.infra_pivot`) | `infrastructure.ip_address`, `infrastructure.domain`, `infrastructure.certificate`, `infrastructure.autonomous_system` | — (내장 그래프 툴) | 하나의 지표(IP/도메인/인증서)를 연결된 발자국으로, 검증 가능한 홉씩 확장합니다. |

## Skill Pack 사용

AI 채팅에서 실행을 시작한 후:

- **starter**를 선택하거나 — 팩의 준비된 프롬프트 형태가 카테고리별로 그룹화된 원클릭 옵션으로 나타납니다(`Find accounts`, `Corroborate`, `Report`, …). 빈칸을 채우고 **Use this**를 누르면, 에이전트가 그 형태를 따라 실행을 시작합니다; 또는
- 자신의 말로 그냥 요청합니다 — 에이전트가 관련성을 판단하고(`applies_to` / `triggers`를 통해) 스스로 읽습니다.

실행이 시작되면, 에이전트는 `load_skill` 툴을 통해 팩을 참고합니다: overview를 읽은 다음, 현재 홉에 필요한 **섹션만** 로드합니다. 전체 플레이북을 컨텍스트에 덤프하지 않습니다.

!!! tip "스킬은 지침이지 명령이 아닙니다"
    스킬 텍스트는 **콘텐츠**로 에이전트에게 도착하며, 명령이 아닙니다. 에이전트는 사건에 맞게 조정할 수 있습니다 — 그리고 안전 규칙이 항상 플레이북보다 우선합니다. 팩의 단계를 진행할 수 없다면(예: 프로젝트에 없는 플러그인이 필요한 홉), 에이전트는 메모리로 채우기보다 그 지점을 멈추고 명확히 말합니다.

## 증거는 어디로 가는가

어떤 Skill Pack **리비전**이 결론에 영향을 주었는지는 체인의 관리(chain-of-custody) 문제입니다: 같은 식별자는 팩이 업데이트된 후 다른 텍스트를 가리킵니다. 에이전트가 턴 동안 실제로 읽은 모든 섹션은 — 식별자, 섹션, 제공된 고정 커밋 — 기록되어 프로젝트의 추가 전용 **감사 추적(audit trail)** 에 보고됩니다. 채팅 콘텐츠 자체는 브라우저를 떠나지 않습니다; *어떤 문서가 참고되었는지*만 기록됩니다.

## 다음 / 함께 보기

- [둘러보기 & 설치](installing.md) — 플러그인 및 Type Pack과 공유되는 설치 흐름
- [플러그인 실행](running-plugins.md) — 스킬의 단계가 호출하는 팩을 에이전트가 실행하는 방식
- [Skill Pack 작성](../develop/skillpacks.md) — 자신만의 플레이북 만들기
- [작업](tasks.md) — Skill Pack을 따르는 실행 추적
