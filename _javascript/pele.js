const blocks = Array.from(document.querySelectorAll(
  ".post-content pre > code.language-mermaid, .post-content .language-mermaid pre > code"
));

// Keep the renderer and diagram types out of pages without Mermaid code blocks.
if (blocks.length) {
  const diagrams = blocks.map((code) => {
    const original = code.closest(".highlighter-rouge") || code.parentElement;
    const figure = document.createElement("figure");
    figure.className = "pele-diagram tex2jax_ignore";
    const viewport = document.createElement("div");
    viewport.className = "pele-diagram__viewport";
    viewport.setAttribute("aria-label", "图表，可缩放查看");
    viewport.setAttribute("aria-busy", "true");
    const status = document.createElement("p");
    status.className = "pele-diagram__status";
    status.setAttribute("role", "status");
    status.textContent = "正在绘制图表…";
    const details = document.createElement("details");
    details.className = "pele-diagram__source";
    details.open = true;
    const summary = document.createElement("summary");
    summary.textContent = "查看图表源码";
    original.replaceWith(figure);
    details.append(summary, original);
    figure.append(viewport, status, details);
    return { source: code.textContent, figure, viewport, status, details, rendered: false };
  });

  function showError(diagram, error) {
    diagram.figure.dataset.state = "error";
    diagram.viewport.setAttribute("aria-busy", "false");
    if (!diagram.viewport.querySelector("svg")) diagram.viewport.hidden = true;
    diagram.status.textContent = "图表暂时无法显示，可展开查看源码。";
    diagram.status.hidden = false;
    diagram.details.open = true;
    console.warn("Unable to render diagram with Pele", error);
  }

  async function renderDiagrams() {
    let mountAsync;
    try {
      ({ mountAsync } = await import("pele/lazy"));
    } catch (error) {
      diagrams.forEach((diagram) => showError(diagram, error));
      return;
    }

    await Promise.all(diagrams.map(async (diagram) => {
      try {
        // The mount must be visible so Pele can measure its container. Pele
        // observes resizing and font loading; colors follow CSS without redraws.
        const mounted = await mountAsync(diagram.viewport, diagram.source, {
          autoDirection: false,
          zoom: { labels: { zoomIn: "放大", zoomOut: "缩小", reset: "适应宽度" } },
          onRender() {
            diagram.figure.dataset.state = "ready";
            diagram.viewport.hidden = false;
            diagram.viewport.setAttribute("aria-busy", "false");
            diagram.status.hidden = true;
            if (!diagram.rendered) diagram.details.open = false;
            diagram.rendered = true;
          },
          onError(error) { showError(diagram, error); },
        });
        if (mounted.error && !mounted.result) {
          mounted.destroy();
          diagram.viewport.replaceChildren();
        }
      } catch (error) {
        showError(diagram, error);
      }
    }));
  }

  renderDiagrams();
}
