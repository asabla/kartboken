---
name: update-agents-md
description: Review and update Kartboken's AGENTS.md when repository structure, commands, architecture boundaries, or durable engineering conventions change.
---

# Update AGENTS.md

Keep agent guidance short, accurate, and useful after the current task is forgotten.

## Workflow

1. Inspect the current tree, package scripts, configuration, and nearby documentation. Treat repository evidence as authoritative.
2. Separate verified current facts from proposed future work. Put only current facts and durable conventions in `AGENTS.md`.
3. Check every path, command, and linked skill. Remove stale guidance rather than preserving it for history.
4. Keep detailed or occasional procedures in a focused skill under `.agents/skills`; link that skill from `AGENTS.md`.
5. Edit with concise, tool-neutral prose. Avoid task logs, temporary branch details, duplicated README content, and time estimates.

## Review passes

Read the result five times, once for each concern:

1. Repository accuracy: paths, architecture, and ownership match the tree.
2. Command accuracy: every documented command is runnable.
3. Safety: data provenance, static-runtime, and compatibility boundaries remain explicit.
4. Scope: guidance is durable and repository-specific.
5. Clarity: a new agent can find the right code and verification path quickly.

Run the checks affected by any command or structure change. If only prose changed, still verify referenced files and package scripts exist.

