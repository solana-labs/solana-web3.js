import { GetAccountInfoApi } from './rpc-methods/getAccountInfo';
import { GetBlockHeightApi } from './rpc-methods/getBlockHeight';
import { GetBlocksApi } from './rpc-methods/getBlocks';
import { GetInflationRewardApi } from './rpc-methods/getInflationReward';

export interface SolanaJsonRpcApi extends GetAccountInfoApi, GetBlockHeightApi, GetBlocksApi, GetInflationRewardApi {}
