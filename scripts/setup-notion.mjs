/**
 * OPTIONAL. The Research Notes and Life databases already exist (their IDs are
 * in .env.example / CLAUDE.md). Use this only if you need to recreate them
 * from scratch under a different parent page.
 *
 *   NOTION_PARENT_PAGE_ID=<page-id-shared-with-your-integration> \
 *     node --env-file=.env.local scripts/setup-notion.mjs
 *
 * It prints the new database IDs; copy them into .env.local and Vercel.
 * (The Reading section maps to your existing "Library" database — this script
 * does NOT touch it.)
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

async function createNotes() {
  const db = await notion.databases.create({
    parent: { type: "page_id", page_id: parent },
    title: title("Research Notes"),
    properties: {
      Title: { title: {} },
      Slug: { rich_text: {} },
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
}

async function createLife() {
  const db = await notion.databases.create({
    parent: { type: "page_id", page_id: parent },
    title: title("Life"),
    properties: {
      Title: { title: {} },
      Type: {
        select: {
          options: [
            { name: "Travel", color: "blue" },
            { name: "Hobby", color: "green" },
            { name: "Volunteering", color: "orange" },
            { name: "Other", color: "gray" },
          ],
        },
      },
      Date: { date: {} },
      Place: { rich_text: {} },
      Summary: { rich_text: {} },
      Status: {
        select: {
          options: [
            { name: "Draft", color: "gray" },
            { name: "Published", color: "green" },
          ],
        },
      },
    },
  });
  console.log(`NOTION_DB_LIFE=${db.id.replace(/-/g, "")}`);
}

await createNotes();
await createLife();
console.log("Done. Copy the IDs above into .env.local and Vercel.");
