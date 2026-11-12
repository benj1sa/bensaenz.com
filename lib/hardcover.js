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

const libraryQuery = (withAuthor) => `
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
      ${withAuthor ? "contributions(limit: 1) { author { name } }" : ""}
    }
  }
}`;

export function toBook(ub) {
  const b = ub.book ?? {};
  const rating = Number(ub.rating) || 0;
  return {
    id: String(b.id ?? ""),
    title: b.title ?? "",
    author: b.contributions?.[0]?.author?.name ?? "",
    link: b.slug ? `https://hardcover.app/books/${b.slug}` : "",
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

  let withAuthor = true;
  const rows = [];
  for (let offset = 0; ; offset += PAGE) {
    let page;
    try {
      page = (await gql(libraryQuery(withAuthor), { userId, limit: PAGE, offset }, token, fetchImpl)).user_books;
    } catch (err) {
      // If Hardcover rejects the author lookup as too deep, carry on without author names.
      if (withAuthor && /depth/i.test(err.message)) { withAuthor = false; offset -= PAGE; continue; }
      throw err;
    }
    rows.push(...page);
    if (page.length < PAGE) break;
  }
  return sortBooks(rows.map(toBook).filter((b) => b.shelf && b.title));
}
