import { FieldNode, GraphQLResolveInfo } from 'graphql';

import { AccountLoaderArgs } from '../loaders';

/**
 * Determine if the query only requests the provided field names
 */
export function onlyFieldsRequested(fieldNames: string[], info?: GraphQLResolveInfo): boolean {
    if (info && info.fieldNodes[0].selectionSet) {
        const selectionSet = info.fieldNodes[0].selectionSet;
        for (const selection of selectionSet.selections) {
            if (selection.kind === 'Field') {
                if (!fieldNames.includes(selection.name.value)) {
                    return false;
                }
            } else {
                // Any other kind of selection (fragment, etc.) is assumed to be
                // a field that is not one of the provided field names
                return false;
            }
        }
    }
    return true;
}

/**
 * Appends encoding and data slice to the loader args if the query requests
 * the data field or an inline fragment (`jsonParsed`)
 */
export function determineAccountLoaderArgs(args: AccountLoaderArgs, info?: GraphQLResolveInfo) {
    if (info?.fieldNodes[0]?.selectionSet?.selections?.some(selection => selection.kind === 'InlineFragment')) {
        args.encoding = 'jsonParsed';
        return;
    }
    const dataField = info?.fieldNodes[0]?.selectionSet?.selections?.find<FieldNode>(
        (selection): selection is FieldNode => selection.kind === 'Field' && selection.name.value === 'data',
    );
    if (dataField) {
        const encodingArgument = dataField.arguments?.find(argument => argument.name.value === 'encoding');
        if (encodingArgument && encodingArgument.value.kind === 'EnumValue') {
            if (encodingArgument.value.value === 'BASE_58') {
                args.encoding = 'base58';
            }
            if (encodingArgument.value.value === 'BASE_64') {
                args.encoding = 'base64';
            }
            if (encodingArgument.value.value === 'BASE_64_ZSTD') {
                args.encoding = 'base64+zstd';
            }
        }
        const dataSliceArgument = dataField.arguments?.find(argument => argument.name.value === 'dataSlice');
        if (dataSliceArgument && dataSliceArgument.value.kind === 'ObjectValue') {
            const offsetArg = dataSliceArgument.value.fields?.find(field => field.name.value === 'offset');
            const lengthArg = dataSliceArgument.value.fields?.find(field => field.name.value === 'length');
            const length = lengthArg?.value.kind === 'IntValue' ? lengthArg.value : undefined;
            const offset = offsetArg?.value.kind === 'IntValue' ? offsetArg.value : undefined;
            if (length && offset) {
                args.dataSlice = {
                    length: parseInt(length.value, 10),
                    offset: parseInt(offset.value, 10),
                };
            }
        }
        return;
    }
}
