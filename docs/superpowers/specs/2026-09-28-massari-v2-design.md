# Massari v2 — full redesign spec

Date: 2026-09-28. Status: approved in chat ("Approve, go"). Replaces everything in v1. Nothing from v1 is kept on purpose.

## 1. Intent

A bilingual (Arabic-first, English) "Which Vision 2030 sector suits you?" experience that feels like a self-contained, cinematic product, not a slideshow. It is finished in **under 2 minutes**. It is an independent, illustrative tool: not official, not career advice.

Success =
- Someone opening `index.html` by double-click gets a dramatic, smooth, alive experience in both languages and both themes.
- Questions feel psychologically real (situational, no obvious "right" answer, no answer names its sector).
- Arabic reads as if written by a native Saudi copywriter, gender-neutral.
- Every rule in `CLAUDE.md` holds (local-only assets, no remote links, files < 10 MB, demo-speed controls, sample data, names).

User decisions (from Q&A):
- Landmarks: **both** — real openly licensed photos in the showcase (intermission); code-drawn animated faceted ("high-poly") scenes on result + PNG card.
- Sectors: **6** — tourism, technology, health, finance, culture (Culture & Entertainment), energy (Energy & Sustainability).
- Depth: **profile + top 2**, but whole quiz ≤ 2 minutes.
- Style: **soft neumorphism, sand (light) + desert night (dark)**, with extensive micro-animations; "elements need to speak".
- Engine: vanilla JS classic scripts + vendored GSAP 3.15 (+ free plugins).

## 2. Screens and flow

Six views. Global chrome on every view: top bar (logo lockup, language segmented control, theme toggle) and **edge chevrons** `‹ ›` vertically centred on the page sides (mirrored in RTL; ← → keys also navigate, swapped in RTL). Forward chevron disabled until the current step allows it.

1. **intro** — introduction only. Centred single column. Animated logo reveal (stroke draw → fill → idle breathing glow), headline split-reveal, one-line purpose, three fact pills (12 questions · under 2 minutes · 6 sectors), primary "Start" button, small disclaimer. Backdrop: quiet living faceted dune field + drifting sand particles (canvas). **No photos, no showcase, no demo** here.
2. **intermission** — the showcase. Cinematic full-bleed photo stage cycling the 6 sector landmarks (Ken-Burns drift + masked wipe transitions, auto-advance ~3.5 s, pausable, dot/chevron controls), each with sector name, one-line tagline, photo credit. Beside/below: "how it works" in 3 animated beats (answer → we map signals → see your path). Actions: "Begin" (primary), "See an example result" (demo, loads `sample-data/data.js`).
3. **question** ×12 — scenario prompt (≤ 110 chars EN), 4 neumorphic answer cards each with a duotone icon. Keys 1–4 select. On select: card presses in (inset shadow), ripple, the card's `whisper` line appears briefly near the progress path ("You think in systems"), the icon flies (GSAP Flip) into the matching node of the 12-node path progress, node lights, next question auto-arrives after ~650 ms. Back chevron returns to previous question with previous answer still pressed. Changing a previous answer is allowed.
4. **analysis** (~5 s, skippable "Show result now") — the 12 chosen icons converge into a constellation, lines draw between them, the 4-trait radar forms, the 6 sector bars sort themselves, winner glows. Status lines cycle (live-region announced). Purely presentational; the result is already computed.
5. **result** — winner colour floods in (clip-path circle). Hero: animated faceted scene for the winning sector (canvas), sector name, match % counting up, tagline + description. Blocks: "Why this fits you" (2–3 bullets from the user's strongest answers' `signal` text), runner-up sector card with its %, trait radar (people / ideas / data / hands-on), all six sector bars, 3 example roles, 3 skills to explore. Actions: Download PNG card, Retake (back to intro).
6. Retake returns to **intro** with state reset.

Chevron semantics: intro › = intermission; intermission ‹ = intro, › = first question; question ‹ = previous question (or intermission from Q1), › = next question (only if answered; on Q12 › = analysis); analysis ‹ = Q12, › = skip to result; result ‹ = Q12 (edit answers), no ›.

Timing budget: intro 10 s + intermission 15 s + 12 × 6 s + analysis 5 s ≈ 1:45.

## 3. Content model

All bilingual strings inline as `{ en, ar }`. Files are classic scripts that set `window.*` and also `module.exports` for Node tests.

