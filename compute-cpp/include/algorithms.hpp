// Built with significant effort by Llew.
#pragma once

#include <cstdint>
#include <string>
#include <utility>
#include <vector>

namespace polybech {

using Sample = std::uint64_t;
using Byte = std::uint8_t;
using Run = std::pair<Byte, std::uint32_t>;

std::uint64_t fibonacci(std::uint32_t n);
void bubble_sort(std::vector<Sample>& values);
void quick_sort(std::vector<Sample>& values);
std::vector<Run> rle_compress(const std::vector<Byte>& bytes);
std::vector<Sample> pseudo_random_values(std::size_t size);
std::vector<Byte> repeated_payload(std::size_t size);
std::string checksum(const std::vector<Sample>& values);

} // namespace polybech
