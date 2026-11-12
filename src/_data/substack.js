// Pulls your Substack posts from its RSS feed at build time.
import Fetch from "@11ty/eleventy-fetch";
import { parseFeed } from "../../lib/substack.js";
import site from "./site.js";

export default async function () {
  if (!site.substack || site.substack.includes("YOUR-")) return [];
  try {
    const xml = await Fetch(`${site.substack.replace(/\/$/, "")}/feed`, { duration: "1d", type: "text" });
    return parseFeed(xml);
  } catch (err) {
    console.warn(`[substack] couldn't fetch feed: ${err.message}`);
    return [];
  }
}
