// Builds the site from src/ into _site/.
export default function (eleventyConfig) {
  // The pages are still complete, hand-written HTML files, so for now they are
  // copied across exactly as they are, along with images and the Low helper's
  // offline files. Shared layouts come in the next step.
  eleventyConfig.addPassthroughCopy({ src: "." });

  return {
    dir: { input: "src", output: "_site" },
    // Only these are treated as templates; .html is copied untouched.
    templateFormats: ["njk", "md"],
    // The site is served from /T1D/ on GitHub Pages.
    pathPrefix: "/T1D/"
  };
}
