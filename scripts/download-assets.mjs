#!/usr/bin/env node
// Download all assets from OiiOii.ai to public/
// Run: node scripts/download-assets.mjs

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public");

// Kill any proxy env so fetch goes direct
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.http_proxy;
delete process.env.https_proxy;
delete process.env.ALL_PROXY;
delete process.env.all_proxy;

const ASSETS = [
  // Favicon & SEO
  { url: "https://www.oiioii.ai/favicon.ico", dest: "favicon.ico" },
  { url: "https://static-oiioii-sg.hogiai.cn/home/share.png", dest: "seo/share.png" },

  // Home page hero
  { url: "https://static-oiioii-sg.hogiai.cn/home/home-v2/story-anime.webp", dest: "images/home/story-anime.webp" },

  // Skill case covers (used as card backgrounds on home)
  { url: "https://static-oiioii-sg.hogiai.cn/skill_cases/tang_dynastic_cover.webp", dest: "images/skill-cases/tang_dynastic_cover.webp" },
  { url: "https://static-oiioii-sg.hogiai.cn/skill_cases/pet_story_cover.webp", dest: "images/skill-cases/pet_story_cover.webp" },
  { url: "https://static-oiioii-sg.hogiai.cn/skill_cases/funny_story_cover.webp", dest: "images/skill-cases/funny_story_cover.webp" },
  { url: "https://static-oiioii-sg.hogiai.cn/skill_cases/horrible_story_cover.webp", dest: "images/skill-cases/horrible_story_cover.webp" },

  // Skill case detail images (used in highlight grid)
  { url: "https://static-oiioii-sg.hogiai.cn/skill_cases/mput7uzv_2022442bbe91c0a7.webp", dest: "images/skill-cases/mput7uzv.webp" },
  { url: "https://static-oiioii-sg.hogiai.cn/skill_cases/hnlnheuv_d97fefeb0d415f53.webp", dest: "images/skill-cases/hnlnheuv.webp" },

  // Campaign covers (events section)
  { url: "https://static-oiioii-sg.hogiai.cn/campaigns/cover-main-zh-1781236526736.jpg", dest: "images/campaigns/manual-2-0.jpg" },
  { url: "https://static-oiioii-sg.hogiai.cn/campaigns/cover-main-zh-1784018791105.jpg", dest: "images/campaigns/overseas.jpg" },
  { url: "https://static-oiioii-sg.hogiai.cn/campaigns/cover-main-zh-1780905584765.jpg", dest: "images/campaigns/supercreator.jpg" },
];

async function downloadOne({ url, dest }) {
  const outPath = join(PUBLIC_DIR, dest);
  await mkdir(dirname(outPath), { recursive: true });
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      console.warn(`✗ ${res.status} ${url}`);
      return { url, dest, ok: false, status: res.status };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(outPath, buf);
    console.log(`✓ ${dest} (${(buf.length / 1024).toFixed(1)}KB)`);
    return { url, dest, ok: true, size: buf.length };
  } catch (e) {
    console.warn(`✗ ${url} — ${e.message}`);
    return { url, dest, ok: false, error: e.message };
  }
}

async function main() {
  console.log(`Downloading ${ASSETS.length} assets to ${PUBLIC_DIR}...`);
  // Download in parallel batches of 4
  const results = [];
  for (let i = 0; i < ASSETS.length; i += 4) {
    const batch = ASSETS.slice(i, i + 4);
    const batchResults = await Promise.all(batch.map(downloadOne));
    results.push(...batchResults);
  }
  const ok = results.filter((r) => r.ok).length;
  const fail = results.length - ok;
  console.log(`\nDone: ${ok} ok, ${fail} failed`);
  if (fail > 0) {
    console.log("Failed:", results.filter((r) => !r.ok));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
