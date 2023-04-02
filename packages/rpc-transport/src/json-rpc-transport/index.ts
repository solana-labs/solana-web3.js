import { makeHttpRequest } from '../http-request';
import { SolanaJsonRpcError } from './json-rpc-errors';
import { createJsonRpcMessage } from './json-rpc-message';
import { ArmedBatchTransport, ArmedTransport, Transport } from './json-rpc-transport-types';
import { patchParamsForSolanaLabsRpc } from '../params-patcher';

interface IHasIdentifier {
    readonly id: number;
}
type JsonRpcResponse<TResponse> = IHasIdentifier &
    Readonly<{ result: TResponse } | { error: { code: number; message: string; data?: unknown } }>;
type JsonRpcBatchResponse<TResponses extends unknown[]> = [
    ...{ [P in keyof TResponses]: JsonRpcResponse<TResponses[P]> }
];
type JsonRpcMessage = ReturnType<typeof createJsonRpcMessage>;

type TransportConfig = Readonly<{
    onIntegerOverflow?: (method: string, keyPath: (number | string)[], value: bigint) => void;
    url: string;
}>;

function createArmedJsonRpcTransport<TRpcApi extends object, TResponse>(
    transportConfig: TransportConfig,
    pendingMessage: JsonRpcMessage
) {
    const { url } = transportConfig;
    const transport = {
        async send(): Promise<TResponse> {
            return await sendPayload(pendingMessage, url);
        },
    } as ArmedTransport<TRpcApi, TResponse>;
    return makeProxy<TRpcApi, TResponse>(transport, transportConfig, pendingMessage);
}

function createArmedBatchJsonRpcTransport<TRpcApi extends object, TResponses extends unknown[]>(
    transportConfig: TransportConfig,
    pendingMessages: JsonRpcMessage[]
) {
    const { url } = transportConfig;
    const transport = {
        async sendBatch(): Promise<TResponses> {
            return await sendPayload(pendingMessages, url);
        },
    } as ArmedBatchTransport<TRpcApi, TResponses>;
    return makeProxy<TRpcApi, TResponses>(transport, transportConfig, pendingMessages);
}

function makeProxy<TRpcApi, TResponses extends unknown[]>(
    transport: ArmedBatchTransport<TRpcApi, TResponses>,
    transportConfig: TransportConfig,
    pendingRequests: JsonRpcMessage[]
): ArmedBatchTransport<TRpcApi, TResponses>;
function makeProxy<TRpcApi, TResponse>(
    transport: ArmedTransport<TRpcApi, TResponse>,
    transportConfig: TransportConfig,
    pendingRequest: JsonRpcMessage
): ArmedTransport<TRpcApi, TResponse>;
function makeProxy<TRpcApi>(transport: Transport<TRpcApi>, transportConfig: TransportConfig): Transport<TRpcApi>;
function makeProxy<TRpcApi, TResponseOrResponses>(
    transport:
        | Transport<TRpcApi>
        | (TResponseOrResponses extends unknown[]
              ? ArmedBatchTransport<TRpcApi, TResponseOrResponses>
              : ArmedTransport<TRpcApi, TResponseOrResponses>),
    transportConfig: TransportConfig,
    pendingRequestOrRequests?: JsonRpcMessage | JsonRpcMessage[]
):
    | Transport<TRpcApi>
    | (TResponseOrResponses extends unknown[]
          ? ArmedBatchTransport<TRpcApi, TResponseOrResponses>
          : ArmedTransport<TRpcApi, TResponseOrResponses>) {
    const { onIntegerOverflow } = transportConfig;
    return new Proxy(transport, {
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        get<TMethodName extends keyof typeof transport>(
            ...args: Parameters<NonNullable<ProxyHandler<typeof transport>['get']>>
        ) {
            const [target, p] = args;
            return p in target
                ? Reflect.get(...args)
                : function (
                      ...params: Parameters<
                          (typeof transport)[TMethodName] extends (...args: unknown[]) => unknown
                              ? (typeof transport)[TMethodName]
                              : never
                      >
                  ) {
                      const methodName = p.toString();
                      const patchedParams = patchParamsForSolanaLabsRpc(
                          params,
                          onIntegerOverflow
                              ? (keyPath, value) => {
                                    onIntegerOverflow(methodName, keyPath, value);
                                }
                              : undefined
                      );
                      const newMessage = createJsonRpcMessage(methodName, patchedParams);
                      if (pendingRequestOrRequests == null) {
                          return createArmedJsonRpcTransport(transportConfig, newMessage);
                      } else {
                          const nextPendingMessages = Array.isArray(pendingRequestOrRequests)
                              ? [...pendingRequestOrRequests, newMessage]
                              : [pendingRequestOrRequests, newMessage];
                          return createArmedBatchJsonRpcTransport(transportConfig, nextPendingMessages);
                      }
                  };
        },
    });
}

function processResponse<TResponse>(response: JsonRpcResponse<TResponse>) {
    if ('error' in response) {
        throw new SolanaJsonRpcError(response.error);
    } else {
        return response.result as TResponse;
    }
}

function sendPayload<TResponses extends unknown[]>(payload: IHasIdentifier[], url: string): Promise<TResponses>;
function sendPayload<TResponse>(payload: IHasIdentifier, url: string): Promise<TResponse>;
async function sendPayload<TResponseOrResponses>(payload: IHasIdentifier | IHasIdentifier[], url: string) {
    const responseOrResponses = await makeHttpRequest<
        TResponseOrResponses extends unknown[]
            ? JsonRpcBatchResponse<TResponseOrResponses>
            : JsonRpcResponse<TResponseOrResponses>
    >({
        payload,
        url,
    });

    if (Array.isArray(responseOrResponses)) {
        const requestOrder = (payload as IHasIdentifier[]).map(p => p.id);
        return responseOrResponses
            .sort((a, b) => requestOrder.indexOf(a.id) - requestOrder.indexOf(b.id))
            .map(processResponse);
    } else {
        return processResponse(responseOrResponses);
    }
}

export function createJsonRpcTransport<TRpcApi extends object>(transportConfig: TransportConfig) {
    const transport = {} as Transport<TRpcApi>;
    return makeProxy<TRpcApi>(transport, transportConfig);
}
