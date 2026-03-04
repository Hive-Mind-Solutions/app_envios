# /nebula-login

Authenticate with Nebula Cloud and configure automatic token tracking.

All scripts are **Node.js** — cross-platform (Windows, Linux, macOS).

## When to Use

Run this command when:
- Claude tells you authentication is required
- You want to switch accounts
- Your session has expired
- Setting up a new machine

## IMPORTANT

- **ALWAYS run the full device flow below, even if `~/.nebula/session.json` already exists.** Do NOT skip steps because a previous session was found. The user is explicitly requesting a fresh login.
- **All temp scripts are `.js` files.** Run them with `node _nebula_xxx.js`. No PowerShell or Bash dependencies.

## MANDATORY EXECUTION ORDER

**Tool call 1:** Write `_nebula_login.js` (login script)
**Tool call 2:** Bash execute `node _nebula_login.js` (get device code)
**Tool call 3:** Write `_nebula_complete.js` (poll + save + wrapper + profile — ALL in ONE script)
**Tool call 4:** Display the code/URL to user + Bash execute `node _nebula_complete.js` (in SAME response)
**Tool call 5:** Display success or error message

**RULES:**
- NEVER show the code/URL before tool call 4
- NEVER write files after showing the code
- ALWAYS run the full flow even if `~/.nebula/session.json` already exists

## Tool call 1: Write login script

Use the **Write tool** to create `_nebula_login.js`:

```javascript
const { readFileSync } = require("fs");
const os = require("os");

const config = JSON.parse(readFileSync("nebula.json", "utf8"));
const apiUrl = config.apiUrl;
if (!apiUrl) { console.error("ERROR: apiUrl not found in nebula.json"); process.exit(1); }
const username = os.userInfo().username;

const url = new URL(apiUrl + "/auth/device");
const proto = url.protocol === "https:" ? require("https") : require("http");
const body = JSON.stringify({ system_user: username });

const req = proto.request(url, {
  method: "POST",
  headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
}, (res) => {
  let data = "";
  res.on("data", (c) => data += c);
  res.on("end", () => {
    console.log("API_URL=" + apiUrl);
    console.log(data);
  });
});
req.on("error", (e) => { console.error("ERROR: " + e.message); process.exit(1); });
req.write(body);
req.end();
```

## Tool call 2: Execute login script

```bash
node _nebula_login.js
```

Parse `device_code`, `user_code`, `verification_url`, and `API_URL` from the output.

## Tool call 3: Write completion script

Use the **Write tool** to create `_nebula_complete.js`. This ONE script does EVERYTHING: poll, save session, save telemetry, create wrapper, configure shell profile, clean up.

Replace `[API_URL]` and `[DEVICE_CODE]` with actual values from tool call 2:

