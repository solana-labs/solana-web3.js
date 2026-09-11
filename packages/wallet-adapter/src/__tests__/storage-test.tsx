import {act, renderHook} from '@testing-library/react';
import {StrictMode} from 'react';
import {useLocalStorage} from '../useLocalStorage.js';
import {expect, it, vi} from 'vitest';

it('persists useLocalStorage updates and removes null without writing on mount', () => {
  localStorage.setItem('hook-state', JSON.stringify(2));
  const write = vi.spyOn(Storage.prototype, 'setItem');
  const {result, unmount} = renderHook(
    () => useLocalStorage<number | null>('hook-state', 0),
    {
      wrapper: StrictMode,
    },
  );
  expect(result.current[0]).toBe(2);
  expect(write).not.toHaveBeenCalled();
  act(() => result.current[1](value => value! + 1));
  expect(localStorage.getItem('hook-state')).toBe('3');
  act(() => result.current[1](null));
  expect(localStorage.getItem('hook-state')).toBeNull();
  unmount();
  write.mockRestore();
});

it('keeps useLocalStorage state usable when storage is unavailable', () => {
  const unavailable = vi
    .spyOn(globalThis, 'localStorage', 'get')
    .mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
  try {
    const {result} = renderHook(() => useLocalStorage('hook-state', 'initial'));
    expect(result.current[0]).toBe('initial');
    act(() => result.current[1]('updated'));
    expect(result.current[0]).toBe('updated');
  } finally {
    unavailable.mockRestore();
  }
});

it('adopts the stored value of a new key instead of copying the previous key into it', () => {
  localStorage.setItem('first', JSON.stringify('one'));
  localStorage.setItem('second', JSON.stringify('two'));
  const {result, rerender} = renderHook(
    ({key}) => useLocalStorage<string | null>(key, 'fallback'),
    {initialProps: {key: 'first'}, wrapper: StrictMode},
  );
  expect(result.current[0]).toBe('one');
  rerender({key: 'second'});
  expect(result.current[0]).toBe('two');
  expect(localStorage.getItem('second')).toBe('"two"');
  rerender({key: 'missing'});
  expect(result.current[0]).toBe('fallback');
  expect(localStorage.getItem('missing')).toBeNull();
  act(() => result.current[1]('written'));
  expect(localStorage.getItem('missing')).toBe('"written"');
  expect(localStorage.getItem('first')).toBe('"one"');
});
