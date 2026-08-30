// scripts/import-drafts.mjs
// Convert written drafts (.docx / .md / .txt) into site-ready articles.
//
//   node scripts/import-drafts.mjs                    # reads ./drafts, writes src/articles
//   node scripts/import-drafts.mjs --in=drafts --dry
//
// Drop files into drafts/, run it, commit. The script:
//   - pulls the H1 as the title (or falls back to the filename)
//   - builds a standfirst and meta description from the opening paragraph
//   - assigns a category from the content
//   - generates a clean flat slug and permalink
//   - records sourceFile so re-runs never duplicate an article
//
// .docx conversion needs pandoc, which is available on GitHub Actions runners
// and on most dev machines (brew install pandoc).

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const matter = require("gray-matter");

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const args = process.argv.slice(2);
const IN_DIR = path.join(ROOT, (args.find((a) => a.startsWith("--in=")) || "--in=drafts").split("=")[1]);
const OUT_DIR = path.join(ROOT, "src", "articles");
const DRY = args.includes("--dry");

const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "pipeline.json"), "utf8"));
const SITE = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "_data", "site.json"), "utf8"));

/* Category rules — first match wins. Edit to suit the site. */
const RULES = [
  ["visas-grants", [/sponsor licence/i, /certificate of sponsorship/i, /skilled worker/i, /eb-?2/i, /niw/i, /immigration lawyer/i, /immigration attorney/i, /\bvisa\b/i, /sponsorship/i]],
  ["guides", [/mortgage/i, /home loan/i, /\bva loan\b/i, /credit score/i, /tax/i, /irs/i, /expat/i, /insurance/i]]
];

function categorise(text) {
  for (const [slug, pats] of RULES) {
    if (pats.some((p) => p.test(text))) {
      const cat = SITE.categories.find((c) => c.slug === slug);
      if (cat) return { category: cat.name, categorySlug: cat.slug };
    }
  }
  const fallback = SITE.categories[SITE.categories.length - 1];
  return { category: fallback.name, categorySlug: fallback.slug };
}

const slugify = (s) =>
  String(s).toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function toMarkdown(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".md" || ext === ".txt") return fs.readFileSync(file, "utf8");
  if (ext === ".docx") {
    try {
      return execSync(`pandoc -t markdown --wrap=none "${file}"`, { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
    } catch (e) {
      console.error(`  ! pandoc failed on ${path.basename(file)} — is pandoc installed?`);
      return null;
    }
  }
  return null;
}

/** Strip markdown so a paragraph can be used as plain-text meta. */
const plain = (s) =>
  String(s)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** First N whole sentences, up to maxLen — never cut mid-word. */
function sentences(text, maxLen) {
  const parts = plain(text).match(/[^.!?]+[.!?]+/g) || [plain(text)];
  let out = "";
  for (const s of parts) {
    if ((out + s).length > maxLen && out) break;
    out += s;
    if (out.length >= maxLen * 0.6) break;
  }
  return out.trim();
}

if (!fs.existsSync(IN_DIR)) {
  console.error(`No drafts folder at ${IN_DIR}. Create it and drop your files in.`);
  process.exit(1);
}

/* Which drafts are already published? */
const published = new Set();
if (fs.existsSync(OUT_DIR)) {
  for (const f of fs.readdirSync(OUT_DIR).filter((x) => x.endsWith(".md"))) {
    const d = matter(fs.readFileSync(path.join(OUT_DIR, f), "utf8")).data;
    if (d.sourceFile) published.add(d.sourceFile);
  }
}

const files = fs.readdirSync(IN_DIR).filter((f) => /\.(docx|md|txt)$/i.test(f) && !f.startsWith("~$"));
const today = new Date().toISOString().slice(0, 10);
let written = 0, skipped = 0;

for (const f of files.sort()) {
  if (published.has(f)) { console.log(`  = already published: ${f}`); skipped++; continue; }

  const raw = toMarkdown(path.join(IN_DIR, f));
  if (!raw) { skipped++; continue; }

  const lines = raw.split("\n");
  const h1Index = lines.findIndex((l) => /^#\s+\S/.test(l));
  const title = h1Index >= 0
    ? lines[h1Index].replace(/^#\s+/, "").trim()
    : f.replace(/\.(docx|md|txt)$/i, "").replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

  // body = everything after the H1, with any stray second H1 demoted to H2
  let body = (h1Index >= 0 ? lines.slice(h1Index + 1) : lines).join("\n").trim();
  body = body.replace(/^#\s+/gm, "## ");

  const firstPara = body.split(/\n\s*\n/).find((p) => plain(p).length > 80) || body;
  const standfirst = sentences(firstPara, 240);
  const description = sentences(firstPara, 158).slice(0, 158);

  const { category, categorySlug } = categorise(`${title}\n${body.slice(0, 3000)}`);
  // Trim to a whole word — never leave a slug cut mid-word like "...to-hire-a-la"
  let slug = slugify(title);
  if (slug.length > 65) {
    const cut = slug.slice(0, 66);
    slug = cut.slice(0, cut.lastIndexOf("-")).replace(/-+$/, "");
  }

  const frontMatter = {
    layout: "article.njk",
    title,
    description,
    permalink: `/${slug}/`,
    datePublished: today,
    dateModified: today,
    category,
    categorySlug,
    standfirst,
    author: CONFIG.author,
    sourceFile: f
  };

  const outPath = path.join(OUT_DIR, `${slug}.md`);
  if (!DRY) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(outPath, matter.stringify("\n" + body + "\n", frontMatter));
  }
  written++;
  console.log(`  + ${category.padEnd(14)} ${plain(body).split(" ").length.toString().padStart(5)}w  ${slug}`);
}

console.log(`\n${DRY ? "DRY RUN — " : ""}${written} imported, ${skipped} skipped.`);
