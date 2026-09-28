# مساري | Massari

## What it does

Massari is a polished, bilingual (Arabic/English) 10-question self-reflection quiz. It suggests one illustrative best-match sector from Tourism, Technology, Health, Finance, or Culture and Entertainment, then shows two example career directions and a score chart.

It is inspired by future-focused pathways and opportunity, but it is an **independent illustrative project**. It is not an official Vision 2030, Saudi government, or government-owned product. The sector descriptions, roles, questions, and scores are examples only—not official information, employment advice, or a formal career assessment.

## Run it locally

A modern web browser is all that is required. No account, server, API key, internet connection, or installation is needed.

1. Download or clone this project.
2. Open `index.html` by double-clicking it.
3. Choose `العربية` or `English`, move through the two short introduction screens, answer the questions, and view the result.

After question 10, Massari shows a six-second illustrative analysis sequence. It does **not** alter or delay the actual score calculation. Use **Show result now / اعرض النتيجة الآن** at any time to skip directly to the same result; this is the built-in demo-speed control.

Answers exist only in the current browser tab. They are not saved or uploaded. The chosen language and light/dark appearance may be remembered in the browser so the interface opens in the same style next time.

For checks in a terminal with Node.js installed:

```sh
npm test
npm run check
npm run build
```

## Edit content and visuals

- **Arabic and English interface text:** edit `data/translations.js`.
  - The `en.ui` and `ar.ui` sections contain interface, accessibility, download-card, and status text.
  - Arabic sector/job/question/answer text is keyed by existing stable IDs in `ar.sectors` and `ar.questions`.
- **English illustrative sectors and score-neutral content:** edit `data/sectors.js`.
- **English questions and scoring mappings:** edit `data/questions.js`.
  - Keep sector IDs, question IDs, answer IDs, ordering, and `scores` mappings unchanged if you want to preserve quiz results.
- **Colors and light/dark theme tokens:** edit the semantic variables at the top of `css/styles.css`.
- **Original Massari logo, two introduction scenes, and per-sector result visuals:** edit `js/massari-visuals.js`.
- **Screen flow and the six-second analysis presentation:** edit `js/app.js` and `js/analysis-timer.js`.
- **PNG result-card layout and canvas styling:** edit `js/download-card.js`.

The result page includes a local **Download my result / نزّل نتيجتي** action. It creates a PNG in the browser without uploading information.

Built with Claude Code during the KKU Claude Code hackathon

Started on 2026-09-27
