import { Address } from '@solana/addresses';
import { Commitment, Rpc } from '@solana/rpc-types';

import { GetSupplyApi } from '../getSupply';

const rpc = null as unknown as Rpc<GetSupplyApi>;

// Parameters
const params = null as unknown as Parameters<GetSupplyApi['getSupply']>[0];
params satisfies { commitment?: Commitment } | undefined;
params satisfies { excludeNonCirculatingAccountsList?: boolean } | undefined;

async () => {
    {
        const result = await rpc.getSupply({ excludeNonCirculatingAccountsList: true }).send();
        result satisfies Readonly<{
            value: Readonly<{
                nonCirculatingAccounts: never[];
            }>;
        }>;
    }

    {
        const result = await rpc.getSupply().send();
        result satisfies Readonly<{
            value: Readonly<{
                nonCirculatingAccounts: Address[];
            }>;
        }>;
        // @ts-expect-error should not be `never`
        result satisfies Readonly<{
            value: Readonly<{
                nonCirculatingAccounts: never[];
            }>;
        }>;
    }

    {
        const result = await rpc.getSupply({ excludeNonCirculatingAccountsList: false }).send();
        result satisfies Readonly<{
            value: Readonly<{
                nonCirculatingAccounts: Address[];
            }>;
        }>;
        // @ts-expect-error should not be `never`
        result satisfies Readonly<{
            value: Readonly<{
                nonCirculatingAccounts: never[];
            }>;
        }>;
    }
};
