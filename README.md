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

## Pages

`src/low-helper.html` is a step-by-step guide to open when someone is having a low, with a 15-minute timer. It works offline after the first visit (`src/sw.js`) and can be added to a phone's home screen. Add `?demo` to the address for a 20-second timer.

`spot-it-in-time.html` is a one-minute animated film of the four early signs of type 1 (add `?t=30` to open it paused at 30 seconds). `poster.html` is a printable one-page poster of the same signs.

`below-the-surface.html` is a scroll-driven story linked from the home page: it goes beneath one ordinary dinner to show the hidden daily work of living with type 1.

This page is a plain-language introduction, not medical advice.
