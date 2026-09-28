const test = require("node:test");
const assert = require("node:assert/strict");
const sectors = require("../data/sectors.js");
const questions = require("../data/questions.js");
const { locales, translations, validateTranslations } = require("../data/translations.js");

const requiredUiKeys = [
  "skip", "brandKicker", "footer", "languageLabel", "themeToLight", "themeToDark",
  "welcomeTitle", "notice", "start", "privacy", "questionCount", "answerPrompt",
  "back", "next", "seeResult", "resultTitle", "scoreLabel", "jobsLabel", "tie",
  "chartTitle", "download", "downloading", "downloadFailure", "retry", "resultDisclaimer",
  "statusLanguage", "statusResult", "errorResult", "cardBrand", "cardMatch", "cardScore",
  "cardJobs", "cardDisclaimer", "cardFilename"
];

test("English and Arabic translation dictionaries cover the required interface copy", () => {
  assert.deepEqual(locales, ["en", "ar"]);
  locales.forEach((locale) => {
    requiredUiKeys.forEach((key) => {
      assert.equal(typeof translations[locale].ui[key], "string", `${locale}.${key} must be a string`);
      assert.ok(translations[locale].ui[key].trim(), `${locale}.${key} must not be blank`);
    });
  });
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
