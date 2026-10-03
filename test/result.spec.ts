import { assertType, expect, it } from 'vite-plus/test';
import { result } from '~/entries/index';
import type { SafeishResult } from '~/src/types';

it('should return expected types', () => {
  const instance = result({ a: 1 });

  assertType<true>(instance.ok);

  assertType<{ a: number }>(instance.data);

  assertType<SafeishResult<{ a: number }>>(instance);
});

it('should return expected result', () => {
  const instance = result({ a: 1 });

  expect(instance.ok).toBe(true);

  expect(instance.data.a).toBe(1);
});
