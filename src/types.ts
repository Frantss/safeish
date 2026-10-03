/**
 * Represents a successful operation outcome.
 */
export type SafeishResult<Data> = {
  ok: true;
  data: Data;
};

/**
 * Represents a known error outcome.
 */
export type SafeishError<Code extends string, Context> = {
  ok: false;
  error: { code: Code; context: Context; message: string };
};

/**
 * Represents the definition or blueprint for a specific error type.
 */
export type SafeishErrorDefinition<Code extends string, Context> = Context extends undefined
  ? {
      (): SafeishError<Code, Context>;
      code: Code;
      message: () => string;
      $context: undefined;
    }
  : {
      (context: Context): SafeishError<Code, Context>;
      code: Code;
      message: (context: Context) => string;
      $context: Context;
    };
