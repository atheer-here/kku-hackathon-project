# مساري | Massari

Massari is a short, bilingual (Arabic first, English) experience that asks 12 everyday scenario questions and shows which Vision 2030 sector may suit you, with an animated result scene and a downloadable result card. It is an independent illustrative tool: it is **not** an official Vision 2030 or government product, and it is **not** career advice.

## Run

Double-click `index.html`. It works offline with no install, account or API key.

## One-minute demo

1. Press **Begin**, then **See an example result** to jump straight to a result built from `sample-data/data.js`.
2. Or answer quickly: keys **1–4** pick an answer, **←/→** move between questions. The whole quiz takes under 2 minutes.
3. After the last question, **Show result now** skips the 5-second analysis (the demo-speed control).

## Features

- Arabic and English, with gender-neutral Arabic; light (sand) and dark (desert night) themes.
- Progress path of Najdi crenellation nodes, back/forward chevrons, keyboard control.
- Constellation-style analysis screen, animated sector scenes and real sector photos.
- Downloadable result card image, drawn with code.

## Privacy

Answers stay in the open browser tab and are never saved or uploaded. Only the chosen language and theme are remembered.

## Where to edit

- `data/sectors.js`: sectors, roles, photos.
- `data/questions.js`: questions, answers and scores (keep the balance rules noted in the file so no sector is favoured).
- `data/i18n.js`: interface text in both languages.
- `css/tokens.css`: colours, shadows and theme tokens.
- `js/scenes.js`: the animated result scenes.

## Checks (Node.js)

```sh
npm test        # unit tests
npm run check   # static project checks (files, links, sizes, names)
npm run build   # both
```

## Credits

Photos, fonts and libraries are listed in [CREDITS.md](CREDITS.md).

Built with Claude Code during the KKU Claude Code hackathon. Started on 2026-09-27.
