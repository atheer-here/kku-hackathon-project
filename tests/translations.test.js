const test = require("node:test");
const assert = require("node:assert/strict");
const sectors = require("../data/sectors.js");
const questions = require("../data/questions.js");
const { locales, translations, validateTranslations } = require("../data/translations.js");

const requiredUiKeys = [
  "skip", "brandKicker", "footer", "languageLabel", "themeToLight", "themeToDark",
  "overviewEyebrow", "overviewTitle", "overviewLead", "overviewSupport", "overviewStart", "overviewDisclaimer",
  "pathEyebrow", "pathTitle", "pathLead", "pathBack", "pathStart", "pathNotice",
  "questionKicker", "questionCount", "progressLabel", "progressText", "answerPrompt", "back", "next", "seeResult",
  "analysisEyebrow", "analysisTitle", "analysisLead", "analysisStage1", "analysisStage2", "analysisStage3", "analysisStage4", "analysisProgressLabel", "analysisProgressText", "analysisSkip",
  "resultTitle", "scoreLabel", "jobsLabel", "tie", "chartTitle", "download", "downloading", "downloadFailure", "retry", "resultDisclaimer",
  "statusLanguage", "statusAnalysis", "statusResult", "errorResult", "cardBrand", "cardMatch", "cardScore", "cardJobs", "cardDisclaimer", "cardFilename"
];

function placeholders(text) { return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort(); }

test("English and Arabic translation dictionaries have matching, complete interface copy", () => {
  assert.deepEqual(locales, ["en", "ar"]);
  const englishKeys = Object.keys(translations.en.ui).sort();
  assert.deepEqual(Object.keys(translations.ar.ui).sort(), englishKeys);
  locales.forEach((locale) => {
    requiredUiKeys.forEach((key) => {
      assert.equal(typeof translations[locale].ui[key], "string", `${locale}.${key} must be a string`);
      assert.ok(translations[locale].ui[key].trim(), `${locale}.${key} must not be blank`);
    });
  });
  englishKeys.forEach((key) => assert.deepEqual(placeholders(translations.ar.ui[key]), placeholders(translations.en.ui[key]), `placeholder mismatch for ${key}`));
  assert.match(translations.en.ui.welcomeTitle, /<em>/);
  assert.match(translations.ar.ui.welcomeTitle, /<em>/);
  assert.match(translations.en.ui.chartSummary, /<strong>/);
  assert.match(translations.ar.ui.chartSummary, /<strong>/);
});

test("Arabic translations cover every stable sector, question, and answer identifier", () => {
  assert.equal(validateTranslations(sectors, questions), true);
  sectors.forEach((sector) => {
    const translated = translations.ar.sectors[sector.id];
    assert.equal(translated.jobs.length, 2);
    assert.ok(translated.name);
    assert.ok(translated.description);
  });
  questions.forEach((question) => {
    const translated = translations.ar.questions[question.id];
    assert.ok(translated.text);
    question.answers.forEach((answer) => assert.ok(translated.answers[answer.id]));
  });
});
