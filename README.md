# Dylan's Notes

A minimalist, typography-forward research-and-portfolio site for **Dylan Guai**.
It publishes independent research on physical & embodied AI, internship notes,
fieldnotes, and a reading library. **Notion is the only source of truth — the
site only reads it**, and re-fetches on a 60-second interval (ISR), so edits in
Notion appear within about a minute with no redeploy.

- **Stack:** Next.js (App Router) + TypeScript · Tailwind CSS v4 + `@tailwindcss/typography` · `@notionhq/client` · `notion-to-md` + `react-markdown`.
- **Hosting:** Vercel.
- Full build spec: [`IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md). Durable context for future sessions: [`CLAUDE.md`](./CLAUDE.md).

---

## Add content (no code required)

Everything is edited in Notion. All written content lives in one **"Dylan's
Notes"** database, split by a **Type** select; Reading is your existing
**Library** (IDs in `CLAUDE.md`).

**Publish a note** (research / internship / fieldnote)
1. Add a page to the **"Dylan's Notes"** database.
2. Set **Type** — `Research Notes`, `Internships`, or `Fieldnotes` — which
   decides the section it appears in.
3. Fill **Title**, **Slug** (the stable URL — set it manually, e.g.
   `demo-to-deployable-gap`), **Excerpt**, **Published** (and **Series** /
   **Order** for research), and write the body. Images in the body render inline.
4. Set **Status → Published**.
5. It appears in its section (`/notes`, `/internships`, or `/fieldnotes`) at
   `/<section>/<slug>` within ~60 seconds. To publish instantly, hit the
   revalidate endpoint (below).

**Add a book to the public shelf** — in your **Library** database, fill
**Takeaway** and tick **Publish**. Only books with **Publish** checked appear on
`/reading` (grouped by **Domain**) — the shelf is private by default, so an
unticked book never shows.

**Force an instant refresh**
```bash
curl -X POST "https://<your-domain>/api/revalidate?secret=<REVALIDATE_SECRET>"
```

> Only rows with **Status = Published** ever appear. Slugs are manual so links
> never break. Notion image URLs expire after ~1h but ISR re-fetches them.

---

## Local development

```bash
npm install
cp .env.example .env.local      # then fill in the values below
npm run dev                     # http://localhost:3000
```

### Environment variables (`.env.local`, and the same in Vercel)

```
NOTION_TOKEN=secret_xxx            # Notion internal integration token
NOTION_DB_CONTENT=2a666526496748c5b37353ca3b8b4420 # "Dylan's Notes" (all entries)
NOTION_DB_LIBRARY=a6845e59614643bca767366cfb510a62 # your existing "Library"
REVALIDATE_SECRET=<openssl rand -hex 32>
```

### First-time Notion setup (one-time, must be done by Dylan)

1. **Create an internal integration:** Notion → Settings → Connections →
   *Develop or manage integrations* → **New integration** → Internal. Copy the
   `secret_…` token into `NOTION_TOKEN`.
2. **Share the databases with it:** open the **"Dylan's Notes"** database and the
   **"Library"** database → `•••` → *Connections* → add your integration.
   (Sharing the parent **"26"** page works too — children inherit access.)
3. **Verify reads:**
   ```bash
   npm run check:notion         # prints a few rows from each database
   ```

---

## Deploy

1. Push this repo to GitHub.
2. Import it into **Vercel** (free tier is fine) and connect the GitHub repo.
3. Add the five environment variables above in **Project → Settings →
   Environment Variables**.
4. Deploy. Attach a custom domain in **Settings → Domains**.

Content changes never require a redeploy — they flow through Notion + ISR.

---

## Project structure

```
app/            routes (home; notes, internships, fieldnotes — each a list +
                a shared-template [slug] page; reading; about; api/revalidate)
components/     SiteHeader, SiteFooter, EntryList, Section, entry (shared
                template), Markdown, Empty
lib/notion/     data layer — config (IDs + property maps + NOTE_TYPES), client,
                queries, entries, library, renderEntry
lib/routes.ts   Type → /section/slug · lib/group.ts  groupBySeries / groupByDomain
lib/format.ts   deterministic date formatting
scripts/        check-notion.mjs, setup-notion.mjs
```

To point a section at a different Notion database, or after renaming a property
in Notion, edit `lib/notion/config.ts` — nothing else needs to change.

---

## Not in v1 (easy future adds)

Dark mode · search · tags/filtering UI · RSS · comments · analytics · building
Life images to `/public` for permanence.
