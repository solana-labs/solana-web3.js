import { GetAccountInfoApi } from './rpc-methods/getAccountInfo';
import { GetBlockHeightApi } from './rpc-methods/getBlockHeight';
import { GetBlocksApi } from './rpc-methods/getBlocks';

declare interface JsonRpcApi extends GetAccountInfoApi, GetBlockHeightApi, GetBlocksApi {}
