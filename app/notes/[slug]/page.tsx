import { NOTE_TYPES } from "@/lib/notion";
import { entryStaticParams, entryMetadata, EntryBody } from "@/components/entry";

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return entryStaticParams(NOTE_TYPES.research);
}

export function generateMetadata({ params }: { params: Params }) {
  return entryMetadata(params);
}

export default function ResearchNotePage({ params }: { params: Params }) {
  return <EntryBody params={params} expectedType={NOTE_TYPES.research} />;
}
