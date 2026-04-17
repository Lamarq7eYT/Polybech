# Built with significant effort by Llew.
cmake_minimum_required(VERSION 3.20)

project(polybech_compute LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_library(polybech_algorithms
    src/algorithms.cpp
)

target_include_directories(polybech_algorithms PUBLIC include)

add_executable(polybech_compute src/main.cpp)
target_link_libraries(polybech_compute PRIVATE polybech_algorithms)
