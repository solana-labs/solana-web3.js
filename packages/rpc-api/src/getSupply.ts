import type { Address } from '@solana/addresses';
import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Commitment, LamportsUnsafeBeyond2Pow53Minus1, SolanaRpcResponse } from '@solana/rpc-types';

type GetSupplyConfig = Readonly<{
    commitment?: Commitment;
}>;

type GetSupplyApiResponseBase = SolanaRpcResponse<{
    /** Circulating supply in lamports */
    circulating: LamportsUnsafeBeyond2Pow53Minus1;
    /** Non-circulating supply in lamports */
    nonCirculating: LamportsUnsafeBeyond2Pow53Minus1;
    /** Total supply in lamports */
    total: LamportsUnsafeBeyond2Pow53Minus1;
}>;

type GetSupplyApiResponseWithNonCirculatingAccounts = GetSupplyApiResponseBase &
    Readonly<{
        value: Readonly<{
            /** an array of account addresses of non-circulating accounts */
            nonCirculatingAccounts: Address[];
        }>;
    }>;

type GetSupplyApiResponseWithoutNonCirculatingAccounts = GetSupplyApiResponseBase &
    Readonly<{
        value: Readonly<{
            /** As per the docs:
             * "If `excludeNonCirculatingAccountsList` is enabled, the returned array will be empty."
             * See: https://solana.com/docs/rpc/http/getsupply
             */
            nonCirculatingAccounts: never[];
        }>;
    }>;

export interface GetSupplyApi extends RpcApiMethods {
    /**
     * Returns information about the current supply.
     */
    getSupply(
        config: GetSupplyConfig &
            Readonly<{
                excludeNonCirculatingAccountsList: true;
            }>,
    ): GetSupplyApiResponseWithoutNonCirculatingAccounts;
    getSupply(
        config?: GetSupplyConfig &
            Readonly<{
                excludeNonCirculatingAccountsList?: false;
            }>,
    ): GetSupplyApiResponseWithNonCirculatingAccounts;
}
