import { Signature, signature } from '../signatures';

describe('signature', () => {
    it('can coerce to `Signature`', () => {
        // Randomly generated
        const raw =
            '3bwsNoq6EP89sShUAKBeB26aCC3KLGNajRm5wqwr6zRPP3gErZH7erSg3332SVY7Ru6cME43qT35Z7JKpZqCoPaL' as Signature;
        const coerced = signature(
            '3bwsNoq6EP89sShUAKBeB26aCC3KLGNajRm5wqwr6zRPP3gErZH7erSg3332SVY7Ru6cME43qT35Z7JKpZqCoPaL'
        );
        expect(coerced).toBe(raw);
    });
    it('throws on invalid `Signature`', () => {
        const thisThrows = () => signature('test');
        expect(thisThrows).toThrow('`test` is not a signature');
    });
});
