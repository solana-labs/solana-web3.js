/* eslint-disable @typescript-eslint/no-floating-promises */
import { getPublicKeyFromPrivateKey } from '../public-key';

getPublicKeyFromPrivateKey(new CryptoKey()) satisfies Promise<CryptoKey>;
getPublicKeyFromPrivateKey(new CryptoKey(), true) satisfies Promise<CryptoKey>;
getPublicKeyFromPrivateKey(new CryptoKey(), false) satisfies Promise<CryptoKey>;
