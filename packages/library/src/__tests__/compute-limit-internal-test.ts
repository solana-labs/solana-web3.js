import { Address } from '@solana/addresses';
import {
    SOLANA_ERROR__INSTRUCTION_ERROR__INSUFFICIENT_FUNDS,
    SOLANA_ERROR__TRANSACTION__FAILED_TO_ESTIMATE_COMPUTE_LIMIT,
    SOLANA_ERROR__TRANSACTION__FAILED_WHEN_SIMULATING_TO_ESTIMATE_COMPUTE_LIMIT,
    SolanaError,
} from '@solana/errors';
import { AccountRole } from '@solana/instructions';
import { Rpc, SimulateTransactionApi } from '@solana/rpc';
import { Blockhash, TransactionError } from '@solana/rpc-types';
import { ITransactionMessageWithFeePayer, Nonce, TransactionMessage } from '@solana/transaction-messages';

import { getComputeUnitEstimateForTransactionMessage_INTERNAL_ONLY_DO_NOT_EXPORT } from '../compute-limit-internal';

const FOREVER_PROMISE = new Promise(() => {
    /* never resolve */
});

const MOCK_BLOCKHASH_LIFETIME_CONSTRAINT = {
    blockhash: 'GNtuHnNyW68wviopST3ki37Afv7LPphxfSwiHAkX5Q9H' as Blockhash,
    lastValidBlockHeight: 0n,
} as const;

