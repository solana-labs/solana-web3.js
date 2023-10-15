import { GraphQLScalarType, Kind } from 'graphql';

export const BigIntScalar = () =>
    new GraphQLScalarType({
        name: 'BigInt',

        parseLiteral(ast): bigint | null {
            if (ast.kind === Kind.STRING) {
                return BigInt(ast.value);
            }
            return null;
        },

        parseValue(value): bigint {
            return BigInt(value as string);
        },

        serialize(value): bigint {
            return BigInt(value as string);
        },
    });
