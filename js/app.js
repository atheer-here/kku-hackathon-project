/* Massari app controller: state, views, chrome, keyboard. Answers live in memory only. */
(function () {
  "use strict";
  var W = window, H = document.documentElement;
  var S = W.MASSARI_SECTORS, Q = W.MASSARI_QUESTIONS, I18N = W.MASSARI_I18N, E = W.MassariEngine, IC = W.MassariIcons, SC = W.MassariScenes;
  var noop = function () { return Promise.resolve(); };
  var M = W.MassariMotion || { enabled: function () { return false; }, leave: noop, enter: noop, flyToNode: noop, countUp: function (el, to, o) { el.textContent = (o && o.format ? o.format(to) : to); return noop(); },
    drawRadar: noop, logoReveal: noop, magnetic: function () { return function () {}; }, veil: function () { return { cover: noop(), lift: noop }; }, swapIcon: function (b, h) { b.innerHTML = h; } };
  var TRAITS = [["people", "traitPeople"], ["ideas", "traitIdeas"], ["data", "traitData"], ["hands", "traitHands"]];
  var byId = {};
  S.forEach(function (s) { byId[s.id] = s; });

  var st = { view: "intro", q: 0, answers: {}, result: null, lang: H.lang === "en" ? "en" : "ar", theme: H.getAttribute("data-theme") === "dark" ? "dark" : "light",
    isExample: false, busy: false, slide: 0, playing: true };
  var timers = [], canvases = {}, anTl = null, backdrop = null;

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function qa(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function t(k, v) {
    var s = (I18N[st.lang] && I18N[st.lang][k]) || I18N.en[k] || k;
    return s.replace(/\{(\w+)\}/g, function (m, n) { return v && v[n] != null ? v[n] : m; });
  }
  function tx(o) { return o ? esc(o[st.lang] || o.en) : ""; }
  function ic(n, cls) { return IC ? IC.svg(n, { className: cls }) : ""; }
  function pct(n) { return st.lang === "ar" ? n + "٪" : n + "%"; }
  function accent(s) { return st.theme === "dark" ? s.colorDark : s.color; }
  function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; if (anTl) { anTl.kill(); anTl = null; } }
  function centre(el) { if (!el) return null; var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function announce(msg) { var l = $("live"); l.textContent = ""; setTimeout(function () { l.textContent = msg; }, 40); }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode: ignore */ } }
  function reduced() { try { return W.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }
  function toast(msg) {
    var el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); el.textContent = msg;
    document.body.appendChild(el); setTimeout(function () { el.remove(); }, 2800);
  }
  function answerOf(qid) { var q = Q.find(function (x) { return x.id === qid; }); return q && q.answers.find(function (a) { return a.id === st.answers[qid]; }); }
  function stopCanvases() { Object.keys(canvases).forEach(function (k) { try { canvases[k].stop(); } catch (e) {} }); canvases = {}; }
  function progressFor(view) { return view === "intro" ? 0 : view === "intermission" ? 0.06 : view === "question" ? (st.q + 1) / 13 : view === "analysis" ? 0.94 : 1; }

  /* ---------- chrome (rendered once, relabelled in place) ---------- */
  function chrome() {
    document.title = t("metaTitle");
    var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute("content", t("metaDescription"));
    $("skip").textContent = t("skip");
    $("home").setAttribute("aria-label", t("homeLabel"));
    $("langSeg").setAttribute("aria-label", t("langLabel"));
    qa("#langSeg button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === st.lang)); });
    placeKnob();
    $("themeBtn").setAttribute("aria-label", t(st.theme === "dark" ? "themeToLight" : "themeToDark"));
    $("prev").setAttribute("aria-label", t("navPrev"));
    $("next").setAttribute("aria-label", st.view === "analysis" ? t("anSkip") : t("navNext"));
    $("foot").textContent = t("footer");
    chevrons();
  }
  function placeKnob() {
    var on = document.querySelector('#langSeg button[aria-pressed="true"]'), k = document.querySelector("#langSeg .knob"), seg = $("langSeg");
    if (!on || !k) return;
    var r = on.getBoundingClientRect(), p = seg.getBoundingClientRect();
    var start = H.dir === "rtl" ? p.right - r.right - 1 : r.left - p.left - 1;
    k.style.insetInlineStart = start + "px"; k.style.width = r.width + "px";
  }
  function chevrons() {
    var p = $("prev"), n = $("next"), v = st.view, answered = v === "question" && !!st.answers[Q[st.q].id];
    p.setAttribute("aria-disabled", String(v === "intro"));
    n.hidden = v === "result";
    n.setAttribute("aria-disabled", String(v === "question" && !answered));
    n.classList.toggle("ready", answered);
  }

  function setLang(lang) {
    if (lang === st.lang) return;
    st.lang = lang; H.lang = lang; H.dir = lang === "ar" ? "rtl" : "ltr"; store("massari-lang", lang);
    chrome(); rerender(); announce(t("statusLang"));
  }
  function setTheme(theme) {
    st.theme = theme; H.setAttribute("data-theme", theme); store("massari-theme", theme);
    M.swapIcon($("themeBtn"), ic(theme === "dark" ? "sun" : "moon"));
    $("themeBtn").setAttribute("aria-label", t(theme === "dark" ? "themeToLight" : "themeToDark"));
    if (backdrop) backdrop.setTheme(theme);
    applySector();
    Object.keys(canvases).forEach(function (k) { try { canvases[k].setTheme(theme); } catch (e) {} });
    drawRunner();
    announce(t("statusTheme"));
  }
  function applySector() {
    var r = st.result;
    if (r && (st.view === "result" || st.view === "analysis")) H.style.setProperty("--sector", accent(byId[r.winner]));
    else H.style.removeProperty("--sector");
    qa("[data-rc]").forEach(function (el) { el.style.setProperty("--rc", accent(byId[el.dataset.rc])); });
  }

  /* ---------- navigation ---------- */
  function go(view, o) {
    o = o || {};
    if (st.busy) return;
    st.busy = true;
    clearTimers();
    var dir = o.dir || 1, sameQ = view === "question" && st.view === "question";
    if (view === "question" && o.q != null) st.q = o.q;
    if (view === "analysis") computeResult();
    if (backdrop && backdrop.travel) backdrop.travel(dir);
    if (backdrop && backdrop.setProgress) backdrop.setProgress(progressFor(view));
    var root = $("view"), unlock = function () { st.busy = false; };

    if (sameQ) { // question -> question: only the body swaps; the crenellation path persists
      M.leave($("qbody"), { direction: dir, fast: true }).then(function () {
        st.view = "question"; renderQBody(); updatePath(); chrome();
        var body = $("qbody");
        var entered = M.enter(body, { direction: dir, fast: true });
        focusHeading(); announce(t("statusQuestion", { current: st.q + 1, total: Q.length }));
        Promise.race([entered, new Promise(function (r) { setTimeout(r, 360); })]).then(unlock);
      });
      return;
    }
    var veil = M.veil(o.origin, { flood: !!o.flood });
    if (o.flood) applySector();
    Promise.all([veil.cover, o.flood ? Promise.resolve() : M.leave(root, { direction: dir })]).then(function () {
      stopCanvases();
      root.removeAttribute("aria-busy");
      st.view = view; H.setAttribute("data-view", view);
      render(false);
      W.scrollTo(0, 0);
      chrome();
      root.style.opacity = "";
      veil.lift();
      var entered = M.enter(root, { direction: dir });
      mount(false);
      focusHeading();
      Promise.race([entered, new Promise(function (r) { setTimeout(r, 700); })]).then(unlock);
    }).catch(function (e) { console.error(e); unlock(); });
  }
  function next(origin) {
    var v = st.view;
    if (v === "intro") go("intermission", { origin: origin });
    else if (v === "intermission") go("question", { q: 0, origin: origin });
    else if (v === "question") {
      if (!st.answers[Q[st.q].id]) return;
      var gap = Q.findIndex(function (x) { return !st.answers[x.id]; });
      if (st.q < Q.length - 1) go("question", { q: st.q + 1 });
      else if (gap >= 0) go("question", { q: gap, dir: -1 });
      else go("analysis", { origin: origin });
    } else if (v === "analysis") showResult();
  }
  function prev(origin) {
    var v = st.view;
    if (v === "intermission") go("intro", { dir: -1, origin: origin });
    else if (v === "question") { if (st.q > 0) go("question", { q: st.q - 1, dir: -1 }); else go("intermission", { dir: -1, origin: origin }); }
    else if (v === "analysis" || v === "result") go("question", { q: Q.length - 1, dir: -1, origin: origin });
  }
  function focusHeading() {
    var h = document.querySelector("#view h1");
    if (h) { h.setAttribute("tabindex", "-1"); try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
  }
  function computeResult() { st.result = E.score(S, Q, st.answers); return st.result; }

  /* ---------- render ---------- */
  var VIEWS = {};
  function render() { $("view").className = "view " + VIEWS[st.view].cls; $("view").innerHTML = VIEWS[st.view].html(); }
  function mount(instant) { if (VIEWS[st.view].mount) VIEWS[st.view].mount(instant); }
  function rerender() { // language switch: in place, no leave/enter, keep answers, step and focus
    var a = document.activeElement, fid = a && a.closest && a.closest("#view") ? (a.id || a.getAttribute("data-fid")) : null;
    var anTime = anTl ? anTl.time() : null;
    clearTimers(); stopCanvases();
    render(); mount(true);
    if (st.view === "analysis" && anTime != null && anTl) anTl.time(anTime);
    var back = fid && (document.getElementById(fid) || document.querySelector('[data-fid="' + fid + '"]'));
    if (back) back.focus({ preventScroll: true });
  }

  /* intro */
  VIEWS.intro = {
    cls: "v-intro",
    html: function () {
      var hl = function (s) { return esc(s).replace(/(\d+)/g, '<b data-count="$1">$1</b>'); };
      return '<div class="medallion" data-m><div class="socket">' + (IC ? IC.logoMark({ className: "hero-mark" }) : "") + "</div></div>" +
        '<h1 class="display" data-split data-m>' + esc(t("introTitle")) + "</h1>" +
        '<p class="lead" data-m>' + esc(t("introLead")) + "</p>" +
        '<ul class="facts" data-m><li>' + hl(t("factQuestions", { n: Q.length })) + "</li><li>" + hl(t("factTime")) + "</li><li>" + hl(t("factSectors", { n: S.length })) + "</li></ul>" +
        '<button class="btn breathe" type="button" id="start" data-m>' + esc(t("introStart")) + '<span class="well">' + ic("caret-right") + "</span></button>" +
        '<p class="note" data-m>' + esc(t("introNote")) + "</p>";
    },
    mount: function (instant) {
      $("start").onclick = function (e) { next(centre(e.currentTarget)); };
      if (instant) return;
      M.logoReveal(document.querySelector(".hero-mark"));
      qa(".facts b").forEach(function (b, i) { M.countUp(b, +b.dataset.count, { duration: 1.1, delay: 0.5 + i * 0.12 }); });
    }
  };

  /* intermission: the showcase */
  VIEWS.intermission = {
    cls: "v-inter",
    html: function () {
      var s0 = S[st.slide];
      return '<div class="show" data-m><div class="frame"><div class="window photo" id="photo" role="region" aria-roledescription="carousel" aria-label="' + esc(t("showEyebrow")) + '">' +
        S.map(function (s, i) {
          return '<figure class="slide' + (i === st.slide ? " on" : "") + '" data-i="' + i + '"><img src="' + esc(s.photo.file) + '" alt="' + tx(s.photo.alt) + '" decoding="async"' + (i === st.slide ? ' fetchpriority="high"' : "") + "></figure>";
        }).join("") +
        '<div class="caption" id="cap">' + captionHtml(s0) + "</div></div></div>" +
        '<div class="slide-ctrl"><button class="round" type="button" id="play" aria-label="' + esc(t(st.playing && !reduced() ? "showPause" : "showPlay")) + '">' + ic(st.playing && !reduced() ? "pause" : "play") + "</button>" +
        '<div class="dots">' + S.map(function (s, i) { return '<button type="button" data-fid="dot' + i + '" data-i="' + i + '" aria-label="' + esc(t("showSlideLabel", { current: i + 1, total: S.length })) + '"' + (i === st.slide ? ' aria-current="true"' : "") + "><span></span></button>"; }).join("") + "</div>" +
        '<span class="count" id="count">' + esc(t("showSlideLabel", { current: st.slide + 1, total: S.length })) + "</span></div></div>" +
        '<div class="panel"><h1 class="display" data-split data-m>' + esc(t("showTitle")) + "</h1>" +
        '<p class="lead" data-m>' + esc(t("showLead")) + "</p>" +
        '<ol class="beats">' + [["hand-tap", 1], ["waveform", 2], ["path", 3]].map(function (b) {
          return '<li data-m><span class="pit">' + ic(b[0]) + "<b>" + b[1] + "</b></span><div><h2>" + esc(t("step" + b[1] + "Title")) + "</h2><p>" + esc(t("step" + b[1] + "Text")) + "</p></div></li>";
        }).join("") + "</ol>" +
        '<div class="actions" data-m><button class="btn breathe" type="button" id="begin">' + esc(t("showBegin")) + '<span class="well">' + ic("caret-right") + "</span></button>" +
        '<button class="link" type="button" id="example">' + esc(t("showExample")) + "</button></div></div>";
    },
    mount: function () {
      $("begin").onclick = function (e) { next(centre(e.currentTarget)); };
      $("example").onclick = function (e) { loadExample(centre(e.currentTarget)); };
      $("play").onclick = function () { st.playing = !st.playing; syncPlay(); };
      qa(".dots button").forEach(function (b) { b.onclick = function () { showSlide(+b.dataset.i); }; });
      if (st.playing && !reduced()) autoplay();
    }
  };
  function captionHtml(s) {
    return '<p class="name">' + ic(s.icon) + "<span>" + tx(s.name) + '</span></p><p class="tag">' + tx(s.tagline) + '</p><p class="credit">' +
      esc(t("photoCredit", { author: s.photo.credit.author, license: s.photo.credit.license })) + "</p>";
  }
  function autoplay() { later(function () { if (st.view !== "intermission" || !st.playing) return; showSlide((st.slide + 1) % S.length); autoplay(); }, 3600); }
  function syncPlay() {
    var b = $("play"), on = st.playing && !reduced();
    b.setAttribute("aria-label", t(on ? "showPause" : "showPlay")); b.innerHTML = ic(on ? "pause" : "play");
    timers.forEach(clearTimeout); timers = [];
    if (on) autoplay();
  }
  function showSlide(i) {
    if (i === st.slide || st.view !== "intermission") return;
    var fwd = i > st.slide, oldI = st.slide; st.slide = i;
    var slides = qa("#photo .slide"), nu = slides[i], old = slides[oldI], g = W.gsap;
    nu.classList.add("on"); nu.style.zIndex = 2; old.style.zIndex = 1;
    var rtl = H.dir === "rtl", fromEnd = fwd !== rtl; // forward reveals from the inline end
    var done = function () { old.classList.remove("on"); old.style.zIndex = ""; nu.style.zIndex = ""; nu.style.clipPath = ""; };
    if (g && M.enabled()) {
      g.fromTo(nu, { clipPath: fromEnd ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0%)", duration: 0.9, ease: "power3.inOut", onComplete: done });
      g.fromTo(nu.querySelector("img"), { xPercent: fromEnd ? 6 : -6 }, { xPercent: 0, duration: 1.1, ease: "power3.out" });
      var cap = $("cap");
      g.to(cap.children, { opacity: 0, y: -8, duration: 0.25, stagger: 0.04, onComplete: function () {
        cap.innerHTML = captionHtml(S[i]); g.from(cap.children, { opacity: 0, y: 12, duration: 0.5, stagger: 0.07, ease: "power3.out" });
      } });
    } else { done(); $("cap").innerHTML = captionHtml(S[i]); }
    qa(".dots button").forEach(function (b, k) { if (k === i) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
    $("count").textContent = t("showSlideLabel", { current: i + 1, total: S.length });
  }
  function loadExample(origin) {
    var sample = W.MASSARI_SAMPLE && W.MASSARI_SAMPLE.answers;
    if (!sample) return;
    st.answers = Object.assign({}, sample); st.isExample = true; st.q = Q.length - 1;
    go("analysis", { origin: origin });
  }

  /* question */
  VIEWS.question = {
    cls: "v-q",
    html: function () {
      return '<div class="pathbar" data-m role="progressbar" aria-valuemin="1" aria-valuemax="' + Q.length + '" id="pathbar">' +
        '<div class="crenwrap"><ol class="crenel" aria-hidden="true">' + Q.map(function (q, i) {
          return '<li class="node" data-i="' + i + '"><svg class="tri" viewBox="0 0 40 34" preserveAspectRatio="none"><path d="M4 33.2 Q1.6 33.2 2.9 31 L18.2 3.6 Q20 .6 21.8 3.6 L37.1 31 Q38.4 33.2 36 33.2 Z"/></svg>' +
            '<span class="nico"></span><span class="num">' + (i + 1) + "</span></li>";
        }).join("") + '</ol><div class="whisper" id="whisper" aria-hidden="true"></div></div>' +
        '<div class="pathmeta"><span class="theme" id="qtheme"></span><span id="qcount"></span></div></div>' +
        '<div id="qbody"></div>';
    },
    mount: function () { renderQBody(); updatePath(); }
  };
  function renderQBody() {
    var q = Q[st.q], sel = st.answers[q.id];
    $("qbody").innerHTML = '<fieldset><legend><h1 class="display" data-split data-m>' + tx(q.prompt) + "</h1></legend>" +
      '<div class="answers">' + q.answers.map(function (a, i) {
        var on = a.id === sel;
        return '<label class="card' + (on ? " sel" : "") + '" data-m><input class="sr" type="radio" name="answer" data-fid="ans' + i + '" value="' + a.id + '"' + (on ? " checked" : "") + ">" +
          '<span class="ico">' + ic(a.icon) + '</span><span class="lbl">' + tx(a.label) + '</span><span class="key" aria-hidden="true">' + (i + 1) + "</span></label>";
      }).join("") + "</div></fieldset>" +
      '<p class="hintrow" data-m><span>' + esc(t("qHint")) + '</span><span class="rule"></span><span class="keys" aria-label="' + esc(t("qKeysHint")) + '"><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd></span></p>';
    qa("#qbody .card").forEach(function (card, i) {
      var input = card.querySelector("input");
      input.addEventListener("change", function () { select(i); });
      card.addEventListener("click", function (e) { if (input.checked && e.target !== input) select(i, true); });
    });
  }
  function updatePath() {
    var bar = $("pathbar"); if (!bar) return;
    bar.setAttribute("aria-valuenow", st.q + 1);
    bar.setAttribute("aria-valuetext", t("qProgress", { current: st.q + 1, total: Q.length }));
    $("qtheme").textContent = Q[st.q].theme[st.lang];
    $("qcount").textContent = t("qProgress", { current: st.q + 1, total: Q.length });
    qa("#pathbar .node").forEach(function (n, i) {
      var a = answerOf(Q[i].id);
      n.classList.toggle("done", !!a); n.classList.toggle("now", i === st.q);
      var nico = n.querySelector(".nico");
      if (a && nico.dataset.icon !== a.icon) { nico.innerHTML = ic(a.icon); nico.dataset.icon = a.icon; }
    });
  }
  function select(i, again, qWas) {
    if (st.view !== "question" || (qWas != null && qWas !== st.q)) return;
    if (st.busy) { var q0 = st.q; setTimeout(function () { select(i, again, q0); }, 120); return; } // retried only while still on the same question
    var qi = st.q, q = Q[qi], a = q.answers[i], cards = qa("#qbody .card"), card = cards[i];
    if (!a || !card) return;
    var changed = st.answers[q.id] !== a.id;
    st.answers[q.id] = a.id;
    if (changed) { st.result = null; st.isExample = false; }
    card.querySelector("input").checked = true;
    cards.forEach(function (c, k) { c.classList.toggle("sel", k === i); });
    chevrons();
    if (changed || !again) {
      ripple(card);
      announce(t("statusSelected", { answer: a.label[st.lang] }));
      whisper(a.whisper[st.lang], qi);
      var node = qa("#pathbar .node")[qi], nico = node.querySelector(".nico");
      var land = function () { nico.innerHTML = ic(a.icon); nico.dataset.icon = a.icon; node.classList.add("done"); node.classList.remove("lit"); void node.offsetWidth; node.classList.add("lit"); };
      if (M.enabled()) { node.classList.remove("done"); M.flyToNode(card.querySelector(".ico"), node).then(land); } else land();
    }
    timers.forEach(clearTimeout); timers = [];
    later(function () { if (st.view === "question" && st.q === qi && !st.busy) next(); }, 650);
  }
  function ripple(card) {
    if (!M.enabled()) return;
    var r = card.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2, s = document.createElement("span");
    s.className = "ripple"; s.style.cssText = "width:" + d + "px;height:" + d + "px;left:" + (r.width / 2 - d / 2) + "px;top:" + (r.height / 2 - d / 2) + "px";
    card.appendChild(s); setTimeout(function () { s.remove(); }, 800);
  }
  var whisperT = 0;
  function whisper(text, qi) {
    var w = $("whisper"), node = qa("#pathbar .node")[qi]; if (!w || !node) return;
    w.textContent = text;
    var wrap = w.parentNode.getBoundingClientRect(), r = node.getBoundingClientRect(), half = w.offsetWidth / 2 + 4;
    var c = H.dir === "rtl" ? wrap.right - (r.left + r.width / 2) : r.left + r.width / 2 - wrap.left;
    var min = half - Math.max(0, (innerWidth - wrap.width) / 2 - 12);
    c = Math.max(min, Math.min(wrap.width - min, c));
    w.style.insetInlineStart = c + "px";
    w.classList.add("on");
    clearTimeout(whisperT); whisperT = setTimeout(function () { var x = $("whisper"); if (x) x.classList.remove("on"); }, 1700);
  }

  /* analysis: the observatory */
  VIEWS.analysis = {
    cls: "v-an",
    html: function () {
      var r = st.result, rtl = st.lang === "ar", narrow = W.innerWidth < 600, Wd = narrow ? 460 : 1000, lanes = [52, 112, 172, 232];
      var x0 = narrow ? 34 : 150, span = narrow ? 392 : 800; // phones: no lane labels, tighter columns so the icons stay legible
      var colX = function (i) { var x = x0 + i * (span / (Q.length - 1)); return rtl ? Wd - x : x; };
      var rnd = mulberry(7), stars = "";
      for (var k = 0; k < 90; k++) stars += '<circle class="star" cx="' + (rnd() * Wd).toFixed(1) + '" cy="' + (rnd() * 300).toFixed(1) + '" r="' + (0.4 + rnd() * 1.3).toFixed(2) + '" opacity="' + (0.25 + rnd() * 0.6).toFixed(2) + '"/>';
      var pts = Q.map(function (q, i) { var a = answerOf(q.id); return { x: colX(i), y: lanes[E.TRAITS.indexOf(a.t)], a: a }; });
      var laneX = rtl ? Wd - 24 : 24, anchor = rtl ? "end" : "start";
      var w = byId[r.winner];
      return '<p class="eyebrow" data-m>' + esc(t("anEyebrow")) + '</p><h1 class="display" data-split data-m>' + esc(t("anTitle")) + "</h1>" +
        '<div class="sky-frame raised" data-m><div class="sky"><svg id="sky" viewBox="0 0 ' + Wd + ' 300" style="direction:ltr" role="img" aria-label="' + esc(t("anProgressLabel")) + '">' +
        '<g class="stars">' + stars + "</g>" +
        TRAITS.map(function (tr, i) { return '<line class="lane" x1="' + (narrow ? 12 : rtl ? 40 : 130) + '" x2="' + (narrow ? Wd - 12 : rtl ? 870 : 960) + '" y1="' + lanes[i] + '" y2="' + lanes[i] + '"/>' + (narrow ? "" : '<text class="lane-l" x="' + laneX + '" y="' + (lanes[i] + 4) + '" text-anchor="' + anchor + '">' + esc(t(tr[1])) + "</text>"); }).join("") +
        Q.map(function (q, i) { return '<text class="col-n" x="' + colX(i) + '" y="284" text-anchor="middle">' + (i + 1) + "</text>"; }).join("") +
        '<polyline class="link" id="skyLink" points="' + pts.map(function (p) { return p.x + "," + p.y; }).join(" ") + '"/>' +
        pts.map(function (p) { return '<g class="pt" transform="translate(' + p.x + " " + p.y + ')"><g class="pti"><circle class="halo" r="24"/><circle r="15"/><svg x="-10" y="-10" width="20" height="20" viewBox="0 0 256 256" fill="currentColor">' + (IC ? IC.svg(p.a.icon).replace(/^<svg[^>]*>|<\/svg>$/g, "") : "") + "</svg></g></g>"; }).join("") +
        '<g class="winner" transform="translate(' + Wd / 2 + ' 142)"><g id="winG" opacity="0"><circle r="38"/><svg x="-22" y="-22" width="44" height="44" viewBox="0 0 256 256" fill="currentColor">' + (IC ? IC.svg(w.icon).replace(/^<svg[^>]*>|<\/svg>$/g, "") : "") + "</svg></g></g>" +
        "</svg></div></div>" +
        '<ol class="an-bars" id="anBars" data-m>' + S.map(function (s) {
          return '<li data-id="' + s.id + '"><span class="ic">' + ic(s.icon) + '</span><span class="tr"><span class="nm">' + tx(s.name) + '</span><span class="fl"></span></span><span class="pc">' + pct(0) + "</span></li>";
        }).join("") + "</ol>" +
        '<p class="an-status" id="anStatus" aria-live="polite">' + esc(t("anStage1")) + "</p>" +
        '<button class="btn ghost an-skip" type="button" id="anSkip" data-m data-fid="anSkip">' + ic("fast-forward") + esc(t("anSkip")) + "</button>";
    },
    mount: function (instant) {
      $("anSkip").onclick = function () { showResult(); };
      applySector();
      $("view").setAttribute("aria-busy", "true");
      if (!instant) announce(t("statusAnalysis"));
      runAnalysis();
    }
  };
  function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
  function stage(n) { var s = $("anStatus"); if (s) s.textContent = t("anStage" + n); }
  function fillBars(animate) {
    var r = st.result;
    qa("#anBars li").forEach(function (li) {
      var p = r.percents[li.dataset.id], fl = li.querySelector(".tr > span:last-child"), pc = li.querySelector(".pc");
      fl.style.width = Math.max(3, p) + "%"; if (!animate) pc.textContent = pct(p);
      else M.countUp(pc, p, { duration: 1, format: function (v) { return pct(Math.round(v)); } });
    });
  }
  function sortBars() {
    var ol = $("anBars"); if (!ol) return;
    var state = W.Flip && M.enabled() ? W.Flip.getState(qa("#anBars li")) : null;
    st.result.ranked.forEach(function (x) { ol.appendChild(ol.querySelector('[data-id="' + x.id + '"]')); });
    var win = ol.querySelector('[data-id="' + st.result.winner + '"]'); if (win) win.classList.add("win");
    if (state) W.Flip.from(state, { duration: 0.7, ease: "power3.inOut", stagger: 0.03 });
  }
  function runAnalysis() {
    var g = W.gsap, TOTAL = 5000;
    if (!g || !M.enabled()) { // plain path: final picture, status lines on a timer
      fillBars(false); sortBars(); var wg = $("winG"); if (wg) wg.setAttribute("opacity", "1");
      [2, 3, 4].forEach(function (n, i) { later(function () { stage(n); }, (i + 1) * 1200); });
      later(showResult, TOTAL);
      return;
    }
    var pts = qa("#sky .pt .pti"), link = $("skyLink"), stars = qa("#sky .star");
    var tl = g.timeline();
    tl.from(stars, { opacity: 0, duration: 0.8, stagger: { each: 0.008, from: "random" } }, 0)
      .from(pts, { scale: 0, opacity: 0, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(2.2)", stagger: 0.09 }, 0.2)
      .add(function () { stage(2); }, 1.35)
      .from(link, W.DrawSVGPlugin ? { drawSVG: "0%", duration: 1.2, ease: "power2.inOut" } : { opacity: 0, duration: 1 }, 1.3)
      .add(function () { stage(3); fillBars(true); }, 2.4)
      .add(sortBars, 3.3)
      .add(function () { stage(4); }, 3.8)
      .to(qa("#sky .pt"), { attr: { transform: "translate(" + (+$("sky").viewBox.baseVal.width / 2) + " 142)" }, duration: 0.7, ease: "power3.in", stagger: 0.02 }, 3.8)
      .to(pts, { scale: 0.3, opacity: 0, transformOrigin: "50% 50%", duration: 0.7, ease: "power3.in", stagger: 0.02 }, 3.8)
      .to(link, { opacity: 0, duration: 0.4 }, 3.8)
      .fromTo("#winG", { attr: { opacity: 0 }, scale: 0, transformOrigin: "50% 50%" }, { attr: { opacity: 1 }, scale: 1, duration: 0.7, ease: "elastic.out(1, 0.5)" }, 4.35)
      .add(function () { showResult(); }, TOTAL / 1000);
    anTl = tl;
  }
  function showResult() {
    if (st.view !== "analysis") return;
    if (st.busy) { setTimeout(showResult, 150); return; } // queued: Esc / skip pressed mid-transition
    var w = document.querySelector("#winG circle");
    if (anTl) { anTl.kill(); anTl = null; }
    go("result", { origin: centre(w) || centre($("next")), flood: true });
  }

  /* result */
  VIEWS.result = {
    cls: "v-res",
    html: function () {
      var r = st.result || computeResult(), w = byId[r.winner], ru = byId[r.runnerUp], p = r.percents[w.id], C = 2 * Math.PI * 70;
      var why = r.why.map(function (x) {
        var q = Q.find(function (y) { return y.id === x.questionId; }), a = q.answers.find(function (y) { return y.id === x.answerId; });
        return '<li data-m><span class="pit">' + ic(a.icon) + "</span><span>" + tx(a.signal) + "</span></li>";
      }).join("");
      return '<div class="hero"><div class="media" data-m><div class="frame"><div class="window scene"><canvas id="sceneCv" role="img" aria-label="' + tx(w.name) + '"></canvas></div></div>' +
        '<div class="dial" role="img" aria-label="' + esc(t("resMatch", { percent: p })) + '"><span class="groove-ring"></span><svg viewBox="0 0 156 156"><circle class="arc" id="arc" cx="78" cy="78" r="70" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '" data-to="' + (C * (1 - p / 100)) + '"/></svg>' +
        '<div class="face"><div class="num"><span id="dialNum" data-to="' + p + '">0</span><small>' + (st.lang === "ar" ? "٪" : "%") + '</small></div><div class="cap">' + esc(t("resDialCaption")) + "</div></div></div></div>" +
        '<div class="who">' + (st.isExample ? '<p class="badge-ex" data-m>' + esc(t("resExampleBadge")) + "</p>" : "") +
        '<p class="kicker" data-m>' + esc(t("resEyebrow")) + '</p><h1 class="display" data-split data-m>' + tx(w.name) + "</h1>" +
        '<p class="tag" data-m>' + tx(w.tagline) + '</p><p class="desc" data-m>' + tx(w.description) + "</p></div></div>" +
        '<div class="band three"><section><h2 data-m>' + esc(t("resWhyTitle")) + '</h2><ul class="why">' + why + "</ul></section>" +
        '<section><h2 data-m>' + esc(t("resTraitsTitle")) + '</h2><div class="plate" data-m><div class="inner">' + radar(r) + "</div></div></section>" +
        '<section class="runner" data-rc="' + ru.id + '" style="--rc:' + accent(ru) + '"><h2 data-m>' + esc(t("resRunnerUp")) + '</h2><div class="frame" data-m><div class="window"><canvas id="ruCv" aria-hidden="true"></canvas></div></div>' +
        '<div class="head" data-m><span class="pit">' + ic(ru.icon) + '</span><div><div class="nm">' + tx(ru.name) + '</div><div class="pc">' + esc(t("resMatch", { percent: r.percents[ru.id] })) + "</div></div></div>" +
        '<span class="track" data-m><span class="fill" data-w="' + r.percents[ru.id] + '"></span></span><p data-m>' + tx(ru.tagline) + "</p></section></div>" +
        '<div class="band two"><section><h2 data-m>' + esc(t("resAllTitle")) + '</h2><ul class="bars">' + r.ranked.map(function (x) {
          var s = byId[x.id];
          return '<li data-m class="' + (x.id === w.id ? "win" : "") + '"><span class="ic">' + ic(s.icon) + '</span><span class="nm">' + tx(s.name) + '</span>' +
            '<span class="track"><span class="fill" data-w="' + Math.max(3, x.percent) + '"></span></span><span class="pc" data-to="' + x.percent + '">' + pct(x.percent) + "</span></li>";
        }).join("") + "</ul></section>" +
        '<div class="lists"><section><h2 data-m>' + esc(t("resRolesTitle")) + "</h2><ul>" + w.roles.map(function (x) { return "<li data-m>" + tx(x) + "</li>"; }).join("") + "</ul></section>" +
        '<section><h2 data-m>' + esc(t("resSkillsTitle")) + "</h2><ul>" + w.skills.map(function (x) { return "<li data-m>" + tx(x) + "</li>"; }).join("") + "</ul></section></div></div>" +
        '<div class="endrow"><div class="actions" data-m><button class="btn" type="button" id="dl" data-fid="dl"><span id="dlLbl">' + esc(t("resDownload")) + '</span><span class="well">' + ic("download-simple") + "</span></button>" +
        '<button class="btn ghost" type="button" id="edit" data-fid="edit">' + ic("pencil-simple") + esc(t("resEditAnswers")) + "</button>" +
        '<button class="btn ghost" type="button" id="retake" data-fid="retake">' + ic("arrow-counter-clockwise") + esc(t("resRetake")) + "</button></div>" +
        '<p class="disc" data-m>' + esc(t("resDisclaimer")) + "</p></div>";
    },
    mount: function (instant) {
      var r = st.result, w = byId[r.winner];
      applySector();
      $("view").removeAttribute("aria-busy");
      try { if (SC) canvases.scene = SC.sector($("sceneCv"), w.id, { theme: st.theme }); } catch (e) { console.error(e); }
      drawRunner();
      $("dl").onclick = download;
      $("edit").onclick = function (e) { go("question", { q: Q.length - 1, dir: -1, origin: centre(e.currentTarget) }); };
      $("retake").onclick = function (e) { st.answers = {}; st.result = null; st.isExample = false; st.q = 0; st.slide = 0; go("intro", { dir: -1, origin: centre(e.currentTarget) }); };
      var arc = $("arc"), num = $("dialNum"), fills = qa(".v-res .fill");
      var finish = function () { arc.style.strokeDashoffset = arc.dataset.to; fills.forEach(function (f) { f.style.width = f.dataset.w + "%"; }); };
      if (instant || !M.enabled()) { finish(); num.textContent = num.dataset.to; return; }
      announce(t("statusResult", { sector: w.name[st.lang] }));
      requestAnimationFrame(function () { requestAnimationFrame(finish); });
      M.countUp(num, +num.dataset.to, { duration: 1.4, delay: 0.3 });
      M.drawRadar(document.querySelector(".plate svg"));
    }
  };
  function drawRunner() {
    var c = $("ruCv"); if (!c || !SC || !st.result) return;
    try {
      var dpr = Math.min(2, W.devicePixelRatio || 1); c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr;
      SC.drawStatic(c.getContext("2d"), st.result.runnerUp, { theme: st.theme, width: c.width, height: c.height });
    } catch (e) { console.error(e); }
  }
  function radar(r) {
    var cx = 150, cy = 150, rr = 96, flip = st.lang === "ar" ? -1 : 1;
    var ang = function (i) { return -Math.PI / 2 + flip * i * Math.PI / 2; };
    var pt = function (i, rad) { return [(cx + Math.cos(ang(i)) * rad).toFixed(1), (cy + Math.sin(ang(i)) * rad).toFixed(1)]; };
    var grid = [0.33, 0.66, 1].map(function (k) { return '<polygon class="radar-grid" points="' + TRAITS.map(function (_, i) { return pt(i, rr * k).join(","); }).join(" ") + '"/>'; }).join("");
    var axes = TRAITS.map(function (_, i) { var p = pt(i, rr); return '<line class="radar-axis" x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '"/>'; }).join("");
    var top = Math.max.apply(null, TRAITS.map(function (x) { return r.traitPercents[x[0]]; })) || 1;
    var vals = TRAITS.map(function (x) { return Math.max(0.06, r.traitPercents[x[0]] / top); }); // ponytail: scaled to the strongest trait so the shape reads; labels show real %
    var shape = '<polygon class="radar-shape" points="' + vals.map(function (v, i) { return pt(i, rr * v).join(","); }).join(" ") + '"/>' +
      vals.map(function (v, i) { var p = pt(i, rr * v); return '<circle class="radar-dot" r="4" cx="' + p[0] + '" cy="' + p[1] + '"/>'; }).join("");
    var labels = TRAITS.map(function (x, i) {
      var p = pt(i, rr + 30), cos = Math.cos(ang(i)), sin = Math.sin(ang(i));
      var a = Math.abs(cos) < 0.1 ? "middle" : cos > 0 ? "start" : "end";
      var lx = a === "start" ? +p[0] - 14 : a === "end" ? +p[0] + 14 : +p[0], dy = sin > 0.5 ? 8 : sin < -0.5 ? -10 : -2;
      return '<text class="radar-lbl" text-anchor="' + a + '" x="' + lx + '" y="' + (+p[1] + dy) + '">' + esc(t(x[1])) + "</text>" +
        '<text class="radar-val" text-anchor="' + a + '" x="' + lx + '" y="' + (+p[1] + dy + 16) + '">' + pct(r.traitPercents[x[0]]) + "</text>";
    }).join("");
    return '<svg viewBox="0 0 300 300" style="direction:ltr" role="img" aria-label="' + esc(TRAITS.map(function (x) { return t(x[1]) + " " + pct(r.traitPercents[x[0]]); }).join("، ")) + '">' + grid + axes + shape + labels + "</svg>";
  }
  function download() {
    var btn = $("dl"), lbl = $("dlLbl");
    if (!W.MassariCard || typeof W.MassariCard.download !== "function") { toast(t("resDownloadFail")); return; }
    btn.disabled = true; lbl.textContent = t("resDownloading");
    Promise.resolve().then(function () {
      return W.MassariCard.download(Object.assign({}, st.result, { isExample: st.isExample }), { lang: st.lang, theme: st.theme, t: t, sectors: S });
    }).then(function () { toast(t("resDownloaded")); announce(t("resDownloaded")); }, function (e) { console.error(e); toast(t("resDownloadFail")); })
      .then(function () { var b = $("dl"); if (b) { b.disabled = false; $("dlLbl").textContent = t("resDownload"); } });
  }

  /* ---------- events ---------- */
  function bind() {
    $("prev").addEventListener("click", function (e) { if (e.currentTarget.getAttribute("aria-disabled") !== "true") prev(centre(e.currentTarget)); });
    $("next").addEventListener("click", function (e) { if (e.currentTarget.getAttribute("aria-disabled") !== "true") next(centre(e.currentTarget)); });
    $("home").addEventListener("click", function (e) { if (st.view !== "intro") go("intro", { dir: -1, origin: centre(e.currentTarget) }); });
    qa("#langSeg button").forEach(function (b) { b.addEventListener("click", function () { setLang(b.dataset.lang); }); });
    $("themeBtn").addEventListener("click", function () { setTheme(st.theme === "dark" ? "light" : "dark"); });
    M.magnetic($("prev")); M.magnetic($("next"));
    W.addEventListener("resize", placeKnob);
    document.addEventListener("keydown", function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var k = e.key, tag = (e.target.tagName || "").toLowerCase();
      if (k === "ArrowLeft" || k === "ArrowRight") {
        e.preventDefault();
        var fwd = (k === "ArrowRight") !== (H.dir === "rtl");
        if (fwd) { if ($("next").getAttribute("aria-disabled") !== "true" && !$("next").hidden) next(centre($("next"))); }
        else if ($("prev").getAttribute("aria-disabled") !== "true") prev(centre($("prev")));
      } else if (st.view === "question" && /^[1-4]$/.test(k)) {
        e.preventDefault(); var i = +k - 1, inp = qa("#qbody input")[i];
        if (inp) { inp.focus({ preventScroll: true }); select(i, true); }
      } else if (k === "Escape" && st.view === "analysis") { e.preventDefault(); showResult(); }
      else if (k === "Enter" && st.view === "question" && tag === "input") { e.preventDefault(); next(); }
    });
  }

  /* ---------- boot ---------- */
  function boot() {
    try {
      if (!S || !Q || !I18N || !E) throw new Error("Massari data failed to load");
      E.validate(S, Q);
      $("badgeMark").innerHTML = IC ? IC.logoMark() : "";
      $("themeBtn").innerHTML = ic(st.theme === "dark" ? "sun" : "moon");
      $("prev").innerHTML = '<span class="arrow">' + ic("caret-left") + "</span>";
      $("next").innerHTML = '<span class="arrow">' + ic("caret-right") + "</span>";
      try { if (SC) backdrop = SC.backdrop($("backdrop"), { theme: st.theme }); } catch (e) { console.error(e); }
      if (backdrop && backdrop.setProgress) backdrop.setProgress(0);
      H.setAttribute("data-view", "intro");
      render(); chrome(); bind();
      M.enter($("view"), { direction: 1 });
      mount(false);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeKnob);
    } catch (e) {
      console.error(e);
      $("view").innerHTML = '<p class="lead" role="alert" style="padding:40px 0;text-align:center">' + esc(t("errorGeneric")) + "</p>";
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
