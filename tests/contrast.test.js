const test = require("node:test");
const assert = require("node:assert/strict");

function parseHex(hex) {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
}
function luminance(hex) {
  return parseHex(hex).map((channel) => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4)
    .reduce((total, channel, index) => total + channel * [.2126, .7152, .0722][index], 0);
}
function contrast(foreground, background) {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + .05) / (Math.min(first, second) + .05);
}

const pairs = {
  light: [
    ["#26332f", "#fffdf7", 4.5], ["#42574e", "#fffdf7", 4.5], ["#ffffff", "#006c35", 4.5],
    ["#174b35", "#eaf5f1", 4.5], ["#5d460e", "#fff7e8", 4.5], ["#9b6712", "#fffdf7", 3],
    ["#004b32", "#d7a84b", 3], ["#718d7e", "#fffdf7", 3]
  ],
  dark: [
    ["#fff8e9", "#16372c", 4.5], ["#d3e1d6", "#16372c", 4.5], ["#fff8e9", "#062c1d", 4.5],
    ["#062c1d", "#5dd495", 4.5], ["#fff8e9", "#174937", 4.5], ["#f2ca78", "#16372c", 3],
    ["#9bbca9", "#16372c", 3], ["#062c1d", "#f2ca78", 3]
  ]
};

test("critical Massari light and dark color pairs meet their contrast thresholds", () => {
  Object.entries(pairs).forEach(([theme, values]) => {
    values.forEach(([foreground, background, minimum]) => {
      const ratio = contrast(foreground, background);
      assert.ok(ratio >= minimum, `${theme}: ${foreground} on ${background} is ${ratio.toFixed(2)}:1; expected ${minimum}:1`);
    });
  });
});
