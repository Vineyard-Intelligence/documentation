/* ============================================================================
   VINEYARD community browser — fully static, client-side only.
   Renders the plugin + typepack registry (fetched from the registry site)
   as a searchable/filterable card grid with a detail drawer.
   No backend, no build: fetches the two community-*.json index files for the
   cards, and lazy-loads each pack's full document from jsDelivr for the drawer.
   ========================================================================== */
(function () {
  "use strict";

  // --- Run only on the community page -------------------------------------
  function init() {
    var mount = document.getElementById("vy-community");
    if (!mount) return;

    renderSkeleton(mount);
    var base = registryBase();

    Promise.all([
      fetchJson(base + "community-typepacks.json").catch(function () { return null; }),
      fetchJson(base + "community-pluginpacks.json").catch(function () { return null; }),
      fetchJson(base + "community-skillpacks.json").catch(function () { return null; }),
    ])
      .then(function (res) {
        if (res[0] === null && res[1] === null && res[2] === null) throw new Error("registry unreachable");
        var entries = normalize([].concat(res[0] || [], res[1] || [], res[2] || []));
        new Browser(mount, entries).render();
      })
      .catch(function (err) {
        mount.innerHTML =
          '<div class="vy-state">' + ICON.alert +
          "<p>Could not load the registry.</p><p style=\"font-size:.72rem\">" +
          escapeHtml(String(err && err.message ? err.message : err)) +
          " &middot; expected at <code>" + escapeHtml(base) + "community-*.json</code></p></div>";
      });
  }

  // The catalog is published by the registry site (separate repo) as two index
  // files; each pack's full document is fetched from its content repo via jsDelivr.
  // Override the base for local preview / staging.
  function registryBase() {
    return (typeof window !== "undefined" && window.VINEYARD_REGISTRY_BASE) ||
      "https://registry.vineyard.run/registry/";
  }

  function fetchJson(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status + " for " + url);
      return r.json();
    });
  }

  // jsDelivr URL for a pack's full document, from its content repo at the pinned ref.
  function detailUrl(e) {
    if (!e.repo || !e.ref || !e.path) return null;
    return "https://cdn.jsdelivr.net/gh/" + e.repo + "@" + e.ref + "/" + e.path;
  }

  // --- Inline icon set (lucide, ISC licence; 24x24, stroke=currentColor) ---
  var P = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
  var E = "</svg>";
  var ICON = {
    skull: P + '<path d="m12.5 17-.5-1-.5 1h1z"/><path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="12" r="1"/>' + E,
    target: P + '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>' + E,
    "hand-sparkles": P + '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>' + E,
    "circle-dot": P + '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>' + E,
    sparkles: P + '<path d="M9.94 14.34A2 2 0 0 0 8.66 13L3.4 11.3a.6.6 0 0 1 0-1.14L8.66 8.4a2 2 0 0 0 1.28-1.28l1.7-5.26a.6.6 0 0 1 1.14 0l1.7 5.26a2 2 0 0 0 1.28 1.28l5.26 1.7a.6.6 0 0 1 0 1.14L17.06 13a2 2 0 0 0-1.28 1.28l-1.7 5.26a.6.6 0 0 1-1.14 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>' + E,
    box: P + '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>' + E,
    sitemap: P + '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/>' + E,
    "shield-alert": P + '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>' + E,
    grape: P + '<path d="M22 5V2l-5.89 5.89"/><circle cx="16.6" cy="15.89" r="3"/><circle cx="8.11" cy="7.4" r="3"/><circle cx="12.35" cy="11.65" r="3"/><circle cx="13.91" cy="5.85" r="3"/><circle cx="18.15" cy="10.09" r="3"/><circle cx="6.56" cy="13.2" r="3"/><circle cx="10.8" cy="17.44" r="3"/><circle cx="5" cy="19" r="3"/>' + E,
    "pen-square": P + '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>' + E,
    check: P + '<path d="M20 6 9 17l-5-5"/>' + E,
    "badge-check": P + '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>' + E,
    search: P + '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>' + E,
    x: P + '<path d="M18 6 6 18M6 6l12 12"/>' + E,
    alert: P + '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>' + E,
    package: P + '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="m7.5 4.27 9 5.15"/>' + E,
    "git-branch": P + '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>' + E,
    inbox: P + '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>' + E,
    // Every icon the catalog can name (pack and type icons) plus the per-kind defaults —
    // exact path data from lucide-react 0.542.0 (ISC).
    megaphone: P + '<path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/><path d="M8 6v8"/>' + E,
    "shield-check": P + '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>' + E,
    "scan-line": P + '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/>' + E,
    boxes: P + '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/>' + E,
    "mail-x": P + '<path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h9"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m17 17 4 4"/><path d="m21 17-4 4"/>' + E,
    globe: P + '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>' + E,
    github: P + '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>' + E,
    "file-search": P + '<path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"/><path d="m9 18-1.5-1.5"/><circle cx="5" cy="14" r="3"/>' + E,
    image: P + '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>' + E,
    network: P + '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>' + E,
    waypoints: P + '<circle cx="12" cy="4.5" r="2.5"/><path d="m10.2 6.3-3.9 3.9"/><circle cx="4.5" cy="12" r="2.5"/><path d="M7 12h10"/><circle cx="19.5" cy="12" r="2.5"/><path d="m13.8 17.7 3.9-3.9"/><circle cx="12" cy="19.5" r="2.5"/>' + E,
    radar: P + '<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/>' + E,
    key: P + '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>' + E,
    "git-fork": P + '<circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9"/><path d="M12 12v3"/>' + E,
    send: P + '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>' + E,
    history: P + '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>' + E,
    "at-sign": P + '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>' + E,
    bird: P + '<path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/>' + E,
    "satellite-dish": P + '<path d="M4 10a7.31 7.31 0 0 0 10 10Z"/><path d="m9 15 3-3"/><path d="M17 13a6 6 0 0 0-6-6"/><path d="M21 13A10 10 0 0 0 11 3"/>' + E,
    "scan-eye": P + '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="1"/><path d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0"/>' + E,
    fingerprint: P + '<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>' + E,
    "id-card": P + '<path d="M16 10h2"/><path d="M16 14h2"/><path d="M6.17 15a3 3 0 0 1 5.66 0"/><circle cx="9" cy="11" r="2"/><rect x="2" y="5" width="20" height="14" rx="2"/>' + E,
    "file-text": P + '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>' + E,
    wallet: P + '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>' + E,
    "map-pin": P + '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>' + E,
    user: P + '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' + E,
    bug: P + '<path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>' + E,
    puzzle: P + '<path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"/>' + E,
    layers: P + '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>' + E,
    "book-open": P + '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>' + E,
  };
  // Own keys only: "constructor" is a valid kebab name, and ICON["constructor"] is Object.
  var hasOwn = Object.prototype.hasOwnProperty;
  function icon(name, fallback) {
    return (hasOwn.call(ICON, name) ? ICON[name] : ICON[fallback]) || ICON.package;
  }

  // One label, default icon and tile colour (CSS .vy-tile--<kind>) per kind.
  var KIND = {
    pluginpack: { label: "Plugin pack", icon: "puzzle" },
    typepack: { label: "Type pack", icon: "layers" },
    skillpack: { label: "Skill pack", icon: "book-open" },
  };
  function kindIcon(e) { return icon(e.icon, KIND[e.type].icon); }

  // GitHub source at the pinned commit — only for an owner/name repo and a non-empty ref.
  function sourceUrl(e) {
    return /^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/.test(e.repo || "") && e.ref
      ? "https://github.com/" + e.repo + "/tree/" + encodeURIComponent(e.ref)
      : null;
  }

  // --- Normalize registry into a flat, render-friendly array ---------------
  function normalize(data) {
    var out = [];
    if (Array.isArray(data)) out = data.slice();
    else {
      if (Array.isArray(data.plugins)) out = out.concat(data.plugins);
      if (Array.isArray(data.typepacks)) out = out.concat(data.typepacks);
      if (Array.isArray(data.entries)) out = out.concat(data.entries);
    }
    return out.map(function (e) {
      e.type = e.type ||
        (e.content_type === "vineyard:typepack" ? "typepack"
          : e.content_type === "vineyard:skillpack" ? "skillpack"
          : "pluginpack");
      e.name = e.name || e.identifier || "Untitled";
      e.author = typeof e.author === "object" && e.author ? e.author.name : e.author || "—";
      e.categories = e.categories || [];
      return e;
    });
  }

  // --- The browser component ----------------------------------------------
  function Browser(mount, entries) {
    this.mount = mount;
    this.all = entries;
    this.state = { q: "", type: "all", category: "all", sort: "name-asc", verifiedOnly: false };
  }

  Browser.prototype.categories = function () {
    var set = {};
    this.all.forEach(function (e) {
      (e.categories || []).forEach(function (c) { set[c] = true; });
    });
    return Object.keys(set).sort();
  };

  Browser.prototype.filtered = function () {
    var s = this.state;
    var q = s.q.trim().toLowerCase();
    var list = this.all.filter(function (e) {
      if (s.type !== "all" && e.type !== s.type) return false;
      if (s.verifiedOnly && !e.verified) return false;
      if (s.category !== "all" && (e.categories || []).indexOf(s.category) === -1) return false;
      if (q) {
        var hay = [e.name, e.author, e.description, e.identifier].concat(e.categories || []).join(" ").toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    list.sort(function (a, b) {
      switch (s.sort) {
        case "name-desc": return b.name.localeCompare(a.name);
        case "verified": return (b.verified ? 1 : 0) - (a.verified ? 1 : 0) || a.name.localeCompare(b.name);
        case "type": return a.type.localeCompare(b.type) || a.name.localeCompare(b.name);
        default: return a.name.localeCompare(b.name);
      }
    });
    return list;
  };

  Browser.prototype.render = function () {
    var self = this;
    var cats = this.categories();
    var nPluginpacks = this.all.filter(function (e) { return e.type === "pluginpack"; }).length;
    var nPluginsTotal = this.all.reduce(function (n, e) { return n + (e.type === "pluginpack" ? e.plugin_count || 1 : 0); }, 0);
    var nTypepacks = this.all.filter(function (e) { return e.type === "typepack"; }).length;
    var nSkillpacks = this.all.filter(function (e) { return e.type === "skillpack"; }).length;

    this.mount.innerHTML =
      '<div class="vy-community">' +
        '<div class="vy-community__toolbar">' +
          '<div class="vy-search">' + ICON.search.replace("<svg", '<svg class="vy-search__ico"') +
            '<input type="search" id="vy-q" placeholder="Search Plugin Packs, Type Packs & Skill Packs…" autocomplete="off" aria-label="Search">' +
          "</div>" +
          '<div class="vy-seg" role="tablist" aria-label="Type filter">' +
            '<button data-type="all" class="is-active">All</button>' +
            '<button data-type="pluginpack">Plugin Packs</button>' +
            '<button data-type="typepack">Type Packs</button>' +
            '<button data-type="skillpack">Skill Packs</button>' +
          "</div>" +
          (cats.length
            ? '<select class="vy-select" id="vy-cat" aria-label="Category"><option value="all">All categories</option>' +
              cats.map(function (c) { return '<option value="' + escapeAttr(c) + '">' + escapeHtml(cap(c)) + "</option>"; }).join("") +
              "</select>"
            : "") +
          '<select class="vy-select" id="vy-sort" aria-label="Sort">' +
            '<option value="name-asc">Name A→Z</option>' +
            '<option value="name-desc">Name Z→A</option>' +
            '<option value="verified">Verified first</option>' +
            '<option value="type">Group by type</option>' +
          "</select>" +
          '<label class="vy-check"><input type="checkbox" id="vy-verified"> Verified only</label>' +
        "</div>" +
        '<p class="vy-count" id="vy-count"></p>' +
        '<div class="vy-grid" id="vy-grid"></div>' +
      "</div>" +
      '<div class="vy-drawer-backdrop" id="vy-backdrop"></div>' +
      '<aside class="vy-drawer" id="vy-drawer" role="dialog" aria-modal="true" aria-label="Details"></aside>';

    // Wire events
    var q = document.getElementById("vy-q");
    q.addEventListener("input", function () { self.state.q = q.value; self.paint(); });
    Array.prototype.forEach.call(this.mount.querySelectorAll(".vy-seg button"), function (btn) {
      btn.addEventListener("click", function () {
        self.state.type = btn.getAttribute("data-type");
        Array.prototype.forEach.call(self.mount.querySelectorAll(".vy-seg button"), function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        self.paint();
      });
    });
    var cat = document.getElementById("vy-cat");
    if (cat) cat.addEventListener("change", function () { self.state.category = cat.value; self.paint(); });
    var sort = document.getElementById("vy-sort");
    sort.addEventListener("change", function () { self.state.sort = sort.value; self.paint(); });
    var ver = document.getElementById("vy-verified");
    ver.addEventListener("change", function () { self.state.verifiedOnly = ver.checked; self.paint(); });

    var backdrop = document.getElementById("vy-backdrop");
    backdrop.addEventListener("click", function () { self.closeDrawer(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") self.closeDrawer(); });

    this._meta = { nPluginpacks: nPluginpacks, nPluginsTotal: nPluginsTotal, nTypepacks: nTypepacks, nSkillpacks: nSkillpacks };
    this.paint();
  };

  Browser.prototype.paint = function () {
    var self = this;
    var list = this.filtered();
    var grid = document.getElementById("vy-grid");
    var count = document.getElementById("vy-count");

    var m = this._meta;
    count.innerHTML =
      "Showing <strong>" + list.length + "</strong> of " + this.all.length +
      " &middot; <strong>" + m.nPluginpacks + "</strong> Plugin Packs (" + m.nPluginsTotal + " plugins) &middot; <strong>" +
      m.nTypepacks + "</strong> Type Packs &middot; <strong>" +
      m.nSkillpacks + "</strong> Skill Packs";

    if (!list.length) {
      grid.style.display = "block";
      grid.innerHTML =
        '<div class="vy-state">' + ICON.inbox + "<p>No matches. Try clearing filters.</p></div>";
      return;
    }

    grid.style.display = "";
    grid.innerHTML = list.map(function (e, i) { return self.card(e, i); }).join("");
    // The title button is stretched over the whole card (CSS ::after), so this is the card click.
    Array.prototype.forEach.call(grid.querySelectorAll(".vy-pcard__name"), function (el) {
      el.addEventListener("click", function () {
        var idx = parseInt(el.getAttribute("data-idx"), 10);
        self.openDrawer(list[idx]);
      });
    });
  };

  // Chips name only what changes whether a pack works for you; full permissions live in the drawer.
  // Same wording as the app's marketplace cards.
  function chips(e) {
    var out = [];
    if (e.type === "pluginpack") {
      if (e.plugin_count > 1) out.push(chip(e.plugin_count + " plugins"));
      if (e.desktop_only === "all") out.push(chip("Desktop only", "desktop"));
      else if (e.desktop_only === "some") out.push(chip("Some desktop only", "desktop"));
      if ((e.scopes_summary || {}).secret_config) out.push(chip("API key", "key"));
      if ((e.services || []).length) out.push(chip("Vineyard service", "service"));
    } else if (e.type === "typepack") {
      if (typeof e.type_count === "number") out.push(chip(plural(e.type_count, "type")));
    } else {
      if (typeof e.section_count === "number") out.push(chip(plural(e.section_count, "section")));
      var nReq = (e.requires || []).length;
      if (nReq) out.push(chip("Needs " + plural(nReq, "plugin"), "needs"));
    }
    return out.join("");
  }
  // Verified attests to the author, so the tick goes in front of the author's name.
  function author(e) {
    return (e.verified ? '<span class="vy-verified" title="Verified author">' + ICON["badge-check"] + "</span> " : "") +
      escapeHtml(e.author);
  }
  function chip(text, mod) {
    return '<span class="vy-badge' + (mod ? " vy-badge--" + mod : "") + '">' + escapeHtml(text) + "</span>";
  }

  // A plain container with the title as the one real control: the button's ::after covers the
  // card, so the whole card opens the drawer and is a single tab stop. The source link lives in
  // the drawer.
  Browser.prototype.card = function (e, i) {
    return (
      '<div class="vy-pcard">' +
        '<div class="vy-pcard__head">' +
          '<div class="vy-pcard__icon vy-tile--' + e.type + '">' + kindIcon(e) + "</div>" +
          '<div class="vy-pcard__title">' +
            '<button class="vy-pcard__name" data-idx="' + i + '" type="button">' + escapeHtml(e.name) + "</button>" +
            '<div class="vy-pcard__author">' + author(e) +
              " &middot; " + KIND[e.type].label +
              (e.version ? " &middot; v" + escapeHtml(e.version) : "") + "</div>" +
          "</div>" +
        "</div>" +
        '<p class="vy-pcard__desc">' + escapeHtml(e.description || "") + "</p>" +
        '<div class="vy-pcard__foot">' + chips(e) + "</div>" +
      "</div>"
    );
  };

  // --- Detail drawer -------------------------------------------------------
  Browser.prototype.openDrawer = function (e) {
    var self = this;
    var drawer = document.getElementById("vy-drawer");
    var backdrop = document.getElementById("vy-backdrop");
    this._openId = e.identifier || e.name;

    var loading = !e._detail && !!detailUrl(e);
    drawer.innerHTML = this.drawerHtml(e, loading);
    drawer.classList.add("is-open");
    backdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
    this.wireDrawer();

    // Lazy-load the full pack document (type palette / bundled plugins / io) from
    // the content repo via jsDelivr, then re-render — once per entry, only while
    // this entry is still the open one.
    if (loading) {
      var openId = this._openId;
      fetchJson(detailUrl(e))
        .then(function (doc) { mergeDetail(e, doc); })
        .catch(function () { /* detail unavailable — keep card-level view */ })
        .then(function () {
          e._detail = true;
          if (drawer.classList.contains("is-open") && self._openId === openId) {
            drawer.innerHTML = self.drawerHtml(e, false);
            self.wireDrawer();
          }
        });
    }
  };

  Browser.prototype.wireDrawer = function () {
    var self = this;
    var drawer = document.getElementById("vy-drawer");
    if (!drawer) return;
    var close = drawer.querySelector(".vy-drawer__close");
    if (close) {
      close.addEventListener("click", function () { self.closeDrawer(); });
      close.focus();
    }
    Array.prototype.forEach.call(drawer.querySelectorAll("[data-copy]"), function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.getAttribute("data-copy");
        if (navigator.clipboard) navigator.clipboard.writeText(text);
        var old = btn.textContent; btn.textContent = "copied"; setTimeout(function () { btn.textContent = old; }, 1200);
      });
    });
  };

  Browser.prototype.closeDrawer = function () {
    var drawer = document.getElementById("vy-drawer");
    var backdrop = document.getElementById("vy-backdrop");
    if (drawer) drawer.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  Browser.prototype.drawerHtml = function (e, loading) {
    var rows = [];
    if (e.identifier)
      rows.push(kv("Identifier", '<code>' + escapeHtml(e.identifier) + "</code>" +
        '<button class="vy-copybtn" data-copy="' + escapeAttr(e.identifier) + '">copy</button>'));
    if (e.version) rows.push(kv("Version", "<code>" + escapeHtml(e.version) + "</code>"));
    // `platforms` lists every runtime a member declares, so a desktop-only pack still lists web.
    if (e.type === "pluginpack" && (e.platforms || []).length) rows.push(kv("Platforms",
      e.desktop_only === "all" ? "Desktop only"
        : (e.platforms || []).map(cap).join(", ") + (e.desktop_only === "some" ? " (some plugins desktop only)" : "")));
    if (e.repo) rows.push(kv("Repository", sourceUrl(e)
      ? '<a href="' + escapeAttr(sourceUrl(e)) + '" target="_blank" rel="noopener noreferrer"><code>' + escapeHtml(e.repo) + "</code> ↗</a>"
      : '<code>' + escapeHtml(e.repo) + "</code>"));
    if (e.ref) rows.push(kv("Ref", "<code>" + escapeHtml(short(e.ref)) + "</code>"));
    if (e.license) rows.push(kv("License", escapeHtml(e.license)));
    if (e.type === "typepack") {
      if (typeof e.type_count === "number") rows.push(kv("Entity types", String(e.type_count)));
      if (typeof e.edge_count === "number") rows.push(kv("Edge types", String(e.edge_count)));
      if ((e.categories || []).length) rows.push(kv("Categories", (e.categories || []).map(cap).join(", ")));
    }
    if (e.type === "skillpack") {
      if (typeof e.section_count === "number") rows.push(kv("Sections", String(e.section_count)));
      if ((e.applies_to || []).length) rows.push(kv("Applies to", (e.applies_to || []).map(escapeHtml).join(", ")));
      if ((e.requires || []).length)
        rows.push(kv("Requires", (e.requires || []).map(function (r) { return "<code>" + escapeHtml(r) + "</code>"; }).join(" ")));
    }

    var body = "";

    // Permissions (plugins) — neutral, no destructive warnings (per SPEC §8)
    if (e.type === "pluginpack") {
      var perms = permissionLines(e);
      body +=
        "<h4>Permissions</h4>" +
        (perms.length
          ? perms.map(function (p) {
              return '<div class="vy-perm"><span class="vy-perm__ico">' + icon(p.icon) + "</span><span>" + escapeHtml(p.text) + "</span></div>";
            }).join("")
          : '<p style="font-size:.8rem;color:var(--vy-text-muted)">No special permissions — pure compute, no data or network access.</p>');

      // io chips
      if (e.io && ((e.io.consumes || []).length || (e.io.produces || []).length)) {
        body += "<h4>Data flow</h4><div class=\"vy-chiprow\">";
        (e.io.consumes || []).forEach(function (c) {
          body += '<span class="vy-typechip">consumes · ' + escapeHtml(c.category ? c.category + "." + c.name : (c.name || "?")) + "</span>";
        });
        (e.io.produces || []).forEach(function (c) {
          body += '<span class="vy-typechip">produces · ' + escapeHtml(c.category ? c.category + "." + c.name : (c.name || "?")) + "</span>";
        });
        body += "</div>";
      }

      // contained plugins (packs)
      if ((e.plugins || []).length) {
        body += "<h4>Bundled plugins (" + e.plugins.length + ")</h4>";
        body += e.plugins.map(function (p) {
          return '<div class="vy-perm"><span class="vy-perm__ico">' + icon(p.icon, "puzzle") + "</span><span><strong>" +
            escapeHtml(p.name) + "</strong>" + (p.description ? " — " + escapeHtml(p.description) : "") + "</span></div>";
        }).join("");
      }
    }

    // Type palette (typepacks)
    if (e.type === "typepack" && (e.types || []).length) {
      body += "<h4>Type palette</h4><div class=\"vy-chiprow\">";
      body += e.types.map(function (t) {
        var color = t.color || "#8b5cf6";
        return '<span class="vy-typechip"><span class="vy-dot" style="background:' + escapeAttr(color) + '"></span>' +
          escapeHtml(t.display_name || t.label || t.name) + "</span>";
      }).join("");
      body += "</div>";
      if ((e.edge_types || []).length) {
        body += "<h4>Edge types</h4><div class=\"vy-chiprow\">";
        body += e.edge_types.map(function (t) {
          return '<span class="vy-typechip">' + escapeHtml(t.label || t.name) + "</span>";
        }).join("");
        body += "</div>";
      }
    }

    // Skill Packs are text — the whole playbook can be shown before install.
    if (e.type === "skillpack") {
      if (e.overview) {
        body += "<h4>Playbook</h4><pre class=\"vy-skill-overview\">" + escapeHtml(e.overview) + "</pre>";
      }
      if ((e.sections || []).length) {
        body += "<h4>Sections</h4>";
        body += e.sections.map(function (s) {
          return '<div class="vy-perm"><span class="vy-perm__ico">' + icon("book-open") + "</span><span><strong>" +
            escapeHtml(s.id || "") + "</strong>" + (s.summary ? " — " + escapeHtml(s.summary) : "") + "</span></div>";
        }).join("");
      }
      if ((e.requires || []).length) {
        body += '<div class="vy-perm"><span class="vy-perm__ico">' + icon("puzzle") + "</span><span>" +
          "Uses " + e.requires.length + " Plugin Pack" + (e.requires.length > 1 ? "s" : "") +
          " — installing offers to add " + (e.requires.length > 1 ? "them" : "it") + " too.</span></div>";
      }
    }

    if (loading) body += '<p class="vy-loading" style="font-size:.85rem;color:var(--vy-text-muted);margin:.5rem 0 0">Loading details…</p>';

    // NO install button here, deliberately. This site is a read-only browser — installing happens
    // inside the app, and nothing on this page can start it. The button that used to sit at the
    // bottom of this drawer had no click handler at all (wireDrawer binds only .vy-drawer__close
    // and [data-copy]), so it was a control that looked like the primary action of the page and
    // did nothing when pressed. A dead primary button is worse than no button.
    return (
      '<button class="vy-drawer__close" aria-label="Close">' + ICON.x + "</button>" +
      '<div class="vy-drawer__head">' +
        '<div class="vy-drawer__icon vy-tile--' + e.type + '">' + kindIcon(e) + "</div>" +
        "<div>" +
          "<h2>" + escapeHtml(e.name) + "</h2>" +
          '<div class="vy-drawer__author">' + author(e) +
            " &middot; " + KIND[e.type].label + "</div>" +
        "</div>" +
      "</div>" +
      '<p class="vy-drawer__desc">' + escapeHtml(e.description || "") + "</p>" +
      body +
      "<h4>Details</h4><dl class=\"vy-kv\">" + rows.join("") + "</dl>"
    );
  };

  function permissionLines(e) {
    var out = [];
    var ss = e.scopes_summary || {};
    var g = (e.scopes && e.scopes.graph) || [];
    if (g.length) {
      var verbs = g.map(function (s) { return s.split(":")[1] || s; });
      var uniq = verbs.filter(function (v, i) { return verbs.indexOf(v) === i; });
      out.push({ icon: "layers", text: "Graph: " + uniq.join(", ") + " nodes/edges in this project." });
    } else if (ss.graph_write) {
      out.push({ icon: "layers", text: "Reads and writes graph nodes/edges in this project." });
    }
    if (ss.network || (e.scopes && (e.scopes.network || []).length)) {
      out.push({ icon: "globe", text: "Network: calls a declared external endpoint." });
    }
    if (ss.publish || (e.scopes && (e.scopes.publish || []).length)) {
      out.push({ icon: "pen-square", text: "Publish: can post messages to the project." });
    }
    if (ss.secret_config || (e.scopes && (e.scopes.config || []).length)) {
      out.push({ icon: "key", text: "Config: asks for values such as an API key when you run it, and keeps them as secrets." });
    }
    return out;
  }

  // Merge a pack's full document (jsDelivr) into the card-level entry so the
  // drawer can show the type palette / bundled plugins / io the lean index omits.
  function mergeDetail(e, doc) {
    if (!doc) return;
    if (e.type === "typepack") {
      e.types = doc.types || doc.node_types || [];
      e.edge_types = doc.edge_types || [];
    } else if (e.type === "skillpack") {
      e.overview = typeof doc.overview === "string" ? doc.overview : "";
      e.sections = Array.isArray(doc.sections) ? doc.sections : [];
    } else if (Array.isArray(doc.plugins)) {
      e.plugins = doc.plugins;
    } else {
      e.io = doc.io;
      e.scopes = doc.scopes;
    }
    if (!e.license && doc.license) e.license = doc.license;
  }

  // --- helpers -------------------------------------------------------------
  function kv(k, v) { return "<dt>" + escapeHtml(k) + "</dt><dd>" + v + "</dd>"; }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function plural(n, word) { return n + " " + word + (n === 1 ? "" : "s"); }
  function short(r) { r = String(r); return /^[0-9a-f]{40}$/i.test(r) ? r.slice(0, 10) + "…" : r; }
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function escapeAttr(s) { return escapeHtml(s); }

  function renderSkeleton(mount) {
    var cards = "";
    for (var i = 0; i < 6; i++) cards += '<div class="vy-skel"></div>';
    mount.innerHTML = '<div class="vy-grid" style="margin-top:3.5rem">' + cards + "</div>";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
