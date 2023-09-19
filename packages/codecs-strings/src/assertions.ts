import { InvalidBaseStringError } from './errors';

/**
 * Asserts that a given buffer is not empty.
 */
export function assertValidBaseString(value: string, alphabet: string) {
    if (!value.match(new RegExp(`^[${alphabet}]*$`))) {
        throw new InvalidBaseStringError(value, alphabet.length);
    }
}
