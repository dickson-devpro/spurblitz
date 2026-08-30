# Finance Static Blog

Static, self-updating finance content site. Eleventy → static HTML, deployed on
Cloudflare Pages, managed through Sveltia CMS at `/admin`.

- Every article = one Markdown file in `src/articles/` = one permanent URL.
- New articles only add pages; existing URLs and HTML never move.
- All scripts, ad codes, nav links, and footer links live in `src/_data/site.json`,
  editable from `/admin` → **Site Settings**.
- Policy pages set `noAds: true` and never load ad or analytics scripts.

## Local build

```
npm install
npm run serve      # local preview at http://localhost:8080
npm run build      # outputs static site to _site/
```

## Deploy (summary — full steps in chat guide)

1. Push this repo to GitHub (branch `main`).
2. Cloudflare Pages → connect the repo.
   Build command: `npm run build` · Output directory: `_site`
3. Pages → Custom domains → add your subdomain (e.g. `money.yourdomain.com`).
4. Set up Sveltia auth (GitHub OAuth app + sveltia-cms-auth Worker), then fill in
   `repo:` and `base_url:` in `src/admin/config.yml`.
5. Update `src/_data/site.json` → `url` to your live subdomain.
6. Log in at `https://money.yourdomain.com/admin/` and paste ad/analytics codes
   under **Site Settings**.

## Structure

```
src/
  _data/site.json        ← scripts, ad codes, links (edited by /admin)
  _includes/             ← base, article, page layouts + schema partial
  admin/                 ← Sveltia CMS (config.yml defines the dashboard)
  articles/*.md          ← one file per article (AI pipeline writes here)
  pages/*.md             ← privacy, terms, about, contact, disclosure
  assets/site.css
```
