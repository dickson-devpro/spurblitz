// One-time: rewrite every article's front matter as YAML so the CMS lists titles properly.
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "not-needed-for-migration";
const { ARTICLES_DIR } = await import("./lib.mjs");
const fs = (await import("node:fs")).default;
const path = (await import("node:path")).default;
const { createRequire } = await import("node:module");
const matter = createRequire(import.meta.url)("gray-matter");

let changed = 0;
for (const file of fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".md"))) {
  const p = path.join(ARTICLES_DIR, file);
  const raw = fs.readFileSync(p, "utf8");
  if (!raw.startsWith("---json")) continue; // already YAML
  const parsed = matter(raw);
  fs.writeFileSync(p, matter.stringify("\n" + parsed.content.trim() + "\n", parsed.data));
  changed++;
  console.log("migrated:", file);
}
console.log(`Done — ${changed} article(s) converted to YAML front matter.`);
