# 작업 및 실행

Vineyard에서 직접 시작한 모든 플러그인 실행과 모든 AI 에이전트 대화는 **작업**이며, **Tasks**(작업) 패널에 표시됩니다(대화당 한 행이며, 새 턴마다 그 행이 갱신됩니다).

## 작업의 작동 방식 {#how-tasks-work}

실행 중인 작업에는 **running** 배지와, 플러그인이 보고하는 경우 진행률 표시줄이 표시됩니다.

AI 에이전트가 시작한 플러그인 실행에는 따로 **Tasks** 행이 생기지 않고, 해당 대화의 행에 속합니다. 무언가를 스테이징한 실행은 각각 그 대화 안의 별도 변경 세트가 되어 거기서 검토하게 되며, **Apply automatically**에서는 에이전트 자신의 변경과 마찬가지로 턴이 끝날 때 적용됩니다. 턴을 중지하거나 대화를 삭제하면 그 턴이 시작한 플러그인도 중지됩니다.

## 작업 상태 {#task-states}

| 상태 | 의미 |
| --- | --- |
| `running` | 활발히 실행 중. |
| `succeeded` | 성공적으로 완료됨 (종료). |
| `failed` | 오류로 종료됨 (종료). |
| `cancelled` | 완료 전에 사용자가 중지함 (종료). 중지한 AI 턴은 프로젝트를 다시 열면 대개 `incomplete`로 돌아옵니다. |
| `incomplete` | AI 에이전트 전용 — 에이전트가 끝내기 전에 턴이 멈춤 (종료): 응답받지 못한 도구 호출이 남은 채 끝났거나, 프로젝트를 다시 열었을 때 사용자가 중지했거나 단계를 다 썼거나 앱이 닫혀 끊긴 턴. 그때까지 한 작업은 남아 있으니, 대화를 열고 **Continue**를 누르세요. |

단계를 다 쓴 턴은 `succeeded` 배지로, 사용자가 중지한 턴은 `cancelled` 배지로 프로젝트를 다시 열 때까지 남습니다. 어느 쪽이든 대화에는 멈춘 이유와 **Continue** 버튼이 표시됩니다.

