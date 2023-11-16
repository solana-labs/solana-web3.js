/* eslint-disable sort-keys-fix/sort-keys-fix */
import { buildAccountGraphQLTypeDef, buildInstructionGraphQLTypeDef, buildTypeGraphQLTypeDef } from './type-defs';
import { ProgramAst, ProgramAstSource } from './types';

export interface AstConfig {
    resolvers: Record<string, unknown>;
    typeDefs: string;
    resolveTypeExtension?: (obj: unknown) => string;
}

export interface SchemaAstConfig {
    accounts: AstConfig;
    instructions: AstConfig;
    types: AstConfig;
}

function buildSchemaAstConfig(programAst: ProgramAstSource): SchemaAstConfig {
    const parsedAst: ProgramAst = typeof programAst === 'string' ? JSON.parse(programAst) : programAst;
    return {
        accounts: {
            resolvers: {},
            typeDefs: parsedAst.accounts.map(buildAccountGraphQLTypeDef).join('\n'),
            // TODO: Conditional function for mapping decoded data.
            resolveTypeExtension: (_account): string => null as unknown as string,
        },
        instructions: {
            resolvers: {},
            typeDefs: parsedAst.instructions.map(buildInstructionGraphQLTypeDef).join('\n'),
            // TODO: Conditional function for mapping decoded data.
            resolveTypeExtension: (_instruction): string => null as unknown as string,
        },
        types: {
            resolvers: {},
            typeDefs: parsedAst.types.map(buildTypeGraphQLTypeDef).join('\n'),
        },
    };
}

export function buildAstSchemaConfig(programAst: ProgramAstSource[]): SchemaAstConfig {
    // TODO: This isn't going to work.
    return programAst.map(buildSchemaAstConfig).reduce((acc, cur) => {
        acc.accounts.resolvers = { ...acc.accounts.resolvers, ...cur.accounts.resolvers };
        acc.accounts.typeDefs += cur.accounts.typeDefs;
        acc.instructions.resolvers = { ...acc.instructions.resolvers, ...cur.instructions.resolvers };
        acc.instructions.typeDefs += cur.instructions.typeDefs;
        acc.types.resolvers = { ...acc.types.resolvers, ...cur.types.resolvers };
        acc.types.typeDefs += cur.types.typeDefs;
        return acc;
    });
}
