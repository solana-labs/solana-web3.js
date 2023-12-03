import { deserialize, deserializeUnchecked, serialize } from 'borsh';
import { Buffer } from 'buffer';

// Class wrapping a plain object
export class Struct {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(properties: any) {
        Object.assign(this, properties);
    }

    encode(): Buffer {
        return Buffer.from(serialize(SOLANA_SCHEMA, this));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static decode(data: Buffer): any {
        return deserialize(SOLANA_SCHEMA, this, data);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static decodeUnchecked(data: Buffer): any {
        return deserializeUnchecked(SOLANA_SCHEMA, this, data);
    }
}

// Class representing a Rust-compatible enum, since enums are only strings or
// numbers in pure JS
export class Enum extends Struct {
    enum: string = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(properties: any) {
        super(properties);
        if (Object.keys(properties).length !== 1) {
            throw new Error('Enum can only take single value');
        }
        Object.keys(properties).map(key => {
            this.enum = key;
        });
    }
}

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
export const SOLANA_SCHEMA: Map<Function, any> = new Map();
