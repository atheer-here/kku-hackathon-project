const test = require("node:test");
const assert = require("node:assert/strict");
const sectors = require("../data/sectors.js");
const questions = require("../data/questions.js");
const { validateData, calculateResult } = require("../js/quiz-engine.js");

const sectorAnswerIndices = {
  tourism: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  technology: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  health: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  finance: [0, 2, 1, 3, 0, 1, 2, 3, 1, 0],
  "culture-entertainment": [3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
};

function answersForSector(sectorId) {
  return Object.fromEntries(questions.map((question, index) => [question.id, question.answers[sectorAnswerIndices[sectorId][index]].id]));
}

test("data has five sectors and ten questions with three or four choices", () => {
  assert.equal(sectors.length, 5);
  assert.equal(questions.length, 10);
  questions.forEach((question) => assert.ok(question.answers.length >= 3 && question.answers.length <= 4));
  assert.equal(validateData(sectors, questions), true);
});

test("each sector can win", () => {
  sectors.forEach((sector) => {
    const result = calculateResult(sectors, questions, answersForSector(sector.id));
    assert.equal(result.winner.id, sector.id);
  });
});

test("all first answers favor Tourism", () => {
  const result = calculateResult(sectors, questions, answersForSector("tourism"));
  assert.equal(result.winner.id, "tourism");
});

test("all last answers favor Culture and Entertainment", () => {
  const result = calculateResult(sectors, questions, answersForSector("culture-entertainment"));
  assert.equal(result.winner.id, "culture-entertainment");
});

test("ties use declared sector order and explain why", () => {
  const scoreEverySector = Object.fromEntries(sectors.map((sector) => [sector.id, 1]));
  const tiedQuestions = questions.map((question) => ({
    ...question,
    answers: question.answers.map((answer) => ({ ...answer, scores: { ...scoreEverySector } }))
  }));
  const tiedAnswers = Object.fromEntries(tiedQuestions.map((question) => [question.id, question.answers[0].id]));
  const result = calculateResult(sectors, tiedQuestions, tiedAnswers);
  assert.equal(result.winner.id, "tourism");
  assert.equal(result.tiedSectorIds.length, 5);
  assert.match(result.tieMessage, /listed sector order/);
});

test("incomplete and invalid answers are rejected", () => {
  assert.throws(() => calculateResult(sectors, questions, {}), /Please answer/);
  const invalid = answersForSector("tourism");
  invalid[questions[0].id] = "missing";
  assert.throws(() => calculateResult(sectors, questions, invalid), /Invalid answer/);
});

test("scoring does not mutate the data or answers", () => {
  const snapshot = JSON.stringify({ sectors, questions });
  const answers = answersForSector("health");
  const answerSnapshot = JSON.stringify(answers);
  calculateResult(sectors, questions, answers);
  assert.equal(JSON.stringify({ sectors, questions }), snapshot);
  assert.equal(JSON.stringify(answers), answerSnapshot);
});
