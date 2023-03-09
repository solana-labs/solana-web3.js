declare type DataSlice = readonly {
    offset: number;
    length: number;
};

// TODO: Eventually move this into whatever package implements transactions
declare type Finality = 'confirmed' | 'finalized' | 'processed';

declare type Slot =
    // TODO(solana-labs/solana/issues/30341) Represent as bigint
    number;
