// Checks the built site in _site/ and fails if something a visitor would notice is broken:
// missing titles or descriptions, links and files that lead nowhere, and anything the
// Low helper needs offline. Run with `npm run check` after `npm run build`.
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, dirname, posix } from "node:path";

const OUT = "_site";
const PREFIX = "/T1D/";                    // must match pathPrefix in eleventy.config.js
const SITE = "https://chethan4062.github.io/T1D";
const problems = [];
const fail = (where, what) => problems.push(`${where}: ${what}`);

const walk = dir => readdirSync(dir, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);

// Turns an address as written in a page into a file in _site/, or null if it points off the site.
function toFile(address, fromFile) {
  const [path] = address.split("#")[0].split("?");
  if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(address)) {
    if (!address.startsWith(SITE)) return null;
    return resolve(address.slice(SITE.length) || "/");
  }
  if (path === "") return fromFile;                                   // a #link on the same page
  if (path.startsWith("/")) {
    if (!path.startsWith(PREFIX)) return "OUTSIDE";
    return resolve("/" + path.slice(PREFIX.length));
  }
  const fromDir = "/" + posix.dirname(fromFile.slice(OUT.length + 1).split("\\").join("/"));
  return resolve(posix.join(fromDir, path));
  function resolve(p) { return join(OUT, p.endsWith("/") ? p + "index.html" : p); }
}
const isFile = f => existsSync(f) && statSync(f).isFile();
const attr = (html, re) => [...html.matchAll(re)].map(m => m[1]);

const htmlFiles = walk(OUT).filter(f => f.endsWith(".html"));
const pages = {};
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  pages[file] = { html, ids: new Set(attr(html, /\sid="([^"]+)"/g)), forward: /http-equiv="refresh"/.test(html) };
}

const titles = new Map();
for (const [file, page] of Object.entries(pages)) {
  const { html } = page;
  const name = file.slice(OUT.length);

  // Links, stylesheets, scripts and images all have to lead somewhere
  const refs = [...attr(html, /\s(?:href|src)="([^"]*)"/g), ...attr(html, /url=([^"]+)"/g)];
  for (const ref of refs) {
    if (ref.includes("{{") || ref.includes("{%")) { fail(name, `unprocessed template code in "${ref}"`); continue; }
    const target = toFile(ref, file);
    if (target === null) continue;
    if (target === "OUTSIDE") { fail(name, `"${ref}" points outside ${PREFIX}`); continue; }
    if (!isFile(target)) { fail(name, `"${ref}" leads nowhere`); continue; }
    const hash = ref.split("#")[1];
    if (hash && pages[target] && !pages[target].ids.has(hash)) fail(name, `"${ref}" points to a part of the page that does not exist`);
  }
  if (page.forward) continue;              // forwarding pages need nothing else

  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1]?.trim();
  if (!title) fail(name, "no title");
  else if (titles.has(title)) fail(name, `same title as ${titles.get(title)}`);
  else titles.set(title, name);

  const description = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (!description) fail(name, "no description");
  else if (description.length > 200) fail(name, `description is ${description.length} characters; keep it under 200`);

  if (!/<html[^>]*\slang="/.test(html)) fail(name, "no language set on <html>");
  if (!/<h1[\s>]/.test(html)) fail(name, "no main heading (h1)");
  if (!/<link rel="canonical" href="[^"]+"/.test(html)) fail(name, "no canonical address");
  for (const tag of ["og:title", "og:description", "og:image"])
    if (!new RegExp(`<meta property="${tag}" content="[^"]+"`).test(html)) fail(name, `no ${tag} share-preview tag`);
}

// The sitemap should list every real page and nothing else
const sitemapFile = join(OUT, "sitemap.xml");
if (!isFile(sitemapFile)) fail("/sitemap.xml", "missing");
else {
  const listed = attr(readFileSync(sitemapFile, "utf8"), /<loc>([^<]+)<\/loc>/g);
  for (const loc of listed) {
    const target = toFile(loc, sitemapFile);
    if (!target || !isFile(target)) fail("/sitemap.xml", `lists ${loc}, which does not exist`);
    else if (pages[target].forward) fail("/sitemap.xml", `lists ${loc}, which only forwards elsewhere`);
  }
  const want = Object.entries(pages).filter(([f, p]) => !p.forward && !f.endsWith("404.html")).length;
  if (listed.length !== want) fail("/sitemap.xml", `lists ${listed.length} pages but the site has ${want}`);
}
if (!isFile(join(OUT, "404.html"))) fail("/404.html", "missing");

// Everything the Low helper saves for offline use has to exist
const sw = readFileSync(join(OUT, "sw.js"), "utf8");
const shell = attr((sw.match(/const SHELL = \[([\s\S]*?)\];/) || [, ""])[1], /"([^"]+)"/g);
if (!shell.length) fail("/sw.js", "could not read the list of files to save");
for (const entry of shell) if (!isFile(toFile(PREFIX + entry, join(OUT, "sw.js")))) fail("/sw.js", `saves "${entry}", which does not exist`);
const manifest = JSON.parse(readFileSync(join(OUT, "low-helper.webmanifest"), "utf8"));
for (const entry of [manifest.start_url, ...manifest.icons.map(i => i.src)])
  if (!isFile(toFile(PREFIX + entry, OUT))) fail("/low-helper.webmanifest", `refers to "${entry}", which does not exist`);

const real = Object.values(pages).filter(p => !p.forward).length;
if (problems.length) {
  console.error(`Site check failed with ${problems.length} problem${problems.length === 1 ? "" : "s"}:\n`);
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}
console.log(`Site check passed: ${real} pages, ${htmlFiles.length - real} forwarding pages, ${shell.length} offline files.`);
