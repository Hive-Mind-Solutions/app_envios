#!/usr/bin/env node
// Nebula hook: dev-server-separate-terminal (PreToolUse)
"use strict";
let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(raw);
    const cmd = (data.tool_input && data.tool_input.command) || "";
    if (/(npm run dev|pnpm( run)? dev|yarn dev|bun run dev)/.test(cmd)) {
      process.stderr.write("[Hook] BLOCKED: Dev server should run in a separate terminal\n");
      process.exit(2);
    }
  } catch {}
});
