# CLAUDE.md — Dylan's Notes

Persistent context for any Claude Code session in this repo. Read this first.
The full build spec lives in `IMPLEMENTATION_GUIDE.md` (v1.1); this file is the
"in-memory" record that must survive across sessions.

---

## Mission

**Dylan's Notes** is the personal research-and-portfolio site for **Dylan Guai**
— a final-year NUS Computing student (AI + FinTech) targeting venture and
private-markets roles in emerging technology. Published research is the proof of
his positioning: *an investor who can technically underwrite what he backs.*

Content comes from **two Notion databases** (both under the "26" hub):

1. **"Dylan's Notes"** — all long-form entries, split by a **`Type`** select:
   - **Research Notes** — independent industry-landscaping research on physical &
     embodied AI, read through one lens: the **demo-to-deployable gap**. Flagship.
   - **Internships** — write-ups tied to current internship work.
   - **Fieldnotes** — extracurriculars: travel, hobbies, volunteering. (Replaced
     the old separate "Life" database, which was deleted.)
2. **"Library"** — Dylan's existing reading list. Books render on the site only
   when their **`Publish`** checkbox is ticked (private by default).

Plus a static **About** page.

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
| All written content (Research Notes / Internships / Fieldnotes) | `NOTION_DB_CONTENT` | `2a666526496748c5b37353ca3b8b4420` | `312e64ad-9a45-4f5b-b36d-2be25a7d4583` |
| Reading (Library) | `NOTION_DB_LIBRARY` | `a6845e59614643bca767366cfb510a62` | `ecc8ae6c-f757-46d2-a79d-8fb8de224e3f` |

> These are **database IDs** (what `@notionhq/client` uses for `databases.query`
> under API `2022-06-28`). The data-source IDs are only needed if you switch to
> Notion's newer 2025-09 data-sources API.

### "Dylan's Notes" content DB — `NOTION_DB_CONTENT`
One row = one entry. The **`Type`** select decides which site section it renders in.
| Property | Type | Purpose |
|---|---|---|
| Title | Title | Entry title |
| **Type** | Select (`Research Notes` / `Internships` / `Fieldnotes`) | **Which section it renders in** |
| Slug | Rich text | **Stable URL slug — set manually; never derived from title** |
| Status | Select (`Draft` / `Published`) | Only `Published` renders |
| Published | Date | Sort key + shown date |
| Series | Select (`Embodied AI`, …) | Groups Research Notes into a series |
| Order | Number | Order within a series (ascending) |
| Excerpt | Rich text | One-line summary for lists |
| Tags | Multi-select | Optional (`Physical AI`, `Diligence`, …) |
| Cover | Files | Present in Notion; not rendered in v1 |

> **Exact `Type` values (all plural):** `Research Notes`, `Internships`,
> `Fieldnotes`. These literals live in `lib/notion/config.ts` → `NOTE_TYPES`.
> Fieldnotes use the shared schema above — the old Life `Place`/`Type` fields are
> gone. The **page body** is the entry content (prose; images render inline).

### Reading — `NOTION_DB_LIBRARY` (Dylan's existing "Library")
Mapped to its **real** schema. See `lib/notion/config.ts` → `libraryProps`.
| Property | Type | Used as |
|---|---|---|
| Title | Title | Book title |
| Author | Rich text | Author |
| Domain | Multi-select | The "shelf" — `/reading` groups by the first Domain |
| Approach | Select (`Summary` / `Summary + Dip In` / `Read Fully` / `Read & Apply`) | Shown as meta |
| **Publish** | Checkbox | **Public gate — only checked books render on `/reading`** |
| **Takeaway** | Rich text | One-line note shown on `/reading` |
| Read / To Get / Distilled | Checkbox | Personal workflow; **not used by the site** |
| Journal | Relation | Not used by the site |

The Library has **no** Status select, Rating, Finished date, or Link URL — don't
reference them. `/reading` filters **`Publish = true`** (private by default:
nothing appears until checked), groups by `Domain`, and shows `Takeaway`.

