import { Kind } from 'graphql';

export const scalarTypeDefs = /* GraphQL */ `
    scalar BigInt
`;

export const scalarResolvers = {
    BigInt: {
        __parseLiteral(ast: { kind: Kind; value: string | number | bigint | boolean }): bigint | null {
            if (ast.kind === Kind.STRING) {
                return BigInt(ast.value);
            }
            return null;
        },
        __parseValue(value: string): bigint {
            return BigInt(value);
        },
        __serialize(value: string): bigint {
            return BigInt(value);
        },
    },
};
