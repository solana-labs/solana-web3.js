export function assertNotAProperty<T extends object, TPropName extends string>(
    _: { [Prop in keyof T]: Prop extends TPropName ? never : T[Prop] },
    _propName: TPropName,
): void {}
