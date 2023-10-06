import { Slot } from '@solana/rpc-core/dist/types/rpc-methods/common';
import type { SlotNotificationsApi } from '@solana/rpc-core/dist/types/rpc-subscriptions/slot-notifications';
import { RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';

type GetBlockHeightExceedencePromiseFn = (config: {
    abortSignal: AbortSignal;
    lastValidBlockHeight: Slot;
}) => Promise<void>;

export function createBlockHeightExceedencePromiseFactory(
    rpcSubscriptions: RpcSubscriptions<SlotNotificationsApi>
): GetBlockHeightExceedencePromiseFn {
    return async function getBlockHeightExceedencePromise({ abortSignal: callerAbortSignal, lastValidBlockHeight }) {
        const abortController = new AbortController();
        function handleAbort() {
            abortController.abort();
        }
        callerAbortSignal.addEventListener('abort', handleAbort, { signal: abortController.signal });
        const slotNotifications = await rpcSubscriptions
            .slotNotifications()
            .subscribe({ abortSignal: abortController.signal });
        try {
            for await (const slotNotification of slotNotifications) {
                if (slotNotification.slot > lastValidBlockHeight) {
                    // TODO: Coded error.
                    throw new Error(
                        'The network has progressed past the last block for which this transaction ' +
                            'could have committed.'
                    );
                }
            }
        } finally {
            abortController.abort();
        }
    };
}
