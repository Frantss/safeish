---
'safeish': minor
---

Remove the `safeish/prefixed` entry point. Import `defineError`, `result`, `error`, `safeish`, and `unhandledCode` from `safeish` instead; alias them on import if the names collide.
