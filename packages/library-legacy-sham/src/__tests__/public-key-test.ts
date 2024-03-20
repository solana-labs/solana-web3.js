import { PublicKey } from '../public-key.js';

const VALID_ADDRESS = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
const VALID_ADDRESS_BYTES = [
    6, 221, 246, 225, 238, 117, 143, 222, 24, 66, 93, 188, 228, 108, 205, 218, 182, 26, 252, 77, 131, 185, 13, 39, 254,
    189, 249, 40, 216, 161, 139, 252,
];

describe('PublicKeySham', () => {
    it('throws when constructed using an invalid address', () => {
        expect(() => {
            new PublicKey('bad');
        }).toThrow();
    });
    it.each([
        'createProgramAddress',
        'createProgramAddressSync',
        'createWithSeed',
        'decode',
        'decodeUnchecked',
        'isOnCurve',
        'findProgramAddress',
        'findProgramAddressSync',
        'unique',
    ] as (keyof typeof PublicKey)[])('throws when calling `%s`', method => {
        expect(() =>
            // This is basically just complaining that `default` is not callable.
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            PublicKey[method](),
        ).toThrow(`PublicKey#${method.toString()} is unimplemented`);
    });
    it('vends the all-zero address at `default`', () => {
        expect(PublicKey.default.toBase58()).toBe('11111111111111111111111111111111');
    });
    describe('given a valid public key', () => {
        let publicKey: PublicKey;
        beforeEach(() => {
            publicKey = new PublicKey(VALID_ADDRESS);
        });
        describe('the `encode()` method', () => {
            if (__NODEJS__) {
                it('returns a buffer representing the public key bytes', () => {
                    expect(publicKey.encode()).toEqual(Buffer.from(VALID_ADDRESS_BYTES));
                });
            } else {
                it('fatals', () => {
                    expect(() => {
                        publicKey.encode();
                    }).toThrow();
                });
            }
        });
        describe('the `equals()` method', () => {
            it('returns `true` given two public keys with the same address', () => {
                expect(publicKey.equals(publicKey)).toBe(true);
            });
            it('returns `false` given two public keys with different addresses', () => {
                const publicKeyA = new PublicKey('11111111111111111111111111111111');
                const publicKeyB = new PublicKey('11111111111111111111111111111112');
                expect(publicKeyA.equals(publicKeyB)).toBe(false);
            });
        });
        describe('the `toBase58()` method', () => {
            it('returns the `Address` related to the public key', () => {
                expect(publicKey.toBase58()).toBe(VALID_ADDRESS);
            });
        });
        describe('the `toBuffer()` method', () => {
            if (__NODEJS__) {
                it('returns a buffer representing the public key bytes', () => {
                    expect(publicKey.toBuffer()).toEqual(Buffer.from(VALID_ADDRESS_BYTES));
                });
            } else {
                it('fatals', () => {
                    expect(() => {
                        publicKey.toBuffer();
                    }).toThrow();
                });
            }
        });
        describe('the `toBytes()` method', () => {
            it('returns a byte array representation of the public key', () => {
                expect(publicKey.toBytes()).toEqual(new Uint8Array(VALID_ADDRESS_BYTES));
            });
        });
        describe('the `toJSON()` method', () => {
            it('returns the `Address` related to the public key as a string', () => {
                expect(publicKey.toJSON()).toBe(VALID_ADDRESS);
            });
        });
        describe('the `toString()` method', () => {
            it('returns the `Address` related to the public key as a string', () => {
                expect(publicKey.toJSON()).toBe(VALID_ADDRESS);
            });
        });
        it("renders the public key's address in its string tag", () => {
            expect(publicKey).toHaveProperty([Symbol.toStringTag], `PublicKeySham(${VALID_ADDRESS})`);
        });
        it('throws when accessing `_bn`', () => {
            expect(() => {
                publicKey._bn;
            }).toThrow();
        });
    });
});
