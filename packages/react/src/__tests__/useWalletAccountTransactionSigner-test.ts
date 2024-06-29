import { Address } from '@solana/addresses';
import type { VariableSizeCodec } from '@solana/codecs-core';
import { SOLANA_ERROR__SIGNER__WALLET_MULTISIGN_UNIMPLEMENTED, SolanaError } from '@solana/errors';
import { SignatureBytes } from '@solana/keys';
import { Transaction, TransactionMessageBytes } from '@solana/transactions';
import { getTransactionCodec } from '@solana/transactions';
import type { UiWalletAccount } from '@wallet-standard/ui';

import { renderHook } from '../test-renderer';
import { useSignTransaction } from '../useSignTransaction';
import { useWalletAccountTransactionSigner } from '../useWalletAccountTransactionSigner';

jest.mock('@solana/transactions');
jest.mock('../useSignTransaction');

describe('useWalletAccountTransactionSigner', () => {
    let mockSignTransaction: jest.Mock;
    let mockDecodeTransaction: jest.Mock;
    let mockEncodeTransaction: jest.Mock;
    let mockUiWalletAccount: {
        address: Address<'11111111111111111111111111111119'>;
        chains: ['solana:danknet'];
        features: ['solana:signTransaction'];
        publicKey: Uint8Array;
        '~uiWalletHandle': UiWalletAccount['~uiWalletHandle'];
    };
    beforeEach(() => {
        mockDecodeTransaction = jest.fn();
        mockEncodeTransaction = jest.fn();
        jest.mocked(getTransactionCodec).mockReturnValue({
            decode: mockDecodeTransaction,
            encode: mockEncodeTransaction,
        } as unknown as VariableSizeCodec<Transaction>);
        mockSignTransaction = jest.fn().mockResolvedValue({
            signature: new Uint8Array([1, 2, 3]),
            signedMessage: new Uint8Array([1, 2, 3]),
        });
        mockUiWalletAccount = {
            address: '11111111111111111111111111111119' as Address<'11111111111111111111111111111119'>,
            chains: ['solana:danknet'] as const,
            features: ['solana:signTransaction'] as const,
            publicKey: new Uint8Array([1, 2, 3]),
            '~uiWalletHandle': null as unknown as UiWalletAccount['~uiWalletHandle'],
        };
        jest.mocked(useSignTransaction).mockReturnValue(mockSignTransaction);
        // Suppresses console output when an `ErrorBoundary` is hit.
        // See https://stackoverflow.com/a/72632884/802047
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });
    it('fatals when `useSignTransaction` fatals', () => {
        jest.mocked(useSignTransaction).mockImplementation(() => {
            throw new Error('o no');
        });
        const { result } = renderHook(() => useWalletAccountTransactionSigner(mockUiWalletAccount, 'solana:danknet'));
        expect(result.__type).toBe('error');
        expect(result.current).toEqual(new Error('o no'));
    });
    it('returns a `TransactionModifyingSigner` with an address', () => {
        const { result } = renderHook(() => useWalletAccountTransactionSigner(mockUiWalletAccount, 'solana:danknet'));
        expect(result.current).toHaveProperty('address', mockUiWalletAccount.address);
    });
    it('fatals when passed more than one transaction to sign', async () => {
        expect.assertions(1);
        const { result } = renderHook(() => useWalletAccountTransactionSigner(mockUiWalletAccount, 'solana:danknet'));
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { modifyAndSignTransactions } = result.current;
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(() =>
                modifyAndSignTransactions([
                    { messageBytes: new Uint8Array([1, 2, 3]) as unknown as TransactionMessageBytes, signatures: {} },
                    { messageBytes: new Uint8Array([4, 5, 6]) as unknown as TransactionMessageBytes, signatures: {} },
                ]),
            ).rejects.toThrow(new SolanaError(SOLANA_ERROR__SIGNER__WALLET_MULTISIGN_UNIMPLEMENTED));
        }
    });
    it('fatals when the signing function returned by `useSignTransaction` fatals', async () => {
        expect.assertions(1);
        mockSignTransaction.mockImplementation(() => {
            throw new Error('o no');
        });
        const { result } = renderHook(() => useWalletAccountTransactionSigner(mockUiWalletAccount, 'solana:danknet'));
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { modifyAndSignTransactions } = result.current;
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(() =>
                modifyAndSignTransactions([
                    { messageBytes: new Uint8Array([1, 2, 3]) as unknown as TransactionMessageBytes, signatures: {} },
                ]),
            ).rejects.toThrow(new Error('o no'));
        }
    });
    it('encodes the input transaction and passes it to the function returned by `signTransactions`', () => {
        const mockEncodedTransaction = {} as Transaction;
        mockEncodeTransaction.mockReturnValue(mockEncodedTransaction);
        const { result } = renderHook(() => useWalletAccountTransactionSigner(mockUiWalletAccount, 'solana:danknet'));
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { modifyAndSignTransactions } = result.current;
            const inputTransaction = {
                messageBytes: new Uint8Array([1, 2, 3]) as unknown as TransactionMessageBytes,
                signatures: {
                    '11111111111111111111111111111114': new Uint8Array(64).fill(2) as SignatureBytes,
                },
            };
            modifyAndSignTransactions([inputTransaction]);
            // eslint-disable-next-line jest/no-conditional-expect
            expect(mockEncodeTransaction).toHaveBeenCalledWith(inputTransaction);
            // eslint-disable-next-line jest/no-conditional-expect
            expect(mockSignTransaction).toHaveBeenCalledWith({ transaction: mockEncodedTransaction });
        }
    });
    it('decodes and returns the signed transaction bytes returned by `signTransactions`', async () => {
        expect.assertions(2);
        const mockSignedTransaction = new Uint8Array([1, 2, 3]);
        const mockDecodedTransaction = {} as Transaction;
        mockSignTransaction.mockResolvedValue({ signedTransaction: mockSignedTransaction });
        mockDecodeTransaction.mockReturnValue(mockDecodedTransaction);
        const { result } = renderHook(() => useWalletAccountTransactionSigner(mockUiWalletAccount, 'solana:danknet'));
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { modifyAndSignTransactions } = result.current;
            const inputTransaction = {
                messageBytes: new Uint8Array([1, 2, 3]) as unknown as TransactionMessageBytes,
                signatures: {
                    '11111111111111111111111111111114': new Uint8Array(64).fill(2) as SignatureBytes,
                },
            };
            const signPromise = modifyAndSignTransactions([inputTransaction]);
            await jest.runAllTimersAsync();
            // eslint-disable-next-line jest/no-conditional-expect
            expect(mockDecodeTransaction).toHaveBeenCalledWith(mockSignedTransaction);
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(signPromise).resolves.toEqual([mockDecodedTransaction]);
        }
    });
    it('calls `signTransaction` with all options except the `abortSignal`', () => {
        const mockOptions = { minContextSlot: 123n };
        const { result } = renderHook(() => useWalletAccountTransactionSigner(mockUiWalletAccount, 'solana:danknet'));
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { modifyAndSignTransactions } = result.current;
            const inputTransaction = {
                messageBytes: new Uint8Array([1, 2, 3]) as unknown as TransactionMessageBytes,
                signatures: {
                    '11111111111111111111111111111114': new Uint8Array(64).fill(2) as SignatureBytes,
                },
            };
            modifyAndSignTransactions([inputTransaction], {
                abortSignal: AbortSignal.timeout(1_000_000),
                ...mockOptions,
            });
            // eslint-disable-next-line jest/no-conditional-expect
            expect(mockSignTransaction).toHaveBeenCalledWith(mockOptions);
        }
    });
    it('rejects when aborted', async () => {
        expect.assertions(1);
        const { result } = renderHook(() => useWalletAccountTransactionSigner(mockUiWalletAccount, 'solana:danknet'));
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { modifyAndSignTransactions } = result.current;
            const inputTransaction = {
                messageBytes: new Uint8Array([1, 2, 3]) as unknown as TransactionMessageBytes,
                signatures: {
                    '11111111111111111111111111111114': new Uint8Array(64).fill(2) as SignatureBytes,
                },
            };
            const abortController = new AbortController();
            abortController.abort(new Error('o no'));
            const alreadyAbortedSignal = abortController.signal;
            const signPromise = (async () => {
                const [result] = await modifyAndSignTransactions([inputTransaction], {
                    abortSignal: alreadyAbortedSignal,
                });
                return result;
            })();
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(signPromise).rejects.toThrow(new Error('o no'));
        }
    });
});
