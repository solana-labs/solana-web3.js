import { Keypair } from '@solana/web3.js';

import { fromLegacyKeypair } from '../keypair';

describe('fromLegacyKeypair', () => {
    const legacyKeypair = Keypair.generate();
    describe.each(['public', 'private'])('%s key', type => {
        let keyPair: CryptoKeyPair;
        beforeEach(async () => {
            keyPair = await fromLegacyKeypair(legacyKeypair);
        });
        it(`has the algorithm "Ed25519"`, () => {
            expect(keyPair).toHaveProperty([`${type}Key`, 'algorithm', 'name'], 'Ed25519');
        });
        it('has the string tag "CryptoKey"', () => {
            expect(keyPair).toHaveProperty([`${type}Key`, Symbol.toStringTag], 'CryptoKey');
        });
        it(`has the type "${type}"`, () => {
            expect(keyPair).toHaveProperty([`${type}Key`, 'type'], type);
        });
    });
    it.each([true, false])(
        "sets the private key's `extractable` accordingly when generating a key pair with the extractability `%s`",
        async extractable => {
            expect.assertions(1);
            const keyPair = await fromLegacyKeypair(legacyKeypair, extractable);
            expect(keyPair.privateKey).toHaveProperty('extractable', extractable);
        },
    );
});
