import { useRef } from 'react';

const UNRESOLVED = Symbol();

export function useStable<T>(getValue: () => T): T {
    const ref = useRef<T | typeof UNRESOLVED>(UNRESOLVED);
    if (ref.current === UNRESOLVED) {
        ref.current = getValue();
    }
    return ref.current;
}
