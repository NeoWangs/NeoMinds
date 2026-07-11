(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;
  var searchData;
  var explorerData;
  var graphData;

  function fetchJson(attribute) {
    var url = body.getAttribute(attribute);
    if (!url) return Promise.resolve([]);
    return fetch(url).then(function (response) {
      return response.ok ? response.json() : Promise.reject(new Error("Unable to load " + url));
    }).catch(function () { return []; });
  }

  function setBodyLock(locked) {
    body.style.overflow = locked ? "hidden" : "";
  }

  function toggleTheme() {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("oj-theme", next); } catch (error) {}
    window.setTimeout(refreshGraphs, 0);
  }

  function setReaderMode(reading, persist) {
    body.classList.toggle("reading-mode", reading);
    document.querySelectorAll("[data-reader-toggle]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(reading));
    });
    if (persist) {
      try { localStorage.setItem("oj-reader", reading ? "on" : "off"); } catch (error) {}
    }
  }

  function toggleReader() {
    setReaderMode(!body.classList.contains("reading-mode"), true);
  }

  function createSearchResult(item) {
    var link = document.createElement("a");
    var title = document.createElement("strong");
    var meta = document.createElement("span");
    var summary = document.createElement("p");
    link.className = "search-result";
    link.href = item.url;
    title.textContent = item.title;
    meta.textContent = item.date + " · " + (item.category || "笔记");
    summary.textContent = item.summary || "";
    link.appendChild(title);
    link.appendChild(meta);
    link.appendChild(summary);
    return link;
  }

  function renderSearch(query) {
    var results = document.querySelector("[data-search-results]");
    if (!results || !searchData) return;
    results.replaceChildren();
    var normalized = query.trim().toLocaleLowerCase();
    if (!normalized) {
      var hint = document.createElement("p");
      hint.className = "search-empty";
      hint.textContent = "从标题、标签和正文中寻找。";
      results.appendChild(hint);
      return;
    }
    var matches = searchData.filter(function (item) {
      var haystack = [item.title, item.category, (item.tags || []).join(" "), item.summary].join(" ").toLocaleLowerCase();
      return haystack.indexOf(normalized) !== -1;
    }).slice(0, 12);
    if (!matches.length) {
      var empty = document.createElement("p");
      empty.className = "search-empty";
      empty.textContent = "这片花园里暂时还没有这个词。";
      results.appendChild(empty);
      return;
    }
    matches.forEach(function (item) { results.appendChild(createSearchResult(item)); });
  }

  function openSearch() {
    var dialog = document.querySelector("[data-search-dialog]");
    var input = document.querySelector("[data-search-input]");
    if (!dialog || !input) return;
    dialog.classList.add("is-open");
    dialog.setAttribute("aria-hidden", "false");
    setBodyLock(true);
    window.setTimeout(function () { input.focus(); }, 20);
    if (searchData) return renderSearch(input.value);
    fetchJson("data-search-index").then(function (items) {
      searchData = items;
      renderSearch(input.value);
    });
  }

  function closeSearch() {
    var dialog = document.querySelector("[data-search-dialog]");
    if (!dialog) return;
    dialog.classList.remove("is-open");
    dialog.setAttribute("aria-hidden", "true");
    setBodyLock(false);
  }

  function sortKeys(object) {
    return Object.keys(object).sort(function (a, b) { return a.localeCompare(b, "zh-Hans-CN"); });
  }

  function buildExplorer() {
    var target = document.querySelector("[data-explorer-tree]");
    if (!target || !explorerData) return;
    var tree = { folders: {}, files: [] };
    explorerData.forEach(function (item) {
      var pieces = (item.path || "").split("/").filter(Boolean);
      pieces.pop();
      var cursor = tree;
      pieces.forEach(function (piece) {
        if (!cursor.folders[piece]) cursor.folders[piece] = { folders: {}, files: [] };
        cursor = cursor.folders[piece];
      });
      cursor.files.push(item);
    });
    var currentSlug = body.getAttribute("data-current-slug") || "";
    var currentUrl = body.getAttribute("data-current-url") || "";

    function isCurrent(file) {
      return currentUrl ? file.url === currentUrl : file.slug === currentSlug;
    }

    function hasCurrent(node) {
      return node.files.some(isCurrent) || sortKeys(node.folders).some(function (key) { return hasCurrent(node.folders[key]); });
    }

    function renderNode(node, depth) {
      var list = document.createElement("ul");
      sortKeys(node.folders).forEach(function (name) {
        var child = node.folders[name];
        var item = document.createElement("li");
        var button = document.createElement("button");
        var arrow = document.createElement("span");
        arrow.className = "explorer-folder__arrow";
        arrow.textContent = "⌄";
        button.className = "explorer-folder";
        button.type = "button";
        button.appendChild(arrow);
        button.appendChild(document.createTextNode(name));
        var nested = renderNode(child, depth + 1);
        var expanded = hasCurrent(child);
        button.classList.toggle("is-collapsed", !expanded);
        button.setAttribute("aria-expanded", String(expanded));
        button.addEventListener("click", function () {
          var collapsed = !button.classList.contains("is-collapsed");
          button.classList.toggle("is-collapsed", collapsed);
          button.setAttribute("aria-expanded", String(!collapsed));
        });
        item.appendChild(button);
        item.appendChild(nested);
        list.appendChild(item);
      });
      node.files.sort(function (a, b) { return a.title.localeCompare(b.title, "zh-Hans-CN"); }).forEach(function (file) {
        var item = document.createElement("li");
        var link = document.createElement("a");
        var current = isCurrent(file);
        link.className = "explorer-file" + (current ? " is-current" : "");
        link.href = file.url;
        link.textContent = file.title;
        if (current) link.setAttribute("aria-current", "page");
        item.appendChild(link);
        list.appendChild(item);
      });
      return list;
    }

    target.replaceChildren(renderNode(tree, 0));
    var currentLink = target.querySelector(".explorer-file.is-current");
    var sidebar = target.closest("[data-left-sidebar]");
    if (currentLink && sidebar) {
      window.requestAnimationFrame(function () {
        var sidebarRect = sidebar.getBoundingClientRect();
        var linkRect = currentLink.getBoundingClientRect();
        var centeredOffset = linkRect.top - sidebarRect.top - (sidebar.clientHeight - linkRect.height) / 2;
        sidebar.scrollTop = Math.max(0, sidebar.scrollTop + centeredOffset);
      });
    }
  }

  function initExplorer() {
    var rootExplorer = document.querySelector("[data-explorer]");
    var toggle = document.querySelector("[data-explorer-toggle]");
    if (toggle && rootExplorer) {
      toggle.addEventListener("click", function () {
        var collapsed = !rootExplorer.classList.contains("is-collapsed");
        rootExplorer.classList.toggle("is-collapsed", collapsed);
        toggle.setAttribute("aria-expanded", String(!collapsed));
      });
    }
    fetchJson("data-explorer-index").then(function (items) { explorerData = items; buildExplorer(); });
  }

  function closeMobileExplorer() {
    var sidebar = document.querySelector("[data-left-sidebar]");
    var button = document.querySelector("[data-explorer-mobile]");
    if (!sidebar) return;
    sidebar.classList.remove("is-open");
    if (button) button.setAttribute("aria-expanded", "false");
  }

  function initMobileExplorer() {
    var sidebar = document.querySelector("[data-left-sidebar]");
    var button = document.querySelector("[data-explorer-mobile]");
    if (!sidebar || !button) return;
    button.addEventListener("click", function () {
      var open = !sidebar.classList.contains("is-open");
      sidebar.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", function (event) {
      if (window.innerWidth > 760 || !sidebar.classList.contains("is-open")) return;
      if (!sidebar.contains(event.target) && !button.contains(event.target)) closeMobileExplorer();
    });
  }

  function slugifyHeading(text, index) {
    return "section-" + (index + 1) + "-" + text.trim().toLocaleLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function generateToc() {
    var content = document.querySelector("[data-post-content]");
    var target = document.querySelector("[data-article-toc-links]");
    if (!content || !target) return;
    var headings = content.querySelectorAll("h2, h3");
    if (!headings.length) return;
    var links = [];
    Array.prototype.forEach.call(headings, function (heading, index) {
      if (!heading.id) heading.id = slugifyHeading(heading.textContent, index);
      var link = document.createElement("a");
      link.href = "#" + heading.id;
      link.textContent = heading.textContent;
      link.dataset.level = heading.tagName.slice(1);
      link.dataset.read = "unread";
      link.setAttribute("aria-label", "未读：" + heading.textContent);
      target.appendChild(link);
      links.push(link);
    });

    var status = document.querySelector("[data-toc-status]");
    var ticking = false;

    function updateTocState() {
      var threshold = Math.max(116, window.innerHeight * 0.3);
      var currentIndex = -1;
      Array.prototype.forEach.call(headings, function (heading, index) {
        if (heading.getBoundingClientRect().top <= threshold) currentIndex = index;
      });

      var activeIndex = currentIndex === -1 ? 0 : currentIndex;
      var readCount = Math.max(0, currentIndex + 1);
      links.forEach(function (link, index) {
        var read = index <= currentIndex;
        var current = index === activeIndex;
        link.dataset.read = read ? "read" : "unread";
        link.classList.toggle("is-current", current);
        link.setAttribute("aria-current", current ? "location" : "false");
        link.setAttribute("aria-label", (read ? "已读：" : "未读：") + link.textContent);
      });
      if (status) status.textContent = readCount + "/" + headings.length + " 已读";
      ticking = false;
    }

    function requestTocUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateTocState);
    }

    links.forEach(function (link) {
      link.addEventListener("click", function () { window.setTimeout(requestTocUpdate, 90); });
    });
    window.addEventListener("scroll", requestTocUpdate, { passive: true });
    window.addEventListener("resize", requestTocUpdate);
    updateTocState();
  }

  function initProgress() {
    var content = document.querySelector("[data-post-content]");
    var bar = document.querySelector("[data-reading-progress]");
    if (!content || !bar) return;
    function updateProgress() {
      var start = content.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.18;
      var end = content.getBoundingClientRect().bottom + window.scrollY - window.innerHeight * 0.55;
      var progress = Math.max(0, Math.min(1, (window.scrollY - start) / Math.max(1, end - start)));
      bar.style.width = (progress * 100).toFixed(2) + "%";
    }
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  function graphTagCounts(data) {
    var counts = {};
    data.forEach(function (node) {
      (node.tags || []).forEach(function (tag) { counts[tag] = (counts[tag] || 0) + 1; });
    });
    return counts;
  }

  function pickGraphNodes(data, currentId, full) {
    var byId = {};
    data.forEach(function (node) { byId[node.id] = node; });
    if (full) {
      var tagCounts = graphTagCounts(data);
      return data.filter(function (node) {
        var hasNoteLink = (node.links || []).length || data.some(function (other) { return (other.links || []).indexOf(node.id) !== -1; });
        var hasSharedTag = (node.tags || []).some(function (tag) { return tagCounts[tag] > 1; });
        return hasNoteLink || hasSharedTag;
      });
    }
    if (currentId && byId[currentId]) {
      var current = byId[currentId];
      var incoming = data.filter(function (node) { return (node.links || []).indexOf(currentId) !== -1; });
      var related = [current].concat((current.links || []).map(function (id) { return byId[id]; }).filter(Boolean), incoming);
      var unique = [];
      related.forEach(function (node) { if (node && unique.indexOf(node) === -1) unique.push(node); });
      return unique.slice(0, 28);
    }
    return data.slice().sort(function (left, right) {
      var leftDegree = (left.links || []).length + data.filter(function (node) { return (node.links || []).indexOf(left.id) !== -1; }).length;
      var rightDegree = (right.links || []).length + data.filter(function (node) { return (node.links || []).indexOf(right.id) !== -1; }).length;
      return rightDegree - leftDegree;
    }).slice(0, 22);
  }

  function graphTheme() {
    var style = window.getComputedStyle(root);
    return {
      accent: style.getPropertyValue("--accent").trim(),
      graph: style.getPropertyValue("--graph").trim(),
      line: style.getPropertyValue("--line-strong").trim(),
      surface: style.getPropertyValue("--surface").trim(),
      text: style.getPropertyValue("--text").trim(),
      muted: style.getPropertyValue("--muted").trim()
    };
  }

  function graphCategoryColors(nodes) {
    var palette = ["#436b58", "#577aa5", "#9b6a54", "#7d6aa7", "#9b8450", "#4e8a8a", "#a35f76", "#66855b"];
    var categories = Array.from(new Set(nodes.map(function (node) { return node.category || "其他"; }))).sort();
    var colors = {};
    categories.forEach(function (category, index) { colors[category] = palette[index % palette.length]; });
    return colors;
  }

  function graphLabel(title, full) {
    var limit = full ? 17 : 13;
    var text = title || "未命名笔记";
    return text.length > limit ? text.slice(0, limit) + "…" : text;
  }

  function tagLabel(tag, full) {
    var limit = full ? 7 : 9;
    var text = tag || "未命名标签";
    return "#" + (text.length > limit ? text.slice(0, limit) + "…" : text);
  }

  function graphElements(nodes, currentId, full) {
    var included = new Set(nodes.map(function (node) { return node.id; }));
    var colors = graphCategoryColors(nodes);
    var tagCounts = graphTagCounts(nodes);
    var current = nodes.find(function (node) { return node.id === currentId; });
    var currentTags = new Set((current && current.tags) || []);
    var tagNodes = {};
    var noteEdgeCount = 0;
    var tagEdgeCount = 0;
    var tagEdges = [];
    var elements = nodes.map(function (node) {
      return {
        data: {
          id: node.id,
          label: graphLabel(node.title, full),
          title: node.title,
          url: node.url,
          color: colors[node.category || "其他"],
          kind: "note",
          current: node.id === currentId ? "yes" : "no"
        }
      };
    });
    nodes.forEach(function (node) {
      (node.links || []).forEach(function (targetId) {
        if (!included.has(targetId)) return;
        noteEdgeCount += 1;
        elements.push({ data: { id: "link:" + node.id + ":" + targetId, source: node.id, target: targetId, relation: "note" } });
      });
      (node.tags || []).forEach(function (tag) {
        // In the global view, a tag is useful when it joins two or more
        // displayed notes.  In the local view, always keep the current
        // note's own tags so the small graph explains its context.
        if (full ? tagCounts[tag] < 2 : (!currentTags.has(tag) && tagCounts[tag] < 2)) return;
        var tagId = "tag:" + encodeURIComponent(tag);
        tagNodes[tagId] = { id: tagId, tag: tag, count: tagCounts[tag] };
        tagEdgeCount += 1;
        tagEdges.push({ data: { id: "tag-link:" + node.id + ":" + encodeURIComponent(tag), source: node.id, target: tagId, relation: "tag" } });
      });
    });
    Object.keys(tagNodes).sort(function (left, right) { return tagNodes[left].tag.localeCompare(tagNodes[right], "zh-Hans-CN"); }).forEach(function (tagId) {
      var tag = tagNodes[tagId];
      elements.push({
        data: {
          id: tag.id,
          label: tagLabel(tag.tag, full),
          title: "#" + tag.tag,
          kind: "tag",
          count: tag.count,
          current: "no"
        }
      });
    });
    elements = elements.concat(tagEdges);
    return { elements: elements, tagCount: Object.keys(tagNodes).length, noteEdgeCount: noteEdgeCount, tagEdgeCount: tagEdgeCount };
  }

  function graphTooltip(target) {
    var tooltip = document.createElement("span");
    tooltip.className = "graph-tooltip";
    tooltip.hidden = true;
    target.appendChild(tooltip);
    return tooltip;
  }

  function renderGraphSummary(target, nodes, graph, full) {
    var summary = document.createElement("div");
    var heading = document.createElement("strong");
    var detail = document.createElement("p");
    var list = document.createElement("ul");
    summary.className = "graph-summary";
    heading.textContent = "关系数据已加载";
    detail.textContent = full ? nodes.length + " 篇笔记 · " + graph.tagCount + " 个标签 · " + graph.noteEdgeCount + " 条双链" : nodes.length + " 篇相关笔记 · " + graph.tagCount + " 个标签";
    list.className = "graph-summary__list";
    nodes.slice(0, full ? 10 : 6).forEach(function (node) {
      var item = document.createElement("li");
      var link = document.createElement(node.url ? "a" : "span");
      link.textContent = node.title;
      if (node.url) link.href = node.url;
      item.appendChild(link);
      list.appendChild(item);
    });
    summary.appendChild(heading);
    summary.appendChild(detail);
    summary.appendChild(list);
    target.appendChild(summary);
  }

  function drawGraph(target, full) {
    if (!target || !graphData) return;
    if (target._cytoscape) target._cytoscape.destroy();
    target.replaceChildren();
    var currentId = target.getAttribute("data-current-slug") || body.getAttribute("data-current-slug") || "";
    var nodes = pickGraphNodes(graphData, currentId, full);
    var graph = graphElements(nodes, currentId, full);
    var status = full ? document.querySelector("[data-global-graph-status]") : document.querySelector("[data-knowledge-graph-status]");
    if (full) {
      target.setAttribute("aria-label", "所有笔记关系图，展示 " + nodes.length + " 篇笔记、" + graph.tagCount + " 个标签、" + graph.noteEdgeCount + " 条笔记关联和 " + graph.tagEdgeCount + " 条标签关联");
      if (status) {
        var hiddenCount = graphData.length - nodes.length;
        status.textContent = "展示 " + nodes.length + " 篇笔记、" + graph.tagCount + " 个共享标签、" + graph.noteEdgeCount + " 条双链、" + graph.tagEdgeCount + " 条标签关联" + (hiddenCount ? "；已收起 " + hiddenCount + " 篇未关联笔记" : "") + "。圆点是笔记，方形是标签；已聚焦核心网络，点“适配视图”查看全貌。";
      }
    } else if (status) {
      status.textContent = nodes.length + " 篇相关笔记 · " + graph.tagCount + " 个关联标签";
    }
    if (typeof window.cytoscape !== "function") {
      renderGraphSummary(target, nodes, graph, full);
      return;
    }
    if (!nodes.length) {
      var empty = document.createElement("p");
      empty.className = "graph-empty";
      empty.textContent = "正在等待知识网络生长。";
      target.appendChild(empty);
      return;
    }
    var theme = graphTheme();
    var tooltip = graphTooltip(target);
    var cy = window.cytoscape({
      container: target,
      elements: graph.elements,
      minZoom: full ? 0.14 : 0.55,
      maxZoom: 3.4,
      boxSelectionEnabled: false,
      style: [
        { selector: "node", style: { "background-color": "data(color)", label: "data(label)", color: theme.text, "font-family": '"Noto Sans SC", "PingFang SC", sans-serif', "font-size": full ? 9 : 10, "text-wrap": "wrap", "text-max-width": full ? 108 : 94, "text-outline-width": 2, "text-outline-color": theme.surface, "text-background-color": theme.surface, "text-background-opacity": full ? 0.82 : 0, "text-background-padding": full ? 1 : 0, "text-valign": "bottom", "text-margin-y": 5, width: full ? 10 : 14, height: full ? 10 : 14, "border-width": 1.5, "border-color": theme.surface } },
        { selector: "node[kind = 'tag']", style: { "background-color": theme.accent, shape: "round-rectangle", width: full ? 66 : 78, height: full ? 18 : 20, "font-size": full ? 8 : 9, "text-valign": "center", "text-margin-y": 0, "text-background-opacity": 0, "border-width": 1, "border-color": theme.surface } },
        { selector: "node[current = 'yes']", style: { "background-color": theme.accent, width: full ? 16 : 21, height: full ? 16 : 21, "border-width": 3, "border-color": theme.graph } },
        { selector: "edge", style: { width: 1.15, "line-color": theme.line, "target-arrow-color": theme.line, "target-arrow-shape": "triangle", "arrow-scale": 0.55, "curve-style": "bezier", opacity: 0.72 } },
        { selector: "edge[relation = 'tag']", style: { width: 0.9, "line-style": "dashed", "line-color": theme.accent, "target-arrow-shape": "none", opacity: 0.52 } }
      ],
      layout: { name: "cose", animate: !full, animationDuration: 420, fit: true, padding: full ? 35 : 18, nodeRepulsion: function () { return full ? 5800 : 5200; }, idealEdgeLength: function () { return full ? 70 : 65; }, gravity: 0.34, numIter: full ? 1500 : 700, randomize: true }
    });
    target._cytoscape = cy;
    if (full) {
      window.requestAnimationFrame(function () {
        cy.zoom(Math.min(cy.zoom() * 1.65, 1));
        cy.center();
      });
    }
    cy.on("mouseover", "node", function (event) {
      var node = event.target;
      var point = node.renderedPosition();
      tooltip.textContent = node.data("kind") === "tag" ? node.data("title") + " · " + node.data("count") + " 篇笔记" : node.data("title") + " · 点击打开";
      tooltip.style.left = Math.min(Math.max(point.x + 12, 8), target.clientWidth - 176) + "px";
      tooltip.style.top = Math.min(Math.max(point.y - 28, 6), target.clientHeight - 32) + "px";
      tooltip.hidden = false;
    });
    cy.on("mouseout", "node", function () { tooltip.hidden = true; });
    cy.on("tap", "node", function (event) {
      var url = event.target.data("url");
      if (url) window.location.href = url;
    });
  }

  function openGraph() {
    var dialog = document.querySelector("[data-graph-dialog]");
    if (!dialog) return;
    dialog.classList.add("is-open");
    dialog.setAttribute("aria-hidden", "false");
    setBodyLock(true);
    drawGraph(document.querySelector("[data-global-graph]"), true);
  }

  function closeGraph() {
    var dialog = document.querySelector("[data-graph-dialog]");
    if (!dialog) return;
    dialog.classList.remove("is-open");
    dialog.setAttribute("aria-hidden", "true");
    setBodyLock(false);
  }

  function initGraphs() {
    fetchJson("data-graph-index").then(function (items) {
      graphData = items;
      drawGraph(document.querySelector("[data-knowledge-graph]"), false);
    });
    document.querySelectorAll("[data-graph-open]").forEach(function (button) { button.addEventListener("click", openGraph); });
    document.querySelectorAll("[data-graph-close]").forEach(function (button) { button.addEventListener("click", closeGraph); });
    document.querySelectorAll("[data-graph-fit]").forEach(function (button) {
      button.addEventListener("click", function () {
        var graph = document.querySelector("[data-global-graph]");
        if (graph && graph._cytoscape) graph._cytoscape.fit(undefined, 35);
      });
    });
  }

  function refreshGraphs() {
    if (!graphData) return;
    document.querySelectorAll("[data-knowledge-graph]").forEach(function (target) { drawGraph(target, false); });
    var dialog = document.querySelector("[data-graph-dialog]");
    if (dialog && dialog.classList.contains("is-open")) drawGraph(document.querySelector("[data-global-graph]"), true);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var searchInput = document.querySelector("[data-search-input]");
    try { if (localStorage.getItem("oj-reader") === "on") setReaderMode(true, false); } catch (error) {}
    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) { button.addEventListener("click", toggleTheme); });
    document.querySelectorAll("[data-reader-toggle]").forEach(function (button) { button.addEventListener("click", toggleReader); });
    document.querySelectorAll("[data-search-open]").forEach(function (button) { button.addEventListener("click", openSearch); });
    document.querySelectorAll("[data-search-close]").forEach(function (button) { button.addEventListener("click", closeSearch); });
    if (searchInput) searchInput.addEventListener("input", function () { renderSearch(searchInput.value); });
    document.addEventListener("keydown", function (event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); }
      if (event.key === "Escape") { closeSearch(); closeGraph(); closeMobileExplorer(); }
    });
    initExplorer();
    initMobileExplorer();
    generateToc();
    initProgress();
    initGraphs();
  });
})();
