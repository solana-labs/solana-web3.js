/**
 * EXAMPLE
 * Add a custom JSON RPC method to the base Solana JSON RPC API using @solana/web3.js.
 *
 * To run this example, execute `pnpm start` in this directory.
 */
import { createLogger } from '@solana/example-utils/createLogger.js';
import {
    Address,
    address,
    createDefaultRpcTransport,
    createRpc,
    createSolanaRpcApi,
    DEFAULT_RPC_CONFIG,
    mainnet,
    RpcApi,
    RpcApiMethods,
    SolanaRpcApiMainnet,
} from '@solana/web3.js';

const log = createLogger('Custom JSON RPC API');

/**
 * STEP 1: CUSTOM JSON RPC API CALL SIGNATURE
 * Define the call signature of the custom API. For this example we will use the Triton One
 * `getAsset` API, available on the public mainnet RPC server.
 * https://docs.triton.one/digital-assets-api/metaplex-digital-assets-api/get-asset
 */
type AssetMetadata = Readonly<{
    description: string;
    name: string;
    symbol: string;
}>;
interface TritonGetAssetApi extends RpcApiMethods {
    /**
     * Define the ideal developer-facing API as a TypeScript type. Doing so will enable typechecking
     * and autocompletion for it on the RPC instance.
     */
    getAssetMetadata(address: Address): AssetMetadata;
}

/**
 * STEP 2: CUSTOM JSON RPC API IMPLEMENTATION
 * Create an instance of the default JSON RPC API, then create a wrapper around it to intercept
 * calls for custom API methods. The wrapper should format the inputs to satisfy the API of the JSON
 * RPC server, and post-process the server response to satisfy the call signature defined above.
 */
const solanaRpcApi = createSolanaRpcApi<SolanaRpcApiMainnet>(DEFAULT_RPC_CONFIG);
/**
 * Create a proxy that wraps the Solana RPC API and adds extra functionality.
 */
const customizedRpcApi = new Proxy(solanaRpcApi, {
    defineProperty() {
        return false;
    },
    deleteProperty() {
        return false;
    },
    get(target, p, receiver) {
        const methodName = p.toString();
        if (methodName === 'getAssetMetadata') {
            /**
             * When the `getAssetMetadata` method is called on the RPC, return a custom definition.
             */
            return (address: Address) => {
                return {
                    /**
                     * If the JSON RPC API method is named differently than the method exposed on
                     * the custom API, supply it here.
                     */
                    methodName: 'getAsset',
                    /**
                     * When the params that the JSON RPC API expects are formatted differently than
                     * the arguments to the method exposed on the custom API, reformat them here.
                     */
                    params: { id: address },
                    /**
                     * When the return type of the method exposed on the custom API has a different
                     * shape than the result returned from the JSON RPC API, supply a transform.
                     */
                    responseTransformer(rawResponse: { result: { content: { metadata: AssetMetadata } } }) {
                        return rawResponse.result.content.metadata;
                    },
                };
            };
        } else {
            /**
             * If the method called is not a custom one, delegate to the original implementation.
             */
            return Reflect.get(target, p, receiver);
        }
    },
}) as RpcApi<SolanaRpcApiMainnet & TritonGetAssetApi>; // Cast to a type that is a mix of both APIs.

/**
 * STEP 3: RPC CONNECTION
 * Combine the custom RPC API with a default JSON RPC transport to create an RPC instance.
 */
const customizedRpc = createRpc({
    api: customizedRpcApi,
    transport: createDefaultRpcTransport({ url: mainnet('https://api.mainnet-beta.solana.com') }),
});

/**
 * STEP 4: USE THE DEFAULT API
 * Test that the base API still works by calling a Solana RPC API method like `getLatestBlockhash`.
 */
const { value: latestBlockhash } = await customizedRpc.getLatestBlockhash().send();
log.info(latestBlockhash, '[step 1] Solana RPC methods like `getLatestBlockhash` still work');

/**
 * STEP 5: USE THE CUSTOM API
 * Test the custom `getAssetMetadata` method.
 */
const metadata = await customizedRpc.getAssetMetadata(address('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')).send();
log.info({ metadata }, '[step 2] The custom `getAssetMetadata` that we implemented also works');
