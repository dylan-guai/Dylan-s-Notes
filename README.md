# Dylan's Notes

A minimalist, typography-forward research-and-portfolio site for **Dylan Guai**.
It publishes independent research on physical & embodied AI, a reading library,
and a life page. **Notion is the only source of truth — the site only reads it**,
and re-fetches on a 60-second interval (ISR), so edits in Notion appear within
about a minute with no redeploy.

- **Stack:** Next.js (App Router) + TypeScript · Tailwind CSS v4 + `@tailwindcss/typography` · `@notionhq/client` · `notion-to-md` + `react-markdown`.
- **Hosting:** Vercel.
- Full build spec: [`IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md). Durable context for future sessions: [`CLAUDE.md`](./CLAUDE.md).

---

## Add content (no code required)

Everything is edited in Notion. The databases live under the **"Dylan's Notes"**
page (IDs in `CLAUDE.md`).

**Publish a research note**
1. Add a page to the **Research Notes** database.
2. Fill **Title**, **Slug** (the stable URL — set it manually, e.g.
   `demo-to-deployable-gap`), **Series**, **Excerpt**, **Published**, and write
   the body.
3. Set **Status → Published**.
4. It appears at `/notes/<slug>` within ~60 seconds. To publish instantly, hit
   the revalidate endpoint (below).

**Add a book** — add or annotate a row in your **Library** database; tick
**Read** (shows under "Read") or **To Get** (shows under "To read"). Unticked
books show under "Currently reading".

**Add a life entry** — add a row to the **Life** database with **Status →
Published**; choose a **Type**, set **Date**/**Place**/**Summary**, and put any
images in the page body.

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
NOTION_DB_NOTES=2a666526496748c5b37353ca3b8b4420
NOTION_DB_READING=a6845e59614643bca767366cfb510a62
NOTION_DB_LIFE=1807bb8d74ef451496e3a1cf34b177dc
REVALIDATE_SECRET=<openssl rand -hex 32>
```

### First-time Notion setup (one-time, must be done by Dylan)

1. **Create an internal integration:** Notion → Settings → Connections →
   *Develop or manage integrations* → **New integration** → Internal. Copy the
   `secret_…` token into `NOTION_TOKEN`.
2. **Share the databases with it:** open the **"Dylan's Notes"** page and the
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
app/            routes (home, notes, notes/[slug], reading, life, about, api/revalidate)
components/     SiteHeader, SiteFooter, Markdown, Empty
lib/notion/     data layer — config (IDs + property maps), client, queries, renderNote
lib/format.ts   deterministic date formatting
scripts/        check-notion.mjs, setup-notion.mjs
```

To point a section at a different Notion database, or after renaming a property
in Notion, edit `lib/notion/config.ts` — nothing else needs to change.

---

## Not in v1 (easy future adds)

Dark mode · search · tags/filtering UI · RSS · comments · analytics · building
Life images to `/public` for permanence.
