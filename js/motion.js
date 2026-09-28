/* Massari motion: GSAP choreography. Every export resolves/no-ops without GSAP; reduced motion gets 150 ms fades.
   Signature: leaving elements sink into the sand (shadow depth --d -> 0, scale down, fade),
   entering elements rise out of it (--d 0 -> 1, staggered); headlines reveal word by word (never letters). */
(function (root) {
  "use strict";
  var g = function () { return root.gsap; };
  function reduced() { try { return root.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }
  function enabled() { return !!g() && !reduced(); }
  function done(tw) { return new Promise(function (res) { if (!tw) return res(); tw.eventCallback("onComplete", res); }); }
  var registered = false;
  function reg() {
    if (registered || !g()) return;
    registered = true;
    ["Flip", "DrawSVGPlugin", "MorphSVGPlugin", "CustomEase"].forEach(function (p) { if (root[p]) g().registerPlugin(root[p]); });
    if (root.CustomEase) root.CustomEase.create("rise", "M0,0 C0.14,0 0.24,0.96 0.46,1.04 0.62,1.08 0.8,1 1,1");
  }
  var RISE = function () { return root.CustomEase ? "rise" : "back.out(1.4)"; };

  // Wrap words of every [data-split] heading in masks. Idempotent. Words only: Arabic letters must stay joined.
  function splitWords(el) {
    if (!el || el.dataset.splitDone) return [];
    el.dataset.splitDone = "1";
    var out = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement("span"), i = document.createElement("span");
            w.className = "w"; i.textContent = part; w.appendChild(i); frag.appendChild(w); out.push(i);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !/^(svg|kbd)$/i.test(n.nodeName)) walk(n);
      });
    })(el);
    return out;
  }

  function items(rootEl) { return Array.prototype.slice.call(rootEl.querySelectorAll("[data-m]")); }

  function leave(rootEl, o) {
    o = o || {};
    if (!rootEl) return Promise.resolve();
    if (!g()) return Promise.resolve();
    reg();
    if (reduced()) return done(g().to(rootEl, { opacity: 0, duration: 0.15 }));
    var dir = o.direction || 1, rtl = document.documentElement.dir === "rtl", els = items(rootEl);
    if (!els.length) els = [rootEl];
    var fast = !!o.fast;
    var tl = g().timeline();
    tl.to(els, { "--d": 0, duration: fast ? 0.16 : 0.26, ease: "power2.in", stagger: { each: fast ? 0.012 : 0.025, amount: fast ? 0.08 : 0.2 } }, 0)
      .to(els, { opacity: 0, scale: 0.965, y: 8, x: (rtl ? 1 : -1) * dir * (fast ? 14 : 24), filter: "blur(2px)",
        duration: fast ? 0.2 : 0.3, ease: "power2.in", stagger: { each: fast ? 0.012 : 0.025, amount: fast ? 0.08 : 0.2 } }, fast ? 0.04 : 0.08);
    return done(tl);
  }

  function enter(rootEl, o) {
    o = o || {};
    if (!rootEl) return Promise.resolve();
    rootEl.style.opacity = "";
    if (!g()) return Promise.resolve();
    reg();
    if (reduced()) return done(g().fromTo(rootEl, { opacity: 0 }, { opacity: 1, duration: 0.15 }));
    var dir = o.direction || 1, rtl = document.documentElement.dir === "rtl", fast = !!o.fast;
    var els = items(rootEl);
    var words = [];
    Array.prototype.slice.call(rootEl.querySelectorAll("[data-split]")).forEach(function (h) { words = words.concat(splitWords(h)); });
    var tl = g().timeline();
    g().set(els, { opacity: 0, "--d": 0, y: 18, x: (rtl ? -1 : 1) * dir * (fast ? 10 : 18), scale: 0.985, filter: "none" });
    if (words.length) {
      g().set(words, { yPercent: 105 });
      tl.to(words, { yPercent: 0, duration: fast ? 0.4 : 0.7, ease: "power3.out", stagger: fast ? 0.018 : 0.035 }, 0);
    }
    var each = fast ? 0.03 : 0.06, stag = { each: each, amount: Math.min(els.length * each, fast ? 0.2 : 0.6) }; // cap: long pages must not trickle in
    tl.to(els, { opacity: 1, y: 0, x: 0, scale: 1, duration: fast ? 0.34 : 0.6, ease: "power3.out", stagger: stag }, fast ? 0 : 0.05)
      .to(els, { "--d": 1, duration: fast ? 0.36 : 0.7, ease: RISE(), stagger: stag, clearProps: "transform,filter" }, fast ? 0.06 : 0.15);
    return done(tl);
  }

  // Veil sweep: a circle of sand (or the sector colour) grows from the pressed control, the view swaps under it, then it lifts.
  function veil(origin, o) {
    o = o || {};
    var v = document.getElementById("veil");
    if (!v || !enabled()) return { cover: Promise.resolve(), lift: function () { return Promise.resolve(); } };
    reg();
    var x = origin ? origin.x : innerWidth / 2, y = origin ? origin.y : innerHeight / 2;
    var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 20;
    v.className = o.flood ? "flood" : "";
    g().killTweensOf(v);
    g().set(v, { visibility: "visible", opacity: 1, clipPath: "circle(0px at " + x + "px " + y + "px)" });
    var cover = done(g().to(v, { clipPath: "circle(" + r + "px at " + x + "px " + y + "px)", duration: o.flood ? 0.75 : 0.5, ease: "power3.inOut" }));
    return {
      cover: cover,
      lift: function () {
        return done(g().to(v, { opacity: 0, duration: o.flood ? 0.7 : 0.45, ease: "power2.out", onComplete: function () { g().set(v, { visibility: "hidden" }); } }));
      }
    };
  }

  // Clone the answer icon and fly it on an arc into the progress node.
  function flyToNode(fromEl, toEl) {
    if (!fromEl || !toEl || !enabled()) return Promise.resolve();
    reg();
    var a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    var f = document.createElement("div");
    f.className = "flyer";
    f.innerHTML = fromEl.innerHTML;
    var size = Math.max(28, a.width * 0.7);
    f.style.cssText = "width:" + size + "px;height:" + size + "px;left:0;top:0;font-size:" + size * 0.55 + "px";
    document.body.appendChild(f);
    var sx = a.left + a.width / 2 - size / 2, sy = a.top + a.height / 2 - size / 2;
    var ex = b.left + b.width / 2 - size / 2, ey = b.top + b.height * 0.62 - size / 2;
    var s = Math.max(0.35, b.width * 0.62 / size);
    var tl = g().timeline({ onComplete: function () { f.remove(); } });
    tl.set(f, { x: sx, y: sy })
      .to(f, { x: ex, duration: 0.62, ease: "power1.inOut" }, 0)
      .to(f, { y: ey, duration: 0.62, ease: "back.in(1.3)" }, 0)
      .to(f, { scale: s, rotation: 360 * (document.documentElement.dir === "rtl" ? -1 : 1), duration: 0.62, ease: "power2.in" }, 0)
      .to(f, { opacity: 0, duration: 0.12 }, 0.54);
    return done(tl);
  }

  function countUp(el, to, o) {
    o = o || {};
    var fmt = o.format || function (v) { return String(Math.round(v)); };
    if (!el) return Promise.resolve();
    if (!enabled()) { el.textContent = fmt(to); return Promise.resolve(); }
    var st = { v: o.from || 0 };
    return done(g().to(st, { v: to, duration: o.duration || 1.2, ease: "power2.out", delay: o.delay || 0, onUpdate: function () { el.textContent = fmt(st.v); } }));
  }

  function drawRadar(svgEl) {
    if (!svgEl || !enabled()) return Promise.resolve();
    reg();
    var tl = g().timeline();
    var grid = svgEl.querySelectorAll(".radar-grid, .radar-axis"), shape = svgEl.querySelector(".radar-shape");
    var dots = svgEl.querySelectorAll(".radar-dot"), txt = svgEl.querySelectorAll("text");
    if (root.DrawSVGPlugin) tl.from(grid, { drawSVG: "0%", duration: 0.8, stagger: 0.06, ease: "power2.out" }, 0);
    else tl.from(grid, { opacity: 0, duration: 0.6, stagger: 0.06 }, 0);
    tl.from(txt, { opacity: 0, y: 6, duration: 0.4, stagger: 0.05 }, 0.3);
    if (shape) tl.from(shape, { scale: 0, transformOrigin: "50% 50%", svgOrigin: "150 150", duration: 0.9, ease: "back.out(1.6)" }, 0.45);
    tl.from(dots, { scale: 0, svgOrigin: "150 150", opacity: 0, duration: 0.5, stagger: 0.07, ease: "back.out(2)" }, 0.7);
    return done(tl);
  }

  // Logo: star traces its outline, fills, the route sweeps up, the destination pops.
  function logoReveal(svgEl) {
    if (!svgEl || !enabled()) return Promise.resolve();
    reg();
    var star = svgEl.querySelector(".m-star"), route = svgEl.querySelector(".m-route"), dot = svgEl.querySelector(".m-dot");
    var tl = g().timeline();
    if (star && root.DrawSVGPlugin) {
      tl.set(star, { fillOpacity: 0, stroke: "currentColor", strokeWidth: 1.6 })
        .from(star, { drawSVG: "0%", duration: 0.9, ease: "power2.inOut" })
        .to(star, { fillOpacity: 1, strokeWidth: 0, duration: 0.45 }, "-=0.15");
    } else if (star) tl.from(star, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%", duration: 0.6 });
    tl.from(star, { rotation: -45, svgOrigin: "32 32", duration: 1.3, ease: "power3.out" }, 0);
    if (route) tl.from(route, { opacity: 0, scale: 0.2, svgOrigin: "21 48", duration: 0.6, ease: "back.out(1.7)" }, "-=0.3");
    if (dot) tl.from(dot, { scale: 0, svgOrigin: "42.5 23.5", duration: 0.55, ease: "elastic.out(1, 0.45)" }, "-=0.25");
    return done(tl);
  }

  function magnetic(el) {
    if (!el || !enabled() || !root.matchMedia("(hover: hover)").matches) return function () {};
    var xTo = g().quickTo(el, "x", { duration: 0.5, ease: "power3.out" }), yTo = g().quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    function move(e) {
      var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy);
      if (d < 120 && el.getAttribute("aria-disabled") !== "true") { xTo(dx * 0.22); yTo(dy * 0.22); } else { xTo(0); yTo(0); }
    }
    root.addEventListener("pointermove", move, { passive: true });
    return function () { root.removeEventListener("pointermove", move); g().set(el, { x: 0, y: 0 }); };
  }

  // Theme icon swap: old glyph spins away, new one spins in.
  function swapIcon(btn, html) {
    if (!btn) return;
    if (!enabled()) { btn.innerHTML = html; return; }
    var old = btn.firstElementChild;
    g().to(old, { rotation: -90, scale: 0, opacity: 0, duration: 0.22, ease: "power2.in", onComplete: function () {
      btn.innerHTML = html;
      g().from(btn.firstElementChild, { rotation: 90, scale: 0, opacity: 0, duration: 0.45, ease: "back.out(2)" });
    } });
  }

  root.MassariMotion = { enabled: enabled, leave: leave, enter: enter, veil: veil, flyToNode: flyToNode, countUp: countUp,
    drawRadar: drawRadar, logoReveal: logoReveal, magnetic: magnetic, swapIcon: swapIcon, splitWords: splitWords };
})(window);
