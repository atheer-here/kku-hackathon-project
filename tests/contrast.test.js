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
    ["#26332f", "#ffffff", 4.5],
    ["#4b5d55", "#ffffff", 4.5],
    ["#ffffff", "#006c35", 4.5],
    ["#174b35", "#ecf7f3", 4.5],
    ["#5d460e", "#fff7e8", 4.5],
    ["#a66d00", "#ffffff", 3]
  ],
  dark: [
    ["#fff8e9", "#1c382f", 4.5],
    ["#d1dfd5", "#1c382f", 4.5],
    ["#fff8e9", "#063827", 4.5],
    ["#062c1d", "#49c487", 4.5],
    ["#fff8e9", "#174937", 4.5],
    ["#f1ca72", "#1c382f", 3],
    ["#6b8b7b", "#1c382f", 3]
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
