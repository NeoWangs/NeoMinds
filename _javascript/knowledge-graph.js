import {
  Application,
  Circle,
  Container,
  Graphics,
  Rectangle,
  Text,
  TextStyle,
} from "pixi.js";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceRadial,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";

const controllers = new WeakMap();
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function seedPosition(index) {
  const angle = index * GOLDEN_ANGLE;
  const radius = 34 * Math.sqrt(index + 1);
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

function nodeRadius(node, full) {
  if (node.kind === "tag") return full ? 11 : 12;
  if (node.isCenter) return full ? 8 : 10;
  return full ? 5 : 6;
}

function tagWidth(node, full) {
  const characterWidth = full ? 5.4 : 5.9;
  return clamp((node.label || "").length * characterWidth + 16, full ? 42 : 48, full ? 88 : 98);
}

function normalizeGraph(graphData) {
  const nodes = (graphData?.nodes || []).map((entry, index) => {
    const position = entry.position || seedPosition(index);
    return {
      ...entry.data,
      x: Number.isFinite(position.x) ? position.x : 0,
      y: Number.isFinite(position.y) ? position.y : 0,
    };
  });
  const nodeIds = new Set(nodes.map((node) => node.id));
  const links = (graphData?.edges || [])
    .map((entry) => ({ ...entry.data }))
    .filter((link) => nodeIds.has(link.source) && nodeIds.has(link.target));
  return { nodes, links };
}

function createAdjacency(nodes, links) {
  const adjacency = new Map(nodes.map((node) => [node.id, new Set([node.id])]));
  links.forEach((link) => {
    adjacency.get(link.source)?.add(link.target);
    adjacency.get(link.target)?.add(link.source);
  });
  return adjacency;
}

function drawDashedLine(graphics, x1, y1, x2, y2, dashLength = 5, gapLength = 4) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (!distance) return;
  const stepX = dx / distance;
  const stepY = dy / distance;
  let travelled = 0;
  while (travelled < distance) {
    const dashEnd = Math.min(travelled + dashLength, distance);
    graphics.moveTo(x1 + stepX * travelled, y1 + stepY * travelled);
    graphics.lineTo(x1 + stepX * dashEnd, y1 + stepY * dashEnd);
    travelled += dashLength + gapLength;
  }
}

function edgeEndpoints(link, full, sourceScale = 1, targetScale = 1) {
  const source = link.source;
  const target = link.target;
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
  const unitX = dx / distance;
  const unitY = dy / distance;
  const sourcePadding = (source.kind === "tag" ? tagWidth(source, full) / 2 : nodeRadius(source, full) + 2) * sourceScale;
  const targetPadding = (target.kind === "tag" ? tagWidth(target, full) / 2 : nodeRadius(target, full) + 3) * targetScale;
  return {
    x1: source.x + unitX * sourcePadding,
    y1: source.y + unitY * sourcePadding,
    x2: target.x - unitX * targetPadding,
    y2: target.y - unitY * targetPadding,
    unitX,
    unitY,
  };
}

class KnowledgeGraph {
  constructor(target, config) {
    this.target = target;
    this.config = config;
    this.full = Boolean(config.full);
    this.theme = config.theme;
    const graph = normalizeGraph(config.graphData);
    this.nodes = graph.nodes;
    this.links = graph.links;
    this.adjacency = createAdjacency(this.nodes, this.links);
    this.nodeViews = new Map();
    this.hoveredId = null;
    this.dragState = null;
    this.panState = null;
    this.viewTouched = false;
    this.initialFitDone = false;
    this.destroyed = false;
    this.app = null;
    this.viewport = null;
    this.edgeLayer = null;
    this.nodeLayer = null;
    this.tooltip = null;
    this.simulation = null;
    this.resizeObserver = null;
    this.onWheel = this.onWheel.bind(this);
    this.ready = this.init();
  }

