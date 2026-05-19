# Handoff — Effect Curriculum

## What was done

A full learning curriculum for the Effect (TypeScript, v4 beta) library was designed and written to `CURRICULUM.md`. The curriculum was shaped through a structured interview covering:

- **Background:** Solid TypeScript, new to functional programming
- **Goal:** Build real, production-quality backend apps
- **Depth:** Everything — including low-level internals (Channel, Fiber, Cause, etc.)
- **Format:** One runnable mini-app per module (`pnpm <folder>`)
- **Scope:** Full ecosystem — core, platform (HTTP, CLI, FS), AI, Cluster
- **Ordering:** Foundation-first (no concept before its dependencies)
- **Version:** Effect v4 beta throughout

## Key artifacts

- **`CURRICULUM.md`** — the full 29-module curriculum with concept lists, mini-app descriptions, and a progress tracker. This is the source of truth.
- **`effect-smol/`** — git submodule containing Effect v4 source and `ai-docs/`. Use this as the API reference when building modules.
- **`CLAUDE.md`** — project instructions (role, run commands, doc conventions).

## Current state

- `src/` was cleared by the user. It is empty and ready for module implementation.
- No modules have been built yet.

## What to do next

Build the curriculum modules one at a time, starting from **Module 1: `effects`**.

### Module 1 spec (from CURRICULUM.md)
- **Folder:** `src/effects/index.ts`
- **Run with:** `pnpm effects`
- **Concepts:** Creating effects, `pipe`, `Effect.gen` (generators), `Effect.map`, `Effect.flatMap`, running with `runPromise`/`runSync`/`runFork`
- **Mini-app:** Number guessing game — generate a random number, prompt the user, loop until correct

### Conventions to follow
- Check `effect-smol/ai-docs/` first for API patterns, then `effect-smol/packages/` for source
- Run `pnpm check` before committing (typecheck + lint + format)
- Each module is a single `src/<folder>/index.ts` runnable with `pnpm <folder>`
- Add `pnpm <folder>` script to `package.json` when creating each module
- Effect 4 beta APIs — prefer generator style (`Effect.gen`) over pipe chains where it improves readability

## Suggested skills for next session

- No special skills needed to start building — just read, write, and bash tools
- `/simplify` after building each module to review for quality and Effect idioms
- `/grill-me` if the scope of any individual module needs further design before building