### `data/sectors.js` → `window.MASSARI_SECTORS` (array of 6, fixed order)
```
{ id, color, colorDark, icon,            // icon = Phosphor name
  photo: { file, alt:{en,ar}, credit:{author, license, source} },
  traits: { people, ideas, data, hands }, // 0..1, sector profile for tie-break
  name:{en,ar}, tagline:{en,ar}, description:{en,ar},
  roles:[{en,ar} ×3], skills:[{en,ar} ×3] }
```
IDs: `tourism, technology, health, finance, culture, energy`.

### `data/questions.js` → `window.MASSARI_QUESTIONS` (array of 12)
```
{ id, theme:{en,ar} /* e.g. "Energy", "Pressure" */, prompt:{en,ar},
  answers:[ ×4 { id, icon, label:{en,ar}, whisper:{en,ar}, signal:{en,ar},
                 p: sectorId /* +2 */, s: sectorId /* +1 */, t: trait } ] }
```
- `label` ≤ 60 chars EN; must not name or obviously stereotype its sector.
- `whisper` = short reactive line shown on select (≤ 36 chars EN).
- `signal` = second-person sentence used in "Why this fits you".

**Balance rules (enforced by tests):**
1. In each question, the 4 `p` values are 4 distinct sectors; the 2 remaining sectors each appear exactly once as an `s` in that question; an answer's `s` ≠ its `p`.
2. Across 12 questions every sector is `p` exactly 8 times and `s` exactly 8 times.
3. Therefore every sector's max possible score = 20. Test asserts equality.
4. In each question the 4 answers carry the 4 distinct traits (`people, ideas, data, hands`).

