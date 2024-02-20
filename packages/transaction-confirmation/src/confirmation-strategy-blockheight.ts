import { SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED, SolanaError } from '@solana/errors';
import type { GetEpochInfoApi, Rpc } from '@solana/rpc';
import type { RpcSubscriptions, SlotNotificationsApi } from '@solana/rpc-subscriptions';
import type { Commitment } from '@solana/rpc-types';

type GetBlockHeightExceedencePromiseFn = (config: {
    abortSignal: AbortSignal;
    commitment?: Commitment;
    lastValidBlockHeight: bigint;
}) => Promise<void>;

export function createBlockHeightExceedencePromiseFactory({
    rpc,
    rpcSubscriptions,
}: Readonly<{
    rpc: Rpc<GetEpochInfoApi>;
    rpcSubscriptions: RpcSubscriptions<SlotNotificationsApi>;
}>): GetBlockHeightExceedencePromiseFn {
    return async function getBlockHeightExceedencePromise({
        abortSignal: callerAbortSignal,
        commitment,
        lastValidBlockHeight,
    }) {
        const abortController = new AbortController();
        const handleAbort = () => {
            abortController.abort();
        };
        callerAbortSignal.addEventListener('abort', handleAbort, { signal: abortController.signal });
        async function getBlockHeightAndDifferenceBetweenSlotHeightAndBlockHeight() {
            const { absoluteSlot, blockHeight } = await rpc
                .getEpochInfo({ commitment })
                .send({ abortSignal: abortController.signal });
            return {
                blockHeight,
                differenceBetweenSlotHeightAndBlockHeight: absoluteSlot - blockHeight,
            };
        }
        try {
            const [slotNotifications, { blockHeight: initialBlockHeight, differenceBetweenSlotHeightAndBlockHeight }] =
                await Promise.all([
                    rpcSubscriptions.slotNotifications().subscribe({ abortSignal: abortController.signal }),
                    getBlockHeightAndDifferenceBetweenSlotHeightAndBlockHeight(),
                ]);
            let currentBlockHeight = initialBlockHeight;
            if (currentBlockHeight <= lastValidBlockHeight) {
                let lastKnownDifferenceBetweenSlotHeightAndBlockHeight = differenceBetweenSlotHeightAndBlockHeight;
                for await (const slotNotification of slotNotifications) {
                    const { slot } = slotNotification;
                    if (slot - lastKnownDifferenceBetweenSlotHeightAndBlockHeight > lastValidBlockHeight) {
                        // Before making a final decision, recheck the actual block height.
                        const {
                            blockHeight: recheckedBlockHeight,
                            differenceBetweenSlotHeightAndBlockHeight: currentDifferenceBetweenSlotHeightAndBlockHeight,
                        } = await getBlockHeightAndDifferenceBetweenSlotHeightAndBlockHeight();
                        currentBlockHeight = recheckedBlockHeight;
                        if (currentBlockHeight > lastValidBlockHeight) {
                            // Verfied; the block height has been exceeded.
                            break;
                        } else {
                            // The block height has not been exceeded, which implies that the
                            // difference between the slot height and the block height has grown
                            // (ie. some blocks have been skipped since we started). Recalibrate the
                            // difference and keep waiting.
                            lastKnownDifferenceBetweenSlotHeightAndBlockHeight =
                                currentDifferenceBetweenSlotHeightAndBlockHeight;
                        }
                    }
                }
            }
            throw new SolanaError(SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED, {
                currentBlockHeight,
                lastValidBlockHeight,
            });
        } finally {
            abortController.abort();
        }
    };
}
