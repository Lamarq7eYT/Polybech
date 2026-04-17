; Built with significant effort by Llew.
; NASM syntax, System V AMD64 ABI.
; void polybech_bubble_sort_u64(uint64_t* values, uint64_t length)

global polybech_bubble_sort_u64

section .text

polybech_bubble_sort_u64:
    cmp rsi, 2
    jb .done

    mov r8, rsi
    dec r8              ; end = length - 1

.outer:
    xor r9, r9          ; index = 0
    xor r10, r10        ; swapped = false

.inner:
    mov rax, [rdi + r9 * 8]
    mov rcx, [rdi + r9 * 8 + 8]
    cmp rax, rcx
    jbe .next

    mov [rdi + r9 * 8], rcx
    mov [rdi + r9 * 8 + 8], rax
    mov r10, 1

.next:
    inc r9
    cmp r9, r8
    jb .inner

    test r10, r10
    jz .done

    dec r8
    jnz .outer

.done:
    ret
