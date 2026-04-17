// Built with significant effort by Llew.
use std::env;
use std::fs;
use std::path::PathBuf;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone)]
struct BenchmarkResult {
    run_id: String,
    algorithm: String,
    language: String,
    input_size: usize,
    duration_ns: u128,
    memory_bytes: usize,
    timestamp: String,
}

fn main() {
    let args: Vec<String> = env::args().collect();
    let out = arg_value(&args, "--out").unwrap_or_else(|| "../data/rust-run.json".into());
    let manifest =
        arg_value(&args, "--manifest").unwrap_or_else(|| "../benchmarks/manifest.json".into());

    if let Err(error) = fs::read_to_string(&manifest) {
        eprintln!("warning: could not read manifest at {manifest}: {error}");
    }

    let run_id = format!("rust-{}", unix_millis());
    let mut results = Vec::new();

    for input_size in [24_usize, 32, 40] {
        results.push(measure(&run_id, "fibonacci", input_size, || {
            let _ = fibonacci(input_size as u64);
        }));
    }

    for input_size in [128_usize, 512, 2048] {
        results.push(measure(&run_id, "bubble_sort", input_size, || {
            let mut values = pseudo_random_values(input_size);
            bubble_sort(&mut values);
        }));
    }

    for input_size in [1024_usize, 8192, 32768] {
        results.push(measure(&run_id, "quick_sort", input_size, || {
            let mut values = pseudo_random_values(input_size);
            values.sort_unstable();
        }));
    }

    for input_size in [4096_usize, 65536, 262144] {
        results.push(measure(&run_id, "rle_compress", input_size, || {
            let bytes = repeated_payload(input_size);
            let _ = rle_compress(&bytes);
        }));
    }

    let output = to_json(&results);
    let out_path = PathBuf::from(out);
    if let Some(parent) = out_path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    fs::write(&out_path, output).expect("failed to write benchmark output");
    println!("wrote {}", out_path.display());
}

fn measure<F>(run_id: &str, algorithm: &str, input_size: usize, mut action: F) -> BenchmarkResult
where
    F: FnMut(),
{
    let started = Instant::now();
    action();
    let elapsed = started.elapsed();

    BenchmarkResult {
        run_id: run_id.to_string(),
        algorithm: algorithm.to_string(),
        language: "rust".to_string(),
        input_size,
        duration_ns: elapsed.as_nanos(),
        memory_bytes: estimated_memory_bytes(algorithm, input_size),
        timestamp: isoish_timestamp(),
    }
}

fn fibonacci(n: u64) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => {
            let mut previous = 0;
            let mut current = 1;
            for _ in 2..=n {
                let next = previous + current;
                previous = current;
                current = next;
            }
            current
        }
    }
}

fn bubble_sort(values: &mut [u64]) {
    let len = values.len();
    if len < 2 {
        return;
    }

    for end in (1..len).rev() {
        let mut swapped = false;
        for index in 0..end {
            if values[index] > values[index + 1] {
                values.swap(index, index + 1);
                swapped = true;
            }
        }
        if !swapped {
            break;
        }
    }
}

fn rle_compress(bytes: &[u8]) -> Vec<(u8, u32)> {
    if bytes.is_empty() {
        return Vec::new();
    }

    let mut compressed = Vec::new();
    let mut current = bytes[0];
    let mut count = 1_u32;

    for &byte in &bytes[1..] {
        if byte == current && count < u32::MAX {
            count += 1;
        } else {
            compressed.push((current, count));
            current = byte;
            count = 1;
        }
    }

    compressed.push((current, count));
    compressed
}

fn pseudo_random_values(size: usize) -> Vec<u64> {
    let mut state = 0xC0FFEE_u64;
    (0..size)
        .map(|_| {
            state = state
                .wrapping_mul(6364136223846793005)
                .wrapping_add(1442695040888963407);
            state
        })
        .collect()
}

fn repeated_payload(size: usize) -> Vec<u8> {
    (0..size)
        .map(|index| match index % 19 {
            0..=8 => b'A',
            9..=14 => b'B',
            _ => b'C',
        })
        .collect()
}

fn estimated_memory_bytes(algorithm: &str, input_size: usize) -> usize {
    match algorithm {
        "fibonacci" => 64,
        "rle_compress" => input_size * 2,
        _ => input_size * std::mem::size_of::<u64>(),
    }
}

fn to_json(results: &[BenchmarkResult]) -> String {
    let entries = results
        .iter()
        .map(|result| {
            format!(
                concat!(
                    "  {{\n",
                    "    \"runId\": \"{}\",\n",
                    "    \"algorithm\": \"{}\",\n",
                    "    \"language\": \"{}\",\n",
                    "    \"inputSize\": {},\n",
                    "    \"durationNs\": {},\n",
                    "    \"memoryBytes\": {},\n",
                    "    \"timestamp\": \"{}\"\n",
                    "  }}"
                ),
                result.run_id,
                result.algorithm,
                result.language,
                result.input_size,
                result.duration_ns,
                result.memory_bytes,
                result.timestamp
            )
        })
        .collect::<Vec<_>>()
        .join(",\n");

    format!("[\n{entries}\n]\n")
}

fn arg_value(args: &[String], name: &str) -> Option<String> {
    args.windows(2)
        .find(|window| window[0] == name)
        .map(|window| window[1].clone())
}

fn unix_millis() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or(Duration::from_secs(0))
        .as_millis()
}

fn isoish_timestamp() -> String {
    format!("{}Z", unix_millis())
}
