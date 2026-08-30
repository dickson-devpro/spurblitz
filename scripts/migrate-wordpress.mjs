// scripts/migrate-wordpress.mjs — convert a WordPress WXR export into site articles.
//
//   node scripts/migrate-wordpress.mjs <export.xml> [--out src/articles] [--dry]
//
// Produces one Markdown file per published post with our front-matter contract,
// preserves original permalinks, maps WP categories onto site categories, and
// writes a migration report (report.json) listing images, redirects, and skips.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { XMLParser } = require("fast-xml-parser");
const TurndownService = require("turndown");
const matter = require("gray-matter");

const args = process.argv.slice(2);
const XML_PATH = args.find((a) => !a.startsWith("--"));
const OUT_DIR = (args.find((a) => a.startsWith("--out=")) || "--out=src/articles").split("=")[1];
const DRY = args.includes("--dry");

if (!XML_PATH) {
  console.error("Usage: node scripts/migrate-wordpress.mjs <export.xml> [--out=src/articles] [--dry]");
  process.exit(1);
}

/* ── Parse WXR ────────────────────────────────────────────── */
const xml = fs.readFileSync(XML_PATH, "utf8");
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  cdataPropName: "__cdata",
  trimValues: false
});
const doc = parser.parse(xml);
const channel = doc?.rss?.channel;
if (!channel) {
  console.error("Not a WordPress WXR file (no rss>channel found).");
  process.exit(1);
}
const items = [].concat(channel.item || []);

/* ── Helpers ──────────────────────────────────────────────── */
const text = (v) => {
  if (v === undefined || v === null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (v.__cdata !== undefined) return String(v.__cdata);
  if (v["#text"] !== undefined) return String(v["#text"]);
  return "";
};

const slugify = (s) =>
  String(s).toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Strip Gutenberg block comments, shortcodes, and common plugin cruft. */
function cleanHtml(html) {
  return html
    .replace(/<!--\s*\/?wp:[\s\S]*?-->/g, "")           // Gutenberg block delimiters
    .replace(/<!--\s*more\s*-->/gi, "")                  // read-more marker
    .replace(/\[\/?(?:vc_[a-z_]+|et_pb_[a-z_]+)[^\]]*\]/gi, "") // page-builder shortcodes
    .replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/gi, "$1")
    .replace(/\[embed[^\]]*\]([\s\S]*?)\[\/embed\]/gi, "$1")
    .replace(/\[[a-z0-9_-]+(?:\s[^\]]*)?\](?:([\s\S]*?)\[\/[a-z0-9_-]+\])?/gi, "$1") // remaining shortcodes
    .trim();
}

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "*"
});
// Preserve tables as raw HTML — markdown-it renders them through (html:true)
// and the site CSS already handles mobile table scrolling.
turndown.keep(["table"]);
// Preserve iframes (embeds) rather than dropping them.
turndown.keep(["iframe"]);

/* ── Category mapping ─────────────────────────────────────── */
// Edit this after the first dry run to route WP categories to site categories.
const CATEGORY_MAP = JSON.parse(
  fs.existsSync("data/category-map.json") ? fs.readFileSync("data/category-map.json", "utf8") : "{}"
);
const DEFAULT_CATEGORY = { category: "Guides", categorySlug: "guides" };

function mapCategory(wpCats) {
  for (const c of wpCats) {
    const hit = CATEGORY_MAP[c.slug] || CATEGORY_MAP[c.name];
    if (hit) return hit;
  }
  if (wpCats.length) {
    return { category: wpCats[0].name, categorySlug: slugify(wpCats[0].slug || wpCats[0].name) };
  }
  return DEFAULT_CATEGORY;
}

/* ── Convert ──────────────────────────────────────────────── */
const report = {
  source: path.basename(XML_PATH),
  totals: { items: items.length, posts: 0, pages: 0, skipped: 0 },
  categories: {},
  written: [],
  skipped: [],
  images: new Set(),
  redirects: []
};

