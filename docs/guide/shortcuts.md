# Keyboard shortcuts

A pivot is the same few steps again and again: select a node, widen the selection by a hop, run
plugins on it, review what they found. Each of those steps has a key, so you can keep both hands on
the keyboard while you work.

Press **?** or **⌘/** (**Ctrl+/** on Windows and Linux) anywhere you are not typing in a field, or
choose **Keyboard shortcuts** at the foot of the sidebar, to see Vineyard's shortcuts. While another
dialog such as **Settings** is open the keys do nothing until you close it, and opening Settings closes
the list. The list shows the keys of the computer you are on: ⌘ on a Mac, Ctrl on Windows and Linux.
Type in its search field to narrow it, by what you want to do (`connect`), by where (`review`) or by
a key (`esc`, `cmd`, `shift`). **Esc** empties the search field first, and closes the list once the
field is empty.

The list has the keys Vineyard gives you, on the canvas, in its panels and dialogs, and in its
fields. It leaves out what every app shares: Tab between controls, Enter in a one-field form such as
a project's name or an invitation, Enter and Space on a button, and the arrows in an open menu or
drop-down.

## Command palette {#command-palette}

Press **⌘K** (**Ctrl+K** on Windows and Linux), even while you are typing in a field, or choose
**Command palette** in the sidebar, and type what you want to do. The palette finds the commands of
the project's menu bar, the canvas toolbar and the right-click menus by the name the menu gives them,
so `export` finds **Export graph (JSON)** and `grid` finds **Grid**. Where two menus name one command
differently, either name finds it: `merge selected` finds **Merge nodes…**, the Edit menu's **Merge
selected nodes…**. The controls for hiding and saved views, the toolbar's **Filter** and the View
menu's **Show all hidden** and **Saved views**, are not in the palette. Besides the commands it
offers:

- the **Settings** sections: `keys` finds **Settings: Keys & Secrets**;
- the layouts, such as **Layout: Stress (distance-preserving)**, with the one in use ticked;
- a new node of any installed type, such as **Add node: Domain**, added and selected as the
  [Types panel](typepacks.md) adds one;
- a plugin to run, such as **Run WHOIS on the selection**, offered while a node it reads is selected;
  a plugin that reads no nodes is always offered. It opens **Run plugins** with that plugin ticked
  (the only one ticked, if the panel was open), and nothing runs until you press **Run**;
- **Run the last plugins again on the selection**, once you have run plugins in the project (see
  [Running plugins](running-plugins.md#launch-surfaces));
- the skill packs and their starters, such as **Infrastructure pivoting: Map the infrastructure**. A
  starter with nothing to fill in puts its draft in a new AI agent conversation, where it waits for
  you to send it; one with blanks opens the skill pack on that starter's form;
- a node, by any of its values, as the graph search finds it. Nodes come after the commands, and
  choosing one selects it and centres it.

With nothing typed, the commands you ran most recently come first; the palette remembers the last
eight on this device, never a node. **↓** and **↑** move, **Enter** runs the highlighted command, and
**Esc** closes the palette. The Enter that finishes a Korean syllable only finishes the syllable. A
command that cannot run right now is shown greyed with the reason the menu gives, for example
*Select something first to expand from*. A command that cannot be undone never runs on Enter alone:
**Delete** and **Disconnect all** open the same question as from the right-click menu, and **Stop the
AI agent's turn** asks first, with **Cancel** focused; Esc there goes back to the list. Like the
shortcut list, the palette does not open while another dialog such as **Settings** is open, and
opening Settings closes it.

## Where the keys are shown {#shown-keys}

You do not have to learn the keys from this page. A menu item that a key also does shows the key on
its right, and a toolbar button names its key at the end of its tooltip, for example *Fit view · F*.
The keys are written for your computer: **⌘A** on a Mac, **Ctrl+A** on Windows and Linux. In the
**Layout** menus, **⇧L** (**Shift+L**) is shown next to the layout in use, because picking that
layout again is what the key does.

- In the right-click menu, **Connect to…** shows its key and the click that links in one step
  (**⌘-click**, or **Ctrl-click** on Windows and Linux).
- The edge menu shows no keys: a right-click on an edge does not select it, and the keys act on the
  selection.
- While an AI agent conversation is open, **Ask the AI agent** on the toolbar and in the **Run** menu
  shows no key. Clicking it starts a new conversation, while **A** and **G** then **A** go into the
  open conversation's message box.
- With the single keys turned off (see below), the menus, the tooltips and the command palette
  stop showing them, and show only the keys that still work. **Keyboard shortcuts** at the foot of
  the sidebar then shows **⌘/** (**Ctrl+/**) instead of **?**.

## How shortcuts behave

- A key on its own, such as **?**, works only when you are not typing in a field; in a field it types
  the character. The AI agent's message box locks while the agent works, so the keys you go on typing
  after sending a question are still typing: while the box stays locked they run no shortcut, however
  long you wait, until you click somewhere or move with **Tab**. **Esc** and the shortcuts with ⌘ or
  Ctrl still work.
- When the agent is done, the caret goes back into its message box, unless you have clicked
  somewhere else in the meantime.
- In a field, besides the field's own keys, only **Esc**, **⌘K** (**Ctrl+K**), **⌘G** (**Ctrl+G**)
  in the search field, **↑** in the AI agent's message box and **⌘↵** (**Ctrl+Enter**) in the Review
  dialog work.
- The canvas keys need the canvas. Click the canvas, or press **G** then **C**, and the canvas keys
  act on it; a thin blue outline shows when the canvas has keyboard focus. They also work before you
  have clicked anywhere. A key pressed in the Properties panel, the menu bar, a floating panel or a
  dialog, or right after you clicked in one of them, leaves the graph alone: **⌫** (**Backspace**)
  after you edit a value in the Properties panel never deletes the selection.
- **Esc** closes one thing per press, the one in front first, and once nothing is left open it
  clears the selection. An open menu of the menu bar (**Project**, **Edit**, **View**, **Run**)
  closes on its own, before the panel behind it. [Right-click menus](canvas.md#right-click-menus)
  gives the order.
- **⌘C** (**Ctrl+C**) copies the selected nodes' labels only while you are not typing in a field,
  no text on the page is selected and no dialog is open; otherwise it copies what it always does.
  See [Copying labels](canvas.md#copying-labels).
- With a Korean input source, the keys still work by their place on the keyboard: the key that types
  ㄹ is **F**, and **G** then **A** is the key that types ㅎ, then the one that types ㅁ.
- Keys that switch the input source are never shortcuts, so typing Korean never runs one: 한/영,
  한자, Caps Lock, Shift+Space, and Ctrl or ⌘ with Space. The key that finishes a Korean syllable
  only finishes the syllable.
- **Settings → General → Keyboard → Single-key shortcuts** turns off every shortcut that is a single
  character (F, N, /, [ and the rest) and the **G** then a letter keys, for example if you use
  dictation. **Esc**, **Enter**, the arrow keys, **Delete** and the shortcuts with ⌘ or Ctrl stay on.
  The setting is **This device only**.
- In a browser tab, the browser keeps some keys for itself before Vineyard sees them, such as
  **⌘N**, **⌘T**, **⌘W** and **⌘Q** on a Mac (**Ctrl+N**, **Ctrl+T**, **Ctrl+W** and **Ctrl+Q**
  elsewhere), so none of them is a shortcut here. The same goes for reload, the address bar, page
  zoom (**⌘+**, **⌘-** and **⌘0** on a Mac) and the developer tools. On a Mac, **⌘,** may open the
  browser's own settings instead of Vineyard's; **Settings** is also in the sidebar.

## What the default keys do

- **Searching.** **⌘F** (**Ctrl+F**) or **/** goes to **Search entities…**. **⌘G** / **⇧⌘G**
  (**Ctrl+G** / **Ctrl+Shift+G**) jump to the next / previous search result, selected and centred.
  They work while something is typed in the search field: in the field itself, and anywhere outside
  another text field.
