const test = require("node:test");
const assert = require("node:assert/strict");
const icons = require("../js/icons.js");
const sectors = require("../data/sectors.js");
const questions = require("../data/questions.js");

test("every icon the content references exists", () => {
  const names = new Set(sectors.map((s) => s.icon));
  questions.forEach((q) => q.answers.forEach((a) => names.add(a.icon)));
  "caret-left caret-right sun moon download-simple arrow-counter-clockwise pencil-simple play pause check fast-forward hand-tap waveform path"
    .split(" ").forEach((n) => names.add(n));
  for (const n of names) assert.ok(icons.has(n), `missing icon: ${n}`);
});

test("svg output and logo contract", () => {
  const s = icons.svg("cpu", { title: "Chip" });
  assert.match(s, /^<svg [^>]*viewBox="0 0 256 256"/);
  assert.match(s, /aria-label="Chip"/);
  assert.equal(icons.has("definitely-not-an-icon"), false);
  assert.ok(icons.logoPaths.length >= 2);
  icons.logoPaths.forEach((p) => { assert.ok(p.d); assert.ok(["stroke", "fill", "accent"].includes(p.role)); });
  assert.match(icons.logoMark(), /viewBox="0 0 64 64"/);
});
