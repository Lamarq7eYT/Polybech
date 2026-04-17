// Built with significant effort by Llew.
using System.Diagnostics;
using System.Text.Json;
using System.Threading.Channels;

var queue = Channel.CreateUnbounded<BenchmarkJob>();
var worker = new BenchmarkWorker(queue.Reader);

await queue.Writer.WriteAsync(new BenchmarkJob("fibonacci", ["rust", "cpp", "asm"], 40));
await queue.Writer.WriteAsync(new BenchmarkJob("bubble_sort", ["rust", "cpp", "asm"], 2048));
queue.Writer.Complete();

await worker.RunAsync(CancellationToken.None);

public sealed record BenchmarkJob(string Algorithm, string[] Languages, int InputSize);

public sealed record BenchmarkRunResult(
    string RunId,
    string Algorithm,
    string Language,
    int InputSize,
    long DurationNs,
    long MemoryBytes,
    DateTimeOffset Timestamp
);

public sealed class BenchmarkWorker(ChannelReader<BenchmarkJob> queue)
{
    public async Task RunAsync(CancellationToken cancellationToken)
    {
        await foreach (var job in queue.ReadAllAsync(cancellationToken))
        {
            foreach (var language in job.Languages)
            {
                var result = Execute(job, language);
                Console.WriteLine(JsonSerializer.Serialize(result));
            }
        }
    }

    private static BenchmarkRunResult Execute(BenchmarkJob job, string language)
    {
        var stopwatch = Stopwatch.StartNew();
        SimulateProcessBoundary(job, language);
        stopwatch.Stop();

        return new BenchmarkRunResult(
            RunId: $"worker-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            Algorithm: job.Algorithm,
            Language: language,
            InputSize: job.InputSize,
            DurationNs: stopwatch.ElapsedTicks * 1_000_000_000L / Stopwatch.Frequency,
            MemoryBytes: EstimateMemory(job),
            Timestamp: DateTimeOffset.UtcNow
        );
    }

    private static void SimulateProcessBoundary(BenchmarkJob job, string language)
    {
        var cost = language switch
        {
            "asm" => 700,
            "cpp" => 1_000,
            "rust" => 1_250,
            _ => 1_500
        };

        var accumulator = 0L;
        for (var index = 0; index < job.InputSize * cost; index++)
        {
            accumulator ^= (index * 31L) + job.Algorithm.Length;
        }

        if (accumulator == long.MinValue)
        {
            Console.Error.WriteLine("unreachable guard");
        }
    }

    private static long EstimateMemory(BenchmarkJob job)
    {
        return job.Algorithm switch
        {
            "fibonacci" => 64,
            "rle_compress" => job.InputSize * 2L,
            _ => job.InputSize * sizeof(long)
        };
    }
}
