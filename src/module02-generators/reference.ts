// Reference implementation for Module 2 — generators.
//
// Same contract as the learner's index.ts. The suite runs against both.
// You're on the honor system not to read this until you've finished your
// own attempt.
//
// The Module 1 reference does the same job in pipe + flatMap style;
// reading the two files side-by-side is the whole point of Module 2.

import { Effect } from "effect"
import { getPrice, PriceLookupError } from "./backend.ts"

export { PriceLookupError, PRICES } from "./backend.ts"

// `Effect.gen` takes a generator function. Inside, `yield* effect` runs
// `effect`, binds its success value, and short-circuits on failure with
// the same error type. The result of the whole `gen(...)` call is an
// `Effect<A, E, R>` where A is the return type of the generator.
//
// Here, `Effect.tryPromise(...)` returns Effect<number, PriceLookupError>.
// `yield*` on it gives us a `number`. We just return it.
export const fetchPrice = (sku: string): Effect.Effect<number, PriceLookupError> =>
  Effect.gen(function* () {
    const price = yield* Effect.tryPromise({
      try: () => getPrice(sku),
      catch: () => new PriceLookupError({ sku }),
    })
    return price
  })

// Top-to-bottom: read the price, multiply, return. No nested `.map` or
// callback shape — just a sequential block. Failure of `fetchPrice`
// propagates up automatically because `yield*` short-circuits.
export const lineTotal = (line: {
  sku: string
  qty: number
}): Effect.Effect<number, PriceLookupError> =>
  Effect.gen(function* () {
    const price = yield* fetchPrice(line.sku)
    return price * line.qty
  })

// Now you can write the fold as an actual `for` loop with mutation —
// the gen block's effects are sequential by definition. Any `lineTotal`
// failure aborts the loop and the whole gen with that error.
export const orderTotal = (order: {
  items: Array<{ sku: string; qty: number }>
}): Effect.Effect<number, PriceLookupError> =>
  Effect.gen(function* () {
    let sum = 0
    for (const item of order.items) {
      sum += yield* lineTotal(item)
    }
    return sum
  })

const sampleOrder = {
  items: [
    { sku: "widget", qty: 3 }, // 30
    { sku: "gadget", qty: 2 }, // 50
    { sku: "gizmo", qty: 4 }, // 20
  ],
}

export const program: Effect.Effect<number, PriceLookupError> = Effect.gen(function* () {
  const total = yield* orderTotal(sampleOrder)
  return total
})
