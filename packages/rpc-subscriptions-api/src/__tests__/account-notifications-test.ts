import type { Commitment } from '@solana/rpc-types';

describe('accountNotifications', () => {
    ([undefined, 'confirmed', 'finalized', 'processed'] as (Commitment | undefined)[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it.todo('produces account notifications');
        });
    });

    describe('when called with base58 encoding', () => {
        it.todo('produces account notifications with annotated base58 encoding');
    });

    describe('when called with base64 encoding', () => {
        it.todo('produces account notifications with annotated base64 encoding');
    });

    describe('when called with base64+zstd encoding', () => {
        it.todo('produces account notifications with annotated base64+zstd encoding');
    });

    describe('when called with jsonParsed encoding', () => {
        describe('for an account without parse-able JSON data', () => {
            it.todo('produces account notifications as base64');
        });

        describe('for an account with parse-able JSON data', () => {
            it.todo('produces account notifications with parsed JSON data for AddressLookupTable account');

            it.todo('produces account notifications with parsed JSON data for BpfLoaderUpgradeable account');

            it.todo('produces account notifications with parsed JSON data for Config validator account');

            it.todo('produces account notifications with parsed JSON data for Config stake account');

            it.todo('produces account notifications with parsed JSON data for Nonce account');

            it.todo('produces account notifications with parsed JSON data for SPL Token mint account');

            it.todo('produces account notifications with parsed JSON data for SPL Token token account');

            it.todo('produces account notifications with parsed JSON data for SPL token multisig account');

            it.todo('produces account notifications with parsed JSON data for SPL Token 22 mint account');

            it.todo('produces account notifications with parsed JSON data for Stake account');

            it.todo('produces account notifications with parsed JSON data for Sysvar rent account');

            it.todo('produces account notifications with parsed JSON data for Vote account');
        });
    });

    describe('when called with no encoding', () => {
        it.todo('produces account notifications with base58 data without an annotation');
    });
});
