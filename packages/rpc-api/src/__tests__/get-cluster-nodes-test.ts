import { open } from 'node:fs/promises';

import type { Rpc } from '@solana/rpc-spec';
import path from 'path';

import { GetClusterNodesApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

const logFilePath = path.resolve(__dirname, '../../../../test-ledger/validator.log');

// TPU does not seem to be reliably matchable from the log file
const featureSetPattern = /feat:([\d]+)/;
const gossipPattern = /local gossip address: [\d.]+:([\d]+)/;
const pubkeyPattern = /identity pubkey: ([\w]{32,})/;
const rpcPattern = /rpc bound to [\d.]+:([\d]+)/;
const shredVersionPattern = /shred_version: ([\d]+)/;
const versionPattern = /solana-validator ([\d.]+)/;

async function getNodeInfoFromLogFile() {
    const file = await open(logFilePath);
    try {
        let featureSet: number | undefined;
        let gossip: string | undefined;
        let pubkey: string | undefined;
        let rpc: string | undefined;
        let shredVersion: number | undefined;
        let version: string | undefined;
        for await (const line of file.readLines({ encoding: 'utf-8' })) {
            const featureSetMatch = line.match(featureSetPattern);
            if (featureSetMatch) {
                featureSet = parseInt(featureSetMatch[1]);
            }
            const gossipMatch = line.match(gossipPattern);
            if (gossipMatch) {
                gossip = '127.0.0.1:' + gossipMatch[1];
            }
            const pubkeyMatch = line.match(pubkeyPattern);
            if (pubkeyMatch) {
                pubkey = pubkeyMatch[1];
            }
            const rpcMatch = line.match(rpcPattern);
            if (rpcMatch) {
                rpc = '127.0.0.1:' + rpcMatch[1];
            }
            const shredVersionMatch = line.match(shredVersionPattern);
            if (shredVersionMatch) {
                shredVersion = parseInt(shredVersionMatch[1]);
            }
            const versionMatch = line.match(versionPattern);
            if (versionMatch) {
                version = versionMatch[1];
            }
            if (featureSet && gossip && pubkey && rpc && shredVersion && version) {
                return [featureSet, gossip, pubkey, rpc, shredVersion, version] as const;
            }
        }
        throw new Error(`Node info not found in logfile \`${logFilePath}\``);
    } finally {
        await file.close();
    }
}

describe('getClusterNodes', () => {
    let mockRpc: Rpc<GetClusterNodesApi>;
    beforeEach(() => {
        mockRpc = createLocalhostSolanaRpc();
    });

    describe('when run against the test validator', () => {
        it('returns RPC and validator info', async () => {
            expect.assertions(1);
            const [featureSet, gossip, pubkey, rpc, shredVersion, version] = await getNodeInfoFromLogFile();
            const res = await mockRpc.getClusterNodes().send();
            expect(res[0]).toStrictEqual({
                featureSet,
                gossip,
                pubkey,
                pubsub: expect.stringMatching(/127.0.0.1(:\d+)?/),
                rpc,
                shredVersion,
                tpu: expect.stringMatching(/127.0.0.1(:\d+)?/),
                tpuQuic: expect.stringMatching(/127.0.0.1(:\d+)?/),
                version,
            });
        });
    });
});
