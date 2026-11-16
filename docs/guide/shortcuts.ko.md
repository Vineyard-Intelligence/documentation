# 단축키

피벗은 같은 몇 단계의 반복입니다. 노드를 선택하고, 선택을 한 홉 넓히고, 그 선택에 플러그인을
실행하고, 찾은 것을 리뷰합니다. 이 단계마다 키가 있어서 키보드에서 손을 떼지 않고 작업할 수 있습니다.

입력칸에 입력하고 있지 않을 때 **?**나 **⌘/**(Windows와 Linux에서는 **Ctrl+/**)를 누르거나,
사이드바 아래쪽의 **Keyboard shortcuts**를 고르면 Vineyard의 단축키를 볼 수 있습니다. **Settings**
같은 다른 대화상자가 열려 있으면 그 대화상자를 닫기 전에는 이 키가 동작하지 않고, 목록에서 Settings를
열면 목록이 닫힙니다. 목록은 지금 쓰는 컴퓨터의 키로 적힙니다. Mac이면 ⌘로, Windows와 Linux면
Ctrl로 적습니다. 검색칸에 입력하면 목록이 좁혀집니다. 하려는 일(`connect`), 장소(`review`),
키(`esc`, `cmd`, `shift`)로 찾을 수 있습니다. **Esc**는 검색칸을 먼저 비우고, 검색칸이 비어 있으면
목록을 닫습니다.

목록에는 캔버스, 패널과 대화상자, 입력칸에서 Vineyard가 주는 키가 있습니다. 모든 앱에 공통인 키는
뺐습니다. 컨트롤 사이를 옮기는 Tab, 프로젝트 이름이나 초대처럼 입력칸 하나로 된 양식의 Enter,
버튼의 Enter와 Space, 열린 메뉴나 드롭다운의 화살표 키입니다.

## 커맨드 팔레트 {#command-palette}

**⌘K**(Windows와 Linux에서는 **Ctrl+K**)를 누르거나 사이드바의 **Command palette**를 고르고, 하려는
일을 입력합니다. 입력칸에 입력하는 중에도 열립니다. 팔레트는 프로젝트의 메뉴 바, 캔버스 도구 모음,
우클릭 메뉴에 있는 명령을 메뉴에 적힌 이름으로 찾습니다. `export`는 **Export graph (JSON)**을,
`grid`는 **Grid**를 찾습니다. 두 메뉴가 한 명령을 다르게 부르면 어느 이름으로도 찾습니다.
`merge selected`는 Edit 메뉴의 **Merge selected nodes…**인 **Merge nodes…**를 찾습니다. 숨기기와 저장된 뷰의
컨트롤, 곧 도구 모음의 **Filter**와 View 메뉴의 **Show all hidden**, **Saved views**는 팔레트에
없습니다. 명령 말고도 다음을 찾을 수 있습니다.

- **Settings**의 각 섹션: `keys`는 **Settings: Keys & Secrets**를 찾습니다.
- 레이아웃: **Layout: Stress (distance-preserving)** 같은 이름이며, 지금 쓰는 레이아웃에 체크 표시가
  있습니다.
- 설치된 타입의 새 노드: **Add node: Domain** 같은 이름이며, [Types 패널](typepacks.md)에서처럼
  노드를 만들고 선택합니다.
- 실행할 플러그인: **Run WHOIS on the selection** 같은 이름이며, 그 플러그인이 읽는 노드가 선택되어
  있을 때 나옵니다. 노드를 읽지 않는 플러그인은 항상 나옵니다. 고르면 그 플러그인에 체크한 채로
  **Run plugins**가 열리고(패널이 이미 열려 있었다면 그 플러그인만 체크됩니다), **Run**을 누르기
  전에는 아무것도 실행되지 않습니다.
- **Run the last plugins again on the selection**: 프로젝트에서 플러그인을 실행한 뒤에 나옵니다
  ([플러그인 실행](running-plugins.md#launch-surfaces) 참조).
- 스킬팩과 그 스타터: **Infrastructure pivoting: Map the infrastructure** 같은 이름입니다. 채울 칸이
  없는 스타터는 새 AI 에이전트 대화의 입력칸에 초안을 넣고, 보내기는 직접 합니다. 채울 칸이 있는
  스타터는 스킬팩을 그 스타터의 양식으로 엽니다.
- 노드: 그래프 검색과 같은 규칙으로 노드의 아무 값으로나 찾습니다. 노드는 명령 뒤에 나오고, 고르면
  그 노드를 선택하고 가운데로 옮깁니다.

아무것도 입력하지 않으면 최근에 실행한 명령이 먼저 나옵니다. 팔레트는 이 기기에서 마지막 여덟 개를
기억하며, 노드는 기억하지 않습니다. **↓**와 **↑**로 옮기고, **Enter**로 강조된 명령을 실행하고,
**Esc**로 팔레트를 닫습니다. 한글 음절을 끝내는 Enter는 음절만 끝냅니다. 지금 실행할 수 없는 명령은
메뉴와 같은 이유와 함께 흐리게 나옵니다. 예를 들면 *Select something first to expand from*입니다.
되돌릴 수 없는 명령은 Enter 한 번으로 실행되지 않습니다. **Delete**와 **Disconnect all**은 우클릭
메뉴에서와 같은 확인 창을 열고, **Stop the AI agent's turn**은 먼저 묻습니다. 이때 **Cancel**에
포커스가 있고, Esc를 누르면 목록으로 돌아갑니다. 단축키 목록과 마찬가지로 **Settings** 같은 다른
대화상자가 열려 있으면 팔레트가 열리지 않고, Settings를 열면 팔레트가 닫힙니다.

## 키가 보이는 곳 {#shown-keys}

키를 이 페이지에서 외울 필요는 없습니다. 키로도 할 수 있는 메뉴 항목은 오른쪽에 그 키를 보여 주고,
툴바 버튼은 툴팁 끝에 키를 적습니다. 예를 들면 *Fit view · F*입니다. 키는 쓰는 컴퓨터에 맞게
적힙니다. Mac에서는 **⌘A**, Windows와 Linux에서는 **Ctrl+A**입니다. **Layout** 메뉴에서는 지금 쓰는
레이아웃 옆에 **⇧L**(**Shift+L**)이 보입니다. 그 레이아웃을 다시 고르는 것이 이 키가 하는 일이기
때문입니다.

- 우클릭 메뉴의 **Connect to…**는 키와 함께, 한 번에 연결하는 클릭(**⌘-클릭**, Windows와 Linux에서는
  **Ctrl-클릭**)도 보여 줍니다.
- 엣지 메뉴에는 키가 보이지 않습니다. 엣지를 우클릭해도 엣지가 선택되지 않는데, 키는 선택에 동작하기
  때문입니다.
- AI 에이전트 대화가 열려 있는 동안에는 툴바와 **Run** 메뉴의 **Ask the AI agent**에 키가 보이지
  않습니다. 이것을 누르면 새 대화가 시작되지만, **A**와 **G** 다음 **A**는 열린 대화의 입력칸으로
  가기 때문입니다.
- 단일 키를 끄면(아래 참조) 메뉴, 툴팁, 커맨드 팔레트에서도 그 키가 사라지고, 여전히 동작하는 키만
  보입니다. 그러면 사이드바 아래쪽의 **Keyboard shortcuts**에도 **?** 대신 **⌘/**(**Ctrl+/**)가
  보입니다.

## 단축키의 동작

- **?**처럼 키 하나로 된 단축키는 입력칸에 입력하고 있지 않을 때만 동작합니다. 입력칸에서는 그
  글자가 입력됩니다. AI 에이전트의 메시지 입력칸은 에이전트가 일하는 동안 잠기므로, 질문을 보낸
  뒤에 이어서 친 키도 입력으로 봅니다. 입력칸이 잠겨 있는 동안에는 얼마나 기다리든, 어딘가를
  클릭하거나 **Tab**으로 옮기기 전에는 단축키로 실행되지 않습니다. **Esc**와 ⌘나 Ctrl을 쓰는
  단축키는 그대로 동작합니다.
- 에이전트가 끝나면 커서가 메시지 입력칸으로 돌아갑니다. 그사이에 다른 곳을 클릭했다면 돌아가지
  않습니다.
- 입력칸에서는 입력칸 자신의 키 말고는 **Esc**, **⌘K**(**Ctrl+K**), 검색칸의 **⌘G**(**Ctrl+G**), AI 에이전트 입력칸의
  **↑**, 리뷰 대화상자의 **⌘↵**(**Ctrl+Enter**)만 동작합니다.
- 캔버스 키는 캔버스에서 동작합니다. 캔버스를 클릭하거나 **G** 다음 **C**를 누르면 캔버스 키가
  캔버스에 동작합니다. 캔버스에 키보드 포커스가 있으면 얇은 파란 테두리가 보입니다. 아직 아무 곳도
  클릭하지 않았을 때도 동작합니다. Properties 패널, 메뉴 바, 떠 있는 패널, 대화상자에서 누른 키나,
  그곳을 클릭한 직후에 누른 키는 그래프를 건드리지 않습니다. Properties 패널에서 값을 편집한 뒤
  **⌫**(**Backspace**)를 눌러도 선택이 지워지지 않습니다.
- **Esc**는 한 번 누를 때마다 앞에 있는 것부터 하나씩 닫고, 더 닫을 것이 없으면 선택을 해제합니다.
  메뉴 바의 메뉴(**Project**, **Edit**, **View**, **Run**)가 열려 있으면 그 뒤의 패널보다 먼저 그
  메뉴만 닫힙니다. 순서는 [우클릭 메뉴](canvas.md#right-click-menus)에 있습니다.
- **⌘C**(**Ctrl+C**)는 입력칸에 입력하고 있지 않고, 화면에 선택된 텍스트가 없고, 대화상자가 열려 있지
  않을 때만 선택한 노드의 라벨을 복사합니다. 그 밖에는 원래 복사하던 것을 복사합니다.
  [라벨 복사하기](canvas.md#라벨-복사하기)를 참조하세요.
- 한글 입력 소스에서도 키는 키보드의 자리로 동작합니다. ㄹ을 입력하는 키가 **F**이고, **G** 다음
  **A**는 ㅎ을 입력하는 키 다음 ㅁ을 입력하는 키입니다.
- 입력 소스를 바꾸는 키는 단축키로 쓰지 않으므로, 한글을 입력하다가 단축키가 실행되는 일은 없습니다.
  한/영, 한자, Caps Lock, Shift+Space, 그리고 Ctrl이나 ⌘와 Space의 조합입니다. 한글 음절을 끝내는
  키는 음절만 끝냅니다.
- **Settings → General → Keyboard → Single-key shortcuts**를 끄면 글자 하나로 된 단축키(F, N, /, [
  등)와 **G** 다음 글자 키가 모두 꺼집니다. 받아쓰기를 쓸 때 등에 끄세요. **Esc**, **Enter**, 화살표
  키, **Delete**, ⌘나 Ctrl을 쓰는 단축키는 켜진 채로 남습니다. 이 설정은 **This device only**입니다.
- 브라우저 탭에서는 Vineyard보다 브라우저가 먼저 가져가는 키가 있습니다. Mac의 **⌘N**, **⌘T**,
  **⌘W**, **⌘Q**(다른 운영체제에서는 **Ctrl+N**, **Ctrl+T**, **Ctrl+W**, **Ctrl+Q**) 같은 키이며,
  이런 키는 단축키로 쓰지 않습니다. 새로고침, 주소창, 페이지 확대(Mac의 **⌘+**, **⌘-**, **⌘0**),
  개발자 도구도 마찬가지입니다. Mac에서 **⌘,**는 Vineyard 대신 브라우저 자체의 설정을 열 수
  있습니다. **Settings**는 사이드바에도 있습니다.

## 기본 키가 하는 일

- **검색.** **⌘F**(**Ctrl+F**)나 **/**는 **Search entities…**로 이동합니다. **⌘G** / **⇧⌘G**
  (**Ctrl+G** / **Ctrl+Shift+G**)는 다음 / 이전 검색 결과로 이동해 선택하고 가운데에 놓습니다.
  검색칸에 무언가 입력되어 있을 때 동작하며, 검색칸 안에서도, 다른 입력칸 밖이면 어디서나 됩니다.
