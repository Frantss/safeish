import { error } from '~/src/error';
import type { SafeishError, SafeishErrorDefinition, SafeishResult } from '~/src/types';

export const unhandledCode = '~unhandled' as const;
export type SafeishUnhandledCode = typeof unhandledCode;

/**
 * Wraps a function to safely handle execution, catching exceptions and
 * returning a `SafeishResult` or `SafeishError`.
 * Catches thrown exceptions and maps them to the `unhandled` error definition.
 *
 *
 * @param handler The function to execute safely. Expected to return `SafeishResult` or `SafeishError`.
 * @param [unhandled] Error definition for exceptions thrown by `handler`.
 * @returns A new function that wraps the `handler` in a try-catch, returning a Promise resolving to the handler's `Output` or an `Unhandled` error.
 *
 * @example
 * ```typescript
 * const safeDivide = safeish(divide); // divide returns SafeishResult | SafeishError
 * const result1 = await safeDivide(10, 2); // { type: 'result', ... }
 * const result2 = await safeDivide(10, 0); // { type: 'error', code: 'DIV_BY_ZERO', ... }
 * const result3 = await safeDivide(10, 'a' as any); // { type: 'error', code: 'UNHANDLED_EXCEPTION', ... }
 * ```
 */
export const safeish = <
  Input extends unknown[],
  Output extends
    | SafeishResult<unknown>
    | SafeishError<string, unknown>
    | SafeishError<SafeishUnhandledCode, unknown>,
  Unhandled extends SafeishErrorDefinition<string, unknown> = SafeishErrorDefinition<
    SafeishUnhandledCode,
    unknown
  >,
>(
  handler: (...args: Input) => Output,
  unhandled?: Unhandled,
) => {
  return (...args: Input) => {
    try {
      return handler(...args);
    } catch (e) {
      return (unhandled?.(e) ??
        error(unhandledCode, e, 'An unhandled error occurred')) as unknown as ReturnType<Unhandled>;
    }
  };
};