describe('getComputeUnitEstimateForTransactionMessage_INTERNAL_ONLY_DO_NOT_EXPORT', () => {
    let sendSimulateTransactionRequest: jest.Mock;
    let mockTransactionMessage: ITransactionMessageWithFeePayer & TransactionMessage;
    let rpc: Rpc<SimulateTransactionApi>;
    let simulateTransaction: jest.Mock;
    beforeEach(() => {
        mockTransactionMessage = {
            feePayer: { address: '7U8VWgTUucttJPt5Bbkt48WknWqRGBfstBt8qqLHnfPT' as Address },
            instructions: [],
            version: 0,
        };
        sendSimulateTransactionRequest = jest.fn().mockReturnValue(FOREVER_PROMISE);
        simulateTransaction = jest.fn().mockReturnValue({ send: sendSimulateTransactionRequest });
        rpc = {
            simulateTransaction,
        };
    });
    it('aborts the `simulateTransaction` request when aborted', () => {
        const abortController = new AbortController();
        getComputeUnitEstimateForTransactionMessage_INTERNAL_ONLY_DO_NOT_EXPORT({
            abortSignal: abortController.signal,
            rpc,
            transactionMessage: {
                ...mockTransactionMessage,
                lifetimeConstraint: MOCK_BLOCKHASH_LIFETIME_CONSTRAINT,
            },
        }).catch(() => {});
        expect(sendSimulateTransactionRequest).toHaveBeenCalledWith({
            abortSignal: expect.objectContaining({ aborted: false }),
        });
        abortController.abort();
        expect(sendSimulateTransactionRequest).toHaveBeenCalledWith({
            abortSignal: expect.objectContaining({ aborted: true }),
        });
    });
    it('passes the expected basic input to the simulation request', () => {
        const transactionMessage = {
            ...mockTransactionMessage,
            lifetimeConstraint: MOCK_BLOCKHASH_LIFETIME_CONSTRAINT,
        };
        getComputeUnitEstimateForTransactionMessage_INTERNAL_ONLY_DO_NOT_EXPORT({
            commitment: 'finalized',
            minContextSlot: 42n,
            rpc,
            transactionMessage,
        }).catch(() => {});
        expect(simulateTransaction).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                commitment: 'finalized',
                encoding: 'base64',
                minContextSlot: 42n,
                sigVerify: false,
            }),
        );
    });
    it('appends a set compute unit limit instruction when one does not exist', async () => {
        expect.assertions(1);
        await jest.isolateModulesAsync(async () => {
            jest.mock('@solana/transactions');
            const [
                { compileTransaction },
                { getComputeUnitEstimateForTransactionMessage_INTERNAL_ONLY_DO_NOT_EXPORT },
            ] = await Promise.all([
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                import('@solana/transactions'),
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                import('../compute-limit-internal'),
            ]);
            const transactionMessage = {
                ...mockTransactionMessage, // No `SetComputeUnitLimit` instruction
                lifetimeConstraint: MOCK_BLOCKHASH_LIFETIME_CONSTRAINT,
            };
            getComputeUnitEstimateForTransactionMessage_INTERNAL_ONLY_DO_NOT_EXPORT({
                rpc,
                transactionMessage,
            }).catch(() => {});
            expect(compileTransaction).toHaveBeenCalledWith({
                ...transactionMessage,
                instructions: [
                    ...transactionMessage.instructions,
                    {
                        data:
                            // prettier-ignore
                            new Uint8Array([
                                0x02, // SetComputeUnitLimit instruction inde
                                0xc0, 0x5c, 0x15, 0x00, // 1,400,000, MAX_COMPUTE_UNITS
                            ]),
                        programAddress: 'ComputeBudget111111111111111111111111111111',
                    },
                ],
            });
        });
    });
    it('replaces the existing set compute unit limit instruction when one exists', async () => {
        expect.assertions(1);
        await jest.isolateModulesAsync(async () => {
            jest.mock('@solana/transactions');
            const [
                { compileTransaction },
                { getComputeUnitEstimateForTransactionMessage_INTERNAL_ONLY_DO_NOT_EXPORT },
            ] = await Promise.all([
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                import('@solana/transactions'),
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                import('../compute-limit-internal'),
            ]);
            const transactionMessage = {
                ...mockTransactionMessage,
                instructions: [
                    { programAddress: '4Kk4nA3F2nWHCcuyT8nR6oF7HQUQHmmzAVD5k8FQPKB2' as Address },
                    {
                        data:
                            // prettier-ignore
                            new Uint8Array([
                            0x02, // SetComputeUnitLimit instruction inde
                            0x01, 0x02, 0x03, 0x04, // ComputeUnits(u32)
                        ]),
                        programAddress: 'ComputeBudget111111111111111111111111111111' as Address,
                    },
                    { programAddress: '4Kk4nA3F2nWHCcuyT8nR6oF7HQUQHmmzAVD5k8FQPKB2' as Address },
                ],
                lifetimeConstraint: MOCK_BLOCKHASH_LIFETIME_CONSTRAINT,
            };
            getComputeUnitEstimateForTransactionMessage_INTERNAL_ONLY_DO_NOT_EXPORT({
                rpc,
                transactionMessage,
            }).catch(() => {});
            expect(compileTransaction).toHaveBeenCalledWith(
                expect.objectContaining({
                    instructions: [
                        transactionMessage.instructions[0],
                        {
                            ...transactionMessage.instructions[1],
                            data: new Uint8Array([0x02, 0xc0, 0x5c, 0x15, 0x00]), // Replaced with MAX_COMPUTE_UNITS
                        },
                        transactionMessage.instructions[2],
                    ],
                }),
            );
        });
    });
    it('does not ask for a replacement blockhash when the transaction message is a durable nonce transaction', () => {
        getComputeUnitEstimateForTransactionMessage_INTERNAL_ONLY_DO_NOT_EXPORT({
            rpc,
            transactionMessage: {
                ...mockTransactionMessage,
                instructions: [
                    {
                        accounts: [
                            {
                                address: '7wJFRFuAE9x5Ptnz2VoBWsfecTCfuuM2sQCpECGypnTU' as Address,
                                role: AccountRole.WRITABLE,
                            },
                            {
                                address: 'SysvarRecentB1ockHashes11111111111111111111' as Address,
                                role: AccountRole.READONLY,
                            },
                            {
                                address: 'HzMoc78z1VNNf9nwD4Czt6CDYEb9LVD8KsVGP46FEmyJ' as Address,
                                role: AccountRole.READONLY_SIGNER,
                            },
                        ],
                        data: new Uint8Array([4, 0, 0, 0]),
                        programAddress: '11111111111111111111111111111111' as Address,
                    },
                ],
                lifetimeConstraint: {
                    nonce: 'BzAqD6382v5r1pcELoi8HWrBDV4dSL9NGemMn2JYAhxc' as Nonce,
                },
            },
        }).catch(() => {});
        expect(simulateTransaction).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ replaceRecentBlockhash: false }),
        );
    });
    it('asks for a replacement blockhash even when the transaction message has a blockhash lifetime', () => {
        getComputeUnitEstimateForTransactionMessage_INTERNAL_ONLY_DO_NOT_EXPORT({
            rpc,
            transactionMessage: {
                ...mockTransactionMessage,
                lifetimeConstraint: MOCK_BLOCKHASH_LIFETIME_CONSTRAINT,
            },
        }).catch(() => {});
        expect(simulateTransaction).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ replaceRecentBlockhash: true }),
        );
    });
    it('asks for a replacement blockhash when the transaction message has no lifetime', () => {
        getComputeUnitEstimateForTransactionMessage_INTERNAL_ONLY_DO_NOT_EXPORT({
            rpc,
            transactionMessage: mockTransactionMessage,
        }).catch(() => {});
        expect(simulateTransaction).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ replaceRecentBlockhash: true }),
        );
    });
    it('returns the estimated compute units on success', async () => {
        expect.assertions(1);
        sendSimulateTransactionRequest.mockResolvedValue({ value: { unitsConsumed: 42n } });
        const estimatePromise = getComputeUnitEstimateForTransactionMessage_INTERNAL_ONLY_DO_NOT_EXPORT({
            rpc,
            transactionMessage: mockTransactionMessage,
        });
        await expect(estimatePromise).resolves.toBe(42);
    });
    it('caps the estimated compute units to MAX_COMPUTE_UNITS of 1.4M', async () => {
        expect.assertions(1);
        sendSimulateTransactionRequest.mockResolvedValue({
            value: { unitsConsumed: 1400000n /* MAX_COMPUTE_UNITS */ },
        });
        const estimatePromise = getComputeUnitEstimateForTransactionMessage_INTERNAL_ONLY_DO_NOT_EXPORT({
            rpc,
            transactionMessage: mockTransactionMessage,
        });
        await expect(estimatePromise).resolves.toBe(1400000);
    });
    it('throws with the transaction error as cause when the transaction fails in simulation', async () => {
        expect.assertions(1);
        const transactionError: TransactionError = 'AccountNotFound';
        sendSimulateTransactionRequest.mockResolvedValue({ value: { err: transactionError, unitsConsumed: 42n } });
        const estimatePromise = getComputeUnitEstimateForTransactionMessage_INTERNAL_ONLY_DO_NOT_EXPORT({
            rpc,
            transactionMessage: mockTransactionMessage,
        });
        await expect(estimatePromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__TRANSACTION__FAILED_WHEN_SIMULATING_TO_ESTIMATE_COMPUTE_LIMIT, {
                cause: transactionError,
                unitsConsumed: 42,
            }),
        );
    });
    it('throws with the cause when simulation fails', async () => {
        expect.assertions(1);
        const simulationError = new SolanaError(SOLANA_ERROR__INSTRUCTION_ERROR__INSUFFICIENT_FUNDS, {
            index: 42,
        });
        sendSimulateTransactionRequest.mockRejectedValue(simulationError);
        const estimatePromise = getComputeUnitEstimateForTransactionMessage_INTERNAL_ONLY_DO_NOT_EXPORT({
            rpc,
            transactionMessage: mockTransactionMessage,
        });
        await expect(estimatePromise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__TRANSACTION__FAILED_TO_ESTIMATE_COMPUTE_LIMIT, {
                cause: simulationError,
            }),
        );
    });
});
