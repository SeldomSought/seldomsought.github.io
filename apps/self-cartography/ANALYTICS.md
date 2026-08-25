# Analytics — what's collected, and what isn't

Status as of this writing: **the capture layer exists and is fully wired
through the app; nothing it produces leaves the browser.** The active sink
is an in-memory, sessionStorage-mirrored queue (`src/engine/analytics/sinks.ts`)
that a developer can inspect but that is never fetched or sent anywhere. If
that ever changes, this document and the landing page's privacy copy both
need to be updated in the same change — see "If this ever gets a real
backend" below.

This exists to answer product questions like *where do people tend to stop*,
*which question formats take longest*, and *which careers do people actually
open* — without ever knowing who answered, or what they answered.

## The hard separation

Assessment **content** (a respondent's actual answers, and everything scored
from them) and assessment **analytics** (behavioral metadata about the
session) are two different systems, on purpose, enforced two ways:

1. **Different storage.** Content lives at `selfCartography.v1` (in-progress
   answers) and `selfCartography.history.v1` (completed profiles) in
   `localStorage` — see `src/engine/persistence.ts`. Analytics lives at
   `selfCartography.analytics.sessionId.v1` and
   `selfCartography.analytics.debug.v1` in `sessionStorage` — a different
   browser storage area, cleared when the tab closes, under keys that share
   no prefix logic with the content keys.
2. **Different code, with a real boundary.** `src/engine/analytics/` never
   imports `Response` or `FacetScore` — the two types that carry an actual
   answer or a derived score — from `engine/types.ts`. This isn't just a
   convention: `analytics.test.ts` reads the module's own source text and
   fails if either type name, or an import reaching into `engine/types` or
   `engine/scoring`, ever appears there. A change that tried to smuggle
   response content into an analytics event would fail that test before it
   could ship.

## Exactly what's collected

Seven event types, defined in full in `src/engine/analytics/types.ts`. Every
event also carries a `sessionId` (random, generated once per browser tab
session, gone when the tab closes — never the same value across two visits,
and never written into or derived from the content storage above) and a
`timestamp`.

| Event | Fields | What it answers |
|---|---|---|
| `assessment_start` | *(none beyond the base fields)* | How many people actually begin, vs. just land on the page |
| `section_enter` | `regionId`, `order` | Which region someone is in when a session goes quiet — the basis for "abandonment section" (see below) |
| `section_complete` | `regionId`, `order`, `itemCount`, `durationMs` | Completion rate and time-on-section per region |
| `item_answered` | `itemId`, `format`, `responseTimeMs`, `isRevision` | Which questions or formats take unusually long, independent of what was answered |
| `assessment_complete` | `totalDurationMs`, `regionsCompleted` | Overall completion rate and total time |
| `results_section_view` | `section` | Which parts of the report people actually scroll to (via `IntersectionObserver`, not just "the page rendered") |
| `career_card_click` | `careerId`, `source` (`'fit-card'` \| `'explorer'`) | Which careers people open for a closer look |

`itemId`, `regionId`, `careerId`, and `section` are all references to public
catalog entries — the same ids visible in this repo's own content files
(`src/content/instruments/*.items.ts`, `src/content/regions.ts`,
`src/content/careers/`). They name *which* question, region, or career was
involved; they never carry what was chosen.

## Exactly what's never collected

- **The value of any answer** — no rating, no chosen option, no ranking
  order, no scenario choice, no free-text content. `item_answered` fires
  with the item's id and how long it took, and nothing else.
- **Any derived score** — no facet score, no career fit percentage, no
  confidence level, no contradiction. `career_card_click` fires with which
  career was opened, not what its fit score was.
- **Free-text responses** — the optional reflection/evidence-prompt answers
  are never touched by this system at all.
- **Any persistent, cross-session identifier.** `sessionId` is
  `sessionStorage`-scoped (gone on tab close) and is never linked to the
  `localStorage`-persisted assessment content, so even someone with access
  to both stores on the same device can't join a specific answer set to a
  specific analytics session after the fact from the data alone.
- **IP address, device fingerprint, or anything else identifying** — not
  applicable today (nothing is transmitted), and would need to be
  deliberately avoided by whatever sink is registered if that changes (see
  below).

## "Abandonment section" specifically

There's no `assessment_abandon` event — a session can't announce that it's
being abandoned while it's happening. Instead, abandonment is meant to be
*derived*, downstream, from the gap between `section_enter` and
`section_complete`/`assessment_complete`: a session whose last event is a
`section_enter` for some region, with no later `section_complete` for that
region and no `assessment_complete`, abandoned somewhere in that region.
This avoids adding an artificial "are you still there" heartbeat ping, which
would itself be the kind of ongoing background tracking this design is
trying to avoid.

## If this ever gets a real backend

`registerAnalyticsSink()` (`src/engine/analytics/track.ts`) is the single
place a network sink would be registered — nothing else in the app would
need to change, since every call site already only ever calls `track()`
with the whitelisted event shapes above. Before that happens:

1. The landing page's consent copy (`src/content/copy/intro.ts`) currently
   states "nothing is transmitted or stored anywhere but this device" — that
   sentence would need to change to accurately disclose aggregate,
   content-free behavioral analytics, in the same change that registers a
   real sink.
2. Whichever backend is chosen should be configured not to log or retain
   IP addresses as identifying data (several privacy-focused analytics
   services do this by default; general-purpose ones often don't).
3. `analytics.test.ts`'s architectural-guard tests should keep passing
   unmodified — if adding a real sink requires touching `engine/types.ts`
   imports inside `src/engine/analytics/`, that's a sign response content is
   leaking into the transport layer and needs to be reconsidered, not the
   test relaxed.
