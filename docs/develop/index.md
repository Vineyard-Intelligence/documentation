# Developer Guide

Build for Vineyard by authoring a JavaScript **plugin** and/or a JSON **Type Pack** in your own GitHub repo, then publishing a one-line pointer to the registry. This section walks you from a working idea to a published, installable extension.

## The model in one paragraph

You author a plugin (JavaScript) and/or a Type Pack (JSON) in **your own repository** and build a bundle there. To distribute it, you open a pull request that adds a **single metadata entry** — a pointer, not code — to the Marketplace registry. When a user installs your extension, the Vineyard app downloads the bundle from your release, caches it locally, and runs it **client-side in a sandbox**. The server never executes plugin code, never stores plugin bytes, and — by default — never records the task a plugin produces. The installing user grants only the scopes your manifest declares, and your code runs in a Web Worker reached through a host bridge holding a short-lived, scope-clamped token.

## The two content types

Every Vineyard document carries a `content_type` discriminator, and identifiers are reverse-DNS:

| Content type | `content_type` | Identifier form | What it is |
|---|---|---|---|
| **Type Pack** | `vineyard:typepack` | `run.vineyard.typepacks.<name>` | JSON that defines node **entity types** and optional **edge types** (icons, colors, properties, validators). |
| **Plugin** | `vineyard:plugin` | `run.vineyard.plugins.<name>` | A bundled JS module exporting `definePlugin({ manifest, run })` that reads and writes the graph. |

A plugin's `io` block references Type Pack types by their qualified `category.name` form (for example `infrastructure.ip_address`), so the two systems are designed to ship together — but each can be published independently.

## Prerequisites

- **JavaScript or TypeScript.** The SDK (`@vineyard/plugin-sdk`) is typed; TypeScript is recommended but not required.
- **A bundler** (esbuild, Vite, Rollup, or similar). A plugin ships as a single bundled module (e.g. `dist/cidr.js`) referenced from your manifest's `platforms.web.entry`.
- **A GitHub repository** with releases. The registry stores only a pointer; your repo hosts the actual bundle that clients download and cache.

!!! note "Initial scope is the browser"
    The first build targets the **browser** runtime (`platforms.web.runtime: "sandbox-js"`). The `desktop` runtime and the `web-proxy` CORS workaround exist in the schemas as forward-looking design but are **deferred** — not built yet. Where a page mentions desktop or web-proxy, treat it as design intent, not a shipped feature.

## Where to go next

=== "Start building"

    - [Quickstart](quickstart.md) — scaffold, bundle, and test a plugin locally.
    - [Architecture](architecture.md) — how client-side execution, the registry, and ephemeral tasks fit together.

=== "Author the manifest"

    - [Plugin manifest](plugin-manifest.md) — every field, with the `cidr_expand` example.
    - [Plugin Packs](plugin-packs.md) — one bundle, many plugins.
    - [Type Packs](typepacks.md) — entity types, edge types, icons, validators.

=== "Authority & shipping"

    - [Scopes](../reference/scopes.md) — the only authority a plugin gets.
    - [SDK](sdk.md) — `definePlugin`, the `HostContext`, and the sandbox.
    - [Security](security.md) — secrets, the RunToken, and CSP egress.
    - [Publishing](publishing.md) — the registry PR.

## See also

- [Reference: scopes](../reference/scopes.md) and glossary
- [Running plugins](../guide/running-plugins.md)
- [Home](../index.md) · [Marketplace](../marketplace.md)
