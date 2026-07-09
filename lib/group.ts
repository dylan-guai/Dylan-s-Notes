import type { Entry, Book } from "@/lib/notion";

/**
 * Group entries by Series, ordered within each series by Order (ascending,
 * nulls last) then newest first. Entries with no series fall under "Other".
 */
export function groupBySeries(entries: Entry[]): [string, Entry[]][] {
  const groups = new Map<string, Entry[]>();
  for (const entry of entries) {
    const key = entry.series ?? "Other";
    const bucket = groups.get(key);
    if (bucket) bucket.push(entry);
    else groups.set(key, [entry]);
  }
  for (const bucket of groups.values()) {
    bucket.sort((a, b) => {
      const ao = a.order ?? Number.POSITIVE_INFINITY;
      const bo = b.order ?? Number.POSITIVE_INFINITY;
      if (ao !== bo) return ao - bo;
      return (b.published ?? "").localeCompare(a.published ?? "");
    });
  }
  return [...groups.entries()];
}

/**
 * Group books by their first Domain (their "shelf"), alphabetically. Books with
 * no domain fall under "Other" (sorted last).
 */
export function groupByDomain(books: Book[]): [string, Book[]][] {
  const groups = new Map<string, Book[]>();
  for (const book of books) {
    const key = book.domain[0] ?? "Other";
    const bucket = groups.get(key);
    if (bucket) bucket.push(book);
    else groups.set(key, [book]);
  }
  return [...groups.entries()].sort(([a], [b]) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });
}
