// Massari PNG result card: a 1080x1350 poster drawn entirely with canvas code (no image files).
(function (root) {
  var W = 1080, H = 1350, M = 64;
  // ponytail: copy of assets/logo/logo-paths.json, used only if js/icons.js did not load.
  var LOGO = [
    { d: "M32 4 L40.2 12.2 H51.8 V23.8 L60 32 L51.8 40.2 V51.8 H40.2 L32 60 L23.8 51.8 H12.2 V40.2 L4 32 L12.2 23.8 V12.2 H23.8 Z", role: "stroke", strokeWidth: 4.5 },
    { d: "M23 44 C23 34 30 29.5 38 26", role: "stroke", strokeWidth: 6 },
    { d: "M31 26 A7 7 0 1 0 45 26 A7 7 0 1 0 31 26 Z", role: "accent" }
  ];
  // Tokens from the Sculpted Sand design (css/tokens.css).
  var THEMES = {
    light: { bg: "#E9DFCD", hi: "#FFF8EB", lo: "rgba(151,124,82,.42)", ink: "#2A241C", ink2: "#5B4F3F", ink3: "#8C7B63", gold: "#A97C27", goldInk: "#7A5815", line: "rgba(76,58,30,.14)" },
    dark: { bg: "#1C2027", hi: "rgba(62,70,84,.55)", lo: "rgba(5,6,9,.78)", ink: "#F2E9DA", ink2: "#B7AC99", ink3: "#6D6759", gold: "#D8B25E", goldInk: "#D8B25E", line: "rgba(242,233,218,.08)" }
  };
  var DISPLAY = '"Readex", "Plex Arabic", system-ui, sans-serif';
  var TEXT = '"Plex Arabic", system-ui, sans-serif';

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else { ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  }
  function shadow(ctx, color, blur, dx, dy) { ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.shadowOffsetX = dx; ctx.shadowOffsetY = dy; }
  function noShadow(ctx) { shadow(ctx, "transparent", 0, 0, 0); }

  // Raised panel: light lip top-left, shade bottom-right (same as --raise).
  function raised(ctx, T, x, y, w, h, r, d) {
    d = d || 1;
    ctx.save();
    rr(ctx, x, y, w, h, r); ctx.fillStyle = T.bg;
    shadow(ctx, T.hi, 22 * d, -10 * d, -10 * d); ctx.fill();
    shadow(ctx, T.lo, 28 * d, 12 * d, 14 * d); ctx.fill();
    noShadow(ctx);
    var g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, "rgba(255,251,242,.10)"); g.addColorStop(0.55, "rgba(255,251,242,0)"); g.addColorStop(1, "rgba(0,0,0,.04)");
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = T.line; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  }
  // Pressed well: inner shadows drawn by shading a ring outside the clipped shape (same as --press).
  function pressed(ctx, T, x, y, w, h, r, d, keepFill) {
    d = d || 1;
    ctx.save();
    rr(ctx, x, y, w, h, r); ctx.fillStyle = T.bg; if (!keepFill) ctx.fill(); ctx.clip();
    [[T.lo, 14 * d, 6 * d, 7 * d], [T.hi, 13 * d, -6 * d, -6 * d]].forEach(function (s) {
      ctx.beginPath(); ctx.rect(x - 200, y - 200, w + 400, h + 400);
      if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
      shadow(ctx, s[0], s[1], s[2], s[3]); ctx.fillStyle = T.bg; ctx.fill("evenodd");
    });
    ctx.restore();
    ctx.save(); rr(ctx, x, y, w, h, r); ctx.strokeStyle = T.line; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  }

  function drawLogo(ctx, T, accent, x, y, size) {
    var paths = (root.MassariIcons && root.MassariIcons.logoPaths) || LOGO;
    ctx.save(); ctx.translate(x, y); ctx.scale(size / 64, size / 64);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    paths.forEach(function (p) {
      var path = new Path2D(p.d);
      if (p.role === "accent") { ctx.fillStyle = accent; ctx.fill(path); }
      else if (p.role === "fill") { ctx.fillStyle = T.ink; ctx.fill(path); }
      else { ctx.strokeStyle = T.ink; ctx.lineWidth = p.strokeWidth || 4; ctx.stroke(path); }
    });
    ctx.restore();
  }

  // Split on spaces only (never inside a word, so Arabic letters stay joined).
  function wrap(ctx, text, maxW) {
    var lines = [], line = "";
    String(text).split(/\s+/).forEach(function (w) {
      var test = line ? line + " " + w : w;
      if (line && ctx.measureText(test).width > maxW) { lines.push(line); line = w; } else line = test;
    });
    if (line) lines.push(line);
    return lines;
  }

  function loadFonts() {
    if (typeof document === "undefined" || !document.fonts) return Promise.resolve();
    var sample = "مساري Massari 0123";
    return Promise.all([
      document.fonts.load('700 40px "Readex"', sample),
      document.fonts.load('400 40px "Plex Arabic"', sample),
      document.fonts.load('600 40px "Plex Arabic"', sample)
    ]).catch(function () {}).then(function () { return document.fonts.ready; });
  }

  function render(canvas, result, o) {
    var lang = o.lang === "ar" ? "ar" : "en", rtl = lang === "ar";
    var theme = o.theme === "dark" ? "dark" : "light", T = THEMES[theme];
    var t = o.t, sectors = o.sectors || root.MASSARI_SECTORS || [];
    var byId = function (id) { return sectors.find(function (s) { return s.id === id; }); };
    var s = byId(result.winner);
    if (!s) throw new Error("Unknown sector: " + result.winner);
    var accent = theme === "dark" ? (s.colorDark || s.color) : s.color;
    var nf = new Intl.NumberFormat(rtl ? "ar-SA" : "en");
    // Layout is written left-to-right; mx/mr mirror it for Arabic.
    var mx = function (x) { return rtl ? W - x : x; };
    var mr = function (x, w) { return rtl ? W - x - w : x; };

    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext("2d");
    ctx.direction = rtl ? "rtl" : "ltr";
    ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";

    // Background with a soft top-left light.
    ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);
    var glow = ctx.createRadialGradient(mx(200), 120, 0, mx(200), 120, 900);
    glow.addColorStop(0, theme === "dark" ? "rgba(216,178,94,.07)" : "rgba(255,248,235,.55)"); glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

    // Header: logo badge + wordmark, example badge on the far side.
    raised(ctx, T, mr(M, 84), 48, 84, 84, 26, 0.5);
    drawLogo(ctx, T, T.gold, mr(M + 14, 56), 62, 56);
    ctx.fillStyle = T.ink; ctx.font = "700 40px " + DISPLAY;
    var wm = rtl ? "مساري" : "Massari", wm2 = rtl ? "Massari" : "مساري";
    ctx.fillText(wm, mx(M + 108), 104);
    var wmW = ctx.measureText(wm).width;
    ctx.fillStyle = T.gold; ctx.fillRect(mr(M + 108 + wmW + 18, 2), 70, 2, 42);
    ctx.fillStyle = T.ink2; ctx.font = "400 30px " + TEXT;
    ctx.fillText(wm2, mx(M + 108 + wmW + 38), 102);
    if (result.isExample) {
      ctx.font = "600 24px " + TEXT;
      var bl = t("resExampleBadge"), bw = ctx.measureText(bl).width + 48;
      pressed(ctx, T, mr(W - M - bw, bw), 64, bw, 52, 26, 0.5);
      ctx.fillStyle = T.goldInk; ctx.fillText(bl, mx(W - M - bw + 24), 99);
    }

    // Scene: raised frame holding a pressed window with the faceted sector scene.
    var fy = 168, fh = 440;
    raised(ctx, T, M, fy, W - 2 * M, fh, 40);
    var sx = M + 18, sy = fy + 18, sw = W - 2 * M - 36, sh = fh - 36;
    ctx.save(); rr(ctx, sx, sy, sw, sh, 28); ctx.clip();
    if (root.MassariScenes) root.MassariScenes.drawStatic(ctx, s.id, { theme: theme, x: sx, y: sy, width: sw, height: sh });
    else { ctx.fillStyle = accent; ctx.fillRect(sx, sy, sw, sh); }
    var fade = ctx.createLinearGradient(0, sy, 0, sy + sh);
    fade.addColorStop(0, "rgba(0,0,0,0)"); fade.addColorStop(1, "rgba(0,0,0,.12)");
    ctx.fillStyle = fade; ctx.fillRect(sx, sy, sw, sh);
    ctx.restore();
    pressed(ctx, T, sx, sy, sw, sh, 28, 0.6, true); // inner shade over the scene

    // Title block.
    var y = fy + fh + 70;
    ctx.fillStyle = T.goldInk; ctx.font = "600 26px " + TEXT;
    ctx.fillText(t("cardHeading"), mx(M), y);
    y += 78;
    // Match pill (pressed) on the far side of the name.
    var matchText = t("cardMatch", { percent: nf.format(result.percents[s.id]) });
    ctx.save(); ctx.font = "700 40px " + DISPLAY;
    var pw = ctx.measureText(matchText).width + 80, ph = 104, px = W - M - pw, py = y - 72;
    pressed(ctx, T, mr(px, pw), py, pw, ph, 52);
    ctx.textAlign = "center"; ctx.fillStyle = accent;
    ctx.fillText(matchText, mx(px + pw / 2), py + 66);
    ctx.restore();

    ctx.fillStyle = T.ink; ctx.font = "700 " + (rtl ? 66 : 62) + "px " + DISPLAY;
    var nameLines = wrap(ctx, s.name[lang], W - 2 * M - pw - 40);
    if (nameLines.length > 1) { ctx.font = "700 48px " + DISPLAY; nameLines = wrap(ctx, s.name[lang], W - 2 * M - pw - 40); }
    nameLines.slice(0, 2).forEach(function (l, i) { ctx.fillText(l, mx(M), y + i * 58); });
    var nameBottom = y + (Math.min(nameLines.length, 2) - 1) * 58;

    y = nameBottom + 50;
    if (result.runnerUp && byId(result.runnerUp)) {
      ctx.fillStyle = T.ink2; ctx.font = "400 26px " + TEXT;
      ctx.fillText(t("cardRunnerUp", { sector: byId(result.runnerUp).name[lang], percent: nf.format(result.percents[result.runnerUp]) }), mx(M), y);
    }

    // Two raised panels: trait bars and example roles.
    var py2 = y + 36, pH = 1350 - 150 - py2, colW = (W - 2 * M - 32) / 2;
    raised(ctx, T, mr(M, colW), py2, colW, pH, 26, 0.6);
    raised(ctx, T, mr(M + colW + 32, colW), py2, colW, pH, 26, 0.6);

    var traits = [["people", "traitPeople"], ["ideas", "traitIdeas"], ["data", "traitData"], ["hands", "traitHands"]];
    var tx = M + 32, tw = colW - 64, rowH = (pH - 48) / 4;
    traits.forEach(function (tr, i) {
      var ry = py2 + 30 + i * rowH, v = (result.traitPercents && result.traitPercents[tr[0]]) || 0;
      ctx.fillStyle = T.ink; ctx.font = "600 24px " + TEXT;
      ctx.fillText(t(tr[1]), mx(tx), ry + 26);
      ctx.save(); ctx.textAlign = "end"; ctx.fillStyle = T.ink2; ctx.font = "400 22px " + TEXT;
      ctx.fillText(nf.format(v) + (rtl ? "٪" : "%"), mx(tx + tw), ry + 26); ctx.restore();
      pressed(ctx, T, mr(tx, tw), ry + 40, tw, 16, 8, 0.3);
      var fw = Math.max(16, tw * v / 100);
      if (!v) return;
      ctx.save(); rr(ctx, mr(tx, fw), ry + 40, fw, 16, 8); ctx.fillStyle = accent; ctx.fill(); ctx.restore();
    });

    var rx = M + colW + 32 + 32, rw = colW - 64, ry2 = py2 + 56;
    ctx.fillStyle = T.goldInk; ctx.font = "600 24px " + TEXT;
    ctx.fillText(t("cardRoles"), mx(rx), ry2);
    ry2 += 20;
    ctx.font = "400 25px " + TEXT;
    (s.roles || []).slice(0, 3).forEach(function (r) {
      var lines = wrap(ctx, r[lang], rw - 34).slice(0, 2);
      ry2 += 40;
      ctx.save(); ctx.fillStyle = accent; ctx.translate(mx(rx + 7), ry2 - 9); ctx.rotate(Math.PI / 4); ctx.fillRect(-5, -5, 10, 10); ctx.restore();
      ctx.fillStyle = T.ink;
      lines.forEach(function (l, i) { ctx.fillText(l, mx(rx + 30), ry2 + i * 34); });
      ry2 += (lines.length - 1) * 34 + 8;
    });

    // Footer: gold hairline, disclaimer, site line.
    ctx.fillStyle = T.gold; ctx.globalAlpha = 0.5; ctx.fillRect(M, H - 118, W - 2 * M, 1.5); ctx.globalAlpha = 1;
    ctx.fillStyle = T.ink2; ctx.font = "400 22px " + TEXT;
    ctx.fillText(t("cardDisclaimer"), mx(M), H - 74);
    ctx.save(); ctx.textAlign = "end"; ctx.fillStyle = T.goldInk; ctx.font = "700 22px " + DISPLAY;
    ctx.fillText("مساري | Massari", mx(W - M), H - 74); ctx.restore();
    return canvas;
  }

  function download(result, o) {
    o = o || {};
    return loadFonts().then(function () {
      var canvas = render(document.createElement("canvas"), result, o);
      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (!blob) return reject(new Error("Card image could not be created"));
          var url = URL.createObjectURL(blob), a = document.createElement("a");
          a.href = url; a.download = "massari-" + result.winner + "-" + (o.lang === "ar" ? "ar" : "en") + ".png";
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
          resolve();
        }, "image/png");
      });
    }).catch(function (e) { throw e instanceof Error ? e : new Error(String(e)); });
  }

  var api = { download: download, render: render };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.MassariCard = api;
})(typeof window !== "undefined" ? window : null);
