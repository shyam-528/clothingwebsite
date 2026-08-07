// scripts/lint-routes.mjs
// Static guard against the "blank screen on /" regression.
// Walks every file in src/ for *uses* of react-router-dom APIs that only
// work with a *data router* (createBrowserRouter + RouterProvider). Our app
// uses <BrowserRouter>, so any of these usages crash the whole tree.
//
// The regexes are scoped to source code: we strip line comments and block
// comments before matching so this very file's own documentation doesn't
// trip the guard.
//
// Run:  npm run lint:routes
// Exit code is non-zero on any hit so CI / pre-dev can block it.

import { readFileSync, statSync, readdirSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..', 'src');

// Strip // line comments and /* ... */ block comments so the script can
// talk about these names without flagging itself.
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

// APIs that REQUIRE a data router. If you intentionally move to one,
// delete the corresponding entry here.
const RULES = [
  { name: 'ScrollRestoration',     re: /<ScrollRestoration\b|\bScrollRestoration\s*\)/ },
  { name: 'useScrollRestoration',  re: /\buseScrollRestoration\s*\(/ },
  { name: 'useLoaderData',         re: /\buseLoaderData\s*\(/ },
  { name: 'useActionData',         re: /\buseActionData\s*\(/ },
  { name: 'useNavigation',         re: /\buseNavigation\s*\(/ },
  { name: 'useFetchers',           re: /\buseFetchers\s*\(/ },
  { name: 'useRevalidator',        re: /\buseRevalidator\s*\(/ },
  { name: 'useSubmit',             re: /\buseSubmit\s*\(/ },
  { name: 'createBrowserRouter',   re: /\bcreateBrowserRouter\s*\(/ },
  { name: 'createMemoryRouter',    re: /\bcreateMemoryRouter\s*\(/ },
  { name: 'RouterProvider',        re: /<RouterProvider\b/ },
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (['.ts', '.tsx', '.js', '.jsx'].includes(extname(p))) out.push(p);
  }
  return out;
}

const findings = [];
for (const file of walk(ROOT)) {
  const raw = readFileSync(file, 'utf8');
  const src = stripComments(raw);
  for (const rule of RULES) {
    if (rule.re.test(src)) {
      findings.push({ file: file.replace(ROOT + '\\', '').replace(ROOT + '/', ''), rule: rule.name });
    }
  }
}

if (findings.length) {
  console.error('\n❌ Data-router APIs found in a <BrowserRouter> app:');
  for (const f of findings) {
    console.error(`   ${f.file}  →  ${f.rule}`);
  }
  console.error('\nFix: remove the import / replace with a BrowserRouter-compatible alternative,');
  console.error('or migrate App.tsx to createBrowserRouter + RouterProvider.\n');
  process.exit(1);
}

console.log('✅ No data-router APIs found. Safe for <BrowserRouter>.');