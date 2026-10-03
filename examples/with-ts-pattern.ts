import { match } from 'ts-pattern';
import { defineError, result, safeish } from '~/entries/index';

const errors = {
  greater_than_50: defineError({
    code: 'greater_than_50',
    message: (context: number) => `Value ${context} is greater than 50`,
  }),

  greater_than_80: defineError({
    code: 'greater_than_80',
    message: () => 'Value is greater than 80',
  }),
};

const someFunctionThatMightFail = safeish(() => {
  const value = Math.random();

  // whenever you get to an error case, return the corresponding error instead of throwing or returning void or undefined
  // note that calling the error builder will add a sentry breadcrumb, this will be useful for debugging
  if (value > 0.5) return errors.greater_than_50(value);
  if (value > 0.8) return errors.greater_than_80();

  // for success cases use safe_result, which will wrap the data in a Safe_Result object
  return result(value);
});

const outcome = someFunctionThatMightFail();

match(outcome)
  .with({ ok: true }, (data) => {
    // handle success
  })
  .with({ error: { code: 'greater_than_50' } }, (error) => {
    // handle error
    error.error.context; // number
  })
  .with({ error: { code: 'greater_than_80' } }, (error) => {
    // handle error
    error.error.context; // undefined
  })
  .with({ error: { code: '~unhandled' } }, (error) => {
    // handle any unhandled error
    error.error.context; // unknown
  })
  .exhaustive();
