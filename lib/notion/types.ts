export type Note = {
  id: string;
  title: string;
  slug: string;
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

export type LifeEntry = {
  id: string;
  title: string;
  type: string | null;
  date: string | null; // ISO date
  place: string | null;
  summary: string | null;
};
