import { createSolanaRpcApi, SolanaRpcApi } from '..';

type TestApi = SolanaRpcApi & {
    someNewFunction(): void;
    someOtherFunction(): void;
};

createSolanaRpcApi<TestApi>();
createSolanaRpcApi<TestApi>({
    extendAllowedNumericKeypaths: {},
});
createSolanaRpcApi<TestApi>({
    extendAllowedNumericKeypaths: {
        someNewFunction: [['someNewKeyPath']],
    },
});
createSolanaRpcApi<TestApi>({
    extendAllowedNumericKeypaths: {
        someNewFunction: [['someNewKeyPath']],
        someOtherFunction: [['someOtherKeyPath']],
    },
});

createSolanaRpcApi<TestApi>({
    extendAllowedNumericKeypaths: {
        // @ts-expect-error getAccountInfo is a SolanaRpcApi method
        getAccountInfo: [],
    },
});

createSolanaRpcApi<SolanaRpcApi>();
createSolanaRpcApi<SolanaRpcApi>({
    extendAllowedNumericKeypaths: {},
});
createSolanaRpcApi<SolanaRpcApi>({
    extendAllowedNumericKeypaths: {
        // @ts-expect-error getAccountInfo is a SolanaRpcApi method
        getAccountInfo: [],
    },
});
createSolanaRpcApi<SolanaRpcApi>({
    extendAllowedNumericKeypaths: {
        // @ts-expect-error someNewMethod is not a method on the RPC API
        someNewMethod: [['someNewKeyPath']],
    },
});
