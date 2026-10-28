# TrustWeave

Public information can be accurate yet difficult to act on. TrustWeave gives public-health and community communication teams a traceable way to turn one verified source into a plain-language message, then consider optional cultural context without changing the facts.

The initial educational workflow focuses on a CDC hand-hygiene source. A user enters a claim, audience, communication goal, and an optional public cultural reference. The backend retrieves the fixed CDC page, makes a narrow source match or labels the claim not yet verified, resolves the reference with Qloo, and requests two drafts from Gemini: a factual baseline and a context-aware alternative. Gemini performs a separate quality review. Deterministic checks attach the source citation, surface warnings, and keep human review mandatory.

Qloo is used for its taste graph, not as a truth source. TrustWeave resolves a user-supplied artist, movie, podcast, or book and retrieves related genre tags. Those aggregate signals can inspire optional presentation ideas in the adapted draft. They do not establish audience preferences, identity, beliefs, or behavior. The baseline-versus-context-aware comparison shows exactly where Qloo is available to influence the draft.

The system is deliberately bounded: the included CDC source supports one educational use case; other claims remain unverified. The application does not issue emergency alerts, provide medical advice, diagnose misinformation, or publish messages automatically. Generated material must be reviewed by a qualified human. Live Qloo and Gemini operation requires provider keys configured server-side; sample mode is separate and explicitly labeled.

## Current verification state

The frontend production build, unit tests, and mocked provider-contract workflow have been run locally. No live Qloo/Gemini run, public deployment, public repository, or Devpost submission is claimed until each is genuinely completed.
