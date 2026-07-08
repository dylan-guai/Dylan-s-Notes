import type { Metadata } from "next";
import { getNotesByType, NOTE_TYPES } from "@/lib/notion";
import { Section } from "@/components/Section";
import { NoteList } from "@/components/NoteList";
import { Empty } from "@/components/Empty";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Fieldnotes",
  description: "Travel, hobbies, volunteering, and what matters to Dylan.",
};

export default async function FieldnotesPage() {
  const notes = await getNotesByType(NOTE_TYPES.fieldnote);

  return (
    <Section
      title="Fieldnotes"
      description="Life outside the work — travel, hobbies, volunteering, and what matters to me."
    >
      {notes.length === 0 ? (
        <Empty>Nothing published here yet.</Empty>
      ) : (
        <NoteList notes={notes} />
      )}
    </Section>
  );
}
