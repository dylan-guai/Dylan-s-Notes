/**
 * Small, defensive readers for Notion page properties.
 *
 * Each reader takes the page's `properties` map and a property label, and
 * returns a clean value. If the property is missing or of the wrong type it
 * returns a sensible default — this is what lets the Reading map name optional
 * properties (Takeaway, Rating, …) that may not exist on the Library yet.
 */

type Props = Record<string, any>;

export function readTitle(props: Props, name: string): string {
  const p = props?.[name];
  if (p?.type !== "title") return "";
  return (p.title ?? []).map((t: any) => t.plain_text).join("").trim();
}

export function readRichText(props: Props, name: string): string {
  const p = props?.[name];
  if (p?.type !== "rich_text") return "";
  return (p.rich_text ?? []).map((t: any) => t.plain_text).join("").trim();
}

export function readSelect(props: Props, name: string): string | null {
  const p = props?.[name];
  if (p?.type === "select") return p.select?.name ?? null;
  if (p?.type === "status") return p.status?.name ?? null;
  return null;
}

export function readMultiSelect(props: Props, name: string): string[] {
  const p = props?.[name];
  if (p?.type !== "multi_select") return [];
  return (p.multi_select ?? []).map((o: any) => o.name).filter(Boolean);
}

export function readNumber(props: Props, name: string): number | null {
  const p = props?.[name];
  if (p?.type !== "number") return null;
  return typeof p.number === "number" ? p.number : null;
}

export function readDate(props: Props, name: string): string | null {
  const p = props?.[name];
  if (p?.type !== "date") return null;
  return p.date?.start ?? null;
}

export function readCheckbox(props: Props, name: string): boolean {
  const p = props?.[name];
  if (p?.type !== "checkbox") return false;
  return Boolean(p.checkbox);
}

export function readUrl(props: Props, name: string): string | null {
  const p = props?.[name];
  if (p?.type === "url") return p.url ?? null;
  return null;
}
