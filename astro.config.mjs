import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: "https://colorteam.io",
  trailingSlash: "ignore",
  integrations: [
    // internal tools stay out of the sitemap (they also carry noindex, nofollow)
    sitemap({ filter: (page) => !/\/utm\/?$/.test(new URL(page).pathname) }),
  ],
  // old colorteam.io addresses that moved; static hosts get a redirect page for each
  redirects: {
    "/our-products": "/services/#expertise-products",
    "/insights": "/blog/",
    "/contact": "/about/",
    "/blog/content-syndication-in-streaming-marketing-netflix-case-study": "/blog/"
},
});
