import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublishedNotes,
  getNoteBySlug,
  renderNote,
  NOTE_TYPES,
} from "@/lib/notion";
import { formatDate } from "@/lib/format";
import { Markdown } from "@/components/Markdown";

export const revalidate = 60;

export async function generateStaticParams() {
  const notes = await getPublishedNotes();
  return notes.map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) return { title: "Not found" };
  return {
    title: note.title,
    description: note.excerpt ?? undefined,
  };
}

/** Where the "← back" link points, based on the note's Type. */
function sectionFor(type: string | null): { href: string; label: string } {
  switch (type) {
    case NOTE_TYPES.internships:
      return { href: "/internships", label: "Internships" };
    case NOTE_TYPES.fieldnote:
      return { href: "/fieldnotes", label: "Fieldnotes" };
    default:
      return { href: "/research", label: "Research" };
  }
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) notFound();

  const markdown = await renderNote(note.id);
  const back = sectionFor(note.type);
  const meta = [formatDate(note.published), note.series]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="mx-auto max-w-[680px]">
      <Link
        href={back.href}
        className="text-sm text-muted no-underline transition-colors hover:text-ink"
      >
        &larr; {back.label}
      </Link>

      <h1 className="mt-6 font-serif text-3xl font-semibold leading-tight tracking-tight">
        {note.title}
      </h1>
      {meta && <p className="mt-3 text-sm text-muted">{meta}</p>}

      {markdown ? (
        <div className="prose mt-9 max-w-none">
          <Markdown>{markdown}</Markdown>
        </div>
      ) : (
        <p className="mt-9 text-muted">This note has no content yet.</p>
      )}
    </article>
  );
}
