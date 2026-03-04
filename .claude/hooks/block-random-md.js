#!/usr/bin/env node
// Nebula hook: block-random-md (PreToolUse)
"use strict";
const path = require("path");

const ALLOWED_NAMES = new Set([
  "README.md", "CLAUDE.md", "CHANGELOG.md", "CONTRIBUTING.md",
  "AGENTS.md", "working-log.md", "WORKING-LOG.md",
]);

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(raw);
    const filePath = (data.tool_input && data.tool_input.file_path) || "";
    if (!/\.(md|txt)$/.test(filePath)) process.exit(0);
    const fileName = path.basename(filePath);
    if (ALLOWED_NAMES.has(fileName)) process.exit(0);
    const fwd = filePath.split(path.sep).join("/");
    if (/[\/]docs[\/]/.test(fwd) || fwd.startsWith("docs/")) process.exit(0);
    process.stderr.write("[Hook] BLOCKED: .md files only allowed in docs/ or as README/CLAUDE/CHANGELOG. Use docs/ for documentation.\n");
    process.exit(2);
  } catch {}
});
