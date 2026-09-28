const test = require("node:test");
const assert = require("node:assert/strict");
const E = require("../js/engine.js");
const T = E.TRAITS;
const lo = 0.1;
const prof = (k) => Object.fromEntries(T.map((t) => [t, t === k ? 1 : lo]));
const sectors = [
  { id: "a", traits: prof("ideas") }, { id: "b", traits: prof("hands") }, { id: "c", traits: prof("data") },
  { id: "d", traits: prof("hands") }, { id: "e", traits: prof("people") }, { id: "f", traits: prof("ideas") }
];
function questions() {
  const pairs = [["a", "b"], ["c", "d"], ["e", "f"]];
  return Array.from({ length: 12 }, (_, q) => {
    const absent = pairs[q % 3];
    const others = pairs.filter((p) => p !== absent);
    const extra = others[Math.floor(q / 3) % 2];
    const rest = others.find((p) => p !== extra);
    const answers = [
      { p: extra[0], s: extra[1] }, { p: extra[1], s: extra[0] },
      { p: rest[0], s: absent[0] }, { p: rest[1], s: absent[1] }
    ].map((x, i) => ({ id: `q${q}a${i}`, t: T[i], ...x }));
    return { id: `q${q}`, answers };
  });
}
const pick = (qs, fn) => Object.fromEntries(qs.map((q) => [q.id, (q.answers.find(fn) || q.answers[0]).id]));

test("balanced fixture validates and every max is 20", () => {
  assert.equal(E.validate(sectors, questions()), true);
  assert.deepEqual(Object.values(E.maxScores(sectors, questions())), [20, 20, 20, 20, 20, 20]);
});
test("validate rejects broken data", () => {
  const bad = (mut) => { const q = questions(); mut(q); return () => E.validate(sectors, q); };
  assert.throws(bad((q) => { q[0].answers[0].p = "zzz"; }));
  assert.throws(bad((q) => { q[0].answers[1].p = q[0].answers[0].p; }));
  assert.throws(bad((q) => { q[0].answers[0].s = q[0].answers[0].p; }));
  assert.throws(bad((q) => { q[0].answers[1].t = q[0].answers[0].t; }));
  assert.throws(bad((q) => { q[0].answers[0].t = "vibes"; }));
  assert.throws(bad((q) => { q[0].answers.pop(); }));
  assert.throws(bad((q) => { q.pop(); }), /max|balance/i);
});
test("perfect alignment gives 100%", () => {
  const qs = questions();
  const r = E.score(sectors, qs, pick(qs, (a) => a.p === "a" || a.s === "a"));
  // prefer primary when both exist in a question
  const r2 = E.score(sectors, qs, Object.fromEntries(qs.map((q) => [q.id, (q.answers.find((a) => a.p === "a") || q.answers.find((a) => a.s === "a")).id])));
  assert.equal(r2.scores.a, 20); assert.equal(r2.percents.a, 100); assert.equal(r2.winner, "a");
  assert.ok(r.scores.a >= 12);
});
test("ties break by trait similarity, then sector order", () => {
  const qs = questions();
  const r = E.score(sectors, qs, pick(qs, () => true)); // always first answer → a, c, e tie on 8, all traits "people"
  assert.equal(r.scores.a, 8); assert.equal(r.scores.c, 8); assert.equal(r.scores.e, 8);
  assert.equal(r.winner, "e"); assert.equal(r.runnerUp, "a");
  assert.equal(r.percents.e, 40);
  assert.deepEqual(r.traits, { people: 12, ideas: 0, data: 0, hands: 0 });
  assert.equal(r.traitPercents.people, 100);
  assert.deepEqual(r.ranked.slice(0, 3).map((x) => x.id), ["e", "a", "c"]);
  assert.ok(r.ranked[0].similarity > r.ranked[1].similarity);
});
test("why lists up to three winner-primary answers in question order", () => {
  const qs = questions();
  const r = E.score(sectors, qs, pick(qs, () => true));
  assert.deepEqual(r.why.map((w) => w.questionId), ["q3", "q4", "q9"]);
});
test("missing or invalid answers throw", () => {
  const qs = questions();
  const answers = pick(qs, () => true);
  delete answers.q5;
  assert.throws(() => E.score(sectors, qs, answers), /q5/);
  assert.throws(() => E.score(sectors, qs, { ...pick(qs, () => true), q0: "nope" }), /q0/);
});
