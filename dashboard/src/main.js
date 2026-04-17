// Built with significant effort by Llew.
const state = {
  results: [],
};

const chart = document.querySelector("#chart");
const tableBody = document.querySelector("#results-body");
const fastestLanguage = document.querySelector("#fastest-language");
const trackedRuns = document.querySelector("#tracked-runs");
const bestDuration = document.querySelector("#best-duration");
const connectionState = document.querySelector("#connection-state");
const runForm = document.querySelector("#run-form");

runForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(runForm);
  const languages = form.getAll("language");

  await fetch("/api/runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      algorithm: form.get("algorithm"),
      inputSize: Number(form.get("inputSize")),
      languages,
    }),
  });

  await loadResults();
});

function connectStream() {
  if (!("EventSource" in window)) {
    connectionState.textContent = "Live stream unavailable";
    loadResults();
    return;
  }

  const stream = new EventSource("/api/stream");
  stream.addEventListener("open", () => {
    connectionState.textContent = "Live";
  });
  stream.addEventListener("results", (event) => {
    state.results = JSON.parse(event.data);
    render();
  });
  stream.addEventListener("error", () => {
    connectionState.textContent = "Reconnecting...";
  });
}

async function loadResults() {
  const response = await fetch("/api/results");
  state.results = await response.json();
  render();
}

function render() {
  const results = [...state.results].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  renderMetrics(results);
  renderChart(results);
  renderTable(results.slice(0, 12));
}

function renderMetrics(results) {
  trackedRuns.textContent = new Set(results.map((result) => result.runId)).size.toString();

  const fastest = [...results].sort((a, b) => a.durationNs - b.durationNs)[0];
  fastestLanguage.textContent = fastest ? languageLabel(fastest.language) : "-";
  bestDuration.textContent = fastest ? formatNs(fastest.durationNs) : "-";
}

function renderChart(results) {
  chart.replaceChildren();
  const grouped = averageByLanguage(results);
  const max = Math.max(...grouped.map((item) => item.avgDurationNs), 1);

  for (const item of grouped) {
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span>${languageLabel(item.language)}</span>
      <div class="bar-track">
        <div class="bar ${item.language}" style="width: ${Math.max(4, (item.avgDurationNs / max) * 100)}%"></div>
      </div>
      <strong>${formatNs(item.avgDurationNs)}</strong>
    `;
    chart.append(row);
  }
}

function renderTable(results) {
  tableBody.replaceChildren();
  for (const result of results) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${algorithmLabel(result.algorithm)}</td>
      <td><span class="language-pill ${result.language}">${languageLabel(result.language)}</span></td>
      <td>${result.inputSize.toLocaleString()}</td>
      <td>${formatNs(result.durationNs)}</td>
      <td>${formatBytes(result.memoryBytes)}</td>
      <td>${result.runId}</td>
    `;
    tableBody.append(row);
  }
}

function averageByLanguage(results) {
  const groups = new Map();
  for (const result of results) {
    const current = groups.get(result.language) ?? { language: result.language, total: 0, count: 0 };
    current.total += result.durationNs;
    current.count += 1;
    groups.set(result.language, current);
  }

  return [...groups.values()]
    .map((item) => ({
      language: item.language,
      avgDurationNs: Math.round(item.total / item.count),
    }))
    .sort((a, b) => a.avgDurationNs - b.avgDurationNs);
}

function algorithmLabel(value) {
  return {
    fibonacci: "Fibonacci",
    bubble_sort: "Bubble Sort",
    quick_sort: "Quick Sort",
    rle_compress: "RLE Compress",
  }[value] ?? value;
}

function languageLabel(value) {
  return {
    asm: "Assembly",
    cpp: "C++",
    rust: "Rust",
    java: "Java",
    python: "Python",
    csharp: "C#",
  }[value] ?? value;
}

function formatNs(value) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)} ms`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)} us`;
  }
  return `${value} ns`;
}

function formatBytes(value) {
  if (value >= 1_048_576) {
    return `${(value / 1_048_576).toFixed(2)} MB`;
  }
  if (value >= 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${value} B`;
}

connectStream();
