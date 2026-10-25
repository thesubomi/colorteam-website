import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: "https://colorteam.io",
  trailingSlash: "ignore",
  integrations: [sitemap()],
  // old colorteam.io addresses that moved; static hosts get a redirect page for each
  redirects: {
    "/our-products": "/services/#expertise-products",
    "/insights": "/blog/",
    "/contact": "/about/"
},
});
