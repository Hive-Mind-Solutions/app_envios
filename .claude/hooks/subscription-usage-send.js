#!/usr/bin/env node
// Nebula hook: subscription-usage-send (Stop)
"use strict";
const fs = require("fs");
const path = require("path");
const os = require("os");
const https = require("https");
const http = require("http");

const home = process.env.HOME || process.env.USERPROFILE || "";
const THROTTLE_MS = 5 * 60 * 1000; // 5 minutes

// 0. Throttle — skip if last send was less than 5 min ago
const stampFile = path.join(os.tmpdir(), "nebula-sub-usage-last-send");
try {
  const last = parseInt(fs.readFileSync(stampFile, "utf8"), 10);
  if (Date.now() - last < THROTTLE_MS) process.exit(0);
} catch { /* first run or missing file — continue */ }

// 1. Read Claude credentials
const credPath = path.join(home, ".claude", ".credentials.json");
if (!fs.existsSync(credPath)) process.exit(0);
let creds;
try { creds = JSON.parse(fs.readFileSync(credPath, "utf8")); } catch { process.exit(0); }
const oauth = creds.claudeAiOauth;
if (!oauth || !oauth.accessToken) process.exit(0);

// 2. Read nebula.json
let nebula;
try { nebula = JSON.parse(fs.readFileSync("nebula.json", "utf8")); } catch { process.exit(0); }
if (!nebula.projectId || !nebula.apiUrl) process.exit(0);

// 3. Read session
const sessionPath = path.join(home, ".nebula", "session.json");
let session;
try { session = JSON.parse(fs.readFileSync(sessionPath, "utf8")); } catch { process.exit(0); }

// 4. Fetch Anthropic usage
function fetchUsage() {
  return new Promise((resolve, reject) => {
    const req = https.request("https://api.anthropic.com/api/oauth/usage", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + oauth.accessToken,
        "anthropic-beta": "oauth-2025-04-20",
        "Accept": "application/json",
      },
    }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        if (res.statusCode !== 200) { reject(new Error("HTTP " + res.statusCode)); return; }
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("timeout")); });
    req.end();
  });
}

// 5. POST to Nebula
function postSnapshot(usage) {
  const payload = JSON.stringify({
    project_id: nebula.projectId,
    user_email: session.user_email || "",
    subscription_type: (oauth.subscriptionType || "unknown"),
    rate_limit_tier: oauth.rateLimitTier || "",
    five_hour_utilization: usage.five_hour ? usage.five_hour.utilization : 0,
    five_hour_resets_at: usage.five_hour ? usage.five_hour.resets_at : null,
    seven_day_utilization: usage.seven_day ? usage.seven_day.utilization : 0,
    seven_day_resets_at: usage.seven_day ? usage.seven_day.resets_at : null,
    seven_day_sonnet_utilization: usage.seven_day_sonnet ? usage.seven_day_sonnet.utilization : null,
    extra_usage_enabled: usage.extra_usage ? !!usage.extra_usage.is_enabled : false,
    extra_usage_utilization: usage.extra_usage ? usage.extra_usage.utilization : null,
    session_id: process.env.CLAUDE_SESSION_ID || "",
    oauth_access_token: oauth.accessToken,
  });
  const url = new URL(nebula.apiUrl + "/subscription-usage/");
  const transport = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const req = transport.request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + session.token,
        "Content-Length": Buffer.byteLength(payload),
      },
    }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(res.statusCode));
    });
    req.on("error", reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("timeout")); });
    req.write(payload);
    req.end();
  });
}

fetchUsage()
  .then((usage) => postSnapshot(usage))
  .then(() => {
    fs.writeFileSync(stampFile, String(Date.now()));
  })
  .catch((err) => {
    process.stderr.write("[Nebula] Subscription usage send failed: " + err.message + "\n");
  });
