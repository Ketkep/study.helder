#!/usr/bin/env node
/**
 * Fails if anything secret ended up in the browser bundle (.next/static).
 * Run after `next build`: npm run check:bundle
 *
 * Checks for known secret markers, and for the actual values of every
 * server-only environment variable present at build time.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const STATIC_DIR = join(process.cwd(), ".next", "static");

const MARKERS = [
  "sb_secret_",
  "service_role",
  "SUPABASE_SERVICE_ROLE",
  "SUPABASE_SECRET_KEY",
  "CRON_SECRET",
  "ANTHROPIC_API_KEY",
  "sk-ant-",
];

// Values of server-only env vars (anything not NEXT_PUBLIC_*) long enough to be secrets.
const SERVER_ONLY_NAMES = ["CRON_SECRET", "SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY", "ANTHROPIC_API_KEY"];
const secretValues = SERVER_ONLY_NAMES.map((name) => [name, process.env[name]]).filter(
  ([, value]) => typeof value === "string" && value.length >= 8,
);

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (/\.(js|css|html|json|txt|map)$/.test(entry)) yield path;
  }
}

let files;
try {
  files = [...walk(STATIC_DIR)];
} catch {
  console.error("No .next/static folder. Run `npm run build` first.");
  process.exit(2);
}

const problems = [];
for (const file of files) {
  const content = readFileSync(file, "utf8");
  for (const marker of MARKERS) {
    if (content.includes(marker)) problems.push(`${file}: contains "${marker}"`);
  }
  for (const [name, value] of secretValues) {
    if (content.includes(value)) problems.push(`${file}: contains the value of ${name}`);
  }
}

if (problems.length > 0) {
  console.error("Secrets found in the client bundle:\n" + problems.map((p) => `  ${p}`).join("\n"));
  process.exit(1);
}
console.log(`Client bundle is clean (${files.length} files checked).`);
