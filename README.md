# learnspace-effect

A personal workspace for learning [Effect](https://effect.website) (v4) by
writing the code myself, one curriculum module at a time, with Claude Code
acting as a tutor.

## How it works

The curriculum lives in [`CURRICULUM.md`](./CURRICULUM.md): 32 modules across
seven tracks plus a capstone, each module focused on one concept (effects,
generators, error handling, services, layers, schedules, streams, etc.).

Each module is one folder under `src/`, named `moduleNN-<topic>`:

```
src/module01-effects/
  index.ts        # I write this — the exercise
  reference.ts    # the tutor's worked solution
  index.test.ts   # the same suite, run against both
  backend.ts      # any shared "givens" the module needs
```

The test file uses `describe.each` to run the same assertions against
**both** `index.ts` and `reference.ts`. That forces both implementations
to honour one public contract — the contract IS the learning objective.

## Tutoring loop

1. I write code in `src/<module>/index.ts`.
2. I run it (`pnpm run:<module>`) and the tests (`pnpm test:<module>`).
3. I ask the tutor (Claude) questions; it explains, points at docs, gives
   small illustrative snippets — but does not edit my `index.ts`.
4. Repeat until the suite passes for both implementations.

The rules the tutor follows are encoded in [`CLAUDE.md`](./CLAUDE.md).

## Commands

```sh
pnpm install                       # bootstrap
pnpm check                         # typecheck + lint + format, in parallel
pnpm test                          # run all module suites
pnpm run:module01                  # run that module's program
pnpm test:module01                 # run that module's test suite
```

## Stack

- **Effect** v4 (`4.0.0-beta.64`)
- **TypeScript** via [`@typescript/native-preview`](https://github.com/microsoft/typescript-go) (`tsgo`)
- **Runtime**: Node with `--experimental-strip-types` (no build step)
- **Tests**: [Vitest](https://vitest.dev)
- **Lint / format**: [oxlint](https://oxc.rs) + [oxfmt](https://oxc.rs)
- **`effect-smol` submodule** is checked in as the source of truth for v4
  APIs (see [`effect-smol/ai-docs/`](./effect-smol/ai-docs/) first).
