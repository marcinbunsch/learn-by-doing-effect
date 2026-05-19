# Effect Curriculum

Learning the entire Effect (v4 beta) feature set by building small, useful programs.

**Profile:** Solid TypeScript, new to FP — goal is production-quality backend apps.
**Format:** One runnable mini-app per module (`pnpm run:<folder>`).
**Depth:** Everything, including low-level internals (`Cause`, `Exit`, `Fiber`, `Channel`, `Pull`).
**Ordering:** Foundation-first — no concept introduced before its dependencies.

---

## How to use this curriculum

Each module is a self-contained `src/<folder>/index.ts` you can run with `pnpm run:<folder>`. Modules are designed to be built (and revisited) in order, because each one assumes the concepts from earlier modules.

For every module you'll see:

- **Dependencies** — modules whose concepts you need first.
- **Concepts** — the APIs and ideas the mini-app exercises.
- **Mini-app** — the runnable program you build to learn them.
- **Outcomes** — what you should be able to do without looking things up after finishing.

If something feels shaky, don't move forward — rebuild the mini-app from a blank file, or extend it with a small variant. The point is fluency, not coverage.

The `effect-smol` git submodule is the source of truth. When a concept is unclear, check `effect-smol/ai-docs/` first, then `effect-smol/packages/effect/src/`.

---

## Track 1 — Foundation

Core building blocks. Everything else depends on this track.

### 1. `effects`
**Dependencies:** none.
**Concepts:** The `Effect<A, E, R>` type (success / error / requirements channels), creating effects (`Effect.succeed`, `Effect.fail`, `Effect.sync`, `Effect.promise`, `Effect.tryPromise`), `pipe`, `Effect.gen` (generators), `Effect.map`, `Effect.flatMap`, `Effect.tap`, running with `Effect.runPromise` / `runSync` / `runFork`.
**Mini-app:** Number guessing game — generate a random number with `Random`, prompt the user via stdin, loop until correct.
**Outcomes:** You can read an `Effect<A, E, R>` type signature and explain each channel; you can convert a callback / promise API into an effect; you can write the same program in both `pipe` and `gen` styles and pick the right one.

