// TODO: Eventually move this into whatever package implements transactions
declare type Commitment = 'confirmed' | 'finalized' | 'processed';

declare type DataSlice = readonly {
    offset: number;
    length: number;
};

declare type Slot =
    // TODO(solana-labs/solana/issues/30341) Represent as bigint
    number;
