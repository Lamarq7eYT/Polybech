> Built with significant effort by Llew.

# Assembly Routines

This folder contains NASM x86-64 routines used to contrast hand-tuned code with the Rust and C++ implementations.

Current routines:

- `polybech_fibonacci_asm`: iterative unsigned 64-bit Fibonacci.
- `polybech_bubble_sort_u64`: in-place unsigned 64-bit bubble sort.

They are written for the System V AMD64 ABI. On Windows, wire them through a small adapter or assemble with a Windows-compatible calling convention before linking into the C++ runner.
