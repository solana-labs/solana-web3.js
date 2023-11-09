import { resolveAccount } from '../../resolvers/account';

export const commonTypeDefs = /* GraphQL */ `
    type ReturnData {
        data: String
        programId: String
    }

    type Reward {
        commission: Int
        lamports: BigInt
        postBalance: BigInt
        pubkey: String
        rewardType: String
    }

    type TokenAmount {
        amount: String
        decimals: Int
        uiAmount: BigInt
        uiAmountString: String
    }

    type TokenBalance {
        accountIndex: Int
        mint: Account
        owner: Account
        programId: String
        uiTokenAmount: TokenAmount
    }
`;

export const commonResolvers = {
    TokenBalance: {
        mint: resolveAccount('mint'),
        owner: resolveAccount('owner'),
    },
};
