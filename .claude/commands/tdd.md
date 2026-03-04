# /tdd

Verify TDD coverage: find code without tests, run the test suite, and report gaps.

## Usage

```
/tdd                 (analyzes the entire project)
/tdd packages/api    (analyzes only that directory)
```

## Behavior

### Phase 1: Discover project structure
1. Identify the project type and test framework:
   - Python → look for `pytest`, `pyproject.toml`, `conftest.py`
   - TypeScript/JavaScript → look for `vitest`, `jest`, `package.json` test scripts
   - Check for monorepo structure (`packages/`, `apps/`)
2. If a specific directory was passed as argument, scope all analysis to that directory
3. Map source directories to their corresponding test directories

### Phase 2: Check test coverage
4. For each source file (`.py`, `.ts`, `.tsx`, excluding tests/configs/migrations):
   - Check if a corresponding test file exists (e.g., `auth.py` → `test_auth.py` or `auth.test.ts`)
   - For files WITH tests, check if the test file imports/references the key exports (classes, functions)
   - Classify each file:
     - **covered**: test file exists and covers the main exports
     - **partial**: test file exists but misses important exports
     - **uncovered**: no test file at all
5. Skip files that don't need tests:
   - `__init__.py`, `conftest.py`, `index.ts` (re-exports only)
   - Migration files, config files, type-only files
   - Generated files, `.d.ts` files

### Phase 3: Run test suite
6. Run the test suite for the target scope:
   - Python: `python -m pytest {scope} --tb=short -q`
   - TypeScript: `npx vitest run {scope}`
7. Capture: total tests, passed, failed, errors
8. If any tests fail, note them but continue (coverage check is the priority)

### Phase 4: Report
9. Display a structured report:

```
══════════════════════════════════════════════════
            TDD COVERAGE REPORT
══════════════════════════════════════════════════

── Test Suite ───────────────────────────────────
  Total: {total} | Passed: {passed} | Failed: {failed}

── Coverage Summary ─────────────────────────────
  Archivos con tests:     {covered}/{total_files} ({percentage}%)
  Cobertura parcial:      {partial}
  Sin tests:              {uncovered}

── Archivos sin tests ───────────────────────────
[List each uncovered file with its key exports:]
  ✗ src/services/auth.py
    → Exports: AuthService, validate_token, create_session
    → Sugerencia: Crear test_auth.py con tests para AuthService

  ✗ src/hooks/useSearch.ts
    → Exports: useSearch
    → Sugerencia: Crear useSearch.test.ts

── Cobertura parcial ────────────────────────────
[List each partially covered file:]
  ⚠ src/api/router.py (test exists but misses: delete_item, bulk_update)
    → Sugerencia: Añadir tests para delete_item y bulk_update

── Tests fallidos ───────────────────────────────
[If any tests failed:]
  ✗ test_auth.py::test_expired_token — AssertionError
  ✗ useSearch.test.ts::filters results — expected 3, got 0

══════════════════════════════════════════════════
```

10. End with a summary sentence in Spanish: overall TDD health assessment

## Important

- ALL output MUST be in Spanish
- Focus on business logic files, not configuration or boilerplate
- A file with just type definitions or re-exports does NOT need its own test
- "Partial coverage" means the test file exists but skips important functions/classes
- When suggesting what to test, be specific about WHICH exports need tests
- Run the actual test suite — don't just check for file existence
- If the scope is a monorepo, respect package boundaries (don't mix test runners)
