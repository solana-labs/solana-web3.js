import { IJsonRpcTransport } from '@solana/rpc-transport';
import { rpc } from '../rpc';

describe('rpc', () => {
    let transport: jest.Mocked<IJsonRpcTransport>;
    beforeEach(() => {
        transport = { send: jest.fn() };
    });
    describe('a method call without params', () => {
        beforeEach(async () => {
            await rpc.getBlockHeight(transport);
        });
        it('calls `send` on the supplied transport with the function name as the method name and `undefined` params', () => {
            expect(transport.send).toHaveBeenCalledWith('getBlockHeight', undefined);
        });
    });
    describe('a method call with params', () => {
        const params = [1n, undefined, { commitment: 'finalized' }] as const;
        beforeEach(async () => {
            await rpc.getBlocks(transport, ...params);
        });
        it('calls `send` on the supplied transport with the function name as the method name and the supplied params', () => {
            expect(transport.send).toHaveBeenCalledWith('getBlocks', params);
        });
    });
});
