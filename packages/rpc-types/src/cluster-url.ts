export type MainnetUrl = string & { '~cluster': 'mainnet' };
export type DevnetUrl = string & { '~cluster': 'devnet' };
export type TestnetUrl = string & { '~cluster': 'testnet' };
export type ClusterUrl = DevnetUrl | MainnetUrl | TestnetUrl | string;

export function mainnet(putativeString: string): MainnetUrl {
    return putativeString as MainnetUrl;
}
export function devnet(putativeString: string): DevnetUrl {
    return putativeString as DevnetUrl;
}
export function testnet(putativeString: string): TestnetUrl {
    return putativeString as TestnetUrl;
}
