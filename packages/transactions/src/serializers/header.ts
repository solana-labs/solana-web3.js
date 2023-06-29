import { Serializer, struct, u8 } from '@metaplex-foundation/umi-serializers';

import { getCompiledMessageHeader } from '../compile-header';

type MessageHeader = ReturnType<typeof getCompiledMessageHeader>;

export function getMessageHeaderCodec(): Serializer<MessageHeader> {
    return struct(
        [
            [
                'numSignerAccounts',
                u8(
                    __DEV__
                        ? {
                              description:
                                  'The expected number of addresses in the static address list belonging to accounts that are required to sign this transaction',
                          }
                        : undefined
                ),
            ],
            [
                'numReadonlySignerAccounts',
                u8(
                    __DEV__
                        ? {
                              description:
                                  'The expected number of addresses in the static address list belonging to accounts that are required to sign this transaction, but may not be writable',
                          }
                        : undefined
                ),
            ],
            [
                'numReadonlyNonSignerAccounts',
                u8(
                    __DEV__
                        ? {
                              description:
                                  'The expected number of addresses in the static address list belonging to accounts that are neither signers, nor writable',
                          }
                        : undefined
                ),
            ],
        ],
        __DEV__
            ? {
                  description:
                      'The transaction message header containing counts of the signer, readonly-signer, and readonly-nonsigner account addresses',
              }
            : undefined
    );
}
