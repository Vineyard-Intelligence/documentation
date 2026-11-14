# The desktop app

The Vineyard desktop app for macOS, Windows and Linux is the same app as [app.vineyard.run](https://app.vineyard.run), in a window of its own with a menu bar. It can also run in [local mode](modes.md), with no account. This page covers what the desktop app adds around the app: its two settings windows, its menus and its keys.

## Settings and Desktop Settings {#settings-and-desktop-settings}

The desktop app has two settings windows.

- **Settings** is the app's own, the same dialog as in a browser: your account, the AI agent, keys and the rest. **⌘,** (Mac) or **Ctrl+,** (Windows, Linux) opens it, as do **Settings…** in the menu and **Settings** at the bottom of the sidebar (in the account menu when you are signed in). In the desktop app the key works while you are typing in a field too. In a browser it works outside text fields only, and on a Mac the browser may keep it for its own settings. The sign-in screens have no Settings: there, **Settings…** and the key show a note saying where Settings is and where Desktop Settings is, which holds the server address.
- **Desktop Settings** belongs to the desktop app: **Backend** (the server it connects to), **Additional trusted origins**, **Updates** and **Key storage**. Open it with **Vineyard → Desktop Settings…** on a Mac (**⌥⌘,**), or **File → Desktop Settings…** on Windows and Linux, which has no key.

## Menus {#menus}

| Menu | What is in it |
| --- | --- |
| **Vineyard** (Mac) | **About Vineyard**, **Settings…** (⌘,), **Desktop Settings…** (⌥⌘,), **Services**, **Hide Vineyard** (⌘H), **Hide Others** (⌥⌘H), **Show All** and **Quit Vineyard** (⌘Q). |
| **File** | On a Mac, **Close Window** (⌘W). On Windows and Linux, **Settings…** (Ctrl+,), **Desktop Settings…**, and **Exit** on Windows (Alt+F4) or **Quit** on Linux (Ctrl+Q). |
| **Edit** | **Undo**, **Redo**, **Cut**, **Copy**, **Paste**, **Delete** and **Select All**, for text fields; on a Mac also **Paste and Match Style**. The canvas has no undo. |
| **View** | **Actual Size**, **Zoom In** and **Zoom Out** zoom the whole window, not the graph. **Toggle Full Screen**. |
| **Window** | **Minimize**. On a Mac, **Zoom** and **Bring All to Front**. On Windows and Linux, **Close**. |
| **Help** | **Keyboard Shortcuts** (⌘/ or Ctrl+/) opens the [list of keys](#keyboard-shortcuts) below. **Documentation** opens this site in your browser, and **Release Notes** the notes for the version you are running, on GitHub. **Troubleshooting** holds **Reload** and **Force Reload**. |

On Windows and Linux, **Ctrl+W** does nothing in the desktop app. The app has one window and quits when it closes, so the key that closes a tab in a browser would end the session. Close the window with **Window → Close** or Alt+F4.

**Reload** and **Force Reload** have no key, so a stray ⌘R or Ctrl+R cannot reload the window. While an AI turn or a plugin run is still working, a reload asks first ([Tasks & runs](tasks.md#ephemeral-by-default)).

## Keyboard shortcuts {#keyboard-shortcuts}

| Mac | Windows, Linux | What it does |
| --- | --- | --- |
| ⌘, | Ctrl+, | Opens Settings. |
| ⌥⌘, | | Opens Desktop Settings (Mac only; on Windows and Linux use **File → Desktop Settings…**). |
| ⌘F | Ctrl+F | Jumps to **Search entities…** on the canvas ([Search](canvas.md#search)). |
| Esc | Esc | Puts away the one thing in front: a **Connect to…** waiting for its target, a menu, the panel in front, and last the selection ([Right-click menus](canvas.md#right-click-menus)). |
| ⌘/ | Ctrl+/ | Opens this list (desktop app). |
| ⌘Z, ⇧⌘Z | Ctrl+Z; Ctrl+Y (Windows), Ctrl+Shift+Z (Linux) | Undo, Redo in a text field. |
| ⌘X, ⌘C, ⌘V, ⌘A | Ctrl+X, Ctrl+C, Ctrl+V, Ctrl+A | Cut, Copy, Paste, Select All in a text field. |
| ⌘0, ⌘+, ⌘- | Ctrl+0, Ctrl++, Ctrl+- | Window zoom: actual size, in, out (desktop app). |
| ⌃⌘F | F11 | Full screen (desktop app). |
| ⌘M | Ctrl+M | Minimize (desktop app). |
| ⌘H, ⌥⌘H | | Hide Vineyard, hide the other apps. |
| ⌘W | | Close the window (Mac). Vineyard keeps running; click its Dock icon or choose **Settings…** (⌘,) to open it again. While the window is closed, **Keyboard Shortcuts** opens this list in your browser. |
| ⌘Q | Ctrl+Q (Linux), Alt+F4 (Windows) | Quit. |

Fields have keys of their own, given where they are described: **Enter** in the AI agent's message box sends ([Tasks & runs](tasks.md#the-ai-agent-panel)), and **↑**, **↓** and **Enter** pick a search result.

## Next / See also

- [Signed in or local](modes.md) — local mode, which only the desktop app has, and switching between the two
- [The canvas](canvas.md) — the app's own menu bar, right-click menus and panels
- [Tasks & runs](tasks.md) — the AI agent, its settings, and the commands it can run in the desktop app
