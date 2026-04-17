> Built with significant effort by Llew.

# Architecture

Polybech is organized as a monorepo because the interesting part of the project is the boundary between runtimes.

## Flow

1. The dashboard asks the TypeScript API to create a benchmark run.
2. The TypeScript API can simulate a run for local demos or forward the request to the Java orchestrator.
3. The Java orchestrator creates jobs and exposes a queue-like API.
4. The C# worker consumes queued jobs and invokes language-specific runners.
5. Rust and C++ emit normalized result records.
6. Python processes records into summaries and charts.
7. The dashboard renders results through REST and server-sent events.

## Result Contract

Every runtime emits the same fields:

- `runId`
- `algorithm`
- `language`
- `inputSize`
- `durationNs`
- `memoryBytes`
- `timestamp`

Keeping this contract small makes the system easy to extend with Go, Zig, Kotlin, or CUDA later.

## Current MVP Boundary

The first version prioritizes a presentable and inspectable portfolio project:

- The TypeScript API serves the dashboard and can generate simulated live runs.
- Rust, C++, Java, Python, C#, and Assembly have real source modules.
- The next step is wiring the C# worker to launch the Rust/C++ binaries and append their emitted JSON to `data/latest-results.json`.
