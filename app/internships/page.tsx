import type { Metadata } from "next";
import { getNotesByType, NOTE_TYPES } from "@/lib/notion";
import { Section } from "@/components/Section";
import { NoteList } from "@/components/NoteList";
import { Empty } from "@/components/Empty";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Internships",
  description: "Notes from the internships Dylan is working through now.",
};

export default async function InternshipsPage() {
  const notes = await getNotesByType(NOTE_TYPES.internships);

  return (
    <Section
      title="Internships"
      description="Notes from the work I'm in the middle of right now."
    >
      {notes.length === 0 ? (
        <Empty>Nothing published here yet.</Empty>
      ) : (
        <NoteList notes={notes} />
      )}
    </Section>
  );
}
