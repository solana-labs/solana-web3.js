export class SolanaJsonRpcIntegerOverflowError extends Error {
    readonly methodName: string;
    readonly keyPath: (number | string)[];
    readonly value: bigint;
    constructor(methodName: string, keyPath: (number | string)[], value: bigint) {
        const argPosition = (typeof keyPath[0] === 'number' ? keyPath[0] : parseInt(keyPath[0], 10)) + 1;
        let ordinal = '';
        const lastDigit = argPosition % 10;
        const lastTwoDigits = argPosition % 100;
        if (lastDigit == 1 && lastTwoDigits != 11) {
            ordinal = argPosition + 'st';
        } else if (lastDigit == 2 && lastTwoDigits != 12) {
            ordinal = argPosition + 'nd';
        } else if (lastDigit == 3 && lastTwoDigits != 13) {
            ordinal = argPosition + 'rd';
        } else {
            ordinal = argPosition + 'th';
        }
        const path =
            keyPath.length > 1
                ? keyPath
                      .slice(1)
                      .map(pathPart => (typeof pathPart === 'number' ? `[${pathPart}]` : pathPart))
                      .join('.')
                : null;
        super(
            `The ${ordinal} argument to the \`${methodName}\` RPC method` +
                `${path ? ` at path \`${path}\`` : ''} was \`${value}\`. This number is ` +
                'unsafe for use with the Solana JSON-RPC because it exceeds ' +
                '`Number.MAX_SAFE_INTEGER`.'
        );
        this.keyPath = keyPath;
        this.methodName = methodName;
        this.value = value;
    }
    get name() {
        return 'SolanaJsonRpcIntegerOverflowError';
    }
}
