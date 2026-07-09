import type { Metadata } from "next";
import { getFieldnotes } from "@/lib/notion";
import { Section } from "@/components/Section";
import { EntryList } from "@/components/EntryList";
import { Empty } from "@/components/Empty";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Fieldnotes",
  description: "Travel, hobbies, volunteering, and what matters to Dylan.",
};

export default async function FieldnotesPage() {
  const entries = await getFieldnotes();

  return (
    <Section
      title="Fieldnotes"
      description="Life outside the work — travel, hobbies, volunteering, and what matters to me."
    >
      {entries.length === 0 ? (
        <Empty>Nothing published here yet.</Empty>
      ) : (
        <EntryList entries={entries} />
      )}
    </Section>
  );
}
