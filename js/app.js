(function () {
  const app = document.getElementById("app");
  const liveStatus = document.getElementById("live-status");
  const state = { view: "welcome", questionIndex: 0, answers: {}, result: null };
  const sectorIcons = {
    compass: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="m24 7 13 13-13 14L11 20 24 7Z"/><path d="m24 20 6 6"/></svg>',
    spark: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="m24 5 4 14 14 5-14 5-4 14-5-14-14-5 14-5 5-14Z"/></svg>',
    heart: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 40S7 30 7 17c0-5 4-9 9-9 4 0 7 2 8 6 1-4 4-6 8-6 5 0 9 4 9 9 0 13-17 23-17 23Z"/></svg>',
    chart: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 39V26h9v13M20 39V15h9v24M32 39V7h9v32"/></svg>',
    star: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="m24 6 5 12 13 1-10 9 3 14-11-7-11 7 3-14-10-9 13-1 5-12Z"/></svg>'
  };

  function announce(message) { liveStatus.textContent = message; }
  function setFocus(selector) {
    requestAnimationFrame(() => {
      const element = app.querySelector(selector);
      if (element) element.focus({ preventScroll: false });
    });
  }
  function esc(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }
  function icon(sector, className = "sector-icon") {
    return `<span class="${className}" style="--sector-color: ${sector.color}">${sectorIcons[sector.icon]}</span>`;
  }
  function renderLayout(content) {
    app.innerHTML = `
      <div class="backdrop-shape shape-one" aria-hidden="true"></div>
      <div class="backdrop-shape shape-two" aria-hidden="true"></div>
      <section class="quiz-frame" aria-labelledby="page-title">
        <header class="brand-row">
          <div class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></div>
          <p class="eyebrow">VISION 2030 · CAREER EXPLORER</p>
        </header>
        ${content}
        <footer class="quiz-footer">A light, illustrative reflection—not an official assessment or career recommendation.</footer>
      </section>`;
  }

  function renderWelcome() {
    state.view = "welcome";
    renderLayout(`
      <div class="intro-layout">
        <div class="intro-copy">
          <span class="mini-tag">10 thoughtful questions</span>
          <h1 id="page-title" tabindex="-1">Which sector <em>suits you?</em></h1>
          <p class="lead">Explore the kind of work and impact that energizes you, then meet an illustrative sector match.</p>
          <div class="notice" role="note">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 10v6M12 7h.01"></path></svg>
            <p>This quiz uses neutral example descriptions and jobs. You can replace its content later—it is not official Vision 2030 guidance.</p>
          </div>
          <button class="button button-primary button-wide" id="start-button" type="button">Start the quiz <span aria-hidden="true">→</span></button>
          <p class="privacy-note">Your choices stay in this browser tab. Nothing is saved or sent.</p>
        </div>
        <div class="hero-art" aria-hidden="true">
          <div class="art-orbit orbit-a"></div><div class="art-orbit orbit-b"></div>
          <div class="art-card art-card-main"><span class="art-card-label">YOUR PATH</span><strong>Start<br>exploring</strong><i></i></div>
          <div class="art-chip chip-a">01</div><div class="art-chip chip-b">10</div>
          <svg class="art-lines" viewBox="0 0 370 340"><path d="M20 253C75 180 110 278 174 212s68-118 164-112"/><circle cx="174" cy="212" r="7"/><circle cx="338" cy="100" r="7"/></svg>
        </div>
      </div>`);
    app.querySelector("#start-button").addEventListener("click", () => {
      state.view = "question";
      state.questionIndex = 0;
      renderQuestion();
      announce("Quiz started. Question 1 of 10.");
      setFocus("#question-title");
    });
    setFocus("#page-title");
  }

  function renderQuestion() {
    state.view = "question";
    const question = window.QUESTION_DATA[state.questionIndex];
    const total = window.QUESTION_DATA.length;
    const selected = state.answers[question.id];
    const isFinal = state.questionIndex === total - 1;
    const progress = Math.round(((state.questionIndex + 1) / total) * 100);
    const answersMarkup = question.answers.map((answer, index) => {
      const checked = selected === answer.id ? "checked" : "";
      return `<label class="answer-option ${checked ? "is-selected" : ""}">
        <input type="radio" name="${esc(question.id)}" value="${esc(answer.id)}" ${checked}>
        <span class="answer-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
        <span class="answer-label">${esc(answer.label)}</span>
        <span class="answer-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4.3 4.3L19 6.7"></path></svg></span>
      </label>`;
    }).join("");

    renderLayout(`
      <div class="quiz-header">
        <div><p class="eyebrow">QUESTION ${state.questionIndex + 1} <span aria-hidden="true">/</span> ${total}</p><h1 id="page-title" class="page-title-small">Find your direction</h1></div>
        <p class="question-count">Question <strong>${state.questionIndex + 1}</strong> of ${total}</p>
      </div>
      <div class="progress-track" aria-label="Quiz progress"><div class="progress-bar" style="width:${progress}%"></div></div>
      <section class="question-panel" aria-labelledby="question-title">
        <p class="section-kicker">Choose the answer that feels most like you</p>
        <fieldset>
          <legend id="question-title" tabindex="-1">${esc(question.text)}</legend>
          <div class="answer-list">${answersMarkup}</div>
        </fieldset>
        <div class="nav-row">
          ${state.questionIndex > 0 ? '<button class="button button-secondary" id="back-button" type="button"><span aria-hidden="true">←</span> Back</button>' : '<span></span>'}
          <button class="button button-primary" id="next-button" type="button" ${selected ? "" : "disabled"}>${isFinal ? "See my result" : "Next"} <span aria-hidden="true">→</span></button>
        </div>
      </section>`);

    app.querySelectorAll("input[type=radio]").forEach((input) => {
      input.addEventListener("change", (event) => {
        state.answers[question.id] = event.target.value;
        app.querySelectorAll(".answer-option").forEach((option) => option.classList.toggle("is-selected", option.contains(event.target)));
        app.querySelector("#next-button").disabled = false;
        announce("Answer selected. You can continue when ready.");
      });
    });
    const backButton = app.querySelector("#back-button");
    if (backButton) backButton.addEventListener("click", () => {
      state.questionIndex -= 1;
      renderQuestion();
      announce(`Question ${state.questionIndex + 1} of ${total}.`);
      setFocus("#question-title");
    });
    app.querySelector("#next-button").addEventListener("click", () => {
      if (!state.answers[question.id]) return;
      if (isFinal) {
        try {
          state.result = window.QuizEngine.calculateResult(window.SECTOR_DATA, window.QUESTION_DATA, state.answers);
          renderResult();
          announce(`Result ready. Your best match is ${state.result.winner.name}.`);
          setFocus("#result-title");
        } catch (error) {
          announce(error.message);
        }
      } else {
        state.questionIndex += 1;
        renderQuestion();
        announce(`Question ${state.questionIndex + 1} of ${total}.`);
        setFocus("#question-title");
      }
    });
  }

  function renderChart(result) {
    const maxScore = Math.max(...Object.values(result.scores), 1);
    return `<section class="score-chart viz-root" aria-labelledby="chart-title">
      <div class="chart-heading"><div><p class="section-kicker">Your full picture</p><h2 id="chart-title">Scores across all sectors</h2></div><span class="score-key">points</span></div>
      <div class="chart-rows">
        ${window.SECTOR_DATA.map((sector) => {
          const score = result.scores[sector.id];
          const width = Math.max(score > 0 ? 8 : 0, (score / maxScore) * 100);
          return `<div class="chart-row" tabindex="0" aria-label="${esc(sector.name)}: ${score} points">
            <div class="chart-label"><span class="chart-dot" style="--sector-color:${sector.color}"></span><span>${esc(sector.name)}</span></div>
            <div class="chart-track"><div class="chart-fill" style="--sector-color:${sector.color}; width:${width}%"></div></div>
            <strong>${score}<span> pts</span></strong>
          </div>`;
        }).join("")}
      </div>
      <p class="chart-summary">Your strongest score is <strong>${result.topScore} points</strong> in ${esc(result.winner.name)}.</p>
    </section>`;
  }

  function renderResult() {
    state.view = "result";
    const { winner, topScore, tieMessage } = state.result;
    renderLayout(`
      <div class="result-intro"><span class="mini-tag">YOUR QUIZ RESULT</span><h1 id="result-title" tabindex="-1">Your best match</h1><p>Based on the choices you made in this quick reflection.</p></div>
      <article class="result-card" style="--sector-color:${winner.color}">
        <div class="result-art" aria-hidden="true"><div class="result-ring"></div>${icon(winner, "result-icon")}</div>
        <div class="result-details">
          <p class="section-kicker">A bright direction to explore</p>
          <h2>${esc(winner.name)}</h2>
          <p class="result-description">${esc(winner.description)}</p>
          <div class="result-score"><span>Best-match score</span><strong>${topScore}<small> points</small></strong></div>
        </div>
        <div class="jobs-panel"><p>Two example jobs</p><ul>${winner.jobs.map((job) => `<li>${esc(job)}</li>`).join("")}</ul></div>
      </article>
      ${tieMessage ? `<p class="tie-note" role="note">${esc(tieMessage)}</p>` : ""}
      ${renderChart(state.result)}
      <div class="result-actions"><button class="button button-primary" id="download-button" type="button">Download my result <span aria-hidden="true">↓</span></button><button class="button button-secondary" id="retry-button" type="button">Try again <span aria-hidden="true">↺</span></button></div>
      <p class="result-disclaimer">These sectors, example roles, and scores are illustrative examples only. Replace the data files with approved content if needed.</p>`);

    app.querySelector("#retry-button").addEventListener("click", () => {
      state.questionIndex = 0;
      state.answers = {};
      state.result = null;
      renderWelcome();
      announce("Quiz reset. You can start again.");
    });
    app.querySelector("#download-button").addEventListener("click", async (event) => {
      const button = event.currentTarget;
      button.disabled = true;
      button.innerHTML = "Creating image…";
      try {
        await window.downloadResultCard(state.result);
        button.innerHTML = "Downloaded <span aria-hidden=\"true\">✓</span>";
        announce("Your result image was downloaded.");
      } catch (error) {
        button.innerHTML = "Could not download";
        announce(error.message || "The result image could not be downloaded.");
      }
      setTimeout(() => { button.disabled = false; button.innerHTML = "Download my result <span aria-hidden=\"true\">↓</span>"; }, 1600);
    });
  }

  window.QuizEngine.validateData(window.SECTOR_DATA, window.QUESTION_DATA);
  renderWelcome();
})();
