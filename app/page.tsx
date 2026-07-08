import Link from "next/link";
import { getPublishedNotes } from "@/lib/notion";
import { formatDate } from "@/lib/format";
import { Empty } from "@/components/Empty";

export const revalidate = 60;

export default async function HomePage() {
  const notes = (await getPublishedNotes()).slice(0, 8);

  return (
    <div className="space-y-14">
      <section className="space-y-4">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          Dylan&rsquo;s Notes
        </h1>
        <p className="max-w-[46ch] text-muted">
          Independent research on physical &amp; embodied AI, read through one
          recurring lens — the demo-to-deployable gap. Plus a reading library
          and a little life.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted">
          Recent writing
        </h2>
        {notes.length === 0 ? (
          <Empty>No notes published yet.</Empty>
        ) : (
          <ul className="space-y-7">
            {notes.map((note) => (
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
        )}
        <Link
          href="/notes"
          className="inline-block text-sm text-muted no-underline transition-colors hover:text-ink"
        >
          All notes &rarr;
        </Link>
      </section>
    </div>
  );
}
