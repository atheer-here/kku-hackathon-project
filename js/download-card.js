(function () {
  const icons = {
    compass: ["M", 90, 44, "m0 0 16 16 -16 16 -16 -16 16 -16", "M", 90, 60, "l8 8"],
    spark: ["M", 90, 43, "l7 17 17 7 -17 7 -7 17 -7 -17 -17 -7 17 -7z"],
    heart: ["M", 90, 50, "c-14-17-37 5 0 31 37-26 14-48 0-31z"],
    chart: ["M", 68, 80, "v-16 h10 v16z M", 85, 80, "v-29 h10 v29z M", 102, 80, "v-42 h10 v42z"],
    star: ["M", 90, 42, "l7 17 18 1 -14 12 5 18 -16-10 -16 10 5-18 -14-12 18-1z"]
  };

  function drawIcon(context, icon, color) {
    context.save();
    context.strokeStyle = color;
    context.lineWidth = 5;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.beginPath();
    const commands = icons[icon];
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

  function downloadResultCard(result) {
    const { winner, topScore } = result;
    const canvas = document.createElement("canvas");
    canvas.width = 1500;
    canvas.height = 960;
    const context = canvas.getContext("2d");
    const primary = "#10283f";

    context.fillStyle = "#f7fbf7";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = winner.color;
    context.globalAlpha = 0.13;
    context.beginPath(); context.arc(1300, 40, 360, 0, Math.PI * 2); context.fill();
    context.beginPath(); context.arc(120, 860, 250, 0, Math.PI * 2); context.fill();
    context.globalAlpha = 1;

    context.fillStyle = "#ffffff";
    context.shadowColor = "rgba(16, 40, 63, .14)";
    context.shadowBlur = 42;
    context.shadowOffsetY = 18;
    context.beginPath(); context.roundRect(100, 90, 1300, 780, 36); context.fill();
    context.shadowColor = "transparent";

    context.fillStyle = winner.color;
    context.fillRect(100, 90, 22, 780);
    context.fillStyle = "#597080";
    context.font = "700 28px system-ui, sans-serif";
    context.fillText("VISION 2030 SECTOR QUIZ", 170, 170);
    context.fillStyle = primary;
    context.font = "700 55px system-ui, sans-serif";
    context.fillText("Your best match", 170, 250);
    context.fillStyle = winner.color;
    context.font = "800 88px system-ui, sans-serif";
    context.fillText(winner.name, 170, 360);
    drawIcon(context, winner.icon, winner.color);

    context.fillStyle = "#eaf0f2";
    context.fillRect(170, 420, 1050, 2);
    context.fillStyle = "#597080";
    context.font = "700 28px system-ui, sans-serif";
    context.fillText(`Illustrative score: ${topScore} points`, 170, 490);
    context.fillStyle = primary;
    context.font = "700 36px system-ui, sans-serif";
    context.fillText("Example career directions", 170, 580);
    context.font = "500 34px system-ui, sans-serif";
    winner.jobs.forEach((job, index) => {
      context.fillStyle = winner.color;
      context.beginPath(); context.arc(184, 640 + index * 72, 8, 0, Math.PI * 2); context.fill();
      context.fillStyle = primary;
      context.fillText(job, 212, 652 + index * 72);
    });
    context.fillStyle = "#597080";
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
