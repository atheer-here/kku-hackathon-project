const test = require("node:test");
const assert = require("node:assert/strict");
const { DEFAULT_DURATION, createAnalysisTimer } = require("../js/analysis-timer.js");

test("analysis timer completes once from an absolute deadline", () => {
  let clock = 1000;
  let scheduled;
  let cleared = false;
  let calls = 0;
  const timer = createAnalysisTimer({
    now: () => clock,
    setTimeout: (callback, wait) => { scheduled = { callback, wait }; return 7; },
    clearTimeout: (id) => { if (id === 7) cleared = true; }
  });

  const deadline = timer.start(undefined, () => { calls += 1; });
  assert.equal(deadline, 1000 + DEFAULT_DURATION);
  assert.equal(scheduled.wait, DEFAULT_DURATION);
  clock += 1500;
  assert.equal(timer.remaining(), DEFAULT_DURATION - 1500);
  assert.equal(Math.round(timer.progress() * 100), 25);
  assert.equal(timer.finish(), true);
  assert.equal(calls, 1);
  assert.equal(cleared, true);
  assert.equal(timer.finish(), false);
  assert.equal(calls, 1);
});

test("analysis timer respects an existing deadline and cancellation", () => {
  let clock = 2000;
  let callback;
  const timer = createAnalysisTimer({
    now: () => clock,
    setTimeout: (next) => { callback = next; return 3; },
    clearTimeout: () => {}
  });

  timer.start(3500, () => { throw new Error("cancelled timer should not finish"); });
  assert.equal(timer.remaining(), 1500);
  timer.cancel();
  assert.equal(timer.finish(), false);
  assert.equal(typeof callback, "function");
});
