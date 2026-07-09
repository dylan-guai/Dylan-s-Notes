import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntriesByType, getEntryBySlug, renderEntry } from "@/lib/notion";
import { sectionFor } from "@/lib/routes";
import { formatDate } from "@/lib/format";
import { Markdown } from "@/components/Markdown";

type Params = Promise<{ slug: string }>;

/** generateStaticParams for a per-type entry route. */
export async function entryStaticParams(type: string) {
  const entries = await getEntriesByType(type);
  return entries.map((entry) => ({ slug: entry.slug }));
}

/** generateMetadata for a per-type entry route. */
export async function entryMetadata(params: Params): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) return { title: "Not found" };
  return { title: entry.title, description: entry.excerpt ?? undefined };
}

/**
 * The shared reading template for every entry, whatever its Type. The route
 * passes its expected Type; an entry whose Type doesn't match 404s so URLs stay
 * canonical (a fieldnote only ever reads at /fieldnotes/<slug>).
 */
export async function EntryBody({
  params,
  expectedType,
}: {
  params: Params;
  expectedType: string;
}) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry || entry.type !== expectedType) notFound();

  const markdown = await renderEntry(entry.id);
  const back = sectionFor(entry.type);
  const meta = [formatDate(entry.published), entry.series]
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
        {entry.title}
      </h1>
      {meta && <p className="mt-3 text-sm text-muted">{meta}</p>}

      {markdown ? (
        <div className="prose mt-9 max-w-none">
          <Markdown>{markdown}</Markdown>
        </div>
      ) : (
        <p className="mt-9 text-muted">This entry has no content yet.</p>
      )}
    </article>
  );
}
