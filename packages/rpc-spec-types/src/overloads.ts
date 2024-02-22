export type OverloadImplementations<T, U extends keyof T> = Overloads<T[U]>;
export type Overloads<T> = Overloads24<T>;
type Overloads24<T> =
    // Have an RPC method with more than 24 overloads? Add another section and update this comment
    T extends {
        (...args: infer A1): infer R1;
        (...args: infer A2): infer R2;
        (...args: infer A3): infer R3;
        (...args: infer A4): infer R4;
        (...args: infer A5): infer R5;
        (...args: infer A6): infer R6;
        (...args: infer A7): infer R7;
        (...args: infer A8): infer R8;
        (...args: infer A9): infer R9;
        (...args: infer A10): infer R10;
        (...args: infer A11): infer R11;
        (...args: infer A12): infer R12;
        (...args: infer A13): infer R13;
        (...args: infer A14): infer R14;
        (...args: infer A15): infer R15;
        (...args: infer A16): infer R16;
        (...args: infer A17): infer R17;
        (...args: infer A18): infer R18;
        (...args: infer A19): infer R19;
        (...args: infer A20): infer R20;
        (...args: infer A21): infer R21;
        (...args: infer A22): infer R22;
        (...args: infer A23): infer R23;
        (...args: infer A24): infer R24;
    }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
              (...args: A9) => R9,
              (...args: A10) => R10,
              (...args: A11) => R11,
              (...args: A12) => R12,
              (...args: A13) => R13,
              (...args: A14) => R14,
              (...args: A15) => R15,
              (...args: A16) => R16,
              (...args: A17) => R17,
              (...args: A18) => R18,
              (...args: A19) => R19,
              (...args: A20) => R20,
              (...args: A21) => R21,
              (...args: A22) => R22,
              (...args: A23) => R23,
              (...args: A24) => R24,
          ]
        : Overloads23<T>;
type Overloads23<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
    (...args: infer A8): infer R8;
    (...args: infer A9): infer R9;
    (...args: infer A10): infer R10;
    (...args: infer A11): infer R11;
    (...args: infer A12): infer R12;
    (...args: infer A13): infer R13;
    (...args: infer A14): infer R14;
    (...args: infer A15): infer R15;
    (...args: infer A16): infer R16;
    (...args: infer A17): infer R17;
    (...args: infer A18): infer R18;
    (...args: infer A19): infer R19;
    (...args: infer A20): infer R20;
    (...args: infer A21): infer R21;
    (...args: infer A22): infer R22;
    (...args: infer A23): infer R23;
}
    ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3,
          (...args: A4) => R4,
          (...args: A5) => R5,
          (...args: A6) => R6,
          (...args: A7) => R7,
          (...args: A8) => R8,
          (...args: A9) => R9,
          (...args: A10) => R10,
          (...args: A11) => R11,
          (...args: A12) => R12,
          (...args: A13) => R13,
          (...args: A14) => R14,
          (...args: A15) => R15,
          (...args: A16) => R16,
          (...args: A17) => R17,
          (...args: A18) => R18,
          (...args: A19) => R19,
          (...args: A20) => R20,
          (...args: A21) => R21,
          (...args: A22) => R22,
          (...args: A23) => R23,
      ]
    : Overloads22<T>;
type Overloads22<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
    (...args: infer A8): infer R8;
    (...args: infer A9): infer R9;
    (...args: infer A10): infer R10;
    (...args: infer A11): infer R11;
    (...args: infer A12): infer R12;
    (...args: infer A13): infer R13;
    (...args: infer A14): infer R14;
    (...args: infer A15): infer R15;
    (...args: infer A16): infer R16;
    (...args: infer A17): infer R17;
    (...args: infer A18): infer R18;
    (...args: infer A19): infer R19;
    (...args: infer A20): infer R20;
    (...args: infer A21): infer R21;
    (...args: infer A22): infer R22;
}
    ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3,
          (...args: A4) => R4,
          (...args: A5) => R5,
          (...args: A6) => R6,
          (...args: A7) => R7,
          (...args: A8) => R8,
          (...args: A9) => R9,
          (...args: A10) => R10,
          (...args: A11) => R11,
          (...args: A12) => R12,
          (...args: A13) => R13,
          (...args: A14) => R14,
          (...args: A15) => R15,
          (...args: A16) => R16,
          (...args: A17) => R17,
          (...args: A18) => R18,
          (...args: A19) => R19,
          (...args: A20) => R20,
          (...args: A21) => R21,
          (...args: A22) => R22,
      ]
    : Overloads21<T>;
