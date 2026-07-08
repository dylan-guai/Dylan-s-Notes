import type { Metadata } from "next";
import { getNotesByType, NOTE_TYPES } from "@/lib/notion";
import { groupBySeries } from "@/lib/group";
import { Section } from "@/components/Section";
import { NoteList } from "@/components/NoteList";
import { Empty } from "@/components/Empty";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Research",
  description:
    "Independent industry-landscaping research on physical & embodied AI.",
};

export default async function ResearchPage() {
  const notes = await getNotesByType(NOTE_TYPES.research);
  const series = groupBySeries(notes);

  return (
    <Section
      title="Research Notes"
      description="Industry landscaping — physical & embodied AI, read through one recurring lens: the demo-to-deployable gap."
    >
      {notes.length === 0 ? (
        <Empty>Nothing published here yet.</Empty>
      ) : (
        series.map(([name, items]) => (
          <section key={name} className="space-y-6">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted">
              {name}
            </h2>
            <NoteList notes={items} />
          </section>
        ))
      )}
    </Section>
  );
}
