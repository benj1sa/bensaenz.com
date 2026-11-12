// Pulls your Substack posts from its RSS feed at build time.
import Fetch from "@11ty/eleventy-fetch";
import { parseFeed } from "../../lib/substack.js";
import site from "./site.js";

export default async function () {
  if (!site.substack || site.substack.includes("YOUR-")) return [];
  try {
    const xml = await Fetch(`${site.substack.replace(/\/$/, "")}/feed`, {
      duration: "1d",
      type: "text",
      // Substack turns away requests that don't say who they are (common from GitHub's servers)
      fetchOptions: {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; bensaenz.com feed reader; +https://bensaenz.com)",
          accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
        },
      },
    });
    return parseFeed(xml);
  } catch (err) {
    console.warn(`[substack] couldn't fetch feed: ${err.message}`);
    return [];
  }
}
