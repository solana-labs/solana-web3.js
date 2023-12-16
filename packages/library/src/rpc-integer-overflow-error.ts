import { KeyPath } from '@solana/rpc-core/dist/types/tree-traversal';

export class SolanaJsonRpcIntegerOverflowError extends Error {
    readonly methodName: string;
    readonly keyPath: KeyPath;
    readonly value: bigint;
    constructor(methodName: string, keyPath: KeyPath, value: bigint) {
        let argumentLabel = '';
        if (typeof keyPath[0] === 'number') {
            const argPosition = keyPath[0] + 1;
            const lastDigit = argPosition % 10;
            const lastTwoDigits = argPosition % 100;
            if (lastDigit == 1 && lastTwoDigits != 11) {
                argumentLabel = argPosition + 'st';
            } else if (lastDigit == 2 && lastTwoDigits != 12) {
                argumentLabel = argPosition + 'nd';
            } else if (lastDigit == 3 && lastTwoDigits != 13) {
                argumentLabel = argPosition + 'rd';
            } else {
                argumentLabel = argPosition + 'th';
            }
        } else {
            argumentLabel = `\`${keyPath[0].toString()}\``;
        }
        const path =
            keyPath.length > 1
                ? keyPath
                      .slice(1)
                      .map(pathPart => (typeof pathPart === 'number' ? `[${pathPart}]` : pathPart))
                      .join('.')
                : null;
        super(
            `The ${argumentLabel} argument to the \`${methodName}\` RPC method` +
                `${path ? ` at path \`${path}\`` : ''} was \`${value}\`. This number is ` +
                'unsafe for use with the Solana JSON-RPC because it exceeds ' +
                '`Number.MAX_SAFE_INTEGER`.',
        );
        this.keyPath = keyPath;
        this.methodName = methodName;
        this.value = value;
    }
    get name() {
        return 'SolanaJsonRpcIntegerOverflowError';
    }
}
