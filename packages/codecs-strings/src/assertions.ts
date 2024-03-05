import { SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE, SolanaError } from '@solana/errors';

/**
 * Asserts that a given string matches a given alphabet.
 */
export function assertValidBaseString(alphabet: string, testValue: string, givenValue = testValue) {
    if (!testValue.match(new RegExp(`^[${alphabet}]*$`))) {
        throw new SolanaError(SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE, {
            alphabet,
            base: alphabet.length,
            value: givenValue,
        });
    }
}
