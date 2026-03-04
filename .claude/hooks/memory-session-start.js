#!/usr/bin/env node
// Nebula hook: memory-session-start (SessionStart)
"use strict";
const fs = require("fs");
const path = require("path");

const home = process.env.HOME || process.env.USERPROFILE || "";
const summaryFile = path.join(home, ".nebula", "last-session.md");
if (!fs.existsSync(summaryFile)) process.exit(0);

const content = fs.readFileSync(summaryFile, "utf8").trim();
if (content) {
  process.stderr.write("[Nebula] Last session summary:\n");
  process.stderr.write(content + "\n");
}
