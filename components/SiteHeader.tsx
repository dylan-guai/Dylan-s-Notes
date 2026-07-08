import Link from "next/link";

const nav = [
  { href: "/notes", label: "Notes" },
  { href: "/reading", label: "Reading" },
  { href: "/life", label: "Life" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-hairline py-5">
      <Link
        href="/"
        className="font-medium tracking-tight text-ink no-underline"
      >
        Dylan&rsquo;s Notes
      </Link>
      <nav className="flex gap-4 text-sm text-muted">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="no-underline transition-colors hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
