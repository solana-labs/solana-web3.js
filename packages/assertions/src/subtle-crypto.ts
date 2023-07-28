function assertIsSecureContext() {
    if (__BROWSER__ && !globalThis.isSecureContext) {
        // TODO: Coded error.
        throw new Error(
            'Cryptographic operations are only allowed in secure browser contexts. Read more ' +
                'here: https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts'
        );
    }
}

let cachedEd25519Decision: PromiseLike<boolean> | boolean | undefined;
async function isEd25519CurveSupported(subtle: SubtleCrypto): Promise<boolean> {
    if (cachedEd25519Decision === undefined) {
        cachedEd25519Decision = new Promise(resolve => {
            subtle
                .generateKey('Ed25519', /* extractable */ false, ['sign', 'verify'])
                .catch(() => {
                    resolve((cachedEd25519Decision = false));
                })
                .then(() => {
                    resolve((cachedEd25519Decision = true));
                });
        });
    }
    if (typeof cachedEd25519Decision === 'boolean') {
        return cachedEd25519Decision;
    } else {
        return await cachedEd25519Decision;
    }
}

export async function assertDigestCapabilityIsAvailable() {
    assertIsSecureContext();
    if (typeof globalThis.crypto === 'undefined' || typeof globalThis.crypto.subtle?.digest !== 'function') {
        // TODO: Coded error.
        throw new Error('No digest implementation could be found');
    }
}

export async function assertKeyGenerationIsAvailable() {
    assertIsSecureContext();
    if (typeof globalThis.crypto === 'undefined' || typeof globalThis.crypto.subtle?.generateKey !== 'function') {
        // TODO: Coded error.
        throw new Error('No key generation implementation could be found');
    }
    if (!(await isEd25519CurveSupported(globalThis.crypto.subtle))) {
        // TODO: Coded error.
        throw new Error(
            'This runtime does not support the generation of Ed25519 key pairs.\n\nInstall and ' +
                'import `@solana/webcrypto-ed25519-polyfill` before generating keys in ' +
                'environments that do not support Ed25519.\n\nFor a list of runtimes that ' +
                'currently support Ed25519 operations, visit ' +
                'https://github.com/WICG/webcrypto-secure-curves/issues/20'
        );
    }
}

export async function assertKeyExporterIsAvailable() {
    assertIsSecureContext();
    if (typeof globalThis.crypto === 'undefined' || typeof globalThis.crypto.subtle?.exportKey !== 'function') {
        // TODO: Coded error.
        throw new Error('No key export implementation could be found');
    }
}

export async function assertSigningCapabilityIsAvailable() {
    assertIsSecureContext();
    if (typeof globalThis.crypto === 'undefined' || typeof globalThis.crypto.subtle?.sign !== 'function') {
        // TODO: Coded error.
        throw new Error('No signing implementation could be found');
    }
}

export async function assertVerificationCapabilityIsAvailable() {
    assertIsSecureContext();
    if (typeof globalThis.crypto === 'undefined' || typeof globalThis.crypto.subtle?.verify !== 'function') {
        // TODO: Coded error.
        throw new Error('No signature verification implementation could be found');
    }
}
