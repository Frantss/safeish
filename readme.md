<h1 align="center">Safe-ish</h1>

<div align="center">
  <a href="https://www.npmjs.com/package/safeish">
    <img alt="npm" src="https://img.shields.io/npm/v/safeish" />
  </a>
  <a href="https://jsr.io/@frantss/safeish">
    <img alt="JSR" src="https://jsr.io/badges/@frantss/safeish" />
  </a>
  <a href="https://bundlejs.com/?q=safeish">
    <img alt="bundle size" src="https://deno.bundlejs.com/badge?q=safeish" />
  </a>
  <a href="https://github.com/frantss/safeish/blob/main/LICENSE">
    <img alt="MIT License" src="https://img.shields.io/github/license/frantss/safeish" />
  </a>
</div>

<p align="center">Typed, exhaustive error handling for TypeScript, without <code>try</code>/<code>catch</code>.</p>

Functions return either a **result** (`{ ok: true, data }`) or an **error** (`{ ok: false, error: { code, context, message } }`). Every error code a function can return shows up in its return type, so the compiler tells you which failures you still have to handle. Exceptions thrown inside a wrapped function come back as an error too, instead of crashing the caller.

## Installation

```bash
npm install safeish
```

```bash
pnpm add safeish
yarn add safeish
bun add safeish
npx jsr add @frantss/safeish
```

## Usage

### 1. Define your errors

`defineError` returns a builder. The argument type of `message` becomes the error's **context**: the data you attach to that error and read back when handling it.

```typescript
import { defineError, result, safeish } from 'safeish';

const errors = {
  tooLarge: defineError({
    code: 'too_large',
    message: (value: number) => `${value} is larger than 100`,
  }),
  negative: defineError({
    code: 'negative',
    message: () => 'Value must be positive',
    // optional, runs every time this error is created
    effect: () => console.warn('negative value'),
  }),
};
```

### 2. Return results and errors

Wrap the function with `safeish`. Return an error builder's output for failures and `result(...)` for success.

```typescript
const parse = safeish((input: string) => {
  const value = Number(input);

  if (value < 0) return errors.negative();
  if (value > 100) return errors.tooLarge(value);

  return result(value);
});
```

### 3. Handle them

Check `ok`, then narrow on `error.code`. Each branch gets the right `context` type.

```typescript
const parsed = parse('150');

if (parsed.ok) {
  parsed.data; // number
} else if (parsed.error.code === 'too_large') {
  parsed.error.context; // number
} else if (parsed.error.code === 'negative') {
  parsed.error.context; // undefined
} else {
  parsed.error.code; // '~unhandled', something threw
  parsed.error.context; // unknown, the thrown value
}
```

### Exhaustive matching with ts-pattern

With [ts-pattern](https://github.com/gvergnaud/ts-pattern), `.exhaustive()` fails to compile until every error code is handled.

```typescript
import { match } from 'ts-pattern';

match(parse('150'))
  .with({ ok: true }, ({ data }) => data)
  .with({ error: { code: 'too_large' } }, ({ error }) => error.context)
  .with({ error: { code: 'negative' } }, () => 0)
  .with({ error: { code: '~unhandled' } }, ({ error }) => {
    throw error.context;
  })
  .exhaustive();
```

### Custom unhandled error

By default, a thrown exception becomes an error with code `~unhandled`. Pass an error definition as the second argument to `safeish` to use your own instead.

```typescript
const unexpected = defineError({
  code: 'unexpected',
  message: (thrown: unknown) => `Unexpected failure: ${String(thrown)}`,
});

const parseOrReport = safeish((input: string) => {
  // ...
  return result(Number(input));
}, unexpected);
```

## API

| Export | Signature | Description |
| --- | --- | --- |
| `defineError` | `({ code, message, effect? }) => ErrorDefinition` | Creates an error builder. The builder also exposes `code`, `message`, and a type-only `$context`. |
| `result` | `(data) => SafeishResult<Data>` | Creates a success value. |
| `error` | `(code, context, message) => SafeishError<Code, Context>` | Creates an error without a definition. Prefer `defineError`, which keeps codes consistent and runs effects. |
| `safeish` | `(fn, unhandled?) => (...args) => Output` | Wraps a function that returns results or errors, and converts anything it throws into an unhandled error. |
| `unhandledCode` | `'~unhandled'` | The default code for thrown exceptions. |

Types: `SafeishResult<Data>`, `SafeishError<Code, Context>`, `SafeishErrorDefinition<Code, Context>`.

### Prefixed exports

`safeish/prefixed` exports the same functions as `safeish_defineError`, `safeish_result`, `safeish_error`, `safeish_safe`, and `safeish_unhandledCode`. They're useful when names like `error` and `result` would collide with your own.

```typescript
import { safeish_defineError, safeish_result, safeish_safe } from 'safeish/prefixed';
```

## Limitations

- `safeish` wraps synchronous functions only.
- `effect` may return a promise, but it isn't awaited.

## Inspirations

- [neverthrow](https://github.com/supermacro/neverthrow)
- [ts-results](https://github.com/vultix/ts-results)
