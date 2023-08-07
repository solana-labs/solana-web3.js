import { Base58EncodedAddress } from '@solana/addresses';

type GetIdentityApiResponse = Readonly<{
    identity: Base58EncodedAddress;
}>;

export interface GetIdentityApi {
    /**
     * Returns the identity pubkey for the current node
     */
    getIdentity(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>
    ): GetIdentityApiResponse;
}
