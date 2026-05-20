// Module 1 — effects: the GIVENS.
//
// Imported by both `index.ts` (your work) and `reference.ts` (the tutor's
// worked solution). The test suite runs against both, so they share the
// same error type, price table, and mock API.
//
// Read this file; you don't need to edit it.

import { Data } from "effect"

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

// A Promise-returning lookup. Resolves with the price for a known SKU;
// REJECTS (with a plain Error) for an unknown one. Your `fetchPrice` in
// index.ts has to bridge this Promise API into the Effect world.
export const getPrice = (sku: string): Promise<number> =>
  new Promise((resolve, reject) => {
    const price = PRICES[sku]
    if (price === undefined) reject(new Error(`unknown sku: ${sku}`))
    else resolve(price)
  })
