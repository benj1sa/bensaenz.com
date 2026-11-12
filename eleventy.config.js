import fs from "node:fs";
import path from "node:path";
import Image from "@11ty/eleventy-img";

const PHOTOS = "src/photos";
const IMAGE_TYPES = /\.(jpe?g|png|webp|avif)$/i;

// Resizes a photo into small/large WebP + JPEG copies (cached, so rebuilds are fast).
function optimize(src, widths) {
  return Image(src, {
    widths,
    formats: ["webp", "jpeg"],
    outputDir: "_site/img/",
    urlPath: "/img/",
  });
}

// Screen-reader description for a photo: from descriptions.json in its folder if listed there,
// otherwise from the file name ("02-snowboarding-with-friends.jpg" → "Snowboarding with friends").
// Camera names like IMG_0457 with no description are treated as decorative ("").
function describe(file, descriptions) {
  if (descriptions[file]) return descriptions[file];
  const name = path.parse(file).name;
  if (/^(img|dsc|pxl|photo|image)[\W_]*\d+/i.test(name)) return "";
  const words = name.replace(/^\d+[-_ ]*/, "").replace(/[-_]+/g, " ").trim();   // drop "01-" ordering prefix
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "/" }); // css, js, fonts, signature, _redirects

  // Rebuild pages when you add a signature or photos while `npm start` is running
  // (otherwise they only show up after restarting it).
  eleventyConfig.addWatchTarget("./src/assets/signature.svg");
  eleventyConfig.addWatchTarget("./src/photos/");

  // The signature is shown once src/assets/signature.svg exists; its shape is read from the file.
  eleventyConfig.addGlobalData("assets", () => {
    let signature = "", signatureRatio = "1000 / 438";
    if (fs.existsSync("src/assets/signature.svg")) {
      signature = "signature.svg";
      const box = fs.readFileSync("src/assets/signature.svg", "utf8").match(/viewBox="[\d.\-]+ [\d.\-]+ ([\d.]+) ([\d.]+)"/);
      if (box) signatureRatio = `${box[1]} / ${box[2]}`;
    }
    return { signature, signatureRatio };
  });

  // {% homePhoto "alt text" %} → src/photos/home.jpg (black and white until hovered)
  eleventyConfig.addAsyncShortcode("homePhoto", async (alt) => {
    const file = fs.readdirSync(PHOTOS).find((f) => /^home\./i.test(f) && IMAGE_TYPES.test(f));
    if (!file) return "";
    const meta = await optimize(path.join(PHOTOS, file), [600, 1200]);
    return Image.generateHTML(meta, {
      alt, class: "about-photo", sizes: "(max-width: 760px) min(22rem, 100vw), 18rem",
      loading: "eager", decoding: "async",
    });
  });

  // {% photos "people" %} → every photo in src/photos/people/, in a masonry grid like hers.
  // Order is by file name, so prefix with 01-, 02-… to arrange them.
  eleventyConfig.addAsyncShortcode("photos", async (folder) => {
    const dir = path.join(PHOTOS, folder);
    if (!fs.existsSync(dir)) return "";
    const files = fs.readdirSync(dir).filter((f) => IMAGE_TYPES.test(f)).sort();
    if (!files.length) return "";
    const descFile = path.join(dir, "descriptions.json");
    const descriptions = fs.existsSync(descFile) ? JSON.parse(fs.readFileSync(descFile, "utf8")) : {};
    const items = await Promise.all(files.map(async (f) => {
      const meta = await optimize(path.join(dir, f), [400, 800]);
      return `<div class="gallery-photo">${Image.generateHTML(meta, {
        alt: describe(f, descriptions), sizes: "(max-width: 600px) 50vw, (max-width: 900px) 30vw, 18rem",
        loading: "lazy", decoding: "async",
      })}</div>`;
    }));
    return `<div class="gallery">${items.join("")}</div>`;
  });

  // used by reading.njk to tally the filter counts
  eleventyConfig.addFilter("setAttr", (obj, key, value) => ({ ...obj, [key]: value }));

  // "August 17, 2026"
  eleventyConfig.addFilter("longDate", (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }));

  // "November 2026"
  eleventyConfig.addFilter("monthYear", (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
