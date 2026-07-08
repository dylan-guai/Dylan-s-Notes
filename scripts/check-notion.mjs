/**
 * Phase 0 / handover check: prove the integration token can read all three
 * databases and print a few rows from each.
 *
 *   node --env-file=.env.local scripts/check-notion.mjs
 *
 * (Node 20+ supports --env-file. Or: `npm run check:notion`.)
 */
import { Client } from "@notionhq/client";

const token = process.env.NOTION_TOKEN;
if (!token) {
  console.error(
    "Missing NOTION_TOKEN.\nRun: node --env-file=.env.local scripts/check-notion.mjs",
  );
  process.exit(1);
}

const notion = new Client({ auth: token, notionVersion: "2022-06-28" });

const databases = {
  Notes: process.env.NOTION_DB_NOTES,
  Reading: process.env.NOTION_DB_READING,
  Life: process.env.NOTION_DB_LIFE,
};

let ok = true;
for (const [name, id] of Object.entries(databases)) {
  if (!id) {
    console.log(`- ${name}: (no id set)`);
    ok = false;
    continue;
  }
  try {
    const res = await notion.databases.query({ database_id: id, page_size: 5 });
    console.log(`- ${name} (${id}): ${res.results.length} row(s) readable`);
    for (const page of res.results) {
      const props = page.properties ?? {};
      const titleProp = Object.values(props).find((p) => p.type === "title");
      const title = titleProp
        ? titleProp.title.map((t) => t.plain_text).join("")
        : "(untitled)";
      console.log(`    • ${title}`);
    }
  } catch (err) {
    ok = false;
    console.error(
      `- ${name} (${id}): ERROR ${err.status ?? ""} ${err.message}\n` +
        "    Make sure the database is shared with your integration.",
    );
  }
}

process.exit(ok ? 0 : 1);
