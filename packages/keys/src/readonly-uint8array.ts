type TypedArrayMutableProperties = 'copyWithin' | 'fill' | 'reverse' | 'set' | 'sort';
export interface ReadonlyUint8Array extends Omit<Uint8Array, TypedArrayMutableProperties> {
    readonly [n: number]: number;
}
