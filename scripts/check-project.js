const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const files = [
  "index.html", "css/styles.css", "data/sectors.js", "data/questions.js", "data/translations.js",
  "js/quiz-engine.js", "js/massari-visuals.js", "js/download-card.js", "js/app.js", "package.json"
];
for (const file of files) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing required file: ${file}`);
}
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
references.forEach((reference) => {
  if (reference.startsWith("#")) return;
  if (/^(https?:|\/\/)/i.test(reference)) throw new Error(`Remote reference is not allowed: ${reference}`);
  if (!fs.existsSync(path.join(root, reference))) throw new Error(`Missing referenced file: ${reference}`);
});
const sourceFiles = ["index.html", "css/styles.css", "data/sectors.js", "data/questions.js", "data/translations.js", "js/quiz-engine.js", "js/massari-visuals.js", "js/download-card.js", "js/app.js"];
sourceFiles.forEach((file) => {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  if (/https?:\/\//i.test(text)) throw new Error(`Remote URL found in shipped file: ${file}`);
});
const stylesheet = fs.readFileSync(path.join(root, "css/styles.css"), "utf8");
if (!stylesheet.includes("--bg:") || !stylesheet.includes('html[data-theme="dark"]')) throw new Error("Theme token layers are missing from the stylesheet.");
if (!stylesheet.includes('[dir="rtl"]') || !stylesheet.includes("border-inline-start")) throw new Error("RTL-aware logical styling is missing from the stylesheet.");
if (!html.includes("vision-sector-theme") || !html.includes("massari-language") || !html.includes("color-scheme") || !html.includes("document.documentElement.dir")) throw new Error("Pre-paint theme and language bootstrap is missing from index.html.");
if (!html.includes('src="data/translations.js"') || !html.includes('src="js/massari-visuals.js"')) throw new Error("Massari localization or visual scripts are not loaded.");
const appScript = fs.readFileSync(path.join(root, "js/app.js"), "utf8");
if (!appScript.includes("theme-toggle") || !appScript.includes("language-toggle") || !appScript.includes("aria-pressed")) throw new Error("Accessible theme or language controls are missing from app.js.");
const visualScript = fs.readFileSync(path.join(root, "js/massari-visuals.js"), "utf8");
if (!visualScript.includes("journeyScene") || !visualScript.includes("sectorScene") || !visualScript.includes("drawSectorScene") || !visualScript.includes("drawLogo")) throw new Error("Shared Massari SVG and Canvas scene renderers are missing.");
if (!stylesheet.includes("prefers-reduced-motion") || !stylesheet.includes("--on-strong") || !stylesheet.includes(".chart-row.is-winner")) throw new Error("Massari visual accessibility and winner styling are incomplete.");
["data/sectors.js", "data/questions.js", "data/translations.js", "js/quiz-engine.js", "js/massari-visuals.js", "js/download-card.js", "js/app.js"].forEach((file) => {
  const check = spawnSync(process.execPath, ["--check", path.join(root, file)], { encoding: "utf8" });
  if (check.status !== 0) throw new Error(`Syntax error in ${file}: ${check.stderr}`);
});
console.log("Static project checks passed.");
