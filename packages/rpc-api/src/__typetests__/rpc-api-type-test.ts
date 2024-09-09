import { SolanaRpcApi, SolanaRpcApiDevnet, SolanaRpcApiMainnet, SolanaRpcApiTestnet } from '..';

'getAccountInfo' satisfies keyof SolanaRpcApi;
// @ts-expect-error RPC API does not have this method
'someMadeUpMethod' satisfies keyof SolanaRpcApi;

// if we extend the RPC API with additional methods, we can access them on keyof
type TestRpcApi = SolanaRpcApi & {
    someMadeUpMethod: () => void;
};
'someMadeUpMethod' satisfies keyof TestRpcApi;

// request airdrop is available on test networks, but not mainnet
'requestAirdrop' satisfies keyof SolanaRpcApiDevnet;
'requestAirdrop' satisfies keyof SolanaRpcApiTestnet;
'requestAirdrop' satisfies keyof SolanaRpcApi;
// @ts-expect-error requestAirdrop is not available on mainnet
'requestAirdrop' satisfies keyof SolanaRpcApiMainnet;
