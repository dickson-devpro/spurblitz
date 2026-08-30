// scripts/refresh-article.mjs — refreshes the stalest article (figures, angles, word floor)
import { CONFIG, claude, splitMetaBody, wordCount, todayISO, readArticles, tocFromBody, writeArticle } from "./lib.mjs";

const MIN_WORDS = CONFIG.minWords;
const cutoff = new Date(Date.now() - CONFIG.refreshAfterDays * 86400000).toISOString().slice(0, 10);

const articles = readArticles().sort((a, b) =>
  String(a.fm.dateModified || "").localeCompare(String(b.fm.dateModified || ""))
);
const target = articles.find((a) => (a.fm.dateModified || "1970-01-01") <= cutoff);

if (!target) {
  console.log("No article older than the refresh window — nothing to do.");
  process.exit(0);
}
const short = wordCount(target.body) < MIN_WORDS;
console.log(`Refreshing: ${target.file} (last modified ${target.fm.dateModified}${short ? ", under word floor" : ""})`);

const system = `You are the senior finance editor for a consumer finance publication refreshing an existing article.
Finance is a sensitive (YMYL) topic: keep everything accurate and non-misleading, keep worked examples labelled
illustrative, never invent statistics presented as verified current market data. Preserve the article's structure,
internal links, and voice.
AUDIENCE: This publication serves foreign nationals and immigrants who are starting, funding, or running a
business in the United States, plus those relocating for work. Frame every topic around their realities:
no US credit history, SSN vs ITIN, treaty-country eligibility, cross-border banking, and how immigration
status interacts with commercial decisions. STRICT BOUNDARY: this is practical business and financial
information, NEVER immigration legal advice or tax advice — where a decision turns on visa eligibility or
tax liability, direct readers to a licensed immigration attorney or CPA. Never predict case outcomes,
approval odds, or policy changes.
Respond ONLY with a valid JSON object — no fences, no preamble.`;

const prompt = `Refresh this article dated ${target.fm.dateModified}. Today is ${todayISO()}.

Tasks:
1. Update the "key figures" band with plausible, clearly-illustrative current-period figures (keep same labels or improve them).
2. Revise 1–2 sections with a fresh angle or updated framing so the page is meaningfully newer, not cosmetically edited.
${short ? `3. The body is under ${MIN_WORDS} words — expand it to at least ${MIN_WORDS} words with substantive new sections (worked examples, comparisons, edge cases). No padding.` : "3. Keep length roughly the same or longer."}

Respond in EXACTLY this format (no fences, nothing before or after):
===META===
{"keyFigures": [{"label": "...", "value": "...", "note": "..."}, {"...": "..."}, {"...": "..."}]}
===BODY===
The full updated Markdown body (no H1, no FAQ section).

CURRENT FRONT MATTER (JSON):
${JSON.stringify(target.fm.title ? { title: target.fm.title, keyFigures: target.fm.keyFigures } : {}, null, 2)}

CURRENT BODY:
${target.body}`;

const { meta, body: newBody } = splitMetaBody(await claude(prompt, { system, maxTokens: 20000 }));
const updated = { keyFigures: meta.keyFigures, body: newBody };
const finalCount = wordCount(updated.body);
if (finalCount < Math.min(MIN_WORDS, wordCount(target.body))) {
  console.error(`Refresh shrank the article (${finalCount} words) — aborting.`);
  process.exit(1);
}

// Rebuild the file with JSON front matter (migrates YAML seed articles automatically).
const fm = { ...target.fm };
fm.layout = fm.layout || "article.njk";
fm.author = fm.author || CONFIG.author;
fm.dateModified = todayISO();
fm.keyFiguresAsOf = todayISO();
if (updated.keyFigures?.length) fm.keyFigures = updated.keyFigures;
fm.toc = tocFromBody(updated.body);

writeArticle({ slug: target.file.replace(/\.md$/, ""), frontMatter: fm, body: updated.body });
console.log(`Refreshed ${target.file} — now ${finalCount} words.`);
