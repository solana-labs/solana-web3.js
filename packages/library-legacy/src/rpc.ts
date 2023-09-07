import {SolanaRpcMethods, createSolanaRpcApi} from '@solana/rpc-core';
import {createJsonRpc} from '@solana/rpc-transport';

export type IRpcExperimental = ReturnType<typeof createSolanaRpcApi>;

function createLegacySolanaRpcApi(): IRpcExperimental {
  return new Proxy({} as IRpcExperimental, {
    defineProperty() {
      return false;
    },
    deleteProperty() {
      return false;
    },
    get<TMethodName extends keyof IRpcExperimental>(
      ...args: Parameters<NonNullable<ProxyHandler<IRpcExperimental>['get']>>
    ) {
      const p = args[1];
      const methodName = p.toString() as keyof SolanaRpcMethods;
      return function (
        ...params: Parameters<
          SolanaRpcMethods[TMethodName] extends CallableFunction
            ? SolanaRpcMethods[TMethodName]
            : never
        >
      ) {
        return {
          methodName,
          params,
        };
      };
    },
  });
}

export function createSolanaRpc(
  config: Omit<Parameters<typeof createJsonRpc>[0], 'api'>,
): ReturnType<typeof createJsonRpc<SolanaRpcMethods>> {
  return createJsonRpc<SolanaRpcMethods>({
    ...config,
    api: createLegacySolanaRpcApi(),
  });
}
