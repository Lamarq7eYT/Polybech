// Built with significant effort by Llew.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { BenchmarkRequest, BenchmarkResult } from "./types.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const sampleResultsPath = path.resolve(repoRoot, "data", "sample-results.json");
const liveResultsPath = path.resolve(repoRoot, "data", "latest-results.json");

export async function readResults(): Promise<BenchmarkResult[]> {
  const pathToRead = await fileExists(liveResultsPath) ? liveResultsPath : sampleResultsPath;
  const content = await readFile(pathToRead, "utf-8");
  return JSON.parse(content) as BenchmarkResult[];
}

export async function appendSimulatedRun(request: BenchmarkRequest): Promise<BenchmarkResult[]> {
  const current = await readResults();
  const runId = `api-${Date.now()}`;
  const created = request.languages.map((language) => simulateResult(runId, request, language));
  const next = [...current, ...created];
  await writeFile(liveResultsPath, `${JSON.stringify(next, null, 2)}\n`, "utf-8");
  return created;
}

function simulateResult(
  runId: string,
  request: BenchmarkRequest,
  language: string,
): BenchmarkResult {
  const baseline = baselineDuration(request.algorithm, request.inputSize);
  const multiplier = languageMultiplier(language);
  const jitter = 0.92 + Math.random() * 0.16;

  return {
    runId,
    algorithm: request.algorithm,
    language,
    inputSize: request.inputSize,
    durationNs: Math.round(baseline * multiplier * jitter),
    memoryBytes: estimateMemory(request.algorithm, request.inputSize, language),
    timestamp: new Date().toISOString(),
  };
}

function baselineDuration(algorithm: string, inputSize: number): number {
  switch (algorithm) {
    case "fibonacci":
      return inputSize * inputSize * 72;
    case "bubble_sort":
      return inputSize * inputSize * 1.2;
    case "quick_sort":
      return inputSize * Math.log2(inputSize) * 6;
    case "rle_compress":
      return inputSize * 9;
    default:
      return inputSize * 100;
  }
}

function languageMultiplier(language: string): number {
  switch (language) {
    case "asm":
      return 0.68;
    case "cpp":
      return 0.82;
    case "rust":
      return 1.0;
    case "python":
      return 6.8;
    case "java":
      return 1.45;
    case "csharp":
      return 1.6;
    default:
      return 2.0;
  }
}

function estimateMemory(algorithm: string, inputSize: number, language: string): number {
  const base = algorithm === "fibonacci" ? 64 : inputSize * 8;
  const overhead = language === "asm" ? 1 : language === "cpp" ? 1.4 : 2.1;
  return Math.round(base * overhead);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await readFile(filePath, "utf-8");
    return true;
  } catch {
    return false;
  }
}
