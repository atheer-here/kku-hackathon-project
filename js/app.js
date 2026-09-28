(function () {
  const app = document.getElementById("app");
  const liveStatus = document.getElementById("live-status");
  const skipLink = document.querySelector(".skip-link");
  const themeStorageKey = "vision-sector-theme";
  const languageStorageKey = "massari-language";
  const supportedLanguages = window.MASSARI_TRANSLATIONS.locales;
  const analysisTimer = window.MassariAnalysisTimer.createAnalysisTimer();
  let analysisFrame = null;
  let introTransition = null;
  const state = {
    view: "overview",
    questionIndex: 0,
    answers: {},
    result: null,
    language: document.documentElement.lang === "ar" ? "ar" : "en",
    analysis: { deadline: 0 }
  };

  const sunIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.75"></circle><path d="M12 2.5v2M12 19.5v2M5.28 5.28l1.42 1.42M17.3 17.3l1.42 1.42M2.5 12h2M19.5 12h2M5.28 18.72l1.42-1.42M17.3 6.7l1.42-1.42"></path></svg>';
  const moonIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 14.3A8.5 8.5 0 0 1 9.7 3.8 8.5 8.5 0 1 0 20.2 14.3Z"></path></svg>';
  const arrowIcon = '<svg class="direction-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"></path></svg>';
  const retryIcon = '<svg class="retry-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.35 5.66M20 5v6h-6"></path></svg>';
  const downloadIcon = '<svg class="download-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 17v3h14v-3"></path></svg>';
  const destinationIcon = '<svg class="destination-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8Z"></path></svg>';

  function announce(message) { liveStatus.textContent = message; }
  function setFocus(selector) { requestAnimationFrame(() => { const element = app.querySelector(selector); if (element) element.focus({ preventScroll: false }); }); }
  function esc(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]); }
  function currentTheme() { return document.documentElement.dataset.theme === "dark" ? "dark" : "light"; }
  function currentLanguage() { return state.language; }
  function copy() { return window.MASSARI_TRANSLATIONS.translations[currentLanguage()]; }
  function t(key, values) {
    let text = window.MASSARI_TRANSLATIONS.getPath(copy().ui, key) || window.MASSARI_TRANSLATIONS.getPath(window.MASSARI_TRANSLATIONS.translations.en.ui, key) || key;
    Object.entries(values || {}).forEach(([name, value]) => { text = text.replaceAll(`{${name}}`, String(value)); });
    return text;
  }
  function formatNumber(value) { return new Intl.NumberFormat(currentLanguage()).format(value); }
  function localizeSector(sector) { return currentLanguage() === "ar" ? { ...sector, ...copy().sectors[sector.id] } : sector; }
  function localizeQuestion(question) {
    if (currentLanguage() !== "ar") return question;
    const translated = copy().questions[question.id];
    return { ...question, text: translated.text, answers: question.answers.map((answer) => ({ ...answer, label: translated.answers[answer.id] })) };
  }
  function updateDocumentCopy() {
    const metaDescription = document.querySelector('meta[name="description"]');
    document.title = copy().meta.title;
    if (metaDescription) metaDescription.content = copy().meta.description;
    skipLink.textContent = t("skip");
  }
  function setTheme(theme, announceChange) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem(themeStorageKey, theme); } catch (error) { /* Appearance still works without storage. */ }
    if (announceChange) { renderCurrentView(); announce(theme === "dark" ? t("themeDarkSelected") : t("themeLightSelected")); setFocus("#theme-toggle"); }
  }
  function setLanguage(language) {
    if (!supportedLanguages.includes(language) || language === currentLanguage()) return;
    state.language = language;
    document.documentElement.dataset.language = language;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem(languageStorageKey, language); } catch (error) { /* Language still works without storage. */ }
    updateDocumentCopy(); renderCurrentView(); announce(t("statusLanguage")); setFocus(language === "ar" ? "#language-toggle-ar" : "#language-toggle-en");
  }
  function renderLogo() { return `<div class="brand-identity"><span class="brand-mark">${window.MassariVisuals.logo()}</span><div class="brand-copy"><strong lang="ar" dir="rtl">مساري</strong><span aria-hidden="true">|</span><strong>Massari</strong><p class="eyebrow">${esc(t("brandKicker"))}</p></div></div>`; }
  function renderThemeToggle() {
    const isDark = currentTheme() === "dark";
    return `<button class="theme-toggle" id="theme-toggle" type="button" aria-label="${esc(isDark ? t("themeToLight") : t("themeToDark"))}" aria-pressed="${isDark}"><span class="theme-toggle-icon">${isDark ? sunIcon : moonIcon}</span><span class="theme-toggle-label">${esc(isDark ? t("themeLight") : t("themeDark"))}</span></button>`;
  }
  function renderLanguageToggle() { return `<div class="language-toggle" role="group" aria-label="${esc(t("languageLabel"))}"><button id="language-toggle-en" type="button" data-language="en" aria-pressed="${currentLanguage() === "en"}" lang="en">English</button><button id="language-toggle-ar" type="button" data-language="ar" aria-pressed="${currentLanguage() === "ar"}" lang="ar" dir="rtl">العربية</button></div>`; }
  function renderConnections() { return `<svg class="connection-field" viewBox="0 0 1100 760" preserveAspectRatio="none" aria-hidden="true"><path class="connection-line line-a" d="M-30 158C180 61 228 285 415 198s197-193 380-82 158 79 340-75"/><path class="connection-line line-b" d="M-20 600c181-95 267 70 438-18 166-85 173-247 360-154 120 59 183 65 353-6"/><path class="connection-line line-c" d="M110 745c53-167 188-131 286-225 106-102 210-51 281-179"/><g class="connection-node node-teal"><circle cx="415" cy="198" r="7"/><circle cx="415" cy="198" r="15"/></g><g class="connection-node node-blue"><circle cx="778" cy="446" r="7"/><circle cx="778" cy="446" r="15"/></g><g class="connection-node node-gold"><circle cx="916" cy="95" r="7"/><circle cx="916" cy="95" r="15"/></g></svg>`; }
  function renderLayout(content, className) {
    app.innerHTML = `${renderConnections()}<div class="backdrop-node backdrop-node-a" aria-hidden="true"></div><div class="backdrop-node backdrop-node-b" aria-hidden="true"></div><section class="quiz-frame ${className || ""}" aria-labelledby="page-title"><header class="brand-row">${renderLogo()}<div class="header-actions">${renderLanguageToggle()}${renderThemeToggle()}</div></header>${content}<footer class="quiz-footer">${esc(t("footer"))}</footer></section>`;
    app.querySelector("#theme-toggle").addEventListener("click", () => setTheme(currentTheme() === "dark" ? "light" : "dark", true));
    app.querySelectorAll(".language-toggle button").forEach((button) => button.addEventListener("click", (event) => setLanguage(event.currentTarget.dataset.language)));
  }
  function reducedMotion() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function clearIntroTransition() { if (introTransition) { window.clearTimeout(introTransition); introTransition = null; } }
  function stopAnalysisUpdates() { if (analysisFrame) { cancelAnimationFrame(analysisFrame); analysisFrame = null; } }
  function cancelAnalysis() { stopAnalysisUpdates(); analysisTimer.cancel(); state.analysis.deadline = 0; }
  function resetQuiz() { cancelAnalysis(); state.questionIndex = 0; state.answers = {}; state.result = null; }

  function renderOverview() {
    renderLayout(`<section class="intro-screen overview-screen" aria-labelledby="page-title"><div class="intro-copy intro-copy-centered"><span class="mini-tag"><span class="tag-node" aria-hidden="true"></span>${esc(t("overviewEyebrow"))}</span><h1 id="page-title" tabindex="-1">${esc(t("overviewTitle"))}</h1><p class="lead">${esc(t("overviewLead"))}</p><p class="intro-support"><span aria-hidden="true">✦</span>${esc(t("overviewSupport"))}</p><button class="button button-primary button-wide" id="overview-start" type="button">${esc(t("overviewStart"))}${arrowIcon}</button><p class="intro-disclaimer">${esc(t("overviewDisclaimer"))}</p></div><div class="intro-art overview-art">${window.MassariVisuals.startingPointScene("starting-scene")}</div></section>`, "has-intro");
    app.querySelector("#overview-start").addEventListener("click", () => {
      clearIntroTransition();
      const frame = app.querySelector(".quiz-frame");
      if (reducedMotion()) { state.view = "path"; renderPath(); setFocus("#page-title"); return; }
      frame.classList.add("is-leaving-forward");
      introTransition = window.setTimeout(() => { state.view = "path"; renderPath(); setFocus("#page-title"); introTransition = null; }, 680);
    });
  }
  function renderPath() {
    renderLayout(`<section class="intro-screen path-explanation" aria-labelledby="page-title"><div class="intro-copy intro-copy-centered"><span class="mini-tag"><span class="tag-node" aria-hidden="true"></span>${esc(t("pathEyebrow"))}</span><h1 id="page-title" tabindex="-1">${esc(t("pathTitle"))}</h1><p class="lead">${esc(t("pathLead"))}</p><p class="path-notice">${esc(t("pathNotice"))}</p><div class="intro-actions"><button class="button button-secondary button-back" id="path-back" type="button">${arrowIcon}${esc(t("pathBack"))}</button><button class="button button-primary" id="path-start" type="button">${esc(t("pathStart"))}${arrowIcon}</button></div></div><div class="intro-art path-art">${window.MassariVisuals.pathScene("path-scene")}</div></section>`, "has-intro");
    app.querySelector("#path-back").addEventListener("click", () => { state.view = "overview"; renderOverview(); setFocus("#page-title"); });
    app.querySelector("#path-start").addEventListener("click", () => { resetQuiz(); state.view = "question"; renderQuestion(); announce(t("statusStart", { total: formatNumber(window.QUESTION_DATA.length) })); setFocus("#question-title"); });
  }
  function renderQuestion() {
    const baseQuestion = window.QUESTION_DATA[state.questionIndex];
    const question = localizeQuestion(baseQuestion);
    const total = window.QUESTION_DATA.length;
    const selected = state.answers[baseQuestion.id];
    const isFinal = state.questionIndex === total - 1;
    const progress = Math.round(((state.questionIndex + 1) / total) * 100);
    const answersMarkup = question.answers.map((answer, index) => {
      const checked = selected === answer.id ? "checked" : "";
      return `<label class="answer-option ${checked ? "is-selected" : ""}"><input type="radio" name="${esc(baseQuestion.id)}" value="${esc(answer.id)}" ${checked}><span class="answer-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span><span class="answer-label">${esc(answer.label)}</span><span class="answer-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4.3 4.3L19 6.7"></path></svg></span></label>`;
    }).join("");
    renderLayout(`<div class="quiz-header"><div><p class="eyebrow">${esc(t("questionKicker", { current: formatNumber(state.questionIndex + 1), total: formatNumber(total) }))}</p><h1 id="page-title" class="page-title-small">${esc(t("questionTitle"))}</h1></div><p class="question-count"><span class="count-node" aria-hidden="true"></span>${esc(t("questionCount", { current: formatNumber(state.questionIndex + 1), total: formatNumber(total) }))}</p></div><div class="progress-track" role="progressbar" aria-label="${esc(t("progressLabel"))}" aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="${state.questionIndex + 1}" aria-valuetext="${esc(t("progressText", { current: formatNumber(state.questionIndex + 1), total: formatNumber(total) }))}"><div class="progress-bar" style="--progress:${progress / 100}"></div></div><section class="question-panel" aria-labelledby="question-title"><p class="section-kicker">${esc(t("answerPrompt"))}</p><fieldset><legend id="question-title" tabindex="-1">${esc(question.text)}</legend><div class="answer-list">${answersMarkup}</div></fieldset><div class="nav-row">${state.questionIndex > 0 ? `<button class="button button-secondary button-back" id="back-button" type="button">${arrowIcon}${esc(t("back"))}</button>` : "<span></span>"}<button class="button button-primary" id="next-button" type="button" ${selected ? "" : "disabled"}>${esc(isFinal ? t("seeResult") : t("next"))}${arrowIcon}</button></div></section>`);
    app.querySelectorAll("input[type=radio]").forEach((input) => input.addEventListener("change", (event) => { state.answers[baseQuestion.id] = event.target.value; app.querySelectorAll(".answer-option").forEach((option) => option.classList.toggle("is-selected", option.contains(event.target))); app.querySelector("#next-button").disabled = false; announce(t("statusAnswer")); }));
    const backButton = app.querySelector("#back-button");
    if (backButton) backButton.addEventListener("click", () => { state.questionIndex -= 1; renderQuestion(); announce(t("statusQuestion", { current: formatNumber(state.questionIndex + 1), total: formatNumber(total) })); setFocus("#question-title"); });
    app.querySelector("#next-button").addEventListener("click", () => {
      if (!state.answers[baseQuestion.id]) return;
      if (!isFinal) { state.questionIndex += 1; renderQuestion(); announce(t("statusQuestion", { current: formatNumber(state.questionIndex + 1), total: formatNumber(total) })); setFocus("#question-title"); return; }
      try {
        state.result = window.QuizEngine.calculateResult(window.SECTOR_DATA, window.QUESTION_DATA, state.answers);
        state.view = "analysis";
        state.analysis.deadline = Date.now() + window.MassariAnalysisTimer.DEFAULT_DURATION;
        renderAnalysis(); announce(t("statusAnalysis")); setFocus("#page-title");
      } catch (error) { console.error(error); announce(t("errorResult")); }
    });
  }
  function analysisStage(progress) { return Math.min(3, Math.floor(progress * 4)); }
  function completeAnalysis() {
    if (state.view !== "analysis" || !state.result) return;
    stopAnalysisUpdates(); state.analysis.deadline = 0; state.view = "result"; renderResult(); announce(t("statusResult", { sector: localizeSector(state.result.winner).name })); setFocus("#page-title");
  }
  function updateAnalysisView() {
    if (state.view !== "analysis") return;
    const progress = analysisTimer.progress();
    const current = Math.round(progress * 100);
    const stage = analysisStage(progress);
    const bar = app.querySelector("#analysis-progress-bar");
    const progressbar = app.querySelector("#analysis-progress");
    const stageText = app.querySelector("#analysis-stage");
    const route = app.querySelector(".analysis-route-progress");
    const nodes = app.querySelectorAll(".analysis-node");
    if (bar) bar.style.setProperty("--analysis-progress", progress);
    if (route) route.style.setProperty("--analysis-progress", progress);
    if (progressbar) { progressbar.setAttribute("aria-valuenow", String(current)); progressbar.setAttribute("aria-valuetext", t("analysisProgressText", { current: formatNumber(current) })); }
    if (stageText) { const text = t(`analysisStage${stage + 1}`); if (stageText.dataset.stage !== String(stage)) { stageText.dataset.stage = String(stage); stageText.textContent = text; if (stage > 0) announce(text); } }
    nodes.forEach((node, index) => node.classList.toggle("is-lit", index / Math.max(nodes.length - 1, 1) <= progress));
    if (progress < 1) analysisFrame = requestAnimationFrame(updateAnalysisView);
  }
  function renderAnalysis() {
    const progress = state.analysis.deadline ? Math.max(0, Math.min(1, 1 - Math.max(0, state.analysis.deadline - Date.now()) / window.MassariAnalysisTimer.DEFAULT_DURATION)) : 0;
    const stage = analysisStage(progress);
    const scoreMax = Math.max(...Object.values(state.result.scores), 1);
    const nodes = window.SECTOR_DATA.map((sector, index) => `<span class="analysis-node ${index / 4 <= progress ? "is-lit" : ""}" style="--node-strength:${Math.max(.3, state.result.scores[sector.id] / scoreMax)}"><span class="sr-only">${esc(localizeSector(sector).name)}</span></span>`).join("");
    renderLayout(`<section class="analysis-screen" aria-labelledby="page-title" aria-busy="true"><div class="analysis-copy"><p class="eyebrow">${esc(t("analysisEyebrow"))}</p><h1 id="page-title" tabindex="-1">${esc(t("analysisTitle"))}</h1><p class="lead">${esc(t("analysisLead"))}</p></div><div class="analysis-visual" aria-hidden="true"><div class="analysis-constellation">${nodes}</div><svg viewBox="0 0 560 210" class="analysis-route" preserveAspectRatio="none"><path class="analysis-route-base" d="M36 164C118 159 124 69 215 88s80 92 154 60c75-32 80-106 153-104"/><path class="analysis-route-progress" d="M36 164C118 159 124 69 215 88s80 92 154 60c75-32 80-106 153-104" style="--analysis-progress:${progress}"/></svg></div><p id="analysis-stage" class="analysis-stage" data-stage="${stage}">${esc(t(`analysisStage${stage + 1}`))}</p><div id="analysis-progress" class="analysis-progress" role="progressbar" aria-label="${esc(t("analysisProgressLabel"))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress * 100)}" aria-valuetext="${esc(t("analysisProgressText", { current: formatNumber(Math.round(progress * 100)) }))}"><div id="analysis-progress-bar" class="analysis-progress-bar" style="--analysis-progress:${progress}"></div></div><button class="button button-secondary analysis-skip" id="analysis-skip" type="button">${esc(t("analysisSkip"))}</button></section>`, "has-analysis");
    stopAnalysisUpdates();
    analysisTimer.start(state.analysis.deadline, completeAnalysis);
    if (analysisTimer.remaining() === 0) { analysisTimer.finish(); return; }
    analysisFrame = requestAnimationFrame(updateAnalysisView);
    app.querySelector("#analysis-skip").addEventListener("click", () => { analysisTimer.finish(); });
  }
  function renderChart(result) {
    const maxScore = Math.max(...Object.values(result.scores), 1);
    return `<section class="score-chart viz-root" aria-labelledby="chart-title"><div class="chart-heading"><div><p class="section-kicker">${esc(t("chartKicker"))}</p><h2 id="chart-title">${esc(t("chartTitle"))}</h2></div><span class="score-key">${esc(t("points"))}</span></div><div class="chart-rows">${window.SECTOR_DATA.map((sector) => { const score = result.scores[sector.id]; const width = Math.max(score > 0 ? 8 : 0, (score / maxScore) * 100); const localized = localizeSector(sector); const isWinner = sector.id === result.winner.id; const winnerContext = isWinner ? ` — ${t("resultTag")}` : ""; return `<div class="chart-row ${isWinner ? "is-winner" : ""}" data-sector="${sector.id}" aria-label="${esc(`${localized.name}: ${formatNumber(score)} ${t("points")}${winnerContext}`)}"><div class="chart-label"><span class="chart-dot"></span><span>${esc(localized.name)}</span>${isWinner ? `<span class="chart-winner-mark" aria-hidden="true">${destinationIcon}</span>` : ""}</div><div class="chart-track" aria-hidden="true"><div class="chart-fill" style="--chart-progress:${width / 100}"></div></div><strong>${formatNumber(score)}<span> ${esc(t("points"))}</span></strong></div>`; }).join("")}</div><p class="chart-summary">${t("chartSummary", { score: formatNumber(result.topScore), sector: esc(localizeSector(result.winner).name) })}</p></section>`;
  }
  function renderResult() {
    const { winner, topScore, tiedSectorIds } = state.result;
    const localizedWinner = localizeSector(winner);
    renderLayout(`<div class="result-intro"><span class="mini-tag"><span class="tag-node" aria-hidden="true"></span>${esc(t("resultTag"))}</span><h1 id="page-title" tabindex="-1">${esc(t("resultTitle"))}</h1><p>${esc(t("resultLead"))}</p></div><article class="result-card is-winner" data-sector="${winner.id}"><div class="result-art" aria-hidden="true"><div class="result-ring"></div>${window.MassariVisuals.sectorScene(winner.id, "result-scene")}</div><div class="result-details"><p class="section-kicker">${esc(t("resultKicker"))}</p><h2>${esc(localizedWinner.name)}</h2><p class="result-description">${esc(localizedWinner.description)}</p><div class="result-score"><span>${esc(t("scoreLabel"))}</span><strong>${formatNumber(topScore)}<small> ${esc(t("points"))}</small></strong></div></div><div class="jobs-panel"><p>${esc(t("jobsLabel"))}</p><ul>${localizedWinner.jobs.map((job) => `<li>${esc(job)}</li>`).join("")}</ul></div></article>${tiedSectorIds.length > 1 ? `<p class="tie-note" role="note">${esc(t("tie"))}</p>` : ""}${renderChart(state.result)}<div class="result-actions"><button class="button button-primary" id="download-button" type="button">${esc(t("download"))}${downloadIcon}</button><button class="button button-secondary" id="retry-button" type="button">${esc(t("retry"))}${retryIcon}</button></div><p class="result-disclaimer">${esc(t("resultDisclaimer"))}</p>`);
    app.querySelector("#retry-button").addEventListener("click", () => { resetQuiz(); state.view = "overview"; renderOverview(); announce(t("statusReset")); setFocus("#page-title"); });
    app.querySelector("#download-button").addEventListener("click", async (event) => {
      const button = event.currentTarget; button.disabled = true; button.setAttribute("aria-busy", "true"); button.textContent = t("downloading");
      try { await window.downloadResultCard(state.result, { language: currentLanguage(), copy: copy(), sector: localizedWinner }); button.innerHTML = `${esc(t("downloaded"))} <span aria-hidden="true">✓</span>`; announce(t("statusDownloaded")); }
      catch (error) { console.error(error); button.textContent = t("downloadFailure"); announce(error.message || t("errorDownload")); }
      setTimeout(() => { button.disabled = false; button.removeAttribute("aria-busy"); button.innerHTML = `${esc(t("download"))}${downloadIcon}`; }, 1600);
    });
  }
  function renderCurrentView() {
    clearIntroTransition();
    if (state.view === "question") renderQuestion();
    else if (state.view === "analysis" && state.result) renderAnalysis();
    else if (state.view === "result" && state.result) renderResult();
    else if (state.view === "path") renderPath();
    else renderOverview();
  }

  window.QuizEngine.validateData(window.SECTOR_DATA, window.QUESTION_DATA);
  window.MASSARI_TRANSLATIONS.validateTranslations(window.SECTOR_DATA, window.QUESTION_DATA);
  updateDocumentCopy(); setTheme(currentTheme()); renderCurrentView();
})();
