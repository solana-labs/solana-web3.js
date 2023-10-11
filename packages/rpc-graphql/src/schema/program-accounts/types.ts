import { GraphQLObjectType } from 'graphql';

import { accountInterface } from '../account';
import { string, type } from '../picks';

export const programAccount = new GraphQLObjectType({
    fields: {
        account: type(accountInterface),
        pubkey: string(),
    },
    name: 'ProgramAccount',
});
