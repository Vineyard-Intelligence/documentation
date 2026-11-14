# 데스크탑 앱

macOS, Windows, Linux용 Vineyard 데스크탑 앱은 [app.vineyard.run](https://app.vineyard.run)과 같은 앱을 메뉴 막대가 있는 별도의 창에서 실행합니다. 계정 없이 [로컬 모드](modes.md)로도 실행할 수 있습니다. 이 페이지에서는 데스크탑 앱이 앱 바깥에 더하는 것, 즉 두 설정 창과 메뉴와 키를 설명합니다.

## Settings와 Desktop Settings {#settings-and-desktop-settings}

데스크탑 앱에는 설정 창이 두 개 있습니다.

- **Settings**는 앱 자체의 설정으로, 브라우저에서 보는 것과 같은 대화상자입니다. 계정, AI 에이전트, 키 등이 여기 있습니다. **⌘,**(Mac)나 **Ctrl+,**(Windows, Linux)로 열고, 메뉴의 **Settings…**나 사이드바 아래쪽의 **Settings**(로그인한 상태에서는 계정 메뉴 안)로도 엽니다. 데스크탑 앱에서는 입력란에 글을 쓰는 중에도 이 키가 동작합니다. 브라우저에서는 입력란 밖에서만 동작하고, Mac에서는 브라우저가 이 키를 자기 설정에 쓸 수 있습니다. 로그인 화면에는 Settings가 없습니다. 그곳에서 **Settings…**나 이 키를 누르면 Settings가 어디 있는지, 서버 주소가 있는 Desktop Settings는 어디 있는지 알려 주는 안내가 나옵니다.
- **Desktop Settings**는 데스크탑 앱의 설정입니다. **Backend**(연결할 서버), **Additional trusted origins**, **Updates**, **Key storage**가 있습니다. Mac에서는 **Vineyard → Desktop Settings…**(**⌥⌘,**)로, Windows와 Linux에서는 **File → Desktop Settings…**로 엽니다. Windows와 Linux에는 이 항목의 키가 없습니다.

## 메뉴 {#menus}

| 메뉴 | 들어 있는 것 |
| --- | --- |
| **Vineyard** (Mac) | **About Vineyard**, **Settings…**(⌘,), **Desktop Settings…**(⌥⌘,), **Services**, **Hide Vineyard**(⌘H), **Hide Others**(⌥⌘H), **Show All**, **Quit Vineyard**(⌘Q). |
| **File** | Mac에서는 **Close Window**(⌘W). Windows와 Linux에서는 **Settings…**(Ctrl+,), **Desktop Settings…**, 그리고 Windows의 **Exit**(Alt+F4)나 Linux의 **Quit**(Ctrl+Q). |
| **Edit** | 입력란에서 쓰는 **Undo**, **Redo**, **Cut**, **Copy**, **Paste**, **Delete**, **Select All**. Mac에는 **Paste and Match Style**도 있습니다. 캔버스에는 실행 취소가 없습니다. |
| **View** | **Actual Size**, **Zoom In**, **Zoom Out**은 그래프가 아니라 창 전체를 확대·축소합니다. **Toggle Full Screen**. |
| **Window** | **Minimize**. Mac에서는 **Zoom**과 **Bring All to Front**, Windows와 Linux에서는 **Close**. |
| **Help** | **Keyboard Shortcuts**(⌘/ 또는 Ctrl+/)는 아래의 [키 목록](#keyboard-shortcuts)을 엽니다. **Documentation**은 이 사이트를 브라우저에서 열고, **Release Notes**는 실행 중인 버전의 릴리스 노트를 GitHub에서 엽니다. **Troubleshooting** 아래에 **Reload**와 **Force Reload**가 있습니다. |

Windows와 Linux의 데스크탑 앱에서 **Ctrl+W**는 아무 일도 하지 않습니다. 앱은 창이 하나뿐이고 그 창이 닫히면 종료되므로, 브라우저에서 탭을 닫던 키가 작업을 끝내 버리기 때문입니다. 창은 **Window → Close**나 Alt+F4로 닫습니다.

**Reload**와 **Force Reload**에는 키가 없어서, 실수로 누른 ⌘R이나 Ctrl+R이 창을 새로 고치지 않습니다. AI 턴이나 플러그인 실행이 진행 중일 때는 새로 고치기 전에 묻습니다([작업 및 실행](tasks.md#ephemeral-by-default)).

## 단축키 {#keyboard-shortcuts}

| Mac | Windows, Linux | 하는 일 |
| --- | --- | --- |
| ⌘, | Ctrl+, | Settings를 엽니다. |
| ⌥⌘, | | Desktop Settings를 엽니다(Mac만. Windows와 Linux에서는 **File → Desktop Settings…**). |
| ⌘F | Ctrl+F | 캔버스의 **Search entities…**로 이동합니다([검색](canvas.md#검색)). |
| Esc | Esc | 맨 앞의 것 하나를 치웁니다. 대상을 기다리는 **Connect to…**, 메뉴, 맨 앞의 패널 순서이고, 마지막에는 선택을 해제합니다([캔버스](canvas.md)의 우클릭 메뉴). |
| ⌘/ | Ctrl+/ | 이 목록을 엽니다(데스크탑 앱). |
| ⌘Z, ⇧⌘Z | Ctrl+Z, Ctrl+Y(Windows), Ctrl+Shift+Z(Linux) | 입력란에서 실행 취소, 다시 실행. |
| ⌘X, ⌘C, ⌘V, ⌘A | Ctrl+X, Ctrl+C, Ctrl+V, Ctrl+A | 입력란에서 잘라내기, 복사, 붙여넣기, 모두 선택. |
| ⌘0, ⌘+, ⌘- | Ctrl+0, Ctrl++, Ctrl+- | 창 확대·축소: 실제 크기, 확대, 축소(데스크탑 앱). |
| ⌃⌘F | F11 | 전체 화면(데스크탑 앱). |
| ⌘M | Ctrl+M | 최소화(데스크탑 앱). |
| ⌘H, ⌥⌘H | | Vineyard 가리기, 다른 앱 가리기. |
| ⌘W | | 창 닫기(Mac). Vineyard는 계속 실행되며, Dock 아이콘을 누르거나 **Settings…**(⌘,)를 고르면 창이 다시 열립니다. 창이 닫혀 있는 동안 **Keyboard Shortcuts**는 이 목록을 브라우저에서 엽니다. |
| ⌘Q | Ctrl+Q(Linux), Alt+F4(Windows) | 종료. |

입력란에는 저마다의 키가 있으며 각 입력란을 설명하는 곳에 적혀 있습니다. AI 에이전트 입력란에서 **Enter**는 메시지를 보내고([작업 및 실행](tasks.md#the-ai-agent-panel)), 검색 결과는 **↑**, **↓**, **Enter**로 고릅니다.

## 다음 / 함께 보기

- [로그인 모드와 로컬 모드](modes.md) — 데스크탑 앱에만 있는 로컬 모드와 두 모드 사이의 전환
- [캔버스](canvas.md) — 앱 자체의 메뉴 막대, 우클릭 메뉴, 패널
- [작업 및 실행](tasks.md) — AI 에이전트와 그 설정, 데스크탑 앱에서 에이전트가 실행할 수 있는 명령
