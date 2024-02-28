import { getSolanaErrorFromTransactionError } from '@solana/errors';
import type { Signature } from '@solana/keys';
import type { GetSignatureStatusesApi, Rpc } from '@solana/rpc';
import type { RpcSubscriptions, SignatureNotificationsApi } from '@solana/rpc-subscriptions';
import { type Commitment, commitmentComparator } from '@solana/rpc-types';

type GetRecentSignatureConfirmationPromiseFn = (config: {
    abortSignal: AbortSignal;
    commitment: Commitment;
    signature: Signature;
}) => Promise<void>;

export function createRecentSignatureConfirmationPromiseFactory(
    rpc: Rpc<GetSignatureStatusesApi>,
    rpcSubscriptions: RpcSubscriptions<SignatureNotificationsApi>,
): GetRecentSignatureConfirmationPromiseFn {
    return async function getRecentSignatureConfirmationPromise({
        abortSignal: callerAbortSignal,
        commitment,
        signature,
    }) {
        const abortController = new AbortController();
        function handleAbort() {
            abortController.abort();
        }
        callerAbortSignal.addEventListener('abort', handleAbort, { signal: abortController.signal });
        /**
         * STEP 1: Set up a subscription for status changes to a signature.
         */
        const signatureStatusNotifications = await rpcSubscriptions
            .signatureNotifications(signature, { commitment })
            .subscribe({ abortSignal: abortController.signal });
        const signatureDidCommitPromise = (async () => {
            for await (const signatureStatusNotification of signatureStatusNotifications) {
                if (signatureStatusNotification.value.err) {
                    throw getSolanaErrorFromTransactionError(signatureStatusNotification.value.err);
                } else {
                    return;
                }
            }
        })();
        /**
         * STEP 2: Having subscribed for updates, make a one-shot request for the current status.
         *         This will only yield a result if the signature is still in the status cache.
         */
        const signatureStatusLookupPromise = (async () => {
            const { value: signatureStatusResults } = await rpc
                .getSignatureStatuses([signature])
                .send({ abortSignal: abortController.signal });
            const signatureStatus = signatureStatusResults[0];
            if (
                signatureStatus &&
                signatureStatus.confirmationStatus &&
                commitmentComparator(signatureStatus.confirmationStatus, commitment) >= 0
            ) {
                return;
            } else {
                await new Promise(() => {
                    /* never resolve */
                });
            }
        })();
        try {
            return await Promise.race([signatureDidCommitPromise, signatureStatusLookupPromise]);
        } finally {
            abortController.abort();
        }
    };
}
