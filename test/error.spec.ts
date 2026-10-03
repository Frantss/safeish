import { assertType, expect, it } from 'vite-plus/test';
import { error } from '~/entries/index';
import type { SafeishError } from '~/src/types';

it('should return expected types', () => {
  const instance = error('code', { a: 1 }, 'message');

  assertType<false>(instance.ok);

  assertType<string>(instance.error.code);
  assertType<'code'>(instance.error.code);

  assertType<string>(instance.error.message);

  assertType<{ a: number }>(instance.error.context);

  assertType<SafeishError<'code', { a: number }>>(instance);
});

it('should return expected error', () => {
  const instance = error('code', { a: 1 }, 'message');

  expect(instance.ok).toBe(false);

  expect(instance.error.code).toBe('code');
  expect(instance.error.message).toBe('message');
  expect(instance.error.context.a).toBe(1);
});
