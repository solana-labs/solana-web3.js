import { FieldType, ProgramAstType } from './types';

function buildFieldGraphQLTypeDef(type: FieldType) {
    switch (type) {
        case 'boolean':
            return 'Boolean';
        case 'string':
            return 'String';
        case 'u8':
        case 'u16':
        case 'u32':
            return 'Int';
        case 'u64':
        case 'u128':
            return 'BigInt';
        case 'publicKey':
            return 'Address';
    }
}

export function buildAccountGraphQLTypeDef(accountAst: ProgramAstType) {
    const fields = accountAst.type.fields
        .map(field => `${field.name}: ${buildFieldGraphQLTypeDef(field.type)}`)
        .join('\n');
    return /* GraphQL */ `
        type ${accountAst.name} implements Account {
            ${fields}
        }
    `;
}

export function buildInstructionGraphQLTypeDef(instructionAst: ProgramAstType) {
    const fields = instructionAst.type.fields
        .map(field => `${field.name}: ${buildFieldGraphQLTypeDef(field.type)}`)
        .join('\n');
    return /* GraphQL */ `
        type ${instructionAst.name} implements TransactionInstruction {
            ${fields}
        }
    `;
}

export function buildTypeGraphQLTypeDef(typeAst: ProgramAstType) {
    const fields = typeAst.type.fields
        .map(field => `${field.name}: ${buildFieldGraphQLTypeDef(field.type)}`)
        .join('\n');
    return /* GraphQL */ `
        type ${typeAst.name} implements TransactionInstruction {
            ${fields}
        }
    `;
}