- **Going places.** Press **G**, then the second key within a second. **G** then **A** goes to the AI
  agent's message box, and opens a new conversation if the panel is closed. **G** then **P** goes to
  the first field of the Properties panel, switching it to **Table** from **Document** or **JSON**,
  and **G** then **T** to the Types panel's search field, or to its first type when the panel is
  collapsed to icons. **G** then **M** opens the Marketplace when the **Project** menu offers it.
- **The view.** **F** fits the whole graph in view, like **Fit view**, and **⇧F** (**Shift+F**) fits
  the selection, centring a single node at 150%. **=** or **+** and **-** zoom like the toolbar
  buttons; hold one to keep zooming. **0** zooms to 100%. The arrow keys move the view, a longer step
  with **Shift**. **L** opens the **Layout** menu, where **↓** reaches the first layout and **Enter**
  picks one. **⇧L** (**Shift+L**) lays the graph out again with the current layout, letting go of
  where nodes were left.
- **The selection.** **⌘A** (**Ctrl+A**) selects all nodes. **N** extends the selection to connected
  neighbors, and **[** / **]** inbound / outbound, one hop per press. **Invert selection**, **Select
  isolated nodes** and **Clear selection** have no key of their own; **Esc** clears the selection.
- **What is selected.** **R** opens **Run plugins** on the selection, or on the whole project with
  nothing selected. **A** asks the AI agent about the selection: a new conversation opens with the
  question filled in, not sent. With a conversation already open, the key goes to its message box
  instead and fills in the question only if the box is empty, so a question you have started stays
  as it is. **C** is **Connect to…**: click the node to connect the selection to. **Enter** or **F2**
  edits the selected node's value in the Properties panel, in the field its label shows; for an edge,
  its relation. From the panel's **Document** or **JSON** view the panel switches to **Table** for
  it, and the field opens even when the panel's finder or **Hide empty** leaves it out. **⌫** or
  **⌦** (**Delete** or **Backspace** on Windows and Linux) deletes the selection: the same
  confirmation as **Delete (N)** opens, with **Cancel** focused. **Duplicate** and stopping an agent
  turn have no key, so neither can happen by a stray keystroke.
