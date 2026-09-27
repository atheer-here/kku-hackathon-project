const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const files = [
  "index.html", "css/styles.css", "data/sectors.js", "data/questions.js",
  "js/quiz-engine.js", "js/download-card.js", "js/app.js", "package.json"
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
const sourceFiles = ["index.html", "css/styles.css", "data/sectors.js", "data/questions.js", "js/quiz-engine.js", "js/download-card.js", "js/app.js"];
sourceFiles.forEach((file) => {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  if (/https?:\/\//i.test(text)) throw new Error(`Remote URL found in shipped file: ${file}`);
});
["data/sectors.js", "data/questions.js", "js/quiz-engine.js", "js/download-card.js", "js/app.js"].forEach((file) => {
  const check = spawnSync(process.execPath, ["--check", path.join(root, file)], { encoding: "utf8" });
  if (check.status !== 0) throw new Error(`Syntax error in ${file}: ${check.stderr}`);
});
console.log("Static project checks passed.");
