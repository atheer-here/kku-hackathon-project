const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const sectors = require("../data/sectors.js");
const questions = require("../data/questions.js");
const sample = require("../sample-data/data.js");
const engine = require("../js/engine.js");
const AR = /[؀-ۿ]/;
const IDS = ["tourism", "technology", "health", "finance", "culture", "energy"];
const bi = (o, where) => { assert.ok(o && o.en && o.en.trim() && o.ar && o.ar.trim(), `missing text: ${where}`); assert.match(o.ar, AR, `arabic script: ${where}`); };

test("six sectors in fixed order with full bilingual content", () => {
  assert.deepEqual(sectors.map((s) => s.id), IDS);
  for (const s of sectors) {
    ["name", "tagline", "description"].forEach((k) => bi(s[k], `${s.id}.${k}`));
    assert.equal(s.roles.length, 3); s.roles.forEach((r, i) => bi(r, `${s.id}.roles.${i}`));
    assert.equal(s.skills.length, 3); s.skills.forEach((r, i) => bi(r, `${s.id}.skills.${i}`));
    assert.ok(fs.existsSync(path.join(__dirname, "..", s.photo.file)), `photo exists: ${s.photo.file}`);
    bi(s.photo.alt, `${s.id}.photo.alt`);
    assert.ok(s.photo.credit.author && s.photo.credit.license && s.photo.credit.source);
    for (const t of engine.TRAITS) assert.ok(s.traits[t] >= 0 && s.traits[t] <= 1);
  }
});

test("twelve questions pass engine validation and exact balance", () => {
  assert.equal(questions.length, 12);
  engine.validate(sectors, questions);
  const p = {}, s = {};
  questions.forEach((q) => q.answers.forEach((a) => { p[a.p] = (p[a.p] || 0) + 1; s[a.s] = (s[a.s] || 0) + 1; }));
  IDS.forEach((id) => { assert.equal(p[id], 8, `${id} primary`); assert.equal(s[id], 8, `${id} secondary`); });
  Object.values(engine.maxScores(sectors, questions)).forEach((m) => assert.equal(m, 20));
});

test("copy lengths and no sector giveaways", () => {
  const giveaway = /\b(touris\w*|tech\w*|health\w*|medic\w*|financ\w*|bank\w*|cultur\w*|energ\w*|solar)\b/i;
  const arNames = sectors.map((x) => x.name.ar);
  questions.forEach((q) => {
    bi(q.prompt, `${q.id}.prompt`); bi(q.theme, `${q.id}.theme`);
    assert.ok(q.prompt.en.length <= 110, `${q.id} prompt length`);
    q.answers.forEach((a) => {
      ["label", "whisper", "signal"].forEach((k) => bi(a[k], `${q.id}.${a.id}.${k}`));
      assert.ok(a.label.en.length <= 60, `${q.id}.${a.id} label length ${a.label.en.length}`);
      assert.ok(a.whisper.en.length <= 36, `${q.id}.${a.id} whisper length`);
      assert.doesNotMatch(a.label.en, giveaway, `${q.id}.${a.id} names a sector`);
      arNames.forEach((n) => assert.ok(!a.label.ar.includes(n), `${q.id}.${a.id} names ${n}`));
      assert.match(a.icon, /^[a-z0-9-]+$/);
    });
  });
});

test("arabic content is gender-neutral toward the user", () => {
  const banned = ["اكتشف", "اختر", "ابدأ", "أجب", "انقر", "اضغط", "تعرّف", "تعرف"];
  const texts = [];
  sectors.forEach((s) => ["name", "tagline", "description"].forEach((k) => texts.push(s[k].ar)));
  questions.forEach((q) => { texts.push(q.prompt.ar); q.answers.forEach((a) => texts.push(a.label.ar, a.whisper.ar, a.signal.ar)); });
  texts.forEach((txt) => { const words = txt.split(/[\s،.؟!:«»"()\-–—]+/); banned.forEach((b) => assert.ok(!words.includes(b), `"${b}" in: ${txt}`)); });
});

test("sample answers are a complete valid set", () => {
  const r = engine.score(sectors, questions, sample.answers);
  assert.ok(IDS.includes(r.winner));
});
