#!/usr/bin/env node
// Nebula hook: final-console-audit (Stop)
"use strict";
const fs = require("fs");
const { execSync } = require("child_process");

try {
  const output = execSync("git diff --name-only HEAD", { encoding: "utf8", timeout: 5000 });
  const files = output.split("\n").filter((f) => /\.(ts|tsx|js|jsx)$/.test(f));
  if (files.length === 0) process.exit(0);

  const found = [];
  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    const lines = fs.readFileSync(f, "utf8").split("\n");
    const matches = [];
    lines.forEach((line, i) => {
      if (line.includes("console.log")) matches.push("  " + (i + 1) + ":" + line.trim());
    });
    if (matches.length > 0) found.push(f + "\n" + matches.slice(0, 3).join("\n"));
  }
  if (found.length > 0) {
    process.stderr.write("[Hook] WARNING: console.log found in modified files:\n");
    process.stderr.write(found.join("\n") + "\n");
  }
} catch {}
