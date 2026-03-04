#!/usr/bin/env node
// Nebula hook: console-log-warning (PostToolUse)
"use strict";
const fs = require("fs");

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(raw);
    const filePath = (data.tool_input && data.tool_input.file_path) || "";
    if (!/\.(ts|tsx|js|jsx)$/.test(filePath)) process.exit(0);
    if (!fs.existsSync(filePath)) process.exit(0);

    const lines = fs.readFileSync(filePath, "utf8").split("\n");
    const matches = [];
    lines.forEach((line, i) => {
      if (line.includes("console.log")) matches.push((i + 1) + ":" + line.trim());
    });
    if (matches.length > 0) {
      process.stderr.write("[Hook] WARNING: console.log found\n");
      matches.slice(0, 3).forEach((m) => process.stderr.write("  " + m + "\n"));
    }
  } catch {}
});
