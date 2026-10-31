# Old Ma Main's

Website for Old Ma Main's small batch preserves, built with [Astro](https://astro.build) and deployed to GitHub Pages at **https://oldmamain.co.uk**.

## Develop

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # type-check + build to dist/
npm run preview  # serve the built site
```

## Where things live

| Path | What |
| --- | --- |
| `src/data/products.json` | The range: one entry per product (label wording, batch month as `YYYY-MM`, omit `made` for "coming soon"). Drives the home page shelf, the "year in jars" timeline and the label maker presets. |
| `src/content/recipes/*.md` | One recipe per file. Frontmatter holds intro, makes, takes, ingredients and tip; the body is the method as an ordered list. Each gets a page at `/recipes/<file-name>/`. Set `draft: true` to keep one unpublished; THE KITCHEN appears in the nav once at least one recipe is published. |
| `src/lib/label.ts` | The jar label, drawn as one SVG. Used at build time and in the browser (label maker preview, PNG download, 3 × 4 A4 PDF and print sheet). Product names are always 40px, the SEVILLE ORANGE / MARMALADE size; lines over 14 letters get a "shorten the wording" warning. |
| Made-with line | A batch made with someone else can carry a made-with line, e.g. WITH THE JUNIOR ANDERSONS, on a small arc inside OLD MA MAIN'S (27 characters max, WITH included; longer names lose whole words). Set it in the label maker's MADE WITH field, or with `collab` on a product in `products.json`. |
| `public/baskets/*.svg` | The engraved baskets from the design system (oranges, quinces, strawberries, elderflowers, crab apples). A product picks one with `basket` in `products.json`. |
| `src/styles/global.css` | Design tokens (paper, ink, rules, fonts) and shared patterns. |
| `src/components/` | Header, nav, footer, label and recipe book cover. |

The label maker lives at `/labels/` (LABELS in the nav). It sits behind a light password gate (`src/lib/labels-gate.ts`): only the password's SHA-256 is in the code, and a browser stays unlocked once the password has been entered. GitHub Pages is static, so this keeps it out of the way rather than truly secure. To change the password, put the output of `printf '%s' 'new password' | shasum -a 256` in `LABELS_PASSWORD_SHA256`.

Copy in `[SQUARE BRACKETS]` is placeholder text still to be written.

## Deploy

Every push to `main` builds and deploys via `.github/workflows/deploy.yml`. `public/CNAME` sets the custom domain.

DNS for `oldmamain.co.uk` (at the domain registrar):

- `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `AAAA` records for `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
- `CNAME` record for `www`: `nimothy.github.io`

Once DNS resolves, tick **Enforce HTTPS** in the repo's Settings → Pages.
