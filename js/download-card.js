(function () {
  const exportPalettes = {
    light: { background: "#f5f1e8", card: "#ffffff", text: "#26332f", muted: "#56645e", divider: "#d5dfd7", shadow: "rgba(0, 75, 50, .16)", teal: "#00a6a6", gold: "#d7a84b" },
    dark: { background: "#132923", card: "#203c33", text: "#f8f4e9", muted: "#c1d0c8", divider: "#456457", shadow: "rgba(0, 0, 0, .36)", teal: "#32c5c2", gold: "#e5bc68" }
  };

  function drawConnection(context, palette) {
    context.save();
    context.globalAlpha = .26; context.lineWidth = 3;
    context.strokeStyle = palette.teal; context.beginPath(); context.moveTo(1120, 55); context.bezierCurveTo(1310, 115, 1250, 225, 1450, 185); context.stroke();
    context.strokeStyle = palette.gold; context.beginPath(); context.moveTo(70, 820); context.bezierCurveTo(230, 685, 300, 920, 520, 830); context.stroke();
    [[1250, 166, palette.teal], [390, 850, palette.gold]].forEach(([x, y, color]) => { context.strokeStyle = color; context.fillStyle = palette.card; context.globalAlpha = .65; context.beginPath(); context.arc(x, y, 18, 0, Math.PI * 2); context.stroke(); context.globalAlpha = 1; context.beginPath(); context.arc(x, y, 7, 0, Math.PI * 2); context.fill(); });
    context.restore();
  }
  function fillTemplate(template, values) { return template.replace(/\{(\w+)\}/g, (_, key) => values[key] == null ? "" : values[key]); }
  function drawWrappedText(context, text, x, y, maxWidth, lineHeight, align) {
    const words = String(text).split(/\s+/); const lines = []; let line = "";
    words.forEach((word) => { const test = line ? `${line} ${word}` : word; if (context.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else line = test; });
    if (line) lines.push(line);
    context.textAlign = align;
    lines.forEach((item, index) => context.fillText(item, x, y + index * lineHeight));
    return lines.length * lineHeight;
  }

  function downloadResultCard(result, options) {
    const { winner, topScore } = result;
    const language = options && options.language === "ar" ? "ar" : "en";
    const ui = options.copy.ui;
    const sector = options.sector || winner;
    const rtl = language === "ar";
    const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const palette = exportPalettes[theme];
    const canvas = document.createElement("canvas");
    canvas.width = 1500; canvas.height = 960;
    const context = canvas.getContext("2d");
    const start = rtl ? 1330 : 170;
    const contentWidth = 1040;
    const align = rtl ? "right" : "left";
    const railX = rtl ? 1378 : 100;
    context.direction = rtl ? "rtl" : "ltr";
    context.fillStyle = palette.background; context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = winner.color; context.globalAlpha = .12; context.beginPath(); context.arc(1300, 40, 360, 0, Math.PI * 2); context.fill(); context.beginPath(); context.arc(120, 860, 250, 0, Math.PI * 2); context.fill(); context.globalAlpha = 1;
    drawConnection(context, palette);
    context.fillStyle = palette.card; context.shadowColor = palette.shadow; context.shadowBlur = 42; context.shadowOffsetY = 18; context.beginPath(); context.roundRect(100, 90, 1300, 780, 36); context.fill(); context.shadowColor = "transparent";
    context.fillStyle = winner.color; context.fillRect(railX, 90, 22, 780);
    context.textAlign = align;
    context.fillStyle = palette.muted; context.font = "700 28px system-ui, Tahoma, Arial, sans-serif"; context.fillText(ui.cardBrand, start, 170);
    context.fillStyle = palette.text; context.font = "700 55px system-ui, Tahoma, Arial, sans-serif"; context.fillText(ui.cardMatch, start, 250);
    context.fillStyle = winner.color; context.font = "800 76px system-ui, Tahoma, Arial, sans-serif"; drawWrappedText(context, sector.name, start, 360, contentWidth, 88, align);
    window.MassariVisuals.drawSectorVisual(context, winner.id, winner.color, rtl ? 112 : 1298, 288, 115);
    context.fillStyle = palette.divider; context.fillRect(170, 455, 1050, 2);
    context.fillStyle = palette.muted; context.font = "700 28px system-ui, Tahoma, Arial, sans-serif"; context.fillText(fillTemplate(ui.cardScore, { score: new Intl.NumberFormat(language).format(topScore) }), start, 525);
    context.fillStyle = palette.text; context.font = "700 36px system-ui, Tahoma, Arial, sans-serif"; context.fillText(ui.cardJobs, start, 610);
    context.font = "500 34px system-ui, Tahoma, Arial, sans-serif";
    sector.jobs.forEach((job, index) => {
      const y = 673 + index * 74; const bulletX = rtl ? start - 18 : start + 14; const textX = rtl ? start - 44 : start + 42;
      context.fillStyle = winner.color; context.beginPath(); context.arc(bulletX, y - 11, 8, 0, Math.PI * 2); context.fill(); context.fillStyle = palette.text; context.fillText(job, textX, y);
    });
    context.fillStyle = palette.muted; context.font = "500 24px system-ui, Tahoma, Arial, sans-serif"; drawWrappedText(context, ui.cardDisclaimer, start, 805, contentWidth, 31, align);
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error(ui.errorDownload || "Your browser could not create the image."));
        const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `${ui.cardFilename}-${winner.id}-${language}.png`; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(link.href), 1000); resolve();
      }, "image/png");
    });
  }
  window.downloadResultCard = downloadResultCard;
})();
