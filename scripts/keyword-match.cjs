// scripts/keyword-match.cjs
// Shared by .eleventy.js (status page) and scripts/generate-article.mjs (generator),
// so the two can never disagree about what counts as "covered".
//
// Matching is exact-first: articles written by the pipeline record the keyword
// they were built from in `sourceKeyword`, and that is matched literally.
// The fuzzy path exists only for older articles that predate that field.

const STOPWORDS = new Set([
  "from", "with", "what", "when", "your", "this", "that", "they", "them", "their",
  "there", "have", "been", "will", "would", "could", "should", "does", "into",
  "than", "then", "about", "more", "most", "some", "such", "only", "other",
  "over", "also", "just", "like", "make", "made", "need", "needs", "want",
  "actually", "explained", "step", "guide", "complete", "full", "everything",
  "how", "why", "who", "and", "the", "for", "you"
]);

/** Significant words: drop short words and generic connectors, then crude-stem plurals. */
function significant(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    .map((w) => w.replace(/(ies)$/, "y").replace(/(es|s)$/, ""))
    .filter(Boolean);
}

/** Does this article title plausibly cover this keyword? */
function fuzzyCovers(keyword, title) {
  const kw = significant(keyword);
  const t = significant(title);
  // Fewer than two distinguishing words is not enough to judge — refuse rather
  // than guess. This is what let "how to pay US tax from overseas" (which reduced
  // to just "overseas") match an unrelated New Zealand job article.
  if (kw.length < 2 || !t.length) return false;

  const needed = kw.length < 4 ? kw.length : Math.ceil(kw.length * 0.75);
  const tset = new Set(t);
  const hits = kw.filter((w) => tset.has(w)).length;
  return hits >= needed;
}

/**
 * Find the article covering a keyword.
 * @param {string} keyword
 * @param {Array} articles - objects exposing { title, categorySlug, sourceKeyword, url }
 */
function findCover(keyword, articles) {
  const key = String(keyword).trim().toLowerCase();

  // 1. Exact: the article records the keyword it was written for.
  const exact = (articles || []).find(
    (a) => String(a.sourceKeyword || "").trim().toLowerCase() === key
  );
  if (exact) return exact;

  // 2. Fallback for legacy articles with no sourceKeyword.
  return (articles || []).find((a) => !a.sourceKeyword && fuzzyCovers(keyword, a.title));
}

module.exports = { significant, fuzzyCovers, findCover };
