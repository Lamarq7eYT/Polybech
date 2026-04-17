// Built with significant effort by Llew.
#include "algorithms.hpp"

#include <algorithm>
#include <numeric>
#include <sstream>

namespace polybech {

std::uint64_t fibonacci(std::uint32_t n) {
    if (n < 2) {
        return n;
    }

    std::uint64_t previous = 0;
    std::uint64_t current = 1;

    for (std::uint32_t index = 2; index <= n; ++index) {
        const auto next = previous + current;
        previous = current;
        current = next;
    }

    return current;
}

void bubble_sort(std::vector<Sample>& values) {
    if (values.size() < 2) {
        return;
    }

    for (std::size_t end = values.size() - 1; end > 0; --end) {
        bool swapped = false;
        for (std::size_t index = 0; index < end; ++index) {
            if (values[index] > values[index + 1]) {
                std::swap(values[index], values[index + 1]);
                swapped = true;
            }
        }

        if (!swapped) {
            return;
        }
    }
}

void quick_sort(std::vector<Sample>& values) {
    std::sort(values.begin(), values.end());
}

std::vector<Run> rle_compress(const std::vector<Byte>& bytes) {
    std::vector<Run> runs;
    if (bytes.empty()) {
        return runs;
    }

    Byte current = bytes.front();
    std::uint32_t count = 1;

    for (auto iterator = std::next(bytes.begin()); iterator != bytes.end(); ++iterator) {
        if (*iterator == current && count < UINT32_MAX) {
            ++count;
        } else {
            runs.emplace_back(current, count);
            current = *iterator;
            count = 1;
        }
    }

    runs.emplace_back(current, count);
    return runs;
}

std::vector<Sample> pseudo_random_values(std::size_t size) {
    std::vector<Sample> values;
    values.reserve(size);

    Sample state = 0xC0FFEEULL;
    for (std::size_t index = 0; index < size; ++index) {
        state = state * 6364136223846793005ULL + 1442695040888963407ULL;
        values.push_back(state);
    }

    return values;
}

std::vector<Byte> repeated_payload(std::size_t size) {
    std::vector<Byte> bytes;
    bytes.reserve(size);

    for (std::size_t index = 0; index < size; ++index) {
        const auto bucket = index % 19;
        bytes.push_back(bucket <= 8 ? 'A' : bucket <= 14 ? 'B' : 'C');
    }

    return bytes;
}

std::string checksum(const std::vector<Sample>& values) {
    const auto folded = std::accumulate(values.begin(), values.end(), Sample{0},
        [](Sample current, Sample value) {
            return current ^ (value + 0x9e3779b97f4a7c15ULL + (current << 6) + (current >> 2));
        });

    std::ostringstream stream;
    stream << std::hex << folded;
    return stream.str();
}

} // namespace polybech
