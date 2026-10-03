import { assertType, describe, expect, it, test, vi } from 'vitest';
import { defineError } from '~/entries/index';

it('should return expected types when message lacks a context argument', () => {
  const error = defineError({
    code: 'code',
    message: () => 'message',
  });

  assertType<string>(error.code);
  assertType<'code'>(error.code);

  assertType<string>(error.message());

  assertType<undefined>(error.$context);
});

it('should return expected types when message has a context argument', () => {
  const error = defineError({
    code: 'code',
    message: (context: { message: string }) => context.message,
  });

  assertType<string>(error.code);
  assertType<'code'>(error.code);

  assertType<string>(error.message({ message: 'test' }));

  assertType<{ message: string }>(error.$context);
});

test('defined error should return expected error', () => {
  const error = defineError({
    code: 'code',
    message: () => 'message',
  });

  const instance = error();

  expect(instance.ok).toBe(false);

  expect(instance.error.code).toBe('code');
  expect(instance.error.message).toBe('message');
  expect(instance.error.context).toBeUndefined();
});

test('defined error should return expected error with context', () => {
  const error = defineError({
    code: 'code',
    message: (context: { message: string }) => context.message,
  });

  const instance = error({ message: 'message' });

  expect(instance.ok).toBe(false);

  expect(instance.error.code).toBe('code');
  expect(instance.error.message).toBe('message');
  expect(instance.error.context.message).toBe('message');
});

describe('effect', () => {
  it('should call the effect when error is created', () => {
    const effect = vi.fn();

    const builder = defineError({
      code: 'code',
      message: () => 'message',
      effect,
    });

    builder();

    expect(effect).toHaveBeenCalledTimes(1);
  });

  it('should call the effect each time error is created', () => {
    const effect = vi.fn();

    const builder = defineError({
      code: 'code',
      message: () => 'message',
      effect,
    });

    builder();
    builder();
    builder();

    expect(effect).toHaveBeenCalledTimes(3);
  });

  it('should not call the effect when the error builder is created', () => {
    const effect = vi.fn();

    const builder = defineError({
      code: 'code',
      message: () => 'message',
      effect,
    });

    expect(effect).not.toHaveBeenCalled();
  });
});
