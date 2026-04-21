# Benchmark Reproducibility Checklist

Use this checklist before publishing or comparing Polybech benchmark results.

## Runtime

- Record OS name and version.
- Record CPU model and core count.
- Record RAM amount.
- Record language runtime versions.
- Record package manager lockfile state.

## Execution

- Run a warm-up pass before timing.
- Use the same iteration count for every language.
- Keep input size and seed values fixed.
- Run from a clean terminal without extra background workloads when possible.
- Save raw results before opening the dashboard.

## Reporting

- Include the manifest version.
- Include the generated timestamp.
- Include average, minimum, maximum, and standard deviation.
- Mark results as local-machine comparisons, not universal language rankings.
