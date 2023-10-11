import { Base58EncodedAddress } from '@solana/addresses';
import { PublicKey } from '@solana/web3.js';

import { fromLegacyPublicKey } from '../address';

{
    const publicKey = null as unknown as PublicKey;
    fromLegacyPublicKey(publicKey) satisfies Base58EncodedAddress;
    const publicKeyBase58 = publicKey.toBase58();
    fromLegacyPublicKey(publicKey) satisfies Base58EncodedAddress<typeof publicKeyBase58>;
}

{
    const publicKey = { toBase58: () => 'test' } as unknown as PublicKey;
    fromLegacyPublicKey(publicKey) satisfies Base58EncodedAddress;
    fromLegacyPublicKey(publicKey) satisfies Base58EncodedAddress<'test'>;
}

{
    // Randomly generated
    const publicKey = new PublicKey('B3piXWBQLLRuk56XG5VihxR4oe2PSsDM8nTF6s1DeVF5');
    fromLegacyPublicKey(publicKey) satisfies Base58EncodedAddress;
    fromLegacyPublicKey(publicKey) satisfies Base58EncodedAddress<'B3piXWBQLLRuk56XG5VihxR4oe2PSsDM8nTF6s1DeVF5'>;
}
