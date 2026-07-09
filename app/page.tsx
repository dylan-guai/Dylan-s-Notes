import Link from "next/link";
import { getRecentEntries } from "@/lib/notion";
import { EntryList } from "@/components/EntryList";
import { Empty } from "@/components/Empty";

export const revalidate = 60;

const sections = [
  { href: "/notes", label: "Research" },
  { href: "/internships", label: "Internships" },
  { href: "/fieldnotes", label: "Fieldnotes" },
  { href: "/reading", label: "Reading" },
];

export default async function HomePage() {
  const entries = await getRecentEntries(8);

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
        {entries.length === 0 ? (
          <Empty>No entries published yet.</Empty>
        ) : (
          <EntryList entries={entries} showType />
        )}
        <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
          {sections.map((s) => (
            <Link key={s.href} href={s.href} className="no-underline hover:text-ink">
              {s.label} &rarr;
            </Link>
          ))}
        </nav>
      </section>
    </div>
  );
}
