const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const sectors = require("../data/sectors.js");

const css = fs.readFileSync(path.join(__dirname, "..", "css", "tokens.css"), "utf8");
function block(sel) {
  const i = css.indexOf(sel);
  assert.ok(i >= 0, `missing block ${sel}`);
  const body = css.slice(css.indexOf("{", i) + 1, css.indexOf("}", i));
  return Object.fromEntries([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}
function lum(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  assert.ok(m, `not a hex colour: ${hex}`);
  const c = [0, 2, 4].map((k) => parseInt(m[1].slice(k, k + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b) { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }

for (const [name, sel] of [["light", 'html[data-theme="light"]'], ["dark", 'html[data-theme="dark"]']]) {
  test(`${name} theme text pairs meet WCAG`, () => {
    const v = block(sel);
    const pairs = [["--ink", "--bg", 4.5], ["--ink-soft", "--bg", 4.5], ["--on-accent", "--accent", 4.5], ["--ink", "--surface", 4.5], ["--gold-ink", "--bg", 4.5], ["--focus", "--bg", 3]];
    for (const [fg, bg, min] of pairs) {
      const r = ratio(v[fg], v[bg]);
      assert.ok(r >= min, `${name} ${fg} on ${bg} = ${r.toFixed(2)} < ${min}`);
    }
  });
  test(`${name} sector accents are readable as large text`, () => {
    const bg = block(sel)["--bg"];
    for (const s of sectors) {
      const c = name === "dark" ? s.colorDark : s.color;
      assert.ok(ratio(c, bg) >= 3, `${s.id} ${c} on ${bg} = ${ratio(c, bg).toFixed(2)}`);
    }
  });
}
