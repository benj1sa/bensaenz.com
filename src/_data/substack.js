// Your Substack posts, from its RSS feed.
//
// Substack blocks requests from GitHub's servers, so this keeps a saved copy:
// every time the feed loads (e.g. when you run `npm start` on your computer), it's saved
// to substack-feed.xml at the project root. Commit that file; when GitHub's build gets
// turned away by Substack, it uses the saved copy instead.
import fs from "node:fs";
import Fetch from "@11ty/eleventy-fetch";
import { parseFeed } from "../../lib/substack.js";
import site from "./site.js";

const SAVED = "substack-feed.xml";

export default async function () {
  if (!site.substack || site.substack.includes("YOUR-")) return [];
  try {
    const xml = await Fetch(`${site.substack.replace(/\/$/, "")}/feed`, {
      duration: "1d",
      type: "text",
      fetchOptions: {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; bensaenz.com feed reader; +https://bensaenz.com)",
          accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
        },
      },
    });
    const posts = parseFeed(xml);
    if (posts.length) fs.writeFileSync(SAVED, xml);   // refresh the saved copy
    return posts;
  } catch (err) {
    if (fs.existsSync(SAVED)) {
      const posts = parseFeed(fs.readFileSync(SAVED, "utf8"));
      console.log(`[substack] live feed unavailable (${err.message}); using saved copy (${posts.length} posts)`);
      return posts;
    }
    console.warn(`[substack] couldn't fetch feed and no saved copy yet: ${err.message}`);
    return [];
  }
}
