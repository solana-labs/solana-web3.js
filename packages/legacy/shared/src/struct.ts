import { deserialize, deserializeUnchecked, serialize } from 'borsh';
import { Buffer } from 'buffer';

import { SOLANA_SCHEMA } from './schema';

export class Struct {
    constructor(
        properties: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    ) {
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
