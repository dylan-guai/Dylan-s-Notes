import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * On-demand revalidation, guarded by REVALIDATE_SECRET.
 *
 *   POST /api/revalidate?secret=YOUR_SECRET
 *     -> revalidates all content routes (home, notes, reading, life)
 *   POST /api/revalidate?secret=YOUR_SECRET&path=/notes/some-slug
 *     -> revalidates just that path
 *
 * The secret may also be passed as the `x-revalidate-secret` header.
 * Use it (from Dylan or Claude) after adding content to force an instant
 * refresh instead of waiting out the 60s ISR interval.
 */
export async function POST(req: NextRequest) {
  const secret =
    req.nextUrl.searchParams.get("secret") ??
    req.headers.get("x-revalidate-secret");

  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid or missing secret." },
      { status: 401 },
    );
  }

  const path = req.nextUrl.searchParams.get("path");
  if (path) {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, path, now: Date.now() });
  }

  for (const p of ["/", "/research", "/internships", "/fieldnotes", "/reading"]) {
    revalidatePath(p);
  }
  // Revalidate every note reading page.
  revalidatePath("/notes/[slug]", "page");

  return NextResponse.json({ revalidated: true, scope: "all", now: Date.now() });
}

export async function GET() {
  return NextResponse.json(
    { message: "POST with ?secret=... to revalidate." },
    { status: 405 },
  );
}
