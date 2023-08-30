expect.extend({
    nullableBigInt(received) {
        if (received === null || typeof received === 'bigint') {
            return {
                message: () => `expected ${received} not to be a \`bigint\` or \`null\``,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${received} to be a \`bigint\` or \`null\``,
                pass: false,
            };
        }
    },
});

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        interface AsymmetricMatchers {
            nullableBigInt(): void;
        }
        interface Matchers<R> {
            nullableBigInt(): R;
        }
    }
}

export {};
