type GetVersionApiResponse = Readonly<{
    /** Unique identifier of the current software's feature set */
    'feature-set': number; // `u32`
    /** Software version of `solana-core` */
    'solana-core': string;
}>;

export interface GetVersionApi {
    /**
     * Returns the current Solana version running on the node
     */
    getVersion(): GetVersionApiResponse;
}
