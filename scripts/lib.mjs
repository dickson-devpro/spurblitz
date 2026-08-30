// scripts/lib.mjs — shared helpers for the content pipeline
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const matter = require("gray-matter"); // ships with Eleventy

export const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
export const ARTICLES_DIR = path.join(ROOT, "src", "articles");
export const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "pipeline.json"), "utf8"));

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set. Add it as a GitHub Actions secret.");
  process.exit(1);
}

/** Call the Anthropic Messages API with retry/backoff; returns concatenated text. */
export async function claude(prompt, { system = "", maxTokens = 8000 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: CONFIG.model,
          max_tokens: maxTokens,
          system,
          messages: [{ role: "user", content: prompt }]
        })
      });
      if (res.status === 429 || res.status >= 500) throw new Error(`retryable ${res.status}`);
      if (!res.ok) {
        const body = await res.text();
        throw Object.assign(new Error(`API ${res.status}: ${body.slice(0, 500)}`), { fatal: true });
      }
      const data = await res.json();
      return data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
    } catch (err) {
      if (err.fatal) throw err;
      lastErr = err;
      const wait = attempt * 20000;
      console.log(`API attempt ${attempt} failed (${err.message}) — retrying in ${wait / 1000}s`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

/** Parse a JSON object out of a model reply, tolerating code fences. */
export function parseJson(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in model output.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

/** Split a model reply in ===META=== / ===BODY=== format into { meta, body }. */
export function splitMetaBody(text) {
  const m = text.match(/===META===\s*([\s\S]*?)\s*===BODY===\s*([\s\S]*)$/);
  if (!m) throw new Error("Reply missing ===META===/===BODY=== delimiters.");
  return { meta: parseJson(m[1]), body: m[2].trim() };
}

export function slugify(s) {
  return s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function wordCount(markdown) {
  return markdown.replace(/[#*_>|`\-]/g, " ").split(/\s+/).filter(Boolean).length;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Read every published article's front matter + body via gray-matter. */
export function readArticles() {
  return fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".md")).map((file) => {
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), "utf8");
    const parsed = matter(raw);
    return { file, path: path.join(ARTICLES_DIR, file), fm: parsed.data, body: parsed.content, raw };
  });
}

/** Build TOC entries from H2 headings using the same slug rules as markdown-it-anchor. */
export function tocFromBody(body) {
  const toc = [];
  for (const m of body.matchAll(/^## (.+)$/gm)) {
    toc.push({ id: slugify(m[1]), label: m[1].trim() });
  }
  toc.push({ id: "faq", label: "Frequently asked questions" });
  return toc;
}

/** Assemble an article file with YAML front matter (gray-matter stringify — CMS-friendly). */
export function writeArticle({ slug, frontMatter, body }) {
  const file = path.join(ARTICLES_DIR, `${slug}.md`);
  fs.writeFileSync(file, matter.stringify("\n" + body.trim() + "\n", frontMatter));
  return file;
}
