const year = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline py-6 text-sm text-muted">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>&copy; {year} Dylan Guai</span>
        <span className="flex gap-4">
          {/* TODO: replace with real links (see CLAUDE.md / About page). */}
          <a
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline transition-colors hover:text-ink"
          >
            LinkedIn
          </a>
          <a
            href="mailto:you@example.com"
            className="no-underline transition-colors hover:text-ink"
          >
            Email
          </a>
        </span>
      </div>
    </footer>
  );
}
