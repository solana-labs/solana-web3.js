import { SOLANA_ERROR__CRYPTO__RANDOM_VALUES_FUNCTION_UNIMPLEMENTED, SolanaError } from '@solana/errors';

import { assertPRNGIsAvailable } from '../crypto';

describe('assertPRNGIsAvailable()', () => {
    it('resolves to `undefined` without throwing', async () => {
        expect.assertions(1);
        await expect(assertPRNGIsAvailable()).resolves.toBeUndefined();
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
        it('rejects', async () => {
            expect.assertions(1);
            await expect(() => assertPRNGIsAvailable()).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__CRYPTO__RANDOM_VALUES_FUNCTION_UNIMPLEMENTED),
            );
        });
    });
});
