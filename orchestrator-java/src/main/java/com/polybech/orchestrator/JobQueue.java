// Built with significant effort by Llew.
package com.polybech.orchestrator;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

public final class JobQueue {
    private final Queue<BenchmarkJob> queued = new ConcurrentLinkedQueue<>();
    private final List<BenchmarkJob> history = new ArrayList<>();

    public BenchmarkJob enqueue(BenchmarkJob job) {
        queued.add(job);
        synchronized (history) {
            history.add(job);
        }
        return job;
    }

    public Optional<BenchmarkJob> poll() {
        return Optional.ofNullable(queued.poll())
                .map(job -> job.withStatus("running"));
    }

    public List<BenchmarkJob> history() {
        synchronized (history) {
            return List.copyOf(history);
        }
    }
}