### 2. `errors`
**Dependencies:** 1.
**Concepts:** Typed errors vs defects vs interruption, `Effect.fail`, tagged errors with `Data.TaggedError`, `Effect.catchTag` / `catchTags` / `catchAll` / `catchAllCause`, `Effect.mapError`, `Effect.orElse`, `Effect.either`, `Effect.exit`, the `Cause` and `Exit` types (Fail / Die / Interrupt / Sequential / Parallel), `Option`, `Result` (v4's replacement for `Either`).
**Mini-app:** Safe file parser — reads a file, parses JSON, validates structure, reports typed errors at each stage, distinguishes user-recoverable failures from defects, prints the full `Cause` on unexpected exit.
**Outcomes:** You can model a domain's failures as a tagged union of errors; you can explain the difference between `fail`, `die`, and `interrupt` and inspect them in a `Cause`; you know when to use `Option` vs `Result` vs `Effect`.

### 3. `services`
**Dependencies:** 1, 2.
**Concepts:** The `R` (requirements) channel, `Context.Tag`, `Effect.Service` (v4 class-based service definition), accessing services in `gen`, providing services with `Effect.provideService`, multiple implementations of one tag.
**Mini-app:** Swappable greeting service — a `Greeter` service with two implementations (formal/casual) chosen by an env var at startup.
**Outcomes:** You can define a service interface and at least two interchangeable implementations; you can read a type signature and tell which services an effect needs.

### 4. `layers`
**Dependencies:** 3.
**Concepts:** `Layer<RIn, E, ROut>`, `Layer.succeed`, `Layer.effect`, `Layer.scoped`, `Layer.provide` / `Layer.provideMerge` / `Layer.merge`, dependency graphs, memoization, building a single application layer.
**Mini-app:** Multi-service app — `Logger`, `Config`, and `Database` (mock) services wired together into one app `Layer`, with `Database` depending on `Logger` and `Config`.
**Outcomes:** You can draw the dependency graph of a layer composition and predict initialization order; you understand why layers are memoized.

### 5. `config`
**Dependencies:** 4.
**Concepts:** `Config`, `Config.string` / `number` / `boolean` / `array` / `redacted`, nested configs, `Config.withDefault`, `ConfigProvider`, structured validation errors, `Redacted` (and how it hides from logs).
**Mini-app:** Env-driven config loader — reads a nested app config from env vars, validates it, holds DB password in `Redacted`, prints the config (proving secrets stay hidden).
**Outcomes:** You can replace ad-hoc `process.env` reads with a typed `Config`; you can build a `ConfigProvider` for tests.

### 6. `resources`
**Dependencies:** 4.
**Concepts:** `Scope`, `Effect.acquireRelease`, `Effect.addFinalizer`, `Effect.scoped`, `Layer.scoped`, guaranteed finalization on success / failure / interruption, finalizer ordering.
**Mini-app:** File handle manager — opens files safely, processes them, guarantees cleanup even if processing fails or is interrupted; demonstrates LIFO finalizer order with nested scopes.
**Outcomes:** You can wrap any resource with safe acquire/release; you know when a finalizer runs and when it doesn't.

### 7. `ref`
**Dependencies:** 3.
**Concepts:** `Ref` (atomic mutable state), `Ref.get` / `set` / `update` / `modify`, `SynchronizedRef` (effectful updates with serialization), the difference between `Ref` and just a plain variable.
**Mini-app:** In-memory key-value store — get/set/delete/list operations on a `Ref`-backed store, exposed through a tiny REPL.
**Outcomes:** You can hold shared mutable state safely across concurrent effects; you can explain why `Ref` is needed even in single-threaded JS.

### 8. `schedule`
**Dependencies:** 2, 7.
**Concepts:** `Clock` service, `DateTime`, `Duration`, `Cron`, `Schedule`, `Schedule.exponential` / `jittered` / `recurs` / `fixed` / `spaced`, composing schedules (`&&`, `||`, `andThen`), `Effect.retry`, `Effect.repeat`, `Schedule.intersect` for combining conditions.
**Mini-app:** Resilient HTTP poller — polls a URL on a cron-like schedule, retries on failure with exponential backoff + jitter, logs each attempt with elapsed time from `Clock`.
**Outcomes:** You can build a backoff policy that won't thunder-herd; you know the difference between `retry` and `repeat`.

---

## Track 2 — Concurrency

Effect's fiber-based concurrency model.

### 9. `fibers`
**Dependencies:** 1, 6.
**Concepts:** `Fiber`, `Effect.fork` / `forkScoped` / `forkDaemon`, `Fiber.join` / `await` / `interrupt`, structured concurrency, `FiberSet` / `FiberMap` / `FiberHandle`, `Effect.interruptible` / `uninterruptible`, interruption propagation, supervision.
**Mini-app:** Parallel task runner — runs N tasks concurrently, tracks them in a `FiberSet`, cancels the rest on first failure, prints which fibers were interrupted vs completed.
**Outcomes:** You can fork a background task and know it will be cleaned up; you can explain what happens when a parent fiber is interrupted.

### 10. `concurrency`
**Dependencies:** 9.
**Concepts:** `Effect.all` with `concurrency` options, `Effect.forEach`, `Effect.race` / `raceAll`, `Effect.timeout` / `timeoutOption` / `timeoutFail`, `Effect.zip` / `zipPar`, `Effect.makeSemaphore`, `PartitionedSemaphore` for per-key rate limits.
**Mini-app:** Parallel API fetcher — fetches a list of URLs with bounded concurrency, races the primary against a fallback for the fastest response, applies per-request timeouts, rate-limits per host with a `PartitionedSemaphore`.
**Outcomes:** You can pick the right concurrency primitive for a workload; you can bound parallelism without writing manual queues.

### 11. `queue`
**Dependencies:** 9.
**Concepts:** `Queue` (bounded / unbounded / dropping / sliding), `Queue.offer` / `take` / `takeAll` / `takeUpTo`, `Queue.shutdown`, producer-consumer patterns, backpressure.
**Mini-app:** Background job processor — a producer enqueues work items at varying rates, a pool of N consumer fibers drains the queue concurrently, the queue shuts down cleanly on SIGINT.
**Outcomes:** You can choose between the four queue strategies for a given backpressure requirement.

### 12. `pubsub`
**Dependencies:** 11.
**Concepts:** `PubSub`, `PubSub.subscribe` (returns a scoped `Dequeue`), `PubSub.publish`, fan-out to multiple subscribers, bounded vs unbounded pub/sub, slow subscriber handling.
**Mini-app:** In-process event bus — publishes typed domain events, multiple independent subscribers react (audit log, metrics counter, notifier).
**Outcomes:** You can model decoupled in-process eventing without leaking subscribers.

### 13. `coordination`
**Dependencies:** 9.
**Concepts:** `Deferred` (one-shot fiber-to-fiber promise), `Deferred.await` / `succeed` / `fail`, `Latch` (open/close reusable gate), choosing between them.
**Mini-app:** App startup gate — services signal readiness through a `Deferred`; an HTTP listener waits on a `Latch` so it can be paused/resumed for blue-green style switching.
**Outcomes:** You can coordinate fibers without busy-waiting or sleeping.

---

## Track 3 — Data

Type-safe data modeling and transformation.

### 14. `data-primitives`
**Dependencies:** 2.
**Concepts:** `Data.struct` / `Data.tagged` / `Data.TaggedClass`, structural equality with `Equal` and `Hash`, `Brand` (nominal types via `Schema.brand` or `Brand.refined`), `Newtype`, immutable records, `Option` deep-dive, `Result` vs `Effect` vs `Option`.
**Mini-app:** Domain model toolkit — model `UserId`, `Email`, `Money` as branded types, build a small `Order` aggregate with structural equality, demonstrate why `===` on two structurally-equal `Order`s would be `false` without `Data`.
**Outcomes:** You can choose between `Data.tagged`, `Brand`, and `Newtype` for a given modeling need; you know when `===` will fail you and how `Equal` fixes it.

### 15. `schema`
**Dependencies:** 14.
**Concepts:** `Schema`, `Schema.Struct` / `Array` / `Union` / `Literal` / `Record`, `Schema.Class`, `Schema.TaggedError`, encoding/decoding (`Schema.decode` / `decodeUnknown`), transformations, refinements, `Schema.brand`, `Schema.parseJson`, structured `Issue`s.
**Mini-app:** Config file validator — reads a YAML/JSON config, validates it against a `Schema.Struct` (with branded fields and a tagged-union for environment-specific blocks), reports structured parse errors with paths.
**Outcomes:** You can write a schema for an arbitrary JSON document and produce machine-readable error reports; you can define a class whose constructor validates its input.

### 16. `match`
**Dependencies:** 14.
**Concepts:** `Match.type` / `Match.value`, `Match.tag` / `tagsExhaustive`, `Match.when` / `Match.discriminator`, `Match.orElse`, exhaustiveness checks at compile time.
**Mini-app:** Typed command router — parses CLI-style string commands into a tagged-union ADT, dispatches to handlers exhaustively (the compiler refuses to build if a case is missing).
**Outcomes:** You can replace nested `switch` and `if` chains with a `Match` builder that the compiler keeps exhaustive.

---

## Track 4 — Streaming

Composable, resource-safe data streams.

### 17. `streams`
**Dependencies:** 6, 11.
**Concepts:** `Stream`, `Stream.fromIterable` / `fromEffect` / `async` / `acquireRelease`, `Stream.map` / `filter` / `flatMap` / `mapEffect`, `Stream.run*` sinks (`runForEach`, `runCollect`, `runDrain`), error handling, `Stream.retry`, `Stream.scoped`.
**Mini-app:** Live log file tailer — tails a growing log file as a `Stream`, filters lines by level with `Schema`-validated parsing, outputs structured entries, retries on transient I/O errors.
**Outcomes:** You can express an incremental pipeline as a single `Stream` and know exactly when finalization runs.

### 18. `channel`
**Dependencies:** 17.
**Concepts:** `Channel` (the low-level primitive both `Stream` and `Sink` are built on), `Channel.read` / `write` / `pipe` / `mapOut`, `Pull` (channel's underlying step type), how a `Stream<A, E, R>` is `Channel<A, never, ..., ...>`.
**Mini-app:** Custom binary framing protocol — encodes and decodes length-prefixed binary messages over a raw byte channel, with backpressure end-to-end.
**Outcomes:** You can build a custom streaming combinator that doesn't already exist in `Stream`.

---

## Track 5 — Platform

I/O, HTTP, processes, and CLI via `@effect/platform`.

### 19. `http-client`
**Dependencies:** 15, 8.
**Concepts:** `HttpClient`, `HttpClient.get` / `post`, request builders, typed response parsing with `Schema`, middleware (auth headers, base URL, automatic retries), `HttpClientResponse.json`, follow-redirects, JSON body encoding.
**Mini-app:** GitHub API client — lists repos for a user, gets a repo's issues, paginates via `Stream`, all with typed responses and a retry middleware.
**Outcomes:** You can build a typed wrapper for a third-party REST API end-to-end.

### 20. `http-server`
**Dependencies:** 19, 7.
**Concepts:** `HttpServer`, `HttpRouter`, `HttpMiddleware`, typed request bodies via `Schema`, JSON responses, error-to-status mapping, scoped server layer.
**Mini-app:** Todos REST API — CRUD endpoints for a todo list backed by an in-memory `Ref` store, with `Schema`-validated bodies and tagged-error-to-status mapping.
**Outcomes:** You can wire a typed REST handler from request bytes through to validated response without `any`.

### 21. `filesystem`
**Dependencies:** 6, 17.
**Concepts:** `FileSystem`, `Path`, reading/writing files, `Stream`-based file I/O, directory walking, `Effect.scoped` for file handles, `KeyValueStore` (a quick look at the platform's typed KV abstraction).
**Mini-app:** Directory scanner — walks a directory tree as a `Stream`, counts files by extension, optionally transforms matching files in place.
**Outcomes:** You can read or write arbitrary-size files without loading them into memory.

### 22. `child-process`
**Dependencies:** 17, 6.
**Concepts:** `CommandExecutor`, `Command.make`, piping commands together, streaming stdout/stderr as `Stream<Uint8Array>`, stdin from a stream, exit codes, killing on interruption.
**Mini-app:** Shell pipeline wrapper — runs `git log | grep <pattern>` style pipelines with typed exit handling, streams output line-by-line to a downstream consumer.
**Outcomes:** You can spawn an external process safely and know it will be killed if the parent fiber is interrupted.

### 23. `cli`
**Dependencies:** 15.
**Concepts:** `@effect/cli`, `Command`, `Args`, `Options`, `Prompt`, help-text generation, subcommands, `Schema`-validated arguments.
**Mini-app:** Multi-command file-processing CLI — `transform`, `validate`, and `stats` subcommands operating on files from Track 5, with auto-generated `--help`.
**Outcomes:** You can ship a polished command-line tool with help, validation, and subcommands without writing parsing code.

---

## Track 6 — Advanced

Internals, instrumentation, and production patterns.

### 24. `batching`
**Dependencies:** 19.
**Concepts:** `Request`, `RequestResolver`, `Effect.request`, automatic batching and deduplication across concurrent fibers, `RequestResolver.makeBatched`.
**Mini-app:** Batching dataloader — simulates a DB that accepts batch queries; resolves N individual lookups in a single round-trip; demonstrates dedup of identical concurrent requests.
**Outcomes:** You can eliminate the "N+1 query" problem for any backend without changing call sites.

### 25. `cache`
**Dependencies:** 24.
**Concepts:** `Cache`, `Cache.make`, TTL, capacity, `Cache.get` / `getOption` / `invalidate`, `Cache.refresh`, `RcRef` / `RcMap` for reference-counted resources whose lifetime spans the highest-water-mark.
**Mini-app:** Memoized API cache — wraps the GitHub client from module 19 with a TTL cache; logs hits/misses; exposes manual invalidation; demonstrates `RcMap` by reusing an `HttpClient` per host.
**Outcomes:** You can pick between `Cache`, `RcRef`, and `RcMap` for a given resource-lifetime model.

### 26. `pool`
**Dependencies:** 6, 9.
**Concepts:** `Pool`, `Pool.make` / `makeWithTTL`, scoped acquisition, dynamic resizing, idle timeout, eviction on failure, the difference between `Pool` (interchangeable resources) and `RcMap` (keyed resources).
**Mini-app:** Mock DB connection pool — a pool of N fake "connections" that take time to open; concurrent workers borrow them via `Pool.get` (scoped); the pool grows under load and trims when idle.
**Outcomes:** You can pool any expensive-to-create resource and tune for steady-state vs burst workloads.

### 27. `observability`
**Dependencies:** 20.
**Concepts:** Three pillars in one place. **Logging:** `Logger`, `Logger.make`, log levels, `Effect.log*`, `Effect.withLogSpan`, `Effect.annotateLogs`, structured JSON logging, `Logger.pretty`. **Metrics:** `Metric.counter` / `gauge` / `histogram` / `summary`, tagging, `Effect.withMetric`. **Tracing:** `Tracer`, `Effect.withSpan`, span attributes / events, propagation across fibers, exporting via `effect/unstable/observability` (OTLP) or `@effect/opentelemetry`.
**Mini-app:** Instrumented HTTP service — the todos API from module 20 with structured JSON logs (trace IDs in every line), counters and latency histograms, full request-to-DB tracing, and a `/metrics` endpoint plus an OTLP export.
**Outcomes:** Given a production-style service, you can answer "what happened in this request" from three independent signals that all agree.

### 28. `testing`
**Dependencies:** 8, 27.
**Concepts:** `TestClock` (controlling virtual time), test layers swapped via `Effect.provide`, `@effect/vitest` (`it.effect`, `it.scoped`, `it.live`), property-based testing helpers.
**Mini-app:** Tested scheduled job — a background polling job with full test coverage using `TestClock` to step through hours of "real" time in milliseconds.
**Outcomes:** You can test a time-sensitive effect deterministically without a single `sleep` in the test file.

### 29. `runtime`
**Dependencies:** 4.
**Concepts:** `ManagedRuntime.make` (the user-facing entry point), interop with non-Effect code (`runtime.runPromise` / `runFork`), sharing a runtime across handlers, graceful shutdown of a runtime, when to use raw `Runtime` vs `ManagedRuntime`.
**Mini-app:** Effect inside Express — wraps an existing Express app so handlers are Effect programs, sharing one `ManagedRuntime` for the process; SIGTERM shuts the runtime down gracefully.
**Outcomes:** You can adopt Effect inside a legacy codebase one handler at a time.

---

## Track 7 — Ecosystem

First-party packages beyond core + platform.

### 30. `ai`
**Dependencies:** 17, 19, 23.
**Concepts:** `@effect/ai`, `LanguageModel`, tool use / function calling with `Schema` tools, streaming responses as `Stream`, `AiPlan` (multi-step plans), `ExecutionPlan` for provider fallback / retry, provider layers (`@effect/ai-openai`, `@effect/ai-anthropic`).
**Mini-app:** AI-powered CLI assistant — accepts questions, calls tools (file read, web search stub), streams responses to the terminal token-by-token, falls back from primary to secondary provider via `ExecutionPlan`.
**Outcomes:** You can build a typed agent that uses tools and degrades gracefully when a provider fails.

### 31. `cluster`
**Dependencies:** 12, 20, 27.
**Concepts:** `@effect/cluster`, `Entity`, `EntityAddress`, `Mailbox`, durable messaging, `ClusterSchema`, `Sharding`, supervision of distributed entities.
**Mini-app:** Stateful counter actors — a cluster of named counter entities that accept `Increment` / `Decrement` / `Get` messages, with metrics from module 27 showing distribution across shards.
**Outcomes:** You can model a stateful distributed service as a set of typed entities without rolling your own routing.

---

## Capstone

A single project that integrates the curriculum end-to-end. Suggested shape:

**A real-time URL monitoring service.**

- Configured from env via module 5
- Persists state in a `Ref` (module 7) behind a `Service` (3) wired in a `Layer` (4)
- Schedules checks with `Schedule` (8) and pools HTTP via `Pool` (26)
- Fetches with the typed HTTP client (19), batches lookups (24), caches (25)
- Streams results to subscribers via `PubSub` (12) and `Stream` (17)
- Exposes a CRUD admin REST API (20) and a CLI (23)
- Emits logs, metrics, and traces (27)
- Fully tested with `TestClock` (28)
- (Stretch) Distributed via `cluster` (31)

The goal is not to ship — it's to feel which parts of the API are now muscle memory and which still need a re-read.

---

## Progress Tracker

- [ ] 01 `effects`
- [ ] 02 `errors`
- [ ] 03 `services`
- [ ] 04 `layers`
- [ ] 05 `config`
- [ ] 06 `resources`
- [ ] 07 `ref`
- [ ] 08 `schedule`
- [ ] 09 `fibers`
- [ ] 10 `concurrency`
- [ ] 11 `queue`
- [ ] 12 `pubsub`
- [ ] 13 `coordination`
- [ ] 14 `data-primitives`
- [ ] 15 `schema`
- [ ] 16 `match`
- [ ] 17 `streams`
- [ ] 18 `channel`
- [ ] 19 `http-client`
- [ ] 20 `http-server`
- [ ] 21 `filesystem`
- [ ] 22 `child-process`
- [ ] 23 `cli`
- [ ] 24 `batching`
- [ ] 25 `cache`
- [ ] 26 `pool`
- [ ] 27 `observability`
- [ ] 28 `testing`
- [ ] 29 `runtime`
- [ ] 30 `ai`
- [ ] 31 `cluster`
- [ ] Capstone — URL monitoring service
