(function () {
  const sceneIds = ["tourism", "technology", "health", "finance", "culture-entertainment"];

  function logo() {
    return `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path class="logo-route" d="M9 46c9-2 12-20 23-21 8-1 10 9 21 8"/>
      <path class="logo-route logo-route-soft" d="M10 22c8 1 10 8 18 8 8 0 10-13 24-14"/>
      <path class="logo-tile" d="m18 16 5 5-5 5-5-5Zm28 20 5 5-5 5-5-5Z"/>
      <circle class="logo-node" cx="9" cy="46" r="3.5"/><circle class="logo-node" cx="32" cy="25" r="4.5"/><circle class="logo-node" cx="53" cy="33" r="3.5"/>
      <path class="logo-star" d="m51 8 2.3 5.4 5.4 2.3-5.4 2.3-2.3 5.4-2.3-5.4-5.4-2.3 5.4-2.3Z"/>
    </svg>`;
  }

  function startingPointScene(className) {
    return `<svg class="${className || "starting-scene"}" viewBox="0 0 500 280" aria-hidden="true">
      <path class="scene-wash" d="M0 0h500v280H0z"/>
      <path class="scene-start-halo" d="M31 239a63 63 0 1 1 126 0 63 63 0 1 1-126 0Z"/>
      <path class="scene-route scene-route-intro" d="M68 232c66 1 78-77 142-75 58 2 69 44 123 12 45-26 52-72 111-85"/>
      <g class="scene-route-dots"><circle cx="68" cy="232" r="8"/><circle cx="210" cy="157" r="6"/><circle cx="333" cy="169" r="6"/><circle cx="444" cy="84" r="8"/></g>
      <g class="scene-start-nodes"><circle cx="142" cy="86" r="6"/><circle cx="264" cy="67" r="5"/><circle cx="370" cy="104" r="5"/></g>
      <path class="scene-start-star" d="m142 38 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/><path class="scene-start-star" d="m397 47 1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6Z"/>
      <path class="scene-start-terrain" d="M0 260c66-48 117-25 176-26 76-2 122-63 186-45 55 15 95 23 138-8v99H0Z"/>
    </svg>`;
  }

  function pathScene(className) {
    return `<svg class="${className || "path-scene"}" viewBox="0 0 720 420" aria-hidden="true">
      <path class="scene-wash" d="M0 0h720v420H0z"/>
      <circle class="scene-sun" cx="607" cy="82" r="28"/>
      <path class="scene-skyline" d="M424 252v-91h26v91m14 0v-147h34l-17-58-17 58m50 147v-114h38v114m20 0v-70h30v70m-317 0v-77h32v77m-48 0h368"/>
      <path class="scene-tower-light" d="M481 48v204M470 105h22"/>
      <path class="scene-palms" d="M113 286v-52m0 9c-16-19-32-12-34-10m34 10c14-20 31-15 35-12m-35 20c-17-10-28-4-31-1m31 1c15-12 28-5 31-1M173 299v-41m0 8c-12-15-25-9-28-7m28 7c13-15 24-11 27-8"/>
      <path class="scene-horizon" d="M0 295c83-47 139-23 212-40 76-18 100-73 188-55 98 21 133-24 207-8 49 10 70 33 113 18v210H0Z"/>
      <path class="scene-dune scene-dune-back" d="M0 337c106-63 181-13 281-33 97-19 137-66 231-43 76 18 116 55 208 24v135H0Z"/>
      <path class="scene-dune" d="M0 370c91-38 172-47 267-17 101 32 185 27 269-9 74-32 123-23 184 10v66H0Z"/>
      <path class="scene-route" d="M72 378c75-10 84-68 151-65 62 2 77-85 151-81 69 4 70 72 135 56 72-18 66-111 137-138"/>
      <g class="scene-route-dots"><circle cx="72" cy="378" r="6"/><circle cx="223" cy="313" r="6"/><circle cx="374" cy="232" r="6"/><circle cx="509" cy="288" r="6"/><circle cx="646" cy="150" r="8"/></g>
      <g class="scene-station scene-station-tourism"><path d="M168 266v-37l16-16 16 16v37M176 266v-23h16v23M172 229h24"/><circle cx="184" cy="204" r="7"/></g>
      <g class="scene-station scene-station-tech"><path d="M319 211v-32h31v32M326 179v-16M341 179v-27M356 179v-16M314 211h41"/><circle cx="341" cy="152" r="5"/></g>
      <g class="scene-station scene-station-health"><path d="M473 263c-14-12-24-21-24-34 0-9 7-16 16-16 5 0 10 4 12 8 3-4 7-8 13-8 9 0 16 7 16 16 0 13-11 22-25 34Z"/><path d="M464 235h24M476 223v24"/></g>
      <g class="scene-station scene-station-finance"><path d="M565 220v-25h11v25M580 220v-39h11v39M595 220v-55h11v55"/><path d="m565 190 16-11 13 6 20-24"/></g>
      <g class="scene-station scene-station-culture"><path d="M620 266c16-25 41-25 57 0M626 266v-28h45v28M635 238c4-11 25-11 29 0"/><circle cx="635" cy="276" r="3"/><circle cx="651" cy="280" r="3"/><circle cx="667" cy="276" r="3"/></g>
    </svg>`;
  }

  function journeyScene(className) { return pathScene(className || "journey-scene"); }

  function sectorScene(id, className) {
    const scenes = {
      tourism: `<path class="scene-wash" d="M0 0h320v220H0z"/><path class="scene-horizon" d="M0 147c54-28 87-12 128-33 48-25 88-28 121-6 28 18 45 8 71-8v120H0Z"/><path class="scene-dune" d="M0 182c58-41 112-22 166-5 61 20 100 19 154-18v61H0Z"/><path class="scene-route" d="M27 198c54-5 58-51 103-49 39 2 45-42 83-48 37-7 49-37 80-48"/><g class="scene-sector"><path d="M91 153v-54l26-26 26 26v54M101 153v-34h32v34M95 99h44"/><path d="M52 162v-35m0 8c-12-16-25-10-28-8m28 8c13-17 26-11 30-8"/><path d="M229 73c0-12 18-20 18-31 0-6-5-11-11-11s-11 5-11 11c0 11 18 19 18 31Z"/></g><circle class="scene-sun" cx="267" cy="52" r="18"/><circle class="scene-gold-node" cx="293" cy="55" r="5"/>`,
      technology: `<path class="scene-wash" d="M0 0h320v220H0z"/><path class="scene-horizon" d="M0 157c45-22 83-7 125-28 54-27 77-68 128-36 31 19 42 7 67-10v137H0Z"/><path class="scene-route" d="M22 197c50-6 62-50 112-51 47-1 60-57 111-67 30-6 36-35 52-48"/><g class="scene-sector"><path d="M81 157v-58h59v58M91 99V73M107 99V58M123 99V73M139 99V49M76 157h69"/><path d="M92 128h42M113 106v43"/><circle cx="113" cy="58" r="6"/><circle cx="139" cy="49" r="6"/></g><g class="scene-node-grid"><circle cx="215" cy="111" r="7"/><circle cx="258" cy="78" r="7"/><circle cx="286" cy="129" r="7"/><path d="M221 106 252 83M263 84l18 39M221 115l60 10"/></g><path class="scene-grid-lines" d="M194 154h101M194 170h101M214 135v47M242 135v47M270 135v47"/>`,
      health: `<path class="scene-wash" d="M0 0h320v220H0z"/><path class="scene-horizon" d="M0 157c44-20 82-13 127-32 41-17 73-13 102 11 33 28 60 15 91-8v92H0Z"/><path class="scene-dune" d="M0 188c66-31 116-22 167-6 62 21 108 12 153-16v54H0Z"/><path class="scene-route" d="M28 197c57-6 62-47 113-50 42-2 48-39 78-47 40-10 50-42 77-56"/><g class="scene-sector"><path d="M157 164c-29-25-49-42-49-68 0-18 14-33 32-33 10 0 19 6 25 16 6-10 15-16 25-16 18 0 32 15 32 33 0 26-21 43-50 68Z"/><path d="M134 119h52M160 93v52"/><path d="M78 153c7-23 31-31 46-14M82 164c12-10 29-9 42 1"/></g><path class="scene-pulse" d="M37 121h35l11-19 14 38 15-26 12 7h39"/><circle class="scene-gold-node" cx="240" cy="78" r="7"/>`,
      finance: `<path class="scene-wash" d="M0 0h320v220H0z"/><path class="scene-horizon" d="M0 157c45-22 81-9 127-33 50-26 89-23 125 3 27 19 42 9 68-8v101H0Z"/><path class="scene-dune" d="M0 188c62-34 114-24 169-4 63 23 106 13 151-17v53H0Z"/><path class="scene-route" d="M23 198c54-10 64-54 111-51 41 3 52-40 88-45 42-6 47-45 76-60"/><g class="scene-sector"><path d="M82 157v-50h28v50M116 157V79h29v78M151 157V54h29v103"/><path class="scene-gold-route" d="m77 126 43-30 25 13 53-57"/><circle cx="205" cy="52" r="9"/></g><path class="scene-grid-lines" d="M215 151h88M215 170h88M230 137v47M258 137v47M286 137v47"/><g class="scene-opportunities"><circle cx="246" cy="91" r="6"/><circle cx="274" cy="68" r="6"/><circle cx="294" cy="112" r="6"/><path d="m252 87 17-15 20 35"/></g>`,
      "culture-entertainment": `<path class="scene-wash" d="M0 0h320v220H0z"/><path class="scene-horizon" d="M0 157c47-18 89-13 128-31 46-22 75-14 106 10 32 26 58 17 86-7v81H0Z"/><path class="scene-dune" d="M0 188c63-30 114-24 166-4 65 24 107 12 154-16v52H0Z"/><path class="scene-route" d="M24 197c57-5 65-48 116-51 43-3 52-40 85-46 42-7 52-39 73-54"/><g class="scene-sector"><path d="M79 158V90c0-32 25-57 57-57s57 25 57 57v68M92 158V92c0-25 19-45 44-45s44 20 44 45v66"/><path d="M102 119c20-23 55-23 76 0M107 135c18-17 46-17 64 0"/><circle cx="105" cy="168" r="5"/><circle cx="136" cy="174" r="5"/><circle cx="168" cy="168" r="5"/></g><path class="scene-ribbon" d="M206 70c25-22 42 20 65 0 17-14 26-5 37 7"/><path class="scene-ribbon" d="M211 92c23-19 42 19 64 0 15-12 25-7 33 4"/><path class="scene-stage-light" d="M251 48 236 76M267 48l-4 31M282 48l10 29"/><circle class="scene-gold-node" cx="266" cy="47" r="7"/>`
    };
    return `<svg class="${className || "sector-scene"}" data-sector-scene="${id}" viewBox="0 0 320 220" aria-hidden="true">${scenes[id] || scenes["culture-entertainment"]}</svg>`;
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
    const line = settings.line || sector;
    const rtl = Boolean(settings.rtl);
    context.save();
    context.translate(x, y);
    if (rtl) { context.translate(width, 0); context.scale(-1, 1); }
    context.scale(width / 320, height / 220);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.fillStyle = sand;
    context.fillRect(0, 0, 320, 220);
    context.fillStyle = horizon;
    context.globalAlpha = .55;
    context.beginPath(); context.moveTo(0, 158); context.bezierCurveTo(50, 128, 85, 153, 126, 130); context.bezierCurveTo(172, 104, 223, 149, 320, 116); context.lineTo(320, 220); context.lineTo(0, 220); context.closePath(); context.fill();
    context.globalAlpha = 1;
    context.fillStyle = sand;
    context.beginPath(); context.moveTo(0, 185); context.bezierCurveTo(64, 150, 117, 183, 169, 170); context.bezierCurveTo(235, 154, 267, 183, 320, 160); context.lineTo(320, 220); context.lineTo(0, 220); context.closePath(); context.fill();
    context.strokeStyle = gold; context.lineWidth = 3; context.setLineDash([3, 7]);
    context.beginPath(); context.moveTo(25, 198); context.bezierCurveTo(74, 191, 74, 148, 128, 145); context.bezierCurveTo(174, 142, 194, 102, 237, 100); context.bezierCurveTo(275, 98, 278, 56, 296, 43); context.stroke(); context.setLineDash([]);
    const node = (cx, cy, radius, color) => { context.fillStyle = color; context.beginPath(); context.arc(cx, cy, radius, 0, Math.PI * 2); context.fill(); };
    const rect = (rx, ry, rw, rh) => { context.strokeRect(rx, ry, rw, rh); };
    context.strokeStyle = sector; context.lineWidth = 3;
    if (id === "tourism") {
      context.beginPath(); context.moveTo(91, 153); context.lineTo(91, 99); context.lineTo(117, 73); context.lineTo(143, 99); context.lineTo(143, 153); context.stroke(); rect(101, 119, 32, 34); context.strokeStyle = line; drawPath(context, [[52, 162], [52, 127]]); context.strokeStyle = gold; node(267, 52, 18, gold); node(293, 55, 5, gold);
    } else if (id === "technology") {
      rect(81, 99, 59, 58); [[91, 99, 91, 73], [107, 99, 107, 58], [123, 99, 123, 73], [139, 99, 139, 49], [92, 128, 134, 128], [113, 106, 113, 149]].forEach(([a, b, c, d]) => drawPath(context, [[a, b], [c, d]])); [[113, 58], [139, 49], [215, 111], [258, 78], [286, 129]].forEach(([cx, cy]) => node(cx, cy, 6, cx > 190 ? gold : sector)); context.strokeStyle = gold; drawPath(context, [[221, 106], [252, 83], [281, 123]]);
    } else if (id === "health") {
      context.beginPath(); context.moveTo(157, 164); context.bezierCurveTo(128, 139, 108, 120, 108, 94); context.bezierCurveTo(108, 76, 122, 61, 140, 61); context.bezierCurveTo(150, 61, 159, 67, 165, 77); context.bezierCurveTo(171, 67, 180, 61, 190, 61); context.bezierCurveTo(208, 61, 222, 76, 222, 94); context.bezierCurveTo(222, 120, 201, 139, 172, 164); context.stroke(); drawPath(context, [[134, 119], [186, 119]]); drawPath(context, [[160, 93], [160, 145]]); context.strokeStyle = gold; drawPath(context, [[37, 121], [72, 121], [83, 102], [97, 140], [112, 114], [124, 121], [163, 121]]); node(240, 78, 7, gold);
    } else if (id === "finance") {
      rect(82, 107, 28, 50); rect(116, 79, 29, 78); rect(151, 54, 29, 103); context.strokeStyle = gold; drawPath(context, [[77, 126], [120, 96], [145, 109], [205, 52]]); node(205, 52, 9, gold); context.strokeStyle = sector; [[246, 91], [274, 68], [294, 112]].forEach(([cx, cy]) => node(cx, cy, 6, sector)); context.strokeStyle = gold; drawPath(context, [[252, 87], [269, 72], [289, 107]]);
    } else {
      context.beginPath(); context.moveTo(79, 158); context.lineTo(79, 90); context.bezierCurveTo(79, 14, 193, 14, 193, 90); context.lineTo(193, 158); context.stroke(); context.beginPath(); context.moveTo(92, 158); context.lineTo(92, 92); context.bezierCurveTo(92, 32, 180, 32, 180, 92); context.lineTo(180, 158); context.stroke(); drawPath(context, [[102, 119], [140, 96], [178, 119]]); drawPath(context, [[107, 135], [139, 118], [171, 135]]); [[105, 168], [136, 174], [168, 168]].forEach(([cx, cy]) => node(cx, cy, 5, sector)); context.strokeStyle = gold; drawPath(context, [[206, 70], [236, 48], [258, 80], [282, 61], [308, 77]]); drawPath(context, [[211, 92], [239, 73], [261, 92], [279, 75], [310, 95]]); node(266, 47, 7, gold);
    }
    [[25, 198], [128, 145], [237, 100], [296, 43]].forEach(([cx, cy]) => node(cx, cy, 4.5, gold));
    context.restore();
  }

  function drawLogo(context, options) {
    const settings = options || {};
    const x = settings.x || 0;
    const y = settings.y || 0;
    const size = settings.size || 64;
    const route = settings.route || "#ffffff";
    const node = settings.node || "#ffffff";
    const gold = settings.gold || "#d7a84b";
    context.save(); context.translate(x, y); context.scale(size / 64, size / 64); context.lineCap = "round"; context.lineJoin = "round"; context.lineWidth = 2.2; context.strokeStyle = route;
    context.beginPath(); context.moveTo(9, 46); context.bezierCurveTo(18, 44, 21, 26, 32, 25); context.bezierCurveTo(40, 24, 42, 34, 53, 33); context.stroke();
    context.globalAlpha = .56; context.beginPath(); context.moveTo(10, 22); context.bezierCurveTo(18, 23, 20, 30, 28, 30); context.bezierCurveTo(36, 30, 38, 17, 52, 16); context.stroke(); context.globalAlpha = 1;
    [[9, 46, 3.5], [32, 25, 4.5], [53, 33, 3.5]].forEach(([cx, cy, radius]) => { context.fillStyle = node; context.strokeStyle = gold; context.beginPath(); context.arc(cx, cy, radius, 0, Math.PI * 2); context.fill(); context.stroke(); });
    context.fillStyle = gold; context.beginPath(); context.moveTo(51, 8); context.lineTo(53.3, 13.4); context.lineTo(58.7, 15.7); context.lineTo(53.3, 18); context.lineTo(51, 23.4); context.lineTo(48.7, 18); context.lineTo(43.3, 15.7); context.lineTo(48.7, 13.4); context.closePath(); context.fill(); context.restore();
  }

  function sectorVisual(id, className) { return sectorScene(id, className || "sector-visual"); }
  function drawSectorVisual(context, id, color, x, y, size) { drawSectorScene(context, id, { x, y, width: size, height: size * .7, sector: color, gold: color, sand: "transparent", horizon: "transparent", line: color }); }

  const api = { sceneIds, logo, startingPointScene, pathScene, journeyScene, sectorScene, drawSectorScene, drawLogo, sectorVisual, drawSectorVisual };
  if (typeof window !== "undefined") window.MassariVisuals = api;
  if (typeof module !== "undefined") module.exports = api;
})();
