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

## Where things live

```
src/
  *.njk              one file per page: its settings at the top, then its content
  _includes/
    base.njk         the page shell: title, share-preview tags, fonts, stylesheets, scripts
    header.njk       the header and menu
    footer.njk       the footer links
  _data/
    site.json        site name and address
    nav.json         the links in the menu and footer
  assets/
    css/base.css     colours, fonts, header and footer, shared by every page
    css/<page>.css   styles for one page
    js/site.js       the menu button
    js/<page>.js     the animation or tool on one page
  sw.js              lets the Low helper open offline
```

To add a page, create `src/<name>.njk` with the same settings block as an existing page, and add it to `src/_data/nav.json` if it belongs in the menu or footer.

## Pages

| Page | What it is |
|---|---|
| `index.njk` | The explainer: how insulin works, the video, myths, a day with type 1, what to do in a low, the four signs, sources |
| `spot-it-in-time.njk` | A one-minute animated film of the four early signs. Add `?t=30` to the address to open it paused at 30 seconds |
| `poster.njk` | A printable one-page poster of the four signs |
| `below-the-surface.njk` | A scroll-driven story of the hidden daily work of living with type 1 |
| `low-helper.njk` | A step-by-step guide for treating a low, with a 15-minute timer. Works offline after the first visit and can be added to a phone's home screen. Add `?demo` for a 20-second timer |
| `disclaimer.njk` | What the site is and is not |

The Low helper and the poster keep their own simple top bar instead of the site menu: one is used in an emergency and the other is made to be printed.

This site is general information, not medical advice.
