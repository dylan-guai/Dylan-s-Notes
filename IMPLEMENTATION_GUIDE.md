# Dylan's Notes — website implementation guide

*A build spec written for Claude Code. Read the whole document before starting. Drop it into the repo root as `IMPLEMENTATION_GUIDE.md`, and copy the marked persistent sections into `CLAUDE.md` so every future session inherits the context.*

---

## How to use this guide

- Execute it **in order**. The phases are sequenced deliberately: Notion content model first, then the in-code config that records it, then the app.
- Each phase ends with **acceptance criteria**. Don't move on until they're met.
- Anything marked **[persist → CLAUDE.md]** should be written into `CLAUDE.md` so it survives across sessions. This is how the project "keeps the database in memory": the schema and database IDs live in version-controlled config and in `CLAUDE.md`, not just in one session's context.

---

## Part 1 — Context (the mission)

**What this is.** "Dylan's Notes" is a personal research-and-portfolio website for Dylan Guai, a final-year NUS Computing student (AI + FinTech) targeting venture and private-markets roles in emerging technology. The site publishes his independent sector research, a reading library, and a personal/extracurriculars page. It is the public face of a larger system in which published research is the proof of his positioning: *an investor who can technically underwrite what he backs.*

**The content that will live here.**
- **Research notes** — a series on physical & embodied AI, analysed through one recurring lens, the "demo-to-deployable gap." The first pieces already exist (a framing note; a technical-diligence framework; more to come). These are long-form, reading-first essays.
- **Reading library** — books he's reading, with short takeaways. He already maintains a library database in Notion; the site should be able to use it.
- **Life / extracurriculars** — travels, hobbies, volunteering, and what matters to him.
- **About** — a short bio and links.

**Aesthetic north star.** Minimalist, typography-forward, calm. Two references: **Gates Notes** (clean editorial reading experience) and **Notion** (uncluttered, generous whitespace, content-first). Keep it *very minimal for v1* — no heavy chrome, no hero art, no animation. The reading experience is the product.

---

## Part 2 — Architecture at a glance

```
        writes                         reads
Dylan ──────────▶  ┌──────────────┐  ◀────────  ┌─────────────┐
Claude (MCP) ────▶  │   NOTION     │            │  Next.js on  │ ──▶ visitors
(directly in UI) ▶  │ (source of   │            │   Vercel     │
                    │  truth: DBs) │            │ (reads API,  │
                    └──────────────┘            │  caches+ISR) │
                                                 └─────────────┘
```

**The single principle:** Notion is the only source of truth. The website *only reads* from Notion. Therefore **how content gets into Notion is irrelevant to the site** — whether Dylan types it in the Notion UI, or asks Claude to add it via the Notion connector, the result is the same rows in the same databases, and the site renders them on its next refresh.

**How updates "reflect on the website":** the site is statically generated with Incremental Static Regeneration (ISR). Pages re-fetch from Notion on a short interval (default: every 60 seconds), so an edit in Notion appears within about a minute. An optional on-demand revalidation endpoint lets Dylan (or Claude) force an instant refresh. No manual redeploys required for content changes.

---

## Part 3 — Tech stack & prerequisites

**Stack (use current stable versions):**
- **Next.js (App Router) + TypeScript** — React framework, ISR, Vercel-native.
- **Tailwind CSS + `@tailwindcss/typography`** — the `prose` class is the backbone of the reading experience.
- **`@notionhq/client`** — official Notion SDK (source of truth; reliable, supported).
- **`notion-to-md`** — converts a Notion page body to Markdown; render with **`react-markdown`** (+ `remark-gfm`). *Alternative for pixel-Notion fidelity with less design control: `react-notion-x`. Default to the markdown/prose approach — it gives the bespoke Gates-Notes reading feel.*
- **Vercel** — hosting/deploy (free tier is sufficient; env vars, HTTPS and custom domains built in).

**Accounts / secrets Dylan must provide:**
- A **Notion internal integration token** (Notion → Settings → Connections → develop/integrations → new internal integration).
- The **parent Notion page** under which databases live, shared with the integration.
- A **GitHub** repo and a **Vercel** account (connect GitHub).
- Optionally, a custom domain.

**Environment variables (`.env.local`, and set in Vercel):**

```
NOTION_TOKEN=secret_xxx
NOTION_DB_NOTES=xxxxxxxx
NOTION_DB_READING=xxxxxxxx
NOTION_DB_LIFE=xxxxxxxx
REVALIDATE_SECRET=some-long-random-string
```

---

## Part 4 — The Notion content model (set this up FIRST)  **[persist → CLAUDE.md]**

Before writing any app code, create three databases under the shared parent page. Claude Code can create them via the Notion API (`notion.databases.create`, given the parent page ID and the schemas below), or Dylan can create them in the Notion UI from these schemas. **After creation, record each database ID in `.env` and in `lib/notion/config.ts`, and mirror the schema into `CLAUDE.md`.**

For the **Reading** database, prefer connecting Dylan's *existing* library database: retrieve its schema via the API (`notion.databases.retrieve`), then map its real property names in `lib/notion/config.ts` rather than forcing a rename.

