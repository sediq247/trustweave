# API contract and integration evidence

## `GET /api/health`

Returns service status, booleans indicating whether the two provider keys are configured, and the fixed evidence source mode. It never returns credential values.

## `POST /api/run`

Accepts JSON:

```json
{
  "claim": "Washing hands with soap and water helps remove germs.",
  "audience": "Families and community volunteers",
  "objective": "remind",
  "culturalSeed": "Burna Boy",
  "culturalType": "artist",
  "mode": "live"
}
```

In live mode, both credentials must be configured. The handler returns normalized evidence, a bounded assessment, normalized Qloo genre signals, two editable drafts, reviewer flags, a required-human-review status, and a timestamped execution trace. Provider failures return an error and the completed/failed trace; they never switch to sample data.

In sample mode, the handler uses illustrative Qloo-like cues and local message templates without calling either Qloo or Gemini. The response says this in its source and trace fields.

## Upstream calls

| Purpose | Request | Authentication |
|---|---|---|
| Resolve the optional reference | `GET /search?query=…&types=urn:entity:<artist\|movie\|podcast\|book>&take=5` | `X-Api-Key` |
| Read related genres | `GET /v2/insights?filter.type=urn:tag&signal.interests.entities=<entity_id>&filter.parents.types=urn:entity:<type>&take=12` | `X-Api-Key` |
| Generate and review | `POST /v1beta/interactions` | `x-goog-api-key` |
| Retrieve educational evidence | Fixed CDC FAQ page over HTTPS | Public page |

The Qloo client uses the documented response envelope `results.entities` for entity search and `results.tags` for taste analysis. Tags are bounded and normalized before display. Live responses remain unverified until an event-issued key is added and a genuine API call succeeds.
