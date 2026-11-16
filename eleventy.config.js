// Builds the site from src/ into _site/.
//
//   src/*.njk             one file per page: its settings at the top, then its content
//   src/_includes/        the page shell, header and footer shared by every page
//   src/_data/            site name and address, and the menu links
//   src/assets/css, js    base.css and site.js are shared; the rest belong to one page each
export default function (eleventyConfig) {
  // Copied across as they are
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/*.png");
  eleventyConfig.addPassthroughCopy("src/sw.js");
  eleventyConfig.addPassthroughCopy("src/low-helper.webmanifest");

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "md"],
    // The site is served from /T1D/ on GitHub Pages.
    pathPrefix: "/T1D/"
  };
}
