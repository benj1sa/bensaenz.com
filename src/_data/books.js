// Your reading shelf, from Hardcover (hardcover.app), fetched when the site builds.
//
// Key: put it in .env at the project root as HARDCOVER_TOKEN=... (HARDCOVER=... also works).
// For the live site, add it as a GitHub secret named HARDCOVER_TOKEN.
// The key never reaches the browser; only the finished HTML is published.
// Hardcover keys expire every January 1st: paste the new one into both places then.
import { fetchLibrary } from "../../lib/hardcover.js";

try { process.loadEnvFile(); } catch {} // .env is optional

export default async function () {
  const token = process.env.HARDCOVER_TOKEN || process.env.HARDCOVER;
  if (!token) {
    console.warn("[hardcover] no key found (HARDCOVER_TOKEN in .env); reading page will say 'coming soon'");
    return [];
  }
  try {
    const books = await fetchLibrary(token);
    console.log(`[hardcover] ${books.length} books`);
    return books;
  } catch (err) {
    // On GitHub, fail the build so the last good version of the site stays live
    // instead of publishing an empty shelf. Locally, just warn and keep going.
    if (process.env.CI) throw new Error(`[hardcover] ${err.message}`);
    console.warn(`[hardcover] couldn't load your shelf: ${err.message}`);
    return [];
  }
}
