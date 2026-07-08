/**
 * OPTIONAL. The "Dylan's Notes" content database already exists (its ID is in
 * .env.example / CLAUDE.md). Use this only if you need to recreate it from
 * scratch under a different parent page.
 *
 *   NOTION_PARENT_PAGE_ID=<page-id-shared-with-your-integration> \
 *     node --env-file=.env.local scripts/setup-notion.mjs
 *
 * It prints the new database ID; copy it into .env.local and Vercel as
 * NOTION_DB_NOTES. (Reading maps to your existing "Library" — untouched here.)
 */
import { Client } from "@notionhq/client";

const token = process.env.NOTION_TOKEN;
const parent = process.env.NOTION_PARENT_PAGE_ID;
if (!token || !parent) {
  console.error(
    "Set NOTION_TOKEN and NOTION_PARENT_PAGE_ID (a page shared with your integration).",
  );
  process.exit(1);
}

const notion = new Client({ auth: token, notionVersion: "2022-06-28" });
const title = (content) => [{ type: "text", text: { content } }];

const db = await notion.databases.create({
  parent: { type: "page_id", page_id: parent },
  title: title("Dylan's Notes"),
  properties: {
    Title: { title: {} },
    Slug: { rich_text: {} },
    Type: {
      select: {
        options: [
          { name: "Research Notes", color: "gray" },
          { name: "Internships", color: "green" },
          { name: "Fieldnote", color: "yellow" },
        ],
      },
    },
    Status: {
      select: {
        options: [
          { name: "Draft", color: "gray" },
          { name: "Published", color: "green" },
        ],
      },
    },
    Published: { date: {} },
    Series: { select: { options: [{ name: "Embodied AI", color: "blue" }] } },
    Order: { number: {} },
    Excerpt: { rich_text: {} },
    Tags: {
      multi_select: {
        options: [
          { name: "Physical AI", color: "blue" },
          { name: "Robotics", color: "green" },
          { name: "Diligence", color: "purple" },
          { name: "Markets", color: "orange" },
        ],
      },
    },
  },
});

console.log(`NOTION_DB_NOTES=${db.id.replace(/-/g, "")}`);
console.log("Done. Copy the ID above into .env.local and Vercel.");
