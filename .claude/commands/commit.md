# /commit

Commit changes with automatic code review and activity tracking.

## Usage

```
/commit -m "Your commit message"
/commit (interactive — generates message from diff)
```

## Behavior

### Phase 1: Pre-commit checks
1. Run `git diff --staged --stat` to see staged changes
2. If nothing is staged, inform the user and **STOP**
3. Show a summary of staged files

### Phase 2: Code review (parallel)
4. **Launch Hawk and Sentinel agents IN PARALLEL** using the Task tool:
   - **Hawk** (subagent_type: `Hawk`): Review the staged diff for code quality — bugs, naming, complexity, missing tests
   - **Sentinel** (subagent_type: `Sentinel`): Review the staged diff for security — hardcoded secrets, injection, OWASP issues
   - Pass the output of `git diff --staged` as context to both agents
5. Show findings from both agents in a clear report
6. If there are **CRITICAL or blocker** findings, warn the user and ask if they want to fix first
7. Ask the user: "Proceed with commit?" — if denied, **STOP**

### Phase 3: Commit
8. If the user provided `-m "message"`, use that message
9. Otherwise, generate a concise commit message from the diff (1-2 sentences, imperative mood)
10. Execute the commit following standard git commit rules (HEREDOC format, Co-Authored-By trailer)

### Phase 4: Activity tracking
11. After the commit succeeds, read the commit details:
    - `git log -1 --format="%s%n%n%b"` for the commit message
    - `git diff HEAD~1 --stat` for the file list
12. From the commit, generate:
    - **title**: A descriptive title in Spanish (max 100 chars) summarizing WHAT was done. Examples:
      - "Setup proyecto Django con API de Pokemon y autenticacion"
      - "Implementacion de login con Azure AD y gestion de tokens"
      - "Correccion de tests en modulo de proyectos"
    - **summary**: A short paragraph in Spanish (2-4 sentences) describing the key changes
    - **tags**: Derive from the committed files:
      - Files in `packages/api/` or backend dirs → `"backend"`
      - Files in `packages/web/` or frontend dirs → `"frontend"`
      - Files in `packages/desktop/` → `"desktop"`
      - Files in `packages/core/` → `"core"`
      - Files in `.claude/`, `nebula.json`, `CLAUDE.md`, `.nebula/` → `"nebula"`
13. Read `nebula.json` from the project root to get `apiUrl` and `projectId`
14. Read `~/.nebula/session.json` to get `token` and `user_email`
15. If both files exist, POST to the activity endpoint:

```bash
curl -s -X POST "{apiUrl}/projects/{projectId}/activity" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "commit-{timestamp}",
    "user_email": "{user_email}",
    "started_at": "{commit_date}",
    "ended_at": "{commit_date}",
    "title": "{generated_title}",
    "summary": "{generated_summary}",
    "tags": ["backend", "frontend"],
    "entries": [
      {
        "tool_name": "git-commit",
        "file_path": "{first_file}",
        "function_name": "",
        "change_type": "modify",
        "description": "{commit_message}",
        "timestamp": "{commit_date}"
      }
    ]
  }'
```

16. If the POST fails or nebula.json doesn't exist, **continue silently** — activity tracking is optional
17. Show the user a success message with the commit hash

## Important

- The activity POST is best-effort — never fail the commit because of it
- Title and summary MUST be in Spanish
- Tags are derived from file paths, not guessed
- Always use HEREDOC format for git commit messages
- Never push automatically — this command only commits
