import stringify from '..';

describe('test_fast_stable_stringify', function () {
    it('big int', function () {
        const obj = { age: 23, bigint: BigInt('200'), name: 'ABCD' };
        expect(stringify(obj)).toMatch('{"age":23,"bigint":"200n","name":"ABCD"}');
    });

    it('only string', function () {
        const obj = { food: 'Pizza', name: 'ABCD' };
        expect(stringify(obj)).toMatch('{"food":"Pizza","name":"ABCD"}');
    });

    it('array', function () {
        const obj = { hobbies: ['football', 'basketball', 'skating'], name: 'ABCD' };
        expect(stringify(obj)).toMatch('{"hobbies":["football","basketball","skating"],"name":"ABCD"}');
    });

    it('undefined', function () {
        const obj = { hobbies: undefined, name: 'ABCD' };
        expect(stringify(obj)).toMatch('{"name":"ABCD"}');
    });

    it('nested object', function () {
        const obj = { address: { country: 'India', pincode: 10101, state: 'delhi' }, name: 'ABCD' };
        expect(stringify(obj)).toMatch('{"address":{"country":"India","pincode":10101,"state":"delhi"},"name":"ABCD"}');
    });

    it('infinity', function () {
        const obj = { name: 'ABCD', value: Infinity };
        expect(stringify(obj)).toMatch('{"name":"ABCD","value":null}');
    });

    it('toJSON function', function () {
        let obj = {
            age: 23,
            name: 'ABCD',
            toJSON: () => {
                return { value: '1' };
            },
        };
        expect(stringify(obj)).toMatch('{"value":"1"}');

        obj = {
            address: {
                country: 'Africa',
                toJSON: () => {
                    return { country: 'India' };
                },
            },
            name: 'ABCD',
        };
        expect(stringify(obj)).toMatch('{"address":{"country":"India"},"name":"ABCD"}');
    });
});
