import { memoizeWithNoParams } from "../memoize";

describe('memoizeWithNoParams', () => {
  it('returns a function that returns result of the memoized function', () => {
    const fn = () => 1;
    const memoized = memoizeWithNoParams(fn);
    expect(memoized()).toEqual(1);
  })

  it('only calls the function once if it is called repeatedly', () => {
    const fn = jest.fn().mockReturnValue(1);

    const memoized = memoizeWithNoParams(fn);
    expect(memoized()).toEqual(1);
    expect(memoized()).toEqual(1);
    expect(fn).toHaveBeenCalledTimes(1);
  })
});