// Parsing helper for src/_data/substack.js (kept separate; see lib/goodreads.js).
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({ ignoreAttributes: true });

export function parseFeed(xml) {
  const items = parser.parse(xml)?.rss?.channel?.item ?? [];
  return [].concat(items).map((item) => ({
    title: String(item.title ?? "").trim(),
    link: String(item.link ?? "").trim(),
    date: new Date(item.pubDate),
    summary: String(item.description ?? "").trim(),
  }));
}
