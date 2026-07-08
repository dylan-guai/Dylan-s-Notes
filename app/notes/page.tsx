import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedNotes } from "@/lib/notion";
import type { Note } from "@/lib/notion";
import { formatDate } from "@/lib/format";
import { Empty } from "@/components/Empty";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Notes",
  description: "Independent research notes by Dylan Guai.",
};

function groupBySeries(notes: Note[]): [string, Note[]][] {
  const groups = new Map<string, Note[]>();
  for (const note of notes) {
    const key = note.series ?? "Other";
    const bucket = groups.get(key);
    if (bucket) bucket.push(note);
    else groups.set(key, [note]);
  }
  // Within a series: Order ascending (nulls last), then newest first.
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

export default async function NotesPage() {
  const notes = await getPublishedNotes();
  const series = groupBySeries(notes);

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          Notes
        </h1>
        <p className="text-muted">Research, grouped by series.</p>
      </header>

      {notes.length === 0 ? (
        <Empty>No notes published yet.</Empty>
      ) : (
        series.map(([name, items]) => (
          <section key={name} className="space-y-6">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted">
              {name}
            </h2>
            <ul className="space-y-7">
              {items.map((note) => (
                <li key={note.id}>
                  <Link
                    href={`/notes/${note.slug}`}
                    className="group block no-underline"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-serif text-lg text-ink decoration-1 underline-offset-4 group-hover:underline">
                        {note.title}
                      </span>
                      <span className="shrink-0 text-sm text-muted">
                        {formatDate(note.published)}
                      </span>
                    </div>
                    {note.excerpt && (
                      <p className="mt-1 text-muted">{note.excerpt}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
