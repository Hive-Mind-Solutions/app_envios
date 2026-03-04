#!/usr/bin/env node
// Nebula hook: long-command-separate-terminal (PreToolUse)
"use strict";
let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(raw);
    const cmd = (data.tool_input && data.tool_input.command) || "";
    if (/(npm (install|test)|pnpm (install|test)|yarn (install|test)|pytest|vitest|cargo build|docker)/.test(cmd)) {
      process.stderr.write("[Hook] TIP: Consider running long commands in a separate terminal\n");
    }
  } catch {}
});
