# Signed in or local

Vineyard runs signed in to a Vineyard server, in the web app or the desktop app, or in local mode, where the desktop app keeps your projects in a folder on your computer and needs no account. Local mode exists only in the desktop app; this page lists what changes between the two and how to switch.

## What differs

| | Signed in (web app or desktop app) | Local mode (desktop app only) |
| --- | --- | --- |
| **Where it runs** | The web app at [app.vineyard.run](https://app.vineyard.run), or the desktop app. | The desktop app only. The web app has no local mode; its sign-in screen offers **Get the desktop client** instead. |
| **Desktop-only plugins, commands and files** | Desktop app only. In the web app, desktop-only plugins are listed under **Desktop only** in the Run plugins panel and cannot run, and the agent cannot run commands or work with files. | Available. |
| **Account** | A Vineyard account. **Settings** has an **Account** group: **Profile**, **Password**, **Two-factor** and **Active Sessions**. | None. There are no sign-in, sign-up or password-reset screens, and **Settings** has no **Account** group. |
| **Where projects are stored** | On the Vineyard server. The web app and the desktop app show the same projects for the same account on the same server. | In the folder you picked, one `<id>.vineyard.json` file per project, holding its graph, its installed packs and its own skill packs. **Settings → About → Storage** reads **Local workspace**. Nothing is stored on a Vineyard server. |
| **Your settings** | Stored with your account, so they follow you between the web app and the desktop app, except those marked **This device only**. | Kept in the app on this computer. |
| **Sync and backup** | Your projects are on the server, so they are there wherever you sign in. While the service is in testing, accounts and their projects may be reset without notice. | No sync and no backup; back up the folder yourself. Keep each project file under the name the app gave it: a project file you renamed, or a copy of one in the same folder, is not opened as a project. If its name still ends in `.vineyard.json`, the **Projects** page lists it as skipped. |
| **Sharing and collaboration** | **Project settings → Access** holds the project link and sets who can view, list and edit the project; with **Public (anyone with the link)**, anyone who has the link can open it. **People** invites collaborators by username, and they get access after accepting the invitation. Project members see who else has the project open. | None. A local project has no link, no collaborators, no invitations and no presence. |
| **Organizations** | The **Organizations** page in the sidebar. | No **Organizations** page. |
| **Project settings** | **General**, **Access** and **People**. | **General** only. |
| **Dashboard** | **Continue**, **Since your last visit** and **Activity**, a search box that finds entities across your projects, and any invitations waiting for you. | **Continue** only. |
| **Messages pane** | The project's chat, shared by the people who can edit the project. Anyone else sees *Chat is visible to people who can edit this project.* | No Messages pane. |
| **Activity log** | **Project ▸ Activity log…** opens the project's activity log, for project members only. | No activity log is kept, and the menu item is not shown. |
| **Announcements** | The top bar shows the service's pinned announcements. | None. |
| **Marketplace installs** | A pack that calls a Vineyard-operated service carries a **Vineyard service** chip and installs like any other pack. | Such a pack (Telegram, for example) carries **Account required** instead, and its **Install** is disabled: *Needs a Vineyard account — sign in to use this pack*. Every other pack installs as usual. |
| **Plugins that call a Vineyard service** | The service authenticates the call with your Vineyard session. | The call fails with an error saying the service needs a Vineyard account. |
| **AI agent model providers** | Your own provider and key; model calls go from the app straight to the provider. In the web app, providers that do not allow calls from a web page are marked *desktop only* and cannot run there; the desktop app can use all of them. | As in the desktop app: all providers can be used. |
| **Web search and page reading** | The default search provider is **Serper, through the Vineyard server**, and **Brave, through the Vineyard server** is also offered; both send the agent's queries through the Vineyard server. In the web app, desktop-only providers are greyed out. With the default page reading, the desktop app fetches each page itself first, and the web app sends each URL to the reader service r.jina.ai first. | The two server options are greyed out (*needs the Vineyard server*). While one of them is selected, as it is by default, the agent searches with **DuckDuckGo**. Page reading works as in the desktop app. Providers and reading modes are listed in [Web search and page reading](tasks.md#web-search-and-page-reading). |
| **Keys and secrets** | Kept on this device, filed under your account, and never sent to the Vineyard server. Plugin keys last until the tab closes in the web app; the desktop app encrypts them with the computer's keychain, or keeps them for the session when it cannot. LLM and search-engine keys are kept on the device, not encrypted. | Kept as in the desktop app, in local mode's own space: keys saved while signed in are not offered here, and keys saved here are not offered when you sign in. |

In both modes plugins run in the app on your computer, the agent's model calls go straight to your AI provider, and the installed packs are checked against the registry each time a project opens.

## Switching modes

### From the sign-in screen to local mode

1. In the desktop app, go to the **Sign in** screen. If you are signed in, choose **Log out** in the avatar menu first.
2. Choose **Work locally, without an account**.
3. Pick a folder for your projects, or create one in the dialog. Cancelling the dialog leaves everything as it was.
4. In **Restart to work locally**, choose **Restart now**. With **Later**, the app opens in local mode the next time it starts.

### Back to a server

1. Choose **Connect to a server** at the bottom of the sidebar, or under **Settings → About → Storage**.
2. The app restarts at once and connects to the server it used before; the address in **Desktop Settings… → Backend** does not change. Sign in if the sign-in screen appears.

### What happens to your data

- Nothing is moved or deleted. Projects on the server stay there and do not appear in local mode; project files stay in the folder and are not uploaded when you connect to a server.
- To carry a project across, use **Project ▸ Export graph (JSON)** in one mode, then create a project in the other and use **Project ▸ Import graph (JSON)…**. The file holds only nodes and edges, so install the packs again, and move the project's own skill packs separately (see [Your project's own skill packs](skillpacks.md#custom-skill-packs)).
- AI conversations, project memory, keys and settings are filed separately for local mode and for each account. After a switch you see the ones that belong to the mode you are in; switching back brings the others back.
- **Work locally, without an account** asks for a folder every time. Pick the same folder to get the same projects back.

## Next / See also

- [Getting started](getting-started.md) — opening the app and creating a first project.
- [The canvas](canvas.md) — the Project menu and the project settings dialog.
- [Browse & install](installing.md) — the Marketplace and its chips.
- [Tasks & runs](tasks.md) — the AI agent, its settings, and where its searches go.
