import { NOTE_TYPES } from "@/lib/notion";

/**
 * Which section an entry belongs to, based on its Type. Research Notes live at
 * /notes; internships and fieldnotes at their own routes. Used for list links
 * and the "← [section]" back link on entry pages.
 */
export function sectionFor(type: string | null): { href: string; label: string } {
  switch (type) {
    case NOTE_TYPES.internships:
      return { href: "/internships", label: "Internships" };
    case NOTE_TYPES.fieldnotes:
      return { href: "/fieldnotes", label: "Fieldnotes" };
    default:
      return { href: "/notes", label: "Notes" };
  }
}

/** Canonical URL for an entry: /<section>/<slug>. */
export function entryHref(entry: { type: string | null; slug: string }): string {
  return `${sectionFor(entry.type).href}/${entry.slug}`;
}