**Seed content already exists** (safe to edit/delete): two Published Research
Notes (`demo-to-deployable-gap`, `technical-diligence-embodied-ai`, both
`Type = Research Notes`, `Series = Embodied AI`, each marked "*Starter example —
replace…*"). Internships and Fieldnotes are empty until Dylan adds rows; `/reading`
is empty until he ticks `Publish` on books.

---

## Content workflow (how Dylan adds things)

**Publish an entry (research note / internship / fieldnote):**
1. Add a page to the **"Dylan's Notes"** database (Notion UI or via Claude/the
   Notion connector).
2. Set **`Type`** (`Research Notes` / `Internships` / `Fieldnotes`), fill
   `Title`, `Slug`, `Excerpt`, `Published` (and `Series`/`Order` for research);
   write the body.
3. Set `Status = Published`.
4. It appears in the matching section within ~60s — or instantly via the
   revalidate endpoint (below).

**Add a book to the public shelf:** in **Library**, fill `Takeaway` and tick
**`Publish`**. Leaving `Publish` unchecked keeps the book private.

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
  titles. Slugs are unique across the whole content DB; each entry reads at
  `/<section>/<slug>` (`/notes`, `/internships`, `/fieldnotes`).
- **Draft safety.** Every content query filters `Status = Published`. Drafts must
  never render or appear in `generateStaticParams`.
- **Library gate is `Publish`, not `Status`.** `/reading` must filter
  `Publish = true` — otherwise the whole personal shelf (spiritual/personal
  domains included) would go public. Private by default.
- **ISR = 60s.** Content pages `export const revalidate = 60`. Keep it a literal.
- **Notion image URLs expire (~1h).** Never persist them; ISR re-fetches on each
  revalidation. For image-heavy fieldnotes, download to `/public` or an image
  host at build time (future add).
- **Rate limit ~3 req/s.** Queries paginate and are wrapped in React `cache()`;
  lean on ISR. Don't fetch per-request in loops.
- **Secrets in env only.** `NOTION_TOKEN` and `REVALIDATE_SECRET` live in env
  (`.env.local` / Vercel), never committed. The revalidate route is secret-guarded.
- **Notion API version is pinned to `2022-06-28`** in `lib/notion/client.ts` so
  `databases.query({ database_id })` resolves each single-data-source database
  directly. If a query ever fails with a data-source error after a Notion API
  change, switch to the data-source query API (`dataSources.query`) using the
  collection IDs in the table above.
- **Independence.** Publish only independent research. **Internships especially:**
  nothing from confidential employer/fund work; clear any publication policy
  before publishing internship write-ups or going public.
- **`notion-to-md` doesn't cover every block type.** Test with real notes; add
  custom transformers for callouts/embeds if needed.

---

## Project map

```
app/
  layout.tsx                fonts (Newsreader + Inter), header, footer
  page.tsx                  home — recent entries (all types) + section links
  notes/page.tsx            Type = Research Notes, grouped by series
  notes/[slug]/page.tsx     research entry reading page
  internships/page.tsx      Type = Internships
  internships/[slug]/page.tsx
  fieldnotes/page.tsx       Type = Fieldnotes
  fieldnotes/[slug]/page.tsx
  reading/page.tsx          Library where Publish=true, grouped by Domain
  about/page.tsx            static bio + links
  api/revalidate/route.ts   on-demand ISR, guarded by REVALIDATE_SECRET
lib/
  notion/config.ts   DB IDs + logical→Notion property maps + NOTE_TYPES  ← remap here
  notion/client.ts   Notion client, pinned to 2022-06-28
  notion/query.ts    paginating, never-throwing query helper
  notion/props.ts    defensive property readers
  notion/entries.ts  getEntriesByType / getResearchNotes / getInternships /
                     getFieldnotes / getRecentEntries / getEntryBySlug / renderEntry
  notion/library.ts  getBooks (Publish-gated)
  routes.ts          sectionFor / entryHref (Type → /section/slug)
  group.ts           groupBySeries / groupByDomain
  format.ts          deterministic date formatting
components/  SiteHeader, SiteFooter, EntryList, Section, entry (shared template),
             Markdown, Empty
scripts/     check-notion.mjs (verify reads), setup-notion.mjs (recreate content DB)
```

The three per-type entry routes (`/notes/[slug]`, `/internships/[slug]`,
`/fieldnotes/[slug]`) are thin wrappers over one shared `EntryBody` template in
`components/entry.tsx`; each passes its expected `Type` and 404s on a mismatch so
URLs stay canonical.

## Dev commands

```
npm run dev            # local dev
npm run build          # prod build + typecheck (the real gate)
npm run check:notion   # node --env-file=.env.local scripts/check-notion.mjs
```

---

## Status / remaining human-only steps

Built and building clean (Next 15 App Router, Tailwind v4 + typography, Notion
SDK v2 pinned to `2022-06-28`). Two source databases; content split by `Type`;
Reading gated by `Publish`. The app degrades gracefully to empty states when
`NOTION_TOKEN` is absent, so it builds and deploys before secrets are wired.

**Dylan must still (cannot be done from a Claude session):**
1. Create a Notion **internal integration** (Settings → Connections → develop /
   manage integrations → New → Internal) and copy its `secret_…` token.
2. **Share** the **"Dylan's Notes"** database *and* the **"Library"** database
   with that integration (sharing the parent "26" page also works — children
   inherit).
3. Put `NOTION_TOKEN`, the two DB IDs (`NOTION_DB_CONTENT`, `NOTION_DB_LIBRARY`),
   and a `REVALIDATE_SECRET` (`openssl rand -hex 32`) in `.env.local`, then run
   `npm run check:notion`.
4. Tick **`Publish`** (and add a `Takeaway`) on the Library books he wants public.
5. Import the repo to **Vercel**, set the same env vars, deploy, attach a domain.
6. Replace placeholder **LinkedIn/Email** links in `components/SiteFooter.tsx`
   and `app/about/page.tsx`.
