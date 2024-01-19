import { type graphql, parse, visit } from 'graphql';

import {
    processPossibleAccountField,
    processPossibleAccountInlineFragment,
    processPossibleAccountRootQuery,
} from './account';

export function buildCallChain(
    source: Parameters<typeof graphql>[0]['source'],
    variableValues?: Parameters<typeof graphql>[0]['variableValues'],
) {
    const document = parse(source);
    const callChain = [{ accounts: [] }];
    let depth = 0;
    visit(document, {
        Field: {
            enter(node) {
                if (depth === 0) {
                    processPossibleAccountRootQuery(callChain, depth, node, variableValues);
                    // processPossibleBlockRootQuery(callChain, depth, node);
                    // ...etc
                } else if (depth > 0) {
                    processPossibleAccountField(callChain, depth, node, variableValues);
                    // processPossibleBlockField(callChain, depth, node);
                    // ...etc
                }
                depth++;
            },
            leave() {
                depth--;
            },
        },
        InlineFragment: {
            enter(node) {
                if (depth > 0) {
                    processPossibleAccountInlineFragment(callChain, depth, node);
                    // processPossibleBlockInlineFragment(callChain, depth, node);
                    // ...etc
                }
            },
        },
    });
    return callChain;
}
