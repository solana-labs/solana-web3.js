import { GetAccountInfoApi } from './rpc-methods/getAccountInfo';
import { GetBlockHeightApi } from './rpc-methods/getBlockHeight';
import { GetBlocksApi } from './rpc-methods/getBlocks';

export interface SolanaJsonRpcApi extends GetAccountInfoApi, GetBlockHeightApi, GetBlocksApi {}
