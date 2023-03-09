import { GetBlockHeightApi } from './rpc-methods/getBlockHeight';
import { GetBlocksApi } from './rpc-methods/getBlocks';

declare interface JsonRpcApi extends GetBlockHeightApi, GetBlocksApi {}
