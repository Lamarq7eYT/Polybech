> Built with significant effort by Llew.

# Polybech

Polybech is a polyglot benchmark lab for running, comparing, and visualizing classic algorithms across several languages.

The project has two goals:

- Work as a portfolio piece that shows language choice by responsibility.
- Produce meaningful multi-language repository activity for GitHub language stats.

## Architecture

| Layer | Language | Responsibility |
| --- | --- | --- |
| Core engine | Rust | Runs benchmarks and captures high precision timing |
| Compute modules | C++ | CPU-heavy algorithms such as sorting, FFT, and compression |
| Optimized routines | Assembly x86-64 | Hand-tuned routines for contrast against high-level implementations |
| Orchestrator | Java | REST service that schedules and coordinates benchmark jobs |
| Analysis | Python | Processes result files and generates charts/reports |
| Worker service | C#/.NET | Background worker that listens for queued runs |
| Backend API | TypeScript/Node | API and server-sent events consumed by the dashboard |
| Dashboard | JavaScript | Real-time web visualization |

## Quick Start

The repository is intentionally split into independently runnable pieces. Start with the web view:

```powershell
cd backend-api
npm install
npm run dev
```

Then open `http://localhost:3000`.

The API serves the dashboard from `dashboard/` and reads sample benchmark data from `data/sample-results.json`.

## Useful Commands

```powershell
# Rust core runner
cd core-rust
cargo run -- --manifest ../benchmarks/manifest.json --out ../data/rust-run.json

# TypeScript API and dashboard
cd backend-api
npm run dev

# Python report
cd analysis-python
python report.py --input ../data/sample-results.json --out ../data/report

# C++ compute module
cd compute-cpp
cmake -S . -B build
cmake --build build

# Java orchestrator
cd orchestrator-java
javac -d out src/main/java/com/polybech/orchestrator/*.java
java -cp out com.polybech.orchestrator.OrchestratorApplication

# C# worker
cd worker-csharp/Polybech.Worker
dotnet run
```

## Project Shape

`benchmarks/manifest.json` describes which algorithms and language backends are available. Each runtime can emit normalized result records:

```json
{
  "runId": "2026-04-17T15:00:00Z-local-demo",
  "algorithm": "fibonacci",
  "language": "rust",
  "inputSize": 42,
  "durationNs": 118000,
  "memoryBytes": 147456,
  "timestamp": "2026-04-17T15:00:00Z"
}
```

The dashboard consumes that shape directly, so later services can be swapped in without changing the frontend contract.

## Notes for GitHub Language Stats

GitHub Linguist usually ignores vendored/build output and counts source files by byte size. This repo keeps each language in normal source directories and excludes build artifacts through `.gitignore`.

The `.gitattributes` file marks sample data and generated reports as ignored for Linguist so they do not dilute the language breakdown.
