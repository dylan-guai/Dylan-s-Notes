import { cache } from "react";
import { queryDatabase } from "./query";
import { notionDatabaseIds, libraryProps } from "./config";
import {
  readTitle,
  readRichText,
  readMultiSelect,
  readSelect,
} from "./props";
import type { Book } from "./types";

function mapBook(page: any): Book {
  const props = page.properties ?? {};
  return {
    id: page.id,
    title: readTitle(props, libraryProps.title) || "Untitled",
    author: readRichText(props, libraryProps.author) || null,
    domain: readMultiSelect(props, libraryProps.domain),
    approach: readSelect(props, libraryProps.approach),
    takeaway: readRichText(props, libraryProps.takeaway) || null,
  };
}

/**
 * Public reading shelf: books from the Library where `Publish` is checked,
 * sorted by title. Private by default — an unchecked book never renders.
 */
export const getBooks = cache(async (): Promise<Book[]> => {
  const pages = await queryDatabase({
    database_id: notionDatabaseIds.library,
    filter: { property: libraryProps.publish, checkbox: { equals: true } },
    sorts: [{ property: libraryProps.title, direction: "ascending" }],
  });
  return pages.map(mapBook);
});
