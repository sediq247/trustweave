# Testing evidence

## Local checks run

- `npm run build` — passed with Vite production bundle.
- `npm run test` — 6 tests passed.
- `npm audit --omit=dev --audit-level=high` — 0 production dependency vulnerabilities reported.
- `node --check` on server, dev launcher, and Vite configuration — passed.

## Test scope

Tests cover input bounds and allowed entity types, the narrow hand-hygiene assessment, Qloo authentication and request paths with mocked responses, tag filtering, a complete mocked CDC/Qloo/Gemini workflow, citation and trace behavior, secret non-disclosure in the response, sample-mode separation, and missing-key handling.

All Qloo and Gemini calls in tests use mocked `fetch` responses. The CDC source is also mocked in the end-to-end test. No genuine Qloo or Gemini API integration test has been run because credentials are not configured. A real-key run and public URL test remain required.
