import type { graphql } from 'graphql';

import type { RpcGraphQLContext } from '../';

export async function processQuery(
    _context: RpcGraphQLContext,
    _source: Parameters<typeof graphql>[0]['source'],
    _variableValues?: Parameters<typeof graphql>[0]['variableValues'],
) {
    // Front-run the cache by parsing the query and building a "call chain" -
    // a queue of grouped RPC calls designed to use the returned data from the
    // previous group to evaluate the next one.
    // With this call chain, we can ensure the most efficient use of the
    // available RPC calls and avoid unnecessary calls.
    // After the entire call chain is evaluated, the cache will house all of
    // the necesary data to resolve the query. The resolvers can then fetch
    // data from the cache via the context's loaders, which will fall back to
    // the RPC should there be a cache miss.
    //
    // [TODO]: No-op for now.
}
