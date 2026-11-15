# Keyboard shortcuts

A pivot is the same few steps again and again: select a node, widen the selection by a hop, run plugins on it, review what they found. Each of those steps has a key, so you can keep both hands on the keyboard while you work.

The keys are written as on a Mac. On Windows and Linux, press **Ctrl** where this page shows **Cmd** (⌘).

## Where the keys are shown {#shown-keys}

You do not have to learn the keys from this page. A menu item that a key also does shows the key on its right, and a toolbar button names its key at the end of its tooltip, for example *Fit view · F*. The keys are written for your computer: **⌘A** on a Mac, **Ctrl+A** on Windows and Linux. In the **Layout** menus, ++shift+l++ is shown next to the layout in use, because picking it again is what ++shift+l++ does.

- In the right-click menu, **Connect to…** shows its key and the click that links in one step (**⌘-click**, or **Ctrl-click** on Windows and Linux).
- The edge menu shows no keys: a right-click on an edge does not select it, and the keys act on the selection.
- While an AI agent conversation is open, **Ask the AI agent** on the toolbar and in the **Run** menu shows no key. Clicking it starts a new conversation, while ++a++ and ++g++ then ++a++ go into the open conversation's message box.
- With the single keys turned off (see below), the menus and tooltips stop showing them, and show only the keys that still work.

## Where the keys work

- **Not while you type.** In a text field, a single key types itself. Besides the field's own keys, only **Esc**, ++cmd+g++ in the search field, ++arrow-up++ in the AI agent's message box and ++cmd+enter++ in the Review dialog work there.
- **The canvas keys need the canvas.** Click the canvas, or press ++g++ then ++c++, and the canvas keys act on it; a thin blue outline shows when the canvas has keyboard focus. They also work before you have clicked anywhere. A key pressed in the Properties panel, the menu bar, a floating panel or a dialog, or right after you clicked in one of them, leaves the graph alone: ++backspace++ after you edit a value in the Properties panel never deletes the selection.
- **Korean input.** With a Korean input source, the keys still work by their place on the keyboard: the key that types ㄹ is ++f++, and ++g++ then ++a++ is the key that types ㅎ, then the one that types ㅁ. A key that finishes a Hangul syllable only finishes the syllable.
- **While the agent works.** The AI agent's message box locks while the agent works. Keys you type then are not taken as shortcuts, however long you wait, until you click somewhere or move with ++tab++; **Esc** and the **Cmd/Ctrl** shortcuts still work. When the agent is done, the caret goes back into the message box, unless you have clicked somewhere else in the meantime.
- **Turn the single keys off.** **Settings → General → Keyboard → Single-key shortcuts** turns off every shortcut that is a single character (F, N, /, [ and the rest) and the **G then a letter** keys, for example if you use dictation. **Esc**, **Enter**, the arrow keys, **Delete** and the **Cmd/Ctrl** shortcuts stay on. The setting is **This device only**.

## Everywhere

| Key | Action |
| --- | --- |
| ++cmd+f++ or ++slash++ | Go to **Search entities…**. |
| ++cmd+g++ / ++shift+cmd+g++ | Jump to the next / previous search result, selected and centred. Works while something is typed in the search field: in the field itself, and anywhere outside another text field. |
| ++cmd+comma++ | Open Settings. |
| ++esc++ | Close what is in front, one thing per press; with nothing left, clear the selection (see [The canvas](canvas.md#right-click-menus)). |

## Moving around

Press ++g++, then the second key within a second.

| Keys | Goes to |
| --- | --- |
| ++g++ then ++a++ | The AI agent's message box. Opens a new conversation if the panel is closed. |
| ++g++ then ++c++ | The canvas. |
| ++g++ then ++p++ | The first field of the Properties panel. |
| ++g++ then ++t++ | The Types panel's search field; the first type when the panel is collapsed to icons. |
| ++g++ then ++k++ | The Tasks panel. |
| ++g++ then ++s++ | Project settings. |
| ++g++ then ++m++ | The Marketplace, when the **Project** menu offers it. |

## Canvas

| Key | Action |
| --- | --- |
| ++f++ | Fit the whole graph in view, like **Fit view**. |
| ++shift+f++ | Fit the selection in view. A single node is centred at 150%. |
| ++equal++ or ++plus++, ++minus++ | Zoom in, zoom out, like the toolbar buttons. Hold to keep zooming. |
| ++0++ | Zoom to 100%. |
| Arrow keys | Move the view. With ++shift++, a longer step. |
| ++l++ | Open the **Layout** menu; ++arrow-down++ reaches the first layout and ++enter++ picks one. |
| ++shift+l++ | Lay the graph out again with the current layout, letting go of where nodes were left. The **Layout** menus show it next to the layout in use. |

## Selection

| Key | Action |
| --- | --- |
| ++cmd+a++ | Select all nodes. |
| ++n++ | Extend the selection to connected neighbors, one hop per press. |
| ++bracket-left++ / ++bracket-right++ | Extend the selection inbound / outbound, one hop per press. |

**Invert selection**, **Select isolated nodes** and **Clear selection** have no key of their own; **Esc** clears the selection.

## What is selected

| Key | Action |
| --- | --- |
| ++r++ | Open **Run plugins** on the selection; with nothing selected, on the whole project. |
| ++a++ | Ask the AI agent about the selection: a new conversation opens with the question filled in, not sent. With a conversation already open, the key goes to its message box instead and fills in the question only if the box is empty, so a question you have started stays as it is. |
| ++c++ | **Connect to…**: click the node to connect the selection to. |
| ++enter++ or ++f2++ | Edit the selected node's value in the Properties panel: the field its label shows. For an edge, its relation. |
| ++backspace++ or ++del++ | Delete the selection. The same confirmation as **Delete (N)** opens, with **Cancel** focused. |

**Duplicate** and stopping an agent turn have no key, so neither can happen by a stray keystroke.

## AI agent panel

| Key | Action |
| --- | --- |
| ++enter++ / ++shift+enter++ | Send / new line. |
| ++arrow-up++ | In an empty message box, bring back your last question to edit and send again. |
| ++cmd+enter++ / ++esc++ | While you edit a note under **Setup → Project memory**: save it / cancel the edit. |
| ++esc++ | Close the panel. A running turn keeps going (see [Tasks & runs](tasks.md#closing-and-deleting-a-conversation)). |

## Review dialog

| Key | Action |
| --- | --- |
| ++arrow-up++ ++arrow-down++, ++arrow-left++ ++arrow-right++ | Move between rows, turn pages. |
| ++space++ | Tick or untick the focused row. |
| ++slash++ | Go to **Filter by keyword**. |
| ++cmd+enter++ | **Apply** the ticked changes, also from the **Why reject?** field. Only while **Apply** is shown and has something to apply. |
| ++esc++ | Close the dialog; the run and your ticks stay (see [Running plugins](running-plugins.md#reviewing-a-runs-changes)). |

## Properties panel

| Key | Action |
| --- | --- |
| ++tab++ / ++shift+tab++ | Next / previous field. |
| ++enter++ | Save a one-line field. |
| ++cmd+enter++ | Save a multi-line field. |
| ++esc++ | Put the field back as stored. |

## In a web browser

The browser keeps some keys for itself, and Vineyard does not take them: new tab and window, close, reload, the address bar, page zoom (++cmd+plus++, ++cmd+minus++, ++cmd+0++) and the developer tools. On a Mac, ++cmd+comma++ may open the browser's own settings instead; the Settings item in the avatar menu always works. The keys that switch between Korean and English input are never used as shortcuts.
