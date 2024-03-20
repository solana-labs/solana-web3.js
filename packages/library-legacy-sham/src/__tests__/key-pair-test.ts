import { utils } from '@noble/ed25519';

import { Keypair } from '../key-pair.js';
import { PublicKey } from '../public-key.js';

const MOCK_PRIVATE_KEY_BYTES = [
    151, 227, 37, 180, 104, 169, 5, 53, 191, 115, 132, 187, 223, 228, 25, 52, 7, 50, 86, 18, 151, 45, 105, 68, 31, 21,
    128, 21, 32, 16, 222, 239,
];
const MOCK_PUBLIC_KEY_BYTES = [
    117, 62, 75, 185, 26, 65, 209, 23, 95, 56, 97, 216, 197, 215, 208, 14, 138, 142, 59, 114, 43, 60, 190, 86, 21, 58,
    46, 232, 77, 145, 46, 101,
];

describe('KeypairSham', () => {
    it.each(['fromSecretKey', 'fromSeed'] as (keyof typeof Keypair)[])('throws when calling `%s`', method => {
        expect(() =>
            // This is basically just complaining that `prototype` is not callable.
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            Keypair[method](),
        ).toThrow(`Keypair#${method.toString()} is unimplemented`);
    });
    describe('generate()', () => {
        it('returns a `Keypair` instance', () => {
            expect(Keypair.generate()).toBeInstanceOf(Keypair);
        });
    });
    describe.each([
        [
            'generated keypair',
            () => {
                jest.spyOn(utils, 'randomPrivateKey').mockReturnValue(new Uint8Array(MOCK_PRIVATE_KEY_BYTES));
                return new Keypair();
            },
        ],
        [
            'user-supplied keypair',
            () =>
                new Keypair({
                    publicKey: new Uint8Array(MOCK_PUBLIC_KEY_BYTES),
                    secretKey: new Uint8Array([...MOCK_PRIVATE_KEY_BYTES, ...MOCK_PUBLIC_KEY_BYTES]),
                }),
        ],
        [
            'user-supplied keypair whose `publicKey` does not correspond to the supplied private key',
            () =>
                new Keypair({
                    publicKey: new Uint8Array(Array(32).fill(9)),
                    secretKey: new Uint8Array([...MOCK_PRIVATE_KEY_BYTES, ...MOCK_PUBLIC_KEY_BYTES]),
                }),
        ],
        [
            "user-supplied keypair whose last 32 bytes of the `secretKey` do not represent the private key's public key",
            () =>
                new Keypair({
                    publicKey: new Uint8Array(MOCK_PUBLIC_KEY_BYTES),
                    secretKey: new Uint8Array([...MOCK_PRIVATE_KEY_BYTES, ...Array(32).fill(9)]),
                }),
        ],
    ])('given a %s', (_, createKeyPair) => {
        let keyPair: Keypair;
        beforeEach(() => {
            keyPair = createKeyPair();
        });
        it('vends the a public key instance at `publicKey`', () => {
            expect(keyPair.publicKey).toBeInstanceOf(PublicKey);
        });
        it('vends the public key associated with the secret key', () => {
            expect(keyPair.publicKey.toBytes()).toEqual(new Uint8Array(MOCK_PUBLIC_KEY_BYTES));
        });
        it('vends a 64 byte array at `secretKey`, the first half of which is the private key and the second half which is the public key', () => {
            expect(keyPair.secretKey).toEqual(new Uint8Array([...MOCK_PRIVATE_KEY_BYTES, ...MOCK_PUBLIC_KEY_BYTES]));
        });
        it('throws when accessing `_keypair`', () => {
            expect(() => {
                keyPair._keypair;
            }).toThrow();
        });
    });
});
