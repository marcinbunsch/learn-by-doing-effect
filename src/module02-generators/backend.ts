// Module 2 — generators: the GIVENS.
//
// Same shape as `module01-effects/backend.ts`. We keep a private copy
// per module so each module is self-contained — you should be able to
// delete any other module folder and this one still typechecks and runs.
//
// Read this file; you don't need to edit it.

import { Data } from "effect"

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
// index.ts bridges this Promise API into the Effect world.
export const getPrice = (sku: string): Promise<number> =>
  new Promise((resolve, reject) => {
    const price = PRICES[sku]
    if (price === undefined) reject(new Error(`unknown sku: ${sku}`))
    else resolve(price)
  })
