import { isSolanaRequest } from '../is-solana-request';

describe('isSolanaRequest', () => {
    it('returns true if the method name is from the Solana RPC API', () => {
        const payload = { jsonrpc: '2.0', method: 'getBalance', params: ['1234..5678'] };
        expect(isSolanaRequest(payload)).toBe(true);
    });
    it('returns false if the method name is not from the Solana RPC API', () => {
        const payload = { jsonrpc: '2.0', method: 'getAssetsByAuthority', params: ['1234..5678'] };
        expect(isSolanaRequest(payload)).toBe(false);
    });
});
