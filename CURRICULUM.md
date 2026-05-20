# Effect Curriculum

Learning the entire Effect (v4 beta) feature set by building small, useful programs.

**Profile:** Solid TypeScript, new to FP — goal is production-quality backend apps.
**Format:** One runnable mini-app per module (`pnpm run:<folder>`).
**Depth:** Everything, including low-level internals (`Cause`, `Exit`, `Fiber`, `Channel`, `Pull`).
**Ordering:** Foundation-first — no concept introduced before its dependencies.

---

## How to use this curriculum

Each module is a self-contained `src/<folder>/` directory you can run with `pnpm run:<folder>` and test with `pnpm test:<folder>`. Modules are designed to be built (and revisited) in order, because each one assumes the concepts from earlier modules.

For every module you'll see:

- **Dependencies** — modules whose concepts you need first.
- **Concepts** — the APIs and ideas the mini-app exercises.
- **Mini-app** — the runnable program you build to learn them.
- **Outcomes** — what you should be able to do without looking things up after finishing.

Every module ships with a `reference.ts` (committed implementation) and an `index.test.ts` (vitest suite). The same suite runs against both `reference.ts` and your `index.ts`, so:

- the reference proves the suite is valid,
- your `index.ts` is forced to match the same public contract,
- the contract is what you're really learning — not a particular implementation.

You write `index.ts` yourself; the reference is there to consult only when you're stuck (and ideally not even then). If something feels shaky, don't move forward — rebuild the mini-app from a blank file, or extend it with a small variant. The point is fluency, not coverage.

The `effect-smol` git submodule is the source of truth. When a concept is unclear, check `effect-smol/ai-docs/` first, then `effect-smol/packages/effect/src/`.

---

## Track 1 — Foundation

Core building blocks. Everything else depends on this track.

### 1. `module01-effects`
**Dependencies:** none.
**Concepts:** The `Effect<A, E, R>` type (success / error / requirements channels), creating effects (`Effect.succeed`, `Effect.fail`, `Effect.sync`, `Effect.promise`, `Effect.tryPromise`), `Data.TaggedError` for typed failure values, `pipe`, `Effect.map`, `Effect.flatMap`, `Effect.tap`, running with `Effect.runPromise` / `runSync` / `runFork`. (`Effect.gen` is intentionally deferred to Module 2.)
**Mini-app:** Async order pricing pipeline — given a fixed order of `{ sku, qty }` lines, wrap a mocked async price lookup with `Effect.tryPromise` (failing with a `Data.TaggedError`), compute each line total with `map`, sum line totals with `flatMap`, return the order total.
**Outcomes:** You can read an `Effect<A, E, R>` type signature and explain each channel; you can convert a callback / promise API into an effect with a typed error; you can build a multi-step program purely with `pipe` + `flatMap` (no generators yet).

### 2. `generators`
**Dependencies:** 1.
**Concepts:** `Effect.gen`, `yield*` as the effectful analogue of `await`, the mental model of `gen` as syntactic sugar over nested `flatMap`, when to prefer `gen` vs `pipe`.
**Mini-app:** Re-implement Module 1's pricing pipeline in `Effect.gen` style; keep one helper in both `pipe` and `gen` forms so you can read them side-by-side and verify they produce identical results.
**Outcomes:** You can desugar a `gen` block into the equivalent `flatMap` chain by eye; you can pick `gen` vs `pipe` based on readability rather than instinct.

