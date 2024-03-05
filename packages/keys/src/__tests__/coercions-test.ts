import {
    SOLANA_ERROR__KEYS__INVALID_SIGNATURE_BYTE_LENGTH,
    SOLANA_ERROR__KEYS__SIGNATURE_STRING_LENGTH_OUT_OF_RANGE,
    SolanaError,
} from '@solana/errors';

import { Signature, signature } from '../signatures';

describe('signature', () => {
    it('can coerce to `Signature`', () => {
        // Randomly generated
        const raw =
            '3bwsNoq6EP89sShUAKBeB26aCC3KLGNajRm5wqwr6zRPP3gErZH7erSg3332SVY7Ru6cME43qT35Z7JKpZqCoPaL' as Signature;
        const coerced = signature(
            '3bwsNoq6EP89sShUAKBeB26aCC3KLGNajRm5wqwr6zRPP3gErZH7erSg3332SVY7Ru6cME43qT35Z7JKpZqCoPaL',
        );
        expect(coerced).toBe(raw);
    });
    it.each([63, 89])('throws on a `Signature` whose string length is %s', actualLength => {
        const thisThrows = () => signature('t'.repeat(actualLength));
        expect(thisThrows).toThrow(
            new SolanaError(SOLANA_ERROR__KEYS__SIGNATURE_STRING_LENGTH_OUT_OF_RANGE, {
                actualLength,
            }),
        );
    });
    it.each([
        [63, '3bwsNoq6EP89sShUAKBeB26aCC3KLGNajRm5wqwr6zRPP3gErZH7erSg3332SVY7Ru6cME43qT35Z7JKpZqCoP'],
        [65, 'ZbwsNoq6EP89sShUAKBeB26aCC3KLGNajRm5wqwr6zRPP3gErZH7erSg3332SVY7Ru6cME43qT35Z7JKPZqCoPZZ'],
    ])('throws on a `Signature` whose decoded byte length is %s', (actualLength, encodedSignature) => {
        const thisThrows = () => signature(encodedSignature);
        expect(thisThrows).toThrow(
            new SolanaError(SOLANA_ERROR__KEYS__INVALID_SIGNATURE_BYTE_LENGTH, {
                actualLength,
            }),
        );
    });
});
