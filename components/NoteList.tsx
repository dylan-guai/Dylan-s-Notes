import Link from "next/link";
import type { Note } from "@/lib/notion";
import { formatDate } from "@/lib/format";

/** A single note row: title (link), a muted meta line, and the excerpt. */
export function NoteRow({
  note,
  showType = false,
}: {
  note: Note;
  showType?: boolean;
}) {
  const meta = [formatDate(note.published), showType ? note.type : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link href={`/notes/${note.slug}`} className="group block no-underline">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-serif text-lg text-ink decoration-1 underline-offset-4 group-hover:underline">
          {note.title}
        </span>
        {meta && <span className="shrink-0 text-sm text-muted">{meta}</span>}
      </div>
      {note.excerpt && <p className="mt-1 text-muted">{note.excerpt}</p>}
    </Link>
  );
}

export function NoteList({
  notes,
  showType = false,
}: {
  notes: Note[];
  showType?: boolean;
}) {
  return (
    <ul className="space-y-7">
      {notes.map((note) => (
        <li key={note.id}>
          <NoteRow note={note} showType={showType} />
        </li>
      ))}
    </ul>
  );
}
