/**
 * Asserts that a given string matches a given alphabet.
 */
export function assertValidBaseString(alphabet: string, testValue: string, givenValue = testValue) {
    if (!testValue.match(new RegExp(`^[${alphabet}]*$`))) {
        // TODO: Coded error.
        throw new Error(`Expected a string of base ${alphabet.length}, got [${givenValue}].`);
    }
}
