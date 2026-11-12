# bensaenz.com

Plain HTML/CSS built with Eleventy, served from Cloudflare as static files.
Substack posts and your Hardcover shelf are pulled in at build time; the site
rebuilds daily so new posts and books show up.

## Edit

| What | Where |
|---|---|
| name, nav, links, email, Substack URL | `src/_data/site.js` |
| reading shelf | comes from Hardcover (see below); "loved" rule in `lib/hardcover.js` |
| about (home page) text | `src/index.njk` |
| more about me (present / past / future, sections, photo collage) | `src/about/more.md` |
| a post | `src/writing/<slug>.md`, new file = new post at `/writing/<slug>/` |
| a project page (UMD Loop, Aether) | `src/work/<slug>.md` |
| work entries + categories | `src/_data/work.js` |
| colors (top of file), layout | `src/assets/style.css` |
| home photo | `src/photos/home.jpg` (shown black and white, color on hover) |
| More about me photos | `src/photos/<folder>/`, shown wherever `{% photos "<folder>" %}` appears in `src/about/more.md` |
| signature | open `tools/signature.html` in your browser, sign, save `signature.svg` into `src/assets/` |
| add making/art later | uncomment in `site.js`, add `src/making.md` |

Run locally: `npm install`, then `npm start` → http://localhost:8080

## One-time deploy setup

1. Push this folder to a new GitHub repo (branch `main`).
2. In Cloudflare: **My Profile → API Tokens → Create Token → "Edit Cloudflare Workers"** template. Copy the token.
   Copy your **Account ID** from the dashboard home page sidebar.
3. In the GitHub repo: **Settings → Secrets and variables → Actions**, add
   `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
4. Free up the domain: whatever serves bensaenz.com now, remove its custom
   domain (or the DNS record for `bensaenz.com` / `www`) so the new Worker can claim it.
   `wrangler.jsonc` attaches both automatically on deploy.
5. Push (or **Actions → deploy → Run workflow**). Done.

After that: push to publish; new posts/books appear by the next morning, or hit
"Run workflow" to refresh immediately.

## Photos

- Put originals in `src/photos/`. The build makes small and large WebP/JPEG copies, so
  big phone photos are fine and pages stay fast.
- Gallery order is by file name: `01-dc.jpg`, `02-snowboarding.jpg`, …
- Screen-reader descriptions live in `descriptions.json` next to the photos
  (`"04-ben-friends-smiling-reflecting.jpg": "Ben and three friends smiling…"`).
  A photo not listed there uses its file name instead; camera names like `IMG_0457.jpg` with no
  description are treated as decorative.
- iPhone HEIC photos need converting to JPEG first (Photos app: File → Export, or ask Claude).
- Videos (`.mov`) in these folders are ignored by the site and kept out of git.
- Want photos in another section? Make a folder (`src/photos/beliefs/`) and add
  `{% photos "beliefs" %}` to that section in `src/about/more.md`.

## Feeds

- **Hardcover:** your shelf (read, currently reading, want to read) with covers, pulled when the site builds.
  - Key: `.env` at the project root (`HARDCOVER_TOKEN=...`; `HARDCOVER=...` also works). For the live
    site, add the same key as a GitHub secret named `HARDCOVER_TOKEN`.
  - Key permissions needed: `read:me:content`, `read:library:public`, `read:catalog:data`.
    Only books you've marked public on Hardcover show up.
  - Keys expire every **January 1st**: update `.env` and the GitHub secret then.
  - Filters: **all**, **read**, **loved** (rated 5 stars; change `LOVED_RATING` in `lib/hardcover.js`),
    **want to read**. Each book links to its Goodreads page (via the Goodreads id Hardcover saved
    when you imported; falls back to Goodreads' ISBN lookup, then a Goodreads search).
  - If Hardcover is down during a GitHub build, the build stops on purpose so the last good version
    stays live. Locally it just warns.
- **Substack:** reads `<your substack>/feed`; posts link out to Substack.
- If a feed is down at build time, that section shows "coming soon" instead of failing the build.
