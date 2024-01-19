import { Address } from '@solana/addresses';
import { ArgumentNode, FieldNode, type graphql, InlineFragmentNode, Kind } from 'graphql';

import { accountResolvers } from '../../resolvers/account';
import { commonTypeResolvers } from '../../resolvers/types';
import { AccountCallArgSet, CallChain, findMatchOrPush, getParent } from './call-chain';

function parseAccountRootQueryArgs(
    args: readonly ArgumentNode[],
    variableValues?: Parameters<typeof graphql>[0]['variableValues'],
): Address | null {
    const addressArg = args.find(arg => arg.name.value === 'address');
    if (addressArg) {
        if (addressArg.value.kind === 'Variable') {
            const variableVal = variableValues?.[addressArg.value.name.value];
            if (variableVal) {
                return variableVal as Address;
            }
        }
        if (addressArg.value.kind === 'StringValue') {
            return addressArg.value.value as Address;
        }
    }
    return null;
}

function parseDataFieldArgs(
    args: readonly ArgumentNode[],
    variableValues?: Parameters<typeof graphql>[0]['variableValues'],
): AccountCallArgSet | null {
    const result = args
        .map(arg => {
            if (arg.name.value === 'encoding') {
                if (arg.value.kind === 'Variable') {
                    const variableVal = variableValues?.[arg.value.name.value];
                    if (variableVal) {
                        return {
                            encoding:
                                commonTypeResolvers.AccountEncoding[
                                    variableVal as keyof typeof commonTypeResolvers.AccountEncoding
                                ],
                        };
                    }
                }
                if (arg.value.kind === 'EnumValue') {
                    return {
                        encoding:
                            commonTypeResolvers.AccountEncoding[
                                arg.value.value as keyof typeof commonTypeResolvers.AccountEncoding
                            ],
                    };
                }
            }
            if (arg.name.value === 'dataSlice') {
                if (arg.value.kind === 'Variable') {
                    const variableVal = variableValues?.[arg.value.name.value];
                    if (variableVal) {
                        return {
                            dataSlice: variableVal,
                        };
                    }
                }
                if (arg.value.kind === 'ObjectValue') {
                    const lengthField = arg.value.fields.find(field => field.name.value === 'length');
                    const length = lengthField?.value.kind === Kind.INT ? Number(lengthField.value.value) : undefined;
                    const offsetField = arg.value.fields.find(field => field.name.value === 'offset');
                    const offset = offsetField?.value.kind === Kind.INT ? Number(offsetField.value.value) : undefined;
                    return {
                        dataSlice: { length, offset },
                    };
                }
            }
        })
        .reduce((acc, arg) => ({ ...acc, ...arg }), {});
    return Object.keys(result).length === 0 ? null : result;
}

export function processPossibleAccountRootQuery(
    callChain: CallChain,
    depth: number,
    node: FieldNode,
    variableValues?: Parameters<typeof graphql>[0]['variableValues'],
) {
    if (node.name.value === 'account') {
        // If no arguments are provided to an `account` query, the GraphQL
        // schema validation will fail. Therefore, if no arguments are
        // provided, we can use `null` as the address. This will cause any
        // children calls to be skipped in the chain processor.
        const address = node.arguments ? parseAccountRootQueryArgs(node.arguments, variableValues) : null;
        callChain[depth].accounts.push({ address, argSets: [] });
    }
}

export function processPossibleAccountField(
    callChain: CallChain,
    depth: number,
    node: FieldNode,
    variableValues?: Parameters<typeof graphql>[0]['variableValues'],
) {
    if (node.name.value === 'data') {
        // If data is requested, parse the required arguments.
        // If an `AccountCall` already exists in the chain for these parameters,
        // reuse it. Otherwise, create a new one.
        const [parent, _] = getParent(callChain, depth, 'accounts');
        if (node.arguments) {
            const dataArgs = parseDataFieldArgs(node.arguments, variableValues);
            if (dataArgs) findMatchOrPush(parent.argSets, dataArgs);
        }
    }
    if (node.name.value === 'owner') {
        // If `owner` is requested, add a new `AccountCall` to the chain with a
        // pointer to its parent. If necessary, add a new `CallSet` to the
        // chain.
        const [_, parentIndex] = getParent(callChain, depth, 'accounts');
        if (callChain.length < depth + 1) {
            callChain.push({ accounts: [] });
        }
        callChain[depth].accounts.push({
            address: { parentFieldName: 'owner', parentIndex },
            argSets: [],
        });
    }
}

export function processPossibleAccountInlineFragment(
    callChain: CallChain,
    depth: number,
    node: InlineFragmentNode,
): boolean {
    if (node.typeCondition && node.typeCondition.name.value in accountResolvers) {
        const [parent, _] = getParent(callChain, depth, 'accounts');
        findMatchOrPush(parent.argSets, { encoding: 'jsonParsed' });
        return true;
    }
    return false;
}
