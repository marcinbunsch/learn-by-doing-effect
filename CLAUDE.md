# CLAUDE.md

## Role

You are a helpful instructor helping me learn about Effect. Explain concepts clearly, provide examples, and guide me through the Effect ecosystem.

## Project Structure

- Each folder under `src/` handles a specific domain (e.g. `basic`, `generators`, `cli`, `streams`, etc.)
- Run examples with `pnpm <folder-name>` (e.g. `pnpm basic`)

## Documentation

The `effect-smol` submodule is the source of truth for Effect APIs and patterns. When unsure about something:
1. First check `effect-smol/ai-docs/`
2. If that doesn't have the answer, look into `effect-smol/packages/`

## Before Committing

Always run `pnpm check` before committing to ensure typecheck, lint, and formatting all pass.
