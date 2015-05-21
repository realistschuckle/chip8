# chip8
A CHIP-8 emulator in ECMAscript

## Opcodes
```
  00E0     Clear display
✔ 00EE     Return from subroutine
✔ 1NNN     Jump to NNN
✔ 2NNN     Call subroutine at NNN
✔ 3XKK     Skip next instruction if VX == KK
✔ 4XKK     Skip next instruction if VX <> KK
✔ 5XY0     Skip next instruction if VX == VY
✔ 6XKK     VX := KK
✔ 7XKK     VX := VX + KK
✔ 8XY0     VX := VY, VF may change
✔ 8XY1     VX := VX or VY, VF may change
✔ 8XY2     VX := VX and VY, VF may change
✔ 8XY3     VX := VX xor VY, VF may change
✔ 8XY4     VX := VX + VY, VF := carry
✔ 8XY5     VX := VX - VY, VF := not borrow
✔ 8XY6     VX := VX shr 1, VF := carry
✔ 8XY7     VX := VY - VX, VF := not borrow
✔ 8XYE     VX := VX shl 1, VF := carry
✔ 9XY0     Skip next instruction if VX <> VY
✔ ANNN     I := NNN
✔ BNNN     Jump to NNN+V0
✔ CXKK     VX := pseudorandom_number and KK
  EX9E     Skip next instruction if key VX pressed
  EXA1     Skip next instruction if key VX not pressed
  FX07     VX := delay_timer
  FX0A     wait for keypress, store hex value of key in VX
  FX15     delay_timer := VX
  FX18     sound_timer := VX
✔ FX1E     I := I + VX
  FX29     Point I to 5-byte font sprite for hex character VX
✔ FX33     Store BCD representation of VX in M(I)..M(I+2)
✔ FX55     Store V0..VX in memory starting at M(I)
✔ FX65     Read V0..VX from memory starting at M(I)
```
