import { cache } from "react";
import { NotionToMarkdown } from "notion-to-md";
import { notion } from "./client";
import { queryDatabase } from "./query";
import { notionDatabaseIds, entryProps, PUBLISHED, NOTE_TYPES } from "./config";
import {
  readTitle,
  readRichText,
  readSelect,
  readNumber,
  readDate,
  readMultiSelect,
} from "./props";
import type { Entry } from "./types";

function mapEntry(page: any): Entry {
  const props = page.properties ?? {};
  return {
    id: page.id,
    title: readTitle(props, entryProps.title) || "Untitled",
    slug: readRichText(props, entryProps.slug),
    type: readSelect(props, entryProps.type),
    series: readSelect(props, entryProps.series),
    order: readNumber(props, entryProps.order),
    published: readDate(props, entryProps.published),
    excerpt: readRichText(props, entryProps.excerpt) || null,
    tags: readMultiSelect(props, entryProps.tags),
  };
}

/** Published entries of one Type, by Order (ascending) then newest first. */
export const getEntriesByType = cache(async (type: string): Promise<Entry[]> => {
  const pages = await queryDatabase({
    database_id: notionDatabaseIds.content,
    filter: {
      and: [
        { property: entryProps.status, select: { equals: PUBLISHED } },
        { property: entryProps.type, select: { equals: type } },
      ],
    },
    sorts: [
      { property: entryProps.order, direction: "ascending" },
      { property: entryProps.published, direction: "descending" },
    ],
  });
  return pages.map(mapEntry).filter((e) => e.slug.length > 0);
});

export const getResearchNotes = () => getEntriesByType(NOTE_TYPES.research);
export const getInternships = () => getEntriesByType(NOTE_TYPES.internships);
export const getFieldnotes = () => getEntriesByType(NOTE_TYPES.fieldnotes);

/** Recent Published entries across all types (for the home list). */
export const getRecentEntries = cache(async (limit = 8): Promise<Entry[]> => {
  const pages = await queryDatabase({
    database_id: notionDatabaseIds.content,
    filter: { property: entryProps.status, select: { equals: PUBLISHED } },
    sorts: [{ property: entryProps.published, direction: "descending" }],
  });
  return pages
    .map(mapEntry)
    .filter((e) => e.slug.length > 0)
    .slice(0, limit);
});

/** A single Published entry by its stable slug (any Type), or null. */
export const getEntryBySlug = cache(
  async (slug: string): Promise<Entry | null> => {
    const pages = await queryDatabase({
      database_id: notionDatabaseIds.content,
      filter: {
        and: [
          { property: entryProps.status, select: { equals: PUBLISHED } },
          { property: entryProps.slug, rich_text: { equals: slug } },
        ],
      },
      page_size: 1,
    });
    return pages[0] ? mapEntry(pages[0]) : null;
  },
);

/** Fetch a page's body blocks and convert them to a Markdown string. */
export const renderEntry = cache(async (pageId: string): Promise<string> => {
  if (!notion) return "";
  try {
    const n2m = new NotionToMarkdown({ notionClient: notion });
    const blocks = await n2m.pageToMarkdown(pageId);
    return n2m.toMarkdownString(blocks).parent ?? "";
  } catch (err) {
    console.error(`renderEntry(${pageId}) failed:`, err);
    return "";
  }
});
