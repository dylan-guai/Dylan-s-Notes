/**
 * Notion content-model config — the in-code record of the database schema.
 *
 * This file plus CLAUDE.md is how the project "keeps the database in memory":
 * database IDs and the mapping from our logical field names to Notion's literal
 * property labels live here, in version control — not in one session's context.
 *
 * To point a section at a different Notion database, or to rename a property in
 * Notion, edit the right-hand side of the relevant map. The Reading map targets
 * Dylan's existing "Library" database, so it uses that database's real property
 * names (Author / Domain / Approach / Read / To Get) rather than forcing a
 * rename.
 */

export const notionDatabaseIds = {
  notes: process.env.NOTION_DB_NOTES ?? "",
  reading: process.env.NOTION_DB_READING ?? "",
  life: process.env.NOTION_DB_LIFE ?? "",
} as const;

/** Research notes — NOTION_DB_NOTES (created for this site). */
export const noteProps = {
  title: "Title",
  slug: "Slug",
  status: "Status",
  published: "Published",
  series: "Series",
  order: "Order",
  excerpt: "Excerpt",
  tags: "Tags",
} as const;

/**
 * Reading library — NOTION_DB_READING, mapped onto Dylan's existing "Library".
 * Status is derived from the two checkboxes (there is no Status select):
 *   Read = true  -> "Read"
 *   To Get = true -> "To read"
 *   otherwise     -> "Reading"
 * takeaway / rating / link / finished are OPTIONAL — they resolve only if such
 * properties exist on the database, and are silently ignored otherwise. Add
 * them to the Library and they light up with no code change.
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

/** Life / extracurriculars — NOTION_DB_LIFE (created for this site). */
export const lifeProps = {
  title: "Title",
  type: "Type",
  date: "Date",
  place: "Place",
  summary: "Summary",
  status: "Status",
} as const;

/** Only rows with Status = Published ever render on the site. */
export const PUBLISHED = "Published";

/** ISR interval (seconds) for content pages. */
export const REVALIDATE_SECONDS = 60;
