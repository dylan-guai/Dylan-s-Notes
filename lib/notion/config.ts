/**
 * Notion content-model config — the in-code record of the database schema.
 *
 * This file plus CLAUDE.md is how the project "keeps the database in memory":
 * database IDs and the mapping from our logical field names to Notion's literal
 * property labels live here, in version control — not in one session's context.
 *
 * TWO source databases (both under the "26" hub):
 *   1. "Dylan's Notes" (NOTION_DB_CONTENT) — all long-form entries, split by a
 *      `Type` select: Research Notes / Internships / Fieldnotes.
 *   2. "Library"        (NOTION_DB_LIBRARY) — the existing reading list. Books
 *      render on the site only when the `Publish` checkbox is ticked.
 */

export const notionDatabaseIds = {
  content: process.env.NOTION_DB_CONTENT ?? "",
  library: process.env.NOTION_DB_LIBRARY ?? "",
} as const;

/** "Dylan's Notes" content DB — one row = one entry; `Type` picks the section. */
export const entryProps = {
  title: "Title",
  type: "Type", // Research Notes / Internships / Fieldnotes
  slug: "Slug",
  status: "Status",
  published: "Published",
  series: "Series",
  order: "Order",
  excerpt: "Excerpt",
  tags: "Tags",
} as const;

/** The three content types — exact literal values of the Notion `Type` select. */
export const NOTE_TYPES = {
  research: "Research Notes",
  internships: "Internships",
  fieldnotes: "Fieldnotes",
} as const;

export type NoteType = (typeof NOTE_TYPES)[keyof typeof NOTE_TYPES];

/**
 * Reading library — mapped onto Dylan's existing "Library" database by its real
 * schema. `Publish` is the public gate (private by default — nothing renders
 * until it is checked); `Takeaway` is the one-line note shown on /reading.
 * The Library has no Status select, Rating, Finished date, or Link URL.
 */
export const libraryProps = {
  title: "Title",
  author: "Author",
  domain: "Domain", // multi-select — the "shelf" the /reading page groups by
  approach: "Approach", // select — reading depth
  read: "Read", // checkbox
  toGet: "To Get", // checkbox
  publish: "Publish", // checkbox — public gate
  takeaway: "Takeaway", // rich text — one-liner shown publicly
} as const;

/** Content entries render only when Status = Published. */
export const PUBLISHED = "Published";

/** ISR interval (seconds) for content pages. */
export const REVALIDATE_SECONDS = 60;
