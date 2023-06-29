import { getMessageHeaderCodec } from '../header';

describe('Message header codec', () => {
    let messageHeader: ReturnType<typeof getMessageHeaderCodec>;
    beforeEach(() => {
        messageHeader = getMessageHeaderCodec();
    });
    it('serializes header data according to spec', () => {
        expect(
            messageHeader.serialize({
                numReadonlyNonSignerAccounts: 1,
                numReadonlySignerAccounts: 2,
                numSignerAccounts: 3,
            })
        ).toEqual(new Uint8Array([3, 2, 1]));
    });
    it('deserializes header data according to spec', () => {
        expect(messageHeader.deserialize(new Uint8Array([3, 2, 1]))[0]).toEqual({
            numReadonlyNonSignerAccounts: 1,
            numReadonlySignerAccounts: 2,
            numSignerAccounts: 3,
        });
    });
});
