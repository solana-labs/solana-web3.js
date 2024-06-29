import { SOLANA_ERROR__SIGNER__WALLET_MULTISIGN_UNIMPLEMENTED, SolanaError } from '@solana/errors';
import { SignatureBytes } from '@solana/keys';
import type { UiWalletAccount } from '@wallet-standard/ui';

import { renderHook } from '../test-renderer';
import { useSignMessage } from '../useSignMessage';
import { useWalletAccountMessageSigner } from '../useWalletAccountMessageSigner';

jest.mock('../useSignMessage');

describe('useWalletAccountMessageSigner', () => {
    let mockSignMessage: jest.Mock;
    let mockUiWalletAccount: UiWalletAccount;
    beforeEach(() => {
        mockSignMessage = jest.fn();
        mockUiWalletAccount = { address: '11111111111111111111111111111119' } as UiWalletAccount;
        jest.mocked(useSignMessage).mockReturnValue(mockSignMessage);
        // Suppresses console output when an `ErrorBoundary` is hit.
        // See https://stackoverflow.com/a/72632884/802047
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });
    it('fatals when `useSignMessage` fatals', () => {
        jest.mocked(useSignMessage).mockImplementation(() => {
            throw new Error('o no');
        });
        const { result } = renderHook(() => useWalletAccountMessageSigner(mockUiWalletAccount));
        expect(result.__type).toBe('error');
        expect(result.current).toEqual(new Error('o no'));
    });
    it('returns a `MessageModifyingSigner` with an address', () => {
        const { result } = renderHook(() => useWalletAccountMessageSigner(mockUiWalletAccount));
        expect(result.current).toHaveProperty('address', mockUiWalletAccount.address);
    });
    it('fatals when the signing function returned by `useSignMessage` fatals', async () => {
        expect.assertions(1);
        mockSignMessage.mockImplementation(() => {
            throw new Error('o no');
        });
        const { result } = renderHook(() => useWalletAccountMessageSigner(mockUiWalletAccount));
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { modifyAndSignMessages } = result.current;
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(() =>
                modifyAndSignMessages([{ content: new Uint8Array([1, 2, 3]), signatures: {} }]),
            ).rejects.toThrow(new Error('o no'));
        }
    });
    it('fatals when passed more than one message to sign', async () => {
        expect.assertions(1);
        const { result } = renderHook(() => useWalletAccountMessageSigner(mockUiWalletAccount));
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { modifyAndSignMessages } = result.current;
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(() =>
                modifyAndSignMessages([
                    { content: new Uint8Array([1, 2, 3]), signatures: {} },
                    { content: new Uint8Array([4, 5, 6]), signatures: {} },
                ]),
            ).rejects.toThrow(new SolanaError(SOLANA_ERROR__SIGNER__WALLET_MULTISIGN_UNIMPLEMENTED));
        }
    });
    it('returns the exact same message object when no signature update or message modification takes place', async () => {
        expect.assertions(1);
        mockSignMessage.mockImplementation(({ message }: { message: Uint8Array }) => {
            return Object.freeze({
                signature: new Uint8Array(64).fill(9),
                signedMessage: message,
            });
        });
        const { result } = renderHook(() => useWalletAccountMessageSigner(mockUiWalletAccount));
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { modifyAndSignMessages } = result.current;
            const inputMessage = {
                content: new Uint8Array([1, 2, 3]),
                signatures: {
                    [mockUiWalletAccount.address]: new Uint8Array(64).fill(9) as SignatureBytes,
                },
            };
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(
                (async () => {
                    const [result] = await modifyAndSignMessages([inputMessage]);
                    return result;
                })(),
            ).resolves.toBe(inputMessage);
        }
    });
    it('returns the a clone of the message object when there is a signature update but no message modification', async () => {
        expect.assertions(1);
        mockSignMessage.mockImplementation(({ message }: { message: Uint8Array }) => {
            return Object.freeze({
                signature: new Uint8Array(64).fill(8),
                signedMessage: message,
            });
        });
        const { result } = renderHook(() => useWalletAccountMessageSigner(mockUiWalletAccount));
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { modifyAndSignMessages } = result.current;
            const inputMessage = {
                content: new Uint8Array([1, 2, 3]),
                signatures: {
                    [mockUiWalletAccount.address]: new Uint8Array(64).fill(9) as SignatureBytes,
                },
            };
            const signPromise = (async () => {
                const [result] = await modifyAndSignMessages([inputMessage]);
                return result;
            })();
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(signPromise).resolves.not.toBe(inputMessage);
        }
    });
    it('returns the a clone of the message object when there is no signature update but the message is modified', async () => {
        expect.assertions(1);
        mockSignMessage.mockImplementation(({ message }: { message: Uint8Array }) => {
            return Object.freeze({
                signature: new Uint8Array(64).fill(9),
                signedMessage: message.map(byte => byte + 1),
            });
        });
        const { result } = renderHook(() => useWalletAccountMessageSigner(mockUiWalletAccount));
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { modifyAndSignMessages } = result.current;
            const inputMessage = {
                content: new Uint8Array([1, 2, 3]),
                signatures: {
                    [mockUiWalletAccount.address]: new Uint8Array(64).fill(9) as SignatureBytes,
                },
            };
            const signPromise = (async () => {
                const [result] = await modifyAndSignMessages([inputMessage]);
                return result;
            })();
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(signPromise).resolves.not.toBe(inputMessage);
        }
    });
    it('blanks out the existing signatures when the message is modified', async () => {
        expect.assertions(1);
        mockSignMessage.mockImplementation(({ message }: { message: Uint8Array }) => {
            return Object.freeze({
                signature: new Uint8Array(64).fill(127),
                signedMessage: message.map(byte => byte + 1),
            });
        });
        const { result } = renderHook(() => useWalletAccountMessageSigner(mockUiWalletAccount));
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { modifyAndSignMessages } = result.current;
            const inputMessage = {
                content: new Uint8Array([1, 2, 3]),
                signatures: {
                    '11111111111111111111111111111114': new Uint8Array(64).fill(2) as SignatureBytes,
                },
            };
            const signPromise = (async () => {
                const [result] = await modifyAndSignMessages([inputMessage]);
                return result;
            })();
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(signPromise).resolves.toEqual({
                content: inputMessage.content.map(byte => byte + 1),
                signatures: {
                    [mockUiWalletAccount.address]: new Uint8Array(64).fill(127) as SignatureBytes,
                },
            });
        }
    });
    it('returns an object with the identical message given that the message was not modified', async () => {
        expect.assertions(1);
        mockSignMessage.mockImplementation(({ message }: { message: Uint8Array }) => {
            return Object.freeze({
                signature: new Uint8Array(64).fill(127),
                signedMessage: message,
            });
        });
        const { result } = renderHook(() => useWalletAccountMessageSigner(mockUiWalletAccount));
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { modifyAndSignMessages } = result.current;
            const inputMessage = {
                content: new Uint8Array([1, 2, 3]),
                signatures: {},
            };
            const signedMessagePromise = (async () => {
                const [result] = await modifyAndSignMessages([inputMessage]);
                return result.content;
            })();
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(signedMessagePromise).resolves.toBe(inputMessage.content);
        }
    });
    it('returns an object with the identical signature map given that no new signature was produced', async () => {
        expect.assertions(1);
        mockSignMessage.mockImplementation(({ message }: { message: Uint8Array }) => {
            return Object.freeze({
                signature: new Uint8Array(64).fill(127),
                signedMessage: message,
            });
        });
        const { result } = renderHook(() => useWalletAccountMessageSigner(mockUiWalletAccount));
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { modifyAndSignMessages } = result.current;
            const inputMessage = {
                content: new Uint8Array([1, 2, 3]),
                signatures: {
                    [mockUiWalletAccount.address]: new Uint8Array(64).fill(127) as SignatureBytes,
                },
            };
            const signatureMapPromise = (async () => {
                const [result] = await modifyAndSignMessages([inputMessage]);
                return result.signatures;
            })();
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(signatureMapPromise).resolves.toBe(inputMessage.signatures);
        }
    });
    it('returns an object with the additional signature given that the message was not modified', async () => {
        expect.assertions(1);
        mockSignMessage.mockImplementation(({ message }: { message: Uint8Array }) => {
            return Object.freeze({
                signature: new Uint8Array(64).fill(127),
                signedMessage: message,
            });
        });
        const { result } = renderHook(() => useWalletAccountMessageSigner(mockUiWalletAccount));
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { modifyAndSignMessages } = result.current;
            const inputMessage = {
                content: new Uint8Array([1, 2, 3]),
                signatures: {
                    '11111111111111111111111111111114': new Uint8Array(64).fill(2) as SignatureBytes,
                },
            };
            const signPromise = (async () => {
                const [result] = await modifyAndSignMessages([inputMessage]);
                return result;
            })();
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(signPromise).resolves.toEqual({
                content: inputMessage.content,
                signatures: {
                    ...inputMessage.signatures,
                    [mockUiWalletAccount.address]: new Uint8Array(64).fill(127) as SignatureBytes,
                },
            });
        }
    });
    it('rejects when aborted', async () => {
        expect.assertions(1);
        const { result } = renderHook(() => useWalletAccountMessageSigner(mockUiWalletAccount));
        // eslint-disable-next-line jest/no-conditional-in-test
        if (result.__type === 'error' || !result.current) {
            throw result.current;
        } else {
            const { modifyAndSignMessages } = result.current;
            const inputMessage = {
                content: new Uint8Array([1, 2, 3]),
                signatures: {
                    '11111111111111111111111111111114': new Uint8Array(64).fill(2) as SignatureBytes,
                },
            };
            const abortController = new AbortController();
            abortController.abort(new Error('o no'));
            const alreadyAbortedSignal = abortController.signal;
            const signPromise = (async () => {
                const [result] = await modifyAndSignMessages([inputMessage], { abortSignal: alreadyAbortedSignal });
                return result;
            })();
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(signPromise).rejects.toThrow(new Error('o no'));
        }
    });
});
