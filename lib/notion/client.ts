import { Client } from "@notionhq/client";

const token = process.env.NOTION_TOKEN;

/** True when a Notion token is present. When false, the data layer returns
 *  empty results so the site still builds and renders (empty states). */
export const isNotionConfigured = Boolean(token);

/**
 * The Notion client, or `null` when unconfigured.
 *
 * Pinned to the classic API version `2022-06-28` on purpose: with it,
 * `databases.query({ database_id })` resolves a single-data-source database
 * directly (which is what all three of our databases are), keeping the query
 * and `notion-to-md` block APIs in their stable, well-documented shape.
 */
export const notion: Client | null = token
  ? new Client({ auth: token, notionVersion: "2022-06-28" })
  : null;