- **The AI agent panel.** **↑** in an empty message box brings back your last question to edit and
  send again. **Esc** closes the Setup drawer, then the panel; a running turn keeps going (see
  [Tasks & runs](tasks.md#closing-and-deleting-a-conversation)).
- **The Review dialog.** **/** goes to **Filter by keyword**. **⌘↵** (**Ctrl+Enter**) applies the
  ticked changes, also from the **Why reject?** field, but only while **Apply** is shown and has
  something to apply. **Esc** closes the dialog, also while nothing has focus, as right after
  **Apply**; the run and your ticks stay (see
  [Running plugins](running-plugins.md#reviewing-a-runs-changes)).
- **The Properties panel.** **Tab** and **Shift+Tab** move to the next and previous field. In a
  one-line field, a number and a date included, **Enter** saves and **Esc** puts the value back as
  stored (see [Editing a value](properties.md#editing-a-value)).

## All shortcuts

The list is generated from the same table as the list in the app, and names each action as the app
does.

<!-- shortcuts:start -->
<!-- Generated from lib/keymap.ts in the frontend repository by `npm run docs:shortcuts`. Change the keymap, not this list. -->

### Everywhere

| Action | Mac | Windows and Linux |
| --- | --- | --- |
| Close what is in front<br><small>One thing per press: a menu, a waiting Connect to…, the panel in front, and last the selection.</small> | <kbd>Esc</kbd> | <kbd>Esc</kbd> |
| Open settings<br><small>A Mac browser may keep this key for its own settings; Settings is also in the sidebar.</small> | <kbd>⌘</kbd><kbd>,</kbd> | <kbd>Ctrl</kbd>+<kbd>,</kbd> |
| Search the graph<br><small>In a text field the key is the browser’s own find.</small> | <kbd>⌘</kbd><kbd>F</kbd> / <kbd>/</kbd> | <kbd>Ctrl</kbd>+<kbd>F</kbd> / <kbd>/</kbd> |
| Next search result | <kbd>⌘</kbd><kbd>G</kbd> | <kbd>Ctrl</kbd>+<kbd>G</kbd> |
| Previous search result | <kbd>⇧</kbd><kbd>⌘</kbd><kbd>G</kbd> | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>G</kbd> |
| Show keyboard shortcuts<br><small>Not while you are typing in a field.</small> | <kbd>?</kbd> / <kbd>⌘</kbd><kbd>/</kbd> | <kbd>?</kbd> / <kbd>Ctrl</kbd>+<kbd>/</kbd> |
| Open the command palette<br><small>A menu, toolbar or right-click command, a setting, a plugin or a node, by name.</small> | <kbd>⌘</kbd><kbd>K</kbd> | <kbd>Ctrl</kbd>+<kbd>K</kbd> |
| Go to the AI agent | <kbd>G</kbd> then <kbd>A</kbd> | <kbd>G</kbd> then <kbd>A</kbd> |
| Go to the canvas | <kbd>G</kbd> then <kbd>C</kbd> | <kbd>G</kbd> then <kbd>C</kbd> |
| Go to Properties | <kbd>G</kbd> then <kbd>P</kbd> | <kbd>G</kbd> then <kbd>P</kbd> |
| Go to Types | <kbd>G</kbd> then <kbd>T</kbd> | <kbd>G</kbd> then <kbd>T</kbd> |
| Go to Tasks | <kbd>G</kbd> then <kbd>K</kbd> | <kbd>G</kbd> then <kbd>K</kbd> |
| Project settings… | <kbd>G</kbd> then <kbd>S</kbd> | <kbd>G</kbd> then <kbd>S</kbd> |
| Add from Marketplace… | <kbd>G</kbd> then <kbd>M</kbd> | <kbd>G</kbd> then <kbd>M</kbd> |

### Command palette

| Action | Mac | Windows and Linux |
| --- | --- | --- |
| Move through the commands | <kbd>↓</kbd> / <kbd>↑</kbd> | <kbd>↓</kbd> / <kbd>↑</kbd> |
| Run the highlighted command<br><small>One that cannot be undone asks first, or opens the question its menu item opens.</small> | <kbd>↵</kbd> | <kbd>Enter</kbd> |
| Close the palette<br><small>While it asks before a command, Esc goes back to the list.</small> | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

### Canvas

| Action | Mac | Windows and Linux |
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
| Add a node to the selection | <kbd>⇧</kbd>-click | <kbd>Shift</kbd>-click |
| Select the nodes in an area | <kbd>⇧</kbd>-drag | <kbd>Shift</kbd>-drag |
| Add every node of a type to the selection<br><small>On a row of the legend; a plain click selects only that type.</small> | <kbd>⇧</kbd>-click | <kbd>Shift</kbd>-click |

### Connecting nodes

| Action | Mac | Windows and Linux |
| --- | --- | --- |
| Connect the selected nodes to the node you click | <kbd>⌘</kbd>-click | <kbd>Ctrl</kbd>-click |
| Connect the other way, from the node you click to the selection | <kbd>⇧</kbd><kbd>⌘</kbd>-click | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>-click |
| After Connect to…, connect the other way | <kbd>⇧</kbd>-click | <kbd>Shift</kbd>-click |
| Create the links, named as you typed | <kbd>↵</kbd> | <kbd>Enter</kbd> |
| Stop connecting<br><small>While Connect to… waits for its target, or in the box that names the link.</small> | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

### Graph search

| Action | Mac | Windows and Linux |
| --- | --- | --- |
| Move through the results | <kbd>↓</kbd> / <kbd>↑</kbd> | <kbd>↓</kbd> / <kbd>↑</kbd> |
| Select the highlighted node and center it | <kbd>↵</kbd> | <kbd>Enter</kbd> |
| Close the results | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

### Review

| Action | Mac | Windows and Linux |
| --- | --- | --- |
| Filter the changes by keyword | <kbd>/</kbd> | <kbd>/</kbd> |
| Apply the checked changes | <kbd>⌘</kbd><kbd>↵</kbd> | <kbd>Ctrl</kbd>+<kbd>Enter</kbd> |
| Move to the next or previous change | <kbd>↓</kbd> / <kbd>↑</kbd> | <kbd>↓</kbd> / <kbd>↑</kbd> |
| Turn to the next or previous page | <kbd>→</kbd> / <kbd>←</kbd> | <kbd>→</kbd> / <kbd>←</kbd> |
| Tick or untick the change in focus | <kbd>Space</kbd> | <kbd>Space</kbd> |
| Close, keeping what you ticked and wrote<br><small>In the keyword filter while it holds text, the first Esc empties it.</small> | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

### AI agent

| Action | Mac | Windows and Linux |
| --- | --- | --- |
| Bring back your last question | <kbd>↑</kbd> | <kbd>↑</kbd> |
| Send your message | <kbd>↵</kbd> | <kbd>Enter</kbd> |
| Start a new line | <kbd>⇧</kbd><kbd>↵</kbd> | <kbd>Shift</kbd>+<kbd>Enter</kbd> |
| Close the Setup drawer, then the panel<br><small>A running turn goes on.</small> | <kbd>Esc</kbd> | <kbd>Esc</kbd> |
| Save the memory note you are editing | <kbd>⌘</kbd><kbd>↵</kbd> | <kbd>Ctrl</kbd>+<kbd>Enter</kbd> |
| Stop editing the note | <kbd>Esc</kbd> | <kbd>Esc</kbd> |
| Close the new lead without adding it<br><small>In the plan’s Add a lead box.</small> | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

### Team chat

| Action | Mac | Windows and Linux |
| --- | --- | --- |
| Complete the highlighted / command<br><small>Tab completes it too. A command already typed out in full is sent instead.</small> | <kbd>↵</kbd> | <kbd>Enter</kbd> |
| Move through the / commands | <kbd>↓</kbd> / <kbd>↑</kbd> | <kbd>↓</kbd> / <kbd>↑</kbd> |
| Hide the / command list | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

### Properties

| Action | Mac | Windows and Linux |
| --- | --- | --- |
| Save a one-line value | <kbd>↵</kbd> | <kbd>Enter</kbd> |
| Save long text or code | <kbd>⌘</kbd><kbd>↵</kbd> | <kbd>Ctrl</kbd>+<kbd>Enter</kbd> |
| Put the value back as stored | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

### Node table

| Action | Mac | Windows and Linux |
| --- | --- | --- |
| Add a row to the selection, or take it out | <kbd>⌘</kbd>-click | <kbd>Ctrl</kbd>-click |
| Add the rows from the last one you clicked | <kbd>⇧</kbd>-click | <kbd>Shift</kbd>-click |
| Sort by another column as well<br><small>On a column header, after the first column.</small> | <kbd>⇧</kbd>-click | <kbd>Shift</kbd>-click |
| Empty the keyword filter | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

### Resizable panes

| Action | Mac | Windows and Linux |
| --- | --- | --- |
| Put a resized pane back to its default height<br><small>With the bar between two panes focused: the AI agent’s plan, the Review dialog’s independent check. A double-click does it too.</small> | <kbd>↵</kbd> | <kbd>Enter</kbd> |
| Move the bar up or down | <kbd>↑</kbd> / <kbd>↓</kbd> | <kbd>↑</kbd> / <kbd>↓</kbd> |
| Make the pane its smallest or largest | <kbd>↖</kbd> / <kbd>↘</kbd> | <kbd>Home</kbd> / <kbd>End</kbd> |

### Skill packs

| Action | Mac | Windows and Linux |
| --- | --- | --- |
| Save the skill pack you are editing | <kbd>⌘</kbd><kbd>↵</kbd> | <kbd>Ctrl</kbd>+<kbd>Enter</kbd> |

### Settings

| Action | Mac | Windows and Linux |
| --- | --- | --- |
| Save the key or secret you are editing<br><small>In Keys &amp; Secrets.</small> | <kbd>↵</kbd> | <kbd>Enter</kbd> |
| Stop editing it, keeping what was stored | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

### Projects

| Action | Mac | Windows and Linux |
| --- | --- | --- |
| Close the search results<br><small>In Search entities across your projects.</small> | <kbd>Esc</kbd> | <kbd>Esc</kbd> |

<!-- shortcuts:end -->

## In the desktop app {#desktop-app}

The desktop app's menus have keys of their own, listed here rather than above, since the list above
is the app's and the same in a browser (see [The desktop app](desktop.md#menus) for the menus).

| Mac | Windows, Linux | What it does |
| --- | --- | --- |
| ⌥⌘, | | Opens Desktop Settings (Mac only; on Windows and Linux use **File → Desktop Settings…**). |
| ⌘Z, ⇧⌘Z | Ctrl+Z; Ctrl+Y (Windows), Ctrl+Shift+Z (Linux) | Undo, Redo in a text field. |
| ⌘X, ⌘C, ⌘V, ⌘A | Ctrl+X, Ctrl+C, Ctrl+V, Ctrl+A | Cut, Copy, Paste, Select All in a text field. Where the canvas has the keys, Select All and Copy do what the keys do there: select every node, copy the selected nodes' labels. |
| ⌘0, ⌘+, ⌘- | Ctrl+0, Ctrl++, Ctrl+- | Window zoom: actual size, in, out. |
| ⌃⌘F | F11 | Full screen. |
| ⌘M | Ctrl+M | Minimize. |
| ⌘H, ⌥⌘H | | Hide Vineyard, hide the other apps. |
| ⌘W | | Close the window (Mac). Vineyard keeps running; click its Dock icon or choose **Settings…** (⌘,) to open it again. While the window is closed, **Help → Keyboard Shortcuts** opens this page in your browser. |
| ⌘Q | Ctrl+Q (Linux), Alt+F4 (Windows) | Quit. |

- **⌘,** (**Ctrl+,**) and **⌘/** (**Ctrl+/**) are also the keys of **Settings…** and **Help →
  Keyboard Shortcuts** in the menus, so in the desktop app they work while you are typing in a field
  too.
- While a dialog such as **Settings** is open, **⌘/** outside its fields does nothing, and **Help →
  Keyboard Shortcuts** opens this page in your browser instead of the list.
- On Windows and Linux, **Ctrl+W** does nothing: the app has one window and quits when it closes.
  **Reload** and **Force Reload** have no key, so a stray ⌘R or Ctrl+R cannot reload the window.

## Next / See also

- [The canvas](canvas.md) — searching, selecting, connecting nodes, and the node table
- [Running plugins](running-plugins.md) — the review dialog and its keys
- [Tasks & runs](tasks.md) — the AI agent panel
- [The desktop app](desktop.md) — its menus and its two settings windows
