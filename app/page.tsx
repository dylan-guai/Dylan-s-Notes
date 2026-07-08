import Link from "next/link";
import { getPublishedNotes } from "@/lib/notion";
import { NoteList } from "@/components/NoteList";
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
        <p className="max-w-[48ch] text-muted">
          Independent research on physical &amp; embodied AI, read through one
          recurring lens — the demo-to-deployable gap — alongside notes from the
          field and a reading library.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted">
          Recent writing
        </h2>
        {notes.length === 0 ? (
          <Empty>No notes published yet.</Empty>
        ) : (
          <NoteList notes={notes} showType />
        )}
        <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
          <Link href="/research" className="no-underline hover:text-ink">
            Research &rarr;
          </Link>
          <Link href="/internships" className="no-underline hover:text-ink">
            Internships &rarr;
          </Link>
          <Link href="/fieldnotes" className="no-underline hover:text-ink">
            Fieldnotes &rarr;
          </Link>
          <Link href="/reading" className="no-underline hover:text-ink">
            Reading &rarr;
          </Link>
        </nav>
      </section>
    </div>
  );
}