  async init() {
    const app = new Application();
    await app.init({
      resizeTo: this.target,
      antialias: true,
      autoDensity: true,
      backgroundAlpha: 0,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      preference: "webgl",
    });
    if (this.destroyed) {
      app.stop();
      app.ticker?.stop();
      app.destroy(true, { children: true });
      return;
    }

    this.app = app;
    app.canvas.className = "graph-pixi-canvas";
    app.canvas.setAttribute("role", "img");
    app.canvas.setAttribute("aria-label", this.target.getAttribute("aria-label") || "知识关系图");
    app.canvas.addEventListener("wheel", this.onWheel, { passive: false });
    this.target.appendChild(app.canvas);

    this.tooltip = document.createElement("span");
    this.tooltip.className = "graph-tooltip";
    this.tooltip.hidden = true;
    this.target.appendChild(this.tooltip);

    this.viewport = new Container();
    this.edgeLayer = new Graphics();
    this.nodeLayer = new Container();
    this.nodeLayer.sortableChildren = true;
    this.viewport.addChild(this.edgeLayer, this.nodeLayer);
    app.stage.addChild(this.viewport);
    app.stage.eventMode = "static";
    app.stage.hitArea = new Rectangle(0, 0, app.screen.width, app.screen.height);
    app.stage.on("pointerdown", (event) => this.beginPan(event));
    app.stage.on("pointermove", (event) => this.movePointer(event));
    app.stage.on("pointerup", (event) => this.endPointer(event));
    app.stage.on("pointerupoutside", (event) => this.endPointer(event));

    this.createNodeViews();
    this.createSimulation();
    this.renderFrame();
    this.fit(this.full ? 35 : 14, false);

    this.resizeObserver = new ResizeObserver(() => {
      if (!this.app || this.destroyed) return;
      this.app.stage.hitArea = new Rectangle(0, 0, this.app.screen.width, this.app.screen.height);
      if (!this.viewTouched) this.fit(this.full ? 35 : 14, false);
    });
    this.resizeObserver.observe(this.target);
  }

  createSimulation() {
    const linkForce = forceLink(this.links)
      .id((node) => node.id)
      .distance((link) => link.relation === "tag" ? (this.full ? 72 : 62) : (this.full ? 92 : 78))
      .strength((link) => link.relation === "tag" ? 0.34 : 0.48);

    this.simulation = forceSimulation(this.nodes)
      .alphaDecay(this.full ? 0.055 : 0.07)
      .velocityDecay(0.38)
      .force("link", linkForce)
      .force("charge", forceManyBody()
        .strength((node) => node.kind === "tag" ? -125 : (this.full ? -235 : -185))
        .distanceMax(this.full ? 440 : 300))
      .force("center", forceCenter(0, 0).strength(0.08))
      .force("x", forceX(0).strength(0.018))
      .force("y", forceY(0).strength(0.018))
      .force("isolated-tag-ring", forceRadial((node) => node.isIsolated ? 275 : 0)
        .strength((node) => node.isIsolated ? 0.09 : 0))
      .force("collision", forceCollide()
        .radius((node) => node.kind === "tag" ? tagWidth(node, this.full) * 0.48 : nodeRadius(node, this.full) + (this.full ? 15 : 19))
        .strength(0.82)
        .iterations(2))
      .on("tick", () => this.renderFrame())
      .on("end", () => {
        if (!this.viewTouched) this.fit(this.full ? 35 : 14, false);
      });

    // Start from a useful composition immediately, then let the remaining
    // low-energy ticks provide a short organic settle instead of a blank wait.
    this.simulation.stop();
    this.simulation.tick(this.full ? 140 : 100);
    this.simulation.alpha(0.22).restart();
  }

