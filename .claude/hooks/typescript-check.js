#!/usr/bin/env node
// Nebula hook: typescript-check (PostToolUse)
"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(raw);
    const filePath = (data.tool_input && data.tool_input.file_path) || "";
    if (!/\.(ts|tsx)$/.test(filePath)) process.exit(0);
    if (!fs.existsSync(filePath)) process.exit(0);

    // Walk up to find package root with tsconfig.json
    let dir = path.dirname(path.resolve(filePath));
    while (dir && !fs.existsSync(path.join(dir, "package.json"))) {
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    if (!fs.existsSync(path.join(dir, "tsconfig.json"))) process.exit(0);

    try {
      execSync("npx tsc --noEmit --pretty false", { cwd: dir, encoding: "utf8", timeout: 30000 });
    } catch (e) {
      const errors = (e.stdout || "").split("\n")
        .filter((l) => l.includes(filePath.replace(/\\\\/g, "/")))
        .slice(0, 5);
      if (errors.length > 0) {
        process.stderr.write("[Hook] TypeScript errors:\n");
        process.stderr.write(errors.join("\n") + "\n");
      }
    }
  } catch {}
});
