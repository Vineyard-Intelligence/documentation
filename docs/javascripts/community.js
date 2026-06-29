/* ============================================================================
   VINEYARD.RUN community browser — fully static, client-side only.
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
    ])
      .then(function (res) {
        if (res[0] === null && res[1] === null) throw new Error("registry unreachable");
        var entries = normalize([].concat(res[0] || [], res[1] || []));
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

  // --- Inline icon set (lucide-style, 24x24, stroke=currentColor) ----------
  var P = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
  var E = "</svg>";
  var ICON = {
    boxes: P + '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 8.5l-5 3Z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/>' + E,
    skull: P + '<path d="m12.5 17-.5-1-.5 1h1z"/><path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="12" r="1"/>' + E,
    target: P + '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>' + E,
    "hand-sparkles": P + '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>' + E,
    "circle-dot": P + '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>' + E,
    sparkles: P + '<path d="M9.94 14.34A2 2 0 0 0 8.66 13L3.4 11.3a.6.6 0 0 1 0-1.14L8.66 8.4a2 2 0 0 0 1.28-1.28l1.7-5.26a.6.6 0 0 1 1.14 0l1.7 5.26a2 2 0 0 0 1.28 1.28l5.26 1.7a.6.6 0 0 1 0 1.14L17.06 13a2 2 0 0 0-1.28 1.28l-1.7 5.26a.6.6 0 0 1-1.14 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>' + E,
    box: P + '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>' + E,
    sitemap: P + '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/>' + E,
    "shield-alert": P + '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>' + E,
    network: P + '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8"/>' + E,
    bug: P + '<path d="m8 2 1.88 1.88M14.12 3.88 16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-2.1 1.7-3.9 3.8-4M20.97 5c0 2.1-1.6 3.8-3.5 4M4 13H2M22 13h-4M17.2 17c2.1.1 3.8 1.9 3.8 4"/>' + E,
    layers: P + '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.84Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>' + E,
    grape: P + '<path d="M22 5V2l-5.89 5.89"/><circle cx="16.6" cy="15.89" r="3"/><circle cx="8.11" cy="7.4" r="3"/><circle cx="12.35" cy="11.65" r="3"/><circle cx="13.91" cy="5.85" r="3"/><circle cx="18.15" cy="10.09" r="3"/><circle cx="6.56" cy="13.2" r="3"/><circle cx="10.8" cy="17.44" r="3"/><circle cx="5" cy="19" r="3"/>' + E,
    globe: P + '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>' + E,
    "pen-square": P + '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>' + E,
    key: P + '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>' + E,
    check: P + '<path d="M20 6 9 17l-5-5"/>' + E,
    "badge-check": P + '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>' + E,
    search: P + '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>' + E,
    x: P + '<path d="M18 6 6 18M6 6l12 12"/>' + E,
    alert: P + '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>' + E,
    download: P + '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>' + E,
    package: P + '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="m7.5 4.27 9 5.15"/>' + E,
    "git-branch": P + '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>' + E,
    inbox: P + '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>' + E,
  };
  function icon(name) {
    return ICON[name] || ICON.package;
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
      e.type = e.type || (e.content_type === "vineyard:typepack" ? "typepack" : "pluginpack");
      e.name = e.name || e.identifier || "Untitled";
      e.author = typeof e.author === "object" && e.author ? e.author.name : e.author || "—";
      e.categories = e.categories || [];
      e.icon = e.icon || (e.type === "typepack" ? "layers" : "package");
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
    var nPlugins = this.all.filter(function (e) { return e.type === "pluginpack"; }).length;
    var nPacks = this.all.reduce(function (n, e) { return n + (e.type === "pluginpack" && e.plugin_count > 1 ? e.plugin_count : 0); }, 0);
    var nTypepacks = this.all.filter(function (e) { return e.type === "typepack"; }).length;

    this.mount.innerHTML =
      '<div class="vy-community">' +
        '<div class="vy-community__toolbar">' +
          '<div class="vy-search">' + ICON.search.replace("<svg", '<svg class="vy-search__ico"') +
            '<input type="search" id="vy-q" placeholder="Search Plugin Packs & Type Packs…" autocomplete="off" aria-label="Search">' +
          "</div>" +
          '<div class="vy-seg" role="tablist" aria-label="Type filter">' +
            '<button data-type="all" class="is-active">All</button>' +
            '<button data-type="pluginpack">Plugin Packs</button>' +
            '<button data-type="typepack">Type Packs</button>' +
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

    this._meta = { nPlugins: nPlugins, nPacks: nPacks, nTypepacks: nTypepacks };
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
      " &middot; <strong>" + m.nPlugins + "</strong> Plugin Packs (" + m.nPacks + " bundled) &middot; <strong>" +
      m.nTypepacks + "</strong> Type Packs";

    if (!list.length) {
      grid.style.display = "block";
      grid.innerHTML =
        '<div class="vy-state">' + ICON.inbox + "<p>No matches. Try clearing filters.</p></div>";
      return;
    }

    grid.style.display = "";
    grid.innerHTML = list.map(function (e, i) { return self.card(e, i); }).join("");
    // attach click handlers via index
    Array.prototype.forEach.call(grid.querySelectorAll(".vy-pcard"), function (el) {
      el.addEventListener("click", function () {
        var idx = parseInt(el.getAttribute("data-idx"), 10);
        self.openDrawer(list[idx]);
      });
    });
  };

  Browser.prototype.card = function (e, i) {
    var badges = [];
    badges.push('<span class="vy-badge ' + (e.type === "typepack" ? "vy-badge--typepack" : "vy-badge--type") + '">' +
      (e.type === "typepack" ? "Type Pack" : (e.plugin_count > 1 ? "Pack · " + e.plugin_count : "Plugin Pack")) + "</span>");

    if (e.type === "pluginpack") {
      (e.platforms || []).forEach(function (p) {
        badges.push('<span class="vy-badge vy-badge--platform">' + escapeHtml(p) + "</span>");
      });
      var ss = e.scopes_summary || {};
      if (ss.network) badges.push('<span class="vy-badge vy-badge--net">network</span>');
      if (ss.graph_write) badges.push('<span class="vy-badge vy-badge--write">graph write</span>');
    } else {
      if (typeof e.type_count === "number")
        badges.push('<span class="vy-badge">' + e.type_count + " types</span>");
      if (e.edge_count) badges.push('<span class="vy-badge">' + e.edge_count + " edges</span>");
      badges.push('<span class="vy-badge vy-badge--schema">schema only</span>');
    }

    return (
      '<button class="vy-pcard" data-idx="' + i + '" type="button">' +
        '<div class="vy-pcard__head">' +
          '<div class="vy-pcard__icon">' + icon(e.icon) + "</div>" +
          '<div class="vy-pcard__title">' +
            '<div class="vy-pcard__name">' + escapeHtml(e.name) +
              (e.verified ? '<span class="vy-verified" title="Verified author">' + ICON["badge-check"] + "</span>" : "") +
            "</div>" +
            '<div class="vy-pcard__author">by ' + escapeHtml(e.author) + "</div>" +
          "</div>" +
        "</div>" +
        '<p class="vy-pcard__desc">' + escapeHtml(e.description || "") + "</p>" +
        '<div class="vy-pcard__foot">' + badges.join("") + "</div>" +
      "</button>"
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
    if (e.type === "pluginpack" && (e.platforms || []).length) rows.push(kv("Platforms", (e.platforms || []).map(cap).join(", ")));
    if (e.repo) rows.push(kv("Repository", '<code>' + escapeHtml(e.repo) + "</code>"));
    if (e.ref) rows.push(kv("Ref", "<code>" + escapeHtml(short(e.ref)) + "</code>"));
    if (e.license) rows.push(kv("License", escapeHtml(e.license)));
    if (e.type === "typepack") {
      if (typeof e.type_count === "number") rows.push(kv("Entity types", String(e.type_count)));
      if (typeof e.edge_count === "number") rows.push(kv("Edge types", String(e.edge_count)));
      if ((e.categories || []).length) rows.push(kv("Categories", (e.categories || []).map(cap).join(", ")));
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
          return '<div class="vy-perm"><span class="vy-perm__ico">' + icon(p.icon) + "</span><span><strong>" +
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

    if (loading) body += '<p class="vy-loading" style="font-size:.85rem;color:var(--vy-text-muted);margin:.5rem 0 0">Loading details…</p>';

    var installNote =
      e.type === "typepack"
        ? "Activate this Type Pack from inside a Vineyard project."
        : "Install runs in the Vineyard app — scopes are shown again for approval before activation.";

    return (
      '<button class="vy-drawer__close" aria-label="Close">' + ICON.x + "</button>" +
      '<div class="vy-drawer__head">' +
        '<div class="vy-drawer__icon">' + icon(e.icon) + "</div>" +
        "<div>" +
          "<h2>" + escapeHtml(e.name) +
            (e.verified ? ' <span class="vy-verified" title="Verified author">' + ICON["badge-check"] + "</span>" : "") +
          "</h2>" +
          '<div class="vy-drawer__author">by ' + escapeHtml(e.author) +
            ' &middot; ' + (e.type === "typepack" ? "Type Pack" : (e.plugin_count > 1 ? "Plugin Pack" : "Plugin Pack")) + "</div>" +
        "</div>" +
      "</div>" +
      '<p class="vy-drawer__desc">' + escapeHtml(e.description || "") + "</p>" +
      body +
      "<h4>Details</h4><dl class=\"vy-kv\">" + rows.join("") + "</dl>" +
      '<button class="vy-drawer__install" type="button">' + ICON.download + " " +
        (e.type === "typepack" ? "Activate Type Pack" : "Install Plugin Pack") + "</button>" +
      '<p class="vy-drawer__note">' + escapeHtml(installNote) + "</p>"
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
      out.push({ icon: "key", text: "Config: requires install-time configuration values." });
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
    } else if (Array.isArray(doc.plugins)) {
      e.plugins = doc.plugins;
    } else {
      e.io = doc.io;
      e.scopes = doc.scopes;
    }
    if (doc.icon) e.icon = doc.icon;
    if (!e.license && doc.license) e.license = doc.license;
  }

  // --- helpers -------------------------------------------------------------
  function kv(k, v) { return "<dt>" + escapeHtml(k) + "</dt><dd>" + v + "</dd>"; }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
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
