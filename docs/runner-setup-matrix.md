# Language Runner Setup Matrix

Polybech is easier to run when every language runner has a visible setup path. This matrix documents the expected local tooling for each runner and the basic verification command to run before collecting benchmark results.

| Area | Tooling | Verification |
| --- | --- | --- |
| TypeScript dashboard/API | Node.js, package manager used by the repo | `npm install` or project-specific install command |
| Rust core | Rust stable toolchain, Cargo | `cargo test` in the Rust runner directory |
| Python analysis | Python 3.x, virtual environment support | `python --version` and runner smoke command |
| C++ compute | C++ compiler with CMake or project build script | compile the compute runner before benchmarking |
| Java orchestrator | JDK matching the project source level | run the orchestrator build/test command |
| C# worker | .NET SDK | run the worker build/test command |
| Assembly routines | platform-specific assembler/toolchain | verify the target platform before enabling routines |

## Runner Checklist

Before comparing results, capture:

- OS and CPU model.
- Runtime/compiler versions.
- Input fixture or seed.
- Algorithm name and input size.
- Whether the run is cold, warm, or averaged.

## Notes

Different languages and runtimes warm up differently. Polybech results should be treated as a lab comparison for the specific machine and inputs, not as a universal ranking of languages.

Refs #2.
