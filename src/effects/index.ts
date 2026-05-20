/**
 * Module 1 — effects
 *
 * Goal: build an async order pricing pipeline.
 *
 *   - A mock backend exposes prices for three SKUs:
 *       { widget: 10, gadget: 25, gizmo: 5 }
 *     It's a Promise-returning function that REJECTS for any other SKU.
 *   - Wrap that Promise API into an Effect.
 *   - Given a line { sku, qty }, compute its total (price × qty).
 *   - Given an order { items: [{ sku, qty }, ...] }, sum all line totals.
 *   - Expose a runnable `program` that prints the total of a sample order.
 *
 * Concepts this module exercises:
 *   - The Effect<A, E, R> type — success, error, requirements channels.
 *   - Effect.succeed, Effect.fail
 *   - Effect.sync, Effect.promise, Effect.tryPromise
 *   - pipe, Effect.map, Effect.flatMap, Effect.tap
 *   - Effect.runPromise / runSync / runFork
 *
 * NOTE: `Effect.gen` is intentionally OUT OF SCOPE for this module. You'll
 * meet it in Module 2 (`generators`) and re-implement this pipeline using
 * it there. For now, compose everything with pipe + flatMap.
 *
 * Commands:
 *   pnpm run:effects     # runs `program`
 *   pnpm test:effects    # runs the suite against this file AND reference.ts
 */

import { Data, Effect } from "effect"

// ────────────────────────────────────────────────────────────────────────────
// Contract — the shapes the test suite pins down.
//
// The error class and PRICES table ARE the spec — they have to match
// exactly, so they're declared here. Everything below this section is
// yours to fill in.
// ────────────────────────────────────────────────────────────────────────────

// `Data.TaggedError("Tag")<{ fields }>` builds an error class with a
// readonly `_tag = "Tag"` discriminator, structural equality, and the
// fields you list. Construct with `new PriceLookupError({ sku: "..." })`
// — note the OBJECT argument, not positional.
export class PriceLookupError extends Data.TaggedError("PriceLookupError")<{
  readonly sku: string
}> {}

export const PRICES: Record<string, number> = {
  widget: 10,
  gadget: 25,
  gizmo: 5,
}

// ────────────────────────────────────────────────────────────────────────────
// Your job — replace the placeholder bodies below.
//
// Each export's signature is the contract. The body of each placeholder
// throws so a missing implementation surfaces as a sharp test failure
// rather than a confusing "is not a function". Replace, don't add to.
// ────────────────────────────────────────────────────────────────────────────

export const fetchPrice = (sku: string): Effect.Effect<number, PriceLookupError> => {
  throw new Error(`fetchPrice(${sku}): not implemented`)
}

export const lineTotal = (line: {
  sku: string
  qty: number
}): Effect.Effect<number, PriceLookupError> => {
  throw new Error(`lineTotal(${JSON.stringify(line)}): not implemented`)
}

export const orderTotal = (order: {
  items: Array<{ sku: string; qty: number }>
}): Effect.Effect<number, PriceLookupError> => {
  throw new Error(`orderTotal(items=${order.items.length}): not implemented`)
}

// `program` is a VALUE (an Effect), not a function — fill it in by
// replacing the right-hand side with your wired-up pipeline.
export const program: Effect.Effect<number, PriceLookupError> = Effect.succeed(1)
