; Built with significant effort by Llew.
; NASM syntax, System V AMD64 ABI.
; uint64_t polybech_fibonacci_asm(uint64_t n)

global polybech_fibonacci_asm

section .text

polybech_fibonacci_asm:
    cmp rdi, 1
    jbe .base_case

    xor rax, rax        ; previous = 0
    mov rcx, 1          ; current = 1
    mov rdx, 2          ; index = 2

.loop:
    mov r8, rax
    add r8, rcx         ; next = previous + current
    mov rax, rcx
    mov rcx, r8
    inc rdx
    cmp rdx, rdi
    jbe .loop

    mov rax, rcx
    ret

.base_case:
    mov rax, rdi
    ret
