# Architecture

The browser submits a schema-validated brief to an Express coordinator. The coordinator executes intake, fixed-source CDC retrieval, narrow claim assessment, Qloo entity resolution and tag analysis, Gemini drafting, Gemini quality review, and deterministic checks in order. Each step records a timestamped outcome. Failed providers produce a visible error and trace; live mode never falls back to fixtures.

The two drafts share the same source and task. The baseline receives no Qloo context. The context-aware draft may use genre signals as presentation prompts, with an explicit aggregate-affinity limitation. A person can edit either draft, inspect the source and trace, and mark the selected context-aware version approved for further human review. That control does not publish or certify a message.

See [the architecture note](../docs/ARCHITECTURE.md) and [API contract](../docs/API_CONTRACT.md) for provider details.
