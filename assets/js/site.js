(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;
  var searchData;
  var explorerData;
  var graphData;
  var siteVersion = body.getAttribute("data-site-version") || "dev";
  var EXPLORER_CACHE_KEY = "oj-explorer-index:" + siteVersion;
  var EXPLORER_MARKUP_KEY = "oj-explorer-markup:" + siteVersion;
  var EXPLORER_SCROLL_KEY = "oj-explorer-scroll";
  var LAST_READ_ARTICLE_KEY = "oj-last-read-article";

  function readSessionJson(key) {
    try {
      var value = sessionStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  function writeSessionJson(key, value) {
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }

  function cacheExplorerMarkup(target) {
    try { sessionStorage.setItem(EXPLORER_MARKUP_KEY, target.innerHTML); } catch (error) {}
  }

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

  function rememberLastReadArticle(anchor) {
    if (!document.querySelector(".page--article")) return;
    var url = body.getAttribute("data-current-url");
    if (!url) return;
    try {
      var target = new URL(url, window.location.origin);
      target.hash = anchor || window.location.hash;
      localStorage.setItem(LAST_READ_ARTICLE_KEY, target.pathname + target.search + target.hash);
    } catch (error) {}
  }

  function resumeLastReadArticle() {
    if (!document.querySelector(".page--home")) return;
    try {
      var savedUrl = localStorage.getItem(LAST_READ_ARTICLE_KEY);
      if (!savedUrl) return;
      var target = new URL(savedUrl, window.location.origin);
      if (target.origin !== window.location.origin || target.pathname === window.location.pathname) return;
      window.location.replace(target.href);
    } catch (error) {}
  }

  function syncThemeControls() {
    var dark = root.getAttribute("data-theme") === "dark";
    document.querySelectorAll("[data-theme-label]").forEach(function (label) {
      label.textContent = dark ? "白天" : "深夜";
    });
  }

  function toggleTheme() {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("oj-theme", next); } catch (error) {}
    syncThemeControls();
    window.setTimeout(refreshGraphs, 0);
  }

  function syncSidebarControls() {
    var collapsed = root.getAttribute("data-sidebar") === "collapsed";
    document.querySelectorAll("[data-sidebar-toggle]").forEach(function (button) {
      var label = collapsed ? "展开左侧栏" : "收起左侧栏";
      button.setAttribute("aria-expanded", String(!collapsed));
      button.setAttribute("aria-label", label);
      button.title = label;
    });
  }

  function toggleSidebar() {
    var collapsed = root.getAttribute("data-sidebar") !== "collapsed";
    if (collapsed) root.setAttribute("data-sidebar", "collapsed");
    else root.removeAttribute("data-sidebar");
    try { localStorage.setItem("oj-sidebar", collapsed ? "collapsed" : "expanded"); } catch (error) {}
    syncSidebarControls();
    window.setTimeout(refreshGraphs, 240);
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

  function buildExplorer(restoreScroll) {
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
    cacheExplorerMarkup(target);
    var currentLink = target.querySelector(".explorer-file.is-current");
    var sidebar = target.closest("[data-left-sidebar]");
    if (currentLink && sidebar) {
      var savedScroll = restoreScroll ? readSessionJson(EXPLORER_SCROLL_KEY) : null;
      if (savedScroll && savedScroll.path === window.location.pathname && typeof savedScroll.top === "number") {
        sidebar.scrollTop = savedScroll.top;
        return;
      }
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
    var tree = document.querySelector("[data-explorer-tree]");
    var sidebar = document.querySelector("[data-left-sidebar]");
    if (toggle && rootExplorer) {
      toggle.addEventListener("click", function () {
        var collapsed = !rootExplorer.classList.contains("is-collapsed");
        rootExplorer.classList.toggle("is-collapsed", collapsed);
        toggle.setAttribute("aria-expanded", String(!collapsed));
      });
    }
    if (tree && sidebar) {
      tree.addEventListener("click", function (event) {
        var folder = event.target.closest("button.explorer-folder");
        if (folder) {
          var collapsed = !folder.classList.contains("is-collapsed");
          folder.classList.toggle("is-collapsed", collapsed);
          folder.setAttribute("aria-expanded", String(!collapsed));
          cacheExplorerMarkup(tree);
          return;
        }
        var link = event.target.closest("a.explorer-file");
        if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        writeSessionJson(EXPLORER_SCROLL_KEY, { path: link.pathname, top: sidebar.scrollTop });
        tree.querySelectorAll(".explorer-file.is-current").forEach(function (current) {
          current.classList.remove("is-current");
          current.removeAttribute("aria-current");
        });
        link.classList.add("is-current");
        link.setAttribute("aria-current", "page");
        cacheExplorerMarkup(tree);
      });
    }

    var cachedExplorer = readSessionJson(EXPLORER_CACHE_KEY);
    if (Array.isArray(cachedExplorer) && cachedExplorer.length) {
      explorerData = cachedExplorer;
      buildExplorer(true);
    }

    fetchJson("data-explorer-index").then(function (items) {
      if (!Array.isArray(items) || !items.length) return;
      writeSessionJson(EXPLORER_CACHE_KEY, items);
      if (explorerData) return;
      explorerData = items;
      buildExplorer(true);
    });
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
    var savedHeadingId = "";

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
      if (currentIndex >= 0 && headings[activeIndex].id !== savedHeadingId) {
        savedHeadingId = headings[activeIndex].id;
        rememberLastReadArticle("#" + savedHeadingId);
      }
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
    if (full) return data;
    if (currentId && byId[currentId]) {
      var current = byId[currentId];
      var incoming = data.filter(function (node) { return (node.links || []).indexOf(currentId) !== -1; });
      var related = [current].concat((current.links || []).map(function (id) { return byId[id]; }).filter(Boolean), incoming);
      var unique = [];
      related.forEach(function (node) { if (node && unique.indexOf(node) === -1) unique.push(node); });
      return unique.slice(0, 12);
    }
    return data.slice().sort(function (left, right) {
      var leftDegree = (left.links || []).length + data.filter(function (node) { return (node.links || []).indexOf(left.id) !== -1; }).length;
      var rightDegree = (right.links || []).length + data.filter(function (node) { return (node.links || []).indexOf(right.id) !== -1; }).length;
      return rightDegree - leftDegree;
    }).slice(0, 10);
  }

  function graphTheme() {
    var style = window.getComputedStyle(root);
    return {
      accent: style.getPropertyValue("--accent").trim(),
      graph: style.getPropertyValue("--graph").trim(),
      line: style.getPropertyValue("--line-strong").trim(),
      surface: style.getPropertyValue("--surface").trim(),
      text: style.getPropertyValue("--text").trim(),
      muted: style.getPropertyValue("--muted").trim(),
      sans: style.getPropertyValue("--sans").trim()
    };
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

  function tagUrl(tag) {
    var path = String(tag || "").trim().replace(/\//g, "-");
    return "/tags/" + encodeURIComponent(path) + "/";
  }

  function graphSeedPosition(index) {
    var angle = index * 2.3999632297;
    var radius = 34 * Math.sqrt(index + 1);
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  }

  function graphOuterPosition(index, innerCount) {
    var angle = index * 2.3999632297;
    var radius = 245 + Math.sqrt(innerCount + 1) * 16 + Math.floor(index / 12) * 30;
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  }

  function globalTagGraph(nodes) {
    var tagCounts = graphTagCounts(nodes);
    var tagNodes = {};
    var tagEdges = {};
    var connectedTags = {};
    nodes.forEach(function (node) {
      var tags = (node.tags || []).slice().sort(function (left, right) { return left.localeCompare(right, "zh-Hans-CN"); });
      tags.forEach(function (tag) {
        var tagId = "tag:" + encodeURIComponent(tag);
        tagNodes[tagId] = { id: tagId, tag: tag, count: tagCounts[tag] };
      });
      for (var sourceIndex = 0; sourceIndex < tags.length; sourceIndex += 1) {
        for (var targetIndex = sourceIndex + 1; targetIndex < tags.length; targetIndex += 1) {
          var sourceId = "tag:" + encodeURIComponent(tags[sourceIndex]);
          var targetId = "tag:" + encodeURIComponent(tags[targetIndex]);
          var edgeId = "tag-pair:" + sourceId + ":" + targetId;
          tagEdges[edgeId] = (tagEdges[edgeId] || 0) + 1;
          connectedTags[sourceId] = true;
          connectedTags[targetId] = true;
        }
      }
    });
    var tagIds = Object.keys(tagNodes).sort(function (left, right) { return tagNodes[left].tag.localeCompare(tagNodes[right].tag, "zh-Hans-CN"); });
    var connectedTagIds = tagIds.filter(function (tagId) { return connectedTags[tagId]; });
    var isolatedTagIds = tagIds.filter(function (tagId) { return !connectedTags[tagId]; });
    var graphNodes = connectedTagIds.concat(isolatedTagIds).map(function (tagId, index) {
      var tag = tagNodes[tagId];
      var isIsolated = !connectedTags[tagId];
      return {
        position: isIsolated ? graphOuterPosition(index - connectedTagIds.length, connectedTagIds.length) : graphSeedPosition(index),
        data: {
          id: tag.id,
          label: tagLabel(tag.tag, true),
          title: "#" + tag.tag,
          url: tagUrl(tag.tag),
          kind: "tag",
          count: tag.count,
          isIsolated: isIsolated,
          isCenter: false
        }
      };
    });
    var edges = Object.keys(tagEdges).map(function (edgeId) {
      var pair = edgeId.replace("tag-pair:", "").split(":tag:");
      return {
        data: {
          id: edgeId,
          source: pair[0],
          target: "tag:" + pair[1],
          relation: "tag",
          count: tagEdges[edgeId]
        }
      };
    });
    return {
      graphData: { nodes: graphNodes, edges: edges },
      tagCount: graphNodes.length,
      noteEdgeCount: 0,
      tagEdgeCount: edges.length
    };
  }

  function graphElements(nodes, currentId, full) {
    if (full) return globalTagGraph(nodes);
    var included = new Set(nodes.map(function (node) { return node.id; }));
    var tagCounts = graphTagCounts(nodes);
    var current = nodes.find(function (node) { return node.id === currentId; });
    var currentTags = new Set((current && current.tags) || []);
    var visibleTags = Object.keys(tagCounts).filter(function (tag) {
      return full ? tagCounts[tag] >= 2 : (currentTags.has(tag) || tagCounts[tag] >= 2);
    });
    if (!full) {
      visibleTags.sort(function (left, right) {
        var currentDifference = Number(currentTags.has(right)) - Number(currentTags.has(left));
        return currentDifference || tagCounts[right] - tagCounts[left] || left.localeCompare(right, "zh-Hans-CN");
      });
      visibleTags = visibleTags.slice(0, 8);
    }
    var visibleTagSet = new Set(visibleTags);
    var tagNodes = {};
    var noteEdgeCount = 0;
    var tagEdgeCount = 0;
    var edges = [];
    var center = current || nodes.slice().sort(function (left, right) {
      var leftDegree = (left.links || []).filter(function (id) { return included.has(id); }).length;
      var rightDegree = (right.links || []).filter(function (id) { return included.has(id); }).length;
      return rightDegree - leftDegree;
    })[0];
    var graphNodes = nodes.map(function (node, index) {
      return {
        position: graphSeedPosition(index),
        data: {
          id: node.id,
          label: graphLabel(node.title, full),
          title: node.title,
          url: node.url,
          kind: "note",
          category: node.category || "其他",
          isCenter: Boolean(center && node.id === center.id)
        }
      };
    });
    nodes.forEach(function (node) {
      (node.links || []).forEach(function (targetId) {
        if (!included.has(targetId)) return;
        noteEdgeCount += 1;
        edges.push({ data: { id: "link:" + node.id + ":" + targetId, source: node.id, target: targetId, relation: "note" } });
      });
      (node.tags || []).forEach(function (tag) {
        // In the global view, a tag is useful when it joins two or more
        // displayed notes.  In the local view, always keep the current
        // note's own tags so the small graph explains its context.
        if (!visibleTagSet.has(tag)) return;
        var tagId = "tag:" + encodeURIComponent(tag);
        tagNodes[tagId] = { id: tagId, tag: tag, count: tagCounts[tag] };
        tagEdgeCount += 1;
        edges.push({ data: { id: "tag-link:" + node.id + ":" + encodeURIComponent(tag), source: node.id, target: tagId, relation: "tag" } });
      });
    });
    Object.keys(tagNodes).sort(function (left, right) { return tagNodes[left].tag.localeCompare(tagNodes[right], "zh-Hans-CN"); }).forEach(function (tagId) {
      var tag = tagNodes[tagId];
      graphNodes.push({
        position: graphSeedPosition(graphNodes.length),
        data: {
          id: tag.id,
          label: tagLabel(tag.tag, full),
          title: "#" + tag.tag,
          url: tagUrl(tag.tag),
          kind: "tag",
          count: tag.count,
          isCenter: false
        }
      });
    });
    return {
      graphData: { nodes: graphNodes, edges: edges },
      tagCount: Object.keys(tagNodes).length,
      noteEdgeCount: noteEdgeCount,
      tagEdgeCount: tagEdgeCount
    };
  }

  function renderGraphSummary(target, nodes, graph, full) {
    var summary = document.createElement("div");
    var heading = document.createElement("strong");
    var detail = document.createElement("p");
    var list = document.createElement("ul");
    summary.className = "graph-summary";
    heading.textContent = "关系数据已加载";
    var summaryNodes = full ? graph.graphData.nodes.map(function (node) { return node.data; }) : nodes;
    detail.textContent = full ? graph.tagCount + " 个标签 · " + graph.tagEdgeCount + " 条共现关系" : nodes.length + " 篇相关笔记 · " + graph.tagCount + " 个标签";
    list.className = "graph-summary__list";
    summaryNodes.slice(0, full ? 10 : 6).forEach(function (node) {
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
    if (window.NeoXMindGraph) window.NeoXMindGraph.destroy(target);
    target.replaceChildren();
    var currentId = target.getAttribute("data-current-slug") || body.getAttribute("data-current-slug") || "";
    var nodes = pickGraphNodes(graphData, currentId, full);
    var graph = graphElements(nodes, currentId, full);
    var inDialog = target.hasAttribute("data-global-graph");
    var status = inDialog ? document.querySelector("[data-global-graph-status]") : document.querySelector("[data-knowledge-graph-status]");
    if (full) {
      target.setAttribute("aria-label", "全局标签关系图，展示 " + graph.tagCount + " 个标签和 " + graph.tagEdgeCount + " 条标签共现关系");
      if (status) {
        status.textContent = "展示 " + graph.tagCount + " 个标签、" + graph.tagEdgeCount + " 条标签共现关系；孤立标签置于外围，文章节点已隐藏。悬浮可聚焦一跳关系，点击标签可查看对应文章。";
      }
    } else {
      target.setAttribute("aria-label", "当前笔记关系图，展示 " + nodes.length + " 篇相关笔记和 " + graph.tagCount + " 个关联标签");
      if (status) status.textContent = nodes.length + " 篇相关笔记 · " + graph.tagCount + " 个关联标签";
    }
    if (!window.NeoXMindGraph || typeof window.NeoXMindGraph.render !== "function") {
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
    window.NeoXMindGraph.render(target, {
      graphData: graph.graphData,
      full: full,
      theme: graphTheme()
    });
  }

  function openGraph(full) {
    var dialog = document.querySelector("[data-graph-dialog]");
    if (!dialog) return;
    var title = document.querySelector("[data-graph-dialog-title]");
    var isGlobal = full === true;
    dialog.classList.add("is-open");
    dialog.setAttribute("aria-hidden", "false");
    dialog.setAttribute("aria-label", isGlobal ? "全局关系图谱" : "当前关系图谱");
    dialog.setAttribute("data-graph-scope", isGlobal ? "global" : "current");
    if (title) title.textContent = isGlobal ? "全局关系图谱" : "当前关系图谱";
    setGraphView(isGlobal ? "global" : "current");
    setBodyLock(true);
    drawGraph(document.querySelector("[data-global-graph]"), isGlobal);
  }

  function openGlobalGraph() { openGraph(true); }

  function closeGraph() {
    var dialog = document.querySelector("[data-graph-dialog]");
    if (!dialog) return;
    dialog.classList.remove("is-open");
    dialog.setAttribute("aria-hidden", "true");
    setGraphView("current");
    setBodyLock(false);
  }

  function setGraphView(view) {
    var isGlobal = view === "global";
    document.querySelectorAll("[data-graph-open]").forEach(function (button) {
      button.classList.toggle("is-active", isGlobal);
      button.setAttribute("aria-pressed", String(isGlobal));
    });
  }

  function showCurrentGraph() {
    openGraph(false);
  }

  function initGraphs() {
    fetchJson("data-graph-index").then(function (items) {
      graphData = items;
      drawGraph(document.querySelector("[data-knowledge-graph]"), false);
    });
    document.querySelectorAll("[data-graph-open]").forEach(function (button) { button.addEventListener("click", openGlobalGraph); });
    document.querySelectorAll("[data-graph-current]").forEach(function (button) { button.addEventListener("click", showCurrentGraph); });
    document.querySelectorAll("[data-graph-close]").forEach(function (button) { button.addEventListener("click", closeGraph); });
    document.querySelectorAll("[data-graph-fit]").forEach(function (button) {
      button.addEventListener("click", function () {
        var graph = document.querySelector("[data-global-graph]");
        if (graph && window.NeoXMindGraph) window.NeoXMindGraph.fit(graph, 35);
      });
    });
  }

  function refreshGraphs() {
    if (!graphData) return;
    document.querySelectorAll("[data-knowledge-graph]").forEach(function (target) { drawGraph(target, false); });
    var dialog = document.querySelector("[data-graph-dialog]");
    if (dialog && dialog.classList.contains("is-open")) drawGraph(document.querySelector("[data-global-graph]"), dialog.getAttribute("data-graph-scope") === "global");
  }

  var explorerInitialized = false;

  function startExplorer() {
    if (explorerInitialized || !document.querySelector("[data-explorer]")) return;
    explorerInitialized = true;
    initExplorer();
  }

  // site.js 位于页面底部，此时侧栏节点已经存在。提前同步恢复缓存目录，
  // 避免浏览器先绘制折叠状态，再在 DOMContentLoaded 后展开当前分组。
  startExplorer();
  rememberLastReadArticle();
  resumeLastReadArticle();

  document.addEventListener("DOMContentLoaded", function () {
    var searchInput = document.querySelector("[data-search-input]");
    try { if (localStorage.getItem("oj-reader") === "on") setReaderMode(true, false); } catch (error) {}
    syncThemeControls();
    syncSidebarControls();
    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) { button.addEventListener("click", toggleTheme); });
    document.querySelectorAll("[data-sidebar-toggle]").forEach(function (button) { button.addEventListener("click", toggleSidebar); });
    document.querySelectorAll("[data-reader-toggle]").forEach(function (button) { button.addEventListener("click", toggleReader); });
    document.querySelectorAll("[data-search-open]").forEach(function (button) { button.addEventListener("click", openSearch); });
    document.querySelectorAll("[data-search-close]").forEach(function (button) { button.addEventListener("click", closeSearch); });
    if (searchInput) searchInput.addEventListener("input", function () { renderSearch(searchInput.value); });
    document.addEventListener("keydown", function (event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); }
      if (event.key === "Escape") { closeSearch(); closeGraph(); closeMobileExplorer(); }
    });
    startExplorer();
    initMobileExplorer();
    generateToc();
    initProgress();
    initGraphs();
  });
})();
