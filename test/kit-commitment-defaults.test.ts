import {expect} from 'chai';
import * as mockttp from 'mockttp';

import {Commitment, Connection} from '../src';
import type {ConnectionSubscriptionsRuntime} from '../src/rpc-subscriptions/runtime';

const MOCK_PORT = 9998;
const HTTP_URL = `http://127.0.0.1:${MOCK_PORT}/`;
const WS_URL = `ws://127.0.0.1:${MOCK_PORT}/`;

type ConnectionInternals = {
  _typedRpc: Connection['_typedRpc'];
  _subscriptionsRuntime: ConnectionSubscriptionsRuntime;
};

function getInternals(connection: Connection): ConnectionInternals {
  return connection as unknown as ConnectionInternals;
}

if (process.env.TEST_LIVE === undefined) {
  describe('Kit client default commitment', () => {
    let server: mockttp.Mockttp;
    beforeEach(async () => {
      server = mockttp.getLocal();
      await server.start(MOCK_PORT);
    });
    afterEach(async () => {
      await server.stop();
    });

    describe('HTTP (`_typedRpc`)', () => {
      async function captureGetBalanceRequestParams(
        commitment?: Commitment,
      ): Promise<unknown> {
        const endpoint = await server.forPost('/').thenJson(200, {
          id: '1',
          jsonrpc: '2.0',
          result: {context: {slot: 1}, value: 0},
        });
        const connection = new Connection(HTTP_URL, commitment);
        await getInternals(connection)
          ._typedRpc.getBalance(
            '7A6PCsp5EQFHsUpnvLmLvNjWvYSNJGCLYtpvzL1shV4o' as Parameters<
              Connection['_typedRpc']['getBalance']
            >[0],
          )
          .send();
        const [request] = await endpoint.getSeenRequests();
        const body = (await request.body.getJson()) as {params: unknown[]};
        return body.params[1];
      }

      it('uses the commitment the Connection was constructed with', async () => {
        expect(await captureGetBalanceRequestParams('processed')).to.eql({
          commitment: 'processed',
        });
      });

      it('falls back to `confirmed` when the Connection has no commitment', async () => {
        expect(await captureGetBalanceRequestParams()).to.eql({
          commitment: 'confirmed',
        });
      });
    });

    describe('subscriptions (`KitSubscriptionRuntime`)', () => {
      async function captureAccountSubscribeParams(
        commitment?: Commitment,
      ): Promise<unknown> {
        await server.forAnyWebSocket().thenPassivelyListen();
        const firstMessageReceived = new Promise<string>(resolve => {
          void server.on('websocket-message-received', message => {
            resolve(message.content.toString());
          });
        });
        const connection = new Connection(HTTP_URL, {
          commitment,
          wsEndpoint: WS_URL,
        });
        const pendingSubscription = getInternals(
          connection,
        )._subscriptionsRuntime.openSubscription({
          address: '7A6PCsp5EQFHsUpnvLmLvNjWvYSNJGCLYtpvzL1shV4o',
          kind: 'account',
        });
        pendingSubscription.catch(() => {});
        const message = JSON.parse(await firstMessageReceived) as {
          method: string;
          params: unknown[];
        };
        expect(message.method).to.eq('accountSubscribe');
        return message.params[1];
      }

      it('uses the commitment the Connection was constructed with', async () => {
        expect(await captureAccountSubscribeParams('processed')).to.eql({
          commitment: 'processed',
        });
      });

      it('falls back to `confirmed` when the Connection has no commitment', async () => {
        expect(await captureAccountSubscribeParams()).to.eql({
          commitment: 'confirmed',
        });
      });
    });
  });
}
