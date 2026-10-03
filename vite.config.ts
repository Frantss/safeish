import { defineConfig } from 'vite-plus';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    ignorePatterns: ['dist/**', 'CHANGELOG.md'],
    singleQuote: true,
  },
  lint: {
    ignorePatterns: ['dist/**'],
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  test: {
    include: ['test/**/*.spec.ts'],
    typecheck: {
      enabled: true,
    },
  },
  pack: {
    entry: {
      index: 'entries/index.ts',
    },
    format: ['cjs', 'esm'],
    fixedExtension: false,
    dts: true,
    sourcemap: true,
    attw: {
      profile: 'node16',
      level: 'error',
    },
  },
});
