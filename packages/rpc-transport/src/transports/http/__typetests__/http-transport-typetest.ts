import { devnet, mainnet, testnet } from '@solana/rpc-types';

import { IRpcTransport, IRpcTransportDevnet, IRpcTransportMainnet, IRpcTransportTestnet } from '../../transport-types';
import { createHttpTransport } from '../http-transport';

const genericUrl = 'http://localhost:8899';
const devnetUrl = devnet('https://api.devnet.solana.com');
const testnetUrl = testnet('https://api.testnet.solana.com');
const mainnetUrl = mainnet('https://api.mainnet-beta.solana.com');

// When providing a generic URL, the transport should be typed as an IRpcTransport
createHttpTransport({ url: genericUrl }) satisfies IRpcTransport;
//@ts-expect-error Should not be a devnet transport
createHttpTransport({ url: genericUrl }) satisfies IRpcTransportDevnet;
//@ts-expect-error Should not be a testnet transport
createHttpTransport({ url: genericUrl }) satisfies IRpcTransportTestnet;
//@ts-expect-error Should not be a mainnet transport
createHttpTransport({ url: genericUrl }) satisfies IRpcTransportMainnet;

// When providing a devnet URL, the transport should be typed as an IRpcTransportDevnet
createHttpTransport({ url: devnetUrl }) satisfies IRpcTransportDevnet;
//@ts-expect-error Should not be a testnet transport
createHttpTransport({ url: devnetUrl }) satisfies IRpcTransportTestnet;
//@ts-expect-error Should not be a mainnet transport
createHttpTransport({ url: devnetUrl }) satisfies IRpcTransportMainnet;

// When providing a testnet URL, the transport should be typed as an IRpcTransportTestnet
createHttpTransport({ url: testnetUrl }) satisfies IRpcTransportTestnet;
//@ts-expect-error Should not be a devnet transport
createHttpTransport({ url: testnetUrl }) satisfies IRpcTransportDevnet;
//@ts-expect-error Should not be a mainnet transport
createHttpTransport({ url: testnetUrl }) satisfies IRpcTransportMainnet;

// When providing a mainnet URL, the transport should be typed as an IRpcTransportMainnet
createHttpTransport({ url: mainnetUrl }) satisfies IRpcTransportMainnet;
//@ts-expect-error Should not be a devnet transport
createHttpTransport({ url: mainnetUrl }) satisfies IRpcTransportDevnet;
//@ts-expect-error Should not be a testnet transport
createHttpTransport({ url: mainnetUrl }) satisfies IRpcTransportTestnet;
