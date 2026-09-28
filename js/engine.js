/* Massari engine: pure scoring + validation. Classic script (works under file://) and Node module. */
(function (root) {
  "use strict";

  var TRAITS = ["people", "ideas", "data", "hands"];
  var P = 2; // primary sector points
  var S = 1; // secondary sector points

  function fail(msg) { throw new Error("MassariEngine: " + msg); }

  function unique(list) { return new Set(list).size === list.length; }

  function maxScores(sectors, questions) {
    var max = {};
    sectors.forEach(function (sec) {
      max[sec.id] = questions.reduce(function (sum, q) {
        return sum + Math.max.apply(null, q.answers.map(function (a) {
          return a.p === sec.id ? P : a.s === sec.id ? S : 0;
        }));
      }, 0);
    });
    return max;
  }

  function validate(sectors, questions) {
    if (!Array.isArray(sectors) || !sectors.length) fail("sectors must be a non-empty array");
    if (!Array.isArray(questions) || !questions.length) fail("questions must be a non-empty array");
    var ids = sectors.map(function (s) { return s.id; });
    if (!unique(ids)) fail("sector ids must be unique");
    questions.forEach(function (q, qi) {
      if (!q || !q.id) fail("question #" + qi + " has no id");
      var as = q.answers;
      if (!Array.isArray(as) || as.length !== 4) fail("question " + q.id + " must have exactly 4 answers");
      if (!unique(as.map(function (a) { return a.id; }))) fail("question " + q.id + " has duplicate answer ids");
      as.forEach(function (a) {
        if (!a.id) fail("question " + q.id + " has an answer without id");
        if (ids.indexOf(a.p) < 0) fail("answer " + a.id + " in " + q.id + " has unknown p '" + a.p + "'");
        if (ids.indexOf(a.s) < 0) fail("answer " + a.id + " in " + q.id + " has unknown s '" + a.s + "'");
        if (a.s === a.p) fail("answer " + a.id + " in " + q.id + " has s equal to p");
        if (TRAITS.indexOf(a.t) < 0) fail("answer " + a.id + " in " + q.id + " has unknown trait '" + a.t + "'");
      });
      if (!unique(as.map(function (a) { return a.p; }))) fail("question " + q.id + " repeats a primary sector");
      if (!unique(as.map(function (a) { return a.t; }))) fail("question " + q.id + " repeats a trait");
    });
    var max = maxScores(sectors, questions);
    var vals = ids.map(function (id) { return max[id]; });
    if (!vals.every(function (v) { return v === vals[0]; })) {
      fail("max scores out of balance: " + JSON.stringify(max));
    }
    return true;
  }

  function cosine(a, b) {
    var dot = 0, na = 0, nb = 0;
    TRAITS.forEach(function (t) {
      var x = a[t] || 0, y = b[t] || 0;
      dot += x * y; na += x * x; nb += y * y;
    });
    return na && nb ? dot / Math.sqrt(na * nb) : 0;
  }

  function score(sectors, questions, answers) {
    answers = answers || {};
    var scores = {}, traits = {}, chosen = [];
    sectors.forEach(function (s) { scores[s.id] = 0; });
    TRAITS.forEach(function (t) { traits[t] = 0; });

    questions.forEach(function (q) {
      var aid = answers[q.id];
      if (aid == null) fail("missing answer for question " + q.id);
      var a = q.answers.find(function (x) { return x.id === aid; });
      if (!a) fail("invalid answer '" + aid + "' for question " + q.id);
      scores[a.p] += P;
      scores[a.s] += S;
      traits[a.t] += 1;
      chosen.push({ q: q, a: a });
    });

    var max = maxScores(sectors, questions);
    var percents = {}, traitPercents = {};
    var ranked = sectors.map(function (s, i) {
      percents[s.id] = max[s.id] ? Math.round(scores[s.id] / max[s.id] * 100) : 0;
      return { id: s.id, score: scores[s.id], percent: percents[s.id], similarity: cosine(traits, s.traits || {}), order: i };
    });
    ranked.sort(function (x, y) {
      return (y.score - x.score) || (y.similarity - x.similarity) || (x.order - y.order);
    });
    ranked.forEach(function (r) { delete r.order; });
    TRAITS.forEach(function (t) { traitPercents[t] = Math.round(traits[t] / questions.length * 100); });

    var winner = ranked[0].id;
    var why = chosen.filter(function (c) { return c.a.p === winner; })
      .concat(chosen.filter(function (c) { return c.a.s === winner; }))
      .slice(0, 3)
      .map(function (c) { return { questionId: c.q.id, answerId: c.a.id }; });

    return {
      scores: scores, percents: percents, traits: traits, traitPercents: traitPercents,
      ranked: ranked, winner: winner, runnerUp: ranked[1] ? ranked[1].id : null, why: why
    };
  }

  var api = { TRAITS: TRAITS, validate: validate, maxScores: maxScores, score: score };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.MassariEngine = api;
})(typeof window !== "undefined" ? window : null);