### 4.1 Research notes — `NOTION_DB_NOTES`
| Property | Type | Purpose |
|---|---|---|
| Title | Title | Note title |
| Slug | Rich text | Stable URL slug (set manually; do not derive from title) |
| Status | Select | `Draft` / `Published` — only `Published` renders |
| Published | Date | Sort key, shown as date |
| Series | Select | e.g. `Embodied AI` |
| Order | Number | Ordering within a series |
| Excerpt | Rich text | One-line summary for lists |
| Tags | Multi-select | Optional |
The **page body** is the note content.

### 4.2 Reading library — `NOTION_DB_READING` (map to existing DB where possible)
| Property | Type | Purpose |
|---|---|---|
| Title | Title | Book title |
| Author | Rich text | Author |
| Status | Select | `Reading` / `Read` / `To read` |
| Rating | Select or Number | Optional |
| Finished | Date | Optional |
| Shelf | Select | Category (e.g. `Valuation`, `Behavioural`) |
| Takeaway | Rich text | One-line "what I took from it" |
| Link | URL | Optional |

### 4.3 Life / extracurriculars — `NOTION_DB_LIFE`
| Property | Type | Purpose |
|---|---|---|
| Title | Title | Entry title |
| Type | Select | `Travel` / `Hobby` / `Volunteering` / `Other` |
| Date | Date | When |
| Place | Rich text | Location |
| Summary | Rich text | Short description |
| Status | Select | `Draft` / `Published` |
Images live in the page body (or a Files property).

**Acceptance criteria:** three databases exist and are shared with the integration; the integration token can query each; IDs are in `.env` and `lib/notion/config.ts`; schemas are mirrored in `CLAUDE.md`.

---

## Part 5 — Build sequence

### Phase 0 — Prerequisites
Confirm Node LTS, the four accounts/secrets from Part 3, and that the integration can read the three databases. **Done when** a throwaway script prints rows from each database.

### Phase 1 — Notion content model
Complete Part 4. **Done when** its acceptance criteria pass.

### Phase 2 — Scaffold
Create the Next.js (App Router, TS) project; add Tailwind + `@tailwindcss/typography`; install `@notionhq/client`, `notion-to-md`, `react-markdown`, `remark-gfm`. Commit. **Done when** the dev server runs a blank styled page.

### Phase 3 — Notion data layer
In `lib/notion/`:
- `config.ts` — database IDs + a property-name map (so code references logical names, not Notion's literal labels; this is what makes the existing-Reading-DB mapping clean).
- `client.ts` — the Notion client.
- Query functions: `getPublishedNotes()`, `getNoteBySlug(slug)`, `getBooks()`, `getLifeEntries()` — each filters `Status = Published` where relevant, sorts sensibly, and maps Notion properties to clean typed objects.
- `renderNote(pageId)` — fetch blocks, `notion-to-md` → Markdown string.
Set a module-level cache / use `revalidate` so queries aren't hammered (respect Notion's ~3 req/s limit). **Done when** the functions return typed data in a test route.

### Phase 4 — Pages & routing
- `/` — home: wordmark, one-line intro, a clean list of recent notes (title · date · excerpt), and text nav to the sections.
- `/notes` — all notes, grouped by series, sorted by Order/Published.
- `/notes/[slug]` — the reading page: title, date + series meta, prose body. `generateStaticParams` from published slugs; `export const revalidate = 60`.
- `/reading` — books grouped by Status; title — author, rating, one-line takeaway.
- `/life` — entries sorted by date, with images.
- `/about` — short bio + links (can be static MDX or a Notion page).
**Done when** every page renders live Notion content.

### Phase 5 — Design pass
Apply Part 6. This is where the Gates-Notes/Notion feel is dialled in. **Done when** the site matches the design system on desktop and mobile.

### Phase 6 — Content workflow wiring
- Set ISR (`revalidate = 60`) on content pages.
- Add `app/api/revalidate/route.ts` — an on-demand revalidation endpoint guarded by `REVALIDATE_SECRET`, so a single request forces an instant refresh (usable by Dylan or by Claude after adding content).
**Done when** editing a Notion row appears on the site within the interval, and hitting the revalidate endpoint makes it appear immediately.

### Phase 7 — Deploy
Push to GitHub; import to Vercel; set env vars; deploy; attach domain. **Done when** the production URL serves live content over HTTPS.

### Phase 8 — Handover
Write the "adding content" workflow (Part 7) into the repo `README.md` and `CLAUDE.md`. **Done when** a non-developer could add a published note by following the README.

---

## Part 6 — Design system (minimalist v1)

**Layout.** Single centred column. Reading content max-width ~**680px**; list pages may go to ~**760px**. Generous vertical rhythm; lots of whitespace. No sidebars, no boxes, no shadows.

**Type.** Editorial + clean, via `next/font`:
- Body & headings (reading pages): a refined **serif** — e.g. *Newsreader* or *Source Serif 4* — for the Gates-Notes editorial feel.
- Nav, meta, labels: a clean **sans** — *Inter* or system UI.
- *Simpler alternative for a more Notion-pure look: use Inter everywhere.* Pick one and be consistent.
- Base body **18–19px**, line-height **~1.7**; headings tighter (~1.2) and only slightly larger — restraint over drama.

