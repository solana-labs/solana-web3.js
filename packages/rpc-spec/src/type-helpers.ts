// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Callable = (...args: any[]) => any;
export type Flatten<T> = T extends (infer Item)[] ? Item : never;
export type UnionToIntersection<T> = (T extends unknown ? (x: T) => unknown : never) extends (x: infer R) => unknown
    ? R
    : never;
