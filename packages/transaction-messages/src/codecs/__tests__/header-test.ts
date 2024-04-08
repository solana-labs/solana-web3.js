import { getMessageHeaderCodec, getMessageHeaderDecoder, getMessageHeaderEncoder } from '../header';

describe('Message header codec', () => {
    describe.each([getMessageHeaderEncoder, getMessageHeaderCodec])('message header encoder %p', encoderFactory => {
        let messageHeader: ReturnType<typeof getMessageHeaderEncoder>;
        beforeEach(() => {
            messageHeader = encoderFactory();
        });

        it('serializes header data according to spec', () => {
            expect(
                messageHeader.encode({
                    numReadonlyNonSignerAccounts: 1,
                    numReadonlySignerAccounts: 2,
                    numSignerAccounts: 3,
                }),
            ).toEqual(new Uint8Array([3, 2, 1]));
        });
    });

    describe.each([getMessageHeaderDecoder, getMessageHeaderCodec])('message header decoder %p', decoderFactory => {
        let messageHeader: ReturnType<typeof getMessageHeaderDecoder>;
        beforeEach(() => {
            messageHeader = decoderFactory();
        });

        it('serializes header data according to spec', () => {
            expect(messageHeader.decode(new Uint8Array([3, 2, 1]))).toEqual({
                numReadonlyNonSignerAccounts: 1,
                numReadonlySignerAccounts: 2,
                numSignerAccounts: 3,
            });
        });
    });
});
