const blocks = Array.from(document.querySelectorAll(
  ".post-content pre > code.language-mermaid, .post-content .language-mermaid pre > code"
));

// Keep the renderer (and its diagram types) out of pages without diagrams.
if (blocks.length) {
  const root = document.documentElement;
  const diagrams = blocks.map((code) => {
    const original = code.closest(".highlighter-rouge") || code.parentElement;
    const figure = document.createElement("figure");
    figure.className = "mermaid-diagram tex2jax_ignore";
    const viewport = document.createElement("div");
    viewport.className = "mermaid-diagram__viewport";
    viewport.setAttribute("role", "region");
    viewport.setAttribute("aria-label", "图表，可横向滚动查看");
    viewport.tabIndex = 0;
    viewport.hidden = true;
    const status = document.createElement("p");
    status.className = "mermaid-diagram__status";
    status.setAttribute("role", "status");
    status.textContent = "正在绘制图表…";
    const details = document.createElement("details");
    details.className = "mermaid-diagram__source";
    details.open = true;
    const summary = document.createElement("summary");
    summary.textContent = "查看图表源码";
    original.replaceWith(figure);
    details.append(summary, original);
    figure.append(viewport, status, details);
    return { source: code.textContent, figure, viewport, status, details, failed: false };
  });

  let revision = 0;
  let rendering = false;
  let serial = 0;
  const engine = import("mermaid").then((module) => module.default);

  function showError(diagram) {
    diagram.failed = true;
    diagram.figure.dataset.state = "error";
    diagram.status.textContent = "图表暂时无法显示，可展开查看源码。";
    diagram.status.hidden = false;
    diagram.details.open = true;
  }

  function configuration() {
    const style = getComputedStyle(root);
    const color = (name) => style.getPropertyValue(name).trim();
    return {
      startOnLoad: false,
      securityLevel: "strict",
      suppressErrorRendering: true,
      theme: "base",
      look: "classic",
      layout: "dagre",
      fontFamily: color("--sans"),
      themeVariables: {
        darkMode: root.getAttribute("data-theme") === "dark",
        background: color("--surface"),
        primaryColor: color("--surface-soft"),
        primaryTextColor: color("--text"),
        primaryBorderColor: color("--line-strong"),
        secondaryColor: color("--surface"),
        secondaryTextColor: color("--text"),
        secondaryBorderColor: color("--line-strong"),
        tertiaryColor: color("--bg"),
        tertiaryTextColor: color("--text"),
        tertiaryBorderColor: color("--line-strong"),
        lineColor: color("--accent"),
        textColor: color("--text"),
        edgeLabelBackground: color("--surface"),
        fontFamily: color("--sans"),
      },
    };
  }

  async function render() {
    revision += 1;
    if (rendering) return;
    rendering = true;
    try {
      const mermaid = await engine;
      if (document.fonts) await document.fonts.ready;
      let current;
      do {
        current = revision;
        mermaid.initialize(configuration());
        for (const diagram of diagrams) {
          if (current !== revision) break;
          if (diagram.failed) continue;
          // A separate mount keeps the current diagram visible while redrawing,
          // and contains any temporary markup left by a malformed diagram.
          const mount = document.createElement("div");
          mount.className = "mermaid-diagram__staging tex2jax_ignore";
          mount.setAttribute("aria-hidden", "true");
          document.body.append(mount);
          try {
            const result = await mermaid.render("mermaid-diagram-" + ++serial, diagram.source, mount);
            if (current !== revision) break;
            const firstRender = diagram.figure.dataset.state !== "ready";
            diagram.viewport.innerHTML = result.svg;
            const svg = diagram.viewport.querySelector("svg");
            // Preserve readable text; wide diagrams scroll instead of shrinking
            // the entire graph into a phone-width thumbnail.
            if (svg && svg.viewBox.baseVal.width) {
              svg.style.width = svg.viewBox.baseVal.width + "px";
              svg.style.maxWidth = "none";
              svg.style.height = "auto";
            }
            diagram.viewport.hidden = false;
            diagram.status.hidden = true;
            if (firstRender) diagram.details.open = false;
            diagram.figure.dataset.state = "ready";
            if (result.bindFunctions) result.bindFunctions(diagram.viewport);
          } catch (error) {
            showError(diagram);
            console.warn("Unable to render Mermaid diagram", error);
          } finally {
            mount.remove();
          }
        }
      } while (current !== revision);
    } catch (error) {
      diagrams.forEach(showError);
      console.warn("Unable to load Mermaid", error);
    } finally {
      rendering = false;
    }
  }

  new MutationObserver(render).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  render();
}