실행 중인 플러그인 작업에는 **Stop**(중지) 버튼이 있습니다(AI 턴은 AI 에이전트 패널에서 중지합니다). 행을 클릭하면 열립니다: AI 작업은 해당 대화를 다시 열고, 플러그인 작업은 검토를 엽니다. 변경 사항이 있는 실행이 끝나면 배지가 대신 검토 상태 — **needs review**(또는 **N to review**), **applied**, **discarded** — 를 보여 주며, 대기 중인 변경 사항이 있는 AI 작업에는 **Review staged changes** 버튼도 표시됩니다. `failed`나 `cancelled` 배지는 검토 상태 대신 표시되므로, 중지한 실행은 변경 사항을 남겼더라도 대개 `cancelled`로 남습니다. 이때도 플러그인 실행의 행을 누르면 남은 변경 사항의 검토가 열리고, AI 작업에는 **Review staged changes** 버튼이 그대로 있습니다. 중지한 플러그인 실행은 다른 프로젝트를 열었다가 돌아오면([기본적으로 임시](#ephemeral-by-default) 참고) **needs review**로 표시됩니다.

<figure class="vy-shot" markdown="span">
  ![Tasks 패널](../assets/guide/tasks-panel.webp){ width="279" loading=lazy }
  <figcaption>검토를 기다리는 플러그인 실행과, 변경이 반영된 AI 대화.</figcaption>
</figure>

!!! note "Stop은 협력적입니다"
    **Stop**은 플러그인이 정상적으로 종료되도록 요청합니다. 약 3초 안에 반환하지 않으면 강제 종료됩니다. 스스로 종료하든 강제 종료되든, 이미 스테이징된 변경 사항은 유지되어 검토할 수 있습니다. 실패한 실행은 다릅니다: 스테이징한 내용을 모두 폐기합니다. 시간 예산(플러그인이 따로 정하지 않으면 10분, 최대 60분)을 넘겨 중지되고 실패로 표시된 실행, 샌드박스나 코드를 불러오지 못한 플러그인, 플러그인 오류로 끝난 실행이 모두 여기에 해당합니다. 부분 결과는 **Stop**으로 중지했을 때만 남습니다.

## 기본적으로 임시 {#ephemeral-by-default}

플러그인 실행 작업은 브라우저 탭 메모리에만 존재합니다. 탭을 닫으면 사라집니다. 다른 프로젝트를 열면 이전 프로젝트의 플러그인 행은 사라지고, 같은 탭에서 그 프로젝트로 돌아오면 아직 검토를 기다리는 플러그인 실행만 다시 나타납니다. AI 대화는 이 기기에 저장되어(프로젝트별) 새로 고침 후에도 **Tasks** 행으로 돌아오므로 다시 열 수 있습니다. 대화는 진행되는 대로 저장되므로, 앱을 닫아 중간에 끊긴 턴도 남아 있고 이어서 진행할 수 있습니다. 검토를 기다리던 스테이징된 변경 사항은 새로 고침 후 남지 않습니다.

플러그인 실행이나 AI 턴이 아직 작업 중일 때 프로젝트를 떠나려 하면 먼저 묻습니다: *Stop the running plugin and leave this project?* 또는 *Stop the agent and leave this project?* **Stay in this project**를 누르면 그대로 머물고, **Stop and leave**를 누르면 작업을 중지하고 떠납니다.

작업 행과 대화 내용은 Vineyard 서버로 전송되지 않으며, 적용된 변경 사항만 프로젝트에 기록됩니다 — 검토에서 직접 적용한 것과, **Apply automatically**에서 에이전트가 적용한 것입니다. 에이전트의 모델 호출은 앱에서 AI 프로바이더로 바로 갑니다. 웹 검색어와 에이전트가 읽는 페이지가 어디로 가는지는 설정에 따라 달라집니다. 기본 설정에서 로그인한 상태라면, 에이전트가 프로젝트 내용으로 작성한 검색어가 Vineyard 서버를 거쳐 Serper와 Google로 갑니다. 브라우저 탭에서는 기본 페이지 읽기 방식이 에이전트가 여는 모든 URL을 리더 서비스 r.jina.ai로 보내며, 데스크탑 앱은 직접 가져오기가 실패할 때만 그렇게 합니다. [웹 검색과 페이지 읽기](#web-search-and-page-reading)를 참고하세요.

!!! tip "AI 대화는 이 기기에, 계정별로 남습니다"
    대화, 메시지, 프로젝트 메모리, 그리고 대화별 세션 스코프와 계획은 이 기기에만 보관되며 서버에 기록되지 않습니다. AI 프로바이더 키·웹 검색 키와 마찬가지로 계정별로 따로 보관됩니다 — 이는 Vineyard 안에서 계정을 분리하는 것이지, 이 컴퓨터를 직접 쓸 수 있는 사람으로부터 보호하는 것은 아닙니다. AI 프로바이더, 모델, 키는 AI 에이전트 패널의 **Setup → Settings**에서 설정하고, 웹 검색 키는 **Settings → AI agent**에 있습니다. 두 종류의 키는 모두 **Settings → Keys & Secrets**(**LLM keys**, **Search engine keys**)에 나열되며, 거기서 보거나(**Show**) 교체하거나(**Replace**) 지울(**Forget**) 수 있습니다. 이 키들은 이 기기에 암호화되지 않은 채 보관됩니다.

## AI 에이전트 패널 {#the-ai-agent-panel}

AI 에이전트 패널 머리글에는 **AI Agent**, 대화 제목, 사용 중인 모델(모델을 누르면 바꿀 수 있습니다)이 표시되고, 그 뒤에 **Setup**, **⋯**, **Close**가 있습니다. **Setup**은 세 탭이 있는 서랍을 엽니다:

- **Session scope** — 이 대화에만 적용되는 경계: **Rules**, **Already allowed**, **Hosts nothing may collect from**(하위 도메인 포함), **Tools ruled out**. 새 채팅은 스코프 없이 시작하므로, 한 대화에서 정한 경계는 같은 프로젝트의 다른 대화에는 적용되지 않습니다. 규칙과 허용 사항은 에이전트에게 전달되고, 호스트와 도구는 코드로도 강제되어 이를 넘는 호출은 거부됩니다([에이전트가 할 수 있는 일](#what-the-agent-can-do) 참고). 스코프가 적용 중이면 **Setup** 버튼에 청록색 점이 표시됩니다.
- **Project memory** — 에이전트의 메모로, 프로젝트의 모든 대화가 함께 씁니다.
- **Settings** — 프로바이더, 모델, 키, 그리고 **Advanced** 아래의 **Temperature**, **Max output tokens**, **Context window**, **Seed**. 여기서 정한 temperature, max output tokens, seed는 이 브라우저에서 **Settings → AI agent**의 기본값보다 우선하며, 비워 두면 그 기본값을 따릅니다. **Context window**는 압축 시점을 계산할 때 기준으로 삼는 컨텍스트 윈도우 크기로, Vineyard가 모델의 윈도우 크기를 모를 때 설정합니다([대화 압축](#conversation-compaction-token-compression) 참고).

**⋯**에는 **Export this conversation as HTML**, **Open the agent's working folder**(데스크탑 앱에서만), **Delete conversation…**이 있습니다. 내보낸 페이지는 그것만으로 읽을 수 있으며, 페이지의 **Save as JSON** 버튼은 같은 기록을 JSON으로 저장합니다.

<figure class="vy-shot" markdown="span">
  ![Setup을 연 AI 에이전트 패널](../assets/guide/ai-setup.webp){ width="800" loading=lazy }
  <figcaption>Setup을 Session scope 탭으로 연 AI 에이전트 패널. 입력창 위의 칩은 다음 메시지의 적용 방식, 명령 실행, follow-up 턴을 보여 줍니다.</figcaption>
</figure>

입력창 위의 칩 한 줄은 다음 메시지가 어떤 설정으로 실행될지 보여 줍니다. 적용 방식 칩과 **Commands** 칩은 이 대화에만 적용되는 메뉴를 열며, **Follow my settings**를 고르면 계정 설정으로 돌아갑니다. **Follow-up**은 다음 메시지 하나에만 적용됩니다:

- 첫 번째 칩은 에이전트의 변경을 누가 적용하는지 보여 줍니다: **Review everything**, **Review everything (AI-assisted)**(같은 검토이되, 에이전트의 제안에 따라 일부 항목이 미리 체크 해제됨), **Apply automatically**. 변경이 검토 없이 반영되는 동안에는 호박색으로 바뀝니다. 이 메뉴에는 **Stop and ask before anything is removed or overwritten**과 **Have an independent check test each inference**도 있습니다. 검증이 실행되면 Review 대화상자에 각 행의 판정을 보여 주는 **Check** 열(*supported*, *weak*, *unresolved*, *refuted*, *not checked*, *check failed*, 에이전트가 철회한 변경은 *dropped*)이 추가되고, 목록 아래의 **Independent check** 창에 포커스된 행의 주장, 그에 대한 반론, 무엇으로 판가름 날지가 표시됩니다. 창의 위쪽 가장자리를 끌어 크기를 조절할 수 있습니다.
- **Commands**(데스크탑 앱에서만) — 에이전트가 이 컴퓨터에서 명령을 실행해도 되는지: **Do not run commands**, **Ask every time**, **Ask only for risky commands**, **Never ask**. 묻지 않고 명령을 실행하는 동안 칩이 빨간색입니다.
- **Follow-up** — **Keep working after this turn, on its own**을 켜고 턴 수를 정하면, 에이전트가 그 턴 수까지 묻지 않고 이어서 작업합니다. **Apply automatically**가 필요하며, 보낸 메시지 하나가 끝나면 다시 꺼집니다.

<figure class="vy-shot" markdown="span">
  ![Apply 칩 메뉴](../assets/guide/ai-apply-menu.webp){ width="292" loading=lazy }
  <figcaption>첫 번째 칩의 메뉴. 여기서는 Apply automatically에 독립 검증을 켠 상태입니다.</figcaption>
</figure>

그 밖에 알아 둘 것:

- 검토를 기다리는 변경이 있는 동안에는 메시지를 보낼 수 없습니다. 입력창 위 줄에 *N change(s) across M change sets need review*가 **Review**, **Discard all**과 함께 표시됩니다.
- 에이전트가 계획을 세워 작업할 때는 대화 위에 **Plan** 띠가 나타납니다. 단서(lead)를 추가하거나, 우선순위를 올리거나 내리거나, 빼 버릴 수 있습니다. 에이전트는 다음 계획 갱신 때나 다음 턴이 시작될 때 이를 전달받습니다.
- 도구 호출이 여러 번인 턴은 한 줄로 접힙니다. 이 줄은 호출 수를 세고, 에이전트가 읽은 Skill Pack을 책 아이콘 뒤에 표시하며(첫 번째는 이름으로, 나머지는 **+N**), 메모·오류·스테이징된 변경을 알려 줍니다. 누르면 펼쳐집니다.
- 답변 속 이미지는 설명과 주소로만 표시되며, 불러오지 않습니다.
- 턴이 실행되는 동안 대화와 입력창 사이의 막대가 지금 하는 일을 보여 주고 경과 시간을 초 단위로 셉니다. *Planning…*, *Checking staged changes…*, *Applying staged changes…*, *Finishing the turn…*처럼 앱이 직접 알리는 단계에서는 청록색이고, 그 밖의 *Thinking…*, *Running*과 도구 이름, *Working…*에서는 보라색입니다.
- **Show token usage**를 켜면(**Settings → AI agent**) 각 답변 아래에 그 턴이 쓴 토큰이 표시됩니다.

<figure class="vy-shot" markdown="span">
  ![실행 중인 AI 에이전트 패널](../assets/guide/ai-agent-panel.webp){ width="800" loading=lazy }
  <figcaption>실행 중인 화면: 위쪽의 Plan, 자동 follow-up 턴, 에이전트가 읽은 스킬팩 이름이 붙은 채 한 줄로 접힌 도구 호출 18개.</figcaption>
</figure>

## 대화 닫기와 삭제 {#closing-and-deleting-a-conversation}

패널을 **닫아도** — 닫기 버튼이든 **Esc**든 — 에이전트는 멈추지 않습니다. 실행 중인 턴은 계속 진행되고 **Tasks**에 행이 남아 있어 거기서 다시 열 수 있습니다. **Setup** 서랍이 열려 있으면 Esc나 서랍 바깥 클릭은 서랍부터 닫습니다. 패널을 닫으려면 Esc를 한 번 더 누르세요. Esc는 패널을 향한 것일 때만 패널을 닫습니다. 패널 안에서 입력하거나 작업하는 중에 누른 경우, 또는 마지막으로 패널을 클릭한 직후(예: 턴이 실행 중이라 입력창이 잠긴 동안)입니다. 패널 안의 드롭다운이나 대화상자를 닫는 Esc는 그것만 닫고, 캔버스나 다른 패널에서 누른 Esc는 AI 에이전트 패널에 영향을 주지 않습니다.

대화를 **삭제**하면(**⋯ → Delete conversation…**) 먼저 확인을 묻습니다. **Cancel**에 포커스가 있어서 습관적으로 Enter를 눌러도 삭제되지 않습니다. 확인하면:

- 대화와 그 **Tasks** 행, 세션 스코프, 계획이 이 기기에서 삭제됩니다 — 되돌릴 수 없습니다.
- 에이전트가 아직 작업 중이면 그 턴을, 턴이 시작한 플러그인 실행과 함께 먼저 중지합니다.
- 이 대화에서 제안됐지만 아직 적용하지 않은 변경 세트는 폐기됩니다(확인창에 개수가 표시됩니다). 이미 그래프에 적용한 변경은 그대로 남습니다.
- 패널이 닫힙니다.

삭제할 것이 생기기 전까지 **Delete conversation…**은 회색으로 비활성화되고 *Nothing to delete yet*이라고 표시됩니다.

## 에이전트가 할 수 있는 일 {#what-the-agent-can-do}

에이전트는 도구를 통해 작업하며, 마지막 열의 한도 안에서 스스로 도구를 호출합니다. 이 가운데 호출 전에 사용자에게 물을 수 있는 것은 명령 실행뿐입니다. 그래프에 대한 변경은 모두 적용 방식을 거칩니다: 검토를 위해 스테이징되거나, **Apply automatically**에서는 턴이 끝날 때 적용됩니다. 턴의 도구 호출 줄을 펼치면 각 호출이 도구 이름으로 표시됩니다.

| 할 수 있는 일 | 도구 | 제한 |
| --- | --- | --- |
| 프로젝트 읽기 | `list_node_types`, `graph_stats`, `read_nodes`, `find_nodes`, `get_node`, `read_edges`, `node_neighbors`, `get_selection` | 읽기 전용. |
| 그래프 변경 | `create_node`, `update_node`, `delete_node`, `create_edge`, `update_edge`, `delete_edge`, 그리고 스테이징한 내용을 다루는 `read_staged`, `drop_staged` | 적용 방식(첫 번째 칩, 또는 Settings의 **Apply the agent's changes automatically**)과, 그 위에 더해지는 **Stop and ask before anything is removed or overwritten** 및 독립 검증. |
| 설치된 플러그인 실행 | `list_plugins`, `invoke_plugin` | 실행을 시작할 때 승인을 받지 않으며, 플러그인은 평소처럼 네트워크 요청을 보냅니다. 수집한 내용은 에이전트 자신의 변경과 똑같이 처리됩니다. 이 빌드에서 실행할 수 없는 플러그인(예: 브라우저에서의 데스크탑 전용 플러그인)은 시작할 수 없습니다. 대상이 **Hosts nothing may collect from**의 호스트를 가리키거나 `invoke_plugin`이 **Tools ruled out**에 있으면 실행이 거부됩니다. |
| 웹 검색과 페이지 읽기 | `web_search`, `fetch_page` | **Allow web search**, **Search provider**, **Reading a page**([웹 검색과 페이지 읽기](#web-search-and-page-reading) 참고). 제외된 호스트를 가리키는 검색어나 URL은 거부됩니다. |
| 여러 단서를 동시에 조사 | `investigate_in_parallel`, 그리고 이 턴의 워커 결과와 반박 검증 판정을 다시 불러오는 `read_findings` | 호출당 워커는 최대 5개, 워커마다 최대 8단계. 읽기·수집 도구는 같지만, 자체적인 병렬 조사, 반박 검증, 계획, 메모리 쓰기는 할 수 없습니다. |
| 주장하기 전에 반박 검증 | `challenge_claim` | 별도의 모델 호출로, 턴당 최대 8회이며 **Independent review prompt**에 따라 판단합니다. |
| 계획 유지 | `update_plan`, `prove_goal` | **Plan** 띠에 표시됩니다. |
| 프로젝트 메모리 유지 | `remember`, `consolidate_memory` | **Project memory size**. 자신의 메모를 묻지 않고 합치거나 정리할 수 있습니다. |
| Skill Pack 읽기 | `list_skills`, `load_skill` | 프로젝트에 필요한 플러그인이 설치되어 있고 여기서 실행할 수 있는 Skill Pack이 있을 때만 제공됩니다. |
| 노드 보여 주기 | `select_node` | 보기 전용이며 데이터를 바꾸지 않습니다. |
| 명령 실행 (데스크탑 앱) | `run_command` | **Commands** 칩, 또는 Settings의 **Run commands on this machine**. 사용자 권한으로 프로젝트의 작업 폴더에서 실행되며, 기본 2분(최대 10분)까지 실행됩니다. 제외된 호스트를 가리키는 명령줄은 거부됩니다. |
| 파일 작업 (데스크탑 앱) | `list_files`, `read_file`, `write_file`, `edit_file`, `delete_file` | Commands 설정과 관계없이, 프로젝트의 작업 폴더(**⋯ → Open the agent's working folder**) 안에서만. 파일을 덮어쓰면 이전 내용의 사본이 남고, 삭제하면 파일이 `.vineyard-trash/`로 옮겨집니다. 명령으로 지운 파일은 남지 않습니다. |

모든 턴은 **Step budget**으로 제한됩니다. 턴이 병렬 워커와 `challenge_claim`에 넘기는 모델 호출은 step budget의 다섯 배인 별도 한도에서 차감됩니다. `web_search`, `fetch_page`, `invoke_plugin`, `run_command`, `investigate_in_parallel`은 대화별로 **Tools ruled out**에 넣을 수 있으며, 병렬 워커에도 같은 세션 스코프가 적용됩니다.

## 웹 검색과 페이지 읽기 {#web-search-and-page-reading}

에이전트가 검색하거나 페이지를 열 때 무슨 일이 일어나는지는 **Settings → AI agent**의 아래 설정으로 정합니다. 변경은 다음 질문부터 적용됩니다. 이 선택은 로그인 상태에서는 계정에, 로컬 모드에서는 이 기기에 저장됩니다([로그인 모드와 로컬 모드](modes.md)).

### 웹 검색 허용 {#allow-web-search}

**Allow web search**는 기본값이 켜짐이며, 에이전트에게 `web_search`와 `fetch_page`를 제공합니다. 끄면 에이전트와 병렬 워커 모두 이 두 도구를 갖지 않으므로, 프로젝트의 어떤 내용도 검색 프로바이더나 페이지 리더로 나가지 않습니다. 꺼져 있는 동안 **Search provider**와 **Reading a page**는 흐리게 표시됩니다.

### 검색 프로바이더 {#search-provider}

**Search provider**는 에이전트의 검색어가 어디로 갈지 정합니다. 검색어는 에이전트가 프로젝트 내용으로 작성하므로, 조사 중인 도메인, 계정, 인물이 들어갈 수 있습니다. 목록의 각 옵션에는 누가 검색어를 보는지가 적혀 있고, *no key*, *desktop only*, *unreliable* 배지가 붙습니다. 이 앱에서 쓸 수 없는 옵션은 회색으로 비활성화되며, 로컬 모드에서는 두 서버 옵션에 *needs the Vineyard server*가 표시됩니다.

| 프로바이더 | 검색어가 가는 곳 | 키 | 사용 가능한 곳 |
| --- | --- | --- | --- |
| **Serper, through the Vineyard server** (기본값) | Vineyard 서버(`auxiliary.vineyard.run`) → Serper → Google | 필요 없음(운영자의 키) | 로그인 상태의 브라우저와 데스크탑 앱; 로컬 모드에서는 불가 |
| **Brave, through the Vineyard server** | Vineyard 서버(`auxiliary.vineyard.run`) → Brave | 필요 없음(운영자의 키) | 로그인 상태의 브라우저와 데스크탑 앱; 로컬 모드에서는 불가 |
| **Brave, with your own key** | 데스크탑 앱 → Brave | 필요 | 데스크탑 앱에서만 |
| **Mojeek** | 앱 → Mojeek | 필요 | 브라우저와 데스크탑 앱 |
| **SearXNG (self-hosted)** | 앱 → 설정한 주소 → 그 인스턴스가 모으는 검색 엔진들 | 필요 없음; 인스턴스 주소가 필요하며, 인스턴스가 JSON 출력(`formats: [json]`)을 켜 두고 앱의 호출을 허용하는 CORS 헤더를 보내야 함 | 브라우저와 데스크탑 앱 |
| **Jina** | 앱 → Jina | 선택; 없으면 검색 속도 제한이 심함 | 브라우저와 데스크탑 앱 |
| **Exa** | 앱 → Exa | 필요 | 브라우저와 데스크탑 앱 |
| **Serper, with your own key** | 앱 → Serper → Google | 필요 | 브라우저와 데스크탑 앱 |
| **Kimi (Moonshot), with your own key** | 데스크탑 앱 → Moonshot | 필요(Moonshot API 키, 호출당 과금) | 데스크탑 앱에서만 |
| **DuckDuckGo** | 데스크탑 앱 → DuckDuckGo | 필요 없음 | 데스크탑 앱에서만; DuckDuckGo가 데이터센터·VPN 주소를 CAPTCHA로 막기 때문에 *unreliable*로 표시됨 |

선택한 프로바이더를 지금 환경에서 쓸 수 없으면, 에이전트는 실패하는 대신 다른 프로바이더로 검색합니다:

- 브라우저 탭에서는 데스크탑 전용 선택(계정 설정을 함께 쓰는 데스크탑 앱에서 고른 것)이 **Serper, through the Vineyard server**로 대체됩니다.
- 로컬 모드에서는 기본값을 포함한 서버 옵션이 **DuckDuckGo**로 대체됩니다.

두 서버 옵션은 운영자의 키로 실행되므로 한도가 소진될 수 있습니다. 안정적이어야 하는 작업에는 직접 키를 넣는 프로바이더를 고르세요. 키를 받는 프로바이더를 고르면 목록 아래에 키 입력란이, SearXNG를 고르면 주소 입력란이 나타납니다. 둘 다 **This device only**이며, 입력한 내용은 이 기기에만 남고 Vineyard 서버로 전송되지 않습니다.

### 페이지 읽기 {#reading-a-page}

**Reading a page**는 에이전트가 링크를 텍스트로 바꾸는 방식을 정합니다. 어떤 방식도 키나 로그인이 필요하지 않습니다.

| 방식 | URL이 가는 곳 |
| --- | --- |
| **Whichever works** (기본값) | 데스크탑 앱에서는 Vineyard가 직접 페이지를 가져오고, 실패할 때만 리더 서비스 r.jina.ai로 넘어갑니다. 브라우저 탭에서는 모든 URL이 먼저 r.jina.ai로 가고, 직접 가져오기는 대안으로 쓰입니다. 어느 쪽이든 HTML은 Markdown으로 변환됩니다. |
| **Reader service (r.jina.ai)** | r.jina.ai가 페이지를 가져와 정리된 텍스트를 돌려줍니다. 거의 모든 사이트를 처리하지만, 에이전트가 여는 모든 URL을 보게 됩니다. |
| **Direct, converted to Markdown** | Vineyard가 직접 페이지를 가져와 HTML을 Markdown으로 줄이며, 링크는 유지합니다. 다른 누구도 개입하지 않습니다. 브라우저 탭에서는 교차 출처 요청을 허용하는 사이트에서만 동작하며, 데스크탑 앱에는 이런 제한이 없습니다. |
| **Direct, exactly as served** | 같은 방식으로 가져오되 변환하지 않습니다. HTML 페이지에서는 컨텍스트를 훨씬 많이 쓰며, JSON이나 일반 텍스트 엔드포인트, 또는 제공된 그대로 원본을 보존해야 할 때 씁니다. |

데스크탑 앱의 직접 가져오기는 자기 컴퓨터와 사설 네트워크 주소를 거부하고, 리디렉션을 한 단계씩 직접 따라가므로 **Hosts nothing may collect from**의 호스트로 넘어가는 단계는 요청하기 전에 거부됩니다. 브라우저 탭에서는 제외된 호스트로 리디렉션된 페이지를 받은 뒤에 폐기합니다. 리더 서비스는 자기 서버에서 리디렉션을 따라가므로 이를 검사할 수 없습니다.

### 비표준 포트 허용 {#allow-non-standard-ports}

**Allow non-standard ports**는 **Desktop app** 그룹에 있으며 기본값은 꺼짐입니다. 데스크탑 앱의 직접 가져오기는 80번과 443번 포트만 쓰는데, 이 설정을 켜면 자기 컴퓨터와 사설 네트워크는 계속 막아 둔 채 다른 포트도 쓸 수 있습니다. 리더 서비스와 브라우저 탭에는 영향이 없으며, 웹 검색이 꺼져 있거나 리더 서비스를 골랐으면 회색으로 비활성화됩니다.

## AI 에이전트 설정 {#ai-agent-settings}

**Settings → AI agent**(Cmd/Ctrl+,로 Settings를 엽니다)에는 에이전트의 기본값이 있습니다. 로그인 상태에서는 계정에, 로컬 모드에서는 이 기기에 저장되며, **This device only**로 표시된 항목은 이 브라우저에만 남습니다. 변경은 다음 질문부터 적용됩니다. 대화마다 칩으로 적용 방식과 Commands 설정을 따로 정할 수 있습니다.

**Provider**와 **Model**은 여기서 읽기 전용으로 표시됩니다. AI 에이전트 패널의 **Setup → Settings**에서 고르며, 이 기기에만 보관됩니다.

### 동작 {#behaviour}

| 설정 | 기본값 | 하는 일 |
| --- | --- | --- |
| **Step budget** | 50 (1–200) | 에이전트가 한 턴에서 멈추고 보고하기 전까지 이어 갈 수 있는 단계 수. 병렬 워커와 `challenge_claim`은 이 값의 다섯 배인 별도의 모델 호출 한도를 씁니다. |
| **Project memory size** | 메모 50개 (10–200) | 프로젝트 메모리가 담을 수 있는 메모 수. 가득 차면 에이전트의 기록이 거부되어, 정리해 달라고 사용자에게 요청해야 합니다. 모든 메모는 턴마다 다시 읽힙니다. |
| **Compaction threshold** | 70% (30–75%, 5 단위) | 이전 메시지를 요약하는 시점. [대화 압축](#conversation-compaction-token-compression) 참고. |
| **Allow web search** | 켜짐 | 에이전트에게 검색 도구와 페이지 읽기 도구를 제공합니다. |
| **Show reasoning** | 켜짐 | 프로바이더가 보내 주는 경우, 모델의 사고 과정을 각 답변 아래에 접어서 보여 줍니다. |
| **Show token usage** | 꺼짐 | 각 답변 아래에 그 턴이 쓴 토큰을, 캐시된 비율과 호출별 내역과 함께 보여 줍니다. |
| **Re-arrange the graph after each turn** | 꺼짐 | 에이전트 턴의 변경이 적용될 때마다 현재 레이아웃을 그래프 전체에 다시 실행합니다. |

### 웹 검색 {#web-search}

이 그룹에는 **Search provider**(기본값 **Serper, through the Vineyard server**), 키를 받는 프로바이더의 키 입력란과 SearXNG의 주소 입력란(둘 다 **This device only**), **Reading a page**(기본값 **Whichever works**)가 있습니다. 각 선택이 하는 일은 [웹 검색과 페이지 읽기](#web-search-and-page-reading)를 참고하세요.

### 검토와 적용 {#review-and-apply}

| 설정 | 기본값 | 하는 일 |
| --- | --- | --- |
| **Apply the agent's changes automatically** | **Review everything (AI-assisted)** | **Review everything**(모든 변경이 승인을 기다리며, 모두 체크된 채 열림), **Review everything (AI-assisted)**(같은 검토이되, 에이전트가 권하지 않는 변경은 미리 체크 해제됨), **Apply automatically** 중 하나. |
| **Stop and ask before anything is removed or overwritten** | 켜짐 | **Apply automatically**에서만: 무언가를 삭제하거나, 사용자가 쓴 링크 레이블을 바꾸거나, 이미 값이 있는 필드를 덮어쓰는 변경 세트를 검토를 위해 멈춰 둡니다. |
| **Have an independent check test each inference, and collect what would settle it** | 꺼짐 | 두 번째 모델이 각 관계, 덮어쓰기, 삭제를 검증합니다. 검토 모드에서는 판정을 행에 표시하고, **Apply automatically**에서는 반박된 것을 보류합니다. |
| **Verification limit** | 50 (1–500) | 독립 검증이 한 변경 세트에서 검사하는 최대 항목 수. |

### 데스크탑 앱 {#desktop-app}

| 설정 | 기본값 | 하는 일 |
| --- | --- | --- |
| **Run commands on this machine** | **Ask every time** | **Do not run commands**, **Ask every time**, **Ask only for risky commands**, **Never ask** 중 하나. 브라우저에서 설정하면 다음에 데스크탑 앱을 열 때 그 앱에 적용됩니다. |
| **Allow non-standard ports** | 꺼짐 | 자기 컴퓨터와 사설 네트워크는 계속 막아 둔 채, 데스크탑 앱의 직접 페이지 가져오기가 80번과 443번 외의 포트를 쓸 수 있게 합니다. 웹 검색이 꺼져 있거나 리더 서비스를 골랐으면 회색으로 비활성화됩니다. |

### 생성 {#generation}

**Temperature**(0–2), **Top-p**(0–1), **Maximum output tokens**(최대 1,000,000), **Seed**는 모두 기본적으로 비어 있으며, 이때는 프로바이더의 기본값이 쓰입니다. AI 에이전트 패널의 **Setup → Settings → Advanced**에서 정한 temperature, max output tokens, seed가 그 브라우저에서는 우선합니다.

### 시스템 프롬프트와 독립 검토 프롬프트 {#system-prompt-and-independent-review-prompt}

**System prompt**와 **Independent review prompt** 상자에는 각각 기본 제공 텍스트가 표시됩니다. 수정한 뒤 **Save**를 누르면 그 프롬프트 전체가 교체되고, **Reset to default**를 누르면 기본 제공 텍스트로 돌아갑니다. 시스템 프롬프트(최대 40,000자)는 에이전트가 사용자의 턴에서 따르는 텍스트로, 실행할 때 열린 프로젝트의 타입 카탈로그가 덧붙습니다. 독립 검토 프롬프트(최대 20,000자)는 독립 검증과 `challenge_claim`이 판단 기준으로 삼는 텍스트입니다.

### 이 기기 {#on-this-device}

세 항목 모두 **This device only**입니다: **API keys**(AI 에이전트 패널의 **Setup → Settings**에서 입력), **Self-hosted model address**(직접 운영하는 Ollama 또는 호환 런타임의 주소), **Chat history**(프로젝트별로 보관).

## 대화 압축 (토큰 압축) {#conversation-compaction-token-compression}

긴 AI 대화는 **자동으로** 압축됩니다 — 수동 `/compact` 명령은 없습니다. 대화 히스토리가 모델의 컨텍스트 윈도우를 초과할 것 같으면, Vineyard가 가장 오래된 턴들을 하나의 밀도 높은 요약으로 접어서 에이전트가 프로젝트의 처음부터 끝까지 계속 작업할 수 있게 합니다.

동작 방식:

1. **트리거.** 매 턴이 시작될 때 Vineyard가 요청 크기를 추정해, 지시문·도구·대화를 합친 크기가 **Settings → AI agent → Compaction threshold**에서 정한 모델 컨텍스트 윈도우의 비율(30–75%, 기본값 70%)을 채우게 되면 압축합니다. 턴의 도구 결과와 모델의 답변이 나머지 공간을 써야 하므로, 압축은 윈도우가 가득 차기 **전에** 발생합니다. Vineyard가 모델의 윈도우 크기를 모르면 64,000토큰으로 가정하니, 실제 크기는 **Setup → Settings → Advanced → Context window**에서 설정하세요.
2. **그대로 유지되는 것.** **가장 최근 4턴**(분석가와 에이전트가 두 번 주고받은 분량)은 항상 원문 그대로 유지되어, 바로 앞의 맥락은 절대 요약되지 않습니다.
3. **압축되는 것.** 그보다 오래된 대화는 LLM(설정한 것과 같은 모델 — 그래서 요약이 대화와 같은 언어와 문체로 작성됨)에 보내져 최대 200단어의 밀도 높은 사실 요약을 만들라는 지시를 받습니다: 논의된 지표와 엔티티(도메인, IP, 계정, 해시), 각각에 대해 어떤 근거로 확립된 것, 분석가의 결정, 거부된 것과 그 이유, 미해결 질문. 추측은 추가되지 않습니다.
4. **교체.** 요약은 모델로 보내는 요청 안에서만 `[earlier conversation, summarized]` 프리픽스가 붙은 단일 메시지로 이전 턴들을 대신합니다. 화면에 보이는 대화, 저장된 기록, 내보내기는 모두 그대로 유지됩니다. 압축할 때마다 원래의 이전 턴들을 요약하며, 그 턴들이 바뀌지 않는 동안에는 요약을 재사용합니다.
5. **실패 시 안전.** 요약 호출이 실패하면 히스토리는 **변경 없이** 그대로 남습니다 — 압축은 조용히 조사의 앞부분을 잃어버리지 않습니다. 대신 공급자 오류를 보게 됩니다.

## 협업자 프레즌스 {#collaborator-presence}

프로젝트를 공유하면, 참여자는 프로젝트 제목 옆에서 협업자 배지를 봅니다. 각 배지에는 협업자의 아바타와 색상, 그리고 현재 선택 중인 대상이 표시되며, 배지를 클릭하면 그 위치로 이동합니다. 프레즌스는 프로젝트 참여자에게만 전송됩니다 — 공개 링크로 보는 사람은 명단도 인원수도 보지 못합니다. 로그인한 상태로 공개 링크를 통해 프로젝트를 열면 내 이름, 아바타, 색상이 참여자의 명단에 표시됩니다. 다만 나는 참여자의 명단을 볼 수 없고, 내 선택은 공유되지 않습니다. 실시간 명단은 저장되지 않지만, 감사 로그의 편집을 해당 접속에 귀속할 수 있도록 로그인한 각 연결은 세션(누가, 언제 시작하고 끝났는지)으로 기록됩니다.

## 다음 / 함께 보기

- [플러그인 실행](running-plugins.md) — 실행이 작업이 되는 방식.
- [작업 생명주기 (내부)](../develop/lifecycle.md) — 이러한 상태 뒤의 개발자 대상 메커니즘.
- [시작하기](getting-started.md) — 가이드의 나머지 부분에 대한 오리엔테이션.
