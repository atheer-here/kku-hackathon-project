const test = require("node:test");
const assert = require("node:assert/strict");
const i18n = require("../data/i18n.js");
const REQUIRED = "metaTitle metaDescription skip brandTagline langLabel themeToDark themeToLight navPrev navNext introEyebrow introTitle introLead factQuestions factTime factSectors introStart introNote showEyebrow showTitle showLead step1Title step1Text step2Title step2Text step3Title step3Text showBegin showExample showPause showPlay showSlideLabel photoCredit qProgress qHint qKeysHint anEyebrow anTitle anStage1 anStage2 anStage3 anStage4 anSkip anProgressLabel resEyebrow resMatch resWhyTitle resRunnerUp resTraitsTitle traitPeople traitIdeas traitData traitHands resAllTitle resRolesTitle resSkillsTitle resDownload resDownloading resDownloaded resDownloadFail resRetake resEditAnswers resDisclaimer resExampleBadge statusQuestion statusSelected statusAnalysis statusResult statusLang statusTheme cardHeading cardMatch cardRunnerUp cardRoles cardDisclaimer footer errorGeneric".split(" ");
const holders = (s) => (s.match(/\{\w+\}/g) || []).sort().join(",");

test("both languages have identical, complete keys", () => {
  assert.deepEqual(Object.keys(i18n.ar).sort(), Object.keys(i18n.en).sort());
  REQUIRED.forEach((k) => { assert.ok(i18n.en[k] && i18n.en[k].trim(), `en.${k}`); assert.ok(i18n.ar[k] && i18n.ar[k].trim(), `ar.${k}`); });
});
test("placeholders match and arabic is arabic", () => {
  Object.keys(i18n.en).forEach((k) => { assert.equal(holders(i18n.ar[k]), holders(i18n.en[k]), k); assert.match(i18n.ar[k], /[؀-ۿ]/, `ar.${k}`); });
});
test("arabic UI is gender-neutral toward the user", () => {
  const banned = ["اكتشف", "اختر", "ابدأ", "أجب", "انقر", "اضغط", "تعرّف", "تعرف"];
  Object.entries(i18n.ar).forEach(([k, v]) => { const words = v.split(/[\s،.؟!:«»"()\-–—]+/); banned.forEach((b) => assert.ok(!words.includes(b), `ar.${k} uses ${b}`)); });
});