  createNodeViews() {
    this.nodes.forEach((node) => {
      const view = new Container();
      const shape = new Graphics();
      const label = new Text({
        text: node.label || node.title || node.id,
        style: this.textStyle(node),
        resolution: Math.min(window.devicePixelRatio || 1, 2),
      });
      label.eventMode = "none";
      view.eventMode = "static";
      view.cursor = node.url ? "pointer" : "grab";
      view.zIndex = node.isCenter ? 3 : (node.kind === "tag" ? 2 : 1);

      if (node.kind === "tag") {
        const width = tagWidth(node, this.full);
        const height = this.full ? 18 : 20;
        shape.roundRect(-width / 2, -height / 2, width, height, height / 2)
          .fill({ color: this.theme.accent, alpha: 0.76 })
          .stroke({ color: this.theme.surface, width: 1.5, alpha: 0.95 });
        label.anchor.set(0.5);
        view.hitArea = new Rectangle(-width / 2 - 3, -height / 2 - 3, width + 6, height + 6);
      } else {
        const radius = nodeRadius(node, this.full);
        shape.circle(0, 0, radius)
          .fill({ color: node.isCenter ? this.theme.accent : this.theme.graph, alpha: node.isCenter ? 0.96 : 0.78 })
          .stroke({ color: this.theme.surface, width: node.isCenter ? 2.5 : 1.5, alpha: 0.96 });
        if (node.isCenter) {
          shape.circle(0, 0, radius + 4)
            .stroke({ color: this.theme.accent, width: 1, alpha: 0.35 });
        }
        label.anchor.set(0.5, 0);
        label.y = radius + (this.full ? 4 : 5);
        view.hitArea = new Circle(0, 0, Math.max(radius + 7, 13));
      }

      view.addChild(shape, label);
      view.on("pointerover", (event) => this.hoverNode(node, event));
      view.on("pointermove", (event) => this.positionTooltip(event));
      view.on("pointerout", () => this.unhoverNode(node));
      view.on("pointerdown", (event) => this.beginNodeDrag(node, event));
      view.on("pointerup", (event) => this.endNodeDrag(node, event));
      view.on("pointerupoutside", (event) => this.endNodeDrag(node, event));
      this.nodeLayer.addChild(view);
      this.nodeViews.set(node.id, { view, shape, label });
    });
  }

  textStyle(node) {
    const fontSize = this.labelFontSize(node);
    return new TextStyle({
      fill: node.kind === "tag" ? this.theme.surface : (node.isCenter ? this.theme.accent : this.theme.text),
      fontFamily: this.theme.sans || '"Noto Sans SC", "PingFang SC", sans-serif',
      fontSize,
      fontWeight: node.isCenter || node.kind === "tag" ? "600" : "500",
      lineHeight: Math.ceil(fontSize * 1.3),
      stroke: node.kind === "tag" ? undefined : { color: this.theme.surface, width: this.full ? 3 : 4, join: "round" },
    });
  }

  labelFontSize(node) {
    return node.kind === "tag" ? (this.full ? 9 : 10) : (this.full ? 9 : 10.5);
  }

  syncNodeScale() {
    if (!this.viewport) return;
    const viewportScale = this.viewport.scale.x || 1;
    this.nodes.forEach((node) => {
      const nodeView = this.nodeViews.get(node.id);
      if (!nodeView) return;
      const baseSize = this.labelFontSize(node);
      const minimum = node.kind === "tag" ? 8 : 9;
      const maximum = node.kind === "tag" ? 14 : 16;
      const visibleSize = clamp(baseSize * viewportScale, minimum, maximum);
      nodeView.view.scale.set(visibleSize / (baseSize * viewportScale));
    });
  }

  renderFrame() {
    if (!this.app || this.destroyed) return;
    this.drawEdges();
    const related = this.hoveredId ? this.adjacency.get(this.hoveredId) : null;
    this.nodes.forEach((node) => {
      const nodeView = this.nodeViews.get(node.id);
      if (!nodeView) return;
      nodeView.view.position.set(node.x || 0, node.y || 0);
      nodeView.view.alpha = !related || related.has(node.id) ? 1 : (this.full ? 0.16 : 0.22);
      nodeView.label.alpha = this.hoveredId === node.id ? 1 : 0.94;
    });
  }

