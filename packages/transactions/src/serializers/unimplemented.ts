function getError(type: 'decoder' | 'encoder', name: string) {
    const functionSuffix = name + type[0].toUpperCase() + type.slice(1);
    return new Error(
        `No ${type} exists for ${name}. Use \`get${functionSuffix}()\` if you need a ${type}, and \`get${name}Codec()\` if you need to both encode and decode ${name}`
    );
}

export function getUnimplementedDecoder(name: string): () => never {
    return () => {
        throw getError('decoder', name);
    };
}

export function getUnimplementedEncoder(name: string): () => never {
    return () => {
        throw getError('encoder', name);
    };
}
