import { cache } from "react";
import { queryDatabase } from "./query";
import { notionDatabaseIds, readingProps } from "./config";
import {
  readTitle,
  readRichText,
  readMultiSelect,
  readSelect,
  readCheckbox,
  readNumber,
  readUrl,
} from "./props";
import type { Book, BookStatus } from "./types";

function mapBook(page: any): Book {
  const props = page.properties ?? {};
  const read = readCheckbox(props, readingProps.read);
  const toGet = readCheckbox(props, readingProps.toGet);
  const status: BookStatus = read ? "Read" : toGet ? "To read" : "Reading";

  // Rating may be a number or a select, depending on how the DB models it.
  const ratingNum = readNumber(props, readingProps.rating);
  const rating = ratingNum != null ? String(ratingNum) : readSelect(props, readingProps.rating);

  return {
    id: page.id,
    title: readTitle(props, readingProps.title) || "Untitled",
    author: readRichText(props, readingProps.author) || null,
    status,
    shelf: readMultiSelect(props, readingProps.domain),
    approach: readSelect(props, readingProps.approach),
    takeaway: readRichText(props, readingProps.takeaway) || null,
    rating,
    link: readUrl(props, readingProps.link),
  };
}

/** Every book in the Library, sorted by title. */
export const getBooks = cache(async (): Promise<Book[]> => {
  const pages = await queryDatabase({
    database_id: notionDatabaseIds.reading,
    sorts: [{ property: readingProps.title, direction: "ascending" }],
  });
  return pages.map(mapBook);
});
