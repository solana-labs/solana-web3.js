import { Signature } from '@solana/keys';
import { Commitment, Slot } from '@solana/rpc-types';
import { ArgumentNode, GraphQLResolveInfo } from 'graphql';

import { BlockLoaderArgs, TransactionLoaderArgs } from '../../loaders';
import { injectableRootVisitor } from './visitor';

function findArgumentNodeByName(argumentNodes: readonly ArgumentNode[], name: string): ArgumentNode | undefined {
    return argumentNodes.find(argumentNode => argumentNode.name.value === name);
}

function parseTransactionEncodingArgument(
    argumentNodes: readonly ArgumentNode[],
    variableValues: {
        [variable: string]: unknown;
    },
): TransactionLoaderArgs['encoding'] | undefined {
    const argumentNode = findArgumentNodeByName(argumentNodes, 'encoding');
    if (argumentNode) {
        if (argumentNode.value.kind === 'EnumValue') {
            if (argumentNode.value.value === 'BASE_58') {
                return 'base58';
            }
            if (argumentNode.value.value === 'BASE_64') {
                return 'base64';
            }
        }
        if (argumentNode.value.kind === 'Variable') {
            return variableValues[argumentNode.value.name.value] as TransactionLoaderArgs['encoding'];
        }
    } else {
        return undefined;
    }
}

export function buildTransactionArgSetWithVisitor<TArgs extends BlockLoaderArgs | TransactionLoaderArgs>(
    args: TArgs,
    info: GraphQLResolveInfo,
): TArgs[] {
    const argSet = [args];

    function buildArgSetWithVisitor(root: Parameters<typeof injectableRootVisitor>[1]) {
        injectableRootVisitor(info, root, {
            fieldNodeOperation(info, node) {
                if (node.name.value === 'message' || node.name.value === 'meta') {
                    argSet.push({ ...args, encoding: 'jsonParsed' });
                } else if (node.name.value === 'data') {
                    // At least `encoding` is required on the `data` field.
                    if (node.arguments) {
                        const { variableValues } = info;
                        const encoding: TransactionLoaderArgs['encoding'] = parseTransactionEncodingArgument(
                            node.arguments,
                            variableValues,
                        );
                        argSet.push({ ...args, encoding });
                    }
                }
            },
            fragmentSpreadNodeOperation(_info, fragment) {
                buildArgSetWithVisitor(fragment);
            },
            inlineFragmentNodeOperation(_info, _node) {
                // Transaction schema doesn't support inline fragments at the
                // root level.
                return;
            },
        });
    }

    buildArgSetWithVisitor(null);

    return argSet;
}

/**
 * Build a set of transaction loader args by inspecting which fields have
 * been requested in the query (ie. `data` or inline fragments).
 */
export function buildTransactionLoaderArgSetFromResolveInfo(
    args: {
        commitment?: Omit<Commitment, 'processed'>;
        minContextSlot?: Slot;
        signature: Signature;
    },
    info: GraphQLResolveInfo,
): TransactionLoaderArgs[] {
    return buildTransactionArgSetWithVisitor(args, info);
}