**Colour.** Near-black text `#1A1A1A`; muted meta `#6B7280`; background `#FFFFFF`; hairline borders `#ECECEC`. One restrained accent at most (or none). No gradients.

**Chrome.** Text-only top nav: `Dylan's Notes` (left) · `Notes · Reading · Life · About` (right). Minimal footer (a line + links). No hero images in v1.

**Per page.**
- *Home* — wordmark, a one-sentence description, then a simple list of recent writing (like Gates Notes' piece list). Nothing else.
- *Note* — a small "← Notes" link, the title, a muted `date · series` line, then the prose body. Tune the `prose` classes: comfortable measure, real paragraph spacing, understated links, block quotes and headings that breathe.
- *Reading* — grouped by status; each row is `Title — Author`, a small rating, and the one-line takeaway. Quiet and scannable.
- *Life* — stacked entries: title, `date · place`, a short paragraph, an image if present.
- *About* — a few sentences and links (LinkedIn, email).

**Skip for v1** (note as easy future adds): dark mode, search, tags/filtering UI, RSS, comments, analytics.

---

## Part 7 — Content workflow (how Dylan adds things afterwards)  **[persist → CLAUDE.md]**

**To publish a research note:**
1. Add a page to the **Research notes** database — either in the Notion UI, or by asking Claude to create it via the Notion connector.
2. Fill `Title`, `Slug`, `Series`, `Excerpt`, `Published`; write the body.
3. Set `Status = Published`.
4. It appears on the site within ~60s — or immediately by calling the revalidate endpoint.

**To add a book or a life entry:** add a row to the relevant database with `Status = Published`. Same propagation.

**The point to remember:** the website reads Notion and nothing else. Whether a row was created by Dylan or by Claude, directly or through the connector, makes no difference — it renders the same way. Notion stays the one place content is edited.

---

## Part 8 — Gotchas & guardrails

- **Notion image URLs expire (~1 hour).** Never persist them. Re-fetch on each render/revalidation (ISR handles this), or, for the Life gallery, download images to `/public` or an image host at build time. Flag this to Dylan for image-heavy pages.
- **Rate limits (~3 req/s).** Cache; don't fetch per-request in loops; lean on ISR.
- **`notion-to-md` doesn't cover every block type.** Test with the real notes; add custom handling for callouts/embeds if needed.
- **Stable URLs.** Always use the manual `Slug` property; never derive slugs from titles (titles change, links shouldn't break).
- **Draft safety.** Every query filters `Status = Published`. Drafts must never render or appear in `generateStaticParams`.
- **Secrets.** `NOTION_TOKEN` and `REVALIDATE_SECRET` live only in env; never commit them. Guard the revalidate route with the secret.
- **Independence.** This site publishes only independent research. Nothing derived from confidential employer work goes in. (And Dylan should clear any fund's publication policy before making the site public.)

---

## Part 9 — What to put in `CLAUDE.md`  **[persist]**

Seed `CLAUDE.md` with, at minimum:
- **Mission** (Part 1, condensed) — so any session understands what the site is for.
- **Architecture principle** (Part 2) — Notion is the sole source of truth; the site only reads it.
- **The three database IDs and their schemas** (Part 4) — the "in-memory" record of the content model.
- **The content workflow** (Part 7).
- **Conventions** — manual slugs, `Status = Published` filtering, ISR interval, image-expiry handling, secrets in env only.

---

## Definition of done (v1)

A live, minimalist site on a custom domain where: home lists recent notes; each note reads beautifully; reading and life pages render from Notion; adding or editing a `Published` row in Notion (by Dylan or via Claude) appears within ~60 seconds; and the whole content model is recorded in `lib/notion/config.ts` and `CLAUDE.md`.

---

## Implementation notes (what was actually built)

Deviations and decisions made during the build, for the record:

- **Reading maps to Dylan's existing "Library"** (`a6845e59…`) by its real schema
  (`Author`, `Domain` multi-select as "shelf", `Approach` select, `Read`/`To Get`
  checkboxes). Status is **derived** from the checkboxes since there's no Status
  select. Optional `Takeaway`/`Rating`/`Link`/`Finished` map automatically if
  added later. See `lib/notion/config.ts`.
- **Fonts:** Newsreader (serif, reading) + Inter (sans, chrome), via `next/font`.
- **Notion SDK pinned to API version `2022-06-28`** so `databases.query` resolves
  each single-data-source database directly.
- **Resilience:** the data layer paginates, is wrapped in React `cache()`, and
  never throws — it returns empty results when Notion is unconfigured or
  unreachable, so the site builds and renders empty states before secrets exist.
- **Databases created + seeded** (Research Notes, Life) with starter content; see
  `CLAUDE.md` for IDs. The one step a Claude session can't do is mint the
  internal integration token and share the pages — that's Dylan's, and it's in
  the README + CLAUDE.md handover.
