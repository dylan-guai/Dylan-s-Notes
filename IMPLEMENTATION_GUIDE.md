# Dylan's Notes — website implementation guide (v1.1)
*A build spec written for Claude Code. Read the whole document before starting. Drop it into the repo root as `IMPLEMENTATION_GUIDE.md`, and copy the marked persistent sections into `CLAUDE.md` so every future session inherits the context.*
> **Changelog v1 → v1.1 (content model consolidation).**
> - The **Life** database was **deleted**. Its content is now `Type = Fieldnotes` rows inside the single content database.
> - The old separate **Research notes** and **Life** databases are consolidated into **one** database, **"Dylan's Notes"**, discriminated by a new **`Type`** select: `Research Notes` · `Internships` · `Fieldnotes`.
> - The **Reading library was NOT consolidated.** It remains the existing, separate **"Library"** database, and its real schema is different from what v1 assumed — corrected in Part 4.2.
> - Net: **two** source databases now, not three. Env vars, routing, and the data layer are updated accordingly.
---
## How to use this guide
- Execute it **in order**. Content model first, then the in-code config that records it, then the app.
- Each phase ends with **acceptance criteria**. Don't move on until they're met.
- Anything marked **[persist → CLAUDE.md]** should be written into `CLAUDE.md` so it survives across sessions. This is how the project "keeps the database in memory": the schema and database IDs live in version-controlled config and in `CLAUDE.md`, not just in one session's context.
---
## Part 1 — Context (the mission)
**What this is.** "Dylan's Notes" is a personal research-and-portfolio website for Dylan Guai, a final-year NUS Computing student (AI + FinTech) targeting venture and private-markets roles in emerging technology. The site publishes his independent sector research, a reading library, and personal/extracurricular fieldnotes. It is the public face of a larger system in which published research is the proof of his positioning: *an investor who can technically underwrite what he backs.*
**The content that will live here.**
- **Research Notes** — the industry-landscaping series (physical & embodied AI, analysed through the recurring "demo-to-deployable gap" lens). Long-form, reading-first essays.
- **Internships** — write-ups tied to current internship work: what he's doing, learning, and shipping. (Independence caveat in Part 8 applies — nothing confidential.)
- **Fieldnotes** — the extracurricular strand: travels, hobbies, volunteering, and what matters to him (this replaces the old "Life" page).
- **Reading library** — books he's reading, drawn from his existing Notion **Library** database.
- **About** — a short bio and links.
**Aesthetic north star.** Minimalist, typography-forward, calm. Two references: **Gates Notes** (clean editorial reading experience) and **Notion** (uncluttered, generous whitespace, content-first). Keep it *very minimal for v1* — no heavy chrome, no hero art, no animation. The reading experience is the product.
---
## Part 2 — Architecture at a glance
```
        writes                         reads
Dylan ──────────▶  ┌──────────────┐  ◀────────  ┌─────────────┐
Claude (MCP) ────▶  │   NOTION     │            │  Next.js on  │ ──▶ visitors
(directly in UI) ▶  │ (source of   │            │   Vercel     │
                    │  truth:      │            │ (reads API,  │
                    │  2 DBs)      │            │  caches+ISR) │
                    └──────────────┘            └─────────────┘
Notion source of truth = TWO databases (both under the "26" hub):
  1. "Dylan's Notes"  → all long-form entries, split by Type
                        (Research Notes · Internships · Fieldnotes)
  2. "Library"        → the existing reading list (unchanged)
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
- **Both databases shared with the integration**: "Dylan's Notes" *and* "Library". (They sit in different places in the workspace — share each one.)
- A **GitHub** repo and a **Vercel** account (connect GitHub).
- Optionally, a custom domain.
**Environment variables (`.env.local`, and set in Vercel):**
```
NOTION_TOKEN=secret_xxx
NOTION_DB_CONTENT=2a666526-4967-48c5-b373-53ca3b8b4420   # "Dylan's Notes" — Research Notes / Internships / Fieldnotes
NOTION_DB_LIBRARY=a6845e59-6146-43bc-a767-366cfb510a62   # existing "Library" reading DB
REVALIDATE_SECRET=some-long-random-string
```
> Renamed from v1: `NOTION_DB_NOTES` → `NOTION_DB_CONTENT`, `NOTION_DB_READING` → `NOTION_DB_LIBRARY`, and `NOTION_DB_LIFE` is **removed**.
>
> These are the **database IDs** (what `@notionhq/client` uses for `databases.query`). For reference, the underlying **data-source IDs** (needed only if you adopt Notion's newer 2025-09 data-sources API) are: content `312e64ad-9a45-4f5b-b36d-2be25a7d4583`, library `ecc8ae6c-f757-46d2-a79d-8fb8de224e3f`.
---
## Part 4 — The Notion content model (verified live)  **[persist → CLAUDE.md]**
The databases already exist and are populated below with their **real, current** schemas (fetched from the workspace). Record both IDs in `.env` and `lib/notion/config.ts`, and mirror these schemas into `CLAUDE.md`. **Do not invent property names — map to exactly these labels.**
### 4.1 Content — `NOTION_DB_CONTENT` ("Dylan's Notes")
Single database for all three long-form strands. The `Type` select is the discriminator.
| Property | Type | Purpose |
|---|---|---|
| Title | Title | Entry title |
| **Type** | Select | `Research Notes` / `Internships` / `Fieldnotes` — which strand the entry belongs to |
| Slug | Rich text | Stable URL slug (set manually; do not derive from title) |
| Status | Select | `Draft` / `Published` — only `Published` renders |
| Published | Date | Sort key, shown as date |
| Series | Select | e.g. `Embodied AI` (mainly for Research Notes) |
| Order | Number | Ordering within a series |
| Excerpt | Rich text | One-line summary for lists |
| Tags | Multi-select | `Physical AI` / `Robotics` / `Diligence` / `Markets` |
The **page body** is the entry content.
> **Literal option names.** The live `Type` options are exactly `Research Notes`, `Internships`, and `Fieldnotes` (all plural, normalized). `config.ts` must use these exact strings.
>
> **Note on Fieldnotes fields.** The old Life DB had `Place` and a typed `Type` (Travel/Hobby/…). Those are gone — Fieldnotes use the shared schema above. If a `date · place` line on fieldnotes is wanted, add a `Place` rich-text property to this DB and map it; otherwise Excerpt + body suffice.
### 4.2 Reading — `NOTION_DB_LIBRARY` ("Library")  ← real schema, corrected
Dylan's **existing** library DB. This is *not* the schema v1 guessed. Map to these actual properties:
| Property | Type | Notes |
|---|---|---|
| Title | Title | Book title |
| Author | Rich text | Author |
| Domain | Multi-select | `Spiritual` / `Intellectual` / `Arts` / `Morals` / `Classics` / `Human Formation` / `Communication` / `Philosophy` / `Psychology` / `Finance` / `Markets` — use as the "shelf"/grouping |
| Approach | Select | `Summary` / `Summary + Dip In` / `Read Fully` / `Read & Apply` — reading depth |
| Read | Checkbox | Whether he's read it |
| To Get | Checkbox | Wishlist / not yet acquired |
| Distilled | Checkbox | Whether he's written up / distilled it |
| Journal | Relation | Links to related journal pages (out of scope for v1 render) |
| **Publish** | Checkbox | *Added for the website.* Public gate — only checked books render on `/reading` |
| **Takeaway** | Rich text | *Added for the website.* The one-line note shown on `/reading` |
**What Library does NOT have (so don't reference it):** no `Status` select, no `Rating`, no `Finished` date, no `Link` URL.
> **RESOLVED — public Reading page (option A).** The two properties above (`Publish`, `Takeaway`) were added to the Library specifically for the site. The `/reading` page filters on **`Publish = true`** and shows each book's `Takeaway`, grouped by `Domain`. This keeps the personal library private by default — nothing appears publicly until `Publish` is checked — and gives a clean public one-liner without touching the reading workflow. There is no fallback: a book with `Publish` unchecked never renders.
### 4.3 Life — **removed**
The Life database no longer exists. Fieldnotes (`Type = Fieldnotes` in `NOTION_DB_CONTENT`) replace it.
**Acceptance criteria:** both databases are shared with the integration; the token can query each; IDs are in `.env` and `lib/notion/config.ts`; schemas are mirrored in `CLAUDE.md`.
---
## Part 5 — Build sequence
### Phase 0 — Prerequisites
Confirm Node LTS, the accounts/secrets from Part 3, and that the integration can read **both** databases. **Done when** a throwaway script prints rows from `NOTION_DB_CONTENT` and `NOTION_DB_LIBRARY`.
### Phase 1 — Notion content model
Already created, and the `Publish`/`Takeaway` properties are live on the Library. Confirm Part 4 against live schemas. **Done when** Part 4 acceptance criteria pass.
### Phase 2 — Scaffold
Create the Next.js (App Router, TS) project; add Tailwind + `@tailwindcss/typography`; install `@notionhq/client`, `notion-to-md`, `react-markdown`, `remark-gfm`. Commit. **Done when** the dev server runs a blank styled page.
### Phase 3 — Notion data layer
In `lib/notion/`:
- `config.ts` — the two database IDs + a property-name map + the `Type` option constants (`RESEARCH_NOTES`, `INTERNSHIPS`, `FIELDNOTES`). Logical names in code, literal Notion labels in the map — this is what keeps the Library mapping and any future rename clean.
- `client.ts` — the Notion client.
- Query functions:
  - `getEntriesByType(type)` — filters `Status = Published` **AND** `Type = type`, sorts by `Order` then `Published`, maps to clean typed objects. Wrap thin helpers: `getResearchNotes()`, `getInternships()`, `getFieldnotes()`.
  - `getRecentEntries(limit)` — published entries across types for the home list (default: Research Notes first, or all types — your call).
  - `getEntryBySlug(slug)` — one published entry by manual slug (any type).
  - `getBooks()` — from `NOTION_DB_LIBRARY`; filters `Publish = true`, groups by `Domain`, maps to typed objects (`title`, `author`, `domain[]`, `approach`, `takeaway`).
  - `renderEntry(pageId)` — fetch blocks, `notion-to-md` → Markdown string.
- Set a module-level cache / use `revalidate` so queries aren't hammered (respect Notion's ~3 req/s limit). **Done when** the functions return typed data in a test route.
### Phase 4 — Pages & routing
- `/` — home: wordmark, one-line intro, a clean list of recent entries (title · date · excerpt), and text nav to the sections.
- `/notes` — Research Notes, grouped by `Series`, sorted by `Order`/`Published`.
- `/internships` — Internships, sorted by `Published` (newest first).
- `/fieldnotes` — Fieldnotes, sorted by `Published` (newest first), images from the page body.
- `/notes/[slug]` (and the equivalent reading route for internships/fieldnotes) — the reading page: title, `date · series`/`date` meta, prose body. Use a **single shared entry template** component; drive per-type list pages off `getEntriesByType`. `generateStaticParams` from published slugs; `export const revalidate = 60`.
  - *Routing options:* either three routes (`/notes/[slug]`, `/internships/[slug]`, `/fieldnotes/[slug]`) sharing one template, or a unified `/[type]/[slug]`. Prefer the explicit three for clean URLs; keep the template shared.
- `/reading` — books where `Publish = true`, grouped by `Domain`; each row `Title — Author`, the `Approach` label, and the one-line `Takeaway`.
- `/about` — short bio + links (static MDX or a Notion page).
**Done when** every page renders live Notion content and drafts never appear.
### Phase 5 — Design pass
Apply Part 6. This is where the Gates-Notes/Notion feel is dialled in. **Done when** the site matches the design system on desktop and mobile.
### Phase 6 — Content workflow wiring
- Set ISR (`revalidate = 60`) on content pages.
- Add `app/api/revalidate/route.ts` — an on-demand revalidation endpoint guarded by `REVALIDATE_SECRET`. **Done when** editing a Notion row appears within the interval, and hitting the endpoint makes it appear immediately.
### Phase 7 — Deploy
Push to GitHub; import to Vercel; set env vars; deploy; attach domain. **Done when** the production URL serves live content over HTTPS.
### Phase 8 — Handover
Write the "adding content" workflow (Part 7) into `README.md` and `CLAUDE.md`. **Done when** a non-developer could add a published entry by following the README.
---
## Part 6 — Design system (minimalist v1)
**Layout.** Single centred column. Reading content max-width ~**680px**; list pages may go to ~**760px**. Generous vertical rhythm; lots of whitespace. No sidebars, no boxes, no shadows.
**Type.** Editorial + clean, via `next/font`:
- Body & headings (reading pages): a refined **serif** — e.g. *Newsreader* or *Source Serif 4* — for the Gates-Notes editorial feel.
- Nav, meta, labels: a clean **sans** — *Inter* or system UI.
- *Simpler alternative for a more Notion-pure look: use Inter everywhere.* Pick one and be consistent.
- Base body **18–19px**, line-height **~1.7**; headings tighter (~1.2) and only slightly larger — restraint over drama.
**Colour.** Near-black text `#1A1A1A`; muted meta `#6B7280`; background `#FFFFFF`; hairline borders `#ECECEC`. One restrained accent at most (or none). No gradients.
**Chrome.** Text-only top nav: `Dylan's Notes` (left) · `Notes · Internships · Fieldnotes · Reading · About` (right). Minimal footer (a line + links). No hero images in v1. *(Nav labels are a design choice — you can group or reorder; "Notes" = Research Notes.)*
**Per page.**
- *Home* — wordmark, a one-sentence description, then a simple list of recent writing (like Gates Notes' piece list). Nothing else.
- *Entry (note/internship/fieldnote)* — a small "← [section]" link, the title, a muted `date · series`/`date` line, then the prose body. Tune the `prose` classes: comfortable measure, real paragraph spacing, understated links, block quotes and headings that breathe.
- *Reading* — books where `Publish = true`, grouped by `Domain`; each row is `Title — Author`, the `Approach` label, and the one-line `Takeaway`. Quiet and scannable.
- *About* — a few sentences and links (LinkedIn, email).
**Skip for v1** (note as easy future adds): dark mode, search, tags/filtering UI, RSS, comments, analytics.
---
## Part 7 — Content workflow (how Dylan adds things afterwards)  **[persist → CLAUDE.md]**
**To publish an entry (research note, internship, or fieldnote):**
1. Add a page to the **"Dylan's Notes"** database — in the Notion UI, or by asking Claude via the Notion connector.
2. Set **`Type`** (`Research Notes` / `Internships` / `Fieldnotes`).
3. Fill `Title`, `Slug`, `Excerpt`, `Published` (and `Series`/`Order` for research notes); write the body.
4. Set `Status = Published`.
5. It appears on the site within ~60s — or immediately by calling the revalidate endpoint.
**To add a book:** add/update a row in the **"Library"** database, fill `Takeaway`, and check **`Publish`** to make it appear on `/reading`. Same propagation. Leaving `Publish` unchecked keeps the book private.
**The point to remember:** the website reads Notion and nothing else. Whether a row was created by Dylan or by Claude, directly or through the connector, makes no difference — it renders the same way. Notion stays the one place content is edited.
---
## Part 8 — Gotchas & guardrails
- **Notion image URLs expire (~1 hour).** Never persist them. Re-fetch on each render/revalidation (ISR handles this), or, for image-heavy fieldnotes, download images to `/public` or an image host at build time.
- **Rate limits (~3 req/s).** Cache; don't fetch per-request in loops; lean on ISR.
- **`notion-to-md` doesn't cover every block type.** Test with the real notes; add custom handling for callouts/embeds if needed.
- **Stable URLs.** Always use the manual `Slug` property; never derive slugs from titles.
- **Draft safety.** Every content query filters `Status = Published`. Drafts must never render or appear in `generateStaticParams`.
- **Library gate is `Publish`, not `Status`.** The content DB uses `Status = Published`; the Library uses its own **`Publish` checkbox**. The `/reading` query must filter `Publish = true` — otherwise the entire personal reading shelf, including spiritual/personal domains, would go public. Private-by-default: unchecked books never render.
- **Secrets.** `NOTION_TOKEN` and `REVALIDATE_SECRET` live only in env; never commit them. Guard the revalidate route with the secret.
- **Independence.** This site publishes only independent research. **Internships content especially:** nothing derived from confidential employer/fund work goes in; clear any employer or fund publication policy before publishing internship write-ups or making the site public.
---
## Part 9 — What to put in `CLAUDE.md`  **[persist]**
Seed `CLAUDE.md` with, at minimum:
- **Mission** (Part 1, condensed).
- **Architecture principle** (Part 2) — Notion is the sole source of truth; the site only reads it; **two** databases.
- **The two database IDs and their real schemas** (Part 4) — the "in-memory" record of the content model, including the `Type` discriminator and the corrected Library schema.
- **The content workflow** (Part 7).
- **Conventions** — manual slugs, `Status = Published` filtering on content, the separate Reading gate, ISR interval, image-expiry handling, secrets in env only.
---
## Definition of done (v1)
A live, minimalist site on a custom domain where: home lists recent entries; each entry reads beautifully; `/notes`, `/internships`, `/fieldnotes` render from the single content DB by `Type`; `/reading` renders from the Library filtered to `Publish = true`; adding or editing a `Published` row in Notion (by Dylan or via Claude) appears within ~60 seconds; and the whole content model is recorded in `lib/notion/config.ts` and `CLAUDE.md`.
