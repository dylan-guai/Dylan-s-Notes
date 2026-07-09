import type { Metadata } from "next";
import { getInternships } from "@/lib/notion";
import { Section } from "@/components/Section";
import { EntryList } from "@/components/EntryList";
import { Empty } from "@/components/Empty";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Internships",
  description: "Notes from the internship work Dylan is going through now.",
};

export default async function InternshipsPage() {
  const entries = await getInternships();

  return (
    <Section
      title="Internships"
      description="Notes from the work I'm in the middle of right now — what I'm doing, learning, and shipping."
    >
      {entries.length === 0 ? (
        <Empty>Nothing published here yet.</Empty>
      ) : (
        <EntryList entries={entries} />
      )}
    </Section>
  );
}
