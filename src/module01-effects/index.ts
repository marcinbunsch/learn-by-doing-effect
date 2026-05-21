/**
 * Module 1 — effects
 *
 * What you're building
 * --------------------
 * A tiny order-pricing calculator.
 *
 *   - The fake price list (widget=$10, gadget=$25, gizmo=$5) lives in
 *     `backend.ts`, behind an ASYNC API: `getPrice(sku) => Promise<number>`.
 *     It resolves for known SKUs and REJECTS for unknown ones.
 *   - You're given an order — a list of lines like
 *       [{ sku: "widget", qty: 3 }, { sku: "gadget", qty: 2 }].
 *   - line total = price × qty.
 *   - order total = sum of all line totals.
 *   - Print the order total.
 *
 * For the sample order [widget×3, gadget×2, gizmo×4] the answer is
 * 30 + 50 + 20 = 100.
 *
 * Why this app for Module 1
 * -------------------------
 * Every step maps to one Effect primitive:
 *   - bring `getPrice` into Effect-land  →  Effect.tryPromise
 *   - "multiply by qty" on a lookup      →  Effect.map
 *   - sum across lines                   →  Effect.flatMap
 *   - actually run it                    →  Effect.runPromise
 *
 * The four exports below are the pieces you assemble:
 *   fetchPrice  →  wraps getPrice as Effect<number, PriceLookupError>
 *   lineTotal   →  one line's total, built on fetchPrice
 *   orderTotal  →  sum across lines, built on lineTotal
 *   program     →  orderTotal(sampleOrder), ready to run
 *
 * Out of scope for this module
 * ----------------------------
 * Effect.gen — that's Module 2 (`generators`). For now, compose with
 * pipe + map + flatMap.
 *
 * Commands
 * --------
 *   pnpm run:module01-effects     # runs `program`
 *   pnpm test:module01-effects    # runs the suite against this file AND reference.ts
 */

import { Effect, pipe } from "effect"
import { PriceLookupError } from "./backend.ts"
// You'll need this as well
// import { getPrice } from "./backend.ts"

// Re-exported so the test suite can assert on the shared contract.
// (PriceLookupError + PRICES are also used by `reference.ts`.)
export { PriceLookupError, PRICES } from "./backend.ts"

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

if (import.meta.main) {
  Effect.runPromise(
    pipe(
      program,
      Effect.tap((total) =>
        Effect.sync(() => {
          console.log(`Order total: ${total}`)
        }),
      ),
    ),
  )
}
