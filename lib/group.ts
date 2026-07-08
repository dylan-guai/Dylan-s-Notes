import type { Note } from "@/lib/notion";

/**
 * Group notes by their Series, ordered within each series by Order (ascending,
 * nulls last) then newest first. Notes with no series fall under "Other".
 */
export function groupBySeries(notes: Note[]): [string, Note[]][] {
  const groups = new Map<string, Note[]>();
  for (const note of notes) {
    const key = note.series ?? "Other";
    const bucket = groups.get(key);
    if (bucket) bucket.push(note);
    else groups.set(key, [note]);
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
