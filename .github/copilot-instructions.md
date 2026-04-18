# Repository Copilot Instructions

When working in this repository, treat the .agents folder as authoritative guidance.

## Preferred Guidance Sources

1. .agents/skills/\*/SKILL.md
2. .agents/prompts/\*.md

## Operating Rules

1. Before executing a workflow prompt, read the matching SKILL.md from .agents/skills.
2. When a matching prompt exists in .agents/prompts, follow it as the canonical template.
3. Avoid duplicating long prompt content in .github/prompts; keep slash prompt files as thin wrappers.
4. If guidance conflicts, prioritize SKILL.md over prompt prose.
5. If no matching .agents file exists, proceed with standard repository instructions.

## Note On Slash Commands

Copilot slash commands are discovered from .github/prompts/\*.prompt.md. There is no wildcard auto-import that turns all .agents files into slash commands automatically.
