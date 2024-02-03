import { Address } from '@solana/addresses';
import { Commitment, DataSlice, Slot } from '@solana/rpc-types';
import { ArgumentNode, GraphQLResolveInfo, isInterfaceType } from 'graphql';

import { AccountLoaderArgs, ProgramAccountsLoaderArgs } from '../../loaders';
import { injectableRootVisitor, onlyFieldsRequested } from './visitor';

function findArgumentNodeByName(argumentNodes: readonly ArgumentNode[], name: string): ArgumentNode | undefined {
    return argumentNodes.find(argumentNode => argumentNode.name.value === name);
}

function parseAccountEncodingArgument(
    argumentNodes: readonly ArgumentNode[],
    variableValues: {
        [variable: string]: unknown;
    },
): AccountLoaderArgs['encoding'] | undefined {
    const argumentNode = findArgumentNodeByName(argumentNodes, 'encoding');
    if (argumentNode) {
        if (argumentNode.value.kind === 'EnumValue') {
            if (argumentNode.value.value === 'BASE_58') {
                return 'base58';
            }
            if (argumentNode.value.value === 'BASE_64') {
                return 'base64';
            }
            if (argumentNode.value.value === 'BASE_64_ZSTD') {
                return 'base64+zstd';
            }
        }
        if (argumentNode.value.kind === 'Variable') {
            return variableValues[argumentNode.value.name.value] as AccountLoaderArgs['encoding'];
        }
    } else {
        return undefined;
    }
}

function parseAccountDataSliceArgument(
    argumentNodes: readonly ArgumentNode[],
    variableValues: { [variable: string]: unknown },
): AccountLoaderArgs['dataSlice'] {
    const argumentNode = findArgumentNodeByName(argumentNodes, 'dataSlice');
    if (argumentNode) {
        if (argumentNode.value.kind === 'ObjectValue') {
            const offsetArg = argumentNode.value.fields?.find(field => field.name.value === 'offset');
            const lengthArg = argumentNode.value.fields?.find(field => field.name.value === 'length');
            const length =
                lengthArg?.value.kind === 'IntValue'
                    ? parseInt(lengthArg.value.value)
                    : lengthArg?.value.kind === 'Variable'
                      ? (variableValues[lengthArg.value.name.value] as number)
                      : undefined;
            const offset =
                offsetArg?.value.kind === 'IntValue'
                    ? parseInt(offsetArg.value.value)
                    : offsetArg?.value.kind === 'Variable'
                      ? (variableValues[offsetArg.value.name.value] as number)
                      : undefined;
            return length !== undefined && length !== null && offset !== undefined && offset !== null
                ? { length, offset }
                : undefined;
        }
        if (argumentNode.value.kind === 'Variable') {
            return variableValues[argumentNode.value.name.value] as DataSlice;
        }
    } else {
        return undefined;
    }
}

export function buildAccountArgSetWithVisitor<TArgs extends AccountLoaderArgs | ProgramAccountsLoaderArgs>(
    args: TArgs,
    info: GraphQLResolveInfo,
): TArgs[] {
    const argSet = [args];

    function buildArgSetWithVisitor(root: Parameters<typeof injectableRootVisitor>[1]) {
        injectableRootVisitor(info, root, {
            fieldNodeOperation(info, node) {
                if (node.name.value !== 'data') {
                    return;
                }
                // At least `encoding` is required on the `data` field.
                if (node.arguments) {
                    const { variableValues } = info;
                    const encoding = parseAccountEncodingArgument(node.arguments, variableValues);
                    const dataSlice = parseAccountDataSliceArgument(node.arguments, variableValues);
                    argSet.push({ ...args, dataSlice, encoding });
                }
            },
            fragmentSpreadNodeOperation(_info, fragment) {
                buildArgSetWithVisitor(fragment);
            },
            inlineFragmentNodeOperation(info, node) {
                const { schema } = info;
                const accountInterface = schema.getType('Account');
                if (
                    isInterfaceType(accountInterface) &&
                    // Recursively check if the inline fragment requests any
                    // fields outside of the `Account` interface.
                    !onlyFieldsRequested(Object.keys(accountInterface.getFields()), info, node)
                ) {
                    argSet.push({ ...args, encoding: 'jsonParsed' });
                }
            },
        });
    }

    buildArgSetWithVisitor(null);

    return argSet;
}

/**
 * Build a set of account loader args by inspecting which fields have
 * been requested in the query (ie. `data` or inline fragments).
 */
export function buildAccountLoaderArgSetFromResolveInfo(
    args: {
        address: Address;
        commitment?: Commitment;
        minContextSlot?: Slot;
    },
    info: GraphQLResolveInfo,
): AccountLoaderArgs[] {
    return buildAccountArgSetWithVisitor(args, info);
}