type Overloads21<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
    (...args: infer A8): infer R8;
    (...args: infer A9): infer R9;
    (...args: infer A10): infer R10;
    (...args: infer A11): infer R11;
    (...args: infer A12): infer R12;
    (...args: infer A13): infer R13;
    (...args: infer A14): infer R14;
    (...args: infer A15): infer R15;
    (...args: infer A16): infer R16;
    (...args: infer A17): infer R17;
    (...args: infer A18): infer R18;
    (...args: infer A19): infer R19;
    (...args: infer A20): infer R20;
    (...args: infer A21): infer R21;
}
    ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3,
          (...args: A4) => R4,
          (...args: A5) => R5,
          (...args: A6) => R6,
          (...args: A7) => R7,
          (...args: A8) => R8,
          (...args: A9) => R9,
          (...args: A10) => R10,
          (...args: A11) => R11,
          (...args: A12) => R12,
          (...args: A13) => R13,
          (...args: A14) => R14,
          (...args: A15) => R15,
          (...args: A16) => R16,
          (...args: A17) => R17,
          (...args: A18) => R18,
          (...args: A19) => R19,
          (...args: A20) => R20,
          (...args: A21) => R21,
      ]
    : Overloads20<T>;
type Overloads20<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
    (...args: infer A8): infer R8;
    (...args: infer A9): infer R9;
    (...args: infer A10): infer R10;
    (...args: infer A11): infer R11;
    (...args: infer A12): infer R12;
    (...args: infer A13): infer R13;
    (...args: infer A14): infer R14;
    (...args: infer A15): infer R15;
    (...args: infer A16): infer R16;
    (...args: infer A17): infer R17;
    (...args: infer A18): infer R18;
    (...args: infer A19): infer R19;
    (...args: infer A20): infer R20;
}
    ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3,
          (...args: A4) => R4,
          (...args: A5) => R5,
          (...args: A6) => R6,
          (...args: A7) => R7,
          (...args: A8) => R8,
          (...args: A9) => R9,
          (...args: A10) => R10,
          (...args: A11) => R11,
          (...args: A12) => R12,
          (...args: A13) => R13,
          (...args: A14) => R14,
          (...args: A15) => R15,
          (...args: A16) => R16,
          (...args: A17) => R17,
          (...args: A18) => R18,
          (...args: A19) => R19,
          (...args: A20) => R20,
      ]
    : Overloads19<T>;
type Overloads19<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
    (...args: infer A8): infer R8;
    (...args: infer A9): infer R9;
    (...args: infer A10): infer R10;
    (...args: infer A11): infer R11;
    (...args: infer A12): infer R12;
    (...args: infer A13): infer R13;
    (...args: infer A14): infer R14;
    (...args: infer A15): infer R15;
    (...args: infer A16): infer R16;
    (...args: infer A17): infer R17;
    (...args: infer A18): infer R18;
    (...args: infer A19): infer R19;
}
    ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3,
          (...args: A4) => R4,
          (...args: A5) => R5,
          (...args: A6) => R6,
          (...args: A7) => R7,
          (...args: A8) => R8,
          (...args: A9) => R9,
          (...args: A10) => R10,
          (...args: A11) => R11,
          (...args: A12) => R12,
          (...args: A13) => R13,
          (...args: A14) => R14,
          (...args: A15) => R15,
          (...args: A16) => R16,
          (...args: A17) => R17,
          (...args: A18) => R18,
          (...args: A19) => R19,
      ]
    : Overloads18<T>;
