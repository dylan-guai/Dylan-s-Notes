import Link from "next/link";
import type { Entry } from "@/lib/notion";
import { entryHref } from "@/lib/routes";
import { formatDate } from "@/lib/format";

/** A single entry row: title (link), a muted meta line, and the excerpt. */
export function EntryRow({
  entry,
  showType = false,
}: {
  entry: Entry;
  showType?: boolean;
}) {
  const meta = [formatDate(entry.published), showType ? entry.type : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link href={entryHref(entry)} className="group block no-underline">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-serif text-lg text-ink decoration-1 underline-offset-4 group-hover:underline">
          {entry.title}
        </span>
        {meta && <span className="shrink-0 text-sm text-muted">{meta}</span>}
      </div>
      {entry.excerpt && <p className="mt-1 text-muted">{entry.excerpt}</p>}
    </Link>
  );
}

export function EntryList({
  entries,
  showType = false,
}: {
  entries: Entry[];
  showType?: boolean;
}) {
  return (
    <ul className="space-y-7">
      {entries.map((entry) => (
        <li key={entry.id}>
          <EntryRow entry={entry} showType={showType} />
        </li>
      ))}
    </ul>
  );
}
