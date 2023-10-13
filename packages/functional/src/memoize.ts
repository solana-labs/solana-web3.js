const sentinel: unique symbol = Symbol();

export function memoizeWithNoParams(f: Function) {
  let result: any = sentinel;
  return function () {
    if (result === sentinel) {
      result = f.call(null);
    }
    return result;
  };
}