import { Address } from '@solana/addresses';
import type { VariableSizeEncoder } from '@solana/codecs-core';
import { SOLANA_ERROR__SIGNER__WALLET_MULTISIGN_UNIMPLEMENTED, SolanaError } from '@solana/errors';
import { SignatureBytes } from '@solana/keys';
import { Transaction, TransactionMessageBytes } from '@solana/transactions';
import { getTransactionEncoder } from '@solana/transactions';
import type { UiWalletAccount } from '@wallet-standard/ui';

import { renderHook } from '../test-renderer';
import { useSignAndSendTransaction } from '../useSignAndSendTransaction';
import { useWalletAccountTransactionSendingSigner } from '../useWalletAccountTransactionSendingSigner';

jest.mock('@solana/transactions');
jest.mock('../useSignAndSendTransaction');

describe('useWalletAccountTransactionSendingSigner', () => {
    let mockSignAndSendTransaction: jest.Mock;
    let mockEncodeTransaction: jest.Mock;
    let mockUiWalletAccount: {
        address: Address<'11111111111111111111111111111119'>;
        chains: ['solana:danknet'];
        features: ['solana:signAndSendTransaction'];
        publicKey: Uint8Array;
        '~uiWalletHandle': UiWalletAccount['~uiWalletHandle'];
    };
    beforeEach(() => {
        mockEncodeTransaction = jest.fn();
        jest.mocked(getTransactionEncoder).mockReturnValue({
            encode: mockEncodeTransaction,
        } as unknown as VariableSizeEncoder<Transaction>);
        mockSignAndSendTransaction = jest.fn().mockResolvedValue({ signature: new Uint8Array([1, 2, 3]) });
        mockUiWalletAccount = {
            address: '11111111111111111111111111111119' as Address<'11111111111111111111111111111119'>,
            chains: ['solana:danknet'] as const,
            features: ['solana:signAndSendTransaction'] as const,
            publicKey: new Uint8Array([1, 2, 3]),
            '~uiWalletHandle': null as unknown as UiWalletAccount['~uiWalletHandle'],
        };
        jest.mocked(useSignAndSendTransaction).mockReturnValue(mockSignAndSendTransaction);
        // Suppresses console output when an `ErrorBoundary` is hit.
        // See https://stackoverflow.com/a/72632884/802047
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });
    it('fatals when `useSignAndSendTransaction` fatals', () => {
        jest.mocked(useSignAndSendTransaction).mockImplementation(() => {
            throw new Error('o no');
        });
        const { result } = renderHook(() =>
            useWalletAccountTransactionSendingSigner(mockUiWalletAccount, 'solana:danknet'),
        );
        expect(result.__type).toBe('error');
        expect(result.current).toEqual(new Error('o no'));
    });
    it('returns a `TransactionSendingSigner` with an address', () => {
        const { result } = renderHook(() =>
            useWalletAccountTransactionSendingSigner(mockUiWalletAccount, 'solana:danknet'),
        );
        expect(result.current).toHaveProperty('address', mockUiWalletAccount.address);
    });
    it('fatals when the signing function returned by `useSignAndSendTransaction` fatals', async () => {
        expect.assertions(1);
        mockSignAndSendTransaction.mockImplementation(() => {
            throw new Error('o no');
        });
        const { result } = renderHook(() =>
            useWalletAccountTransactionSendingSigner(mockUiWalletAccount, 'solana:danknet'),
        );
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { signAndSendTransactions } = result.current;
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(() =>
                signAndSendTransactions([
                    { messageBytes: new Uint8Array([1, 2, 3]) as unknown as TransactionMessageBytes, signatures: {} },
                ]),
            ).rejects.toThrow(new Error('o no'));
        }
    });
    it('fatals when passed more than one transaction to sign', async () => {
        expect.assertions(1);
        const { result } = renderHook(() =>
            useWalletAccountTransactionSendingSigner(mockUiWalletAccount, 'solana:danknet'),
        );
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { signAndSendTransactions } = result.current;
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(() =>
                signAndSendTransactions([
                    { messageBytes: new Uint8Array([1, 2, 3]) as unknown as TransactionMessageBytes, signatures: {} },
                    { messageBytes: new Uint8Array([4, 5, 6]) as unknown as TransactionMessageBytes, signatures: {} },
                ]),
            ).rejects.toThrow(new SolanaError(SOLANA_ERROR__SIGNER__WALLET_MULTISIGN_UNIMPLEMENTED));
        }
    });
    it('encodes the input transaction and passes it to the function returned by `signTransactions`', () => {
        const mockEncodedTransaction = new Uint8Array([1, 2, 3]) as unknown as TransactionMessageBytes;
        mockEncodeTransaction.mockReturnValue(mockEncodedTransaction);
        const { result } = renderHook(() =>
            useWalletAccountTransactionSendingSigner(mockUiWalletAccount, 'solana:danknet'),
        );
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { signAndSendTransactions } = result.current;
            const inputTransaction = {
                messageBytes: new Uint8Array([1, 2, 3]) as unknown as TransactionMessageBytes,
                signatures: {
                    '11111111111111111111111111111114': new Uint8Array(64).fill(2) as SignatureBytes,
                },
            };
            signAndSendTransactions([inputTransaction]).catch(() => {});
            // eslint-disable-next-line jest/no-conditional-expect
            expect(mockEncodeTransaction).toHaveBeenCalledWith(inputTransaction);
            // eslint-disable-next-line jest/no-conditional-expect
            expect(mockSignAndSendTransaction).toHaveBeenCalledWith({ transaction: mockEncodedTransaction });
        }
    });
    it('returns the sent transaction signature', async () => {
        expect.assertions(1);
        const mockSignatureResult = new Uint8Array(64).fill(127);
        mockSignAndSendTransaction.mockResolvedValue({ signature: mockSignatureResult });
        const { result } = renderHook(() =>
            useWalletAccountTransactionSendingSigner(mockUiWalletAccount, 'solana:danknet'),
        );
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { signAndSendTransactions } = result.current;
            const inputTransaction = {
                messageBytes: new Uint8Array([1, 2, 3]) as unknown as TransactionMessageBytes,
                signatures: {
                    '11111111111111111111111111111114': new Uint8Array(64).fill(2) as SignatureBytes,
                },
            };
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(signAndSendTransactions([inputTransaction])).resolves.toEqual([mockSignatureResult]);
        }
    });
    it('calls `signAndSendTransaction` with all options except the `abortSignal`', () => {
        const mockOptions = { minContextSlot: 123n };
        const { result } = renderHook(() =>
            useWalletAccountTransactionSendingSigner(mockUiWalletAccount, 'solana:danknet'),
        );
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { signAndSendTransactions } = result.current;
            const inputTransaction = {
                messageBytes: new Uint8Array([1, 2, 3]) as unknown as TransactionMessageBytes,
                signatures: {
                    '11111111111111111111111111111114': new Uint8Array(64).fill(2) as SignatureBytes,
                },
            };
            signAndSendTransactions([inputTransaction], {
                abortSignal: AbortSignal.timeout(1_000_000),
                ...mockOptions,
            }).catch(() => {});
            // eslint-disable-next-line jest/no-conditional-expect
            expect(mockSignAndSendTransaction).toHaveBeenCalledWith(mockOptions);
        }
    });
    it('rejects when aborted', async () => {
        expect.assertions(1);
        const { result } = renderHook(() =>
            useWalletAccountTransactionSendingSigner(mockUiWalletAccount, 'solana:danknet'),
        );
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { signAndSendTransactions } = result.current;
            const inputTransaction = {
                messageBytes: new Uint8Array([1, 2, 3]) as unknown as TransactionMessageBytes,
                signatures: {
                    '11111111111111111111111111111114': new Uint8Array(64).fill(2) as SignatureBytes,
                },
            };
            const abortController = new AbortController();
            abortController.abort(new Error('o no'));
            const alreadyAbortedSignal = abortController.signal;
            const signAndSendPromise = (async () => {
                const [result] = await signAndSendTransactions([inputTransaction], {
                    abortSignal: alreadyAbortedSignal,
                });
                return result;
            })();
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(signAndSendPromise).rejects.toThrow(new Error('o no'));
        }
    });
});
