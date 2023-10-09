import { isSome, none, Option, some } from './option';

/**
 * Unwraps the value of an {@link Option} of type `T`
 * or returns a fallback value that defaults to `null`.
 */
export function unwrapOption<T>(option: Option<T>): T | null;
export function unwrapOption<T, U>(option: Option<T>, fallback: () => U): T | U;
export function unwrapOption<T, U = null>(option: Option<T>, fallback?: () => U): T | U {
    if (isSome(option)) return option.value;
    return fallback ? fallback() : (null as U);
}

/**
 * Wraps a nullable value into an {@link Option}.
 */
export const wrapNullable = <T>(nullable: T | null): Option<T> => (nullable !== null ? some(nullable) : none<T>());
