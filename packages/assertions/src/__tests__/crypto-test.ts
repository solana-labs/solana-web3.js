import { SOLANA_ERROR__CRYPTO__RANDOM_VALUES_FUNCTION_UNIMPLEMENTED, SolanaError } from '@solana/errors';

import { assertPRNGIsAvailable } from '../crypto';

describe('assertPRNGIsAvailable()', () => {
    describe('when getRandomValues is available', () => {
        it('does not throw', () => {
            expect(assertPRNGIsAvailable).not.toThrow();
        });
        it('returns `undefined`', () => {
            expect(assertPRNGIsAvailable()).toBeUndefined();
        });
    });
    describe('when getRandomValues is not available', () => {
        let oldCrypto: InstanceType<typeof Crypto>['getRandomValues'];
        beforeEach(() => {
            oldCrypto = globalThis.crypto.getRandomValues;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            globalThis.crypto.getRandomValues = undefined;
        });
        afterEach(() => {
            globalThis.crypto.getRandomValues = oldCrypto;
        });
        it('throws', () => {
            expect(assertPRNGIsAvailable).toThrow(
                new SolanaError(SOLANA_ERROR__CRYPTO__RANDOM_VALUES_FUNCTION_UNIMPLEMENTED),
            );
        });
    });
});
