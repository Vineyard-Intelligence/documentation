# Vineyard documentation

The user guide, developer documentation, and marketplace browser for Vineyard — an
[mkdocs-material](https://squidfunk.github.io/mkdocs-material/) site published to
**https://docs.vineyard.run/** via GitHub Pages.

The marketplace browser is **presentation only**: it fetches the two index files from the
[registry](https://github.com/Vineyard-Intelligence/registry) over XHR
(`https://registry.vineyard.run/registry/community-{typepacks,plugins}.json`), and lazy-loads each
pack's full document from its content repo via jsDelivr for the detail drawer. This repo holds no
catalog data of its own.

## Local development

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
mkdocs serve            # preview at http://127.0.0.1:8000
```

To preview the marketplace against a different registry, set a global before the page loads
(the base must serve `community-typepacks.json` and `community-pluginpacks.json`):

```js
window.VINEYARD_REGISTRY_BASE = "http://localhost:8000/registry/";
```

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to
the `gh-pages` branch. The custom domain is set via `docs/CNAME`.

## License

MIT
