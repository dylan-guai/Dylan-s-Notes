import type { ReactNode } from "react";

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {description && <p className="max-w-[52ch] text-muted">{description}</p>}
      </header>
      {children}
    </div>
  );
}
