// Reference implementation for Module 1 — effects.
//
// This file is committed to the repo. The test suite (index.test.ts) runs
// the same assertions against both this file and the learner's index.ts,
// so both implementations are forced to match the same public contract.
//
// The learner is on the honor system not to read this until they've
// finished their own implementation.

import { Effect, pipe } from "effect"
import { getPrice, PriceLookupError } from "./backend.ts"

// Re-export so the test suite reads the contract straight off this file.
export { PriceLookupError, PRICES } from "./backend.ts"

// Effect.tryPromise wraps a possibly-rejecting promise. The `catch` field
// maps the unknown rejection into our typed PriceLookupError. The result
// has type Effect<number, PriceLookupError, never>.
export const fetchPrice = (sku: string): Effect.Effect<number, PriceLookupError> =>
  Effect.tryPromise({
    try: () => getPrice(sku),
    catch: () => new PriceLookupError({ sku }),
  })

// Effect.map transforms the success value (price -> price * qty) without
// touching the error channel. The line total still fails with the same
// PriceLookupError if the lookup fails.
export const lineTotal = (line: {
  sku: string
  qty: number
}): Effect.Effect<number, PriceLookupError> =>
  pipe(
    fetchPrice(line.sku),
    Effect.map((price) => price * line.qty),
  )

// Sum the line totals. We fold over the items using `flatMap` to chain
// each line's effect into a running sum. `Effect.tap` lets us observe
// each per-line subtotal without changing the value flowing through.
export const orderTotal = (order: {
  items: Array<{ sku: string; qty: number }>
}): Effect.Effect<number, PriceLookupError> =>
  order.items.reduce<Effect.Effect<number, PriceLookupError>>(
    (acc, item) =>
      pipe(
        acc,
        Effect.flatMap((sumSoFar) =>
          pipe(
            lineTotal(item),
            Effect.tap(() => Effect.sync(() => {})), // placeholder for logging
            Effect.map((lt) => sumSoFar + lt),
          ),
        ),
      ),
    Effect.succeed(0),
  )

// The runnable demo. `pnpm run:effects` boots src/effects/index.ts (the
// learner's file), not this one — but exporting `program` here lets the
// test suite verify it runs to a number.
const sampleOrder = {
  items: [
    { sku: "widget", qty: 3 }, // 30
    { sku: "gadget", qty: 2 }, // 50
    { sku: "gizmo", qty: 4 }, // 20
  ],
}

export const program: Effect.Effect<number, PriceLookupError> = pipe(
  orderTotal(sampleOrder),
  Effect.tap((total) =>
    Effect.sync(() => {
      console.log(`Order total: ${total}`)
    }),
  ),
)
