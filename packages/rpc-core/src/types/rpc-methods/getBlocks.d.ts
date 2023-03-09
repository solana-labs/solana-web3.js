import { IJsonRpcTransport } from '@solana/rpc-transport';

type GetBlocksApiResponse = Slot[];

declare interface GetBlocksApi {
    /**
     * Returns a list of confirmed blocks between two slots
     */
    getBlocks(
        transport: IJsonRpcTransport,
        startSlot: Slot,
        endSlotInclusive?: Slot,
        config?: readonly {
            // Defaults to `finalized`
            commitment?: Exclude<Commitment, 'processed'>;
        }
    ): Promise<GetBlocksApiResponse>;
}
