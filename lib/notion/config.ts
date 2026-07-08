/**
 * Notion content-model config — the in-code record of the database schema.
 *
 * This file plus CLAUDE.md is how the project "keeps the database in memory":
 * database IDs and the mapping from our logical field names to Notion's literal
 * property labels live here, in version control — not in one session's context.
 *
 * All written content lives in ONE database, "Dylan's Notes", split by a `Type`
 * select: Research Notes (industry landscaping), Internships (current work), and
 * Fieldnote (extracurriculars). Reading is a separate map onto Dylan's existing
 * "Library" database, so it uses that database's real property names.
 */

export const notionDatabaseIds = {
  notes: process.env.NOTION_DB_NOTES ?? "",
  reading: process.env.NOTION_DB_READING ?? "",
} as const;

/** "Dylan's Notes" database — NOTION_DB_NOTES. One row = one piece of writing. */
export const noteProps = {
  title: "Title",
  slug: "Slug",
  type: "Type", // Research Notes / Internships / Fieldnote
  status: "Status",
  published: "Published",
  series: "Series",
  order: "Order",
  excerpt: "Excerpt",
  tags: "Tags",
} as const;

/** The three content types — literal values of the Notion `Type` select. */
export const NOTE_TYPES = {
  research: "Research Notes",
  internships: "Internships",
  fieldnote: "Fieldnote",
} as const;

export type NoteType = (typeof NOTE_TYPES)[keyof typeof NOTE_TYPES];

/**
 * Reading library — NOTION_DB_READING, mapped onto Dylan's existing "Library".
 * Status is derived from the two checkboxes (there is no Status select):
 *   Read = true  -> "Read"
 *   To Get = true -> "To read"
 *   otherwise     -> "Reading"
 * takeaway / rating / link / finished are OPTIONAL — they resolve only if such
 * properties exist on the database, and are silently ignored otherwise.
 */
export const readingProps = {
  title: "Title",
  author: "Author",
  domain: "Domain", // multi-select, shown as the "shelf"
  approach: "Approach", // select
  read: "Read", // checkbox
  toGet: "To Get", // checkbox
  takeaway: "Takeaway", // optional rich text
  rating: "Rating", // optional number or select
  link: "Link", // optional url
  finished: "Finished", // optional date
} as const;

/** Only rows with Status = Published ever render on the site. */
export const PUBLISHED = "Published";

/** ISR interval (seconds) for content pages. */
export const REVALIDATE_SECONDS = 60;
