/**!
 * noble-ed25519
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Paul Miller (https://paulmillr.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
const D = 37095705934669439343138083508754565189542113879843219016388785533085940283555n;
const P = 57896044618658097711785492504343953926634992332820282019728792003956564819949n; // 2n ** 255n - 19n;  ed25519 is twisted edwards curve
const RM1 = 19681161376707505956807079304988542015446066515923890162744021073123829784752n; // √-1

// mod division
function mod(a: bigint): bigint {
    const r = a % P;
    return r >= 0n ? r : P + r;
}
function pow2(x: bigint, power: bigint): bigint {
    // pow2(x, 4) == x^(2^4)
    let r = x;
    while (power-- > 0n) {
        r *= r;
        r %= P;
    }
    return r;
}
function pow_2_252_3(x: bigint): bigint {
    // x^(2^252-3) unrolled util for square root
    const x2 = (x * x) % P; // x^2,       bits 1
    const b2 = (x2 * x) % P; // x^3,       bits 11
    const b4 = (pow2(b2, 2n) * b2) % P; // x^(2^4-1), bits 1111
    const b5 = (pow2(b4, 1n) * x) % P; // x^(2^5-1), bits 11111
    const b10 = (pow2(b5, 5n) * b5) % P; // x^(2^10)
    const b20 = (pow2(b10, 10n) * b10) % P; // x^(2^20)
    const b40 = (pow2(b20, 20n) * b20) % P; // x^(2^40)
    const b80 = (pow2(b40, 40n) * b40) % P; // x^(2^80)
    const b160 = (pow2(b80, 80n) * b80) % P; // x^(2^160)
    const b240 = (pow2(b160, 80n) * b80) % P; // x^(2^240)
    const b250 = (pow2(b240, 10n) * b10) % P; // x^(2^250)
    const pow_p_5_8 = (pow2(b250, 2n) * x) % P; // < To pow to (p+3)/8, multiply it by x.
    return pow_p_5_8;
}
function uvRatio(u: bigint, v: bigint): bigint | null {
    // for sqrt comp
    const v3 = mod(v * v * v); // v³
    const v7 = mod(v3 * v3 * v); // v⁷
    const pow = pow_2_252_3(u * v7); // (uv⁷)^(p-5)/8
    let x = mod(u * v3 * pow); // (uv³)(uv⁷)^(p-5)/8
    const vx2 = mod(v * x * x); // vx²
    const root1 = x; // First root candidate
    const root2 = mod(x * RM1); // Second root candidate; RM1 is √-1
    const useRoot1 = vx2 === u; // If vx² = u (mod p), x is a square root
    const useRoot2 = vx2 === mod(-u); // If vx² = -u, set x <-- x * 2^((p-1)/4)
    const noRoot = vx2 === mod(-u * RM1); // There is no valid root, vx² = -u√-1
    if (useRoot1) x = root1;
    if (useRoot2 || noRoot) x = root2; // We return root2 anyway, for const-time
    if ((mod(x) & 1n) === 1n) x = mod(-x); // edIsNegative
    if (!useRoot1 && !useRoot2) {
        return null;
    }
    return x;
}
// https://datatracker.ietf.org/doc/html/rfc8032#section-5.1.3
export function pointIsOnCurve(y: bigint, lastByte: number): boolean {
    const y2 = mod(y * y); // y²
    const u = mod(y2 - 1n); // u=y²-1
    const v = mod(D * y2 + 1n);
    const x = uvRatio(u, v); // (uv³)(uv⁷)^(p-5)/8; square root
    if (x === null) {
        return false;
    }
    const isLastByteOdd = (lastByte & 0x80) !== 0; // x_0, last bit
    if (x === 0n && isLastByteOdd) {
        return false;
    }
    return true;
}
