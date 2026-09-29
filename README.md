# مساري | Massari

Massari is an independent illustrative tool, not an official Vision 2030 or government product, and it is not career advice.

## What it does

It takes answers to 12 everyday scenario questions and gives an illustrative Vision 2030 sector-fit result, including a ranked score view and a downloadable result card.

## Who it is for

It is for people who want a short, bilingual Arabic/English way to explore which broad sector may match the activities and impact that interest them.

## Needs

The app needs nothing but a modern browser. It runs locally, works offline, and does not need an account, API key, database, or internet connection. Node.js is optional and is only needed to run the project checks.

## How to run it

1. Download or clone this repository and open the project folder.
2. Double-click `index.html` to use the app directly in a browser.

Optional local-server preview from the project folder:

### Windows

```sh
py -m http.server 8000
```

Open `http://127.0.0.1:8000/` in a browser.

### Mac

```sh
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000/` in a browser.

## Try it with the sample data

1. Select **Begin**.
2. Select **See an example result**.
3. The app uses the built-in, made-up answer set in `sample-data/data.js` and shows an illustrative result. No real person's data is included.

## Image/output example

After a result appears, select the download control to create a local PNG result card. The browser saves it as `massari-<sector>-<language>.png` in its usual download location. The card is generated on demand from the illustrative result; it is not uploaded anywhere.

## Timer/skip explanation

After question 12, the analysis screen lasts five seconds. Select **Show result now** to skip it and see the result immediately, so every feature can be demonstrated in under one minute.

## Privacy

Answers stay in the open browser tab and are never saved or uploaded. Only the selected language and theme are remembered in the browser.

## Checks (optional, requires Node.js)

```sh
npm test
npm run check
npm run build
```

## Credits

Photos, fonts, and local libraries are listed in [CREDITS.md](CREDITS.md).

Built with Claude Code during the KKU Claude Code hackathon.
