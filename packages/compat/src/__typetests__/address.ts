import { Address } from '@solana/addresses';
import { PublicKey } from '@solana/web3.js';

import { fromLegacyPublicKey } from '../address';

{
    const publicKey = null as unknown as PublicKey;
    fromLegacyPublicKey(publicKey) satisfies Address;
    fromLegacyPublicKey(publicKey) satisfies Address<ReturnType<typeof publicKey.toBase58>>;
}

{
    const publicKey = { toBase58: () => 'test' } as unknown as PublicKey;
    fromLegacyPublicKey(publicKey) satisfies Address;
    fromLegacyPublicKey(publicKey) satisfies Address<'test'>;
}

{
    // Randomly generated
    const publicKey = new PublicKey('B3piXWBQLLRuk56XG5VihxR4oe2PSsDM8nTF6s1DeVF5');
    fromLegacyPublicKey(publicKey) satisfies Address;
    fromLegacyPublicKey(publicKey) satisfies Address<'B3piXWBQLLRuk56XG5VihxR4oe2PSsDM8nTF6s1DeVF5'>;
}
