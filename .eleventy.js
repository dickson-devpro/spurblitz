const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = function (eleventyConfig) {
  // Markdown with auto heading ids (for TOC anchors); bodies are NOT run
  // through Nunjucks, so article content can safely contain braces.
  // slugify matches scripts/lib.mjs so pipeline-built TOCs always resolve.
  const slugify = (s) => s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  eleventyConfig.setLibrary("md", markdownIt({ html: true }).use(markdownItAnchor, { slugify }));
  // Static passthroughs — copied as-is to the built site
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });

  // Human-readable dates: 2026-07-17 → 17 Jul 2026
  eleventyConfig.addFilter("readableDate", (value) => {
    if (!value) return "";
    const d = new Date(value);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  });

  eleventyConfig.addFilter("slugify", slugify);

  // Pull a salary range out of a job title, e.g. "$90,000 USD to $150,000" -> "$90k–150k"
  eleventyConfig.addFilter("salaryFromTitle", (title) => {
    const t = String(title);
    const m = t.match(/([$€£])\s?([\d,]+)\s*(?:USD|CAD|EUR|GBP|AUD)?\s*(?:to|-|–|—)\s*[$€£]?\s?([\d,]+)/i);
    if (!m) {
      const single = t.match(/([$€£])\s?([\d,]{4,})/);
      if (!single) return null;
      const n = parseInt(single[2].replace(/,/g,''),10);
      return single[1] + Math.round(n/1000) + "k";
    }
    const lo = parseInt(m[2].replace(/,/g,''),10);
    const hi = parseInt(m[3].replace(/,/g,''),10);
    return m[1] + Math.round(lo/1000) + "k–" + Math.round(hi/1000) + "k";
  });

  // Country flag emoji from category or title keywords
  eleventyConfig.addFilter("destFlag", (s) => {
    const t = String(s).toLowerCase();
    if (/canada|toronto/.test(t)) return "\uD83C\uDDE8\uD83C\uDDE6";
    if (/\busa\b|united states|america/.test(t)) return "\uD83C\uDDFA\uD83C\uDDF8";
    if (/\buk\b|united kingdom|london|britain/.test(t)) return "\uD83C\uDDEC\uD83C\uDDE7";
    if (/australia|nz|new zealand/.test(t)) return "\uD83C\uDDE6\uD83C\uDDFA";
    if (/germany|netherlands|france|europe|switzerland|amsterdam/.test(t)) return "\uD83C\uDDEA\uD83C\uDDFA";
    if (/qatar|dubai|uae|gulf|saudi|middle east/.test(t)) return "\uD83C\uDF10";
    return "\uD83C\uDF0D";
  });

  eleventyConfig.addFilter("readingTime", (content) => {
    const words = String(content).replace(/<[^>]+>/g," ").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words/225));
  });

  // Content pipeline status: mirror the generator's coverage heuristic
  eleventyConfig.addGlobalData("pipeline", () =>
    JSON.parse(require("node:fs").readFileSync("data/pipeline.json", "utf8"))
  );
  eleventyConfig.addFilter("keywordStatus", (clusters, articles) => {
    return (clusters || []).map((cluster) => {
      const keywords = cluster.keywords.map((kw) => {
        const words = kw.toLowerCase().split(" ").filter((w) => w.length > 3);
        const needed = Math.max(2, Math.ceil(words.length * 0.7));
        const match = (articles || []).find((a) => {
          const t = (a.data.title || "").toLowerCase();
          return words.filter((w) => t.includes(w)).length >= needed;
        });
        return { keyword: kw, covered: !!match, title: match ? match.data.title : null, url: match ? match.url : null };
      });
      return {
        category: cluster.category,
        keywords,
        done: keywords.filter((k) => k.covered).length,
        total: keywords.length
      };
    });
  });

  // Inject "after-paragraph" ad blocks into rendered article HTML
  eleventyConfig.addFilter("injectAds", (content, blocks, pageType) => {
    if (!blocks || !blocks.length) return content;
    const act = blocks.filter((b) =>
      b.enabled && b.position === "after-paragraph" &&
      (b.pages === "all" || b.pages === pageType) && parseInt(b.paragraph, 10) > 0
    );
    if (!act.length) return content;
    const wrap = (b) => (b.devices && b.devices !== "all")
      ? `<template class="lb-ad-tpl" data-device="${b.devices}">${b.code}</template>`
      : `<div class="ad-block">${b.code}</div>`;
    let count = 0;
    return content.replace(/<\/p>/g, (m) => {
      count++;
      const hits = act.filter((b) => parseInt(b.paragraph, 10) === count);
      return hits.length ? m + hits.map(wrap).join("") : m;
    });
  });

  // All articles, newest first
  eleventyConfig.addCollection("articles", (api) =>
    api.getFilteredByGlob("src/articles/*.md").sort(
      (a, b) => new Date(b.data.datePublished) - new Date(a.data.datePublished)
    )
  );

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk"
  };
};
