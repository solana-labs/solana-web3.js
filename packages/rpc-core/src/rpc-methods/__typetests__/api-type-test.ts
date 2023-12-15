import { IRpcApi, IRpcApiDevnet, IRpcApiMainnet, IRpcApiTestnet } from '@solana/rpc-transport';

import { createSolanaRpcApi, SolanaRpcMethodsDevnet, SolanaRpcMethodsMainnet, SolanaRpcMethodsTestnet } from '..';

const config = null as unknown as Parameters<typeof createSolanaRpcApi>[0];

createSolanaRpcApi<SolanaRpcMethodsDevnet>(config) satisfies IRpcApi<SolanaRpcMethodsDevnet>;
createSolanaRpcApi<SolanaRpcMethodsDevnet>(config) satisfies IRpcApiDevnet<SolanaRpcMethodsDevnet>;
// @ts-expect-error Should not be a testnet API
createSolanaRpcApi<SolanaRpcMethodsDevnet>(config) satisfies IRpcApiTestnet<SolanaRpcMethodsDevnet>;
// @ts-expect-error Should not be a mainnet API
createSolanaRpcApi<SolanaRpcMethodsDevnet>(config) satisfies IRpcApiMainnet<SolanaRpcMethodsDevnet>;

createSolanaRpcApi<SolanaRpcMethodsTestnet>(config) satisfies IRpcApi<SolanaRpcMethodsTestnet>;
createSolanaRpcApi<SolanaRpcMethodsTestnet>(config) satisfies IRpcApiTestnet<SolanaRpcMethodsTestnet>;
// @ts-expect-error Should not be a devnet API
createSolanaRpcApi<SolanaRpcMethodsTestnet>(config) satisfies IRpcApiDevnet<SolanaRpcMethodsTestnet>;
// @ts-expect-error Should not be a mainnet API
createSolanaRpcApi<SolanaRpcMethodsTestnet>(config) satisfies IRpcApiMainnet<SolanaRpcMethodsTestnet>;

createSolanaRpcApi<SolanaRpcMethodsMainnet>(config) satisfies IRpcApi<SolanaRpcMethodsMainnet>;
createSolanaRpcApi<SolanaRpcMethodsMainnet>(config) satisfies IRpcApiMainnet<SolanaRpcMethodsMainnet>;
// @ts-expect-error Should not be a devnet API
createSolanaRpcApi<SolanaRpcMethodsMainnet>(config) satisfies IRpcApiDevnet<SolanaRpcMethodsMainnet>;
// @ts-expect-error Should not be a testnet API
createSolanaRpcApi<SolanaRpcMethodsMainnet>(config) satisfies IRpcApiTestnet<SolanaRpcMethodsMainnet>;
