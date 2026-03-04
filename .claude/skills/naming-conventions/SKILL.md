---
name: "Naming Conventions"
description: "Variable and function naming rules"
---

# Naming Conventions

## Approved Naming Styles

- `camelCase`
- `PascalCase`

## Variables

- Use descriptive names that reveal intent
- Avoid single-letter names except in loops (`i`, `j`, `k`)
- Constants use `SCREAMING_SNAKE_CASE`

## Boolean Variables

Boolean variables and functions MUST use descriptive prefixes:
- `is` — state: `isLoading`, `isValid`
- `has` — possession: `hasPermission`, `hasError`
- `should` — intent: `shouldRetry`, `shouldValidate`
- `can` — ability: `canEdit`, `canDelete`
## Custom Rules

- Cualquier archivo con más de 300 líneas de código, lo evaluamos para dividirlo en varios.
- No poner co-author en los commits
