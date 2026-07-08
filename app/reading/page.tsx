import type { Metadata } from "next";
import { getBooks } from "@/lib/notion";
import type { Book, BookStatus } from "@/lib/notion";
import { Empty } from "@/components/Empty";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Reading",
  description: "Books Dylan is reading, with short takeaways.",
};

const STATUS_ORDER: BookStatus[] = ["Reading", "Read", "To read"];
const STATUS_LABEL: Record<BookStatus, string> = {
  Reading: "Currently reading",
  Read: "Read",
  "To read": "To read",
};

export default async function ReadingPage() {
  const books = await getBooks();

  const grouped = STATUS_ORDER.map(
    (status) => [status, books.filter((b) => b.status === status)] as const,
  ).filter(([, items]) => items.length > 0);

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          Reading
        </h1>
        <p className="text-muted">A library, with what I took from each book.</p>
      </header>

      {books.length === 0 ? (
        <Empty>The library is empty for now.</Empty>
      ) : (
        grouped.map(([status, items]) => (
          <section key={status} className="space-y-5">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted">
              {STATUS_LABEL[status]}
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
    </div>
  );
}

function BookRow({ book }: { book: Book }) {
  const meta = [book.shelf.join(", "), book.approach, book.rating]
    .filter(Boolean)
    .join(" · ");

  const title = (
    <span className="font-serif text-lg text-ink">
      {book.title}
      {book.author && (
        <span className="text-muted"> &mdash; {book.author}</span>
      )}
    </span>
  );

  return (
    <div>
      {book.link ? (
        <a
          href={book.link}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline decoration-1 underline-offset-4 hover:underline"
        >
          {title}
        </a>
      ) : (
        title
      )}
      {meta && <p className="mt-0.5 text-sm text-muted">{meta}</p>}
      {book.takeaway && <p className="mt-1 text-muted">{book.takeaway}</p>}
    </div>
  );
}