### 3. `errors`
**Dependencies:** 1.
**Concepts:** Typed errors vs defects vs interruption (`Data.TaggedError` is already in your toolkit from Module 1 — here you go deep on what surrounds it), `Effect.catchTag` / `catchTags` / `catchAll` / `catchAllCause`, `Effect.mapError`, `Effect.orElse`, `Effect.either`, `Effect.exit`, the `Cause` and `Exit` types (Fail / Die / Interrupt / Sequential / Parallel), `Option`, `Result` (v4's replacement for `Either`).
**Mini-app:** Safe file parser — reads a file, parses JSON, validates structure, reports typed errors at each stage, distinguishes user-recoverable failures from defects, prints the full `Cause` on unexpected exit.
**Outcomes:** You can model a domain's failures as a tagged union of errors; you can explain the difference between `fail`, `die`, and `interrupt` and inspect them in a `Cause`; you know when to use `Option` vs `Result` vs `Effect`.

### 4. `services`
**Dependencies:** 1, 3.
**Concepts:** The `R` (requirements) channel, `Context.Tag`, `Effect.Service` (v4 class-based service definition), accessing services in `gen`, providing services with `Effect.provideService`, multiple implementations of one tag.
**Mini-app:** Swappable greeting service — a `Greeter` service with two implementations (formal/casual) chosen by an env var at startup.
**Outcomes:** You can define a service interface and at least two interchangeable implementations; you can read a type signature and tell which services an effect needs.

### 5. `layers`
**Dependencies:** 4.
**Concepts:** `Layer<RIn, E, ROut>`, `Layer.succeed`, `Layer.effect`, `Layer.scoped`, `Layer.provide` / `Layer.provideMerge` / `Layer.merge`, dependency graphs, memoization, building a single application layer.
**Mini-app:** Multi-service app — `Logger`, `Config`, and `Database` (mock) services wired together into one app `Layer`, with `Database` depending on `Logger` and `Config`.
**Outcomes:** You can draw the dependency graph of a layer composition and predict initialization order; you understand why layers are memoized.

### 6. `config`
**Dependencies:** 5.
**Concepts:** `Config`, `Config.string` / `number` / `boolean` / `array` / `redacted`, nested configs, `Config.withDefault`, `ConfigProvider`, structured validation errors, `Redacted` (and how it hides from logs).
**Mini-app:** Env-driven config loader — reads a nested app config from env vars, validates it, holds DB password in `Redacted`, prints the config (proving secrets stay hidden).
**Outcomes:** You can replace ad-hoc `process.env` reads with a typed `Config`; you can build a `ConfigProvider` for tests.

### 7. `resources`
**Dependencies:** 5.
**Concepts:** `Scope`, `Effect.acquireRelease`, `Effect.addFinalizer`, `Effect.scoped`, `Layer.scoped`, guaranteed finalization on success / failure / interruption, finalizer ordering.
**Mini-app:** File handle manager — opens files safely, processes them, guarantees cleanup even if processing fails or is interrupted; demonstrates LIFO finalizer order with nested scopes.
**Outcomes:** You can wrap any resource with safe acquire/release; you know when a finalizer runs and when it doesn't.

### 8. `ref`
**Dependencies:** 4.
**Concepts:** `Ref` (atomic mutable state), `Ref.get` / `set` / `update` / `modify`, `SynchronizedRef` (effectful updates with serialization), the difference between `Ref` and just a plain variable.
**Mini-app:** In-memory key-value store — get/set/delete/list operations on a `Ref`-backed store, exposed through a tiny REPL.
**Outcomes:** You can hold shared mutable state safely across concurrent effects; you can explain why `Ref` is needed even in single-threaded JS.

### 9. `schedule`
**Dependencies:** 3, 8.
**Concepts:** `Clock` service, `DateTime`, `Duration`, `Cron`, `Schedule`, `Schedule.exponential` / `jittered` / `recurs` / `fixed` / `spaced`, composing schedules (`&&`, `||`, `andThen`), `Effect.retry`, `Effect.repeat`, `Schedule.intersect` for combining conditions.
**Mini-app:** Resilient HTTP poller — polls a URL on a cron-like schedule, retries on failure with exponential backoff + jitter, logs each attempt with elapsed time from `Clock`.
**Outcomes:** You can build a backoff policy that won't thunder-herd; you know the difference between `retry` and `repeat`.

---

## Track 2 — Concurrency

Effect's fiber-based concurrency model.

### 10. `fibers`
**Dependencies:** 1, 7.
**Concepts:** `Fiber`, `Effect.fork` / `forkScoped` / `forkDaemon`, `Fiber.join` / `await` / `interrupt`, structured concurrency, `FiberSet` / `FiberMap` / `FiberHandle`, `Effect.interruptible` / `uninterruptible`, interruption propagation, supervision.
**Mini-app:** Parallel task runner — runs N tasks concurrently, tracks them in a `FiberSet`, cancels the rest on first failure, prints which fibers were interrupted vs completed.
**Outcomes:** You can fork a background task and know it will be cleaned up; you can explain what happens when a parent fiber is interrupted.

### 11. `concurrency`
**Dependencies:** 10.
**Concepts:** `Effect.all` with `concurrency` options, `Effect.forEach`, `Effect.race` / `raceAll`, `Effect.timeout` / `timeoutOption` / `timeoutFail`, `Effect.zip` / `zipPar`, `Effect.makeSemaphore`, `PartitionedSemaphore` for per-key rate limits.
**Mini-app:** Parallel API fetcher — fetches a list of URLs with bounded concurrency, races the primary against a fallback for the fastest response, applies per-request timeouts, rate-limits per host with a `PartitionedSemaphore`.
**Outcomes:** You can pick the right concurrency primitive for a workload; you can bound parallelism without writing manual queues.

### 12. `queue`
**Dependencies:** 10.
**Concepts:** `Queue` (bounded / unbounded / dropping / sliding), `Queue.offer` / `take` / `takeAll` / `takeUpTo`, `Queue.shutdown`, producer-consumer patterns, backpressure.
**Mini-app:** Background job processor — a producer enqueues work items at varying rates, a pool of N consumer fibers drains the queue concurrently, the queue shuts down cleanly on SIGINT.
**Outcomes:** You can choose between the four queue strategies for a given backpressure requirement.

### 13. `pubsub`
**Dependencies:** 12.
**Concepts:** `PubSub`, `PubSub.subscribe` (returns a scoped `Dequeue`), `PubSub.publish`, fan-out to multiple subscribers, bounded vs unbounded pub/sub, slow subscriber handling.
**Mini-app:** In-process event bus — publishes typed domain events, multiple independent subscribers react (audit log, metrics counter, notifier).
**Outcomes:** You can model decoupled in-process eventing without leaking subscribers.

### 14. `coordination`
**Dependencies:** 10.
**Concepts:** `Deferred` (one-shot fiber-to-fiber promise), `Deferred.await` / `succeed` / `fail`, `Latch` (open/close reusable gate), choosing between them.
**Mini-app:** App startup gate — services signal readiness through a `Deferred`; an HTTP listener waits on a `Latch` so it can be paused/resumed for blue-green style switching.
**Outcomes:** You can coordinate fibers without busy-waiting or sleeping.

---

## Track 3 — Data

Type-safe data modeling and transformation.

### 15. `data-primitives`
**Dependencies:** 3.
**Concepts:** `Data.struct` / `Data.tagged` / `Data.TaggedClass`, structural equality with `Equal` and `Hash`, `Brand` (nominal types via `Schema.brand` or `Brand.refined`), `Newtype`, immutable records, `Option` deep-dive, `Result` vs `Effect` vs `Option`.
**Mini-app:** Domain model toolkit — model `UserId`, `Email`, `Money` as branded types, build a small `Order` aggregate with structural equality, demonstrate why `===` on two structurally-equal `Order`s would be `false` without `Data`.
**Outcomes:** You can choose between `Data.tagged`, `Brand`, and `Newtype` for a given modeling need; you know when `===` will fail you and how `Equal` fixes it.

### 16. `schema`
**Dependencies:** 15.
**Concepts:** `Schema`, `Schema.Struct` / `Array` / `Union` / `Literal` / `Record`, `Schema.Class`, `Schema.TaggedError`, encoding/decoding (`Schema.decode` / `decodeUnknown`), transformations, refinements, `Schema.brand`, `Schema.parseJson`, structured `Issue`s.
**Mini-app:** Config file validator — reads a YAML/JSON config, validates it against a `Schema.Struct` (with branded fields and a tagged-union for environment-specific blocks), reports structured parse errors with paths.
**Outcomes:** You can write a schema for an arbitrary JSON document and produce machine-readable error reports; you can define a class whose constructor validates its input.

### 17. `match`
**Dependencies:** 15.
**Concepts:** `Match.type` / `Match.value`, `Match.tag` / `tagsExhaustive`, `Match.when` / `Match.discriminator`, `Match.orElse`, exhaustiveness checks at compile time.
**Mini-app:** Typed command router — parses CLI-style string commands into a tagged-union ADT, dispatches to handlers exhaustively (the compiler refuses to build if a case is missing).
**Outcomes:** You can replace nested `switch` and `if` chains with a `Match` builder that the compiler keeps exhaustive.

---

## Track 4 — Streaming

Composable, resource-safe data streams.

### 18. `streams`
**Dependencies:** 7, 12.
**Concepts:** `Stream`, `Stream.fromIterable` / `fromEffect` / `async` / `acquireRelease`, `Stream.map` / `filter` / `flatMap` / `mapEffect`, `Stream.run*` sinks (`runForEach`, `runCollect`, `runDrain`), error handling, `Stream.retry`, `Stream.scoped`.
**Mini-app:** Live log file tailer — tails a growing log file as a `Stream`, filters lines by level with `Schema`-validated parsing, outputs structured entries, retries on transient I/O errors.
**Outcomes:** You can express an incremental pipeline as a single `Stream` and know exactly when finalization runs.

### 19. `channel`
**Dependencies:** 18.
**Concepts:** `Channel` (the low-level primitive both `Stream` and `Sink` are built on), `Channel.read` / `write` / `pipe` / `mapOut`, `Pull` (channel's underlying step type), how a `Stream<A, E, R>` is `Channel<A, never, ..., ...>`.
**Mini-app:** Custom binary framing protocol — encodes and decodes length-prefixed binary messages over a raw byte channel, with backpressure end-to-end.
**Outcomes:** You can build a custom streaming combinator that doesn't already exist in `Stream`.

---

## Track 5 — Platform

I/O, HTTP, processes, and CLI via `@effect/platform`.

### 20. `http-client`
**Dependencies:** 16, 9.
**Concepts:** `HttpClient`, `HttpClient.get` / `post`, request builders, typed response parsing with `Schema`, middleware (auth headers, base URL, automatic retries), `HttpClientResponse.json`, follow-redirects, JSON body encoding.
**Mini-app:** GitHub API client — lists repos for a user, gets a repo's issues, paginates via `Stream`, all with typed responses and a retry middleware.
**Outcomes:** You can build a typed wrapper for a third-party REST API end-to-end.

### 21. `http-server`
**Dependencies:** 20, 8.
**Concepts:** `HttpServer`, `HttpRouter`, `HttpMiddleware`, typed request bodies via `Schema`, JSON responses, error-to-status mapping, scoped server layer.
**Mini-app:** Todos REST API — CRUD endpoints for a todo list backed by an in-memory `Ref` store, with `Schema`-validated bodies and tagged-error-to-status mapping.
**Outcomes:** You can wire a typed REST handler from request bytes through to validated response without `any`.

### 22. `filesystem`
**Dependencies:** 7, 18.
**Concepts:** `FileSystem`, `Path`, reading/writing files, `Stream`-based file I/O, directory walking, `Effect.scoped` for file handles, `KeyValueStore` (a quick look at the platform's typed KV abstraction).
**Mini-app:** Directory scanner — walks a directory tree as a `Stream`, counts files by extension, optionally transforms matching files in place.
**Outcomes:** You can read or write arbitrary-size files without loading them into memory.

### 23. `child-process`
**Dependencies:** 18, 7.
**Concepts:** `CommandExecutor`, `Command.make`, piping commands together, streaming stdout/stderr as `Stream<Uint8Array>`, stdin from a stream, exit codes, killing on interruption.
**Mini-app:** Shell pipeline wrapper — runs `git log | grep <pattern>` style pipelines with typed exit handling, streams output line-by-line to a downstream consumer.
**Outcomes:** You can spawn an external process safely and know it will be killed if the parent fiber is interrupted.

### 24. `cli`
**Dependencies:** 16.
**Concepts:** `@effect/cli`, `Command`, `Args`, `Options`, `Prompt`, help-text generation, subcommands, `Schema`-validated arguments.
**Mini-app:** Multi-command file-processing CLI — `transform`, `validate`, and `stats` subcommands operating on files from Track 5, with auto-generated `--help`.
**Outcomes:** You can ship a polished command-line tool with help, validation, and subcommands without writing parsing code.

---

## Track 6 — Advanced

Internals, instrumentation, and production patterns.

### 25. `batching`
**Dependencies:** 20.
**Concepts:** `Request`, `RequestResolver`, `Effect.request`, automatic batching and deduplication across concurrent fibers, `RequestResolver.makeBatched`.
**Mini-app:** Batching dataloader — simulates a DB that accepts batch queries; resolves N individual lookups in a single round-trip; demonstrates dedup of identical concurrent requests.
**Outcomes:** You can eliminate the "N+1 query" problem for any backend without changing call sites.

### 26. `cache`
**Dependencies:** 25.
**Concepts:** `Cache`, `Cache.make`, TTL, capacity, `Cache.get` / `getOption` / `invalidate`, `Cache.refresh`, `RcRef` / `RcMap` for reference-counted resources whose lifetime spans the highest-water-mark.
**Mini-app:** Memoized API cache — wraps the GitHub client from module 20 with a TTL cache; logs hits/misses; exposes manual invalidation; demonstrates `RcMap` by reusing an `HttpClient` per host.
**Outcomes:** You can pick between `Cache`, `RcRef`, and `RcMap` for a given resource-lifetime model.

### 27. `pool`
**Dependencies:** 7, 10.
**Concepts:** `Pool`, `Pool.make` / `makeWithTTL`, scoped acquisition, dynamic resizing, idle timeout, eviction on failure, the difference between `Pool` (interchangeable resources) and `RcMap` (keyed resources).
**Mini-app:** Mock DB connection pool — a pool of N fake "connections" that take time to open; concurrent workers borrow them via `Pool.get` (scoped); the pool grows under load and trims when idle.
**Outcomes:** You can pool any expensive-to-create resource and tune for steady-state vs burst workloads.

### 28. `observability`
**Dependencies:** 21.
**Concepts:** Three pillars in one place. **Logging:** `Logger`, `Logger.make`, log levels, `Effect.log*`, `Effect.withLogSpan`, `Effect.annotateLogs`, structured JSON logging, `Logger.pretty`. **Metrics:** `Metric.counter` / `gauge` / `histogram` / `summary`, tagging, `Effect.withMetric`. **Tracing:** `Tracer`, `Effect.withSpan`, span attributes / events, propagation across fibers, exporting via `effect/unstable/observability` (OTLP) or `@effect/opentelemetry`.
**Mini-app:** Instrumented HTTP service — the todos API from module 21 with structured JSON logs (trace IDs in every line), counters and latency histograms, full request-to-DB tracing, and a `/metrics` endpoint plus an OTLP export.
**Outcomes:** Given a production-style service, you can answer "what happened in this request" from three independent signals that all agree.

### 29. `testing`
**Dependencies:** 9, 28.
**Concepts:** `TestClock` (controlling virtual time), test layers swapped via `Effect.provide`, `@effect/vitest` (`it.effect`, `it.scoped`, `it.live`), property-based testing helpers.
**Mini-app:** Tested scheduled job — a background polling job with full test coverage using `TestClock` to step through hours of "real" time in milliseconds.
**Outcomes:** You can test a time-sensitive effect deterministically without a single `sleep` in the test file.

### 30. `runtime`
**Dependencies:** 5.
**Concepts:** `ManagedRuntime.make` (the user-facing entry point), interop with non-Effect code (`runtime.runPromise` / `runFork`), sharing a runtime across handlers, graceful shutdown of a runtime, when to use raw `Runtime` vs `ManagedRuntime`.
**Mini-app:** Effect inside Express — wraps an existing Express app so handlers are Effect programs, sharing one `ManagedRuntime` for the process; SIGTERM shuts the runtime down gracefully.
**Outcomes:** You can adopt Effect inside a legacy codebase one handler at a time.

---

## Track 7 — Ecosystem

First-party packages beyond core + platform.

### 31. `ai`
**Dependencies:** 18, 20, 24.
**Concepts:** `@effect/ai`, `LanguageModel`, tool use / function calling with `Schema` tools, streaming responses as `Stream`, `AiPlan` (multi-step plans), `ExecutionPlan` for provider fallback / retry, provider layers (`@effect/ai-openai`, `@effect/ai-anthropic`).
**Mini-app:** AI-powered CLI assistant — accepts questions, calls tools (file read, web search stub), streams responses to the terminal token-by-token, falls back from primary to secondary provider via `ExecutionPlan`.
**Outcomes:** You can build a typed agent that uses tools and degrades gracefully when a provider fails.

### 32. `cluster`
**Dependencies:** 13, 21, 28.
**Concepts:** `@effect/cluster`, `Entity`, `EntityAddress`, `Mailbox`, durable messaging, `ClusterSchema`, `Sharding`, supervision of distributed entities.
**Mini-app:** Stateful counter actors — a cluster of named counter entities that accept `Increment` / `Decrement` / `Get` messages, with metrics from module 28 showing distribution across shards.
**Outcomes:** You can model a stateful distributed service as a set of typed entities without rolling your own routing.

---

## Capstone

A single project that integrates the curriculum end-to-end. Suggested shape:

**A real-time URL monitoring service.**

- Configured from env via module 6
- Persists state in a `Ref` (module 8) behind a `Service` (4) wired in a `Layer` (5)
- Schedules checks with `Schedule` (9) and pools HTTP via `Pool` (27)
- Fetches with the typed HTTP client (20), batches lookups (25), caches (26)
- Streams results to subscribers via `PubSub` (13) and `Stream` (18)
- Exposes a CRUD admin REST API (21) and a CLI (24)
- Emits logs, metrics, and traces (28)
- Fully tested with `TestClock` (29)
- (Stretch) Distributed via `cluster` (32)

The goal is not to ship — it's to feel which parts of the API are now muscle memory and which still need a re-read.

---

## Progress Tracker

- [ ] 01 `module01-effects`
- [ ] 02 `generators`
- [ ] 03 `errors`
- [ ] 04 `services`
- [ ] 05 `layers`
- [ ] 06 `config`
- [ ] 07 `resources`
- [ ] 08 `ref`
- [ ] 09 `schedule`
- [ ] 10 `fibers`
- [ ] 11 `concurrency`
- [ ] 12 `queue`
- [ ] 13 `pubsub`
- [ ] 14 `coordination`
- [ ] 15 `data-primitives`
- [ ] 16 `schema`
- [ ] 17 `match`
- [ ] 18 `streams`
- [ ] 19 `channel`
- [ ] 20 `http-client`
- [ ] 21 `http-server`
- [ ] 22 `filesystem`
- [ ] 23 `child-process`
- [ ] 24 `cli`
- [ ] 25 `batching`
- [ ] 26 `cache`
- [ ] 27 `pool`
- [ ] 28 `observability`
- [ ] 29 `testing`
- [ ] 30 `runtime`
- [ ] 31 `ai`
- [ ] 32 `cluster`
- [ ] Capstone — URL monitoring service
