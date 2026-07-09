import { notion } from "./client";

type QueryInput = {
  database_id: string;
  filter?: unknown;
  sorts?: unknown;
  page_size?: number;
};

/**
 * Query a database, following pagination to completion, and never throwing.
 * Returns [] when Notion is unconfigured or the request fails, so a Notion
 * outage or a not-yet-shared database degrades to an empty section rather than
 * a 500. Results are returned untyped; callers map them into typed objects.
 */
export async function queryDatabase(params: QueryInput): Promise<any[]> {
  if (!notion || !params.database_id) return [];

  const results: any[] = [];
  let cursor: string | undefined;

  try {
    do {
      const res = await notion.databases.query({
        ...(params as any),
        start_cursor: cursor,
        page_size: params.page_size ?? 100,
      });
      results.push(...res.results);
      cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
    } while (cursor);
  } catch (err) {
    console.error(`queryDatabase(${params.database_id}) failed:`, err);
    return [];
  }

  return results;
}
