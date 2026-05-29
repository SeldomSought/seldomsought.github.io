/**
 * SeldomSought — Projects Data
 * ─────────────────────────────────────────────────────────────────────────────
 * Molecular interface data model. Each project has:
 *   id, title, subtitle, status, category, description
 *   components[] — ordered array of satellite nodes (purpose → status)
 *
 * Component types: 'purpose' | 'features' | 'stack' | 'links' | 'status'
 * status values:   'Live' | 'Beta' | 'In Progress' | 'Prototype' | 'Concept'
 * ─────────────────────────────────────────────────────────────────────────────
 */

const PROJECTS = [
  {
    id: 'focus-shield',
    title: 'Focus Shield',
    subtitle: 'Commitment-Locked Feed Control',
    status: 'Beta',
    category: 'Chrome Extension',
    description: 'A Chrome extension that limits passive feed consumption to 30 minutes per day while keeping bookmarks and creation tools always accessible. Enforced with a commitment lock that requires an accountability partner\'s passphrase.',
    components: [
      {
        id: 'purpose',
        label: 'Purpose',
        type: 'purpose',
        content: 'Social platforms are engineered for passive consumption — not for you, but for them. Focus Shield enforces a 30-minute daily limit on feed browsing. Outside that window, feeds are hidden at the CSS level before JavaScript runs. Bookmarks, saved posts, and all creation tools remain fully accessible at all times.\n\nAn optional commitment lock — passphrase set by an accountability partner you choose — makes the extension genuinely difficult to defeat. Opening the browser extensions page while locked triggers a high-friction interrupt window.',
      },
      {
        id: 'features',
        label: 'Features',
        type: 'features',
        content: [
          '30-minute daily consumption budget — enforced, not suggested',
          'Commitment lock via accountability partner passphrase',
          'CSS-level feed suppression before JavaScript executes',
          'MutationObserver guard prevents platforms from stripping locked classes',
          'Escape interrupt when chrome://extensions is opened while locked',
          'Delta-time timer — accurate across Chrome service worker sleep cycles',
          'Webhook events: heartbeat, tamper, escape interrupt, disable attempts',
          'Opt-in deterrence messages on bypass attempts (off by default)',
          'Bookmarks and saved posts always accessible',
          'Post, reply, create — always unrestricted',
          'Works on Twitter/X, Reddit, YouTube, Instagram, Facebook',
          'No account, no data collection, no subscriptions',
        ],
      },
      {
        id: 'stack',
        label: 'Stack',
        type: 'stack',
        content: [
          'JavaScript',
          'Chrome MV3',
          'CSS3',
          'MutationObserver API',
          'IndexedDB',
          'Alarm API',
          'Service Worker',
          'Webhooks',
        ],
      },
      {
        id: 'links',
        label: 'Links',
        type: 'links',
        content: [
          { label: 'Download', href: 'projects/focus-shield/focus-shield.zip', sameTab: true },
          { label: 'GitHub', href: 'https://github.com/SeldomSought/Focus-Shield' },
        ],
      },
      {
        id: 'status',
        label: 'Status',
        type: 'status',
        content: 'Beta — Chrome Extension. Functional across Twitter/X, Reddit, YouTube, Instagram, and Facebook. No server required. No account, no data collection, no subscriptions. Updated March 2026.',
      },
    ],
  },

  {
    id: 'psychometrics-battery',
    title: 'Psychometric Battery',
    subtitle: 'Multi-Dimensional Self-Assessment',
    status: 'Beta',
    category: 'Web App',
    description: 'A 142-item battery covering HEXACO personality, forced-choice ranking, Schwartz values, and attachment style. Results include a profile archetype, shadow tendencies, career fit, and a cosmic profile. Runs entirely in the browser.',
    components: [
      {
        id: 'purpose',
        label: 'Purpose',
        type: 'purpose',
        content: 'Most personality assessments are either proprietary black boxes or academically inaccessible instruments locked behind licensing walls. They measure one dimension and stop — ignoring the motivational values that drive behavior, the attachment patterns that shape relationships, and the broader context that makes a profile actually useful.\n\nThis battery integrates four validated measurement frameworks into a single session. All scoring is client-side and transparent. The result is not a single label — it is a multi-layered profile with cross-references between what you are, what you value, how you attach, and where your blind spots emerge under pressure.',
      },
      {
        id: 'features',
        label: 'Features',
        type: 'features',
        content: [
          '142 items across HEXACO, forced-choice, values, and attachment modules',
          'HEXACO six-factor model — 96 novel items, 6 domains, 24 facets',
          '30 forced-choice triplets covering all 20 three-domain combinations',
          'Schwartz 10 Basic Human Values hierarchy',
          'Attachment style classification — Secure, Preoccupied, Dismissing, Fearful-Avoidant',
          '15 profile archetypes keyed to top-2 HEXACO domains',
          'Shadow / Under Pressure profile — stress-response patterns',
          'Career Domain Fit across 8 occupational domains',
          'Relationship Profile — availability, conflict style, trust, social energy',
          'Cosmic Profile — sun sign, Chinese zodiac, 5 Pythagorean numerology numbers',
          'T-scores and population percentiles across all 24 facets',
          'Keyboard navigation — 1–5 to answer, auto-advance',
          'Fully client-side — no data transmitted, no accounts, no tracking',
        ],
      },
      {
        id: 'stack',
        label: 'Stack',
        type: 'stack',
        content: [
          'JavaScript',
          'HTML / CSS',
          'Client-side only',
          'No frameworks',
          'No dependencies',
        ],
      },
      {
        id: 'links',
        label: 'Links',
        type: 'links',
        content: [
          { label: 'Take Assessment', href: 'projects/psychometrics-battery/index.html', sameTab: true },
          { label: 'GitHub', href: 'https://github.com/SeldomSought/Psychometrics-Assessment-Battery' },
        ],
      },
      {
        id: 'status',
        label: 'Status',
        type: 'status',
        content: 'Beta — Web App. Runs entirely in the browser; no server, no account required. Updated March 2026.',
      },
    ],
  },

  {
    id: 'curated-feed',
    title: 'Curated Feed',
    subtitle: 'Color-Sequenced Instagram Archive',
    status: 'Live',
    category: 'Media',
    description: 'Every post from @seldomsought arranged by hue — not time. Photography, found objects, and everyday moments choreographed as a single chromatic journey across the Instagram grid.',
    components: [
      {
        id: 'purpose',
        label: 'Purpose',
        type: 'purpose',
        content: 'Instagram orders content by time. That is the wrong axis for a curated aesthetic account. Chronological sorting shows you individual moments — it hides the color story, the eye behind it, the gradual shift in tone and mood across hundreds of posts.\n\nEvery post has been sequenced by color — arranged so the feed drifts continuously across the spectrum. Muted interiors flow into botanical greens, into warm amber, into deep evening shadow, into chalk and linen. The grid becomes a gradient. The archive becomes an argument about what it means to look at the world with intention.',
      },
      {
        id: 'features',
        label: 'Features',
        type: 'features',
        content: [
          'Manually sequenced — every transition hand-evaluated, no algorithm',
          'Three-column grid geometry preserves the Instagram layout logic',
          'Photography spans interiors, botanicals, objects, landscape, and texture',
          'Content is subordinate to composition — new posts placed by hue, not date',
          'Ongoing — the gradient continues to grow',
        ],
      },
      {
        id: 'stack',
        label: 'Stack',
        type: 'stack',
        content: [
          'Manual curation',
          'Color theory',
          'Instagram',
        ],
      },
      {
        id: 'links',
        label: 'Links',
        type: 'links',
        content: [
          { label: 'View Feed', href: 'https://www.instagram.com/seldomsought' },
        ],
      },
      {
        id: 'status',
        label: 'Status',
        type: 'status',
        content: 'Live — Instagram. Ongoing curation. Updated March 2026.',
      },
    ],
  },

  {
    id: 'bookmark-mirror',
    title: 'Bookmark Mirror',
    subtitle: 'Psychological Profile from Your Bookmarks',
    status: 'Beta',
    category: 'Chrome Extension',
    description: 'A Chrome extension that scrapes your Twitter/X bookmarks and generates a deep psychological profile entirely offline — Big Five personality, Schwartz values, LIWC linguistic analysis, topic velocity, and more. No API key, no server, no data leaving your device.',
    components: [
      {
        id: 'purpose',
        label: 'Purpose',
        type: 'purpose',
        content: 'What you save is more revealing than what you say. Bookmarks are unperformed — captured before you had words for why. They are an unguarded record of what actually caught your attention: the ideas that made you pause, the arguments you wanted to revisit, the things that resonated before you had language for them.\n\nBookmark Mirror runs entirely inside your browser. It injects a content script into your bookmarks page, extracts structured data locally, and runs a multi-dimensional psychological analysis in the extension\'s service worker. The result is a mirror, not a quiz.',
      },
      {
        id: 'features',
        label: 'Features',
        type: 'features',
        content: [
          'Fully offline — no API key, no OAuth, no server, no data transmission',
          'Big Five (OCEAN) personality profile inferred from topic patterns',
          'Schwartz Values profiling across four higher-order motivational clusters',
          'LIWC-inspired linguistic profile — analytical thinking, authenticity, cognitive complexity',
          'Topic velocity — which interests are rising or fading over your history',
          '23-topic taxonomy with weighted keyword matching and entropy scoring',
          'Hidden pattern detection: night mind, niche hunter, question collector',
          'Temporal rhythm — peak hour/day, time persona, hourly distribution',
          'Archetype assignment from 11 archetypes based on psychometric convergence',
          'Hash-based deduplication — robust across slow loads and repeated scrolls',
          'Port keepalive architecture for reliable operation in background tabs',
        ],
      },
      {
        id: 'stack',
        label: 'Stack',
        type: 'stack',
        content: [
          'JavaScript',
          'Chrome MV3',
          'IndexedDB',
          'Content Scripts',
          'Service Worker',
          'Port Keepalive',
        ],
      },
      {
        id: 'links',
        label: 'Links',
        type: 'links',
        content: [
          { label: 'Download', href: 'projects/bookmark-mirror/bookmark-mirror.zip', sameTab: true },
          { label: 'GitHub', href: 'https://github.com/SeldomSought/Twitter-bookmark-analyzer' },
        ],
      },
      {
        id: 'status',
        label: 'Status',
        type: 'status',
        content: 'Beta — Chrome Extension for Twitter/X. Updated March 2026.',
      },
    ],
  },
];
