import { SOLANA_ERROR__JSON_RPC__INVALID_PARAMS, SolanaError } from '@solana/errors';
import type { Signature } from '@solana/keys';
import type { Rpc } from '@solana/rpc-spec';

import { GetSignatureStatusesApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

const CONTEXT_MATCHER = expect.objectContaining({
    slot: expect.any(BigInt),
});

describe('getSignatureStatuses', () => {
    let rpc: Rpc<GetSignatureStatusesApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    describe('when called with a valid transaction signature', () => {
        [true, false].forEach(searchTransactionHistory => {
            describe(`with \`searchTransactionHistory\`: ${searchTransactionHistory} and one signature provided`, () => {
                // TODO: Cannot test this until we have a way to mock
                // some transactions without RPC methods
                it.todo('returns a signature status with the correct shape');
            });

            describe(`with \`searchTransactionHistory\`: ${searchTransactionHistory} and multiple signatures provided`, () => {
                // TODO: Cannot test this until we have a way to mock
                // some transactions without RPC methods
                it.todo('returns a signature status with the correct shape');
            });
        });
    });

    describe('when called with no transaction signature provided', () => {
        it('returns an empty list', async () => {
            expect.assertions(1);
            const signatureStatusPromise = rpc.getSignatureStatuses([]).send();
            await expect(signatureStatusPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [],
            });
        });
    });

    describe('when called with an invalid transaction signature', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const signatureStatusPromise = rpc.getSignatureStatuses(['invalid_signature' as Signature]).send();
            await expect(signatureStatusPromise).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__JSON_RPC__INVALID_PARAMS, {
                    __serverMessage: 'Invalid param: Invalid',
                }),
            );
        });
    });

    describe('when called with a transaction signature that does not exist', () => {
        it('returns null for that signature', async () => {
            expect.assertions(1);
            const signatureStatusPromise = rpc
                .getSignatureStatuses([
                    // Randomly generated
                    '4Vx3PAb665jCLRpbpgKshZuwKP6TUgoSDDAbKEsyvkKhwrNDT6CE5d7MT1vEPkgEo1cmr7zsM8h724wRnjyCAoR3' as Signature,
                ])
                .send();
            await expect(signatureStatusPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [null],
            });
        });
    });
});
