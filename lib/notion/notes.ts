import { cache } from "react";
import { NotionToMarkdown } from "notion-to-md";
import { notion } from "./client";
import { queryDatabase } from "./query";
import { notionDatabaseIds, noteProps, PUBLISHED } from "./config";
import {
  readTitle,
  readRichText,
  readSelect,
  readNumber,
  readDate,
  readMultiSelect,
} from "./props";
import type { Note } from "./types";

function mapNote(page: any): Note {
  const props = page.properties ?? {};
  return {
    id: page.id,
    title: readTitle(props, noteProps.title) || "Untitled",
    slug: readRichText(props, noteProps.slug),
    type: readSelect(props, noteProps.type),
    series: readSelect(props, noteProps.series),
    order: readNumber(props, noteProps.order),
    published: readDate(props, noteProps.published),
    excerpt: readRichText(props, noteProps.excerpt) || null,
    tags: readMultiSelect(props, noteProps.tags),
  };
}

/** All Published notes (any Type), newest first. Notes without a slug are skipped. */
export const getPublishedNotes = cache(async (): Promise<Note[]> => {
  const pages = await queryDatabase({
    database_id: notionDatabaseIds.notes,
    filter: { property: noteProps.status, select: { equals: PUBLISHED } },
    sorts: [{ property: noteProps.published, direction: "descending" }],
  });
  return pages.map(mapNote).filter((n) => n.slug.length > 0);
});

/** Published notes of one Type (e.g. NOTE_TYPES.research), newest first. */
export const getNotesByType = cache(async (type: string): Promise<Note[]> => {
  const pages = await queryDatabase({
    database_id: notionDatabaseIds.notes,
    filter: {
      and: [
        { property: noteProps.status, select: { equals: PUBLISHED } },
        { property: noteProps.type, select: { equals: type } },
      ],
    },
    sorts: [{ property: noteProps.published, direction: "descending" }],
  });
  return pages.map(mapNote).filter((n) => n.slug.length > 0);
});

/** A single Published note by its stable slug, or null. */
export const getNoteBySlug = cache(
  async (slug: string): Promise<Note | null> => {
    const pages = await queryDatabase({
      database_id: notionDatabaseIds.notes,
      filter: {
        and: [
          { property: noteProps.status, select: { equals: PUBLISHED } },
          { property: noteProps.slug, rich_text: { equals: slug } },
        ],
      },
      page_size: 1,
    });
    return pages[0] ? mapNote(pages[0]) : null;
  },
);

/** Fetch a page's body blocks and convert them to a Markdown string. */
export const renderNote = cache(async (pageId: string): Promise<string> => {
  if (!notion) return "";
  try {
    const n2m = new NotionToMarkdown({ notionClient: notion });
    const blocks = await n2m.pageToMarkdown(pageId);
    return n2m.toMarkdownString(blocks).parent ?? "";
  } catch (err) {
    console.error(`renderNote(${pageId}) failed:`, err);
    return "";
  }
});
