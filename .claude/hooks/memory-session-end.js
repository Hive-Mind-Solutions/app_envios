#!/usr/bin/env node
// Nebula hook: memory-session-end (Stop)
"use strict";
const fs = require("fs");
const path = require("path");

const home = process.env.HOME || process.env.USERPROFILE || "";
const jsonlFile = path.join(home, ".nebula", "session-activity.jsonl");
const summaryFile = path.join(home, ".nebula", "last-session.md");

if (!fs.existsSync(jsonlFile)) process.exit(0);
const content = fs.readFileSync(jsonlFile, "utf8").trim();
if (!content) process.exit(0);

const entries = content.split("\n").filter(Boolean).map((l) => {
  try { return JSON.parse(l); } catch { return null; }
}).filter(Boolean);
if (entries.length === 0) process.exit(0);

const realEntries = entries.filter((e) => e.tool_name !== "__compact__");
const files = [...new Set(realEntries.filter((e) => e.file_path).map((e) => e.file_path))].sort().slice(0, 30);
const descriptions = [...new Set(realEntries.filter((e) => e.description).map((e) => e.description))].slice(0, 20);
const timestamps = entries.map((e) => e.timestamp).sort();

const lines = ["# Last Session Summary", ""];
lines.push("**Date**: " + (timestamps[0] || "").slice(0, 10));
lines.push("**Actions**: " + entries.length);
lines.push("");
if (descriptions.length > 0) {
  lines.push("## What was done");
  descriptions.forEach((d) => lines.push("- " + d));
  lines.push("");
}
if (files.length > 0) {
  lines.push("## Files touched");
  files.forEach((f) => lines.push("- `" + f + "`"));
}

fs.mkdirSync(path.dirname(summaryFile), { recursive: true });
fs.writeFileSync(summaryFile, lines.join("\n") + "\n");
