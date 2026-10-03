import { assert, assertType, expect, it } from 'vite-plus/test';
import { defineError, result, safeish } from '~/entries/index';
import type { SafeishResult } from '~/src/types';

it('should return a result when no error is thrown or returned', () => {
  const caller = safeish((a: number, b: number) => {
    return result(a + b);
  });

  const output = caller(1, 2);

  assert(!!output.ok);

  assertType<SafeishResult<number>>(output);

  expect(output.data).toBe(3);
});

it('should return an error when an unhandled error is thrown', () => {
  const caller = safeish((a: number, b: number) => {
    throw 'failed';
  });

  const output = caller(1, 2);

  assert(!output.ok);

  assertType<unknown>(output.error.context);
  assertType<string>(output.error.message);

  expect(output.error.code).toBe('~unhandled');
  expect(output.error.context).toBe('failed');
});

it('should return a custom error when it is returned', () => {
  const custom = defineError({
    code: 'code',
    message: (context: { message: string }) => context.message,
  });
  const caller = safeish((a: number, b: number) => {
    return custom({ message: 'message' });
  });

  const output = caller(1, 2);

  assert(!output.ok);

  assertType<'code' | '~unhandled'>(output.error.code);
  assertType<unknown>(output.error.context);
  assertType<string>(output.error.message);

  assert(output.error.code === 'code');
  expect(output.error.message).toBe('message');

  assertType<{ message: string }>(output.error.context);
});

it('returns custom error as unhandled if passed in second argument', () => {
  const custom = defineError({
    code: 'code',
    message: (context: unknown) => `${context}`,
  });
  const caller = safeish((a: number, b: number) => {
    throw 'failed';
  }, custom);

  const output = caller(1, 2);

  assert(!output.ok);

  assertType<'code'>(output.error.code);
  assertType<unknown>(output.error.context);
  assertType<string>(output.error.message);

  expect(output.error.code).toBe('code');
  expect(output.error.message).toBe('failed');
  expect(output.error.context).toBe('failed');
});
