# Which Vision 2030 sector suits you?

## What it does

A quick, mobile-friendly, 10-question self-reflection quiz. It suggests one illustrative best-match sector from Tourism, Technology, Health, Finance, or Culture and Entertainment, then shows two example job directions and a score chart.

The sector descriptions, job examples, questions, and scores are **neutral illustrative examples**. They are not official Vision 2030 information, employment advice, or a formal career assessment.

## Who it is for

Visitors who want a simple, friendly starting point for thinking about the kind of work, projects, and impact that interests them.

## Needs

A modern web browser. No installation, account, server, API key, or internet connection is required.

## How to run it

1. Download or clone this project.
2. Open `index.html` by double-clicking it.
3. Answer the ten questions and view the result.

For checks in a terminal with Node.js installed:

```sh
npm test
npm run check
npm run build
```

## Try it with the sample data

The quiz starts with its own built-in illustrative questions. It does not save or upload answers: choices exist only in the current browser tab.

To replace quiz content:

- Edit sector descriptions, example jobs, icons, and chart colors in `data/sectors.js`.
- Edit questions, answer labels, and score mappings in `data/questions.js`.

The result page includes **Download my result**, which creates a PNG locally in the browser without uploading any information.

Built with Claude Code during the KKU Claude Code hackathon
Started on 2026-09-27
