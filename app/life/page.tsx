import type { Metadata } from "next";
import { getLifeEntries, renderNote } from "@/lib/notion";
import { formatDate } from "@/lib/format";
import { Markdown } from "@/components/Markdown";
import { Empty } from "@/components/Empty";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Life",
  description: "Travel, hobbies, volunteering, and what matters to Dylan.",
};

export default async function LifePage() {
  const entries = await getLifeEntries();

  // Render each entry's body (images live there). Sequential to stay well
  // within Notion's ~3 req/s limit; there are only a handful of entries.
  const withBodies: { id: string; body: string }[] = [];
  for (const entry of entries) {
    withBodies.push({ id: entry.id, body: await renderNote(entry.id) });
  }
  const bodyById = new Map(withBodies.map((b) => [b.id, b.body]));

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          Life
        </h1>
        <p className="text-muted">Travel, hobbies, volunteering.</p>
      </header>

      {entries.length === 0 ? (
        <Empty>Nothing here yet.</Empty>
      ) : (
        <div className="space-y-14">
          {entries.map((entry) => {
            const meta = [formatDate(entry.date), entry.type, entry.place]
              .filter(Boolean)
              .join(" · ");
            const body = bodyById.get(entry.id) ?? "";
            return (
              <article key={entry.id} className="space-y-3">
                <div className="space-y-1">
                  <h2 className="font-serif text-xl font-semibold tracking-tight">
                    {entry.title}
                  </h2>
                  {meta && <p className="text-sm text-muted">{meta}</p>}
                </div>
                {entry.summary && (
                  <p className="text-ink">{entry.summary}</p>
                )}
                {body && (
                  <div className="prose max-w-none text-[1.0625rem]">
                    <Markdown>{body}</Markdown>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
