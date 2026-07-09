import type { Metadata } from "next";
import { getBooks } from "@/lib/notion";
import type { Book } from "@/lib/notion";
import { groupByDomain } from "@/lib/group";
import { Section } from "@/components/Section";
import { Empty } from "@/components/Empty";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Reading",
  description: "Books Dylan is reading, with short takeaways.",
};

export default async function ReadingPage() {
  const books = await getBooks();
  const shelves = groupByDomain(books);

  return (
    <Section
      title="Reading"
      description="A shelf of what I'm reading, with the one thing I took from each."
    >
      {books.length === 0 ? (
        <Empty>Nothing on the public shelf yet.</Empty>
      ) : (
        shelves.map(([domain, items]) => (
          <section key={domain} className="space-y-5">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted">
              {domain}
            </h2>
            <ul className="space-y-5">
              {items.map((book) => (
                <li key={book.id}>
                  <BookRow book={book} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </Section>
  );
}

function BookRow({ book }: { book: Book }) {
  return (
    <div>
      <span className="font-serif text-lg text-ink">
        {book.title}
        {book.author && <span className="text-muted"> &mdash; {book.author}</span>}
      </span>
      {book.approach && (
        <p className="mt-0.5 text-sm text-muted">{book.approach}</p>
      )}
      {book.takeaway && <p className="mt-1 text-muted">{book.takeaway}</p>}
    </div>
  );
}
