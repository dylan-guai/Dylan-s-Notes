import { cache } from "react";
import { queryDatabase } from "./query";
import { notionDatabaseIds, lifeProps, PUBLISHED } from "./config";
import {
  readTitle,
  readRichText,
  readSelect,
  readDate,
} from "./props";
import type { LifeEntry } from "./types";

function mapLifeEntry(page: any): LifeEntry {
  const props = page.properties ?? {};
  return {
    id: page.id,
    title: readTitle(props, lifeProps.title) || "Untitled",
    type: readSelect(props, lifeProps.type),
    date: readDate(props, lifeProps.date),
    place: readRichText(props, lifeProps.place) || null,
    summary: readRichText(props, lifeProps.summary) || null,
  };
}

/** All Published life entries, newest first. Bodies (with images) are rendered
 *  separately by the page via renderNote(id). */
export const getLifeEntries = cache(async (): Promise<LifeEntry[]> => {
  const pages = await queryDatabase({
    database_id: notionDatabaseIds.life,
    filter: { property: lifeProps.status, select: { equals: PUBLISHED } },
    sorts: [{ property: lifeProps.date, direction: "descending" }],
  });
  return pages.map(mapLifeEntry);
});
