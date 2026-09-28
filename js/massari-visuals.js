(function () {
  const sectorPaths = {
    tourism: '<path d="M11 33c5-1 8-6 13-13 5 7 8 12 13 13"/><path d="M12 37h24M17 29l2 8M31 29l-2 8"/><circle cx="24" cy="13" r="4"/>',
    technology: '<path d="M12 34 20 26l5 5 11-14"/><path d="M12 12h7v7h-7zM29 8h7v7h-7zM29 34h7v7h-7z"/><path d="M19 15 29 12M19 19l6 12"/>',
    health: '<path d="M24 39S10 31 10 19c0-5 4-9 9-9 3 0 5 2 5 5 0-3 2-5 5-5 5 0 9 4 9 9 0 12-14 20-14 20Z"/><path d="M17 24h14M24 17v14"/>',
    finance: '<path d="M10 38V27h8v11M20 38V18h8v20M30 38V10h8v28"/><path d="m11 18 8-6 7 4 11-9"/><circle cx="37" cy="9" r="3"/>',
    "culture-entertainment": '<path d="m24 8 4 10 11 1-8 7 3 11-10-6-10 6 3-11-8-7 11-1 4-10Z"/><circle cx="9" cy="37" r="3"/><circle cx="39" cy="37" r="3"/><path d="M12 36c4-6 20-6 24 0"/>'
  };

  function logo() {
    return '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 34c9-1 10-17 18-17 5 0 7 7 14 7"/><path d="M10 15c5 0 7 5 11 5 6 0 7-9 17-9"/><circle cx="8" cy="34" r="3"/><circle cx="26" cy="17" r="4"/><circle cx="40" cy="24" r="3"/><circle cx="38" cy="11" r="3"/></svg>';
  }

  function sectorVisual(id, className) {
    return `<svg class="${className || "sector-visual"}" viewBox="0 0 48 48" aria-hidden="true">${sectorPaths[id] || sectorPaths["culture-entertainment"]}</svg>`;
  }

  function drawSectorVisual(context, id, color, x, y, size) {
    const scale = size / 48;
    context.save();
    context.translate(x, y);
    context.scale(scale, scale);
    context.strokeStyle = color;
    context.lineWidth = 2.4;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.fillStyle = "transparent";
    const line = (...points) => { context.beginPath(); points.forEach((point, index) => index ? context.lineTo(...point) : context.moveTo(...point)); context.stroke(); };
    const circle = (cx, cy, r) => { context.beginPath(); context.arc(cx, cy, r, 0, Math.PI * 2); context.stroke(); };
    if (id === "tourism") { line([11, 33], [17, 28], [24, 20], [31, 28], [37, 33]); line([12, 37], [36, 37]); line([17, 29], [19, 37]); line([31, 29], [29, 37]); circle(24, 13, 4); }
    else if (id === "technology") { line([12, 34], [20, 26], [25, 31], [36, 17]); [[12, 12], [29, 8], [29, 34]].forEach(([px, py]) => context.strokeRect(px, py, 7, 7)); line([19, 15], [29, 12]); line([19, 19], [25, 31]); }
    else if (id === "health") { context.beginPath(); context.moveTo(24, 39); context.bezierCurveTo(18, 35, 10, 29, 10, 19); context.bezierCurveTo(10, 14, 14, 10, 19, 10); context.bezierCurveTo(22, 10, 24, 12, 24, 15); context.bezierCurveTo(24, 12, 26, 10, 29, 10); context.bezierCurveTo(34, 10, 38, 14, 38, 19); context.bezierCurveTo(38, 29, 30, 35, 24, 39); context.stroke(); line([17, 24], [31, 24]); line([24, 17], [24, 31]); }
    else if (id === "finance") { context.strokeRect(10, 27, 8, 11); context.strokeRect(20, 18, 8, 20); context.strokeRect(30, 10, 8, 28); line([11, 18], [19, 12], [26, 16], [37, 7]); circle(37, 9, 3); }
    else { context.beginPath(); [0, 2, 4, 6, 8].forEach((angle, index) => { const outer = -Math.PI / 2 + angle * Math.PI / 5; const inner = outer + Math.PI / 5; const point = (radius, theta) => [24 + Math.cos(theta) * radius, 24 + Math.sin(theta) * radius]; const [ox, oy] = point(16, outer); const [ix, iy] = point(7, inner); index ? context.lineTo(ox, oy) : context.moveTo(ox, oy); context.lineTo(ix, iy); }); context.closePath(); context.stroke(); circle(9, 37, 3); circle(39, 37, 3); context.beginPath(); context.arc(24, 45, 15, Math.PI + .4, Math.PI * 2 - .4); context.stroke(); }
    context.restore();
  }

  const api = { logo, sectorVisual, drawSectorVisual };
  if (typeof window !== "undefined") window.MassariVisuals = api;
  if (typeof module !== "undefined") module.exports = api;
})();
