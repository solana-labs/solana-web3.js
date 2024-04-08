import { getAddressDecoder } from '@solana/addresses';
import {
    fixDecoderSize,
    ReadonlyUint8Array,
    transformDecoder,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import {
    getArrayDecoder,
    getBytesDecoder,
    getBytesEncoder,
    getStructDecoder,
    getStructEncoder,
} from '@solana/codecs-data-structures';
import { getShortU16Decoder, getU8Decoder } from '@solana/codecs-numbers';
import { SOLANA_ERROR__TRANSACTION__SIGNATURES_LENGTH_NUM_SIGNERS_MISMATCH, SolanaError } from '@solana/errors';
import { SignatureBytes } from '@solana/keys';
import { getTransactionVersionDecoder } from '@solana/transaction-messages';

import { NewTransaction, SignaturesMap, TransactionMessageBytes } from '../transaction';
import { getSignaturesEncoder } from './signatures-encoder';

export function getNewTransactionEncoder(): VariableSizeEncoder<NewTransaction> {
    return getStructEncoder([
        ['signatures', getSignaturesEncoder()],
        ['messageBytes', getBytesEncoder()],
    ]);
}

export function getNewTransactionDecoder(): VariableSizeDecoder<NewTransaction> {
    return transformDecoder(
        getStructDecoder([
            ['signatures', getArrayDecoder(fixDecoderSize(getBytesDecoder(), 64), { size: getShortU16Decoder() })],
            ['messageBytes', getBytesDecoder()],
        ]),
        decodePartiallyDecodedTransaction,
    );
}

type PartiallyDecodedTransaction = {
    messageBytes: ReadonlyUint8Array;
    signatures: ReadonlyUint8Array[];
};

function decodePartiallyDecodedTransaction(transaction: PartiallyDecodedTransaction): NewTransaction {
    const { messageBytes, signatures } = transaction;

    /*
    Relevant message structure is at the start:
    - transaction version
    - transaction header (includes number of signer accounts)
    - static accounts (signers first)
    */

    let offset = 0;

    // read version
    offset = getTransactionVersionDecoder().read(messageBytes, offset)[1];

    // read header
    // first byte of header is numSignerAccounts
    const numSignersResult = getU8Decoder().read(messageBytes, offset);
    const numSigners = numSignersResult[0];
    // there are two more bytes which we don't need to read
    offset = numSignersResult[1] + 2;

    // read signer addresses (these are first in the static accounts)
    // compact-u16 array format, read the short-u16 length
    const addressesLength = getShortU16Decoder().read(messageBytes, offset);
    offset = addressesLength[1];

    // by decoding this array with a fixed size,
    // we don't try to read a length prefix and only read as many addresses as we need
    const [signerAddresses] = getArrayDecoder(getAddressDecoder(), { size: numSigners }).read(messageBytes, offset);

    // signer addresses and signatures must be the same length
    // we encode an all-zero signature when the signature is missing
    if (signerAddresses.length !== signatures.length) {
        throw new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_LENGTH_NUM_SIGNERS_MISMATCH, {
            signaturesLength: signatures.length,
            signerAddresses,
            signerAddressesLength: signerAddresses.length,
        });
    }

    // combine the signer addresses + signatures into the signatures map
    const signaturesMap: SignaturesMap = {};
    signerAddresses.forEach((address, index) => {
        const signatureForAddress = signatures[index];
        if (signatureForAddress.every(b => b === 0)) {
            signaturesMap[address] = null;
        } else {
            signaturesMap[address] = signatureForAddress as SignatureBytes;
        }
    });

    return {
        messageBytes: messageBytes as TransactionMessageBytes,
        signatures: signaturesMap,
    };
}
