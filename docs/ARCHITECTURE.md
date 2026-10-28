# Architecture and data boundaries

```text
React + Vite browser
  └─ POST /api/run (Express, Zod validation, rate limit)
       ├─ Intake and triage (bounded brief)
       ├─ Evidence retrieval (fixed CDC page, no user-supplied URL)
       ├─ Claim assessment (narrow supported topic or not yet verified)
       ├─ Qloo server client: GET /search → GET /v2/insights
       ├─ Gemini Interactions API: baseline + context-aware drafts
       ├─ Gemini quality review
       └─ Deterministic safety checks, citations, human review
```

## Providers

- Qloo uses the event host in `QLOO_BASE_URL` (`https://hackathon.api.qloo.com` by default), `X-Api-Key`, `/search`, and `/v2/insights`. The browser never receives the key. The response normalizer accepts tag objects from `results.tags`, selects genre tags only, and excludes selected sensitive-topic terms.
- Gemini uses the official Interactions REST API with `x-goog-api-key`, `store: false`, and `GEMINI_MODEL`. One interaction generates both drafts. A second interaction independently reviews them and returns human-review flags. The model cannot approve publication.
- Evidence retrieval is a fixed URL on CDC's official site, with a timeout and a 2 MB response bound. No arbitrary URL fetch is accepted, reducing SSRF and prompt-injection exposure. The assessment makes only a narrow match to the educational hand-hygiene example; other claims remain unverified.

## Privacy and security

The server does not store claims or drafts. Browser state is in memory. Request JSON is limited to 12 KB, strings have Zod bounds, workflow requests are rate-limited per IP, browser cross-origin requests are blocked by default and optionally pinned with `APP_ORIGIN`, and responses use security headers. Network requests to Qloo and Gemini are server-side. Qloo redirects are rejected so a custom API-key header cannot be forwarded to another origin.

## Sample mode

Sample mode is separate from live mode. It retrieves the CDC page, but does not contact Qloo or Gemini. It uses clearly labeled illustrative cultural cues and local sample copy. Never report its output as a provider result.
