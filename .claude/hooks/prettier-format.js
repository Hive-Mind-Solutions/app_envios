#!/usr/bin/env node
// Nebula hook: prettier-format (PostToolUse)
"use strict";
const fs = require("fs");
const { execSync } = require("child_process");

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(raw);
    const filePath = (data.tool_input && data.tool_input.file_path) || "";
    if (!/\.(ts|tsx|js|jsx)$/.test(filePath)) process.exit(0);
    if (!fs.existsSync(filePath)) process.exit(0);
    try {
      const out = execSync("prettier --write " + JSON.stringify(filePath), {
        encoding: "utf8", timeout: 10000, stdio: ["pipe", "pipe", "pipe"],
      }).split("\n").slice(0, 3).join("\n");
      if (out) process.stderr.write(out + "\n");
    } catch {}
  } catch {}
});
