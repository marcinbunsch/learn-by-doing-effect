// Test suite for Module 2 — generators.
//
// Same skeleton as Module 1: run the same assertions against the learner's
// `./index.ts` and the committed `./reference.ts`. The pipe-form fold
// lives in Module 1 — read it side-by-side in another tab to feel the
// desugaring.

import { describe, expect, it } from "vitest"
import { Cause, Effect, Exit, Option } from "effect"

import * as userImpl from "./index.ts"
import * as referenceImpl from "./reference.ts"

interface Contract {
  readonly PriceLookupError: new (args: { readonly sku: string }) => {
    readonly _tag: "PriceLookupError"
    readonly sku: string
  }
  readonly PRICES: Record<string, number>
  readonly fetchPrice: (sku: string) => Effect.Effect<number, { _tag: "PriceLookupError" }>
  readonly lineTotal: (line: {
    sku: string
    qty: number
  }) => Effect.Effect<number, { _tag: "PriceLookupError" }>
  readonly orderTotal: (order: {
    items: Array<{ sku: string; qty: number }>
  }) => Effect.Effect<number, { _tag: "PriceLookupError" }>
  readonly program: Effect.Effect<number, { _tag: "PriceLookupError" }>
}

const impls: ReadonlyArray<readonly [string, Contract]> = [
  ["reference", referenceImpl as Contract],
  ["user", userImpl as unknown as Contract],
]

describe.each(impls)("%s", (_name, impl) => {
  describe("PRICES", () => {
    it("contains the agreed-upon SKUs at the agreed-upon prices", () => {
      expect(impl.PRICES).toEqual({ widget: 10, gadget: 25, gizmo: 5 })
    })
  })

  describe("fetchPrice (gen)", () => {
    it("resolves to the price for a known SKU", async () => {
      const price = await Effect.runPromise(impl.fetchPrice("widget"))
      expect(price).toBe(10)
    })

    it("fails with a PriceLookupError for an unknown SKU", async () => {
      const exit = await Effect.runPromiseExit(impl.fetchPrice("nope"))
      expect(Exit.isFailure(exit)).toBe(true)
      if (Exit.isFailure(exit)) {
        const err = Option.getOrThrow(Cause.findErrorOption(exit.cause))
        expect(err).toMatchObject({ _tag: "PriceLookupError", sku: "nope" })
      }
    })
  })

  describe("lineTotal (gen)", () => {
    it("multiplies price by qty for a known SKU", async () => {
      const total = await Effect.runPromise(impl.lineTotal({ sku: "gadget", qty: 4 }))
      expect(total).toBe(100)
    })

    it("propagates the lookup failure for an unknown SKU", async () => {
      const exit = await Effect.runPromiseExit(impl.lineTotal({ sku: "nope", qty: 1 }))
      expect(Exit.isFailure(exit)).toBe(true)
    })
  })

  describe("orderTotal (gen)", () => {
    it("sums every line's total", async () => {
      const total = await Effect.runPromise(
        impl.orderTotal({
          items: [
            { sku: "widget", qty: 3 }, // 30
            { sku: "gadget", qty: 2 }, // 50
            { sku: "gizmo", qty: 4 }, // 20
          ],
        }),
      )
      expect(total).toBe(100)
    })

    it("is zero for an empty order", async () => {
      const total = await Effect.runPromise(impl.orderTotal({ items: [] }))
      expect(total).toBe(0)
    })

    it("fails if any item has an unknown SKU", async () => {
      const exit = await Effect.runPromiseExit(
        impl.orderTotal({
          items: [
            { sku: "widget", qty: 1 },
            { sku: "nope", qty: 1 },
            { sku: "gadget", qty: 1 },
          ],
        }),
      )
      expect(Exit.isFailure(exit)).toBe(true)
    })
  })

  describe("program", () => {
    it("runs to a number", async () => {
      const result = await Effect.runPromise(impl.program)
      expect(typeof result).toBe("number")
      expect(Number.isFinite(result)).toBe(true)
    })
  })
})
