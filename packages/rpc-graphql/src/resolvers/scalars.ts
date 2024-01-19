import { Kind } from 'graphql';

const stringScalarAlias = {
    __parseLiteral(ast: { kind: Kind; value: string | number | bigint | boolean }): string | null {
        if (ast.kind === Kind.STRING) {
            return ast.value.toString();
        }
        return null;
    },
    __parseValue(value: string): string {
        return value;
    },
    __serialize(value: string): string {
        return value;
    },
};

export const scalarResolvers = {
    Address: stringScalarAlias,
    Base58EncodedBytes: stringScalarAlias,
    Base64EncodedBytes: stringScalarAlias,
    Base64ZstdEncodedBytes: stringScalarAlias,
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
