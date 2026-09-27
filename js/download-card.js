(function () {
  const exportPalettes = {
    light: {
      background: "#f5f1e8",
      card: "#ffffff",
      text: "#26332f",
      muted: "#56645e",
      divider: "#d5dfd7",
      shadow: "rgba(0, 75, 50, .16)",
      teal: "#00a6a6",
      gold: "#d7a84b"
    },
    dark: {
      background: "#132923",
      card: "#203c33",
      text: "#f8f4e9",
      muted: "#c1d0c8",
      divider: "#456457",
      shadow: "rgba(0, 0, 0, .36)",
      teal: "#32c5c2",
      gold: "#e5bc68"
    }
  };

  function drawIcon(context, icon, color) {
    context.save();
    context.strokeStyle = color;
    context.lineWidth = 5;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.beginPath();
    if (icon === "compass") {
      context.moveTo(90, 44); context.lineTo(106, 60); context.lineTo(90, 76); context.lineTo(74, 60); context.closePath();
      context.moveTo(90, 60); context.lineTo(98, 68);
    } else if (icon === "spark") {
      context.moveTo(90, 43); context.lineTo(97, 60); context.lineTo(114, 67); context.lineTo(97, 74); context.lineTo(90, 91); context.lineTo(83, 74); context.lineTo(66, 67); context.lineTo(83, 60); context.closePath();
    } else if (icon === "heart") {
      context.moveTo(90, 84); context.bezierCurveTo(72, 70, 61, 61, 64, 51); context.bezierCurveTo(67, 39, 82, 42, 90, 53); context.bezierCurveTo(98, 42, 113, 39, 116, 51); context.bezierCurveTo(119, 61, 108, 70, 90, 84);
    } else if (icon === "chart") {
      context.rect(68, 64, 10, 16); context.rect(85, 51, 10, 29); context.rect(102, 38, 10, 42);
    } else {
      context.moveTo(90, 42); context.lineTo(97, 60); context.lineTo(115, 61); context.lineTo(101, 73); context.lineTo(106, 91); context.lineTo(90, 81); context.lineTo(74, 91); context.lineTo(79, 73); context.lineTo(65, 61); context.lineTo(83, 60); context.closePath();
    }
    context.stroke();
    context.restore();
  }

  function drawConnection(context, palette) {
    context.save();
    context.strokeStyle = palette.teal;
    context.globalAlpha = .28;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(1120, 55); context.bezierCurveTo(1310, 115, 1250, 225, 1450, 185); context.stroke();
    context.beginPath();
    context.strokeStyle = palette.gold;
    context.moveTo(70, 820); context.bezierCurveTo(230, 685, 300, 920, 520, 830); context.stroke();
    [[1250, 166, palette.teal], [390, 850, palette.gold]].forEach(([x, y, color]) => {
      context.strokeStyle = color; context.fillStyle = palette.card; context.globalAlpha = .65;
      context.beginPath(); context.arc(x, y, 18, 0, Math.PI * 2); context.stroke();
      context.globalAlpha = 1; context.beginPath(); context.arc(x, y, 7, 0, Math.PI * 2); context.fill();
    });
    context.restore();
  }

  function downloadResultCard(result) {
    const { winner, topScore } = result;
    const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const palette = exportPalettes[theme];
    const canvas = document.createElement("canvas");
    canvas.width = 1500;
    canvas.height = 960;
    const context = canvas.getContext("2d");

    context.fillStyle = palette.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = winner.color;
    context.globalAlpha = .12;
    context.beginPath(); context.arc(1300, 40, 360, 0, Math.PI * 2); context.fill();
    context.beginPath(); context.arc(120, 860, 250, 0, Math.PI * 2); context.fill();
    context.globalAlpha = 1;
    drawConnection(context, palette);

    context.fillStyle = palette.card;
    context.shadowColor = palette.shadow;
    context.shadowBlur = 42;
    context.shadowOffsetY = 18;
    context.beginPath(); context.roundRect(100, 90, 1300, 780, 36); context.fill();
    context.shadowColor = "transparent";

    context.fillStyle = winner.color;
    context.fillRect(100, 90, 22, 780);
    context.fillStyle = palette.muted;
    context.font = "700 28px system-ui, sans-serif";
    context.fillText("SECTOR EXPLORER", 170, 170);
    context.fillStyle = palette.text;
    context.font = "700 55px system-ui, sans-serif";
    context.fillText("Your best match", 170, 250);
    context.fillStyle = winner.color;
    context.font = "800 88px system-ui, sans-serif";
    context.fillText(winner.name, 170, 360);
    drawIcon(context, winner.icon, winner.color);

    context.fillStyle = palette.divider;
    context.fillRect(170, 420, 1050, 2);
    context.fillStyle = palette.muted;
    context.font = "700 28px system-ui, sans-serif";
    context.fillText(`Illustrative score: ${topScore} points`, 170, 490);
    context.fillStyle = palette.text;
    context.font = "700 36px system-ui, sans-serif";
    context.fillText("Example career directions", 170, 580);
    context.font = "500 34px system-ui, sans-serif";
    winner.jobs.forEach((job, index) => {
      context.fillStyle = winner.color;
      context.beginPath(); context.arc(184, 640 + index * 72, 8, 0, Math.PI * 2); context.fill();
      context.fillStyle = palette.text;
      context.fillText(job, 212, 652 + index * 72);
    });
    context.fillStyle = palette.muted;
    context.font = "500 24px system-ui, sans-serif";
    context.fillText("Example content only — not official guidance or career advice.", 170, 803);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Your browser could not create the image."));
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `vision-2030-sector-fit-${winner.id}.png`;
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
