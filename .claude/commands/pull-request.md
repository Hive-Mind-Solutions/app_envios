# /pull-request

Create a Pull Request, review the code quality, and submit the score to Nebula.

## Usage

```
/pull-request
```

## Behavior

### Phase 1: Pre-PR checks
1. Run `git status` to check for uncommitted changes
2. If there are uncommitted changes, warn the user and ask if they want to commit first (suggest using `/commit`). If they decline, **STOP**
3. Run `git log origin/main..HEAD --oneline` to see commits that will be in the PR
4. If there are no commits ahead of main, inform the user and **STOP**
5. Run `git diff origin/main...HEAD --stat` to get a summary of all changes

### Phase 2: Create the Pull Request
6. Generate a PR title and description from the commits:
   - **Title**: Short (under 70 chars), describes the overall change
   - **Body**: Summary of changes in bullet points, test plan if relevant
7. Ask the user: "Crear PR con este título: {title}?" — if denied, let them edit
8. Push the current branch if it's not already pushed: `git push -u origin {branch_name}`
9. Create the PR:

```bash
gh pr create --title "{title}" --body "$(cat <<'EOF'
## Summary
{bullet_points}

## Test plan
{test_plan}

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

10. Extract `pr_number`, `pr_title`, `pr_url` from the created PR. Then get the actual PR author (the GitHub/GitLab **username** of the person who opened the PR, NOT the repo owner/org): `gh pr view {pr_number} --json author --jq '.author.login'`. Store this as `author`.

### Phase 3: Review — Get the diff
11. Run: `gh pr diff {pr_number}`
12. If the diff is very large (>2000 lines), focus on the most critical files

### Phase 4: Review — Analyze quality
13. Analyze the diff across **5 categories**, each starting at 100 points:

| Category | Weight | What to look for |
|---|---|---|
| **security** | 25% | Vulnerabilidades, secrets hardcodeados, inyección (SQL/XSS/cmd), autenticación/autorización débil, validación de input insuficiente |
| **testing** | 25% | Código sin tests, tests que no cubren edge cases, assertions débiles, mocks excesivos, tests frágiles, código no testeable |
| **correctness** | 20% | Errores lógicos, edge cases no manejados, error handling incompleto, race conditions, null/undefined issues |
| **maintainability** | 15% | Complejidad ciclomática alta, código duplicado, naming confuso, funciones muy largas (>50 líneas) |
| **coherence** | 15% | Convenciones del proyecto no seguidas, separación de concerns rota, diseño de API inconsistente, imports innecesarios |

14. For each category, deduct points per finding based on severity:

| Severity | Deduction range |
|---|---|
| critical | -20 to -30 |
| high | -10 to -20 |
| medium | -5 to -10 |
| low | -2 to -5 |
| info | 0 |

15. For each finding, record:
   - `file_path`: relative path to the file
   - `line_number`: specific line (or null if general)
   - `severity`: one of critical, high, medium, low, info
   - `message`: description of the issue (in Spanish)
   - `suggestion`: how to fix it (in Spanish)

16. Clamp each category score to 0-100

### Phase 5: Show Results
17. Display a formatted report:

```
══════════════════════════════════════════════════
    PULL REQUEST #{pr_number} — QUALITY REVIEW
══════════════════════════════════════════════════

{pr_title}
URL: {pr_url}
Autor: {author}

── Puntuaciones ─────────────────────────────────
  Security        {score}/100  (peso: 25%)
  Testing         {score}/100  (peso: 25%)
  Correctness     {score}/100  (peso: 20%)
  Maintainability {score}/100  (peso: 15%)
  Coherence       {score}/100  (peso: 15%)

── Qué mejorar ──────────────────────────────────
[For each finding, grouped by category:]
  [{severity}] {file_path}:{line_number}
    {message}
    → {suggestion}

══════════════════════════════════════════════════
```

18. Write a brief summary in Spanish (2-4 sentences) of the overall quality
19. If there are findings with severity critical or high, explicitly list them as **"Cosas a mejorar antes de merge"**

### Phase 6: Submit to Nebula
20. Read `nebula.json` from the project root to get `apiUrl` and `projectId`
21. Read `~/.nebula/session.json` to get `token`
22. If both files exist, POST to the quality submit endpoint:

```bash
curl -s -X POST "{apiUrl}/projects/{projectId}/quality/submit" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "pr_number": {pr_number},
    "pr_title": "{pr_title}",
    "pr_url": "{pr_url}",
    "author": "{author}",
    "summary": "{generated_summary}",
    "categories": [
      {
        "category": "security",
        "score": {score},
        "findings": [{...}]
      },
      {
        "category": "testing",
        "score": {score},
        "findings": [{...}]
      },
      {
        "category": "correctness",
        "score": {score},
        "findings": [{...}]
      },
      {
        "category": "maintainability",
        "score": {score},
        "findings": [{...}]
      },
      {
        "category": "coherence",
        "score": {score},
        "findings": [{...}]
      }
    ]
  }'
```

23. If the POST fails or nebula.json doesn't exist, **continue silently** — submission is optional

### Phase 7: Close Jira Epic (if applicable)
24. Check if there are Jira MCP tools available (mcp-atlassian)
25. If yes, search for Jira tasks mentioned in the PR commits or branch name using `jira_search`
26. Find the **parent Epic** of those tasks (check the epic link field)
27. If an epic is found and ALL its child tasks are in "Done" status:
    - Add a comment on the epic: "Cerrado automáticamente por PR #{pr_number}: {pr_title}"
    - **Transition the epic to "Done"** using `jira_transition_issue`
28. If no Jira tools available or no epic found, skip silently

29. Show the user a final success message with the PR URL and the quality score

## Important

- The quality submission is best-effort — never fail the PR because of it
- The Jira epic closure is best-effort — never fail the PR because of it
- ALL messages, findings and summaries MUST be in Spanish
- Be thorough but fair — don't penalize style preferences, only real issues
- A score of 100 is possible if the PR has no issues
- Focus on the DIFF only, not the entire codebase
- Never push to main/master directly — always create a branch PR
- Always ask the user before creating the PR (show title + description first)
