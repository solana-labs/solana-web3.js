import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

function read<T>(key: string, defaultState: T): T {
  try {
    const stored = globalThis.localStorage?.getItem(key);
    return stored ? (JSON.parse(stored) as T) : defaultState;
  } catch {
    return defaultState;
  }
}

/** React state persisted as JSON; null removes the stored value. */
export function useLocalStorage<T>(
  key: string,
  defaultState: T,
): [T, Dispatch<SetStateAction<T>>] {
  const state = useState<T>(() => read(key, defaultState));
  const [value, setValue] = state;
  const initial = useRef<{key: string; value: T} | null>({key, value});
  const activeKey = useRef(key);
  const fallback = useRef(defaultState);
  fallback.current = defaultState;
  useEffect(() => {
    if (activeKey.current !== key) {
      // A new key adopts its own stored value rather than inheriting the previous key's state.
      activeKey.current = key;
      const next = read(key, fallback.current);
      initial.current = {key, value: next};
      setValue(next);
      return;
    }
    // Mounting (including StrictMode) must not overwrite storage with a fallback.
    if (initial.current?.key === key && Object.is(initial.current.value, value))
      return;
    initial.current = null;
    try {
      if (value === null) globalThis.localStorage?.removeItem(key);
      else globalThis.localStorage?.setItem(key, JSON.stringify(value));
    } catch {
      // Unavailable or full storage must not prevent local state updates.
    }
  }, [key, value, setValue]);
  return state;
}
