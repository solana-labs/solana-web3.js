import type { Address } from '@solana/addresses';
import type { Rpc } from '@solana/rpc-spec';

import type { GetSupplyApi } from '../getSupply';

const rpc = null as unknown as Rpc<GetSupplyApi>;

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