for (const item of items) {
  const postType = text(item["wp:post_type"]);
  const status = text(item["wp:status"]);
  const title = text(item.title).trim();

  if (postType !== "post" && postType !== "page") {
    if (postType === "attachment") {
      const url = text(item["wp:attachment_url"]);
      if (url) report.images.add(url);
    }
    continue;
  }
  if (status !== "publish") {
    report.totals.skipped++;
    report.skipped.push({ title, reason: `status: ${status}` });
    continue;
  }

  const rawContent = text(item["content:encoded"]);
  const excerpt = text(item["excerpt:encoded"]).replace(/<[^>]+>/g, "").trim();
  const link = text(item.link);
  const wpSlug = text(item["wp:post_name"]) || slugify(title);
  const pubDate = text(item["wp:post_date_gmt"]) || text(item.pubDate);
  const dateISO = pubDate ? new Date(pubDate.replace(" ", "T") + "Z").toISOString().slice(0, 10) : null;

  // categories (WP puts both categories and tags in <category>)
  const cats = [].concat(item.category || [])
    .filter((c) => c["@_domain"] === "category")
    .map((c) => ({ name: text(c), slug: c["@_nicename"] || slugify(text(c)) }));
  const tags = [].concat(item.category || [])
    .filter((c) => c["@_domain"] === "post_tag")
    .map((c) => text(c));

  // SEO meta from Yoast / Rank Math if present
  const metas = [].concat(item["wp:postmeta"] || []);
  const metaVal = (keys) => {
    for (const m of metas) {
      const k = text(m["wp:meta_key"]);
      if (keys.includes(k)) {
        const v = text(m["wp:meta_value"]).trim();
        if (v) return v;
      }
    }
    return "";
  };
  const seoDesc = metaVal(["_yoast_wpseo_metadesc", "rank_math_description"]);
  const seoTitle = metaVal(["_yoast_wpseo_title", "rank_math_title"]);

  const html = cleanHtml(rawContent);
  let body = turndown.turndown(html).replace(/\n{3,}/g, "\n\n").trim();

  // collect images referenced in the body
  for (const m of rawContent.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) report.images.add(m[1]);

  // preserve the original URL path exactly
  let permalink = "/";
  try {
    permalink = new URL(link).pathname;
  } catch {
    permalink = `/${wpSlug}/`;
  }
  if (!permalink.endsWith("/")) permalink += "/";

  const { category, categorySlug } = postType === "post" ? mapCategory(cats) : DEFAULT_CATEGORY;
  report.categories[category] = (report.categories[category] || 0) + 1;

  const description = (seoDesc || excerpt || body.replace(/[#*_>`\[\]()]/g, " ").slice(0, 300))
    .replace(/\s+/g, " ").trim().slice(0, 160);
  const standfirst = (excerpt || description).slice(0, 220);

  const frontMatter = {
    layout: postType === "post" ? "article.njk" : "page.njk",
    title: seoTitle || title,
    description,
    permalink,
    datePublished: dateISO,
    dateModified: dateISO,
    migratedFrom: link || undefined
  };
  if (postType === "post") {
    Object.assign(frontMatter, {
      category,
      categorySlug,
      standfirst,
      tags: tags.length ? tags : undefined
    });
  } else {
    frontMatter.noAds = true;
  }

  // YAML dumper rejects undefined values — strip empty keys before writing
  for (const k of Object.keys(frontMatter)) {
    if (frontMatter[k] === undefined || frontMatter[k] === null || frontMatter[k] === "") {
      delete frontMatter[k];
    }
  }

  const file = path.join(OUT_DIR, `${wpSlug}.md`);
  if (!DRY) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(file, matter.stringify("\n" + body + "\n", frontMatter));
  }

  report.totals[postType === "post" ? "posts" : "pages"]++;
  report.written.push({ title: frontMatter.title, permalink, category, words: body.split(/\s+/).length });
}

report.images = [...report.images];
if (!DRY) fs.writeFileSync("migration-report.json", JSON.stringify(report, null, 2));

/* ── Summary ──────────────────────────────────────────────── */
console.log(`\nSource: ${report.source}`);
console.log(`Items in export: ${report.totals.items}`);
console.log(`Published posts: ${report.totals.posts}`);
console.log(`Published pages: ${report.totals.pages}`);
console.log(`Skipped (drafts/private): ${report.totals.skipped}`);
console.log(`Images referenced: ${report.images.length}`);
console.log(`\nCategories found:`);
for (const [c, n] of Object.entries(report.categories).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${c}: ${n}`);
}
const short = report.written.filter((w) => w.words < 800).length;
console.log(`\nPosts under 800 words (refresh candidates): ${short}`);
console.log(DRY ? "\nDRY RUN — no files written." : `\nWrote ${report.written.length} files to ${OUT_DIR}/`);
console.log("Report: migration-report.json");
