(function () {
  const DEFAULT_DURATION = 6000;

  function createAnalysisTimer(options) {
    const settings = options || {};
    const now = settings.now || (() => Date.now());
    const setTimeoutFn = settings.setTimeout || setTimeout;
    const clearTimeoutFn = settings.clearTimeout || clearTimeout;
    let deadline = 0;
    let timeoutId = null;
    let completed = false;
    let onComplete = null;

    function remaining() {
      return Math.max(0, deadline - now());
    }

    function progress() {
      if (!deadline) return 0;
      return Math.min(1, Math.max(0, 1 - remaining() / DEFAULT_DURATION));
    }

    function finish() {
      if (completed) return false;
      completed = true;
      if (timeoutId !== null) clearTimeoutFn(timeoutId);
      timeoutId = null;
      if (onComplete) onComplete();
      return true;
    }

    function start(nextDeadline, callback) {
      if (timeoutId !== null) clearTimeoutFn(timeoutId);
      completed = false;
      deadline = nextDeadline || now() + DEFAULT_DURATION;
      onComplete = callback;
      timeoutId = setTimeoutFn(finish, remaining());
      return deadline;
    }

    function cancel() {
      if (timeoutId !== null) clearTimeoutFn(timeoutId);
      timeoutId = null;
      completed = true;
      onComplete = null;
    }

    return { start, cancel, finish, remaining, progress, get deadline() { return deadline; } };
  }

  const api = { DEFAULT_DURATION, createAnalysisTimer };
  if (typeof window !== "undefined") window.MassariAnalysisTimer = api;
  if (typeof module !== "undefined") module.exports = api;
})();
