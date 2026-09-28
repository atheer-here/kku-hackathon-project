(function () {
  const exportPalettes = {
    light: {
      background: "#f5f1e8", card: "#ffffff", text: "#26332f", muted: "#4b5d55", divider: "#bdcdc3",
      shadow: "rgba(0, 75, 50, .16)", teal: "#007f7d", gold: "#d7a84b", goldWash: "#fff1c9",
      sceneWash: "#ebe5d4", sceneHorizon: "#cdbd8d", sceneLine: "#075b42", sector: "#247baa", logoRoute: "#ffffff", logoNode: "#ffffff"
    },
    dark: {
      background: "#0e211b", card: "#1c382f", text: "#fff8e9", muted: "#d1dfd5", divider: "#6b8b7b",
      shadow: "rgba(0, 0, 0, .36)", teal: "#65d7d1", gold: "#f1ca72", goldWash: "#4c3b19",
      sceneWash: "#183c31", sceneHorizon: "#49624e", sceneLine: "#a3edc9", sector: "#98d8f5", logoRoute: "#fff8e9", logoNode: "#1c382f"
    }
  };

  function fillTemplate(template, values) {
    return template.replace(/\{(\w+)\}/g, (_, key) => values[key] == null ? "" : values[key]);
  }

  function drawWrappedText(context, text, x, y, maxWidth, lineHeight, align) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = "";
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (context.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
      else line = test;
    });
    if (line) lines.push(line);
    context.textAlign = align;
    lines.forEach((item, index) => context.fillText(item, x, y + index * lineHeight));
    return lines.length * lineHeight;
  }

  function drawConnection(context, palette) {
    context.save();
    context.globalAlpha = .28;
    context.lineWidth = 3;
    context.strokeStyle = palette.teal;
    context.beginPath(); context.moveTo(1080, 58); context.bezierCurveTo(1290, 120, 1245, 238, 1470, 184); context.stroke();
    context.strokeStyle = palette.gold;
    context.beginPath(); context.moveTo(70, 858); context.bezierCurveTo(235, 705, 302, 925, 536, 838); context.stroke();
    [[1250, 166, palette.teal], [390, 850, palette.gold]].forEach(([x, y, color]) => {
      context.strokeStyle = color; context.fillStyle = palette.card; context.globalAlpha = .7;
      context.beginPath(); context.arc(x, y, 18, 0, Math.PI * 2); context.stroke();
      context.globalAlpha = 1; context.beginPath(); context.arc(x, y, 7, 0, Math.PI * 2); context.fill();
    });
    context.restore();
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
    canvas.width = 1500;
    canvas.height = 1060;
    const context = canvas.getContext("2d");
    const start = rtl ? 1320 : 180;
    const contentWidth = 820;
    const align = rtl ? "right" : "left";
    const railX = rtl ? 1378 : 100;
    const sceneX = rtl ? 150 : 930;
    context.direction = rtl ? "rtl" : "ltr";

    context.fillStyle = palette.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = palette.gold;
    context.globalAlpha = .1;
    context.beginPath(); context.arc(rtl ? 170 : 1330, 74, 370, 0, Math.PI * 2); context.fill();
    context.beginPath(); context.arc(rtl ? 1380 : 120, 960, 260, 0, Math.PI * 2); context.fill();
    context.globalAlpha = 1;
    drawConnection(context, palette);

    context.fillStyle = palette.card;
    context.shadowColor = palette.shadow;
    context.shadowBlur = 42;
    context.shadowOffsetY = 18;
    context.beginPath(); context.roundRect(100, 90, 1300, 880, 36); context.fill();
    context.shadowColor = "transparent";
    context.fillStyle = palette.gold;
    context.fillRect(railX, 90, 22, 880);

    context.fillStyle = theme === "dark" ? "#063827" : "#004b32";
    context.beginPath(); context.roundRect(rtl ? 1164 : 1130, 130, 120, 120, 24); context.fill();
    window.MassariVisuals.drawLogo(context, { x: rtl ? 1196 : 1162, y: 162, size: 56, route: palette.logoRoute, node: palette.logoNode, gold: palette.gold });

    context.textAlign = align;
    context.fillStyle = palette.muted;
    context.font = "700 28px system-ui, Tahoma, Arial, sans-serif";
    context.fillText(ui.cardBrand, start, 180);
    context.fillStyle = palette.text;
    context.font = "700 55px system-ui, Tahoma, Arial, sans-serif";
    context.fillText(ui.cardMatch, start, 258);
    context.font = "800 76px system-ui, Tahoma, Arial, sans-serif";
    drawWrappedText(context, sector.name, start, 355, contentWidth, 88, align);

    window.MassariVisuals.drawSectorScene(context, winner.id, {
      x: sceneX,
      y: 350,
      width: 420,
      height: 290,
      sector: palette.sector,
      gold: palette.gold,
      sand: palette.sceneWash,
      horizon: palette.sceneHorizon,
      line: palette.sceneLine,
      rtl
    });

    context.fillStyle = palette.divider;
    context.fillRect(180, 670, 1140, 2);
    context.fillStyle = palette.gold;
    context.font = "800 32px system-ui, Tahoma, Arial, sans-serif";
    context.fillText(fillTemplate(ui.cardScore, { score: new Intl.NumberFormat(language).format(topScore) }), start, 735);
    context.fillStyle = palette.text;
    context.font = "700 36px system-ui, Tahoma, Arial, sans-serif";
    context.fillText(ui.cardJobs, start, 808);
    context.font = "500 30px system-ui, Tahoma, Arial, sans-serif";
    let jobY = 858;
    sector.jobs.forEach((job) => {
      const bulletX = rtl ? start - 18 : start + 14;
      const textX = rtl ? start - 42 : start + 42;
      context.fillStyle = palette.gold;
      context.beginPath(); context.arc(bulletX, jobY - 10, 7, 0, Math.PI * 2); context.fill();
      context.fillStyle = palette.text;
      const usedHeight = drawWrappedText(context, job, textX, jobY, 720, 38, align);
      jobY += Math.max(52, usedHeight + 12);
    });
    context.fillStyle = palette.muted;
    context.font = "500 21px system-ui, Tahoma, Arial, sans-serif";
    drawWrappedText(context, ui.cardDisclaimer, start, Math.max(966, jobY + 12), 1080, 27, align);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error(ui.errorDownload || "Your browser could not create the image."));
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${ui.cardFilename}-${winner.id}-${language}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        resolve();
      }, "image/png");
    });
  }

  window.downloadResultCard = downloadResultCard;
})();
