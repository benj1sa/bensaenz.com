// Hardcover API helpers for src/_data/books.js. They live here because Eleventy
// ignores a data file's default export if the file exports anything else.
//
// API notes (docs.hardcover.app): 60 requests/min, query depth ≤ 3,
// tokens expire every January 1st, never call it from the browser.

const API = "https://api.hardcover.app/v1/graphql";
const PAGE = 100;

// What counts as "loved": your rating (0–5, half stars allowed) at or above this.
export const LOVED_RATING = 5;

// Hardcover status ids → shelf names the reading page uses
const SHELF = { 1: "to-read", 2: "currently-reading", 3: "read" }; // 4 paused, 5 did-not-finish: left out

export async function gql(query, variables, token, fetchImpl = fetch) {
  const res = await fetchImpl(API, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
      "user-agent": "bensaenz.com site build (eleventy)",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}${res.status === 401 ? " (token invalid or expired)" : ""}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data;
}

const ME = `query { me { id } }`;

// The query, with optional parts. If Hardcover rejects a part (too deep, not allowed for
// this key, renamed), fetchLibrary retries without it rather than failing the build.
const libraryQuery = ({ author, goodreads }) => `
query Library($userId: Int!, $limit: Int!, $offset: Int!) {
  user_books(
    where: { user_id: { _eq: $userId }, status_id: { _in: [1, 2, 3] } }
    order_by: { id: asc }
    limit: $limit
    offset: $offset
  ) {
    status_id
    rating
    last_read_date
    date_added
    book {
      id
      title
      slug
      image { url }
      ${author ? "contributions(limit: 1) { author { name } }" : ""}
    }
    ${goodreads ? "edition { isbn_13 isbn_10 book_mappings { platform_id external_id } }" : ""}
  }
}`;

// Hardcover's id for Goodreads in book_mappings; looked up by name when possible.
const PLATFORMS = `query { platforms { id name } }`;

// Where a book links: its Goodreads page if Hardcover knows the Goodreads id, else Goodreads'
// ISBN lookup (it forwards to the book), else a Goodreads search for the title and author.
export function goodreadsLink(ub, goodreadsPlatformId) {
  const b = ub.book ?? {};
  const e = ub.edition ?? {};
  const mapping = (e.book_mappings ?? []).find((m) => m.platform_id === goodreadsPlatformId && m.external_id);
  if (mapping) return `https://www.goodreads.com/book/show/${mapping.external_id}`;
  const isbn = e.isbn_13 || e.isbn_10;
  if (isbn) return `https://www.goodreads.com/book/isbn/${isbn}`;
  const author = b.contributions?.[0]?.author?.name ?? "";
  return `https://www.goodreads.com/search?q=${encodeURIComponent(`${b.title ?? ""} ${author}`.trim())}`;
}

export function toBook(ub, goodreadsPlatformId = 1) {
  const b = ub.book ?? {};
  const rating = Number(ub.rating) || 0;
  return {
    id: String(b.id ?? ""),
    title: b.title ?? "",
    author: b.contributions?.[0]?.author?.name ?? "",
    link: goodreadsLink(ub, goodreadsPlatformId),
    cover: b.image?.url ?? "",
    shelf: SHELF[ub.status_id],
    rating,
    loved: rating >= LOVED_RATING,
    dateRead: ub.last_read_date ?? "",
    dateAdded: ub.date_added ?? "",
  };
}

// currently reading first, then read (newest finished first), then want-to-read (newest added first)
export function sortBooks(books) {
  const order = { "currently-reading": 0, read: 1, "to-read": 2 };
  const key = (b) => (b.shelf === "to-read" ? b.dateAdded : b.dateRead || b.dateAdded) || "";
  return books.sort((a, b) => order[a.shelf] - order[b.shelf] || key(b).localeCompare(key(a)));
}

export async function fetchLibrary(token, fetchImpl = fetch) {
  const me = (await gql(ME, {}, token, fetchImpl)).me;
  const userId = (Array.isArray(me) ? me[0] : me)?.id;
  if (!userId) throw new Error("couldn't read your user id (does the key have read:me:content?)");

  // Find Goodreads' platform id (fall back to 1, Hardcover's id for Goodreads, if this isn't allowed).
  let goodreadsPlatformId = 1;
  try {
    const p = (await gql(PLATFORMS, {}, token, fetchImpl)).platforms ?? [];
    goodreadsPlatformId = p.find((x) => /goodreads/i.test(x.name))?.id ?? 1;
  } catch {}

  // Try the full query, then drop optional parts one at a time if Hardcover rejects them.
  const attempts = [
    { author: true, goodreads: true },
    { author: false, goodreads: true },
    { author: true, goodreads: false },
    { author: false, goodreads: false },
  ];
  let lastErr;
  for (const parts of attempts) {
    try {
      const rows = [];
      for (let offset = 0; ; offset += PAGE) {
        const page = (await gql(libraryQuery(parts), { userId, limit: PAGE, offset }, token, fetchImpl)).user_books;
        rows.push(...page);
        if (page.length < PAGE) break;
      }
      if (!parts.goodreads) console.warn("[hardcover] couldn't get Goodreads ids; books link to Goodreads search instead");
      return sortBooks(rows.map((r) => toBook(r, goodreadsPlatformId)).filter((b) => b.shelf && b.title));
    } catch (err) {
      lastErr = err;
      if (/HTTP 401|user id/.test(err.message)) throw err;   // key problems: no point retrying
    }
  }
  throw lastErr;
}
