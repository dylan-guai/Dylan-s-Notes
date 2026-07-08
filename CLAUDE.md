# CLAUDE.md — Dylan's Notes

Persistent context for any Claude Code session in this repo. Read this first.
The full build spec lives in `IMPLEMENTATION_GUIDE.md`; this file is the
"in-memory" record that must survive across sessions.

---

## Mission

**Dylan's Notes** is the personal research-and-portfolio site for **Dylan Guai**
— a final-year NUS Computing student (AI + FinTech) targeting venture and
private-markets roles in emerging technology. Published research is the proof of
his positioning: *an investor who can technically underwrite what he backs.*

All written content lives in **one Notion database** ("Dylan's Notes"), split by
a **`Type`** select into three sections, plus a separate reading library:

- **Research Notes** — independent industry-landscaping research on physical &
  embodied AI, read through one recurring lens: the **demo-to-deployable gap**.
  The flagship. Long-form, reading-first.
- **Internships** — notes from the internship work Dylan is going through now.
- **Fieldnotes** — extracurriculars: travel, hobbies, volunteering. (This
  replaced the old separate "Life" database.)
- **Reading** — books, mapped from Dylan's existing Notion "Library".
- **About** — short bio + links.

Aesthetic: minimalist, typography-forward, calm — Gates Notes editorial reading
+ Notion whitespace. **Keep v1 very minimal.** The reading experience is the
product.

## Architecture principle (do not violate)

**Notion is the only source of truth. The website only *reads* from Notion.**

How content gets into Notion is irrelevant to the site — typed in the Notion UI
or added by Claude via the Notion connector, it's the same rows in the same
databases. Pages are statically generated with **ISR (revalidate = 60s)**, so an
edit in Notion appears within ~1 minute; the guarded `/api/revalidate` endpoint
forces an instant refresh. No redeploys for content changes.

**The site never writes to Notion.** Do not add write paths.

---

## Content model — database IDs & schemas

Workspace: **Dylan's Notion**. The content database and its parent share the
name **"Dylan's Notes"**; the parent page (`347701a0-de12-8066-82db-c19d058f0ef1`)
sits under the **"26"** hub. The Library sits under "26" directly. IDs are
recorded in `.env.example` and `lib/notion/config.ts`.

| Section(s) | Env var | Database ID | Data source (collection) |
|---|---|---|---|
| All written content (Research Notes / Internships / Fieldnotes) | `NOTION_DB_NOTES` | `2a666526496748c5b37353ca3b8b4420` | `312e64ad-9a45-4f5b-b36d-2be25a7d4583` |
| Reading (Library) | `NOTION_DB_READING` | `a6845e59614643bca767366cfb510a62` | `ecc8ae6c-f757-46d2-a79d-8fb8de224e3f` |

### "Dylan's Notes" content DB — `NOTION_DB_NOTES`
One row = one piece of writing. The **`Type`** select decides which site section
it appears in.
| Property | Type | Purpose |
|---|---|---|
| Title | Title | Note title |
| Slug | Rich text | **Stable URL slug — set manually; never derived from title** |
| **Type** | Select (`Research Notes` / `Internships` / `Fieldnote`) | **Which section it renders in** |
| Status | Select (`Draft` / `Published`) | Only `Published` renders |
| Published | Date | Sort key + shown date |
| Series | Select (`Embodied AI`, …) | Groups Research Notes into a series |
| Order | Number | Order within a series (ascending) |
| Excerpt | Rich text | One-line summary for lists |
| Tags | Multi-select | Optional |

> **Note the exact `Type` values:** `Research Notes`, `Internships`, `Fieldnote`
> (Fieldnote is singular in Notion; the site labels the section "Fieldnotes").
> These literals live in `lib/notion/config.ts` → `NOTE_TYPES`.

The **page body** is the note content (rendered as prose; images in the body
render inline). `Series`/`Order` are really only meaningful for Research Notes.

### Reading — `NOTION_DB_READING` (Dylan's existing "Library")
Mapped to its **real** schema (not the generic guide schema). See
`lib/notion/config.ts` → `readingProps`.
| Property | Type | Used as |
|---|---|---|
| Title | Title | Book title |
| Author | Rich text | Author |
| Domain | Multi-select | "Shelf"/category |
| Approach | Select (`Summary` / `Summary + Dip In` / `Read Fully` / `Read & Apply`) | Shown as meta |
| Read | Checkbox | → status `Read` |
| To Get | Checkbox | → status `To read` |
| Journal | Relation | (not used by the site) |

**Status is derived**, since there is no Status select: `Read` → **Read**;
else `To Get` → **To read**; else **Reading**. Optional properties the mapper
picks up automatically *if you add them*: `Takeaway` (rich text), `Rating`
(number or select), `Link` (url), `Finished` (date).

