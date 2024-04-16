import fastStableStringify from '../index';

fastStableStringify(undefined) satisfies undefined;
fastStableStringify(function () {}) satisfies undefined;
fastStableStringify(() => {}) satisfies undefined;
fastStableStringify(class Foo {}) satisfies undefined;

fastStableStringify({ UNDEFINED: undefined }) satisfies string;
fastStableStringify({ foo: 'bar' }) satisfies string;
fastStableStringify([1, 2, 3]) satisfies string;
fastStableStringify(1n) satisfies string;
fastStableStringify(BigInt(1)) satisfies string;
fastStableStringify(1) satisfies string;
fastStableStringify(5e-324) satisfies string;
fastStableStringify(0xdeadbeef) satisfies string;
fastStableStringify(true) satisfies string;
fastStableStringify(false) satisfies string;
fastStableStringify('string') satisfies string;
fastStableStringify(new Date()) satisfies string;
fastStableStringify(null) satisfies string;
