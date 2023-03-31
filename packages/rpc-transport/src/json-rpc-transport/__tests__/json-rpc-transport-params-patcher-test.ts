import { createJsonRpcTransport } from '..';
import { Transport } from '../json-rpc-transport-types';
import { patchParamsForSolanaLabsRpc } from '../../params-patcher';

jest.mock('../../params-patcher');

interface TestRpcApi {
    someMethod(...args: unknown[]): unknown;
}

// FIXME(solana-labs/solana/issues/30341) The JSON RPC was designed to communicate JavaScript
// `Numbers` over the wire, which puts values over `Number.MAX_SAFE_INTEGER` at risk of rounding
// errors. This test exercises the warning handler for such integer overflows.
describe('Solana JSON-RPC params patcher', () => {
    let onIntegerOverflow: jest.Mock;
    let transport: Transport<TestRpcApi>;
    const url = 'fake://url';
    beforeEach(() => {
        onIntegerOverflow = jest.fn();
        transport = createJsonRpcTransport({ onIntegerOverflow, url });
    });
    describe('when a method call results in an integer overflow', () => {
        beforeEach(() => {
            (patchParamsForSolanaLabsRpc as jest.Mock).mockImplementation((params, onIntegerOverflow) => {
                onIntegerOverflow();
                return params;
            });
        });
        it('calls `onIntegerOverflow` with the offending method name', () => {
            transport.someMethod(1n);
            expect(onIntegerOverflow).toHaveBeenCalled();
            expect(onIntegerOverflow.mock.calls[0][0]).toBe('someMethod');
        });
    });
    describe('when a method call does not result in an integer overflow', () => {
        beforeEach(() => {
            (patchParamsForSolanaLabsRpc as jest.Mock).mockImplementation(params => params);
        });
        it('does not call `onIntegerOverflow`', () => {
            transport.someMethod(1n);
            expect(onIntegerOverflow).not.toHaveBeenCalled();
        });
    });
});
