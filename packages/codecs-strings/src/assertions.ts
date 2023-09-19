import { InvalidBaseStringError } from './errors';

/**
 * Asserts that a given buffer is not empty.
 */
export function assertValidBaseString(alphabet: string, value: string, rawValue = value) {
    if (!value.match(new RegExp(`^[${alphabet}]*$`))) {
        throw new InvalidBaseStringError(rawValue, alphabet.length);
    }
}
