// Static checks for Massari. No dependencies: node scripts/check-project.js
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execSync, execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const fail = (msg) => { throw new Error("Project check failed: " + msg); };
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

// Exact-case existence: Windows ignores case, so compare against real directory listings.
function existsExact(rel) {
  let dir = root;
  for (const seg of rel.split("/").filter(Boolean)) {
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return false;
    if (!fs.readdirSync(dir).includes(seg)) return false;
    dir = path.join(dir, seg);
  }
  return true;
}

const required = [
  "index.html", "css/fonts.css", "css/tokens.css", "css/app.css",
  "data/sectors.js", "data/questions.js", "data/i18n.js", "sample-data/data.js",
  "js/icons.js", "js/engine.js", "js/scenes.js", "js/motion.js", "js/card.js", "js/app.js",
  "vendor/gsap/gsap.min.js", "CREDITS.md",
];
for (const f of required) if (!existsExact(f)) fail(`missing required file (exact case): ${f}`);

// Local references in index.html
const html = read("index.html");
for (const m of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/g)) {
  const ref = m[1].split(/[?#]/)[0];
  if (!ref || /^(#|data:|mailto:|javascript:)/.test(m[1])) continue;
  if (!existsExact(ref)) fail(`index.html references missing file (check exact case): ${m[1]}`);
}

function walk(dir) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) => {
    const rel = dir + "/" + e.name;
    return e.isDirectory() ? walk(rel) : [rel];
  });
}

// No internet links in app code (vendor excluded)
const own = ["index.html", ...["css", "data", "js", "sample-data"].flatMap(walk)];
for (const f of own) {
  if (!/\.(html|css|js|json|txt|md)$/.test(f)) continue;
  if (/https?:\/\//.test(read(f))) fail(`${f} contains an http(s) link; everything must be local`);
}

// Every css url(...) resolves
for (const f of walk("css").filter((f) => f.endsWith(".css"))) {
  for (const m of read(f).matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
    if (/^(data:|#)/.test(m[1])) continue;
    const rel = path.posix.normalize(path.posix.join(path.posix.dirname(f), m[1].split(/[?#]/)[0]));
    if (!existsExact(rel)) fail(`${f} url(${m[1]}) not found (check exact case)`);
  }
}

// Tracked + untracked (not ignored) files: size and names
let files;
try {
  files = execSync("git ls-files -co --exclude-standard", { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);
} catch { fail("git ls-files failed; run inside the git repository"); }
for (const f of files) {
  if (!fs.existsSync(path.join(root, f))) continue; // deleted but still in index
  for (const seg of f.split("/")) {
    if (!/^[A-Za-z0-9._-]+$/.test(seg)) fail(`bad file name (use only A-Z a-z 0-9 . _ -): ${f}`);
  }
  if (fs.statSync(path.join(root, f)).size >= 10 * 1024 * 1024) fail(`file is 10 MB or larger: ${f}`);
}

// Every sector photo is credited
const sandbox = { window: {} };
sandbox.self = sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(read("data/sectors.js"), sandbox);
const sectors = sandbox.window.MASSARI_SECTORS || sandbox.MASSARI_SECTORS;
if (!Array.isArray(sectors)) fail("data/sectors.js must define window.MASSARI_SECTORS as an array");
const credits = read("CREDITS.md");
for (const s of sectors) {
  const file = s.photo && s.photo.file;
  if (!file) fail(`sector ${s.id} has no photo.file`);
  if (!existsExact(file)) fail(`sector ${s.id} photo missing: ${file}`);
  if (!credits.includes(file)) fail(`CREDITS.md does not mention ${file}`);
}

// Syntax check own JS
for (const f of ["js", "data", "sample-data", "scripts"].flatMap(walk).filter((f) => f.endsWith(".js"))) {
  try { execFileSync(process.execPath, ["--check", path.join(root, f)], { stdio: "pipe" }); }
  catch (e) { fail(`syntax error in ${f}\n${e.stderr}`); }
}

console.log("Static project checks passed.");
