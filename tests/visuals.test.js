const test = require("node:test");
const assert = require("node:assert/strict");
const visuals = require("../js/massari-visuals.js");

const sectorIds = ["tourism", "technology", "health", "finance", "culture-entertainment"];

test("Massari visual system provides original scenes for every stable sector", () => {
  assert.deepEqual(visuals.sceneIds, sectorIds);
  sectorIds.forEach((id) => {
    const scene = visuals.sectorScene(id, "test-scene");
    assert.match(scene, /<svg/);
    assert.match(scene, new RegExp(`data-sector-scene="${id}"`));
    assert.match(scene, /scene-route/);
  });
});

test("Massari visual system exposes the logo, hero and Canvas renderers", () => {
  assert.match(visuals.logo(), /logo-star/);
  assert.match(visuals.journeyScene(), /scene-station-tourism/);
  assert.equal(typeof visuals.drawLogo, "function");
  assert.equal(typeof visuals.drawSectorScene, "function");
  assert.equal(typeof visuals.drawSectorVisual, "function");
});