```javascript
const { writeFileSync, readFileSync, existsSync, mkdirSync, appendFileSync, unlinkSync } = require("fs");
const { join, dirname } = require("path");
const os = require("os");

const API_URL = "[API_URL]";
const DEVICE_CODE = "[DEVICE_CODE]";
const home = os.homedir();
const nebulaDir = join(home, ".nebula");

// ── Poll ─────────────────────────────────────────
function poll(attempt) {
  if (attempt >= 60) { console.log("RESULT=TIMEOUT"); process.exit(1); }
  const url = new URL(API_URL + "/auth/device/poll?device_code=" + DEVICE_CODE);
  const proto = url.protocol === "https:" ? require("https") : require("http");
  proto.get(url, (res) => {
    let data = "";
    res.on("data", (c) => data += c);
    res.on("end", () => {
      try {
        const r = JSON.parse(data);
        if (r.status === "authorized") { onAuthorized(r); return; }
        if (r.status === "expired") { console.log("RESULT=EXPIRED"); process.exit(1); }
      } catch {}
      process.stderr.write("Polling... (" + (attempt + 1) + "/60)\n");
      setTimeout(() => poll(attempt + 1), 5000);
    });
  }).on("error", () => setTimeout(() => poll(attempt + 1), 5000));
}

function onAuthorized(r) {
  mkdirSync(nebulaDir, { recursive: true });

  // Save session
  writeFileSync(join(nebulaDir, "session.json"), JSON.stringify({
    token: r.token,
    user_email: r.user.email,
    org_id: r.user.organization_id || "",
  }));

  // Save telemetry config (includes api_key for OTEL auth)
  const t = r.telemetry || {};
  writeFileSync(join(nebulaDir, "telemetry.json"), JSON.stringify({
    endpoint: t.endpoint || "",
    api_key: t.api_key || "",
    resource_attributes: t.resource_attributes || "",
    protocol: t.protocol || "http/json",
  }));

  // Create cross-platform Node.js wrapper
  const wrapper = [
    '#!/usr/bin/env node',
    'const { spawn } = require("child_process");',
    'const { readFileSync, existsSync } = require("fs");',
    'const { join } = require("path");',
    'const home = process.env.HOME || process.env.USERPROFILE;',
    'const env = { ...process.env };',
    'if (existsSync("nebula.json")) {',
    '  try {',
    '    const cfg = JSON.parse(readFileSync("nebula.json", "utf8"));',
    '    const s = JSON.parse(readFileSync(join(home, ".nebula", "session.json"), "utf8"));',
    '    const tPath = join(home, ".nebula", "telemetry.json");',
    '    const t = existsSync(tPath) ? JSON.parse(readFileSync(tPath, "utf8")) : {};',
    '    env.CLAUDE_CODE_ENABLE_TELEMETRY = "1";',
    '    env.OTEL_METRICS_EXPORTER = "otlp";',
    '    env.OTEL_LOGS_EXPORTER = "otlp";',
    '    env.OTEL_EXPORTER_OTLP_PROTOCOL = t.protocol || "http/json";',
    '    env.OTEL_EXPORTER_OTLP_ENDPOINT = t.endpoint || (cfg.apiUrl + "/otel");',
    '    env.OTEL_EXPORTER_OTLP_HEADERS = "Authorization=Bearer " + (t.api_key || "");',
    '    const baseAttrs = t.resource_attributes ||',
    '      "nebula.user_email=" + s.user_email + ",nebula.org_id=" + (s.org_id || "");',
    '    env.OTEL_RESOURCE_ATTRIBUTES = baseAttrs + ",nebula.project_id=" + cfg.projectId;',
    '  } catch {}',
    '}',
    'const child = spawn("claude", process.argv.slice(2), { stdio: "inherit", env, shell: true });',
    'child.on("exit", (code) => process.exit(code || 0));',
  ].join("\n");
  writeFileSync(join(nebulaDir, "claude-wrapper.js"), wrapper);

  // Configure shell profiles
  const wrapperPath = join(nebulaDir, "claude-wrapper.js");

  if (process.platform === "win32") {
    try {
      const { execSync } = require("child_process");
      const profilePath = execSync(
        'powershell -NoProfile -Command "$PROFILE.CurrentUserAllHosts"', { encoding: "utf8" }
      ).trim();
      mkdirSync(dirname(profilePath), { recursive: true });
      const content = existsSync(profilePath) ? readFileSync(profilePath, "utf8") : "";
      if (!content.includes("claude-wrapper")) {
        const escaped = wrapperPath.replace(/\\/g, "\\\\");
        appendFileSync(profilePath,
          "\n# Nebula: automatic token tracking\nfunction claude { node \"" + escaped + "\" @args }\n"
        );
      }
    } catch {}
  }

  // Bash/Zsh profile (Linux, macOS, Git Bash on Windows)
  const bashAlias = 'alias claude=\'node "' + wrapperPath + '"\'';
  for (const rc of [".bashrc", ".zshrc"]) {
    const rcPath = join(home, rc);
    if (existsSync(rcPath)) {
      const content = readFileSync(rcPath, "utf8");
      if (!content.includes("claude-wrapper")) {
        appendFileSync(rcPath, "\n# Nebula: automatic token tracking\n" + bashAlias + "\n");
      }
    }
  }

  // Cleanup temp files
  for (const f of ["_nebula_login.js", "_nebula_complete.js"]) {
    try { unlinkSync(f); } catch {}
  }

  console.log("RESULT=OK");
  console.log("EMAIL=" + r.user.email);
}

poll(0);
```

## Tool call 4: Display code AND execute (SAME response)

NOW — and ONLY now — show the code to the user, then IMMEDIATELY execute the completion script in the SAME response message:

```
══════════════════════════════════════════════════
         NEBULA AUTHENTICATION
══════════════════════════════════════════════════

Tu código de verificación: [USER_CODE]

Abre este enlace en tu navegador:
[VERIFICATION_URL]

Ingresa el código manualmente en la página.
Esperando autorización...

══════════════════════════════════════════════════
```

Execute (timeout 320000):
```bash
node _nebula_complete.js
```

## Tool call 5: Show result

- `RESULT=OK` + `EMAIL=...`:
  ```
  Autenticado como [EMAIL]
  Seguimiento de tokens configurado

  Sigue estos pasos (solo es necesario la primera vez):
  1. Cierra esta terminal
  2. Abre una nueva terminal
  3. Ejecuta: claude

  A partir de ahora la telemetría funciona automáticamente.
  ```
- `RESULT=EXPIRED`: "El código expiró. Ejecuta `/nebula-login` de nuevo."
- `RESULT=TIMEOUT`: "Tiempo de espera agotado. Ejecuta `/nebula-login` de nuevo."

## How It Works

After setup, when you run `claude` in any Nebula project:
1. Wrapper detects `nebula.json` in current directory
2. Reads project ID and API URL from it
3. Reads session token from `~/.nebula/session.json`
4. Reads OTEL API key from `~/.nebula/telemetry.json`
5. Sets all OTEL environment variables (including `OTEL_EXPORTER_OTLP_HEADERS` for auth)
6. Launches Claude with telemetry enabled

## Security

- Session file stores only the auth token + user metadata
- Telemetry file stores the OTEL API key (server-provided)
- Learning roles are NEVER stored locally — verified via API on each session
- This prevents role tampering via local file edits

## Error Handling

- Network error: "Check your internet connection."
- Timeout: "Run /nebula-login again."
- No nebula.json: Claude runs normally without telemetry
