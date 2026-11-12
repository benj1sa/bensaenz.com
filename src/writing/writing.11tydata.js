// Settings shared by every post in this folder.
// To hide a post without deleting it, add `hidden: true` to its front matter:
// it won't be published, listed, or shown from Substack either.
export default {
  layout: "post.njk",
  tags: "posts",
  section: "writing",
  eleventyComputed: {
    permalink: (data) => (data.hidden ? false : `/writing/${data.page.fileSlug}/`),
  },
};
