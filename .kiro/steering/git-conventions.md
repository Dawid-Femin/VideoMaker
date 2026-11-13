# Git Commit Conventions

Always use the following commit message format:

```
<type>: <message in English>
```

## Types

| Type | When to use |
|---|---|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `chore` | Tooling, config, dependencies, project setup |
| `docs` | Documentation only |
| `refactor` | Code restructure without behavior change |
| `style` | Formatting, whitespace, no logic change |
| `test` | Adding or updating tests |
| `perf` | Performance improvement |

## Rules

- The part after `:` is always written in **English**
- Use imperative mood: "add", "fix", "remove" — not "added", "fixes"
- Keep the subject line under 72 characters
- No period at the end of the subject line

## Examples

```
feat: add StrokePath animation with strokeDashoffset
fix: correct hand position calculation at path end
chore: init Remotion project with TypeScript
docs: add whiteboard spec and git conventions
refactor: extract pathLength computation to utils
```
