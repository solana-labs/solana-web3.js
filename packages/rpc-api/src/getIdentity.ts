import type { Address } from '@solana/addresses';

type GetIdentityApiResponse = Readonly<{
    identity: Address;
}>;

export type GetIdentityApi = {
    /**
     * Returns the identity pubkey for the current node
     */
    getIdentity(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>,
    ): GetIdentityApiResponse;
};
