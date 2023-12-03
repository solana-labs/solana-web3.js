import { Struct } from './struct';

// Class representing a Rust-compatible enum, since enums are only strings or
// numbers in pure JS
export class Enum extends Struct {
    enum: string = '';
    constructor(
        properties: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    ) {
        super(properties);
        if (Object.keys(properties).length !== 1) {
            throw new Error('Enum can only take single value');
        }
        Object.keys(properties).map(key => {
            this.enum = key;
        });
    }
}
