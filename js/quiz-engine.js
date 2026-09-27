(function () {
  function validateData(sectors, questions) {
    if (!Array.isArray(sectors) || sectors.length !== 5) throw new Error("Expected exactly five sectors.");
    if (!Array.isArray(questions) || questions.length !== 10) throw new Error("Expected exactly ten questions.");

    const sectorIds = new Set(sectors.map((sector) => sector.id));
    if (sectorIds.size !== sectors.length) throw new Error("Sector IDs must be unique.");

    questions.forEach((question) => {
      if (!question.id || !question.text || !Array.isArray(question.answers) || question.answers.length < 3 || question.answers.length > 5) {
        throw new Error(`Question ${question.id || "unknown"} is invalid.`);
      }
      const answerIds = new Set();
      question.answers.forEach((answer) => {
        if (!answer.id || !answer.label || !answer.scores || typeof answer.scores !== "object") {
          throw new Error(`Answer in ${question.id} is invalid.`);
        }
        if (answerIds.has(answer.id)) throw new Error(`Answer IDs in ${question.id} must be unique.`);
        answerIds.add(answer.id);
        Object.keys(answer.scores).forEach((sectorId) => {
          if (!sectorIds.has(sectorId) || !Number.isFinite(answer.scores[sectorId])) {
            throw new Error(`Invalid scoring reference in ${question.id}.`);
          }
        });
      });
    });
    return true;
  }

  function createScores(sectors) {
    return Object.fromEntries(sectors.map((sector) => [sector.id, 0]));
  }

  function calculateResult(sectors, questions, answers) {
    validateData(sectors, questions);
    if (!answers || typeof answers !== "object") throw new Error("Answers are required.");

    const scores = createScores(sectors);
    questions.forEach((question) => {
      const selectedId = answers[question.id];
      if (!selectedId) throw new Error(`Please answer: ${question.id}.`);
      const selectedAnswer = question.answers.find((answer) => answer.id === selectedId);
      if (!selectedAnswer) throw new Error(`Invalid answer for: ${question.id}.`);
      Object.entries(selectedAnswer.scores).forEach(([sectorId, points]) => {
        scores[sectorId] += points;
      });
    });

    const ranked = sectors
      .map((sector, index) => ({ sector, score: scores[sector.id], index }))
      .sort((a, b) => b.score - a.score || a.index - b.index);
    const topScore = ranked[0].score;
    const tiedSectorIds = ranked.filter((entry) => entry.score === topScore).map((entry) => entry.sector.id);
    const winner = ranked[0].sector;

    return {
      scores,
      ranked,
      winner,
      topScore,
      tiedSectorIds,
      tieMessage: tiedSectorIds.length > 1
        ? `${winner.name} was selected from a tied top score using the quiz's listed sector order.`
        : ""
    };
  }

  const api = { validateData, createScores, calculateResult };
  if (typeof window !== "undefined") window.QuizEngine = api;
  if (typeof module !== "undefined") module.exports = api;
})();
