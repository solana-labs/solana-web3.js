import { getSolanaErrorFromTransactionError } from '@solana/errors';
import { AbortController } from '@solana/event-target-impl';
import type { Signature } from '@solana/keys';
import { safeRace } from '@solana/promises';
import type { GetSignatureStatusesApi, Rpc } from '@solana/rpc';
import type { RpcSubscriptions, SignatureNotificationsApi } from '@solana/rpc-subscriptions';
import { type Commitment, commitmentComparator } from '@solana/rpc-types';

type GetRecentSignatureConfirmationPromiseFn = (config: {
    abortSignal: AbortSignal;
    commitment: Commitment;
    signature: Signature;
}) => Promise<void>;

type CreateRecentSignatureConfirmationPromiseFactoryConfig<TCluster> = {
    rpc: Rpc<GetSignatureStatusesApi> & { '~cluster'?: TCluster };
    rpcSubscriptions: RpcSubscriptions<SignatureNotificationsApi> & { '~cluster'?: TCluster };
};

export function createRecentSignatureConfirmationPromiseFactory({
    rpc,
    rpcSubscriptions,
}: CreateRecentSignatureConfirmationPromiseFactoryConfig<'devnet'>): GetRecentSignatureConfirmationPromiseFn;
export function createRecentSignatureConfirmationPromiseFactory({
    rpc,
    rpcSubscriptions,
}: CreateRecentSignatureConfirmationPromiseFactoryConfig<'testnet'>): GetRecentSignatureConfirmationPromiseFn;
export function createRecentSignatureConfirmationPromiseFactory({
    rpc,
    rpcSubscriptions,
}: CreateRecentSignatureConfirmationPromiseFactoryConfig<'mainnet'>): GetRecentSignatureConfirmationPromiseFn;
export function createRecentSignatureConfirmationPromiseFactory<
    TCluster extends 'devnet' | 'mainnet' | 'testnet' | void = void,
>({
    rpc,
    rpcSubscriptions,
}: CreateRecentSignatureConfirmationPromiseFactoryConfig<TCluster>): GetRecentSignatureConfirmationPromiseFn {
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
            return await safeRace([signatureDidCommitPromise, signatureStatusLookupPromise]);
        } finally {
            abortController.abort();
        }
    };
}
