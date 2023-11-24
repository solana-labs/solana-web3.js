/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Connection as LegacyConnection } from '@solana/web3.js-legacy';

import { Connection } from '../connection.js';

new Connection('https://some.rpc').rpcEndpoint satisfies 'https://some.rpc';

// @ts-expect-error This is only a partial sham
new Connection('https://some.rpc') satisfies LegacyConnection;

// @ts-expect-error This is only a partial sham
Connection satisfies typeof LegacyConnection;
