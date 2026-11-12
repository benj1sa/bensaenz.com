// Everything you'd normally need to edit lives here.
export default {
  name: "Benjamin Saenz",
  url: "https://bensaenz.com",
  description: "Benjamin Saenz's personal site.",

  // Describes your home photo (src/photos/home.jpg) for people using screen readers.
  photoAlt: "Ben smiling, sitting on a stone ledge in a park",

  // Main sections. Uncomment making/art when they're ready.
  sections: [
    { label: "about", href: "/" },
    { label: "work", href: "/work/" },
    { label: "reading", href: "/reading/" },
    { label: "writing", href: "/writing/" },
    // { label: "making", href: "/making/" },
    // { label: "art", href: "/art/" },
  ],

  links: [
    { label: "linkedin", href: "https://www.linkedin.com/in/bsaenz2" },
    { label: "github", href: "https://github.com/benj1sa" },
    { label: "zotero", href: "https://www.zotero.org/YOUR-HANDLE/library" },
  ],

  // Split so the address isn't sitting in the HTML for scrapers.
  email: { user: "hello", domain: "bensaenz.com" },

  // Substack: your publication's address (works with a custom domain too).
  substack: "https://bsaenz.substack.com",

  // Reading shelf: drop your Goodreads export in src/_data/ as
  // goodreads_library_export.csv. "Loved" rules are at the top of lib/goodreads.js.
};
