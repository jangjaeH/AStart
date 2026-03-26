const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const mapPath = path.join(root, "src", "config", "map.json");
const outDir = path.join(root, "docs");
const outPath = path.join(outDir, "map-viewer.html");

const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Map Viewer</title>
  <style>
    :root {
      --bg: #f3efe6;
      --panel: rgba(255, 252, 245, 0.92);
      --ink: #1d2730;
      --muted: #5d6c78;
      --line: #8ca1b3;
      --lane: #274c77;
      --buffer: #2a9d8f;
      --service: #e76f51;
      --charge: #e9c46a;
      --intersection: #8d5fd3;
      --grid: rgba(39, 76, 119, 0.08);
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", system-ui, sans-serif;
      color: var(--ink);
      background:
        radial-gradient(circle at top left, #fff8e8 0%, transparent 32%),
        linear-gradient(180deg, #f8f3ea 0%, #e9eef3 100%);
    }

    .layout {
      display: grid;
      grid-template-columns: minmax(300px, 1fr) 340px;
      min-height: 100vh;
    }

    .canvas-wrap {
      padding: 24px;
    }

    .panel {
      background: var(--panel);
      border-left: 1px solid rgba(29, 39, 48, 0.08);
      padding: 24px 20px;
      backdrop-filter: blur(12px);
      overflow: auto;
    }

    h1 {
      margin: 0 0 8px;
      font-size: 26px;
      letter-spacing: -0.03em;
    }

    .subtitle {
      margin: 0 0 18px;
      color: var(--muted);
      line-height: 1.5;
      font-size: 14px;
    }

    .stats, .legend, .node-list {
      margin-top: 22px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .stat {
      padding: 12px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(39, 76, 119, 0.08);
    }

    .stat-label {
      display: block;
      color: var(--muted);
      font-size: 12px;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 8px 0;
      font-size: 14px;
    }

    .swatch {
      width: 14px;
      height: 14px;
      border-radius: 999px;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .node-item {
      padding: 10px 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(39, 76, 119, 0.08);
      margin-bottom: 8px;
      cursor: pointer;
    }

    .node-item.active {
      outline: 2px solid #ef476f;
      background: #fff;
    }

    .node-item small {
      display: block;
      color: var(--muted);
      margin-top: 4px;
    }

    svg {
      width: 100%;
      height: calc(100vh - 48px);
      min-height: 640px;
      background:
        linear-gradient(var(--grid) 1px, transparent 1px),
        linear-gradient(90deg, var(--grid) 1px, transparent 1px),
        #fffdf8;
      background-size: 56px 56px;
      border-radius: 24px;
      box-shadow: 0 24px 70px rgba(39, 76, 119, 0.18);
      border: 1px solid rgba(39, 76, 119, 0.12);
    }

    .edge {
      stroke: var(--line);
      stroke-width: 5;
      stroke-linecap: round;
      opacity: 0.75;
    }

    .edge-label {
      fill: var(--muted);
      font-size: 11px;
      text-anchor: middle;
    }

    .node {
      stroke: rgba(0, 0, 0, 0.18);
      stroke-width: 2;
      cursor: pointer;
    }

    .node-label {
      fill: var(--ink);
      font-size: 12px;
      text-anchor: middle;
      font-weight: 700;
    }

    .node-sub {
      fill: var(--muted);
      font-size: 10px;
      text-anchor: middle;
    }

    .node-highlight {
      stroke: #ef476f;
      stroke-width: 5;
      fill: none;
      opacity: 0;
    }

    .node-highlight.active {
      opacity: 1;
    }

    @media (max-width: 1100px) {
      .layout {
        grid-template-columns: 1fr;
      }
      .panel {
        border-left: 0;
        border-top: 1px solid rgba(29, 39, 48, 0.08);
      }
      svg {
        height: 70vh;
        min-height: 520px;
      }
    }
  </style>
</head>
<body>
  <div class="layout">
    <div class="canvas-wrap">
      <svg id="map" viewBox="0 0 900 720" aria-label="Factory map viewer"></svg>
    </div>
    <aside class="panel">
      <h1>Map Viewer</h1>
      <p class="subtitle">This page renders <code>src/config/map.json</code> so you can inspect where each node is located and how edges are connected.</p>

      <section class="stats">
        <div class="stats-grid">
          <div class="stat">
            <span class="stat-label">Nodes</span>
            <span class="stat-value">${map.nodes.length}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Edges</span>
            <span class="stat-value">${map.edges.length}</span>
          </div>
        </div>
      </section>

      <section class="legend">
        <h2>Legend</h2>
        <div class="legend-item"><span class="swatch" style="background: var(--lane)"></span>Lane</div>
        <div class="legend-item"><span class="swatch" style="background: var(--intersection)"></span>Intersection / bottleneck</div>
        <div class="legend-item"><span class="swatch" style="background: var(--buffer)"></span>Buffer</div>
        <div class="legend-item"><span class="swatch" style="background: var(--service)"></span>Service access</div>
        <div class="legend-item"><span class="swatch" style="background: var(--charge)"></span>Charge</div>
      </section>

      <section class="node-list">
        <h2>Nodes</h2>
        <div id="node-list"></div>
      </section>
    </aside>
  </div>

  <script>
    const map = ${JSON.stringify(map, null, 2)};
    const svg = document.getElementById("map");
    const nodeList = document.getElementById("node-list");
    const scale = 88;
    const padding = 88;

    const colorByType = {
      lane: "#274c77",
      intersection: "#8d5fd3",
      buffer: "#2a9d8f",
      service: "#e76f51",
      charge: "#e9c46a",
    };

    const pos = (node) => ({
      x: padding + node.x * scale,
      y: padding + node.y * scale,
    });

    const nodesById = new Map(map.nodes.map((node) => [node.id, node]));
    const highlights = new Map();

    function drawEdge(edge) {
      const from = nodesById.get(edge.from);
      const to = nodesById.get(edge.to);
      if (!from || !to) return;
      const a = pos(from);
      const b = pos(to);

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", a.x);
      line.setAttribute("y1", a.y);
      line.setAttribute("x2", b.x);
      line.setAttribute("y2", b.y);
      line.setAttribute("class", "edge");
      svg.appendChild(line);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", (a.x + b.x) / 2);
      label.setAttribute("y", (a.y + b.y) / 2 - 8);
      label.setAttribute("class", "edge-label");
      label.textContent = String(edge.cost);
      svg.appendChild(label);
    }

    function setActiveNode(nodeId) {
      document.querySelectorAll(".node-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.nodeId === nodeId);
      });
      highlights.forEach((element, key) => {
        element.classList.toggle("active", key === nodeId);
      });
    }

    function drawNode(node) {
      const p = pos(node);
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

      const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      ring.setAttribute("cx", p.x);
      ring.setAttribute("cy", p.y);
      ring.setAttribute("r", 22);
      ring.setAttribute("class", "node-highlight");
      group.appendChild(ring);
      highlights.set(node.id, ring);

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", p.x);
      circle.setAttribute("cy", p.y);
      circle.setAttribute("r", node.type === "intersection" ? 15 : 13);
      circle.setAttribute("fill", colorByType[node.type] || "#333");
      circle.setAttribute("class", "node");
      circle.addEventListener("click", () => setActiveNode(node.id));
      group.appendChild(circle);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", p.x);
      label.setAttribute("y", p.y - 22);
      label.setAttribute("class", "node-label");
      label.textContent = node.id;
      group.appendChild(label);

      const sub = document.createElementNS("http://www.w3.org/2000/svg", "text");
      sub.setAttribute("x", p.x);
      sub.setAttribute("y", p.y + 34);
      sub.setAttribute("class", "node-sub");
      sub.textContent = node.zone || node.type;
      group.appendChild(sub);

      svg.appendChild(group);

      const item = document.createElement("div");
      item.className = "node-item";
      item.dataset.nodeId = node.id;
      item.innerHTML = "<strong>" + node.id + "</strong><small>x=" + node.x + ", y=" + node.y + " · " + node.type + (node.zone ? " · " + node.zone : "") + "</small>";
      item.addEventListener("click", () => setActiveNode(node.id));
      nodeList.appendChild(item);
    }

    map.edges.forEach(drawEdge);
    map.nodes.forEach(drawNode);
    if (map.nodes[0]) setActiveNode(map.nodes[0].id);
  </script>
</body>
</html>
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, html, "utf8");

console.log("Generated:", outPath);
