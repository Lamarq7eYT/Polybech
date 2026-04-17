# Built with significant effort by Llew.
from __future__ import annotations

import argparse
import json
from pathlib import Path
from statistics import mean
from typing import Any


def load_results(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)

    if not isinstance(payload, list):
        raise ValueError("expected a JSON array with benchmark results")

    return payload


def summarize(results: list[dict[str, Any]]) -> list[dict[str, Any]]:
    groups: dict[tuple[str, str], list[int]] = {}
    for row in results:
        key = (str(row["algorithm"]), str(row["language"]))
        groups.setdefault(key, []).append(int(row["durationNs"]))

    summary = []
    for (algorithm, language), durations in sorted(groups.items()):
        summary.append(
            {
                "algorithm": algorithm,
                "language": language,
                "runs": len(durations),
                "avgDurationNs": round(mean(durations)),
                "bestDurationNs": min(durations),
                "worstDurationNs": max(durations),
            }
        )
    return summary


def write_markdown(summary: list[dict[str, Any]], out_dir: Path) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    report_path = out_dir / "summary.md"
    lines = [
        "# Polybech Benchmark Summary",
        "",
        "| Algorithm | Language | Runs | Avg ns | Best ns | Worst ns |",
        "| --- | --- | ---: | ---: | ---: | ---: |",
    ]

    for row in summary:
        lines.append(
            "| {algorithm} | {language} | {runs} | {avgDurationNs} | {bestDurationNs} | {worstDurationNs} |".format(
                **row
            )
        )

    report_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return report_path


def write_chart(results: list[dict[str, Any]], out_dir: Path) -> Path | None:
    try:
        import matplotlib.pyplot as plt
        import pandas as pd
    except ImportError:
        return None

    frame = pd.DataFrame(results)
    pivot = frame.pivot_table(
        values="durationNs",
        index="algorithm",
        columns="language",
        aggfunc="mean",
    )

    out_dir.mkdir(parents=True, exist_ok=True)
    chart_path = out_dir / "duration-by-language.png"
    axis = pivot.plot(kind="bar", figsize=(10, 5), title="Average Duration by Language")
    axis.set_xlabel("Algorithm")
    axis.set_ylabel("Duration (ns)")
    axis.figure.tight_layout()
    plt.savefig(chart_path)
    plt.close(axis.figure)
    return chart_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Polybech analysis artifacts")
    parser.add_argument("--input", type=Path, default=Path("../data/sample-results.json"))
    parser.add_argument("--out", type=Path, default=Path("../data/report"))
    args = parser.parse_args()

    results = load_results(args.input)
    summary = summarize(results)
    markdown = write_markdown(summary, args.out)
    chart = write_chart(results, args.out)

    print(f"wrote {markdown}")
    if chart is None:
        print("chart skipped because pandas/matplotlib are not installed")
    else:
        print(f"wrote {chart}")


if __name__ == "__main__":
    main()