- **이동.** **G**를 누르고 1초 안에 두 번째 키를 누릅니다. **G** 다음 **A**는 AI 에이전트의 입력칸으로
  가고, 패널이 닫혀 있으면 새 대화를 엽니다. **G** 다음 **P**는 Properties 패널의 첫 칸으로 가며,
  패널이 **Document**나 **JSON** 보기면 **Table**로 바꿉니다. **G** 다음 **T**는 Types 패널의
  검색칸으로 갑니다. 패널이 아이콘으로 접혀 있으면 첫 타입으로 갑니다. **G** 다음 **M**은
  **Project** 메뉴에 Marketplace 항목이 있을 때 Marketplace를 엽니다.
- **보기.** **F**는 **Fit view**처럼 그래프 전체를 화면에 맞추고, **⇧F**(**Shift+F**)는 선택을 화면에
  맞춥니다. 노드 하나는 150%로 가운데에 놓습니다. **=**나 **+**, **-**는 툴바 버튼처럼 확대, 축소하며,
  누르고 있으면 계속됩니다. **0**은 100%로 맞춥니다. 화살표 키는 보기를 옮기고, **Shift**를 함께
  누르면 더 크게 옮깁니다. **L**은 **Layout** 메뉴를 엽니다. **↓**로 첫 레이아웃에 가고 **Enter**로
  고릅니다. **⇧L**(**Shift+L**)은 지금 레이아웃으로 다시 배치하며, 노드를 놓아 둔 위치는 풀립니다.
