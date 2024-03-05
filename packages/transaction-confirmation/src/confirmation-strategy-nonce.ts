import type { Address } from '@solana/addresses';
import { getBase58Decoder, getBase64Encoder } from '@solana/codecs-strings';
import { SOLANA_ERROR__INVALID_NONCE, SOLANA_ERROR__NONCE_ACCOUNT_NOT_FOUND, SolanaError } from '@solana/errors';
import type { GetAccountInfoApi, Rpc } from '@solana/rpc';
import type { AccountNotificationsApi, RpcSubscriptions } from '@solana/rpc-subscriptions';
import type { Base64EncodedDataResponse, Commitment } from '@solana/rpc-types';
import type { Nonce } from '@solana/transactions';

type GetNonceInvalidationPromiseFn = (config: {
    abortSignal: AbortSignal;
    commitment: Commitment;
    currentNonceValue: Nonce;
    nonceAccountAddress: Address;
}) => Promise<void>;

const NONCE_VALUE_OFFSET =
    4 + // version(u32)
    4 + // state(u32)
    32; // nonce authority(pubkey)
// Then comes the nonce value.

export function createNonceInvalidationPromiseFactory(
    rpc: Rpc<GetAccountInfoApi>,
    rpcSubscriptions: RpcSubscriptions<AccountNotificationsApi>,
): GetNonceInvalidationPromiseFn {
    return async function getNonceInvalidationPromise({
        abortSignal: callerAbortSignal,
        commitment,
        currentNonceValue: expectedNonceValue,
        nonceAccountAddress,
    }) {
        const abortController = new AbortController();
        function handleAbort() {
            abortController.abort();
        }
        callerAbortSignal.addEventListener('abort', handleAbort, { signal: abortController.signal });
        /**
         * STEP 1: Set up a subscription for nonce account changes.
         */
        const accountNotifications = await rpcSubscriptions
            .accountNotifications(nonceAccountAddress, { commitment, encoding: 'base64' })
            .subscribe({ abortSignal: abortController.signal });
        const base58Decoder = getBase58Decoder();
        const base64Encoder = getBase64Encoder();
        function getNonceFromAccountData([base64EncodedBytes]: Base64EncodedDataResponse): Nonce {
            const data = base64Encoder.encode(base64EncodedBytes);
            const nonceValueBytes = data.slice(NONCE_VALUE_OFFSET, NONCE_VALUE_OFFSET + 32);
            return base58Decoder.decode(nonceValueBytes) as Nonce;
        }
        const nonceAccountDidAdvancePromise = (async () => {
            for await (const accountNotification of accountNotifications) {
                const nonceValue = getNonceFromAccountData(accountNotification.value.data);
                if (nonceValue !== expectedNonceValue) {
                    throw new SolanaError(SOLANA_ERROR__INVALID_NONCE, {
                        actualNonceValue: nonceValue,
                        expectedNonceValue,
                    });
                }
            }
        })();
        /**
         * STEP 2: Having subscribed for updates, make a one-shot request for the current nonce
         *         value to check if it has already been advanced.
         */
        const nonceIsAlreadyInvalidPromise = (async () => {
            const { value: nonceAccount } = await rpc
                .getAccountInfo(nonceAccountAddress, {
                    commitment,
                    dataSlice: { length: 32, offset: NONCE_VALUE_OFFSET },
                    encoding: 'base58',
                })
                .send({ abortSignal: abortController.signal });
            if (!nonceAccount) {
                throw new SolanaError(SOLANA_ERROR__NONCE_ACCOUNT_NOT_FOUND, {
                    nonceAccountAddress,
                });
            }
            const nonceValue =
                // This works because we asked for the exact slice of data representing the nonce
                // value, and furthermore asked for it in `base58` encoding.
                nonceAccount.data[0] as unknown as Nonce;
            if (nonceValue !== expectedNonceValue) {
                throw new SolanaError(SOLANA_ERROR__INVALID_NONCE, {
                    actualNonceValue: nonceValue,
                    expectedNonceValue,
                });
            } else {
                await new Promise(() => {
                    /* never resolve */
                });
            }
        })();
        try {
            return await Promise.race([nonceAccountDidAdvancePromise, nonceIsAlreadyInvalidPromise]);
        } finally {
            abortController.abort();
        }
    };
}
