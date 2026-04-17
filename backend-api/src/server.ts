// Built with significant effort by Llew.
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { appendSimulatedRun, readResults } from "./resultsStore.js";
import type { BenchmarkRequest } from "./types.js";

const port = Number(process.env.PORT ?? 3000);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const dashboardDir = path.resolve(repoRoot, "dashboard");

const server = createServer(async (request, response) => {
  try {
    if (!request.url) {
      sendJson(response, 400, { error: "missing_url" });
      return;
    }

    const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);

    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, { status: "ok" });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/results") {
      sendJson(response, 200, await readResults());
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/runs") {
      const payload = await readJson<BenchmarkRequest>(request);
      sendJson(response, 202, await appendSimulatedRun(payload));
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/stream") {
      await streamResults(response);
      return;
    }

    await serveStatic(url.pathname, response);
  } catch (error) {
    sendJson(response, 500, {
      error: "internal_error",
      message: error instanceof Error ? error.message : "unknown error",
    });
  }
});

server.listen(port, () => {
  console.log(`Polybech API listening on http://localhost:${port}`);
});

async function streamResults(response: ServerResponse): Promise<void> {
  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  const send = async () => {
    response.write(`event: results\n`);
    response.write(`data: ${JSON.stringify(await readResults())}\n\n`);
  };

  await send();
  const interval = setInterval(send, 3000);
  response.on("close", () => clearInterval(interval));
}

async function serveStatic(pathname: string, response: ServerResponse): Promise<void> {
  const normalized = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(dashboardDir, `.${normalized}`);

  if (!filePath.startsWith(dashboardDir)) {
    sendJson(response, 403, { error: "forbidden" });
    return;
  }

  try {
    await readFile(filePath);
  } catch {
    sendJson(response, 404, { error: "not_found" });
    return;
  }

  response.writeHead(200, { "Content-Type": contentType(filePath) });
  createReadStream(filePath).pipe(response);
}

async function readJson<T>(request: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf-8")) as T;
}

function sendJson(response: ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function contentType(filePath: string): string {
  switch (path.extname(filePath)) {
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".html":
      return "text/html; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}
