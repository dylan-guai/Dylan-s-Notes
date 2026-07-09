import type { Metadata } from "next";
import { getResearchNotes } from "@/lib/notion";
import { groupBySeries } from "@/lib/group";
import { Section } from "@/components/Section";
import { EntryList } from "@/components/EntryList";
import { Empty } from "@/components/Empty";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Independent industry-landscaping research on physical & embodied AI.",
};

export default async function NotesPage() {
  const entries = await getResearchNotes();
  const series = groupBySeries(entries);

  return (
    <Section
      title="Research Notes"
      description="Industry landscaping — physical & embodied AI, read through one recurring lens: the demo-to-deployable gap."
    >
      {entries.length === 0 ? (
        <Empty>Nothing published here yet.</Empty>
      ) : (
        series.map(([name, items]) => (
          <section key={name} className="space-y-6">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted">
              {name}
            </h2>
            <EntryList entries={items} />
          </section>
        ))
      )}
    </Section>
  );
}