- **선택.** **⌘A**(**Ctrl+A**)는 모든 노드를 선택합니다. **N**은 연결된 이웃까지, **[** / **]**는
  들어오는 쪽 / 나가는 쪽으로 선택을 넓히며, 누를 때마다 한 홉씩입니다. **Invert selection**,
  **Select isolated nodes**, **Clear selection**에는 따로 키가 없습니다. 선택 해제는 **Esc**입니다.
- **선택한 대상.** **R**은 선택에 대해 **Run plugins**를 엽니다. 아무것도 선택하지 않았으면 프로젝트
  전체에 대해 엽니다. **A**는 선택에 대해 AI 에이전트에게 묻습니다. 질문이 채워진 새 대화가 열리고,
  질문은 보내지 않습니다. 대화가 이미 열려 있으면 새 대화 대신 그 입력칸으로 가고, 입력칸이 비어 있을
  때만 질문을 채우므로 쓰던 질문은 그대로 남습니다. **C**는 **Connect to…**입니다. 선택을 연결할 노드를
  클릭합니다. **Enter**나 **F2**는 선택한 노드의 값을 Properties 패널에서 편집합니다. 노드 라벨이 보여
  주는 칸이고, 엣지는 relation 칸입니다. 패널이 **Document**나 **JSON** 보기면 **Table**로 바뀌고,
  패널의 찾기 칸이나 **Hide empty**가 그 칸을 빼더라도 칸이 열립니다. **⌫**나 **⌦**(Windows와
  Linux에서는 **Delete**나 **Backspace**)는 선택을 삭제합니다. **Delete (N)**과 같은 확인 창이 **Cancel**에 포커스를 둔 채
  열립니다. **Duplicate**와 에이전트 턴 중지에는 키가 없습니다. 잘못 친 키로 일어나지 않게 하기
  위해서입니다.
