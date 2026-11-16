# T1D

A simple, one-page explainer of type 1 diabetes for people who've never heard of it — what it is, how insulin works, how it differs from type 2, how people live with it, and the early signs.

Live at https://chethan4062.github.io/T1D/.

## How the site is built

The pages live in `src/` and are built with [Eleventy](https://www.11ty.dev/) into `_site/`. Merging to `main` builds and publishes the site through GitHub Actions (`.github/workflows/deploy.yml`).

To preview on your own computer (needs [Node.js](https://nodejs.org/) 20 or newer):

```bash
npm install     # once
npm start       # then open the address it prints
```

`npm run build` builds the site without starting a preview.

## Checks

`npm test` builds the site and then runs `scripts/check-site.mjs`, which fails if:

- a link, stylesheet, script or image leads nowhere, or a `#link` points to a part of a page that does not exist
- a page has no title, description, main heading or share-preview tags, or two pages share a title
- the sitemap is out of step with the pages
- a file the Low helper saves for offline use is missing

The same check runs on every pull request and again before each publish, so a broken build never goes live.

## Where things live

```
src/
  index.njk                      the home page
  signs/, living/, tools/, about/   one folder per section, one .njk file per page
  redirects.njk                  builds a forwarding page for every entry in _data/redirects.json
  _includes/
    base.njk         the page shell: title, share-preview tags, fonts, stylesheets, scripts
    header.njk       the header and menu
    footer.njk       the footer links
  _data/
    site.json        site name and address
    nav.json         the links in the menu and footer
    sources.json     the sources list and the date it was last checked
    redirects.json   old addresses and where they now go
  assets/
    css/base.css     colours, fonts, header and footer, shared by every page
    css/article.css  plain text pages (sources, disclaimer)
    css/<page>.css   styles for one page
    js/site.js       the menu button
    js/<page>.js     the animation or tool on one page
  sw.js              lets the Low helper open offline
  sitemap.njk        builds sitemap.xml from the list of pages
  404.njk            the "page not found" page
scripts/
  check-site.mjs     checks the built site (see Checks above)
```

Each page file starts with a settings block (title, description, address, stylesheets, scripts) followed by its content.

## Pages and addresses

| Address | File | What it is |
|---|---|---|
| `/` | `index.njk` | The explainer: how insulin works, the video, myths, a day with type 1, what to do in a low, the four signs |
| `/signs/spot-it-in-time/` | `signs/spot-it-in-time.njk` | A one-minute animated film of the four early signs. Add `?t=30` to open it paused at 30 seconds |
| `/signs/poster/` | `signs/poster.njk` | A printable one-page poster of the four signs |
| `/living/below-the-surface/` | `living/below-the-surface.njk` | A scroll-driven story of the hidden daily work of living with type 1 |
| `/tools/low-helper/` | `tools/low-helper.njk` | A step-by-step guide for treating a low, with a 15-minute timer. Works offline after the first visit and can be added to a phone's home screen. Add `?demo` for a 20-second timer |
| `/about/sources/` | `about/sources.njk` | The guidance the site was checked against, from `_data/sources.json` |
| `/about/disclaimer/` | `about/disclaimer.njk` | What the site is and is not |

The addresses the pages had before (`spot-it-in-time.html`, `low-helper.html` and so on) forward to the new ones. So do the section addresses (`/signs/`, `/living/`, `/tools/`, `/about/`), which go to each section's main page until a section has enough pages to need its own front page.

## Adding or moving a page

- **Add:** create a `.njk` file in the right section folder with the same settings block as an existing page. Add it to `_data/nav.json` if it belongs in the menu or footer.
- **Link to a page:** write the address through the `url` filter, like `{{ '/about/sources/' | url }}`, so it works wherever the site is hosted.
- **Move:** change the page's `permalink`, then add the old address to `_data/redirects.json` so existing links keep working.

The Low helper and the poster keep their own simple top bar instead of the site menu: one is used in an emergency and the other is made to be printed.

This site is general information, not medical advice.
