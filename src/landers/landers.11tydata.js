// Landing pages: standalone HTML, managed from /admin.
//
// Each file in this folder holds one complete HTML document in its body.
// Nothing from the blog is applied — no layout, no site CSS, no ad blocks,
// no rewarded gate. Whatever you paste is exactly what gets served.
//
// templateEngineOverride: false means Eleventy does NOT parse the body, so
// {{ }} and {% %} inside third-party scripts are safe and won't break the build.
module.exports = {
  layout: null,
  templateEngineOverride: false,
  eleventyExcludeFromCollections: true,
  eleventyComputed: {
    // /jobs/  from a file named jobs.html, or from an explicit "slug" field
    permalink: (data) => `/${(data.slug || data.page.fileSlug).replace(/^\/|\/$/g, "")}/index.html`
  }
};
