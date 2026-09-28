(function () {
  const sceneIds = ["tourism", "technology", "health", "finance", "culture-entertainment"];

  function logo() {
    return `<svg viewBox="0 0 56 56" aria-hidden="true">
      <path class="logo-route" d="M8 39c8-1 10-17 19-18 7-1 9 9 20 8"/>
      <path class="logo-route logo-route-soft" d="M11 17c7 0 8 7 15 7 7 0 8-11 19-11"/>
      <circle class="logo-node" cx="8" cy="39" r="3.5"/><circle class="logo-node" cx="27" cy="21" r="4.5"/><circle class="logo-node" cx="47" cy="29" r="3.5"/>
      <path class="logo-star" d="m45 8 1.8 4.2L51 14l-4.2 1.8L45 20l-1.8-4.2L39 14l4.2-1.8Z"/>
    </svg>`;
  }

  function journeyScene(className) {
    return `<svg class="${className || "journey-scene"}" viewBox="0 0 640 390" aria-hidden="true">
      <path class="scene-wash" d="M0 0h640v390H0z"/>
      <path class="scene-arch" d="M86 242V113c0-48 38-86 86-86s86 38 86 86v129M468 242V113c0-48 38-86 86-86s86 38 86 86v129"/>
      <path class="scene-pattern" d="M103 129h138M468 129h138M172 60v182M537 60v182"/>
      <path class="scene-horizon" d="M0 282c58-34 92-16 145-31 58-17 78-55 143-43 73 13 92-26 154-21 72 6 91 62 198 33v170H0Z"/>
      <path class="scene-dune scene-dune-back" d="M0 316c85-56 147-17 224-25 75-8 113-60 193-45 96 18 110 67 223 37v107H0Z"/>
      <path class="scene-dune" d="M0 348c77-39 152-42 231-17 99 31 162 26 244-12 67-31 105-26 165 7v54H0Z"/>
      <path class="scene-route" d="M65 354c68-6 78-54 133-53 56 1 69-79 130-76 57 4 55 58 112 47 59-12 60-97 128-114"/>
      <g class="scene-route-dots"><circle cx="65" cy="354" r="5"/><circle cx="198" cy="301" r="5"/><circle cx="328" cy="225" r="5"/><circle cx="440" cy="272" r="5"/><circle cx="568" cy="158" r="6"/></g>
      <g class="scene-station scene-station-tourism"><path d="M146 251v-42l18-18 18 18v42M154 251v-28h20v28M148 209h32"/><circle cx="164" cy="181" r="8"/></g>
      <g class="scene-station scene-station-tech"><path d="M281 203v-35h35v35M289 168v-18M307 168v-28M325 168v-18M276 203h45"/><circle cx="307" cy="140" r="5"/></g>
      <g class="scene-station scene-station-health"><path d="M406 249c-15-13-26-23-26-37 0-10 8-18 18-18 6 0 11 4 13 9 3-5 8-9 14-9 10 0 18 8 18 18 0 14-12 24-27 37Z"/><path d="M397 218h27M411 204v28"/></g>
      <g class="scene-station scene-station-finance"><path d="M499 208v-28h12v28M515 208v-45h12v45M531 208v-64h12v64"/><path d="m499 174 18-12 14 7 22-26"/></g>
      <g class="scene-station scene-station-culture"><path d="M552 236c17-29 45-29 62 0M558 236v-32h50v32M568 204c4-12 28-12 32 0"/><circle cx="565" cy="246" r="3"/><circle cx="582" cy="251" r="3"/><circle cx="599" cy="246" r="3"/></g>
      <circle class="scene-sun" cx="568" cy="91" r="18"/><path class="scene-star" d="m569 67 2.2 5.5 5.5 2.2-5.5 2.2-2.2 5.5-2.2-5.5-5.5-2.2 5.5-2.2Z"/>
    </svg>`;
  }

  function sectorScene(id, className) {
    const scenes = {
      tourism: `<path class="scene-wash" d="M0 0h320v220H0z"/><path class="scene-horizon" d="M0 151c52-27 78-10 121-35 46-28 85-24 119-4 28 17 43 7 80-9v117H0Z"/><path class="scene-dune" d="M0 180c58-41 111-23 165-5 61 20 101 18 155-18v63H0Z"/><path class="scene-route" d="M28 196c55-5 56-49 101-48 36 1 42-44 83-48 35-3 45-40 79-48"/><g class="scene-sector"><path d="M110 148V92l25-25 25 25v56M119 148v-34h32v34M114 92h42"/><circle cx="135" cy="49" r="13"/><path d="M135 41v16M127 49h16"/></g><circle class="scene-sun" cx="260" cy="53" r="18"/><circle class="scene-gold-node" cx="291" cy="52" r="5"/>`,
      technology: `<path class="scene-wash" d="M0 0h320v220H0z"/><path class="scene-horizon" d="M0 159c44-23 86-8 124-27 52-26 75-70 128-38 30 18 39 5 68-11v117H0Z"/><path class="scene-route" d="M22 194c52-6 61-48 112-50 45-1 58-59 113-67 27-4 32-35 50-47"/><g class="scene-sector"><path d="M92 151v-55h52v55M102 96V72M118 96V57M134 96V72M150 96V49M87 151h62"/><path d="M102 122h38M121 103v39"/><circle cx="121" cy="57" r="6"/><circle cx="150" cy="49" r="6"/></g><g class="scene-node-grid"><circle cx="225" cy="111" r="7"/><circle cx="265" cy="80" r="7"/><circle cx="286" cy="133" r="7"/><path d="M231 106 259 85M270 85l12 42M231 115l49 15"/></g>`,
      health: `<path class="scene-wash" d="M0 0h320v220H0z"/><path class="scene-horizon" d="M0 157c45-19 81-14 129-33 39-16 71-12 99 11 34 28 60 15 92-8v93H0Z"/><path class="scene-dune" d="M0 188c68-31 117-23 166-6 62 22 109 11 154-16v54H0Z"/><path class="scene-route" d="M29 195c57-5 62-47 114-50 41-2 48-39 77-47 40-10 51-41 76-55"/><g class="scene-sector"><path d="M159 161c-28-24-48-42-48-67 0-18 14-33 32-33 10 0 19 6 24 16 6-10 15-16 25-16 18 0 32 15 32 33 0 25-21 43-49 67Z"/><path d="M135 116h50M160 91v50"/></g><path class="scene-pulse" d="M45 121h34l10-18 14 37 14-25 12 6h36"/><circle class="scene-gold-node" cx="236" cy="81" r="7"/>`,
      finance: `<path class="scene-wash" d="M0 0h320v220H0z"/><path class="scene-horizon" d="M0 159c46-23 79-9 127-34 49-25 86-23 124 2 27 19 42 10 69-8v101H0Z"/><path class="scene-dune" d="M0 187c62-35 114-25 169-4 62 24 105 13 151-17v54H0Z"/><path class="scene-route" d="M25 198c53-9 62-54 110-51 40 3 52-41 86-45 43-6 47-45 77-60"/><g class="scene-sector"><path d="M98 153v-48h26v48M129 153V81h27v72M160 153V56h27v97"/><path class="scene-gold-route" d="m92 124 42-28 25 13 49-55"/><circle cx="208" cy="54" r="9"/></g><g class="scene-opportunities"><circle cx="245" cy="92" r="6"/><circle cx="272" cy="70" r="6"/><circle cx="291" cy="115" r="6"/><path d="m251 88 16-14 18 36"/></g>`,
      "culture-entertainment": `<path class="scene-wash" d="M0 0h320v220H0z"/><path class="scene-horizon" d="M0 157c47-18 89-13 128-31 46-22 73-14 104 10 33 26 59 17 88-7v81H0Z"/><path class="scene-dune" d="M0 188c63-30 114-24 165-4 65 25 107 12 155-16v52H0Z"/><path class="scene-route" d="M25 197c57-5 65-48 116-51 43-3 52-40 85-46 42-7 52-39 72-54"/><g class="scene-sector"><path d="M84 155V89c0-31 24-56 56-56s56 25 56 56v66M96 155V91c0-24 19-44 44-44s44 20 44 44v64"/><path d="M106 117c21-22 54-22 74 0M111 132c17-16 45-16 62 0"/><circle cx="109" cy="165" r="5"/><circle cx="140" cy="171" r="5"/><circle cx="171" cy="165" r="5"/></g><path class="scene-ribbon" d="M212 70c24-20 40 19 62 0 17-14 26-4 34 7"/><path class="scene-ribbon" d="M217 91c22-18 41 18 62 0 14-12 24-7 31 4"/><circle class="scene-gold-node" cx="267" cy="49" r="7"/>`
    };
    return `<svg class="${className || "sector-scene"}" data-sector-scene="${id}" viewBox="0 0 320 220" aria-hidden="true">${scenes[id] || scenes["culture-entertainment"]}</svg>`;
  }

  function sectorVisual(id, className) {
    return sectorScene(id, className || "sector-visual");
  }

  function drawPath(context, points) {
    context.beginPath();
    points.forEach((point, index) => index ? context.lineTo(point[0], point[1]) : context.moveTo(point[0], point[1]));
    context.stroke();
  }

  function drawSectorScene(context, id, options) {
    const settings = options || {};
    const x = settings.x || 0;
    const y = settings.y || 0;
    const width = settings.width || 320;
    const height = settings.height || 220;
    const sector = settings.sector || "#247baa";
    const gold = settings.gold || "#d7a84b";
    const sand = settings.sand || "#f5f1e8";
    const horizon = settings.horizon || "#d9c99e";
    const line = settings.line || "#004b32";
    const rtl = Boolean(settings.rtl);
    context.save();
    context.translate(x, y);
    if (rtl) { context.translate(width, 0); context.scale(-1, 1); }
    context.scale(width / 320, height / 220);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 2.2;
    context.fillStyle = sand;
    context.fillRect(0, 0, 320, 220);
    context.fillStyle = horizon;
    context.globalAlpha = .45;
    context.beginPath(); context.moveTo(0, 158); context.bezierCurveTo(50, 128, 85, 153, 126, 130); context.bezierCurveTo(172, 104, 223, 149, 320, 116); context.lineTo(320, 220); context.lineTo(0, 220); context.closePath(); context.fill();
    context.globalAlpha = 1;
    context.fillStyle = sand;
    context.beginPath(); context.moveTo(0, 185); context.bezierCurveTo(64, 150, 117, 183, 169, 170); context.bezierCurveTo(235, 154, 267, 183, 320, 160); context.lineTo(320, 220); context.lineTo(0, 220); context.closePath(); context.fill();
    context.strokeStyle = gold;
    context.lineWidth = 3;
    context.setLineDash([3, 7]);
    context.beginPath(); context.moveTo(25, 198); context.bezierCurveTo(74, 191, 74, 148, 128, 145); context.bezierCurveTo(174, 142, 194, 102, 237, 100); context.bezierCurveTo(275, 98, 278, 56, 296, 43); context.stroke();
    context.setLineDash([]);
    const node = (cx, cy, radius, color) => { context.fillStyle = color; context.beginPath(); context.arc(cx, cy, radius, 0, Math.PI * 2); context.fill(); };
    const rect = (rx, ry, rw, rh) => { context.strokeRect(rx, ry, rw, rh); };
    context.strokeStyle = sector;
    context.lineWidth = 3;
    if (id === "tourism") { context.beginPath(); context.moveTo(110, 148); context.lineTo(110, 92); context.lineTo(135, 67); context.lineTo(160, 92); context.lineTo(160, 148); context.stroke(); rect(119, 114, 32, 34); node(135, 49, 13, gold); context.strokeStyle = sand; drawPath(context, [[135, 41], [135, 57]]); drawPath(context, [[127, 49], [143, 49]]); node(260, 53, 18, gold); }
    else if (id === "technology") { rect(92, 96, 52, 55); drawPath(context, [[102, 96], [102, 72]]); drawPath(context, [[118, 96], [118, 57]]); drawPath(context, [[134, 96], [134, 72]]); drawPath(context, [[150, 96], [150, 49]]); drawPath(context, [[102, 122], [140, 122]]); drawPath(context, [[121, 103], [121, 142]]); [[121, 57], [150, 49], [225, 111], [265, 80], [286, 133]].forEach(([cx, cy]) => node(cx, cy, 6, cx > 200 ? gold : sector)); context.strokeStyle = gold; drawPath(context, [[231, 106], [259, 85], [282, 127]]); }
    else if (id === "health") { context.beginPath(); context.moveTo(159, 161); context.bezierCurveTo(131, 137, 111, 119, 111, 94); context.bezierCurveTo(111, 76, 125, 61, 143, 61); context.bezierCurveTo(153, 61, 162, 67, 167, 77); context.bezierCurveTo(173, 67, 182, 61, 192, 61); context.bezierCurveTo(210, 61, 224, 76, 224, 94); context.bezierCurveTo(224, 119, 203, 137, 175, 161); context.stroke(); drawPath(context, [[135, 116], [185, 116]]); drawPath(context, [[160, 91], [160, 141]]); context.strokeStyle = gold; drawPath(context, [[45, 121], [79, 121], [89, 103], [103, 140], [117, 115], [129, 121], [165, 121]]); node(236, 81, 7, gold); }
    else if (id === "finance") { rect(98, 105, 26, 48); rect(129, 81, 27, 72); rect(160, 56, 27, 97); context.strokeStyle = gold; drawPath(context, [[92, 124], [134, 96], [159, 109], [208, 54]]); node(208, 54, 9, gold); context.strokeStyle = sector; [[245, 92], [272, 70], [291, 115]].forEach(([cx, cy]) => node(cx, cy, 6, sector)); context.strokeStyle = gold; drawPath(context, [[251, 88], [267, 74], [285, 110]]); }
    else { context.beginPath(); context.moveTo(84, 155); context.lineTo(84, 89); context.bezierCurveTo(84, 14, 196, 14, 196, 89); context.lineTo(196, 155); context.stroke(); context.beginPath(); context.moveTo(96, 155); context.lineTo(96, 91); context.bezierCurveTo(96, 32, 184, 32, 184, 91); context.lineTo(184, 155); context.stroke(); drawPath(context, [[106, 117], [143, 95], [180, 117]]); drawPath(context, [[111, 132], [142, 116], [173, 132]]); [[109, 165], [140, 171], [171, 165]].forEach(([cx, cy]) => node(cx, cy, 5, sector)); context.strokeStyle = gold; drawPath(context, [[212, 70], [236, 50], [258, 80], [282, 61], [308, 77]]); drawPath(context, [[217, 91], [239, 73], [261, 91], [279, 75], [310, 95]]); node(267, 49, 7, gold); }
    [[25, 198], [128, 145], [237, 100], [296, 43]].forEach(([cx, cy]) => node(cx, cy, 4.5, gold));
    context.restore();
  }

  function drawSectorVisual(context, id, color, x, y, size) {
    drawSectorScene(context, id, { x, y, width: size, height: size * .7, sector: color, gold: color, sand: "transparent", horizon: "transparent", line: color });
  }

  function drawLogo(context, options) {
    const settings = options || {};
    const x = settings.x || 0;
    const y = settings.y || 0;
    const size = settings.size || 56;
    const route = settings.route || "#f5f1e8";
    const node = settings.node || "#ffffff";
    const gold = settings.gold || "#d7a84b";
    context.save();
    context.translate(x, y);
    context.scale(size / 56, size / 56);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 2.3;
    context.strokeStyle = route;
    context.beginPath(); context.moveTo(8, 39); context.bezierCurveTo(16, 38, 18, 22, 27, 21); context.bezierCurveTo(34, 20, 36, 30, 47, 29); context.stroke();
    context.globalAlpha = .56;
    context.beginPath(); context.moveTo(11, 17); context.bezierCurveTo(18, 17, 19, 24, 26, 24); context.bezierCurveTo(33, 24, 34, 13, 45, 13); context.stroke();
    context.globalAlpha = 1;
    [[8, 39, 3.5], [27, 21, 4.5], [47, 29, 3.5]].forEach(([cx, cy, radius]) => { context.fillStyle = node; context.strokeStyle = gold; context.beginPath(); context.arc(cx, cy, radius, 0, Math.PI * 2); context.fill(); context.stroke(); });
    context.fillStyle = gold;
    context.beginPath(); context.moveTo(45, 8); context.lineTo(46.8, 12.2); context.lineTo(51, 14); context.lineTo(46.8, 15.8); context.lineTo(45, 20); context.lineTo(43.2, 15.8); context.lineTo(39, 14); context.lineTo(43.2, 12.2); context.closePath(); context.fill();
    context.restore();
  }

  const api = { sceneIds, logo, journeyScene, sectorScene, drawSectorScene, drawLogo, sectorVisual, drawSectorVisual };
  if (typeof window !== "undefined") window.MassariVisuals = api;
  if (typeof module !== "undefined") module.exports = api;
})();