  drawEdges() {
    const graphics = this.edgeLayer;
    graphics.clear();
    const related = this.hoveredId ? this.adjacency.get(this.hoveredId) : null;
    this.links.forEach((link) => {
      if (!link.source?.id || !link.target?.id) return;
      const active = !related || (related.has(link.source.id) && related.has(link.target.id));
      const alpha = active ? (link.relation === "tag" ? 0.48 : 0.62) : 0.07;
      const color = link.relation === "tag" ? this.theme.accent : this.theme.line;
      const width = link.relation === "tag" ? 0.8 : 1.05;
      const sourceScale = this.nodeViews.get(link.source.id)?.view.scale.x || 1;
      const targetScale = this.nodeViews.get(link.target.id)?.view.scale.x || 1;
      const points = edgeEndpoints(link, this.full, sourceScale, targetScale);
      if (link.relation === "tag") {
        drawDashedLine(graphics, points.x1, points.y1, points.x2, points.y2, 4.5, 3.5);
      } else {
        graphics.moveTo(points.x1, points.y1).lineTo(points.x2, points.y2);
      }
      graphics.stroke({ color, width, alpha });

      if (link.relation === "note") {
        const arrowLength = this.full ? 4.5 : 5.5;
        const arrowWidth = this.full ? 2.3 : 2.8;
        const baseX = points.x2 - points.unitX * arrowLength;
        const baseY = points.y2 - points.unitY * arrowLength;
        graphics.moveTo(points.x2, points.y2)
          .lineTo(baseX - points.unitY * arrowWidth, baseY + points.unitX * arrowWidth)
          .lineTo(baseX + points.unitY * arrowWidth, baseY - points.unitX * arrowWidth)
          .closePath()
          .fill({ color, alpha });
      }
    });
  }

  hoverNode(node, event) {
    if (this.dragState || this.panState) return;
    this.hoveredId = node.id;
    this.tooltip.textContent = node.kind === "tag"
      ? `${node.title} · ${node.count || 0} 篇笔记`
      : `${node.title} · 点击打开`;
    this.tooltip.hidden = false;
    this.positionTooltip(event);
    this.renderFrame();
  }

  unhoverNode(node) {
    if (this.dragState?.node === node) return;
    if (this.hoveredId === node.id) this.hoveredId = null;
    if (this.tooltip) this.tooltip.hidden = true;
    this.renderFrame();
  }

  positionTooltip(event) {
    if (!this.tooltip || this.tooltip.hidden || !event?.global) return;
    const width = this.target.clientWidth;
    const height = this.target.clientHeight;
    this.tooltip.style.left = `${clamp(event.global.x + 12, 8, Math.max(8, width - 176))}px`;
    this.tooltip.style.top = `${clamp(event.global.y - 30, 6, Math.max(6, height - 34))}px`;
  }

  beginNodeDrag(node, event) {
    if (event.button !== 0) return;
    event.stopPropagation();
    const point = this.viewport.toLocal(event.global);
    this.dragState = {
      node,
      pointerId: event.pointerId,
      startX: point.x,
      startY: point.y,
      moved: false,
    };
    node.fx = node.x;
    node.fy = node.y;
    this.nodeViews.get(node.id).view.cursor = "grabbing";
    this.viewTouched = true;
    this.simulation?.alphaTarget(0.18).restart();
  }

  movePointer(event) {
    if (this.dragState && event.pointerId === this.dragState.pointerId) {
      const point = this.viewport.toLocal(event.global);
      const distance = Math.hypot(point.x - this.dragState.startX, point.y - this.dragState.startY);
      if (distance > 3) this.dragState.moved = true;
      this.dragState.node.fx = point.x;
      this.dragState.node.fy = point.y;
      this.renderFrame();
      return;
    }
    if (this.panState && event.pointerId === this.panState.pointerId) {
      const dx = event.global.x - this.panState.startX;
      const dy = event.global.y - this.panState.startY;
      if (Math.hypot(dx, dy) > 3) this.panState.moved = true;
      this.viewport.position.set(this.panState.viewX + dx, this.panState.viewY + dy);
    }
  }

