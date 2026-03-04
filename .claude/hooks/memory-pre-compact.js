#!/usr/bin/env node
// Nebula hook: memory-pre-compact (PreCompact)
"use strict";
const fs = require("fs");
const path = require("path");

const home = process.env.HOME || process.env.USERPROFILE || "";
const jsonlFile = path.join(home, ".nebula", "session-activity.jsonl");
fs.mkdirSync(path.dirname(jsonlFile), { recursive: true });

const entry = {
  tool_name: "__compact__",
  file_path: "",
  function_name: "",
  change_type: "compact",
  description: "Context window compaction",
  timestamp: new Date().toISOString(),
};
fs.appendFileSync(jsonlFile, JSON.stringify(entry) + "\n");
