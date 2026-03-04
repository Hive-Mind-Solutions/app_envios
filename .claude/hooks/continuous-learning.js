#!/usr/bin/env node
// Nebula hook: continuous-learning (Stop)
"use strict";
const fs = require("fs");
const path = require("path");

const home = process.env.HOME || process.env.USERPROFILE || "";
const jsonlFile = path.join(home, ".nebula", "session-activity.jsonl");

if (!fs.existsSync(jsonlFile)) process.exit(0);
const lines = fs.readFileSync(jsonlFile, "utf8").trim().split("\n").filter(Boolean);
if (lines.length >= 5) {
  process.stderr.write("[Nebula] Productive session (" + lines.length + " actions). Consider running /learn to extract reusable patterns.\n");
}
