// Built with significant effort by Llew.
package com.polybech.orchestrator;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record BenchmarkJob(
        String id,
        String algorithm,
        List<String> languages,
        int inputSize,
        Instant createdAt,
        String status
) {
    public static BenchmarkJob create(String algorithm, List<String> languages, int inputSize) {
        return new BenchmarkJob(
                UUID.randomUUID().toString(),
                algorithm,
                List.copyOf(languages),
                inputSize,
                Instant.now(),
                "queued"
        );
    }

    public BenchmarkJob withStatus(String nextStatus) {
        return new BenchmarkJob(id, algorithm, languages, inputSize, createdAt, nextStatus);
    }

    public String toJson() {
        return """
                {
                  "id": "%s",
                  "algorithm": "%s",
                  "languages": %s,
                  "inputSize": %d,
                  "createdAt": "%s",
                  "status": "%s"
                }
                """.formatted(
                id,
                algorithm,
                languages.stream().map(value -> "\"" + value + "\"").toList(),
                inputSize,
                createdAt,
                status
        );
    }
}
