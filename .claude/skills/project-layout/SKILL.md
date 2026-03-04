---
name: "Project Layout"
description: "Directory structure guidelines"
---

# Project Layout

## Directory Structure Guidelines

- Follow feature-based organization over type-based
- Keep related files close together
- Use index files for public API of each module
- Separate concerns: logic, data, and types
- Tests: colocated with source files (`*.test.*`)

## Frontend Conventions

- Components: `src/components/` or `src/features/*/components/`
- Pages/Routes: `src/pages/` or `src/routes/`
- Hooks: `src/hooks/` or colocated with features
- Types: colocated with usage or `src/types/`
- Utils: `src/lib/` or `src/utils/`

## Python Conventions

- Apps: `packages/<app>/` or `<app>/` with `models.py`, `views.py`, `urls.py`
- Tests: `<app>/tests/` with `test_*.py` naming
- Schemas: colocated with routers or in `schemas.py`
- Migrations: auto-generated, do not edit manually
- Utils: `<app>/utils.py` or `core/utils.py`