**Seed content already exists** (safe to edit/delete): two Published Research
Notes (`demo-to-deployable-gap`, `technical-diligence-embodied-ai`, both
`Type = Research Notes`, `Series = Embodied AI`, each marked "*Starter example —
replace…*"). Internships and Fieldnotes are empty until Dylan adds rows.

---

## Content workflow (how Dylan adds things)

**Publish anything (research note / internship note / fieldnote):**
1. Add a page to the **"Dylan's Notes"** database (Notion UI or via Claude/the
   Notion connector).
2. Set **`Type`** (`Research Notes` / `Internships` / `Fieldnote`), fill
   `Title`, `Slug`, `Excerpt`, `Published` (and `Series`/`Order` for research);
   write the body.
3. Set `Status = Published`.
4. It appears in the matching section within ~60s — or instantly via the
   revalidate endpoint (below).

**Add a book:** add/annotate a row in **Library**; set `Read` / `To Get`.

**Force an instant refresh:**
```
curl -X POST "https://<your-domain>/api/revalidate?secret=$REVALIDATE_SECRET"
# or a single path:
curl -X POST "https://<your-domain>/api/revalidate?secret=$REVALIDATE_SECRET&path=/notes/<slug>"
```

The site reads Notion and nothing else — who created a row (Dylan or Claude,
directly or via the connector) makes no difference.

---

## Conventions & guardrails

- **Manual slugs.** Always use the `Slug` property. Never derive slugs from
  titles (titles change; links shouldn't break). Slugs are unique across the
  whole DB; every note reads at `/notes/<slug>` regardless of Type.
- **Draft safety.** Every notes query filters `Status = Published`. Drafts must
  never render or appear in `generateStaticParams`.
- **ISR = 60s.** Content pages `export const revalidate = 60`. Keep it a literal.
- **Notion image URLs expire (~1h).** Never persist them; ISR re-fetches on each
  revalidation. For image-heavy pages, download to `/public` or an image host at
  build time (future add).
- **Rate limit ~3 req/s.** Queries paginate and are wrapped in React `cache()`;
  lean on ISR. Don't fetch per-request in loops.
- **Secrets in env only.** `NOTION_TOKEN` and `REVALIDATE_SECRET` live in env
  (`.env.local` / Vercel), never committed. The revalidate route is secret-guarded.
- **Notion API version is pinned to `2022-06-28`** in `lib/notion/client.ts` so
  `databases.query({ database_id })` resolves each single-data-source database
  directly. If a query ever fails with a data-source error after a Notion API
  change, switch to the data-source query API (`dataSources.query`) using the
  collection IDs in the table above.
- **Independence.** Publish only independent research. Nothing from confidential
  employer work. Clear any fund's publication policy before going public.
- **`notion-to-md` doesn't cover every block type.** Test with real notes; add
  custom transformers for callouts/embeds if needed.

---

## Project map

```
app/
  layout.tsx              fonts (Newsreader + Inter), header, footer
  page.tsx                home — recent writing (all types) + section links
  research/page.tsx       Type = Research Notes, grouped by series
  internships/page.tsx    Type = Internships
  fieldnotes/page.tsx     Type = Fieldnote
  notes/[slug]/page.tsx   reading page for any note (generateStaticParams + ISR)
  reading/page.tsx        library grouped by derived status
  about/page.tsx          static bio + links
  api/revalidate/route.ts on-demand ISR, guarded by REVALIDATE_SECRET
lib/
  notion/config.ts   DB IDs + logical→Notion property maps + NOTE_TYPES  ← remap here
  notion/client.ts   Notion client, pinned to 2022-06-28
  notion/query.ts    paginating, never-throwing query helper
  notion/props.ts    defensive property readers
  notion/notes.ts    getPublishedNotes / getNotesByType / getNoteBySlug / renderNote
  notion/reading.ts  getBooks
  group.ts           groupBySeries
  format.ts          deterministic date formatting
components/   SiteHeader, SiteFooter, NoteList, Section, Markdown, Empty
scripts/      check-notion.mjs (verify reads), setup-notion.mjs (recreate content DB)
```

## Dev commands

```
npm run dev            # local dev
npm run build          # prod build + typecheck (the real gate)
npm run check:notion   # node --env-file=.env.local scripts/check-notion.mjs
```

---

## Status / remaining human-only steps

Built and building clean (Next 15 App Router, Tailwind v4 + typography, Notion
SDK v2 pinned to `2022-06-28`). Content model is one Type-split database plus the
Library. The app degrades gracefully to empty states when `NOTION_TOKEN` is
absent, so it builds and deploys before secrets are wired.

**Dylan must still (cannot be done from a Claude session):**
1. Create a Notion **internal integration** (Settings → Connections → develop /
   manage integrations → New → Internal) and copy its `secret_…` token.
2. **Share** the **"Dylan's Notes"** database *and* the **"Library"** database
   with that integration (sharing the parent "26" page also works — children
   inherit).
3. Put `NOTION_TOKEN`, the two DB IDs, and a `REVALIDATE_SECRET`
   (`openssl rand -hex 32`) in `.env.local`, then run `npm run check:notion`.
4. Import the repo to **Vercel**, set the same env vars, deploy, attach a domain.
5. Replace placeholder **LinkedIn/Email** links in `components/SiteFooter.tsx`
   and `app/about/page.tsx`.
