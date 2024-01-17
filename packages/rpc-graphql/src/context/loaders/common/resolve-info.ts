import { GraphQLResolveInfo } from 'graphql';

export function onlyPresentFieldRequested(fieldName: string, info?: GraphQLResolveInfo): boolean {
    if (info && info.fieldNodes[0].selectionSet) {
        const selectionSet = info.fieldNodes[0].selectionSet;
        const requestedFields = selectionSet.selections.map(field => {
            if (field.kind === 'Field') {
                return field.name.value;
            }
            return null;
        });
        if (requestedFields && requestedFields.length === 1 && requestedFields[0] === fieldName) {
            return true;
        }
    }
    return false;
}