Question themes must cover distinct psychological angles (e.g. what energises you, a problem you can't leave alone, your role under pressure, ideal day's texture, what you'd want to be thanked for, learning style, risk/stability, working with people vs. systems vs. things, legacy/impact scale, environment, how you decide, a Saturday project). Situational framing, present tense, concrete.

### `data/i18n.js` → `window.MASSARI_I18N` = `{ en:{...}, ar:{...} }`
Flat UI key maps; identical key sets; `{name}` placeholders. Arabic is gender-neutral (verbal nouns, first-person plural, nominal sentences; no masculine-only imperatives like "اكتشف/اختر" addressed at the user).

### `sample-data/data.js` → `window.MASSARI_SAMPLE`
`{ answers: { questionId: answerId, ... } }` — one complete made-up answer set used by "See an example result".

## 4. Engine (`js/engine.js`, pure, Node-testable) → `window.MassariEngine`
- `validate(sectors, questions)` — throws on schema/balance violations above.
- `maxScores(sectors, questions)` → `{sectorId: max}`.
- `score(sectors, questions, answers)` → `{ scores, percents, traits /* counts 0..12 */, traitPercents, ranked:[{id, score, percent, similarity}], winner, runnerUp, why:[{questionId, answerId}] }`.
  - percent = round(score / max × 100).
  - Ties broken by cosine similarity between user trait vector and sector `traits`, then sector order.
  - `why` = up to 3 selected answers with `p === winner` (then `s === winner`), in question order.
- Throws on missing/invalid answers.

## 5. Visual system

- Fonts (local, OFL): **IBM Plex Sans Arabic** (text, 400/500/600/700) and **Readex Pro** (display, variable/600–700), woff2 Arabic + Latin subsets in `assets/fonts/` with OFL text.
- Icons: **Phosphor** (MIT), duotone weight for content icons, regular/bold for UI. Only the used icons are extracted into `js/icons.js` as path strings (inline SVG so `currentColor` and animation work under `file://`).
- Logo: glyph sourced from an open icon set sweep, refined into a mark (route/compass idea) inside a neumorphic badge + bilingual wordmark "مساري | Massari". Drawn as inline SVG; also drawable to canvas for the PNG card.
- Tokens (`css/tokens.css`): sand light theme (bg ≈ `#EDE3D3`, highlight shadow ≈ `#FFF9EF`, depth shadow ≈ `#CDBDA3`, ink ≈ `#2B2620`, deep green ≈ `#0E5A43`, gold ≈ `#B7862B`) and desert night (bg ≈ `#171B21`, highlight ≈ `#222831`, depth ≈ `#0C0F13`, ink ≈ `#F3EBDD`, glow gold ≈ `#E9C46A`, teal ≈ `#5CC8B8`). Neumorphic surfaces via paired shadows: `--raise`, `--raise-sm`, `--press`, plus a hairline border for contrast. All text pairs meet WCAG AA (tested).
- Per-sector accent colours for light/dark.
- `html[data-theme]`, `html[dir]`, logical properties everywhere.

## 6. Motion (`js/motion.js`, GSAP with reduced-motion fallback)
- View transition "portal": outgoing elements stagger out toward travel direction with slight blur/depth; a sand/night veil sweeps as a clip-path circle from the clicked chevron/button; incoming headline split-reveals by words/chars; cards rise with springy press settle.
- Micro-interactions: magnetic chevrons with arrow nudge; buttons breathe on idle; press = inset shadow + scale .98; theme toggle morphs sun↔moon; language switch cross-fades text and flips layout direction with a mirrored sweep; counters count up; radar draws (DrawSVG) and morphs; progress nodes pulse when lit.
- `prefers-reduced-motion: reduce` → 150 ms opacity cross-fades only, no parallax, no auto-advancing slideshow.
- If GSAP fails to load, app still works (plain rendering, no animation).

## 7. Scenes (`js/scenes.js`) → `window.MassariScenes`
- Seeded Bowyer-Watson triangulation of layered silhouettes → shaded facets (light direction × facet normal approximation + seeded jitter) = faceted "high-poly" look.
- `backdrop(canvas, theme)` — living dune field + particles for intro/other views (low opacity, paused when tab hidden).
- `sector(canvas, sectorId, theme, {animate})` — six scenes: tourism (Hegra-like rock tomb, stars), technology (arched tower + circuit constellation), health (Asir-like terraced mountains + pulse line), finance (skyline of faceted towers + rising line), culture (Najdi mud-brick towers with triangular crenellations + lanterns), energy (dunes + solar array + sun/wind).
- `drawStatic(ctx, sectorId, theme, rect)` for the PNG card.

## 8. PNG card (`js/card.js`)
1080×1350 portrait, drawn only with code (no photo files): background tokens, sector scene via `drawStatic`, logo, sector name, match %, runner-up, trait bars, 3 roles, disclaimer. Uses the loaded web fonts (awaits `document.fonts.ready`). RTL aware. Filename `massari-<sector>-<lang>.png`.

## 9. Photos (`assets/photos/`)
6 photos, one per sector (e.g. Hegra/AlUla, At-Turaif Diriyah, Riyadh skyline, KAFD, Asir/Abha, Red Sea / solar / Edge of the World), from Wikimedia Commons under CC0 / PD / CC BY / CC BY-SA. Resized to ~1600 px long side, WebP ~q78, each ≤ 450 KB. `CREDITS.md` lists title, author, licence, source page, changes made. Credit shown on the photo in the showcase. Photos are never drawn onto the PNG card.

## 10. Files
```
index.html
css/tokens.css  css/app.css
data/sectors.js  data/questions.js  data/i18n.js
sample-data/data.js  sample-data/README.txt
js/icons.js  js/engine.js  js/scenes.js  js/motion.js  js/card.js  js/app.js
vendor/gsap/{gsap,SplitText,Flip,DrawSVGPlugin,MorphSVGPlugin,CustomEase}.min.js + LICENSE.md
assets/fonts/*.woff2 + OFL.txt   assets/photos/*.webp   CREDITS.md
tests/engine.test.js  tests/content.test.js  tests/i18n.test.js  tests/contrast.test.js
scripts/check-project.js  package.json  README.md
```
Old files not in this list are deleted.

## 11. Accessibility
Skip link; one `h1` per view focused after transition; answers are real radio inputs in a fieldset/legend (visually replaced by cards); visible focus rings on neumorphic controls; `aria-live` status for question changes, analysis stages, result; progressbar semantics; chevrons have localized `aria-label`s; `lang`/`dir` on `html`; all motion respects reduced-motion.

## 12. Verification
- `npm test` (node:test): engine scoring/ties/why, balance rules, content length/no-sector-name-in-label, i18n parity + Arabic script present + no masculine-imperative blacklist words in AR UI copy, contrast of token pairs.
- `npm run check`: required files exist; no `http(s)://` in own source (vendor excluded); every file < 10 MB; names match `^[A-Za-z0-9_\-.]+$` per segment; index.html references resolve; photos listed in CREDITS.md.
- Playwright: every view × {en, ar} × {light, dark} × {1440×900, 390×844} screenshots, no console errors, full keyboard run-through, example-result path, PNG download.
