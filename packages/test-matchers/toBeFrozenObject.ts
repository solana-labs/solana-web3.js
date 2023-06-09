expect.extend({
    toBeFrozenObject(actual: object) {
        return {
            message: () => `Expected object ${this.isNot ? 'not ' : ''}to be frozen`,
            pass: Object.isFrozen(actual),
        };
    },
});

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        interface AsymmetricMatchers {
            toBeFrozenObject(): void;
        }
        interface Matchers<R> {
            toBeFrozenObject(): R;
        }
    }
}

export {};
