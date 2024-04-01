import {expect} from 'chai';
import {spy} from 'sinon';

import {guardedShift, guardedSplice} from '../src/utils/guarded-array-utils';

describe('guardedShift', () => {
  it('delegates to Array#shift', () => {
    const arr = [1, 2, 3];
    const shiftSpy = spy(arr, 'shift');
    const result = guardedShift(arr);
    expect(shiftSpy).is.calledWithExactly();
    expect(result).to.eq(shiftSpy.returnValues[0]);
  });
  it('throws when the array is zero-length', () => {
    const arr: number[] = [];
    expect(() => guardedShift(arr)).to.throw();
  });
});

describe('guardedSplice', () => {
  it('delegates to Array#splice', () => {
    const arr = [1, 2, 3];
    const spliceSpy = spy(arr, 'splice');
    const result = guardedSplice(
      arr,
      /* start */ 0,
      /* deleteCount */ 3,
      /* ...items */
      100,
      101,
      102,
    );
    expect(spliceSpy).is.calledWithExactly(0, 3, 100, 101, 102);
    expect(result).to.eq(spliceSpy.returnValues[0]);
  });
  it('allows zero-length splices', () => {
    const arr: number[] = [1, 2, 3];
    expect(guardedSplice(arr, 0, 0)).to.be.an.empty('array');
  });
  it('allows zero-length splices via the `deleteCount` argument being the explicit value `undefined`', () => {
    const arr: number[] = [1, 2, 3];
    expect(guardedSplice(arr, 0, undefined)).to.be.an.empty('array');
  });
  it('throws when the `start` would take you past the end of the array', () => {
    const arr: number[] = [1, 2, 3];
    expect(() => guardedSplice(arr, 3)).to.throw();
  });
  it('throws when the `deleteCount` and `start` would take you past the end of the array', () => {
    const arr: number[] = [1, 2, 3];
    expect(() => guardedSplice(arr, 1, 3)).to.throw();
  });
});
