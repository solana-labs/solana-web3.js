import { generateKeyPolyfill } from './secrets';

if (!__BROWSER__ || globalThis.isSecureContext) {
    /**
     * Create `crypto.subtle` if it doesn't exist.
     */
    const originalCryptoObject = (globalThis.crypto ||= {} as Crypto);
    const originalSubtleCrypto = ((originalCryptoObject as Crypto & { subtle: SubtleCrypto }).subtle ||=
        {} as SubtleCrypto);

    /**
     * Override `SubtleCrypto#generateKey`
     */
    const originalGenerateKey = originalSubtleCrypto.generateKey as SubtleCrypto['generateKey'] | undefined;
    let originalGenerateKeySupportsEd25519: Promise<boolean> | boolean | undefined;
    originalSubtleCrypto.generateKey = (async (...args: Parameters<SubtleCrypto['generateKey']>) => {
        const [algorithm] = args;
        if (algorithm !== 'Ed25519') {
            if (originalGenerateKey) {
                return await originalGenerateKey.apply(originalSubtleCrypto, args);
            } else {
                throw new TypeError('No native `generateKey` function exists to handle this call');
            }
        }
        let optimisticallyGeneratedKeyPair;
        if (originalGenerateKeySupportsEd25519 === undefined) {
            originalGenerateKeySupportsEd25519 = new Promise(resolve => {
                if (!originalGenerateKey) {
                    resolve((originalGenerateKeySupportsEd25519 = false));
                    return;
                }
                originalGenerateKey
                    .apply(originalSubtleCrypto, args)
                    .then(keyPair => {
                        if (__DEV__) {
                            console.warn(
                                '`@solana/webcrypto-ed25519-polyfill` was included in an ' +
                                    'environment that supports Ed25519 key manipulation ' +
                                    'natively. Falling back to the native implementation. ' +
                                    'Consider including this polyfill only in environments where ' +
                                    'Ed25519 is not supported.'
                            );
                        }
                        if (originalSubtleCrypto.generateKey !== originalGenerateKey) {
                            originalSubtleCrypto.generateKey = originalGenerateKey;
                        }
                        optimisticallyGeneratedKeyPair = keyPair;
                        resolve((originalGenerateKeySupportsEd25519 = true));
                    })
                    .catch(() => {
                        resolve((originalGenerateKeySupportsEd25519 = false));
                    });
            });
        }
        if (
            typeof originalGenerateKeySupportsEd25519 === 'boolean'
                ? originalGenerateKeySupportsEd25519
                : await originalGenerateKeySupportsEd25519
        ) {
            if (optimisticallyGeneratedKeyPair) {
                return optimisticallyGeneratedKeyPair;
            } else if (originalGenerateKey) {
                return await originalGenerateKey.apply(originalSubtleCrypto, args);
            } else {
                throw new TypeError('No native `generateKey` function exists to handle this call');
            }
        } else {
            const [_, extractable, keyUsages] = args;
            return generateKeyPolyfill(extractable, keyUsages);
        }
    }) as SubtleCrypto['generateKey'];
}
