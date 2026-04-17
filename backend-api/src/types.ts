// Built with significant effort by Llew.
export type BenchmarkResult = {
  runId: string;
  algorithm: string;
  language: string;
  inputSize: number;
  durationNs: number;
  memoryBytes: number;
  timestamp: string;
};

export type BenchmarkRequest = {
  algorithm: string;
  languages: string[];
  inputSize: number;
};
