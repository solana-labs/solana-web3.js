import { Base58EncodedAddress } from '@solana/addresses';

type GetIdentityApiResponse = Readonly<{
    identity: Base58EncodedAddress;
}>;

export interface GetIdentityApi {
    /**
     * Returns the identity pubkey for the current node
     */
    getIdentity(): GetIdentityApiResponse;
}
