# colorteam.io

The Colorteam website (v1), built with [Astro](https://astro.build) and deployed to GitHub Pages.

## Pages

| URL | File |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/work/` | `src/pages/work.astro` |
| `/services/` | `src/pages/services.astro` |
| `/podcast/` | `src/pages/podcast.astro` |
| `/about/` | `src/pages/about.astro` |
| `/blog/` (Insights) | `src/pages/blog/index.astro` |
| `/blog/<article>/` | `src/pages/blog/*.astro` |

Shared parts live in `src/components/` (navigation, CTA band, footer, floating buttons) and `src/layouts/Base.astro` (page head, SEO and share tags). Styles are in `src/styles/site.css`, behaviour in `public/js/site.js`, images in `public/img/`.

## Editing

```bash
npm install
npm run dev      # local preview at http://localhost:4321
npm run build    # production build into dist/
```

Every push to `main` builds and publishes the site automatically (`.github/workflows/deploy.yml`).

## Domain

`public/CNAME` holds `colorteam.io`. DNS is managed at Namecheap and points to GitHub Pages.
