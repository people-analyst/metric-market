#!/usr/bin/env node
/**
 * Republish Metric Market documentation to the Hub.
 * Reads hub-docs.md and calls Hub SDK pushDocumentation.
 * Usage: node scripts/republish-docs.mjs
 * Env: HUB_API_KEY (required for Hub to accept push)
 */
import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const root = resolve(__dirname, "..");
const hubSdk = require(resolve(root, "hub-sdk.cjs"));

const docPath = resolve(root, "hub-docs.md");
const content = readFileSync(docPath, "utf8");
const version = new Date().toISOString();

console.log("Republishing hub-docs.md to Hub, version:", version);
hubSdk
  .pushDocumentation(content, version)
  .then((r) => {
    console.log("Done. Score:", r?.score ?? "—", "Response:", JSON.stringify(r));
  })
  .catch((e) => {
    console.error("Failed:", e.message);
    process.exit(1);
  });
