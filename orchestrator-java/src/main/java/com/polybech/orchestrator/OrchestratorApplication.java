// Built with significant effort by Llew.
package com.polybech.orchestrator;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

public final class OrchestratorApplication {
    private final JobQueue queue = new JobQueue();

    public static void main(String[] args) throws IOException {
        new OrchestratorApplication().start(8081);
    }

    public void start(int port) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/health", exchange -> respond(exchange, 200, "{\"status\":\"ok\"}"));
        server.createContext("/jobs", this::handleJobs);
        server.createContext("/jobs/next", this::handleNextJob);
        server.start();
        System.out.printf("Polybech orchestrator listening on http://localhost:%d%n", port);
    }

    private void handleJobs(HttpExchange exchange) throws IOException {
        if ("GET".equals(exchange.getRequestMethod())) {
            respond(exchange, 200, jobsJson(queue.history()));
            return;
        }

        if ("POST".equals(exchange.getRequestMethod())) {
            BenchmarkJob job = BenchmarkJob.create("fibonacci", List.of("rust", "cpp", "asm"), 40);
            respond(exchange, 202, queue.enqueue(job).toJson());
            return;
        }

        respond(exchange, 405, "{\"error\":\"method_not_allowed\"}");
    }

    private void handleNextJob(HttpExchange exchange) throws IOException {
        if (!"POST".equals(exchange.getRequestMethod())) {
            respond(exchange, 405, "{\"error\":\"method_not_allowed\"}");
            return;
        }

        respond(exchange, 200, queue.poll()
                .map(BenchmarkJob::toJson)
                .orElse("{\"status\":\"empty\"}"));
    }

    private static String jobsJson(List<BenchmarkJob> jobs) {
        return jobs.stream()
                .map(BenchmarkJob::toJson)
                .reduce((left, right) -> left + "," + right)
                .map(body -> "[" + body + "]")
                .orElse("[]");
    }

    private static void respond(HttpExchange exchange, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        for (Map.Entry<String, List<String>> header : Map.of(
                "Content-Type", List.of("application/json; charset=utf-8"),
                "Access-Control-Allow-Origin", List.of("*")
        ).entrySet()) {
            exchange.getResponseHeaders().put(header.getKey(), header.getValue());
        }
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream stream = exchange.getResponseBody()) {
            stream.write(bytes);
        }
    }
}
