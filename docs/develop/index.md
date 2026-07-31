# Developer Guide

Build for Vineyard by authoring a **Plugin Pack**, **Type Pack**, or **Skill Pack** in your own
GitHub repo, then publishing a one-line pointer to the registry. This section walks you from a
working idea to a published, installable pack.

## The model in one paragraph

You author a pack in **your own repository**. To distribute it, you open a pull request that
adds a **single metadata entry** — a pointer, not code — to the Marketplace registry. When a
user installs your pack, the Vineyard app fetches the pack from your repo at a pinned commit and
caches it locally. The server never executes plugin code, never stores plugin bytes, and — by
default — never records the runs a plugin produces.

## The three content types

Every Vineyard pack carries a `content_type` discriminator, and identifiers are reverse-DNS:

| Content type | `content_type` | Identifier form | What it is |
|---|---|---|---|
| **Plugin Pack** | `vineyard:pluginpack` | `run.vineyard.pluginpacks.<name>` | One or more bundled JS modules exporting `definePlugin({ manifest, run })` that read and write the graph. |
| **Type Pack** | `vineyard:typepack` | `run.vineyard.typepacks.<name>` | JSON that defines node **entity types** and optional **edge types** (icons, colors, properties, validators). |
| **Skill Pack** | `vineyard:skillpack` | `run.vineyard.skillpacks.<name>` | JSON text: an investigation **playbook** the agent follows. No code, no permissions. |

The three systems are designed to work together — a plugin's `io` references Type Pack types by
their qualified `category.name` form, and a Skill Pack's steps call plugin packs declared in its
`requires` — but each can be published independently.

## Prerequisites

- **Plugin Packs** need JavaScript or TypeScript, the SDK (`@vineyard/plugin-sdk`), and a
  bundler (esbuild, Vite, Rollup, or similar). A plugin ships as a single bundled module
  referenced from your manifest's `platforms.web.entry`.
- **Type Packs and Skill Packs** are plain JSON — author them in any editor, no toolchain.
- **A GitHub repository** with releases. The registry stores only a pointer; your repo hosts
  the actual pack content that clients download and cache.

!!! note "Initial scope is browser + desktop"
    Both the **browser** runtime (`platforms.web.runtime: "sandbox-js"`) and the **desktop**
    Electron shell (`platforms.desktop.runtime: "sandbox-js"`) ship today. The `web-proxy` CORS
    workaround, `native`/`subprocess` desktop runtimes, and keychain-backed secrets exist in the
    schemas as forward-looking design but are **deferred** — not built yet.

## Where to go next

=== "Author a plugin"

    - [Quickstart](quickstart.md) — scaffold, bundle, and test a plugin locally.
    - [Plugin manifest](plugin-manifest.md) — every field, with the `cidr_expand` example.
    - [Plugin Packs](plugin-packs.md) — one bundle, many plugins.
    - [SDK](sdk.md) — `definePlugin`, the `HostContext`, and the sandbox.

=== "Define types"

    - [Type Packs](typepacks.md) — entity types, edge types, icons, validators.

=== "Write a playbook"

    - [Skill Packs](skillpacks.md) — the document format, sections, and starters.

=== "Authority & shipping"

    - [Scopes](../reference/scopes.md) — the only authority a plugin gets.
    - [Security](security.md) — secrets, the RunToken, and CSP egress.
    - [Publishing](publishing.md) — the registry PR for any pack type.
    - [Updates](updates.md) — shipping a new version.

## See also

- [Architecture](architecture.md) — how client-side execution, the registry, and ephemeral
  tasks fit together.
- [Home](../index.md) · [Marketplace](../marketplace.md)
