import { RpcTransport } from '@solana/rpc-spec';

import { createHttpTransport } from '../http-transport';

const url = 'http://localhost:8899';

createHttpTransport({ url }) satisfies RpcTransport;
