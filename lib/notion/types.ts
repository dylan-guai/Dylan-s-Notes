export type Entry = {
  id: string;
  title: string;
  slug: string;
  type: string | null; // Research Notes / Internships / Fieldnotes
  series: string | null;
  order: number | null;
  published: string | null; // ISO date (YYYY-MM-DD)
  excerpt: string | null;
  tags: string[];
};

export type Book = {
  id: string;
  title: string;
  author: string | null;
  domain: string[]; // "shelf" — grouped by on /reading
  approach: string | null;
  takeaway: string | null;
};
