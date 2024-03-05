import { SOLANA_ERROR__KEYS__INVALID_PRIVATE_KEY_BYTE_LENGTH, SolanaError } from '@solana/errors';

function addPkcs8Header(bytes: Uint8Array): Uint8Array {
    // prettier-ignore
    return new Uint8Array([
        /**
         * PKCS#8 header
         */
        0x30, // ASN.1 sequence tag
        0x2e, // Length of sequence (46 more bytes)

            0x02, // ASN.1 integer tag
            0x01, // Length of integer
                0x00, // Version number

            0x30, // ASN.1 sequence tag
            0x05, // Length of sequence
                0x06, // ASN.1 object identifier tag
                0x03, // Length of object identifier
                    // Edwards curve algorithms identifier https://oid-rep.orange-labs.fr/get/1.3.101.112
                        0x2b, // iso(1) / identified-organization(3) (The first node is multiplied by the decimal 40 and the result is added to the value of the second node)
                        0x65, // thawte(101)
                    // Ed25519 identifier
                        0x70, // id-Ed25519(112)

        /**
         * Private key payload
         */
        0x04, // ASN.1 octet string tag
        0x22, // String length (34 more bytes)

            // Private key bytes as octet string
            0x04, // ASN.1 octet string tag
            0x20, // String length (32 bytes)

        ...bytes
    ]);
}

export async function createPrivateKeyFromBytes(bytes: Uint8Array, extractable?: boolean): Promise<CryptoKey> {
    const actualLength = bytes.byteLength;
    if (actualLength !== 32) {
        throw new SolanaError(SOLANA_ERROR__KEYS__INVALID_PRIVATE_KEY_BYTE_LENGTH, {
            actualLength,
        });
    }
    const privateKeyBytesPkcs8 = addPkcs8Header(bytes);
    return await crypto.subtle.importKey('pkcs8', privateKeyBytesPkcs8, 'Ed25519', extractable ?? false, ['sign']);
}
