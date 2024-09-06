import { getDefaultResponseTransformerForSolanaRpc } from '@solana/rpc-transformers';

import { createSolanaRpcApi, SolanaRpcApi } from '..';

jest.mock('@solana/rpc-transformers');

describe('createSolanaRpcApi', () => {
    describe('when extending allowedNumericKeyPaths', () => {
        it('should create a response transformer including the new paths', () => {
            type TestApi = SolanaRpcApi & {
                someNewFunction(): void;
                someOtherFunction(): void;
            };

            createSolanaRpcApi<TestApi>({
                extendAllowedNumericKeypaths: {
                    someNewFunction: [['someNewKeyPath']],
                    someOtherFunction: [['someOtherKeyPath']],
                },
            });

            expect(getDefaultResponseTransformerForSolanaRpc as jest.Mock).toHaveBeenCalledWith({
                allowedNumericKeyPaths: expect.objectContaining({
                    someNewFunction: [['someNewKeyPath']],
                    someOtherFunction: [['someOtherKeyPath']],
                }),
            });
        });

        it('should include the default paths', () => {
            type TestApi = SolanaRpcApi & {
                someNewFunction(): void;
            };

            createSolanaRpcApi<TestApi>({
                extendAllowedNumericKeypaths: {
                    someNewFunction: [['someNewKeyPath']],
                },
            });

            expect(getDefaultResponseTransformerForSolanaRpc as jest.Mock).toHaveBeenCalledWith({
                allowedNumericKeyPaths: expect.objectContaining({
                    getAccountInfo: expect.any(Array),
                }),
            });
        });
    });
});
