/* Massari scenes: faceted ("high-poly") generative canvas art. Classic script, no dependencies.
   Seeded PRNG + Bowyer-Watson Delaunay; each facet is shaded from its pseudo-normal against a moving light. */
(function (root) {
  "use strict";

  var DEF = { tourism: "#B5582B", technology: "#2F5FA7", health: "#2E7D5B", finance: "#8A6A1F", culture: "#8C3B5E", energy: "#2F7F86" };
  var SEED = { tourism: 11, technology: 23, health: 37, finance: 41, culture: 53, energy: 67, backdrop: 79 };
  var FPS = 30, N = 40, TAU = Math.PI * 2;

  /* ---------- maths ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function makeNoise(seed) {
    function h(i, j) { var s = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453; return s - Math.floor(s); }
    return function (x, y) {
      var i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
      var u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
      var a = h(i, j), b = h(i + 1, j), c = h(i, j + 1), d = h(i + 1, j + 1);
      return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
    };
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }

  // Bowyer-Watson. pts: [[x,y]...] -> [[i,j,k]...]. ponytail: O(n^2), fine for the <=600 points per mesh used here.
  function delaunay(pts) {
    var n = pts.length, i, j;
    if (n < 3) return [];
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (i = 0; i < n; i++) {
      if (pts[i][0] < minX) minX = pts[i][0]; if (pts[i][0] > maxX) maxX = pts[i][0];
      if (pts[i][1] < minY) minY = pts[i][1]; if (pts[i][1] > maxY) maxY = pts[i][1];
    }
    var d = Math.max(maxX - minX, maxY - minY) * 20, mx = (minX + maxX) / 2, my = (minY + maxY) / 2;
    var P = pts.concat([[mx - d, my - d], [mx, my + d], [mx + d, my - d]]);
    function tri(a, b, c) {
      var ax = P[a][0], ay = P[a][1], bx = P[b][0], by = P[b][1], cx = P[c][0], cy = P[c][1];
      var D = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
      if (Math.abs(D) < 1e-12) return { a: a, b: b, c: c, x: 0, y: 0, r: Infinity };
      var a2 = ax * ax + ay * ay, b2 = bx * bx + by * by, c2 = cx * cx + cy * cy;
      var ux = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / D;
      var uy = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / D;
      return { a: a, b: b, c: c, x: ux, y: uy, r: (ax - ux) * (ax - ux) + (ay - uy) * (ay - uy) };
    }
    var tris = [tri(n, n + 1, n + 2)];
    for (i = 0; i < n; i++) {
      var px = P[i][0], py = P[i][1], keep = [], edges = {};
      for (j = 0; j < tris.length; j++) {
        var t = tris[j], dx = px - t.x, dy = py - t.y;
        if (dx * dx + dy * dy <= t.r) {
          addEdge(edges, t.a, t.b); addEdge(edges, t.b, t.c); addEdge(edges, t.c, t.a);
        } else keep.push(t);
      }
      for (var k in edges) if (edges[k][2] === 1) keep.push(tri(edges[k][0], edges[k][1], i));
      tris = keep;
    }
    var out = [];
    for (j = 0; j < tris.length; j++) if (tris[j].a < n && tris[j].b < n && tris[j].c < n) out.push([tris[j].a, tris[j].b, tris[j].c]);
    return out;
  }
  function addEdge(e, a, b) { var k = a < b ? a + "," + b : b + "," + a; if (e[k]) e[k][2]++; else e[k] = [a, b, 1]; }

  function inside(x, y, poly) {
    var c = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  function distPoly(x, y, poly) {
    var best = Infinity;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var ax = poly[j][0], ay = poly[j][1], bx = poly[i][0], by = poly[i][1];
      var dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy, t = l ? clamp(((x - ax) * dx + (y - ay) * dy) / l, 0, 1) : 0;
      var ex = ax + dx * t - x, ey = ay + dy * t - y, dd = ex * ex + ey * ey;
      if (dd < best) best = dd;
    }
    return Math.sqrt(best);
  }
  function polyArea(p) { var a = 0; for (var i = 0, j = p.length - 1; i < p.length; j = i++) a += (p[j][0] + p[i][0]) * (p[j][1] - p[i][1]); return Math.abs(a / 2); }

  // Midpoint displacement on edges for a hand-cut, eroded outline. Edges on/below `floor` stay straight.
  function roughen(poly, rng, amt, iters, floor) {
    for (var it = 0; it < iters; it++) {
      var out = [];
      for (var i = 0; i < poly.length; i++) {
        var a = poly[i], b = poly[(i + 1) % poly.length];
        out.push(a);
        if (a[1] >= floor - 0.5 && b[1] >= floor - 0.5) continue;
        var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy), o = (rng() - 0.5) * l * amt;
        out.push([(a[0] + b[0]) / 2 - dy / l * o, (a[1] + b[1]) / 2 + dx / l * o]);
      }
      poly = out;
    }
    return poly;
  }

  /* ---------- faceted mesh ---------- */
  // o: { mat, sp (interior spacing px), bsp (boundary spacing), z(x, y, d) -> height px, haze, gain, jit, max }
  function mesh(poly, o, rng) {
    var sp = Math.max(o.sp || 24, Math.sqrt(polyArea(poly) / (o.max || 320)));
    var bsp = o.bsp || sp * 0.75, pts = [], i;
    for (i = 0; i < poly.length; i++) {
      var a = poly[i], b = poly[(i + 1) % poly.length];
      var l = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.round(l / bsp));
      for (var s = 0; s < k; s++) pts.push([a[0] + (b[0] - a[0]) * s / k, a[1] + (b[1] - a[1]) * s / k]);
    }
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    poly.forEach(function (p) { minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); });
    var row = 0;
    for (var y = minY + sp / 2; y < maxY; y += sp * 0.866, row++) {
      for (var x = minX + (row % 2 ? sp / 2 : 0); x < maxX; x += sp) {
        var px = x + (rng() - 0.5) * sp * 0.75, py = y + (rng() - 0.5) * sp * 0.75;
        if (inside(px, py, poly) && distPoly(px, py, poly) > sp * 0.38) pts.push([px, py]);
      }
    }
    for (i = 0; i < pts.length; i++) { pts[i][0] += (rng() - 0.5) * 1e-3; pts[i][1] += (rng() - 0.5) * 1e-3; }
    var z = pts.map(function (p) { return o.z ? o.z(p[0], p[1], distPoly(p[0], p[1], poly)) : 0; });
    var F = [], jit = o.jit == null ? 0.08 : o.jit;
    delaunay(pts).forEach(function (t) {
      var A = pts[t[0]], B = pts[t[1]], C = pts[t[2]];
      var ar = ((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])) / 2;
      if (Math.abs(ar) < 0.3) return;
      var cx = (A[0] + B[0] + C[0]) / 3, cy = (A[1] + B[1] + C[1]) / 3;
      // edge midpoints nudged toward the centroid, so edges lying on the outline still count as inside
      function mid(P, Q) { return inside((P[0] + Q[0]) * 0.45 + cx * 0.1, (P[1] + Q[1]) * 0.45 + cy * 0.1, poly); }
      if (!inside(cx, cy, poly) || !mid(A, B) || !mid(B, C) || !mid(A, C)) return;
      // world axes: X right, Y up, Z toward viewer
      var ux = B[0] - A[0], uy = A[1] - B[1], uz = z[t[1]] - z[t[0]];
      var vx = C[0] - A[0], vy = A[1] - C[1], vz = z[t[2]] - z[t[0]];
      var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
      var nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      F.push({ x0: A[0], y0: A[1], x1: B[0], y1: B[1], x2: C[0], y2: C[1], nx: nx / nl, ny: ny / nl, nz: nz / nl, j: (rng() - 0.5) * jit });
    });
    var bk = []; for (i = 0; i < N; i++) bk.push([]);
    return { poly: poly, f: F, mat: o.mat, haze: o.haze || 0, gain: o.gain || 1.3, bk: bk };
  }

  // Architectural volume: split at the ridge x=rx into a left and a right face, each a gently noisy plane.
  function clipX(poly, v, less) {
    var out = [];
    for (var i = 0; i < poly.length; i++) {
      var a = poly[i], b = poly[(i + 1) % poly.length], ia = less ? a[0] <= v : a[0] >= v, ib = less ? b[0] <= v : b[0] >= v;
      if (ia) out.push(a);
      if (ia !== ib) out.push([v, a[1] + (b[1] - a[1]) * (v - a[0]) / (b[0] - a[0])]);
    }
    return out;
  }
  function prism(poly, rx, o, rng, nz, k) {
    var parts = [], sp = o.sp, base = o.z;
    [true, false].forEach(function (left) {
      var q = clipX(poly, rx, left);
      if (q.length < 3 || polyArea(q) < 4) return;
      var oo = {}; for (var key in o) oo[key] = o[key];
      oo.z = function (x, y, d) { return (left ? 1 : -1) * (x - rx) * k + nz(x / (sp * 1.5), y / (sp * 2.5)) * sp * (o.rough == null ? 0.2 : o.rough) + (base ? base(x, y, d) : 0); };
      parts.push(mesh(q, oo, rng));
    });
    return { poly: poly, parts: parts, mat: o.mat, haze: o.haze || 0 };
  }

  function light(t, prog) {
    var lx = prog == null ? -0.62 + 0.3 * Math.sin(t * 0.21) : -0.9 + 1.8 * prog + 0.08 * Math.sin(t * 0.21), ly = 0.5 + 0.08 * Math.cos(t * 0.17), lz = 0.62;
    var l = Math.sqrt(lx * lx + ly * ly + lz * lz);
    return [lx / l, ly / l, lz / l];
  }

  function drawMesh(ctx, m, R) {
    if (m.parts) { for (var p = 0; p < m.parts.length; p++) drawMesh(ctx, m.parts[p], R); return; }
    var lut = R.P.lut(m.mat, m.haze), L = R.L, e = R.dawn, bk = m.bk, i, k, f, v;
    for (i = 0; i < N; i++) bk[i].length = 0;
    for (i = 0; i < m.f.length; i++) {
      f = m.f[i];
      v = 0.5 + ((f.nx * L[0] + f.ny * L[1] + f.nz * L[2]) - L[2]) * m.gain + f.j;
      v = v * e + 0.08 * (1 - e);
      k = v <= 0 ? 0 : v >= 1 ? N - 1 : (v * (N - 1) + 0.5) | 0;
      bk[k].push(f);
    }
    var top = 0; for (k = 1; k < N; k++) if (bk[k].length > bk[top].length) top = k;
    ctx.fillStyle = lut[top];
    path(ctx, m.poly); ctx.fill();
    ctx.lineWidth = 0.9; ctx.lineJoin = "round";
    for (k = 0; k < N; k++) {
      var arr = bk[k];
      if (!arr.length) continue;
      ctx.beginPath();
      for (i = 0; i < arr.length; i++) {
        f = arr[i];
        ctx.moveTo(f.x0, f.y0); ctx.lineTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.closePath();
      }
      ctx.fillStyle = ctx.strokeStyle = lut[k];
      ctx.fill(); ctx.stroke();
    }
  }

  /* ---------- colour ---------- */
  function hex(c) {
    if (typeof c !== "string") return c;
    c = c.replace("#", ""); if (c.length === 3) c = c.replace(/./g, "$&$&");
    var n = parseInt(c, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, t) { a = hex(a); b = hex(b); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function rgba(c, a) { c = hex(c); return "rgba(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + "," + (a == null ? 1 : a) + ")"; }

  // Palette object: colours + memoised facet LUTs (lo -> mid -> hi, hazed toward P.haze).
  function palette(def) {
    var cache = {};
    def.lut = function (mat, haze) {
      var key = mat + "|" + haze;
      if (cache[key]) return cache[key];
      var m = def.m[mat], out = [];
      for (var k = 0; k < N; k++) {
        var t = k / (N - 1), c = t < 0.5 ? mix(m[0], m[1], t * 2) : mix(m[1], m[2], (t - 0.5) * 2);
        if (haze) c = mix(c, def.haze, haze);
        out.push(rgba(c));
      }
      return (cache[key] = out);
    };
    return def;
  }

  function accentFor(id, theme) {
    var list = root && root.MASSARI_SECTORS, s = null;
    if (list && list.length) for (var i = 0; i < list.length; i++) if (list[i].id === id) s = list[i];
    if (s && s.colorDark) return theme === "dark" ? s.colorDark : s.color;
    var base = DEF[id] || "#B7862B";
    return theme === "dark" ? mix(base, "#FFFFFF", 0.28) : base;
  }

  /* ---------- drawing helpers ---------- */
  function path(ctx, p) { ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (var i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); ctx.closePath(); }
  function sky(ctx, w, h, stops) {
    var g = ctx.createLinearGradient(0, 0, 0, h);
    for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], rgba(stops[i][1]));
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    return g;
  }
  function glow(ctx, x, y, r, col, a) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(col, a)); g.addColorStop(0.35, rgba(col, a * 0.45)); g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function makeStars(rng, w, h, n, yMax, avoid) {
    var s = [];
    for (var i = 0; i < n; i++) {
      var x = rng() * w, y = Math.pow(rng(), 1.4) * yMax;
      if (avoid && avoid(x, y)) continue;
      s.push({ x: x, y: y, r: 0.35 + Math.pow(rng(), 3) * 1.6, a: 0.35 + rng() * 0.65, sp: 0.8 + rng() * 2.6, ph: rng() * TAU });
    }
    return s;
  }
  function drawStars(ctx, stars, t, col, k, fadeY) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], a = s.a * (0.55 + 0.45 * Math.sin(t * s.sp + s.ph)) * k;
      if (fadeY) a *= clamp(1 - s.y / fadeY, 0, 1);
      if (a < 0.02) continue;
      ctx.fillStyle = rgba(col, a);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
      if (s.r > 1.2) {
        ctx.fillStyle = rgba(col, a * 0.5);
        ctx.fillRect(s.x - s.r * 4, s.y - 0.4, s.r * 8, 0.8); ctx.fillRect(s.x - 0.4, s.y - s.r * 4, 0.8, s.r * 8);
      }
    }
  }
  function vignette(ctx, w, h, a) {
    var g = ctx.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.35, w / 2, h * 0.5, Math.hypot(w, h) * 0.62);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0," + a + ")");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }

  // Dune band: sharp cusped crests (1-|sin|)^p, heights make the lit windward / shaded slip-face split.
  function dune(w, h, yBase, amp, f, p, o, rng, nz) {
    var crest = function (x) {
      var s = 1 - Math.abs(Math.sin(x * f + p));
      return yBase - amp * (0.2 + 0.8 * Math.pow(s, 1.8)) - amp * 0.3 * Math.sin(x * f * 0.41 + p * 2.3);
    };
    var poly = [], st = Math.max(4, 0.12 / f);
    for (var x = -30; x <= w + 30; x += st) poly.push([x, crest(x)]);
    poly.push([w + 30, crest(w + 30)], [w + 30, h + 30], [-30, h + 30]);
    var sp = o.sp;
    o.z = function (x, y) {
      var s = Math.sin(x * f + p), c = 1 - Math.abs(s);
      var skew = s > 0 ? 1.25 : 0.7; // asymmetric: steep slip face one side
      return (0.5 / f) * Math.pow(c, 1.5) * skew * Math.exp(-(y - crest(x)) / (amp * 3 + 1)) + nz(x / (sp * 2.2), y / (sp * 2.2)) * sp * 0.55;
    };
    var m = mesh(poly, o, rng);
    m.crest = crest;
    return m;
  }

  /* ---------- scenes ---------- */
  var SCENES = {};

  // Tourism: Qasr al-Farid (Hegra) monolith with carved stepped-crown facade, desert night.
  SCENES.tourism = {
    build: function (w, h, rng, nz) {
      var U = Math.min(h, w * 1.05), gy = h * 0.87, cx = w * 0.5, Rw = U * 0.74, Rh = U * 0.72;
      var shape = [[-0.52, 0], [-0.55, 0.14], [-0.5, 0.3], [-0.54, 0.44], [-0.49, 0.6], [-0.42, 0.72], [-0.36, 0.84], [-0.24, 0.9], [-0.14, 0.99], [-0.02, 1],
        [0.1, 0.96], [0.2, 0.97], [0.32, 0.88], [0.4, 0.8], [0.47, 0.66], [0.5, 0.5], [0.55, 0.36], [0.53, 0.18], [0.57, 0]];
      var rock = roughen(shape.map(function (p) { return [cx + p[0] * Rw, gy - p[1] * Rh]; }), rng, 0.16, 3, gy);
      var sp = U * 0.05;
      var S = { gy: gy, U: U, meshes: [] };
      S.far = dune(w, h, gy - U * 0.06, U * 0.06, 2.2 / w, 1.3, { mat: "sand", sp: sp * 1.3, haze: 0.45 }, rng, nz);
      S.rock = mesh(rock, {
        mat: "rock", sp: sp, max: 300, jit: 0.1,
        z: function (x, y, d) { return Math.sqrt(d) * Math.sqrt(U) * 0.55 + nz(x / (sp * 1.6), y / (sp * 1.6)) * sp * 0.9; }
      }, rng);
      // facade
      var fx0 = cx - Rw * 0.25, fx1 = cx + Rw * 0.21, Fw = fx1 - fx0, fy0 = gy - Rh * 0.8, Fh = gy - fy0;
      var ch = Fh * 0.25, yb = fy0 + ch, st = 5, sw = Fw * 0.078, fac = [[fx0, gy], [fx0, fy0]];
      for (var i = 0; i < st; i++) { fac.push([fx0 + sw * (i + 1), fy0 + ch / st * i]); fac.push([fx0 + sw * (i + 1), fy0 + ch / st * (i + 1)]); }
      for (i = st - 1; i >= 0; i--) { fac.push([fx1 - sw * (i + 1), fy0 + ch / st * (i + 1)]); fac.push([fx1 - sw * (i + 1), fy0 + ch / st * i]); }
      fac.push([fx1, fy0], [fx1, gy]);
      S.facade = mesh(fac, { mat: "carved", sp: sp * 1.4, bsp: sp, jit: 0.05, gain: 0.8,
        z: function (x, y) { return nz(x / (sp * 3), y / (sp * 3) + 9) * sp * 0.6; } }, rng);
      S.fac = { x0: fx0, x1: fx1, y0: fy0, yb: yb, Fw: Fw, Fh: Fh, y1: fy0 + Fh * 0.44, gy: gy, poly: fac };
      var apron = [];
      for (var ax = -1; ax <= 1.0001; ax += 0.1) apron.push([cx + ax * Rw * 0.75, gy + U * 0.02 - U * 0.055 * Math.pow(Math.cos(ax * Math.PI / 2), 1.5) * (1 + 0.25 * nz(ax * 4, 7))]);
      apron.push([cx + Rw * 0.75, gy + U * 0.06], [cx - Rw * 0.75, gy + U * 0.06]);
      S.apron = mesh(apron, { mat: "sand", sp: sp * 0.8, z: function (x, y, d) { return Math.sqrt(d) * 4 + nz(x / sp, y / sp) * sp * 0.4; } }, rng);
      S.near = dune(w, h, gy + U * 0.06, U * 0.065, 3.1 / w, 4.1, { mat: "sand", sp: sp * 1.1 }, rng, nz);
      S.stars = makeStars(rng, w, h, Math.round(w * h / 2600), gy * 0.9, function (x, y) { return inside(x, y, rock); });
      S.moon = { x: w * 0.84, y: h * 0.17, r: U * 0.04 };
      return S;
    },
    palette: function (dark, a) {
      return dark ? {
        sky: [[0, "#04060C"], [0.5, "#0C1220"], [0.82, mix("#1A1A26", a, 0.18)], [1, mix("#2A2024", a, 0.25)]],
        haze: mix("#1A1822", a, 0.12), star: "#FFF4E0", moon: "#F6E7C8",
        m: { rock: [mix(a, "#050305", 0.86), mix(a, "#120B0B", 0.5), mix(a, "#FFC9A0", 0.3)],
             carved: [mix(a, "#0B0707", 0.7), mix(a, "#2A1A16", 0.3), mix(a, "#FFD7B0", 0.42)],
             sand: ["#0C0D11", "#1E1C20", mix("#4E3D35", a, 0.2)] },
        sh: "rgba(0,0,0,0.55)", hl: "rgba(255,214,170,0.16)", door: "#030203", glowA: 0.22
      } : {
        sky: [[0, "#4E4C6A"], [0.42, "#9C8796"], [0.72, "#D9B79E"], [1, "#EED6B6"]],
        haze: "#E3C6A8", star: "#FFF8EA", moon: "#FFF6E2",
        m: { rock: [mix(a, "#2A120A", 0.55), mix(a, "#D08858", 0.25), mix(a, "#FFE2C0", 0.55)],
             carved: [mix(a, "#3A1A0E", 0.35), mix(a, "#EDB889", 0.5), "#FBE7CF"],
             sand: ["#C49E74", "#E0C39B", "#F7E9D2"] },
        sh: "rgba(70,28,10,0.38)", hl: "rgba(255,244,228,0.5)", door: "#2A130B", glowA: 0.35
      };
    },
    draw: function (ctx, S, R) {
      var P = R.P, w = R.w, h = R.h, t = R.t, g = sky(ctx, w, h, P.sky);
      glow(ctx, w * 0.5, S.gy, w * 0.7, R.acc, P.glowA);
      drawStars(ctx, S.stars, t, P.star, R.dark ? 1 : 0.85, R.dark ? 0 : h * 0.6);
      var m = S.moon;
      glow(ctx, m.x, m.y, m.r * 5, P.moon, R.dark ? 0.25 : 0.3);
      ctx.fillStyle = rgba(P.moon); ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, TAU); ctx.fill();
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(m.x + m.r * 0.42, m.y - m.r * 0.25, m.r * 0.9, 0, TAU); ctx.fill();
      drawMesh(ctx, S.far, R);
      drawMesh(ctx, S.rock, R);
      drawMesh(ctx, S.facade, R);
      facadeDetail(ctx, S.fac, P, R);
      drawMesh(ctx, S.apron, R);
      drawMesh(ctx, S.near, R);
    }
  };

  function facadeDetail(ctx, f, P, R) {
    var x0 = f.x0, x1 = f.x1, Fw = f.Fw, Fh = f.Fh, gy = f.gy, sh = P.sh, hl = P.hl, i, x;
    ctx.save();
    path(ctx, f.poly); ctx.clip();
    // carving depth: rock lip shadow on the left and along the crown
    var g = ctx.createLinearGradient(x0, 0, x0 + Fw * 0.08, 0);
    g.addColorStop(0, sh); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(x0, f.y0, Fw * 0.08, Fh);
    function band(y, hgt) {
      ctx.fillStyle = hl; ctx.fillRect(x0, y, Fw, hgt * 0.35);
      ctx.fillStyle = sh; ctx.fillRect(x0, y + hgt * 0.35, Fw, hgt * 0.65);
    }
    band(f.yb, Fh * 0.03);
    band(f.yb + Fh * 0.05, Fh * 0.018);
    band(f.y1, Fh * 0.035);
    band(f.y1 + Fh * 0.05, Fh * 0.03);
    // attic half-pilasters
    var attic = [0.03, 0.26, 0.74, 0.97];
    for (i = 0; i < attic.length; i++) {
      x = x0 + Fw * attic[i];
      ctx.fillStyle = sh; ctx.fillRect(x + Fw * 0.018, f.yb + Fh * 0.075, Fw * 0.014, f.y1 - f.yb - Fh * 0.075);
      ctx.fillStyle = hl; ctx.fillRect(x - Fw * 0.02, f.yb + Fh * 0.075, Fw * 0.008, f.y1 - f.yb - Fh * 0.075);
    }
    // four main pilasters with capitals
    var top = f.y1 + Fh * 0.09, pil = [0.045, 0.24, 0.76, 0.955];
    for (i = 0; i < pil.length; i++) {
      x = x0 + Fw * pil[i];
      ctx.fillStyle = sh; ctx.fillRect(x + Fw * 0.024, top, Fw * 0.018, gy - top);
      ctx.fillStyle = hl; ctx.fillRect(x - Fw * 0.03, top, Fw * 0.01, gy - top);
      ctx.fillStyle = hl; ctx.fillRect(x - Fw * 0.04, top - Fh * 0.012, Fw * 0.08, Fh * 0.012);
      ctx.fillStyle = sh; ctx.fillRect(x - Fw * 0.04, top, Fw * 0.08, Fh * 0.01);
    }
    // doorway, frame, pediment and urn
    var dw = Fw * 0.2, dx = x0 + Fw * 0.5 - dw / 2, dh = (gy - top) * 0.5, dy = gy - dh;
    ctx.fillStyle = hl; ctx.fillRect(dx - Fw * 0.03, dy - Fh * 0.03, dw + Fw * 0.06, dh + Fh * 0.03);
    ctx.fillStyle = sh; ctx.fillRect(dx - Fw * 0.022, dy - Fh * 0.022, dw + Fw * 0.044, dh + Fh * 0.022);
    ctx.fillStyle = rgba(P.door); ctx.fillRect(dx, dy, dw, dh);
    var py = dy - Fh * 0.045, pw = dw * 0.8;
    ctx.beginPath(); ctx.moveTo(dx + dw / 2 - pw, py); ctx.lineTo(dx + dw / 2, py - Fh * 0.075); ctx.lineTo(dx + dw / 2 + pw, py);
    ctx.lineWidth = Math.max(1, Fh * 0.012); ctx.strokeStyle = sh; ctx.stroke();
    ctx.translate(0, -Fh * 0.008); ctx.strokeStyle = hl; ctx.lineWidth = Math.max(0.8, Fh * 0.006); ctx.stroke();
    ctx.restore();
    // carved outline: the crow-step crown reads as cut into the rock
    path(ctx, f.poly); ctx.lineJoin = "miter"; ctx.lineWidth = Math.max(1.5, Fw * 0.014); ctx.strokeStyle = sh; ctx.stroke();
    ctx.save(); ctx.translate(Fw * 0.006, Fw * 0.006); ctx.lineWidth = Math.max(0.8, Fw * 0.005); ctx.strokeStyle = hl; ctx.stroke(); ctx.restore();
    ctx.fillStyle = sh;
    ctx.beginPath(); ctx.ellipse(dx + dw / 2, py - Fh * 0.105, Fw * 0.022, Fh * 0.024, 0, 0, TAU); ctx.fill();
    ctx.fillRect(dx + dw / 2 - Fw * 0.006, py - Fh * 0.09, Fw * 0.012, Fh * 0.012);
  }

  // Technology: Riyadh skyline, Kingdom Centre + Al Faisaliah, circuit constellation.
  SCENES.technology = {
    build: function (w, h, rng, nz) {
      var U = Math.min(h, w * 1.0), gy = h * 0.9, cx = w * 0.54, sp = U * 0.045;
      var S = { gy: gy, U: U };
      var KH = U * 0.84, KW = KH * 0.28, h0 = 0.69;
      function hw(q) { return KW / 2 * (1 - 0.34 * Math.pow(q, 1.7)); }
      var G = hw(1) * 0.62;
      function gi(q) { return G * Math.pow((q - h0) / (1 - h0), 0.52); }
      var kc = [], q, steps = 26;
      for (var i = 0; i <= steps; i++) { q = i / steps; kc.push([cx - hw(q), gy - q * KH]); }
      for (i = steps; i >= 0; i--) { q = h0 + (1 - h0) * i / steps; kc.push([cx - gi(q), gy - q * KH]); }
      for (i = 1; i <= steps; i++) { q = h0 + (1 - h0) * i / steps; kc.push([cx + gi(q), gy - q * KH]); }
      for (i = steps; i >= 0; i--) { q = i / steps; kc.push([cx + hw(q), gy - q * KH]); }
      S.kc = prism(kc, cx, { mat: "glass", sp: sp * 0.8, bsp: sp * 0.45, jit: 0.07, gain: 1.1,
        z: function (x, y) { return (gy - y) * 0.12 * Math.sin(x * 0.02); } }, rng, nz, 0.55);
      var qb = 0.9;
      S.kcInfo = { cx: cx, gy: gy, KH: KH, poly: kc, bridge: { y: gy - qb * KH, hw: gi(qb) }, top: gy - KH };
      // Al Faisaliah: tapered lattice pyramid with a golden globe
      var fx = cx - U * 0.52, FH = KH * 0.64, FW = FH * 0.3;
      var fa = [[fx - FW / 2, gy], [fx - FW * 0.1, gy - FH * 0.8], [fx, gy - FH], [fx + FW * 0.1, gy - FH * 0.8], [fx + FW / 2, gy]];
      S.fa = prism(fa, fx, { mat: "glassFar", sp: sp * 0.8, bsp: sp * 0.5, haze: 0.18, jit: 0.05 }, rng, nz, 0.9);
      S.faInfo = { x: fx, gy: gy, FH: FH, FW: FW };
      // city blocks (two depths)
      S.city = [];
      [[0.5, U * 0.2, 0.5], [0.22, U * 0.12, 0.0]].forEach(function (L, li) {
        var x = -20, polys = [];
        while (x < w + 20) {
          var bw = U * (0.05 + rng() * 0.08), bh = L[1] * (0.3 + rng() * 0.75);
          if (Math.abs(x + bw / 2 - cx) < KW * 0.7) bh *= 0.45;
          var slant = rng() < 0.2 ? bh * 0.12 * (rng() < 0.5 ? 1 : -1) : 0;
          polys.push([[x, gy + 2], [x, gy - bh - Math.max(0, slant)], [x + bw, gy - bh - Math.max(0, -slant)], [x + bw, gy + 2]]);
          x += bw + U * 0.004;
        }
        polys.forEach(function (p) {
          var mx = p[0][0] + (p[3][0] - p[0][0]) * (0.3 + rng() * 0.4);
          S.city.push(prism(p, mx, { mat: li ? "block" : "blockFar", sp: sp * 0.9, haze: L[0], jit: 0.06 }, rng, nz, 0.9));
        });
      });
      S.ground = [[-10, gy], [w + 10, gy], [w + 10, h + 10], [-10, h + 10]];
      // circuit constellation: nodes + orthogonal/45deg traces
      var nodes = [], tries = 0;
      while (nodes.length < 12 && tries++ < 400) {
        var nx = w * (0.04 + rng() * 0.92), ny = h * (0.07 + rng() * 0.36);
        if (Math.abs(nx - cx) < KW * 0.9 && ny > S.kcInfo.top - U * 0.05) continue;
        if (nodes.some(function (n) { return Math.hypot(n.x - nx, n.y - ny) < U * 0.12; })) continue;
        nodes.push({ x: nx, y: ny, ph: rng() * TAU, r: U * (0.006 + rng() * 0.006) });
      }
      var traces = [];
      nodes.forEach(function (a, ai) {
        var near = nodes.map(function (b, bi) { return { b: b, bi: bi, d: Math.hypot(b.x - a.x, b.y - a.y) }; })
          .filter(function (o) { return o.bi > ai && o.d < U * 0.42; }).sort(function (p, q) { return p.d - q.d; }).slice(0, rng() < 0.5 ? 1 : 2);
        near.forEach(function (o) {
          var b = o.b, dx = b.x - a.x, dy = b.y - a.y, hx = Math.abs(dx) - Math.abs(dy);
          var mid = hx > 0 ? [a.x + Math.sign(dx) * hx, a.y] : [a.x, a.y + Math.sign(dy) * (Math.abs(dy) - Math.abs(dx))];
          var pts = [[a.x, a.y], mid, [b.x, b.y]];
          var len = Math.hypot(mid[0] - a.x, mid[1] - a.y) + Math.hypot(b.x - mid[0], b.y - mid[1]);
          traces.push({ p: pts, len: len, sp: 0.18 + rng() * 0.25, ph: rng() });
        });
      });
      S.nodes = nodes; S.traces = traces;
      S.stars = makeStars(rng, w, h, Math.round(w * h / 5200), h * 0.6);
      return S;
    },
    palette: function (dark, a) {
      return dark ? {
        sky: [[0, "#03050B"], [0.55, mix("#07101F", a, 0.12)], [1, mix("#101A30", a, 0.3)]],
        haze: mix("#0B1324", a, 0.25), circuit: mix(a, "#9FD0FF", 0.5), star: "#DDE8FF",
        m: { glass: [mix(a, "#020308", 0.8), mix(a, "#0A1222", 0.45), mix(a, "#CDE6FF", 0.5)],
             glassFar: ["#03050A", mix(a, "#080C16", 0.65), mix(a, "#A9C7F0", 0.25)],
             block: ["#04060B", "#0C111C", mix(a, "#26324A", 0.6)], blockFar: ["#060911", "#0E1422", mix(a, "#1C2740", 0.6)] },
        ground: "#05070C", win: mix(a, "#CFE6FF", 0.55), gold: "#F2C46A", glowA: 0.4
      } : {
        sky: [[0, mix(a, "#EDE7DC", 0.7)], [0.6, "#E6E2D8"], [1, "#EFE3CC"]],
        haze: "#E4E2DA", circuit: mix(a, "#1C2C44", 0.2), star: "#FFFFFF",
        m: { glass: [mix(a, "#0B1220", 0.62), mix(a, "#A9BCD3", 0.45), "#F4F7FA"],
             glassFar: [mix(a, "#1A2230", 0.5), mix(a, "#B8C5D4", 0.6), "#F1F3F5"],
             block: ["#9FA7B0", "#C9CCCC", "#F2EFE8"], blockFar: ["#B9BDBF", "#D6D6D1", "#EFEDE6"] },
        ground: "#D8CDB9", win: mix(a, "#FFFFFF", 0.3), gold: "#C89A3C", glowA: 0.18
      };
    },
    draw: function (ctx, S, R) {
      var P = R.P, w = R.w, h = R.h, t = R.t, i, k;
      sky(ctx, w, h, P.sky);
      glow(ctx, S.kcInfo.cx, S.gy, w * 0.75, R.acc, P.glowA);
      if (R.dark) drawStars(ctx, S.stars, t, P.star, 0.7, 0);
      // circuit
      ctx.lineWidth = Math.max(1, S.U * 0.003); ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (i = 0; i < S.traces.length; i++) {
        var tr = S.traces[i];
        ctx.strokeStyle = rgba(P.circuit, R.dark ? 0.32 : 0.28);
        ctx.beginPath(); ctx.moveTo(tr.p[0][0], tr.p[0][1]); ctx.lineTo(tr.p[1][0], tr.p[1][1]); ctx.lineTo(tr.p[2][0], tr.p[2][1]); ctx.stroke();
        var u = R.still ? 0.6 : (t * tr.sp + tr.ph) % 1;
        for (k = 0; k < 7; k++) {
          var pt = along(tr, u - k * 0.018);
          if (!pt) continue;
          ctx.fillStyle = rgba(P.circuit, (R.dark ? 0.9 : 0.75) * (1 - k / 7));
          ctx.beginPath(); ctx.arc(pt[0], pt[1], ctx.lineWidth * (1.6 - k * 0.15), 0, TAU); ctx.fill();
        }
      }
      for (i = 0; i < S.nodes.length; i++) {
        var n = S.nodes[i], pu = 0.5 + 0.5 * Math.sin(t * 2.2 + n.ph);
        if (R.dark) glow(ctx, n.x, n.y, n.r * 7, P.circuit, 0.25 + 0.3 * pu);
        ctx.strokeStyle = rgba(P.circuit, 0.5 + 0.4 * pu); ctx.lineWidth = Math.max(1, n.r * 0.35);
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (1.4 + pu * 0.5), 0, TAU); ctx.stroke();
        ctx.fillStyle = rgba(P.circuit, 0.9); ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 0.6, 0, TAU); ctx.fill();
      }
      for (i = 0; i < S.city.length; i++) {
        drawMesh(ctx, S.city[i], R);
        if (R.dark) cityWindows(ctx, S.city[i], P, t, i);
      }
      drawMesh(ctx, S.fa, R);
      var f = S.faInfo, gr = f.FH * 0.055, gyb = f.gy - f.FH * 0.66;
      ctx.strokeStyle = rgba(R.dark ? "#000000" : "#2A3444", 0.25); ctx.lineWidth = 0.8;
      for (k = 1; k < 9; k++) { // lattice
        var yy = f.gy - f.FH * 0.8 * k / 9, half = f.FW / 2 * (1 - k / 9 * 0.8);
        ctx.beginPath(); ctx.moveTo(f.x - half, yy); ctx.lineTo(f.x + half, yy); ctx.stroke();
      }
      ctx.fillStyle = rgba(R.dark ? "#05070C" : "#6C7480");
      ctx.fillRect(f.x - gr * 0.12, f.gy - f.FH * 1.12, gr * 0.24, f.FH * 0.14);
      glow(ctx, f.x, gyb, gr * 4, P.gold, R.dark ? 0.55 : 0.3);
      var gg = ctx.createRadialGradient(f.x - gr * 0.35, gyb - gr * 0.35, gr * 0.1, f.x, gyb, gr);
      gg.addColorStop(0, rgba(mix(P.gold, "#FFFFFF", 0.7))); gg.addColorStop(1, rgba(mix(P.gold, "#5A3A0A", 0.25)));
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(f.x, gyb, gr, 0, TAU); ctx.fill();
      drawMesh(ctx, S.kc, R);
      kcDetail(ctx, S.kcInfo, P, R);
      ctx.fillStyle = rgba(P.ground); path(ctx, S.ground); ctx.fill();
    }
  };
  function along(tr, u) {
    if (u < 0) return null;
    var d = u * tr.len, a = tr.p[0], b = tr.p[1], c = tr.p[2], l1 = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (d <= l1) return l1 ? [a[0] + (b[0] - a[0]) * d / l1, a[1] + (b[1] - a[1]) * d / l1] : [a[0], a[1]];
    var l2 = tr.len - l1, e = l2 ? (d - l1) / l2 : 0;
    return [b[0] + (c[0] - b[0]) * e, b[1] + (c[1] - b[1]) * e];
  }
  function cityWindows(ctx, m, P, t, idx) {
    var p = m.poly, x0 = p[0][0], x1 = p[3][0], top = Math.max(p[1][1], p[2][1]), bw = x1 - x0;
    var r = mulberry32(idx * 97 + 5);
    for (var y = top + 6; y < p[0][1] - 4; y += 7) {
      for (var x = x0 + 3; x < x1 - 3; x += Math.max(4, bw / 5)) {
        var v = r();
        if (v > 0.22) continue;
        var a = 0.35 + 0.35 * Math.sin(t * (0.4 + v * 4) + v * 40);
        ctx.fillStyle = rgba(P.win, clamp(a, 0.1, 0.7)); ctx.fillRect(x, y, 1.6, 1.2);
      }
    }
  }
  function kcDetail(ctx, k, P, R) {
    ctx.save();
    path(ctx, k.poly); ctx.clip();
    var fl = k.KH / 60;
    ctx.lineWidth = 0.7;
    for (var y = k.gy - fl; y > k.top; y -= fl) {
      ctx.strokeStyle = rgba(R.dark ? P.win : "#1B2636", R.dark ? 0.1 : 0.07);
      ctx.beginPath(); ctx.moveTo(k.cx - k.KH, y); ctx.lineTo(k.cx + k.KH, y); ctx.stroke();
    }
    // ridge highlight down the centre
    var g = ctx.createLinearGradient(k.cx - k.KH * 0.03, 0, k.cx + k.KH * 0.03, 0);
    g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, R.dark ? rgba(P.win, 0.25) : "rgba(255,255,255,0.45)"); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.fillRect(k.cx - k.KH * 0.03, k.top, k.KH * 0.06, k.KH);
    ctx.restore();
    // skybridge
    var b = k.bridge, th = k.KH * 0.016;
    if (R.dark) glow(ctx, k.cx, b.y, b.hw * 2.2, P.win, 0.35 + 0.1 * Math.sin(R.t * 1.5));
    ctx.fillStyle = rgba(R.dark ? mix(P.win, "#FFFFFF", 0.4) : mix(R.acc, "#0B1220", 0.4));
    ctx.beginPath();
    ctx.moveTo(k.cx - b.hw - 2, b.y); ctx.quadraticCurveTo(k.cx, b.y + th * 1.4, k.cx + b.hw + 2, b.y);
    ctx.lineTo(k.cx + b.hw + 2, b.y + th); ctx.quadraticCurveTo(k.cx, b.y + th * 2.2, k.cx - b.hw - 2, b.y + th); ctx.closePath(); ctx.fill();
  }

  // Health: Asir terraced green mountains, drifting mist, travelling heartbeat.
  SCENES.health = {
    build: function (w, h, rng, nz) {
      var U = Math.min(h, w * 0.85), sp = U * 0.045, S = { U: U, layers: [] };
      function ridge(yBase, amp, rough, peaks, seed) {
        var r = mulberry32(seed), n = 64, pts = [];
        var pk = []; for (var i = 0; i < peaks; i++) pk.push({ x: (i + 0.3 + r() * 0.4) / peaks, a: 0.55 + r() * 0.45, wd: 0.12 + r() * 0.12 });
        for (i = 0; i <= n; i++) {
          var u = i / n, y = 0;
          pk.forEach(function (p) { y = Math.max(y, p.a * Math.max(0, 1 - Math.abs(u - p.x) / p.wd * 0.9)); });
          y += nz(u * 9 + seed, seed) * rough + nz(u * 23, seed + 3) * rough * 0.4;
          pts.push([-20 + (w + 40) * u, yBase - amp * y]);
        }
        return pts;
      }
      var defs = [
        { y: h * 0.66, a: U * 0.3, r: 0.04, p: 4, mat: "mFar", haze: 0.6 },
        { y: h * 0.76, a: U * 0.3, r: 0.05, p: 3, mat: "mMid", haze: 0.35 },
        { y: h * 0.9, a: U * 0.36, r: 0.05, p: 2, mat: "mNear", haze: 0.08, terr: 1 },
        { y: h * 1.04, a: U * 0.24, r: 0.04, p: 2, mat: "mFront", haze: 0, terr: 1 }
      ];
      defs.forEach(function (d, i) {
        var top = ridge(d.y, d.a, d.r, d.p, 101 + i * 13), poly = top.concat([[w + 20, h + 20], [-20, h + 20]]);
        var m = mesh(poly, { mat: d.mat, sp: sp * (1.4 - i * 0.15), haze: d.haze, jit: 0.07,
          z: function (x, y, dd) { return Math.sqrt(dd) * Math.sqrt(U) * 0.5 + nz(x / (sp * 1.5), y / (sp * 1.5) + i) * sp * 0.7; } }, rng);
        m.top = top; m.terr = d.terr; m.base = d.y + U * 0.12;
        S.layers.push(m);
      });
      S.mist = [];
      for (var i = 0; i < 7; i++) S.mist.push({ x: rng() * w, y: h * (0.5 + rng() * 0.3), rx: U * (0.3 + rng() * 0.4), ry: U * (0.04 + rng() * 0.04), v: U * (0.006 + rng() * 0.01), a: 0.3 + rng() * 0.4 });
      S.ecgY = h * 0.3; S.ecgA = U * 0.16; S.beat = Math.max(U * 0.42, w * 0.22);
      S.stars = makeStars(rng, w, h, Math.round(w * h / 4800), h * 0.5);
      return S;
    },
    palette: function (dark, a) {
      return dark ? {
        sky: [[0, "#03070A"], [0.55, mix("#07121A", a, 0.12)], [1, mix("#0E1F1C", a, 0.3)]],
        haze: mix("#0B1716", a, 0.2), mist: "#9EC9B8", pulse: mix(a, "#9DF2C8", 0.6), star: "#E6FFF4",
        m: { mFar: [mix(a, "#07100E", 0.8), mix(a, "#0A1714", 0.62), mix(a, "#5A8F7C", 0.5)], mMid: [mix(a, "#050D0B", 0.8), mix(a, "#081410", 0.55), mix(a, "#6FB08F", 0.45)],
             mNear: [mix(a, "#030806", 0.8), mix(a, "#07110D", 0.45), mix(a, "#8AD3A6", 0.4)], mFront: [mix(a, "#020504", 0.85), mix(a, "#050C09", 0.55), mix(a, "#7ABF95", 0.35)] },
        lip: "rgba(160,230,190,0.18)", wall: "rgba(0,0,0,0.35)", glowA: 0.3
      } : {
        sky: [[0, mix(a, "#E8EEE6", 0.78)], [0.55, "#EAEBDF"], [1, "#EFE6D2"]],
        haze: "#E3E7DC", mist: "#FFFFFF", pulse: mix(a, "#0B3A28", 0.2), star: "#FFFFFF",
        m: { mFar: [mix(a, "#23392E", 0.3), mix(a, "#9FBDA8", 0.55), "#E8F0E6"], mMid: [mix(a, "#16281F", 0.4), mix(a, "#86B393", 0.45), "#DDEBD8"],
             mNear: [mix(a, "#0C1C14", 0.45), mix(a, "#6FAA7E", 0.35), mix(a, "#E4F2D6", 0.7)], mFront: [mix(a, "#0B1812", 0.55), mix(a, "#5C9A6C", 0.3), mix(a, "#D6EBC6", 0.6)] },
        lip: "rgba(245,255,230,0.7)", wall: "rgba(20,60,35,0.22)", glowA: 0.15
      };
    },
    draw: function (ctx, S, R) {
      var P = R.P, w = R.w, h = R.h, t = R.t, i;
      sky(ctx, w, h, P.sky);
      glow(ctx, w * 0.5, h * 0.7, w * 0.7, R.acc, P.glowA);
      if (R.dark) drawStars(ctx, S.stars, t, P.star, 0.8, 0);
      ecg(ctx, S, R);
      for (i = 0; i < S.layers.length; i++) {
        var m = S.layers[i];
        drawMesh(ctx, m, R);
        if (m.terr) terraces(ctx, m, P, S.U);
        if (i < 3) mist(ctx, S, R, i);
      }
    }
  };
  function terraces(ctx, m, P, U) {
    ctx.save(); path(ctx, m.poly); ctx.clip();
    var gap = U * 0.028, top = m.top, n = 14;
    for (var k = 1; k <= n; k++) {
      var f = Math.pow(k / n, 0.9);
      ctx.beginPath();
      for (var i = 0; i < top.length; i++) {
        var x = top[i][0], y = top[i][1] + k * gap * (1 + f * 0.6);
        y = y + (m.base - y) * f * 0.35;
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.lineWidth = Math.max(1.4, U * 0.006); ctx.strokeStyle = P.wall; ctx.stroke();
      ctx.save(); ctx.translate(0, -Math.max(1, U * 0.003));
      ctx.lineWidth = Math.max(0.8, U * 0.0025); ctx.strokeStyle = P.lip; ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
  function mist(ctx, S, R, layer) {
    var w = R.w;
    for (var i = layer; i < S.mist.length; i += 3) {
      var m = S.mist[i], x = ((m.x + R.t * m.v) % (w + m.rx * 2)) - m.rx;
      ctx.save(); ctx.translate(x, m.y); ctx.scale(1, m.ry / m.rx);
      glow(ctx, 0, 0, m.rx, R.P.mist, m.a * (R.dark ? 0.3 : 0.8));
      ctx.restore();
    }
  }
  function ecgShape(u) {
    if (u < 0.12) return 0;
    if (u < 0.22) return 0.1 * Math.sin((u - 0.12) / 0.1 * Math.PI);
    if (u < 0.28) return 0;
    if (u < 0.31) return -0.14 * (u - 0.28) / 0.03;
    if (u < 0.345) return -0.14 + 1.14 * (u - 0.31) / 0.035;
    if (u < 0.385) return 1 - 1.38 * (u - 0.345) / 0.04;
    if (u < 0.41) return -0.38 + 0.38 * (u - 0.385) / 0.025;
    if (u < 0.52) return 0;
    if (u < 0.68) return 0.22 * Math.sin((u - 0.52) / 0.16 * Math.PI);
    return 0;
  }
  function ecg(ctx, S, R) {
    var w = R.w, y0 = S.ecgY, A = S.ecgA, B = S.beat, P = R.P;
    var head = R.still ? w * 0.72 : ((R.t * B * 0.55) % (w + B)) , tail = B * 1.6, step = 2;
    function yAt(x) { var u = ((x % B) + B) % B / B; return y0 - ecgShape(u) * A; }
    ctx.lineWidth = Math.max(1, S.U * 0.004); ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = rgba(P.pulse, R.dark ? 0.08 : 0.1);
    ctx.beginPath(); for (var x = 0; x <= w; x += step) { if (x) ctx.lineTo(x, yAt(x)); else ctx.moveTo(x, yAt(x)); } ctx.stroke();
    if (R.dark) { ctx.shadowColor = rgba(P.pulse, 0.9); ctx.shadowBlur = S.U * 0.02; }
    var seg = 24;
    for (var s = 0; s < seg; s++) {
      var xa = head - tail + tail * s / seg, xb = head - tail + tail * (s + 1) / seg;
      if (xb < 0) continue;
      ctx.strokeStyle = rgba(P.pulse, Math.pow((s + 1) / seg, 1.6) * 0.95);
      ctx.beginPath();
      for (x = Math.max(0, xa); x <= xb; x += step) { if (x === Math.max(0, xa)) ctx.moveTo(x, yAt(x)); else ctx.lineTo(x, yAt(x)); }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    if (head <= w) {
      glow(ctx, head, yAt(head), S.U * 0.05, P.pulse, 0.6);
      ctx.fillStyle = rgba(mix(P.pulse, "#FFFFFF", 0.5)); ctx.beginPath(); ctx.arc(head, yAt(head), S.U * 0.007, 0, TAU); ctx.fill();
    }
  }

  // Finance: KAFD-like cluster of crystalline towers + a rising line chart that draws itself.
  SCENES.finance = {
    build: function (w, h, rng, nz) {
      var U = Math.min(h, w * 1.0), gy = h * 0.9, cx = w * 0.52, sp = U * 0.045, S = { U: U, gy: gy, towers: [] };
      var specs = [
        [-0.43, 0.075, 0.34, "slant", 0.5], [-0.33, 0.09, 0.46, "chamfer", 0.3], [-0.21, 0.085, 0.56, "slant", 0.2], [-0.1, 0.07, 0.4, "flat", 0.6],
        [0, 0.12, 0.88, "crown", 0], [0.14, 0.09, 0.62, "blade", 0.1], [0.25, 0.075, 0.44, "slant", 0.4], [0.35, 0.1, 0.52, "chamfer", 0.2], [0.46, 0.07, 0.32, "flat", 0.5]
      ];
      specs.sort(function (a, b) { return a[4] < b[4] ? 1 : -1; });
      specs.forEach(function (s, i) {
        var x = cx + s[0] * U * 1.1, bw = s[1] * U * 1.45, th = s[2] * U, top = gy - th, x0 = x - bw / 2, x1 = x + bw / 2, p;
        if (s[3] === "crown") p = [[x0, gy], [x0, top + th * 0.16], [x0 + bw * 0.22, top + th * 0.07], [x + bw * 0.12, top], [x1, top + th * 0.1], [x1, gy]];
        else if (s[3] === "slant") p = [[x0, gy], [x0, top + th * 0.1], [x1, top], [x1, gy]];
        else if (s[3] === "chamfer") p = [[x0, gy], [x0, top + bw * 0.3], [x0 + bw * 0.3, top], [x1 - bw * 0.3, top], [x1, top + bw * 0.3], [x1, gy]];
        else if (s[3] === "blade") p = [[x0, gy], [x0, top + th * 0.2], [x1, top], [x1, gy]];
        else p = [[x0, gy], [x0, top], [x1, top], [x1, gy]];
        var rx = x0 + bw * (0.3 + rng() * 0.4), ry = top + th * (0.2 + rng() * 0.3);
        var mat = i % 3 === 1 ? "glassB" : "glass";
        S.towers.push(prism(p, rx, { mat: mat, sp: sp * 1.1, bsp: sp * 0.8, haze: s[4] * 0.6, jit: 0.1, gain: 0.8, rough: 0.05,
          z: function (xx, yy) { return -Math.max(0, ry - yy) * 0.35; } }, rng, nz, 0.85));
      });
      S.ground = [[-10, gy], [w + 10, gy], [w + 10, h + 10], [-10, h + 10]];
      var pts = [], v = 0.12, n = 9;
      for (var i = 0; i < n; i++) {
        pts.push([w * (0.07 + 0.86 * i / (n - 1)), h * (0.56 - v * 0.8)]);
        v += 0.04 + rng() * 0.07 - (i === 3 || i === 6 ? 0.1 : 0);
      }
      var len = 0; for (i = 1; i < n; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      S.chart = { p: pts, len: len };
      return S;
    },
    palette: function (dark, a) {
      return dark ? {
        sky: [[0, "#040406"], [0.6, mix("#0C0C10", a, 0.12)], [1, mix("#1C1710", a, 0.35)]],
        haze: mix("#141210", a, 0.22), line: mix(a, "#FFE3A0", 0.55),
        m: { glass: ["#030304", mix(a, "#08080A", 0.7), mix(a, "#FFE2A8", 0.35)], glassB: ["#020304", "#10141A", mix("#7C8A9C", a, 0.2)] },
        ground: "#060606", win: "#F6D48A", grid: "rgba(255,230,170,0.07)", glowA: 0.35
      } : {
        sky: [[0, mix(a, "#F2EADB", 0.82)], [0.65, "#EFE6D4"], [1, "#EDE1CA"]],
        haze: "#EAE1CF", line: mix(a, "#3A2A05", 0.15),
        m: { glass: [mix(a, "#1B1408", 0.55), mix(a, "#D8C39A", 0.5), "#FDF6E8"], glassB: ["#39424C", "#A9B2BA", "#F4F6F7"] },
        ground: "#D9CBB0", win: "#FFF3D6", grid: "rgba(90,70,20,0.08)", glowA: 0.2
      };
    },
    draw: function (ctx, S, R) {
      var P = R.P, w = R.w, h = R.h, t = R.t, i;
      sky(ctx, w, h, P.sky);
      glow(ctx, w * 0.5, S.gy, w * 0.7, R.acc, P.glowA);
      ctx.strokeStyle = P.grid; ctx.lineWidth = 1;
      for (i = 1; i < 6; i++) { var gy = h * 0.1 * i; ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }
      chart(ctx, S, R);
      for (i = 0; i < S.towers.length; i++) {
        drawMesh(ctx, S.towers[i], R);
        fins(ctx, S.towers[i], P, R, i);
      }
      ctx.fillStyle = rgba(P.ground); path(ctx, S.ground); ctx.fill();
    }
  };
  function fins(ctx, m, P, R, idx) {
    var p = m.poly, x0 = p[0][0], x1 = p[p.length - 1][0], top = Infinity;
    p.forEach(function (q) { top = Math.min(top, q[1]); });
    ctx.save(); path(ctx, p); ctx.clip();
    ctx.strokeStyle = R.dark ? "rgba(255,230,180,0.06)" : "rgba(255,255,255,0.22)"; ctx.lineWidth = 0.8;
    for (var x = x0 + (x1 - x0) / 7; x < x1; x += (x1 - x0) / 7) { ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, p[0][1]); ctx.stroke(); }
    if (R.dark) {
      var r = mulberry32(idx * 31 + 7);
      for (var y = top + 8; y < p[0][1]; y += 6) for (x = x0 + 2; x < x1 - 2; x += 4) {
        var v = r(); if (v > 0.1) continue;
        ctx.fillStyle = rgba(P.win, 0.25 + 0.3 * Math.sin(R.t * (0.3 + v * 5) + v * 60)); ctx.fillRect(x, y, 1.5, 1.1);
      }
    }
    ctx.restore();
  }
  function chart(ctx, S, R) {
    var c = S.chart, P = R.P, pts = c.p, cyc = 7, u = R.still ? 1 : (R.t % cyc) / cyc;
    var prog = ease(u / 0.45), fade = u > 0.88 ? 1 - (u - 0.88) / 0.12 : 1, d = prog * c.len, i;
    var drawn = [pts[0]], acc = 0;
    for (i = 1; i < pts.length; i++) {
      var sl = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (acc + sl <= d) { drawn.push(pts[i]); acc += sl; continue; }
      var e = (d - acc) / sl; drawn.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * e, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * e]); break;
    }
    ctx.save(); ctx.globalAlpha = fade;
    var last = drawn[drawn.length - 1], base = S.gy;
    var g = ctx.createLinearGradient(0, S.U * 0.1, 0, base);
    g.addColorStop(0, rgba(P.line, R.dark ? 0.28 : 0.22)); g.addColorStop(1, rgba(P.line, 0));
    ctx.beginPath(); ctx.moveTo(drawn[0][0], base);
    drawn.forEach(function (q) { ctx.lineTo(q[0], q[1]); }); ctx.lineTo(last[0], base); ctx.closePath();
    ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); drawn.forEach(function (q, k) { if (k) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); });
    if (R.dark) { ctx.shadowColor = rgba(P.line, 0.9); ctx.shadowBlur = S.U * 0.025; }
    ctx.strokeStyle = rgba(P.line); ctx.lineWidth = Math.max(1.5, S.U * 0.007); ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();
    ctx.shadowBlur = 0;
    for (i = 0; i < drawn.length - (prog < 1 ? 1 : 0); i++) {
      var q = drawn[i], rr = S.U * 0.011;
      ctx.fillStyle = rgba(R.dark ? "#0A0A0C" : "#FFFFFF"); ctx.beginPath(); ctx.arc(q[0], q[1], rr, 0, TAU); ctx.fill();
      ctx.strokeStyle = rgba(P.line); ctx.lineWidth = Math.max(1, rr * 0.45); ctx.stroke();
    }
    glow(ctx, last[0], last[1], S.U * 0.07, P.line, R.dark ? 0.7 : 0.45);
    if (prog >= 1) { // up-tick arrow at the peak
      var a = pts[pts.length - 1], s = S.U * 0.03;
      ctx.fillStyle = rgba(P.line); ctx.beginPath(); ctx.moveTo(a[0], a[1] - s * 1.6); ctx.lineTo(a[0] - s * 0.7, a[1] - s * 0.6); ctx.lineTo(a[0] + s * 0.7, a[1] - s * 0.6); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  // Culture: Najdi mud-brick At-Turaif, triangular crenellations and windows, lanterns, palms.
  SCENES.culture = {
    build: function (w, h, rng, nz) {
      var U = Math.min(h, w * 1.0), gy = h * 0.88, cx = w * 0.5, sp = U * 0.05, S = { U: U, gy: gy, blocks: [] };
      var defs = [ // x (rel U), width, height, taper, depth-side, far
        [-0.62, 0.3, 0.3, 0.02, 1, 1], [0.5, 0.34, 0.34, 0.02, 1, 1],
        [-0.36, 0.3, 0.46, 0.03, 1, 0], [0.02, 0.4, 0.4, 0.02, 1, 0], [0.3, 0.12, 0.66, 0.2, 0, 0], [0.5, 0.26, 0.28, 0.02, 1, 0], [-0.62, 0.2, 0.22, 0.02, 1, 0]
      ];
      defs.forEach(function (d) {
        var bw = d[1] * U, bh = d[2] * U, x0 = cx + d[0] * U - bw / 2, x1 = x0 + bw, tp = bw * d[3], top = gy - bh;
        var front = [[x0, gy], [x0 + tp, top], [x1 - tp, top], [x1, gy]], dep = bw * 0.14, B = { far: d[5], tower: d[3] > 0.1 };
        if (d[4]) {
          B.side = mesh([[x1, gy], [x1 - tp, top], [x1 - tp + dep, top - dep * 0.35], [x1 + dep, gy - dep * 0.35]],
            { mat: "mudSide", sp: sp * 0.6, haze: d[5] ? 0.35 : 0, jit: 0.1, z: function (x, y) { return nz(x / sp, y / sp) * sp * 0.3; } }, rng);
        }
        var mo = { mat: "mud", sp: B.tower ? sp * 0.6 : sp, haze: d[5] ? 0.35 : 0, jit: 0.08, gain: 1,
          z: function (x, y) { return nz(x / (sp * 1.2), y / (sp * 1.2)) * sp * 0.45; } };
        B.front = B.tower ? prism(front, (x0 + x1) / 2 - bw * 0.1, mo, rng, nz, 0.6) : mesh(front, mo, rng);
        B.x0 = x0; B.x1 = x1; B.top = top; B.tp = tp; B.bw = bw; B.bh = bh; B.gy = gy;
        B.win = [];
        var rows = Math.max(1, Math.floor(bh / (U * 0.1)));
        for (var r = 0; r < rows; r++) {
          var wy = top + bh * (0.22 + r * 0.7 / rows), n = B.tower ? 1 : Math.max(1, Math.floor(bw / (U * 0.1)));
          for (var k = 0; k < n; k++) {
            if (rng() < 0.25) continue;
            B.win.push({ x: x0 + bw * (k + 0.5) / n, y: wy, kind: rng() < 0.6 ? "tri" : "slot", lit: rng() < 0.45, ph: rng() * 50 });
          }
        }
        if (!B.tower && !d[5] && rng() < 0.9) B.door = { x: x0 + bw * (0.3 + rng() * 0.4), w: U * 0.045, h: U * 0.08 };
        S.blocks.push(B);
      });
      S.blocks.sort(function (a, b) { return b.far - a.far; });
      S.palms = [[cx - U * 0.84, U * 0.36, -0.1], [cx + U * 0.78, U * 0.3, 0.12], [cx - U * 0.2, U * 0.22, 0.06]].map(function (p) {
        return { x: p[0], hgt: p[1], lean: p[2], ph: rng() * TAU };
      });
      S.ground = mesh([[-20, gy], [w + 20, gy], [w + 20, h + 20], [-20, h + 20]], { mat: "ground", sp: sp * 1.2, jit: 0.06,
        z: function (x, y) { return nz(x / (sp * 2), y / (sp * 2)) * sp * 0.4; } }, rng);
      S.stars = makeStars(rng, w, h, Math.round(w * h / 5000), h * 0.5);
      return S;
    },
    palette: function (dark, a) {
      return dark ? {
        sky: [[0, "#06040A"], [0.5, mix("#0E0812", a, 0.25)], [1, mix("#2A1810", a, 0.2)]],
        haze: mix("#1A1016", a, 0.25), lamp: "#FFB85C", star: "#FFF1E0",
        m: { mud: ["#0C0806", "#2E2016", "#9A6C44"], mudSide: ["#070504", "#1A120C", "#5A3E28"], ground: ["#0A0706", "#1C140F", "#4A3322"] },
        sh: "rgba(0,0,0,0.6)", hl: "rgba(255,190,120,0.12)", palm: "#0A0706", glowA: 0.3
      } : {
        sky: [[0, mix(a, "#EDE3D3", 0.62)], [0.5, mix(a, "#EFDCC8", 0.85)], [1, "#F1DEC2"]],
        haze: mix("#EAD7C4", a, 0.08), lamp: "#FFB347", star: "#FFFFFF",
        m: { mud: ["#8E6039", "#C99966", "#F0D2A4"], mudSide: ["#6E4526", "#9E7048", "#C99B6C"], ground: ["#B98E62", "#D8B78C", "#F1DCBB"] },
        sh: "rgba(70,40,15,0.45)", hl: "rgba(255,240,215,0.35)", palm: mix(a, "#2A2418", 0.7), glowA: 0.22
      };
    },
    draw: function (ctx, S, R) {
      var P = R.P, w = R.w, h = R.h, t = R.t, i;
      sky(ctx, w, h, P.sky);
      glow(ctx, w * 0.5, S.gy, w * 0.75, R.acc, P.glowA);
      if (R.dark) drawStars(ctx, S.stars, t, P.star, 0.9, 0);
      for (i = 0; i < S.blocks.length; i++) {
        var B = S.blocks[i];
        if (i === S.blocks.length - 3) palm(ctx, S.palms[2], S.gy, P, t, S.U, R);
        if (B.side) drawMesh(ctx, B.side, R);
        drawMesh(ctx, B.front, R);
        najdi(ctx, B, P, R, S.U);
      }
      drawMesh(ctx, S.ground, R);
      palm(ctx, S.palms[0], S.gy, P, t, S.U, R); palm(ctx, S.palms[1], S.gy, P, t, S.U, R);
    }
  };
  function najdi(ctx, B, P, R, U) {
    var x0 = B.x0 + B.tp, x1 = B.x1 - B.tp, top = B.top, cw = U * 0.022, i, x;
    var mud = R.P.lut(B.front.mat, B.front.haze), crest = mud[R.dark ? 22 : 28];
    // mud-layer bands
    ctx.save(); path(ctx, B.front.poly); ctx.clip();
    ctx.fillStyle = P.sh;
    for (var y = top + U * 0.06; y < B.gy; y += U * 0.07) ctx.fillRect(B.x0 - 2, y, B.bw + 4, Math.max(1, U * 0.004));
    ctx.fillStyle = P.hl; ctx.fillRect(B.x0, top, B.bw, U * 0.012);
    ctx.restore();
    // triangular crenellations (taller at corners)
    ctx.fillStyle = crest;
    var n = Math.max(2, Math.round((x1 - x0) / (cw * 1.7)));
    for (i = 0; i <= n; i++) {
      x = x0 + (x1 - x0) * i / n; var hh = (i === 0 || i === n) ? cw * 2 : cw * 1.2, ww = (i === 0 || i === n) ? cw * 0.7 : cw * 0.55;
      ctx.beginPath(); ctx.moveTo(x - ww, top + 1); ctx.lineTo(x, top - hh); ctx.lineTo(x + ww, top + 1); ctx.closePath(); ctx.fill();
    }
    // drain spouts
    ctx.fillStyle = R.dark ? "#050302" : "#5A3A20";
    for (i = 1; i < 3; i++) ctx.fillRect(x0 + (x1 - x0) * i / 3, top + U * 0.02, U * 0.018, U * 0.006);
    // windows
    for (i = 0; i < B.win.length; i++) {
      var wn = B.win[i], s = U * 0.018, lit = R.dark && wn.lit;
      var fl = lit ? 0.75 + 0.25 * Math.sin(R.t * 7 + wn.ph) * Math.sin(R.t * 3.1 + wn.ph * 2) : 0;
      if (lit) glow(ctx, wn.x, wn.y, s * 5, P.lamp, 0.35 * fl);
      ctx.fillStyle = lit ? rgba(P.lamp, 0.6 + 0.4 * fl) : (R.dark ? "#050302" : "rgba(60,32,14,0.78)");
      ctx.beginPath();
      if (wn.kind === "tri") {
        for (var k = -1; k <= 1; k++) { ctx.moveTo(wn.x + k * s * 1.3 - s * 0.45, wn.y); ctx.lineTo(wn.x + k * s * 1.3, wn.y - s * 0.8); ctx.lineTo(wn.x + k * s * 1.3 + s * 0.45, wn.y); ctx.closePath(); }
      } else ctx.rect(wn.x - s * 0.3, wn.y - s * 1.2, s * 0.6, s * 1.4);
      ctx.fill();
    }
    if (B.door) {
      var d = B.door, dx = d.x - d.w / 2, dy = B.gy - d.h;
      if (R.dark) glow(ctx, d.x, dy + d.h * 0.3, d.w * 2.6, P.lamp, 0.3 + 0.1 * Math.sin(R.t * 5 + d.x));
      ctx.fillStyle = R.dark ? "#1A0F08" : "#6B4424"; ctx.fillRect(dx, dy, d.w, d.h);
      ctx.fillStyle = R.dark ? "rgba(255,184,92,0.35)" : "rgba(255,230,190,0.5)";
      for (k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(dx + d.w * (0.2 + k * 0.3) - d.w * 0.1, dy + d.h * 0.25); ctx.lineTo(dx + d.w * (0.2 + k * 0.3), dy + d.h * 0.12); ctx.lineTo(dx + d.w * (0.2 + k * 0.3) + d.w * 0.1, dy + d.h * 0.25); ctx.fill(); }
      // hanging lantern beside the door
      var lx = dx - d.w * 0.5, ly = dy + d.h * 0.1, f2 = 0.7 + 0.3 * Math.sin(R.t * 6.3 + d.x) * Math.sin(R.t * 2.3);
      glow(ctx, lx, ly, d.w * (R.dark ? 2.2 : 1.2), P.lamp, (R.dark ? 0.6 : 0.35) * f2);
      ctx.fillStyle = rgba(P.lamp, 0.8 + 0.2 * f2); ctx.beginPath(); ctx.moveTo(lx, ly - d.w * 0.28); ctx.lineTo(lx + d.w * 0.14, ly); ctx.lineTo(lx, ly + d.w * 0.2); ctx.lineTo(lx - d.w * 0.14, ly); ctx.fill();
    }
  }
  function palm(ctx, p, gy, P, t, U, R) {
    var sway = R.still ? 0 : Math.sin(t * 0.8 + p.ph) * 0.02, tx = p.x + p.hgt * (p.lean + sway), ty = gy - p.hgt;
    ctx.strokeStyle = rgba(P.palm); ctx.lineCap = "round";
    ctx.lineWidth = U * 0.012;
    ctx.beginPath(); ctx.moveTo(p.x, gy); ctx.quadraticCurveTo(p.x + p.hgt * p.lean * 0.2, gy - p.hgt * 0.5, tx, ty); ctx.stroke();
    ctx.fillStyle = rgba(P.palm);
    for (var i = 0; i < 15; i++) { // arching fronds with fine serrated leaflets
      var side = i < 7 ? -1 : i > 7 ? 1 : 0, spread = (i - 7) / 7, L = p.hgt * (0.42 + ((i * 7) % 3) * 0.04);
      var dx = spread * L * 0.95 + side * L * 0.05, lift = L * (0.35 - Math.abs(spread) * 0.45), n = 22, top = [], bot = [];
      for (var k = 0; k <= n; k++) {
        var u = k / n, px = tx + dx * u, py = ty - lift * Math.sin(u * Math.PI * 0.6) * 1.2 + u * u * L * 0.55 * Math.abs(spread) + u * u * L * 0.15;
        var tx2 = dx, ty2 = -lift * 1.2 * Math.PI * 0.6 * Math.cos(u * Math.PI * 0.6) + 2 * u * L * (0.55 * Math.abs(spread) + 0.15), tl = Math.hypot(tx2, ty2) || 1;
        var nx = -ty2 / tl, ny = tx2 / tl, wv = L * 0.075 * Math.sin(Math.PI * Math.min(1, u * 1.05)) * (k % 2 ? 1 : 0.25);
        top.push([px + nx * wv, py + ny * wv]); bot.push([px - nx * wv, py - ny * wv]);
      }
      path(ctx, top.concat(bot.reverse())); ctx.fill();
    }
    ctx.beginPath(); ctx.arc(tx, ty + p.hgt * 0.03, p.hgt * 0.035, 0, TAU); ctx.fill();
  }

  // Energy: big sun, faceted dunes, solar array rows with travelling glints, turning wind turbines.
  SCENES.energy = {
    build: function (w, h, rng, nz) {
      var U = Math.min(h, w * 0.85), sp = U * 0.05, S = { U: U };
      S.sun = { x: w * 0.64, y: h * 0.5, r: U * 0.22 };
      S.back = dune(w, h, h * 0.62, U * 0.13, 3.2 / w, 0.9, { mat: "sandFar", sp: sp * 0.7, haze: 0.25 }, rng, nz);
      S.turbines = [[0.16, 0.34, 0.9], [0.3, 0.26, 1.2], [0.86, 0.3, 0.75]].map(function (d, i) {
        var x = w * d[0]; return { x: x, y: S.back.crest(x) + U * 0.01, hgt: U * d[1], sp: d[2], ph: i * 1.7 };
      });
      S.mid = dune(w, h, h * 0.7, U * 0.05, 1.6 / w, 2.2, { mat: "sand", sp: sp * 0.9, haze: 0.1 }, rng, nz);
      S.rows = [];
      for (var r = 0; r < 5; r++) {
        var y = h * (0.7 + r * 0.045 + r * r * 0.004), rh = U * (0.018 + r * 0.007), spread = 0.28 + r * 0.06;
        S.rows.push({ y: y, rh: rh, x0: w * (0.5 - spread) , x1: w * (0.5 + spread) + U * 0.1, sk: rh * 0.9, cells: 10 + r * 4 });
      }
      S.front = dune(w, h, h * 1.04, U * 0.14, 2.6 / w, 5.6, { mat: "sand", sp: sp }, rng, nz);
      return S;
    },
    palette: function (dark, a) {
      return dark ? {
        sky: [[0, "#04070A"], [0.45, mix("#0A1419", a, 0.2)], [0.8, "#2A1E1A"], [1, "#4A2C1C"]],
        haze: "#2A1E1C", sun: "#F59A4C", sunCore: "#FFD7A0",
        m: { sandFar: ["#0A0B0D", "#1E1916", "#6A4A34"], sand: ["#08090B", "#1A1714", "#7A5438"], panel: ["#03080A", mix(a, "#07141A", 0.6), mix(a, "#7FD6E0", 0.45)] },
        tower: "#0E1215", blade: "#1A2025", glint: "#FFE2B8", beacon: "#FF4A3A", frame: "rgba(0,0,0,0.5)"
      } : {
        sky: [[0, "#E4E8E2"], [0.5, "#EFE7D4"], [1, "#F3DDB5"]],
        haze: "#EEDFC4", sun: "#FFD58A", sunCore: "#FFF8E6",
        m: { sandFar: ["#D0AE82", "#E6CDA6", "#F7EAD4"], sand: ["#C39A6A", "#E1C193", "#F8E8CC"], panel: [mix(a, "#0A1A20", 0.65), mix(a, "#2A4A58", 0.4), mix(a, "#D8F0F2", 0.55)] },
        tower: "#F4F2EC", blade: "#FFFFFF", glint: "#FFFFFF", beacon: "#E0463A", frame: "rgba(20,40,50,0.35)"
      };
    },
    draw: function (ctx, S, R) {
      var P = R.P, w = R.w, h = R.h, t = R.t, i, s = S.sun;
      sky(ctx, w, h, P.sky);
      glow(ctx, s.x, s.y, s.r * 4.5, P.sun, R.dark ? 0.45 : 0.55);
      for (i = 3; i >= 1; i--) { ctx.fillStyle = rgba(P.sun, 0.08 + (R.still ? 0 : 0.03 * Math.sin(t * 1.2 + i))); ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (1 + i * 0.22), 0, TAU); ctx.fill(); }
      var sg = ctx.createRadialGradient(s.x - s.r * 0.3, s.y - s.r * 0.3, s.r * 0.1, s.x, s.y, s.r);
      sg.addColorStop(0, rgba(P.sunCore)); sg.addColorStop(1, rgba(P.sun));
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
      drawMesh(ctx, S.back, R);
      for (i = 0; i < S.turbines.length; i++) turbine(ctx, S.turbines[i], P, R, S.U);
      drawMesh(ctx, S.mid, R);
      for (i = 0; i < S.rows.length; i++) panelRow(ctx, S.rows[i], P, R, i);
      drawMesh(ctx, S.front, R);
    }
  };
  function turbine(ctx, tb, P, R, U) {
    var x = tb.x, y = tb.y, H = tb.hgt, hx = x, hy = y - H, a = R.still ? tb.ph : R.t * tb.sp + tb.ph, L = H * 0.62;
    ctx.fillStyle = rgba(P.tower);
    ctx.beginPath(); ctx.moveTo(x - H * 0.03, y); ctx.lineTo(x - H * 0.012, hy); ctx.lineTo(x + H * 0.012, hy); ctx.lineTo(x + H * 0.03, y); ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, hy); ctx.lineTo(x + H * 0.012, hy); ctx.lineTo(x + H * 0.03, y); ctx.fill();
    ctx.fillStyle = rgba(P.tower); ctx.fillRect(hx - H * 0.02, hy - H * 0.025, H * 0.07, H * 0.045);
    for (var b = 0; b < 3; b++) {
      var ang = a + b * TAU / 3, c = Math.cos(ang), s = Math.sin(ang);
      ctx.fillStyle = rgba(P.blade);
      ctx.beginPath();
      ctx.moveTo(hx - s * H * 0.02, hy + c * H * 0.02);
      ctx.lineTo(hx + c * L, hy + s * L);
      ctx.lineTo(hx + c * L * 0.25 + s * H * 0.035, hy + s * L * 0.25 - c * H * 0.035);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.1)"; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + c * L, hy + s * L); ctx.lineTo(hx - s * H * 0.02, hy + c * H * 0.02); ctx.fill();
    }
    ctx.fillStyle = rgba(P.tower); ctx.beginPath(); ctx.arc(hx, hy, H * 0.028, 0, TAU); ctx.fill();
    if (R.dark && !R.still && Math.sin(R.t * 3 + tb.ph) > 0.4) glow(ctx, hx, hy - H * 0.03, U * 0.02, P.beacon, 0.9);
  }
  function panelRow(ctx, r, P, R, idx) {
    var lut = P.lut("panel", 0), top = r.y - r.rh, p = [[r.x0, r.y], [r.x0 + r.sk, top], [r.x1 + r.sk, top], [r.x1, r.y]];
    var g = ctx.createLinearGradient(0, top, 0, r.y);
    g.addColorStop(0, lut[Math.round(N * 0.78)]); g.addColorStop(1, lut[Math.round(N * 0.25)]);
    ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(r.x0, r.y, r.x1 - r.x0, r.rh * 0.35);
    ctx.fillStyle = P.frame; // support legs
    for (var l = 0; l <= r.cells; l += 2) ctx.fillRect(r.x0 + (r.x1 - r.x0) * l / r.cells + r.sk * 0.3, r.y - r.rh * 0.1, Math.max(1, r.rh * 0.08), r.rh * 0.45);
    ctx.fillStyle = g; path(ctx, p); ctx.fill();
    ctx.save(); path(ctx, p); ctx.clip();
    ctx.strokeStyle = P.frame; ctx.lineWidth = 0.8;
    for (var c = 1; c < r.cells; c++) { var x = r.x0 + (r.x1 - r.x0) * c / r.cells; ctx.beginPath(); ctx.moveTo(x, r.y); ctx.lineTo(x + r.sk, top); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(r.x0 + r.sk / 2, r.y - r.rh / 2); ctx.lineTo(r.x1 + r.sk / 2, r.y - r.rh / 2); ctx.stroke();
    // travelling glint
    var span = r.x1 - r.x0, gx = R.still ? r.x0 + span * (0.3 + idx * 0.1) : r.x0 - span * 0.3 + ((R.t * 0.12 + idx * 0.13) % 1) * span * 1.6, gw = span * 0.12;
    var lg = ctx.createLinearGradient(gx - gw, 0, gx + gw, 0);
    lg.addColorStop(0, rgba(P.glint, 0)); lg.addColorStop(0.5, rgba(P.glint, R.dark ? 0.55 : 0.8)); lg.addColorStop(1, rgba(P.glint, 0));
    ctx.fillStyle = lg; ctx.fillRect(gx - gw, top, gw * 2, r.rh);
    ctx.restore();
    if (gx > r.x0 && gx < r.x1) {
      var sx = gx + r.sk / 2, sy = r.y - r.rh * 0.6, sz = r.rh * 1.3;
      ctx.fillStyle = rgba(P.glint, 0.85);
      ctx.beginPath(); ctx.moveTo(sx - sz, sy); ctx.lineTo(sx, sy - sz * 0.12); ctx.lineTo(sx + sz, sy); ctx.lineTo(sx, sy + sz * 0.12); ctx.fill();
      ctx.beginPath(); ctx.moveTo(sx, sy - sz * 0.7); ctx.lineTo(sx + sz * 0.1, sy); ctx.lineTo(sx, sy + sz * 0.7); ctx.lineTo(sx - sz * 0.1, sy); ctx.fill();
    }
  }

  // Backdrop: quiet faceted dune field with slow parallax + drifting sand motes. Transparent sky.
  SCENES.backdrop = {
    build: function (w, h, rng, nz) {
      var U = Math.min(h, w * 0.7), sp = Math.max(28, U * 0.06), S = { layers: [], motes: [] };
      S.layers.push(dune(w, h, h * 0.62, U * 0.09, 1.9 / w, 0.4, { mat: "far", sp: sp * 1.4, haze: 0.2 }, rng, nz));
      S.layers.push(dune(w, h, h * 0.76, U * 0.1, 2.6 / w, 2.1, { mat: "mid", sp: sp * 1.2 }, rng, nz));
      S.layers.push(dune(w, h, h * 0.92, U * 0.09, 3.3 / w, 4.4, { mat: "near", sp: sp }, rng, nz));
      for (var i = 0; i < 60; i++) S.motes.push({ x: rng() * w, y: rng() * h, r: 0.6 + rng() * 1.3, v: 6 + rng() * 16, a: 0.2 + rng() * 0.45, ph: rng() * TAU });
      return S;
    },
    palette: function (dark) {
      return dark ? {
        haze: "#171B21", mote: "#E9C46A",
        m: { far: ["#101318", "#1E2229", "#34343A"], mid: ["#0C0F13", "#20242A", "#433D35"], near: ["#090B0E", "#22252A", "#51473A"] }
      } : {
        haze: "#EDE3D3", mote: "#B7862B",
        m: { far: ["#CFB994", "#E2D1B6", "#F8F0E3"], mid: ["#C0A37A", "#DCC6A3", "#FBF3E6"], near: ["#B39465", "#D6BB91", "#FDF6EA"] }
      };
    },
    draw: function (ctx, S, R) {
      var w = R.w, h = R.h, t = R.t, P = R.P;
      for (var i = 0; i < S.layers.length; i++) {
        ctx.save(); ctx.translate((R.still ? 0 : Math.sin(t * (0.05 + i * 0.03) + i) * (6 + i * 5)) + R.dx * (0.4 + i * 0.5), 0);
        drawMesh(ctx, S.layers[i], R);
        ctx.restore();
      }
      for (i = 0; i < S.motes.length; i++) {
        var m = S.motes[i], x = (m.x + t * m.v) % (w + 20) - 10, y = (m.y - t * m.v * 0.18 + Math.sin(t * 0.7 + m.ph) * 6 + h * 4) % h;
        ctx.fillStyle = rgba(P.mote, m.a * (0.6 + 0.4 * Math.sin(t * 1.3 + m.ph)));
        ctx.beginPath(); ctx.arc(x, y, m.r, 0, TAU); ctx.fill();
      }
    }
  };

  /* ---------- runtime ---------- */
  var cache = {}, cacheN = 0;
  function geometry(id, w, h) {
    var key = id + "|" + Math.round(w) + "|" + Math.round(h);
    if (cache[key]) return cache[key];
    if (++cacheN > 24) { cache = {}; cacheN = 1; } // ponytail: flush-all cache, LRU if resize churn ever matters
    var seed = SEED[id];
    return (cache[key] = SCENES[id].build(w, h, mulberry32(seed), makeNoise(seed)));
  }
  var pals = {};
  function pal(id, theme) {
    var dark = theme === "dark", acc = id === "backdrop" ? null : accentFor(id, theme), key = id + theme + acc;
    return pals[key] || (pals[key] = palette(SCENES[id].palette(dark, acc)));
  }

  function render(ctx, id, theme, w, h, t, still, dawn, prog, dx) {
    var R = { w: w, h: h, t: t, still: still, dark: theme === "dark", acc: accentFor(id, theme), P: pal(id, theme), L: light(t, prog), dawn: dawn == null ? 1 : dawn, dx: dx || 0 };
    var S = geometry(id, w, h);
    ctx.save();
    SCENES[id].draw(ctx, S, R);
    if (id !== "backdrop") vignette(ctx, w, h, R.dark ? 0.35 : 0.12);
    ctx.restore();
  }

  function reducedMotion() {
    try { return !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) { return false; }
  }

  function run(canvas, id, theme, animate) {
    var ctx = canvas.getContext("2d"), raf = 0, last = 0, start = 0, w = 0, h = 0, alive = true;
    var still = !animate || reducedMotion(), STILL_T = 6.5;
    var prog = null, progTo = null, dx = 0, lastF = 0; // backdrop only: sun position (dawn 0 -> dusk 1) and a brief parallax dolly
    function fit() {
      var dpr = Math.min(2, root.devicePixelRatio || 1);
      w = canvas.clientWidth || canvas.width; h = canvas.clientHeight || canvas.height;
      if (!w || !h) return false;
      var bw = Math.round(w * dpr), bh = Math.round(h * dpr);
      if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    }
    function frame(now) {
      if (!alive || !fit()) return;
      var t = still ? STILL_T : (now - start) / 1000, dt = lastF ? Math.min(0.1, (now - lastF) / 1000) : 0;
      lastF = now;
      if (progTo != null) prog = prog == null || still ? progTo : prog + (progTo - prog) * Math.min(1, dt * 1.6);
      dx *= Math.pow(0.04, dt);
      ctx.clearRect(0, 0, w, h);
      render(ctx, id, theme, w, h, still ? STILL_T : t + (id === "backdrop" ? 0 : 1), still, still || id === "backdrop" ? 1 : ease(t / 1.6), prog, still ? 0 : dx);
    }
    function loop(now) {
      raf = 0;
      if (!alive || document.hidden) return;
      raf = root.requestAnimationFrame(loop);
      if (now - last < 1000 / FPS - 2) return;
      last = now; frame(now);
    }
    function play() { if (!still && alive && !raf && !document.hidden) raf = root.requestAnimationFrame(loop); }
    function onVis() { if (document.hidden) { if (raf) root.cancelAnimationFrame(raf); raf = 0; } else play(); }
    var ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(function () { frame(performance.now()); }) : null;
    if (ro) ro.observe(canvas);
    document.addEventListener("visibilitychange", onVis);
    start = performance.now();
    frame(start); play();
    return {
      stop: function () {
        alive = false;
        if (raf) root.cancelAnimationFrame(raf); raf = 0;
        if (ro) ro.disconnect();
        document.removeEventListener("visibilitychange", onVis);
      },
      setTheme: function (th) { theme = th; frame(performance.now()); },
      setProgress: function (p) { progTo = clamp(+p || 0, 0, 1); if (still) frame(performance.now()); },
      travel: function (direction) { if (!still) dx += (direction < 0 ? 1 : -1) * (document.documentElement.dir === "rtl" ? -1 : 1) * 60; }
    };
  }

  var api = {
    backdrop: function (canvas, o) { return run(canvas, "backdrop", (o && o.theme) || "light", true); },
    sector: function (canvas, sectorId, o) {
      o = o || {};
      if (!SCENES[sectorId] || sectorId === "backdrop") throw new Error("Unknown sector scene: " + sectorId);
      return run(canvas, sectorId, o.theme || "light", o.animate !== false);
    },
    drawStatic: function (ctx, sectorId, o, rect) {
      if (typeof o === "string") { rect = rect || {}; rect.theme = o; o = rect; } // tolerate (ctx, id, theme, rect)
      o = o || {};
      var x = o.x || 0, y = o.y || 0, w = o.width || ctx.canvas.width, h = o.height || ctx.canvas.height;
      ctx.save();
      ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x, y);
      render(ctx, SCENES[sectorId] ? sectorId : "tourism", o.theme || "light", w, h, 6.5, true, 1);
      ctx.restore();
    },
    _delaunay: delaunay, _mulberry32: mulberry32
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.MassariScenes = api;
})(typeof window !== "undefined" ? window : null);
