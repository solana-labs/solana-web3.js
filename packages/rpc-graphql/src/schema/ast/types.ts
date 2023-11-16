export type FieldType = 'boolean' | 'string' | 'u8' | 'u16' | 'u32' | 'u64' | 'u128' | 'publicKey';

export interface Field {
    name: string;
    type: FieldType;
}

export interface ProgramAstType {
    name: string;
    type: {
        fields: Field[];
        kind: 'struct';
    };
}

/* IDL/Kinobi Tree */
export interface ProgramAst {
    accounts: ProgramAstType[];
    instructions: ProgramAstType[];
    types: ProgramAstType[];
}

export type ProgramAstSource = string | ProgramAst;