type Overloads18<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
    (...args: infer A8): infer R8;
    (...args: infer A9): infer R9;
    (...args: infer A10): infer R10;
    (...args: infer A11): infer R11;
    (...args: infer A12): infer R12;
    (...args: infer A13): infer R13;
    (...args: infer A14): infer R14;
    (...args: infer A15): infer R15;
    (...args: infer A16): infer R16;
    (...args: infer A17): infer R17;
    (...args: infer A18): infer R18;
}
    ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3,
          (...args: A4) => R4,
          (...args: A5) => R5,
          (...args: A6) => R6,
          (...args: A7) => R7,
          (...args: A8) => R8,
          (...args: A9) => R9,
          (...args: A10) => R10,
          (...args: A11) => R11,
          (...args: A12) => R12,
          (...args: A13) => R13,
          (...args: A14) => R14,
          (...args: A15) => R15,
          (...args: A16) => R16,
          (...args: A17) => R17,
          (...args: A18) => R18,
      ]
    : Overloads17<T>;
type Overloads17<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
    (...args: infer A8): infer R8;
    (...args: infer A9): infer R9;
    (...args: infer A10): infer R10;
    (...args: infer A11): infer R11;
    (...args: infer A12): infer R12;
    (...args: infer A13): infer R13;
    (...args: infer A14): infer R14;
    (...args: infer A15): infer R15;
    (...args: infer A16): infer R16;
    (...args: infer A17): infer R17;
}
    ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3,
          (...args: A4) => R4,
          (...args: A5) => R5,
          (...args: A6) => R6,
          (...args: A7) => R7,
          (...args: A8) => R8,
          (...args: A9) => R9,
          (...args: A10) => R10,
          (...args: A11) => R11,
          (...args: A12) => R12,
          (...args: A13) => R13,
          (...args: A14) => R14,
          (...args: A15) => R15,
          (...args: A16) => R16,
          (...args: A17) => R17,
      ]
    : Overloads16<T>;
type Overloads16<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
    (...args: infer A8): infer R8;
    (...args: infer A9): infer R9;
    (...args: infer A10): infer R10;
    (...args: infer A11): infer R11;
    (...args: infer A12): infer R12;
    (...args: infer A13): infer R13;
    (...args: infer A14): infer R14;
    (...args: infer A15): infer R15;
    (...args: infer A16): infer R16;
}
    ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3,
          (...args: A4) => R4,
          (...args: A5) => R5,
          (...args: A6) => R6,
          (...args: A7) => R7,
          (...args: A8) => R8,
          (...args: A9) => R9,
          (...args: A10) => R10,
          (...args: A11) => R11,
          (...args: A12) => R12,
          (...args: A13) => R13,
          (...args: A14) => R14,
          (...args: A15) => R15,
          (...args: A16) => R16,
      ]
    : Overloads15<T>;
type Overloads15<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
    (...args: infer A8): infer R8;
    (...args: infer A9): infer R9;
    (...args: infer A10): infer R10;
    (...args: infer A11): infer R11;
    (...args: infer A12): infer R12;
    (...args: infer A13): infer R13;
    (...args: infer A14): infer R14;
    (...args: infer A15): infer R15;
}
    ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3,
          (...args: A4) => R4,
          (...args: A5) => R5,
          (...args: A6) => R6,
          (...args: A7) => R7,
          (...args: A8) => R8,
          (...args: A9) => R9,
          (...args: A10) => R10,
          (...args: A11) => R11,
          (...args: A12) => R12,
          (...args: A13) => R13,
          (...args: A14) => R14,
          (...args: A15) => R15,
      ]
    : Overloads14<T>;
type Overloads14<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
    (...args: infer A8): infer R8;
    (...args: infer A9): infer R9;
    (...args: infer A10): infer R10;
    (...args: infer A11): infer R11;
    (...args: infer A12): infer R12;
    (...args: infer A13): infer R13;
    (...args: infer A14): infer R14;
}
    ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3,
          (...args: A4) => R4,
          (...args: A5) => R5,
          (...args: A6) => R6,
          (...args: A7) => R7,
          (...args: A8) => R8,
          (...args: A9) => R9,
          (...args: A10) => R10,
          (...args: A11) => R11,
          (...args: A12) => R12,
          (...args: A13) => R13,
          (...args: A14) => R14,
      ]
    : Overloads13<T>;
