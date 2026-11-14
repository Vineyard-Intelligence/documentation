# Vineyard documentation

The user guide, developer documentation, and marketplace browser for Vineyard — an
[mkdocs-material](https://squidfunk.github.io/mkdocs-material/) site published to
**https://docs.vineyard.run/** via GitHub Pages.

The marketplace browser is **presentation only**: it fetches the three index files from the
[registry](https://github.com/Vineyard-Intelligence/registry) over XHR
(`https://registry.vineyard.run/registry/community-{typepacks,pluginpacks,skillpacks}.json`), and lazy-loads each
pack's full document from its content repo via jsDelivr for the detail drawer. This repo holds no
catalog data of its own.

## Local development

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
mkdocs serve            # preview at http://127.0.0.1:8000
```

To preview the marketplace against a different registry, set a global before the page loads
(the base must serve `community-typepacks.json`, `community-pluginpacks.json`, and `community-skillpacks.json`):

```js
window.VINEYARD_REGISTRY_BASE = "http://localhost:8000/registry/";
```

## Generated content

The list of shortcuts in `docs/guide/shortcuts.md` and `shortcuts.ko.md`, between the
`shortcuts:start` and `shortcuts:end` markers, is generated from the app's keymap. Change the keymap in
the frontend repository and run `npm run docs:shortcuts` there; do not edit the list here.

With this repository checked out beside the frontend, the frontend's build (`check:shortcut-help`)
fails while the list here differs, while a guide page that the frontend's
`scripts/shortcut-sources.mts` says describes a key no longer names it, and while a guide page names a
⌘ or Ctrl key the app neither binds nor refuses. A key the browser, the OS or the desktop app's menu
keeps (⌘Q, Ctrl+Shift+R) and the text-editing keys (⌘C, Ctrl+Z) may be named freely. This
repository's own deploy does not run that check, so a page edited here is checked by the next
frontend build. A checkout from before the shortcut pages existed is skipped with a note.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to
the `gh-pages` branch. The custom domain is set via `docs/CNAME`.