- **AI 에이전트 패널.** 입력칸이 비어 있을 때 **↑**는 마지막으로 한 질문을 다시 불러와 고쳐서 보낼 수
  있게 합니다. **Esc**는 Setup 서랍을, 그다음 패널을 닫습니다. 실행 중인 턴은 계속됩니다([작업 및
  실행](tasks.md#closing-and-deleting-a-conversation) 참조).
- **리뷰 대화상자.** **/**는 **Filter by keyword**로 이동합니다. **⌘↵**(**Ctrl+Enter**)는 체크한 변경을
  **Apply**합니다. **Why reject?** 입력칸에서도 동작하지만, **Apply** 버튼이 있고 적용할 것이 있을
  때만 동작합니다. **Esc**는 **Apply**를 누른 직후처럼 아무것에도 포커스가 없을 때도 대화상자를
  닫으며, 실행과 체크 상태는 남습니다([플러그인 실행](running-plugins.md#reviewing-a-runs-changes)
  참조).
- **Properties 패널.** **Tab**과 **Shift+Tab**은 다음 칸과 이전 칸으로 옮깁니다. 숫자와 날짜를 포함한
  한 줄 입력칸에서 **Enter**는 저장하고 **Esc**는 저장된 값으로 되돌립니다
  ([값 편집하기](properties.md#editing-a-value) 참조).

## 전체 단축키

아래 목록은 앱 안의 목록과 같은 표에서 생성되며, 각 동작을 앱에 표시되는 영어 이름으로 적습니다.

<!-- shortcuts:start -->
<!-- Generated from lib/keymap.ts in the frontend repository by `npm run docs:shortcuts`. Change the keymap, not this list. -->

### Everywhere

| 동작 | Mac | Windows·Linux |
| --- | --- | --- |
| Close what is in front<br><small>One thing per press: a menu, a waiting Connect to…, the panel in front, and last the selection.</small> | <kbd>Esc</kbd> | <kbd>Esc</kbd> |
| Open settings<br><small>A Mac browser may keep this key for its own settings; Settings is also in the sidebar.</small> | <kbd>⌘</kbd><kbd>,</kbd> | <kbd>Ctrl</kbd>+<kbd>,</kbd> |
| Search the graph<br><small>In a text field the key is the browser’s own find.</small> | <kbd>⌘</kbd><kbd>F</kbd> / <kbd>/</kbd> | <kbd>Ctrl</kbd>+<kbd>F</kbd> / <kbd>/</kbd> |
| Next search result | <kbd>⌘</kbd><kbd>G</kbd> | <kbd>Ctrl</kbd>+<kbd>G</kbd> |
| Previous search result | <kbd>⇧</kbd><kbd>⌘</kbd><kbd>G</kbd> | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>G</kbd> |
| Show keyboard shortcuts<br><small>Not while you are typing in a field.</small> | <kbd>?</kbd> / <kbd>⌘</kbd><kbd>/</kbd> | <kbd>?</kbd> / <kbd>Ctrl</kbd>+<kbd>/</kbd> |
| Open the command palette<br><small>A menu, toolbar or right-click command, a setting, a plugin or a node, by name.</small> | <kbd>⌘</kbd><kbd>K</kbd> | <kbd>Ctrl</kbd>+<kbd>K</kbd> |
| Go to the AI agent | <kbd>G</kbd> 다음 <kbd>A</kbd> | <kbd>G</kbd> 다음 <kbd>A</kbd> |
| Go to the canvas | <kbd>G</kbd> 다음 <kbd>C</kbd> | <kbd>G</kbd> 다음 <kbd>C</kbd> |
| Go to Properties | <kbd>G</kbd> 다음 <kbd>P</kbd> | <kbd>G</kbd> 다음 <kbd>P</kbd> |
| Go to Types | <kbd>G</kbd> 다음 <kbd>T</kbd> | <kbd>G</kbd> 다음 <kbd>T</kbd> |
| Go to Tasks | <kbd>G</kbd> 다음 <kbd>K</kbd> | <kbd>G</kbd> 다음 <kbd>K</kbd> |
| Project settings… | <kbd>G</kbd> 다음 <kbd>S</kbd> | <kbd>G</kbd> 다음 <kbd>S</kbd> |
| Add from Marketplace… | <kbd>G</kbd> 다음 <kbd>M</kbd> | <kbd>G</kbd> 다음 <kbd>M</kbd> |

### Command palette

| 동작 | Mac | Windows·Linux |
| --- | --- | --- |
| Move through the commands | <kbd>↓</kbd> / <kbd>↑</kbd> | <kbd>↓</kbd> / <kbd>↑</kbd> |
| Run the highlighted command<br><small>One that cannot be undone asks first, or opens the question its menu item opens.</small> | <kbd>↵</kbd> | <kbd>Enter</kbd> |
| Close the palette<br><small>While it asks before a command, Esc goes back to the list.</small> | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

### Canvas

| 동작 | Mac | Windows·Linux |
| --- | --- | --- |
| Fit view | <kbd>F</kbd> | <kbd>F</kbd> |
| Fit the selection to the view | <kbd>⇧</kbd><kbd>F</kbd> | <kbd>Shift</kbd>+<kbd>F</kbd> |
| Zoom in | <kbd>=</kbd> / <kbd>+</kbd> | <kbd>=</kbd> / <kbd>+</kbd> |
| Zoom out | <kbd>-</kbd> | <kbd>-</kbd> |
| Zoom to 100% | <kbd>0</kbd> | <kbd>0</kbd> |
| Pan left | <kbd>←</kbd> / <kbd>⇧</kbd><kbd>←</kbd> | <kbd>←</kbd> / <kbd>Shift</kbd>+<kbd>←</kbd> |
| Pan right | <kbd>→</kbd> / <kbd>⇧</kbd><kbd>→</kbd> | <kbd>→</kbd> / <kbd>Shift</kbd>+<kbd>→</kbd> |
| Pan up | <kbd>↑</kbd> / <kbd>⇧</kbd><kbd>↑</kbd> | <kbd>↑</kbd> / <kbd>Shift</kbd>+<kbd>↑</kbd> |
| Pan down | <kbd>↓</kbd> / <kbd>⇧</kbd><kbd>↓</kbd> | <kbd>↓</kbd> / <kbd>Shift</kbd>+<kbd>↓</kbd> |
| Choose a layout | <kbd>L</kbd> | <kbd>L</kbd> |
| Lay the graph out again | <kbd>⇧</kbd><kbd>L</kbd> | <kbd>Shift</kbd>+<kbd>L</kbd> |
| Select all | <kbd>⌘</kbd><kbd>A</kbd> | <kbd>Ctrl</kbd>+<kbd>A</kbd> |
| Select connected neighbors (1 hop) | <kbd>N</kbd> | <kbd>N</kbd> |
| Select inbound 1-hop nodes | <kbd>[</kbd> | <kbd>[</kbd> |
| Select outbound 1-hop nodes | <kbd>]</kbd> | <kbd>]</kbd> |
| Run plugins… | <kbd>R</kbd> | <kbd>R</kbd> |
| Ask the AI agent about the selection | <kbd>A</kbd> | <kbd>A</kbd> |
| Connect to… | <kbd>C</kbd> | <kbd>C</kbd> |
| Edit the selection’s value | <kbd>↵</kbd> / <kbd>F2</kbd> | <kbd>Enter</kbd> / <kbd>F2</kbd> |
| Delete | <kbd>⌫</kbd> / <kbd>⌦</kbd> | <kbd>Delete</kbd> / <kbd>Backspace</kbd> |
| Copy labels<br><small>Of the selected nodes, one per line, while no text is selected and you are not typing in a field.</small> | <kbd>⌘</kbd><kbd>C</kbd> | <kbd>Ctrl</kbd>+<kbd>C</kbd> |
| Add a node to the selection | <kbd>⇧</kbd>-클릭 | <kbd>Shift</kbd>-클릭 |
| Select the nodes in an area | <kbd>⇧</kbd>-드래그 | <kbd>Shift</kbd>-드래그 |
| Add every node of a type to the selection<br><small>On a row of the legend; a plain click selects only that type.</small> | <kbd>⇧</kbd>-클릭 | <kbd>Shift</kbd>-클릭 |

### Connecting nodes

| 동작 | Mac | Windows·Linux |
| --- | --- | --- |
| Connect the selected nodes to the node you click | <kbd>⌘</kbd>-클릭 | <kbd>Ctrl</kbd>-클릭 |
| Connect the other way, from the node you click to the selection | <kbd>⇧</kbd><kbd>⌘</kbd>-클릭 | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>-클릭 |
| After Connect to…, connect the other way | <kbd>⇧</kbd>-클릭 | <kbd>Shift</kbd>-클릭 |
| Create the links, named as you typed | <kbd>↵</kbd> | <kbd>Enter</kbd> |
| Stop connecting<br><small>While Connect to… waits for its target, or in the box that names the link.</small> | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

### Graph search

| 동작 | Mac | Windows·Linux |
| --- | --- | --- |
| Move through the results | <kbd>↓</kbd> / <kbd>↑</kbd> | <kbd>↓</kbd> / <kbd>↑</kbd> |
| Select the highlighted node and center it | <kbd>↵</kbd> | <kbd>Enter</kbd> |
| Close the results | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

### Review

| 동작 | Mac | Windows·Linux |
| --- | --- | --- |
| Filter the changes by keyword | <kbd>/</kbd> | <kbd>/</kbd> |
| Apply the checked changes | <kbd>⌘</kbd><kbd>↵</kbd> | <kbd>Ctrl</kbd>+<kbd>Enter</kbd> |
| Move to the next or previous change | <kbd>↓</kbd> / <kbd>↑</kbd> | <kbd>↓</kbd> / <kbd>↑</kbd> |
| Turn to the next or previous page | <kbd>→</kbd> / <kbd>←</kbd> | <kbd>→</kbd> / <kbd>←</kbd> |
| Tick or untick the change in focus | <kbd>Space</kbd> | <kbd>Space</kbd> |
| Close, keeping what you ticked and wrote<br><small>In the keyword filter while it holds text, the first Esc empties it.</small> | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

### AI agent

| 동작 | Mac | Windows·Linux |
| --- | --- | --- |
| Bring back your last question | <kbd>↑</kbd> | <kbd>↑</kbd> |
| Send your message | <kbd>↵</kbd> | <kbd>Enter</kbd> |
| Start a new line | <kbd>⇧</kbd><kbd>↵</kbd> | <kbd>Shift</kbd>+<kbd>Enter</kbd> |
| Close the Setup drawer, then the panel<br><small>A running turn goes on.</small> | <kbd>Esc</kbd> | <kbd>Esc</kbd> |
| Save the memory note you are editing | <kbd>⌘</kbd><kbd>↵</kbd> | <kbd>Ctrl</kbd>+<kbd>Enter</kbd> |
| Stop editing the note | <kbd>Esc</kbd> | <kbd>Esc</kbd> |
| Close the new lead without adding it<br><small>In the plan’s Add a lead box.</small> | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

### Team chat

| 동작 | Mac | Windows·Linux |
| --- | --- | --- |
| Complete the highlighted / command<br><small>Tab completes it too. A command already typed out in full is sent instead.</small> | <kbd>↵</kbd> | <kbd>Enter</kbd> |
| Move through the / commands | <kbd>↓</kbd> / <kbd>↑</kbd> | <kbd>↓</kbd> / <kbd>↑</kbd> |
| Hide the / command list | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

### Properties

| 동작 | Mac | Windows·Linux |
| --- | --- | --- |
| Save a one-line value | <kbd>↵</kbd> | <kbd>Enter</kbd> |
| Save long text or code | <kbd>⌘</kbd><kbd>↵</kbd> | <kbd>Ctrl</kbd>+<kbd>Enter</kbd> |
| Put the value back as stored | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

### Node table

| 동작 | Mac | Windows·Linux |
| --- | --- | --- |
| Add a row to the selection, or take it out | <kbd>⌘</kbd>-클릭 | <kbd>Ctrl</kbd>-클릭 |
| Add the rows from the last one you clicked | <kbd>⇧</kbd>-클릭 | <kbd>Shift</kbd>-클릭 |
| Sort by another column as well<br><small>On a column header, after the first column.</small> | <kbd>⇧</kbd>-클릭 | <kbd>Shift</kbd>-클릭 |
| Empty the keyword filter | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

### Resizable panes

| 동작 | Mac | Windows·Linux |
| --- | --- | --- |
| Put a resized pane back to its default height<br><small>With the bar between two panes focused: the AI agent’s plan, the Review dialog’s independent check. A double-click does it too.</small> | <kbd>↵</kbd> | <kbd>Enter</kbd> |
| Move the bar up or down | <kbd>↑</kbd> / <kbd>↓</kbd> | <kbd>↑</kbd> / <kbd>↓</kbd> |
| Make the pane its smallest or largest | <kbd>↖</kbd> / <kbd>↘</kbd> | <kbd>Home</kbd> / <kbd>End</kbd> |

### Skill packs

| 동작 | Mac | Windows·Linux |
| --- | --- | --- |
| Save the skill pack you are editing | <kbd>⌘</kbd><kbd>↵</kbd> | <kbd>Ctrl</kbd>+<kbd>Enter</kbd> |

### Settings

| 동작 | Mac | Windows·Linux |
| --- | --- | --- |
| Save the key or secret you are editing<br><small>In Keys &amp; Secrets.</small> | <kbd>↵</kbd> | <kbd>Enter</kbd> |
| Stop editing it, keeping what was stored | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

### Projects

| 동작 | Mac | Windows·Linux |
| --- | --- | --- |
| Close the search results<br><small>In Search entities across your projects.</small> | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

<!-- shortcuts:end -->

## 데스크탑 앱에서 {#desktop-app}

데스크탑 앱의 메뉴에는 따로 키가 있습니다. 위 목록은 앱 자체의 것이라 브라우저에서도 같으므로, 메뉴의
키는 여기에 적습니다(메뉴는 [데스크탑 앱](desktop.md#menus) 참조).

| Mac | Windows, Linux | 하는 일 |
| --- | --- | --- |
| ⌥⌘, | | Desktop Settings를 엽니다(Mac만. Windows와 Linux에서는 **File → Desktop Settings…**). |
| ⌘Z, ⇧⌘Z | Ctrl+Z, Ctrl+Y(Windows), Ctrl+Shift+Z(Linux) | 입력칸에서 실행 취소, 다시 실행. |
| ⌘X, ⌘C, ⌘V, ⌘A | Ctrl+X, Ctrl+C, Ctrl+V, Ctrl+A | 입력칸에서 잘라내기, 복사, 붙여넣기, 모두 선택. 캔버스에 키가 갈 때 Select All과 Copy는 캔버스에서 그 키가 하는 일, 곧 모든 노드 선택과 선택한 노드의 라벨 복사를 합니다. |
| ⌘0, ⌘+, ⌘- | Ctrl+0, Ctrl++, Ctrl+- | 창 확대·축소: 실제 크기, 확대, 축소. |
| ⌃⌘F | F11 | 전체 화면. |
| ⌘M | Ctrl+M | 최소화. |
| ⌘H, ⌥⌘H | | Vineyard 가리기, 다른 앱 가리기. |
| ⌘W | | 창 닫기(Mac). Vineyard는 계속 실행되며, Dock 아이콘을 누르거나 **Settings…**(⌘,)를 고르면 창이 다시 열립니다. 창이 닫혀 있는 동안 **Help → Keyboard Shortcuts**는 이 페이지를 브라우저에서 엽니다. |
| ⌘Q | Ctrl+Q(Linux), Alt+F4(Windows) | 종료. |

- **⌘,**(**Ctrl+,**)와 **⌘/**(**Ctrl+/**)는 메뉴의 **Settings…**와 **Help → Keyboard Shortcuts**의
  키이기도 해서, 데스크탑 앱에서는 입력칸에 입력하는 중에도 동작합니다.
- **Settings** 같은 대화상자가 열려 있는 동안에는 그 입력칸 밖에서 누른 **⌘/**가 아무 일도 하지 않고,
  **Help → Keyboard Shortcuts**는 목록 대신 이 페이지를 브라우저에서 엽니다.
- Windows와 Linux에서 **Ctrl+W**는 아무 일도 하지 않습니다. 앱은 창이 하나뿐이고 그 창이 닫히면
  종료되기 때문입니다. **Reload**와 **Force Reload**에는 키가 없어서, 실수로 누른 ⌘R이나 Ctrl+R이 창을
  새로 고치지 않습니다.

## 다음 / 함께 보기

- [캔버스](canvas.md) — 검색, 선택, 노드 연결, 노드 표
- [플러그인 실행](running-plugins.md) — 검토 대화상자와 그 키
- [작업 및 실행](tasks.md) — AI 에이전트 패널
- [데스크탑 앱](desktop.md) — 메뉴와 두 설정 창
