import {
    ASTNode,
    ASTVisitFn,
    BREAK,
    FieldNode,
    FragmentDefinitionNode,
    FragmentSpreadNode,
    GraphQLResolveInfo,
    InlineFragmentNode,
    visit,
} from 'graphql';

type InjectableVisitorOperations = {
    fieldNodeOperation: (info: GraphQLResolveInfo, ...args: Parameters<ASTVisitFn<FieldNode>>) => void;
    fragmentSpreadNodeOperation: (
        info: GraphQLResolveInfo,
        fragment: FragmentDefinitionNode,
        ...args: Parameters<ASTVisitFn<FragmentSpreadNode>>
    ) => void;
    inlineFragmentNodeOperation: (
        info: GraphQLResolveInfo,
        ...args: Parameters<ASTVisitFn<InlineFragmentNode>>
    ) => void;
};
type RootNode = FieldNode | FragmentDefinitionNode | InlineFragmentNode;

/**
 * An AST visitor that keys on the root field provided.
 * This visitor can be injected with custom logic for various types of nodes.
 */
export function injectableRootVisitor(
    info: GraphQLResolveInfo,
    rootNode: RootNode | null,
    operations: InjectableVisitorOperations,
) {
    const { fieldNodes } = info;
    const root = rootNode ?? fieldNodes[0];
    const parentIsRoot = (ancestors: readonly (ASTNode | readonly ASTNode[])[]) =>
        (Array.isArray(ancestors) ? ancestors[0] : ancestors) === root;
    visit(root, {
        Field(node, key, parent, path, ancestors) {
            if (!parentIsRoot(ancestors)) return;
            return operations.fieldNodeOperation(info, node, key, parent, path, ancestors);
        },
        FragmentSpread(node, key, parent, path, ancestors) {
            const fragmentDefinition = info.fragments[node.name.value];
            return operations.fragmentSpreadNodeOperation(info, fragmentDefinition, node, key, parent, path, ancestors);
        },
        InlineFragment(node, key, parent, path, ancestors) {
            if (!parentIsRoot(ancestors)) return;
            return operations.inlineFragmentNodeOperation(info, node, key, parent, path, ancestors);
        },
    });
}

/**
 * Determine if the query only requests the provided field names
 */
export function onlyFieldsRequested(fieldNames: string[], info: GraphQLResolveInfo, rootNode?: RootNode): boolean {
    let onlyFieldsRequested = true;

    function checkFieldsWithVisitor(root: RootNode | null) {
        injectableRootVisitor(info, root, {
            fieldNodeOperation(_info, node) {
                onlyFieldsRequested = fieldNames.includes(node.name.value);
                if (!onlyFieldsRequested) {
                    return BREAK;
                }
            },
            fragmentSpreadNodeOperation(_info, fragment) {
                checkFieldsWithVisitor(fragment);
            },
            inlineFragmentNodeOperation(_info, node) {
                checkFieldsWithVisitor(node);
            },
        });
    }

    checkFieldsWithVisitor(rootNode ?? null);

    return onlyFieldsRequested;
}
