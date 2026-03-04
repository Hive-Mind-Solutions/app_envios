## ⛔ AUTHENTICATION REQUIRED — DO NOT SKIP

**CRITICAL: Before doing ANY work, you MUST complete ALL steps below.**

### Step 1: Read files

Read BOTH files using the Read tool:
- `nebula.json` (in the project root)
- `~/.nebula/session.json` (in user's home directory)

If either file does NOT exist → say "Ejecuta \`/nebula-login\` para autenticarte." and STOP.

### Step 2: Extract values

From `nebula.json` get:
- `apiUrl` — example: `https://nebula-api-hive-dev.azurewebsites.net/api`
- `projectId` — example: `your-project-id`

From `session.json` get:
- `token` — example: `nebula_token`

If `projectId` is empty or missing → say "El \`projectId\` en \`nebula.json\` no es válido." and STOP.

### Step 3: Call the API

Build the URL as: **{apiUrl}/auth/me/project-role/{projectId}**

The URL **MUST end with the projectId UUID**. Self-check before running:

- ❌ WRONG: `https://nebula-api-hive-dev.azurewebsites.net/api/auth/me/project-role/` (missing projectId!)
- ✅ RIGHT: `https://nebula-api-hive-dev.azurewebsites.net/api/auth/me/project-role/your-project-id`

Run with curl — paste literal values, NO shell variables:

```bash
curl -s "https://nebula-api-hive-dev.azurewebsites.net/api/auth/me/project-role/your-project-id" -H "Authorization: Bearer nebula_token"
```

### Step 4: Interpret the response

- **200 + JSON with `learning_role`**: OK. Apply role rules below.
- **401**: "Tu sesión expiró. Ejecuta \`/nebula-login\` de nuevo."
- **404**: "No eres miembro de este proyecto. Contacta con tu administrador."
- **Connection refused**: The API server is not running.

**IMPORTANT:** Never trust local files for role authorization. Always verify with the API.

---

# app_asignaciones

Asignar un proyecto

## Tech Stack

Python, TypeScript, React, FastAPI, TailwindCSS

## Allowed Libraries

No specific restrictions. Use your judgment.

## Prohibited Libraries

- JQUERY

## Conventions

See `.claude/skills/naming-conventions/SKILL.md` for naming rules.
See `.claude/skills/stack-policy/SKILL.md` for library policies.

### Code Rules

- Strict types: enabled
- Boolean prefixes: enabled

### Usage Rules

- siempre que hagamos requests usamos @lis-data-solutions/lis-query, si hay algún problema y no se encuentra, tanstack query
- las rutas de la aplicación las hacemos con tanstack router
- usaremos SQL alchemy como ORM.

## Custom Rules

- Cualquier archivo con más de 300 líneas de código, lo evaluamos para dividirlo en varios.
- No poner co-author en los commits

## AI Context

La aplicación debe, cuando se crea un proyecto, pedir al usuario las necesidades de perfiles concretos y carga (% por seamana) estimada, y las fechas de inicio y fin. La app debe buscar en las personas disponibles, matchear perfiles y proponerme una asignacion.

## Subagents

The following specialized agents are available for specific tasks:

- **Atlas**: See `.claude/agents/atlas.md` - Arquitecto — Diseño de sistemas y decisiones técnicas
- **Forge**: See `.claude/agents/forge.md` - Refactor — Transformación de código y mejora de estructura
- **Hawk**: See `.claude/agents/hawk.md` - Revisor — Calidad y consistencia de código
- **Muse**: See `.claude/agents/muse.md` - Diseñador — UI/UX y consistencia visual
- **Nova**: See `.claude/agents/nova.md` - Depurador — Diagnóstico de errores y análisis de causa raíz
- **Phoenix**: See `.claude/agents/phoenix.md` - Migración — Actualizaciones, migraciones y modernización
- **Planner**: See `.claude/agents/planner.md` - Planificador — Features complejas y refactorización
- **Sentinel**: See `.claude/agents/sentinel.md` - Seguridad — Detección de vulnerabilidades
- **Voyager**: See `.claude/agents/voyager.md` - Explorador — Descubrimiento de código y análisis de arquitectura

## Commands

Use Claude slash commands for common operations:

- `/commit` - Commit with automatic code review
- `/nebula-login` - Authenticate with Nebula Cloud

## Learning Mode

The role is verified per-user via the API (see Authentication Check above). Claude applies the corresponding expectations below.

### Expectations by Role

**Junior (Assistive Mode):**
- DO NOT write complete implementations — the developer must write the code
- Create function/method scaffolds with descriptive signatures
- Inside function bodies, write pseudocode as comments explaining the steps
- Point to specific files, hooks, components, or utilities the developer should use
- Mention relevant props, parameters, or patterns they should look at
- Reference documentation or existing code examples in the project
- Explain the "why" behind architectural decisions
- If the developer asks for a full solution, remind them of their learning mode

**Senior:**
- Be concise, skip basics
- Focus on edge cases and risks
- Challenge assumptions when relevant
- Provide complete implementations
