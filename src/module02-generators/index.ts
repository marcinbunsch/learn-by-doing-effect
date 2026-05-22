/**
 * Module 2 — generators
 *
 * What you're building
 * --------------------
 * The SAME order-pricing calculator you wrote in Module 1, but expressed
 * with `Effect.gen` instead of `pipe` + `flatMap`. The whole point is to
 * feel that `gen` is **syntactic sugar** over the chain you already built
 * by hand — nothing more, nothing less.
 *
 * The price list, the `PriceLookupError`, and the Promise-returning
 * `getPrice` mock all live in `backend.ts` — identical to Module 1.
 *
 * What's different about this module
 * ----------------------------------
 * `fetchPrice`, `lineTotal`, and `orderTotal` should be written as
 * `Effect.gen(function* () { ... })` blocks. Inside a gen block, you
 * `yield*` an `Effect<A, E>` to get its success `A` (or short-circuit
 * with `E` if it fails). Think of `yield*` as the effectful `await`.
 *
 * Side-by-side comparison
 * -----------------------
 * To feel that gen is sugar over flatMap, open your Module 1 solution
 * (`src/module01-effects/index.ts`) next to this file. Same contract,
 * same data, two different forms of the same fold. The gen `for-of`
 * loop on the right should desugar into the nested `flatMap` chain
 * on the left by eye.
 *
 * Concept ladder
 * --------------
 *   - `Effect.gen(function* () { ... })`  →  a generator function whose
 *     body looks imperative.
 *   - `const x = yield* eff`              →  run `eff`, bind its success
 *     to `x`. If `eff` fails, the gen block short-circuits with that
 *     same failure.
 *   - `return value`                      →  the success value of the
 *     whole gen block.
 *   - `yield* new MyTaggedError(...)`     →  `Data.TaggedError` instances
 *     are themselves yieldable; this fails the gen block with that error.
 *     (Equivalent to `yield* Effect.fail(new MyTaggedError(...))`.)
 *
 * Out of scope
 * ------------
 *   - Error handling combinators (`catchTag`, `catchAll`, `Cause` inspection)
 *     are Module 3.
 *   - `Effect.all` and parallelism are Module 11.
 *
 * Commands
 * --------
 *   pnpm run:module02     # runs `program`
 *   pnpm test:module02    # runs the suite against this file AND reference.ts
 */

import { Effect } from "effect"
import { PriceLookupError } from "./backend.ts"
// You'll need these as well — uncomment when you start filling things in:
// import { getPrice } from "./backend.ts"

// Re-exported so the test suite can assert on the shared contract.
export { PriceLookupError, PRICES } from "./backend.ts"

// ────────────────────────────────────────────────────────────────────────────
// Your job — replace the placeholder bodies below.
//
// Each export's signature is the contract. The body of each placeholder
// throws so a missing implementation surfaces as a sharp test failure
// rather than a confusing "is not a function". Replace, don't add to.
// ────────────────────────────────────────────────────────────────────────────

// `fetchPrice` in gen form. The body is just one `yield*` — trivially
// equivalent to the Module 1 version. It's here so you've seen the gen
// shape at least once on the simplest possible effect.
export const fetchPrice = (sku: string): Effect.Effect<number, PriceLookupError> => {
  throw new Error(`fetchPrice(${sku}): not implemented`)
}

// `lineTotal` in gen form. Read the price, multiply by qty, return.
// Compare against the Module 1 pipe-form line total — they should be
// the same logic, but the gen version reads top-to-bottom.
export const lineTotal = (line: {
  sku: string
  qty: number
}): Effect.Effect<number, PriceLookupError> => {
  throw new Error(`lineTotal(${JSON.stringify(line)}): not implemented`)
}

// `orderTotal` in gen form. A natural shape is a `for (const item of ...)`
// loop with a `let sum = 0` accumulator and a `yield*` on each
// `lineTotal(item)`. Compare with your Module 1 `orderTotal` for the
// pipe/flatMap form of the same fold.
export const orderTotal = (order: {
  items: Array<{ sku: string; qty: number }>
}): Effect.Effect<number, PriceLookupError> => {
  throw new Error(`orderTotal(items=${order.items.length}): not implemented`)
}

// `program` is a VALUE (an Effect), not a function. Wire `orderTotal` to
// a sample order. A natural gen form is:
//   Effect.gen(function* () {
//     const total = yield* orderTotal(sampleOrder)
//     return total
//   })
// — but a simple `orderTotal(sampleOrder)` is also fine. The test only
// checks that it runs to a number.
export const program: Effect.Effect<number, PriceLookupError> = Effect.succeed(1)

if (import.meta.main) {
  Effect.runPromise(program).then((total) => {
    console.log(`Order total: ${total}`)
  })
}
