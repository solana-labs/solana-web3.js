import {
    GraphQLBoolean,
    GraphQLEnumType,
    GraphQLFloat,
    GraphQLInputObjectType,
    GraphQLInt,
    GraphQLInterfaceType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLScalarType,
    GraphQLString,
    GraphQLUnionType,
} from 'graphql';

import { BigIntScalar } from './scalars';

type GraphQLType =
    | GraphQLEnumType
    | GraphQLInputObjectType
    | GraphQLInterfaceType
    | GraphQLObjectType
    | GraphQLScalarType
    | GraphQLUnionType;

export function boolean() {
    return { type: GraphQLBoolean };
}

let memoisedBigint: { type: GraphQLScalarType } | undefined;
export function bigint() {
    if (!memoisedBigint) memoisedBigint = { type: BigIntScalar() };
    return memoisedBigint;
}

export function float() {
    return { type: GraphQLFloat };
}
export function number() {
    return { type: GraphQLInt };
}

export function string() {
    return { type: GraphQLString };
}

export function type<TFieldType extends GraphQLType>(
    fieldType: TFieldType
): {
    type: TFieldType;
} {
    return {
        type: fieldType,
    };
}

export function nonNull<TFieldType extends GraphQLType>(fieldType: {
    type: TFieldType;
}): {
    type: GraphQLList<TFieldType>;
} {
    return {
        type: new GraphQLNonNull(fieldType.type),
    };
}

export function list<TElementType extends GraphQLType>(elementType: {
    type: TElementType;
}): {
    type: GraphQLList<TElementType>;
} {
    return {
        type: new GraphQLList(elementType.type),
    };
}

type ConstructorParametersOf<T> = T extends new (...args: infer P) => unknown ? P : never;

export function object(
    name: string,
    fields: ConstructorParametersOf<typeof GraphQLObjectType>[0]['fields']
): { type: GraphQLObjectType } {
    return {
        type: new GraphQLObjectType({
            fields,
            name,
        }),
    };
}
