export type Note = {
  id: string;
  title: string;
  slug: string;
  type: string | null; // Research Notes / Internships / Fieldnote
  series: string | null;
  order: number | null;
  published: string | null; // ISO date (YYYY-MM-DD)
  excerpt: string | null;
  tags: string[];
};

export type BookStatus = "Reading" | "Read" | "To read";

export type Book = {
  id: string;
  title: string;
  author: string | null;
  status: BookStatus;
  shelf: string[]; // Domain / category
  approach: string | null;
  takeaway: string | null; // optional; empty unless the DB has a Takeaway property
  rating: string | null; // optional
  link: string | null; // optional
};
