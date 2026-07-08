import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16">
      <h1 className="font-serif text-2xl font-semibold tracking-tight">
        Not found
      </h1>
      <p className="mt-3 text-muted">
        That page doesn&rsquo;t exist.{" "}
        <Link href="/" className="text-ink hover:underline underline-offset-4">
          Go home &rarr;
        </Link>
      </p>
    </div>
  );
}
