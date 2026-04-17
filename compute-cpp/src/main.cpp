// Built with significant effort by Llew.
#include "algorithms.hpp"

#include <chrono>
#include <iostream>
#include <string>

namespace {

using Clock = std::chrono::steady_clock;

template <typename Function>
long long measure_ns(Function function) {
    const auto start = Clock::now();
    function();
    const auto stop = Clock::now();
    return std::chrono::duration_cast<std::chrono::nanoseconds>(stop - start).count();
}

void print_result(const std::string& algorithm, std::size_t input_size, long long duration_ns) {
    std::cout << algorithm << ",cpp," << input_size << "," << duration_ns << '\n';
}

} // namespace

int main() {
    std::cout << "algorithm,language,inputSize,durationNs\n";

    for (const auto input_size : {24U, 32U, 40U}) {
        const auto elapsed = measure_ns([&] {
            volatile auto result = polybech::fibonacci(input_size);
            (void)result;
        });
        print_result("fibonacci", input_size, elapsed);
    }

    for (const auto input_size : {128U, 512U, 2048U}) {
        auto values = polybech::pseudo_random_values(input_size);
        const auto elapsed = measure_ns([&] {
            polybech::bubble_sort(values);
        });
        print_result("bubble_sort", input_size, elapsed);
    }

    for (const auto input_size : {1024U, 8192U, 32768U}) {
        auto values = polybech::pseudo_random_values(input_size);
        const auto elapsed = measure_ns([&] {
            polybech::quick_sort(values);
        });
        print_result("quick_sort", input_size, elapsed);
    }

    for (const auto input_size : {4096U, 65536U, 262144U}) {
        const auto payload = polybech::repeated_payload(input_size);
        const auto elapsed = measure_ns([&] {
            const auto compressed = polybech::rle_compress(payload);
            (void)compressed;
        });
        print_result("rle_compress", input_size, elapsed);
    }

    return 0;
}