  endNodeDrag(node, event) {
    if (!this.dragState || this.dragState.node !== node || event.pointerId !== this.dragState.pointerId) return;
    event.stopPropagation();
    const moved = this.dragState.moved;
    node.fx = null;
    node.fy = null;
    this.dragState = null;
    this.nodeViews.get(node.id).view.cursor = node.url ? "pointer" : "grab";
    this.simulation?.alphaTarget(0);
    if (!moved && node.url) window.location.href = node.url;
  }

  beginPan(event) {
    if (event.button !== 0 || event.target !== this.app.stage || this.dragState) return;
    this.panState = {
      pointerId: event.pointerId,
      startX: event.global.x,
      startY: event.global.y,
      viewX: this.viewport.x,
      viewY: this.viewport.y,
      moved: false,
    };
    this.app.canvas.classList.add("is-panning");
    this.viewTouched = true;
    if (this.tooltip) this.tooltip.hidden = true;
  }

  endPointer(event) {
    if (this.dragState && event.pointerId === this.dragState.pointerId) {
      this.endNodeDrag(this.dragState.node, event);
    }
    if (!this.panState || event.pointerId !== this.panState.pointerId) return;
    this.panState = null;
    this.app?.canvas.classList.remove("is-panning");
  }

  onWheel(event) {
    if (!this.viewport || !this.app) return;
    event.preventDefault();
    this.viewTouched = true;
    const rect = this.app.canvas.getBoundingClientRect();
    const pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const before = this.viewport.toLocal(pointer);
    const factor = Math.exp(-event.deltaY * 0.0012);
    const nextScale = clamp(this.viewport.scale.x * factor, this.full ? 0.18 : 0.45, 3.2);
    this.viewport.scale.set(nextScale);
    this.syncNodeScale();
    const after = this.viewport.toGlobal(before);
    this.viewport.position.x += pointer.x - after.x;
    this.viewport.position.y += pointer.y - after.y;
    this.drawEdges();
  }

  fit(padding = 35, userInitiated = true) {
    if (!this.app || !this.viewport || !this.nodes.length) return;
    if (userInitiated) this.viewTouched = true;
    const xs = this.nodes.map((node) => node.x || 0);
    const ys = this.nodes.map((node) => node.y || 0);
    const minX = Math.min(...xs) - 50;
    const maxX = Math.max(...xs) + 50;
    const minY = Math.min(...ys) - 35;
    const maxY = Math.max(...ys) + 55;
    const graphWidth = Math.max(maxX - minX, 1);
    const graphHeight = Math.max(maxY - minY, 1);
    const availableWidth = Math.max(this.app.screen.width - padding * 2, 1);
    const availableHeight = Math.max(this.app.screen.height - padding * 2, 1);
    const maximumScale = this.full ? 1.35 : 1.2;
    const scale = clamp(Math.min(availableWidth / graphWidth, availableHeight / graphHeight), this.full ? 0.18 : 0.45, maximumScale);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    this.viewport.scale.set(scale);
    this.syncNodeScale();
    this.viewport.position.set(
      this.app.screen.width / 2 - centerX * scale,
      this.app.screen.height / 2 - centerY * scale,
    );
    this.drawEdges();
    this.initialFitDone = true;
  }

  destroy() {
    this.destroyed = true;
    this.simulation?.stop();
    this.resizeObserver?.disconnect();
    if (this.app) {
      const app = this.app;
      this.app = null;
      app.stop();
      app.ticker?.stop();
      app.canvas.removeEventListener("wheel", this.onWheel);
      app.destroy(true, { children: true });
    }
    this.tooltip?.remove();
    this.tooltip = null;
  }
}

window.NeoXMindGraph = {
  render(target, config) {
    this.destroy(target);
    const controller = new KnowledgeGraph(target, config);
    controllers.set(target, controller);
  },
  fit(target, padding) {
    const controller = controllers.get(target);
    if (!controller) return;
    controller.ready.then(() => controller.fit(padding, true));
  },
  destroy(target) {
    const controller = controllers.get(target);
    if (!controller) return;
    controller.destroy();
    controllers.delete(target);
  },
};