type Overloads13<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
    (...args: infer A8): infer R8;
    (...args: infer A9): infer R9;
    (...args: infer A10): infer R10;
    (...args: infer A11): infer R11;
    (...args: infer A12): infer R12;
    (...args: infer A13): infer R13;
}
    ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3,
          (...args: A4) => R4,
          (...args: A5) => R5,
          (...args: A6) => R6,
          (...args: A7) => R7,
          (...args: A8) => R8,
          (...args: A9) => R9,
          (...args: A10) => R10,
          (...args: A11) => R11,
          (...args: A12) => R12,
          (...args: A13) => R13,
      ]
    : Overloads12<T>;
type Overloads12<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
    (...args: infer A8): infer R8;
    (...args: infer A9): infer R9;
    (...args: infer A10): infer R10;
    (...args: infer A11): infer R11;
    (...args: infer A12): infer R12;
}
    ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3,
          (...args: A4) => R4,
          (...args: A5) => R5,
          (...args: A6) => R6,
          (...args: A7) => R7,
          (...args: A8) => R8,
          (...args: A9) => R9,
          (...args: A10) => R10,
          (...args: A11) => R11,
          (...args: A12) => R12,
      ]
    : Overloads11<T>;
type Overloads11<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
    (...args: infer A8): infer R8;
    (...args: infer A9): infer R9;
    (...args: infer A10): infer R10;
    (...args: infer A11): infer R11;
}
    ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3,
          (...args: A4) => R4,
          (...args: A5) => R5,
          (...args: A6) => R6,
          (...args: A7) => R7,
          (...args: A8) => R8,
          (...args: A9) => R9,
          (...args: A10) => R10,
          (...args: A11) => R11,
      ]
    : Overloads10<T>;
type Overloads10<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
    (...args: infer A8): infer R8;
    (...args: infer A9): infer R9;
    (...args: infer A10): infer R10;
}
    ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3,
          (...args: A4) => R4,
          (...args: A5) => R5,
          (...args: A6) => R6,
          (...args: A7) => R7,
          (...args: A8) => R8,
          (...args: A9) => R9,
          (...args: A10) => R10,
      ]
    : Overloads9<T>;
type Overloads9<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
    (...args: infer A8): infer R8;
    (...args: infer A9): infer R9;
}
    ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3,
          (...args: A4) => R4,
          (...args: A5) => R5,
          (...args: A6) => R6,
          (...args: A7) => R7,
          (...args: A8) => R8,
          (...args: A9) => R9,
      ]
    : Overloads8<T>;
type Overloads8<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
    (...args: infer A8): infer R8;
}
    ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3,
          (...args: A4) => R4,
          (...args: A5) => R5,
          (...args: A6) => R6,
          (...args: A7) => R7,
          (...args: A8) => R8,
      ]
    : Overloads7<T>;
type Overloads7<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
}
    ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3,
          (...args: A4) => R4,
          (...args: A5) => R5,
          (...args: A6) => R6,
          (...args: A7) => R7,
      ]
    : Overloads6<T>;
type Overloads6<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
}
    ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3,
          (...args: A4) => R4,
          (...args: A5) => R5,
          (...args: A6) => R6,
      ]
    : Overloads5<T>;
type Overloads5<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
}
    ? [(...args: A1) => R1, (...args: A2) => R2, (...args: A3) => R3, (...args: A4) => R4, (...args: A5) => R5]
    : Overloads4<T>;
type Overloads4<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
}
    ? [(...args: A1) => R1, (...args: A2) => R2, (...args: A3) => R3, (...args: A4) => R4]
    : Overloads3<T>;
type Overloads3<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
}
    ? [(...args: A1) => R1, (...args: A2) => R2, (...args: A3) => R3]
    : Overloads2<T>;
type Overloads2<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
}
    ? [(...args: A1) => R1, (...args: A2) => R2]
    : Overloads1<T>;
type Overloads1<T> = T extends {
    (...args: infer A1): infer R1;
}
    ? [(...args: A1) => R1]
    : unknown;
