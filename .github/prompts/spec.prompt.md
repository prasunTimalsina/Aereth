---
agent: agent
description: Create a Product Requirements Document from conversation
argument-hint: "[output-filename]"
---

# Create PRD

Use the local .agents files as the single source of truth:

- .agents/prompts/spec.md
- .agents/skills/write-a-prd/SKILL.md

Execution rules:

1. Follow the process and structure defined in those files.
2. If guidance conflicts, prefer .agents/skills/write-a-prd/SKILL.md.
3. Write output to $ARGUMENTS (default: PRD.md).
