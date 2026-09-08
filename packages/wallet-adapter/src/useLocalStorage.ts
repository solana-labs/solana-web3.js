import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

/** React state persisted as JSON; null removes the stored value. */
export function useLocalStorage<T>(
  key: string,
  defaultState: T,
): [T, Dispatch<SetStateAction<T>>] {
  const state = useState<T>(() => {
    try {
      const stored = globalThis.localStorage?.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultState;
    } catch {
      return defaultState;
    }
  });
  const value = state[0];
  const initial = useRef<{key: string; value: T} | null>({key, value});
  useEffect(() => {
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
  }, [key, value]);
  return state;
}
