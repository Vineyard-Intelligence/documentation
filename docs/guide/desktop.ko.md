# 데스크탑 앱

macOS, Windows, Linux용 Vineyard 데스크탑 앱은 [app.vineyard.run](https://app.vineyard.run)과 같은 앱을 메뉴 막대가 있는 별도의 창에서 실행합니다. 계정 없이 [로컬 모드](modes.md)로도 실행할 수 있습니다. 이 페이지에서는 데스크탑 앱이 앱 바깥에 더하는 것, 즉 두 설정 창과 메뉴와 키를 설명합니다.

## Settings와 Desktop Settings {#settings-and-desktop-settings}

데스크탑 앱에는 설정 창이 두 개 있습니다.

- **Settings**는 앱 자체의 설정으로, 브라우저에서 보는 것과 같은 대화상자입니다. 계정, AI 에이전트, 키 등이 여기 있습니다. **⌘,**(Mac)나 **Ctrl+,**(Windows, Linux)로 열고, 메뉴의 **Settings…**나 사이드바 아래쪽의 **Settings**(로그인한 상태에서는 계정 메뉴 안)로도 엽니다. 데스크탑 앱에서는 입력란에 글을 쓰는 중에도 이 키가 동작합니다. 브라우저에서는 입력란 밖에서만 동작하고, Mac에서는 브라우저가 이 키를 자기 설정에 쓸 수 있습니다. 로그인 화면에는 Settings가 없습니다. 그곳에서 **Settings…**나 이 키를 누르면 Settings가 어디 있는지, 서버 주소가 있는 Desktop Settings는 어디 있는지 알려 주는 안내가 나옵니다. Terms, Privacy처럼 앱 바깥에 있는 페이지에도 Settings가 없어서, 그곳에서는 Settings가 어디 있는지 알려 주는 안내가 나옵니다. 앱을 실행한 직후 세션을 이어받는 동안 이 키를 누르면 결과를 기다렸다가, 로그인되어 있으면 Settings를 열고 아니면 로그인 화면의 안내를 보여 줍니다.
- **Desktop Settings**는 데스크탑 앱의 설정입니다. **Backend**(연결할 서버), **Additional trusted origins**, **Updates**, **Key storage**가 있습니다. Mac에서는 **Vineyard → Desktop Settings…**(**⌥⌘,**)로, Windows와 Linux에서는 **File → Desktop Settings…**로 엽니다. Windows와 Linux에는 이 항목의 키가 없습니다.

## 메뉴 {#menus}

| 메뉴 | 들어 있는 것 |
| --- | --- |
| **Vineyard** (Mac) | **About Vineyard**, **Settings…**(⌘,), **Desktop Settings…**(⌥⌘,), **Services**, **Hide Vineyard**(⌘H), **Hide Others**(⌥⌘H), **Show All**, **Quit Vineyard**(⌘Q). |
| **File** | Mac에서는 **Close Window**(⌘W). Windows와 Linux에서는 **Settings…**(Ctrl+,), **Desktop Settings…**, 그리고 Windows의 **Exit**(Alt+F4)나 Linux의 **Quit**(Ctrl+Q). |
| **Edit** | 입력란에서 쓰는 **Undo**, **Redo**, **Cut**, **Copy**, **Paste**, **Delete**, **Select All**. Mac에는 **Paste and Match Style**도 있습니다. 캔버스에 키가 갈 때는 ⌘A와 ⌘C(Ctrl+A와 Ctrl+C)처럼 **Select All**이 모든 노드를 선택하고 **Copy**가 선택한 노드의 라벨을 복사합니다([라벨 복사하기](canvas.md#라벨-복사하기)). 캔버스에는 실행 취소가 없습니다. |
| **View** | **Types**, **Properties**, **Tasks**, **Messages**, **Node table**은 창에 열린 프로젝트의 그 패널을 앱 자체의 **View** 메뉴처럼 보이거나 숨깁니다. 어느 패널이 열려 있는지는 앱의 **View** 메뉴에 체크 표시됩니다([패널](canvas.md#panes)). 프로젝트 밖에서는 패널이 프로젝트에 있다고 알려 주고, 로컬 모드에서 **Messages**는 팀 채팅이 없다고 알려 줍니다. **Actual Size**, **Zoom In**, **Zoom Out**은 그래프가 아니라 창 전체를 확대·축소합니다. **Toggle Full Screen**. |
| **Window** | **Minimize**. Mac에서는 **Zoom**과 **Bring All to Front**, Windows와 Linux에서는 **Close**. |
| **Help** | **Keyboard Shortcuts**(⌘/ 또는 Ctrl+/)는 앱의 단축키 목록을 보여 줍니다. Settings 같은 대화상자가 열려 있거나 창이 닫혀 있으면 대신 [단축키](shortcuts.md) 페이지를 브라우저에서 엽니다. **Documentation**은 이 사이트를 브라우저에서 열고, **Release Notes**는 실행 중인 버전의 릴리스 노트를 GitHub에서 엽니다. **Troubleshooting** 아래에 **Reload**와 **Force Reload**가 있습니다. |

Windows와 Linux의 데스크탑 앱에서 **Ctrl+W**는 아무 일도 하지 않습니다. 앱은 창이 하나뿐이고 그 창이 닫히면 종료되므로, 브라우저에서 탭을 닫던 키가 작업을 끝내 버리기 때문입니다. 창은 **Window → Close**나 Alt+F4로 닫습니다.

**Reload**와 **Force Reload**에는 키가 없어서, 실수로 누른 ⌘R이나 Ctrl+R이 창을 새로 고치지 않습니다. AI 턴이나 플러그인 실행이 진행 중일 때는 새로 고치기 전에 묻습니다([작업 및 실행](tasks.md#ephemeral-by-default)).

## 단축키 {#keyboard-shortcuts}

데스크탑 앱 메뉴의 키를 포함해 앱의 모든 키는 [단축키](shortcuts.md) 페이지 한곳에 있습니다. 데스크탑
앱에만 있는 메뉴의 키는 그 페이지의 [데스크탑 앱에서](shortcuts.md#desktop-app)에 있습니다.

## 다음 / 함께 보기

- [로그인 모드와 로컬 모드](modes.md) — 데스크탑 앱에만 있는 로컬 모드와 두 모드 사이의 전환
- [캔버스](canvas.md) — 앱 자체의 메뉴 막대, 우클릭 메뉴, 패널
- [작업 및 실행](tasks.md) — AI 에이전트와 그 설정, 데스크탑 앱에서 에이전트가 실행할 수 있는 명령
