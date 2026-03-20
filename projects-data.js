/**
 * SeldomSought — Projects Data
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO ADD A NEW PROJECT
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Copy the object below (from the opening { to its closing },)
 * 2. Paste it as a new item inside the PROJECTS array
 * 3. Fill in every field. Use null for any link you don't have yet.
 * 4. Set screenshots: [] until you have images ready, then add paths like:
 *      screenshots: ['assets/my-project-screen-1.png', 'assets/my-project-screen-2.png']
 * 5. Drop your icon file in /assets/ and update the icon field.
 * 6. Save. The Projects page reads this array and renders everything automatically.
 *
 * STATUS OPTIONS: 'Live' | 'Beta' | 'Private'
 * ─────────────────────────────────────────────────────────────────────────────
 */

const PROJECTS = [
  {
    id: 'focus-shield',
    name: 'Focus Shield',
    tagline: 'Turn social media back into a tool for creation — not consumption.',
    excerpt: 'A Chrome extension that limits passive feed consumption to 30 min/day while keeping bookmarks, saved posts, and creation tools always accessible. Enforced with a commitment lock that can\'t be bypassed without an accountability partner\'s passphrase.',
    status: 'Beta',
    platforms: ['Chrome Extension', 'Twitter / X', 'Reddit', 'Instagram', 'YouTube', 'Facebook'],
    icon: 'assets/focus-shield-icon.svg',

    // Drop in screenshot paths when ready. Leave empty to hide the section.
    screenshots: [
      // 'assets/focus-shield-screen-1.png',
      // 'assets/focus-shield-screen-2.png',
    ],

    problem: `Social platforms are engineered for passive consumption — not for you, but for them. The average person scrolls far more than they intend to, and the posts they actually saved to revisit get buried, forgotten, and never seen again. Bookmarks become a graveyard. Attention becomes a resource extracted rather than deployed.`,

    solution: `Focus Shield enforces a 30-minute daily limit on feed consumption. Outside that window, the feed is blocked — but bookmarks, saved posts, and all creation tools remain fully accessible. The extension reframes your saved content as your curated feed: the one feed worth consuming. It converts a passive habit into an intentional practice, and nudges platforms toward the thing they were always better suited for — creation and connection, not endless scrolling.

The commitment lock goes further: have an accountability partner set a passphrase you don't know, and the extension becomes genuinely difficult to defeat. Feed elements are suppressed at the CSS level before JavaScript even runs. A MutationObserver ensures locked classes can't be stripped by the platform. Opening the browser extensions page while locked triggers an interrupt window. Every bypass attempt is logged and, optionally, reported to a webhook.`,

    howItWorks: [
      {
        step: 1,
        title: 'Install & lock',
        desc: 'Load the extension in Chrome. Hand your device to an accountability partner — they set a passphrase you don\'t know, locking the settings. You can\'t disable it without them.',
      },
      {
        step: 2,
        title: 'Start a session',
        desc: 'When you want to browse feeds, start a timed session from the popup or the in-page pill. The daily limit begins counting down real elapsed time.',
      },
      {
        step: 3,
        title: 'Feeds locked outside sessions',
        desc: 'When no session is active, feed elements are hidden at the CSS level before JavaScript runs. Nav items, timelines, and recommendations disappear. Bookmarks and saved posts stay open.',
      },
      {
        step: 4,
        title: 'Creation stays open',
        desc: 'Post, reply, DM, comment — always available regardless of session state. The limit is on consumption, not contribution.',
      },
      {
        step: 5,
        title: 'Escape attempts are intercepted',
        desc: 'Opening the browser extensions page while locked triggers a high-friction interrupt window. Attempts are logged and reported to your webhook.',
      },
      {
        step: 6,
        title: 'Reset at midnight',
        desc: 'Your daily window refreshes each night. Session history, streaks, and tamper events are logged locally.',
      },
    ],

    features: [
      '30-minute daily consumption budget — enforced, not suggested',
      'Commitment lock: partner sets a passphrase you don\'t know; settings are sealed',
      'CSS-level feed suppression — hidden before JavaScript runs',
      'MutationObserver guard prevents platforms from stripping locked classes',
      'Escape interrupt window when chrome://extensions is opened while locked',
      'Delta-time timer: accurate even when Chrome\'s service worker sleeps',
      'Opt-in coach messages on failed bypass attempts (off by default)',
      'Webhook support: heartbeat, tamper events, escape attempts, disable attempts',
      'Bookmarks and saved posts always accessible, any time',
      'Post, reply, and create — always on, no restrictions',
      'Works across Twitter / X, Reddit, YouTube, Instagram, and Facebook',
      'No account, no data collection, no subscriptions',
    ],

    links: {
      download:    'projects/focus-shield/focus-shield.zip',
      chromeStore: null,
      github:      'https://github.com/SeldomSought/Focus-Shield',
      website:     null,
      demo:        null,
    },

    lastUpdated: 'Mar 2026',
  },

  {
    id: 'psychometrics-battery',
    name: 'Psychometric Battery',
    tagline: 'A multi-dimensional self-assessment built from scratch — personality, values, attachment, and cosmic profile in one session.',
    excerpt: 'A 142-item battery covering HEXACO personality (6 domains, 24 facets), forced-choice ranking, Schwartz values hierarchy, and attachment style. Results include a profile type, shadow tendencies, career fit, relationship profile, and an integrated cosmic reading. Everything runs in your browser — no accounts, no data transmitted.',
    status: 'Beta',
    platforms: ['Web App', 'Personality', 'Psychometrics'],
    icon: null,

    screenshots: [],

    problem: `Most personality assessments are either proprietary black boxes (you pay, get a label, never see the math) or academically inaccessible instruments locked behind licensing walls. They measure one dimension — usually personality traits — and stop there, ignoring the motivational values that drive behavior, the attachment patterns that shape relationships, and the broader context that makes a profile actually useful for self-knowledge.`,

    solution: `A ground-up psychometric battery that integrates four distinct measurement frameworks into a single session. Novel, non-copyrighted items written to modern standards. All scoring is client-side and transparent. The result isn't a single label — it's a multi-layered profile with actionable cross-references between what you are, what you value, how you attach, and where your blind spots emerge under pressure.

The battery covers: HEXACO six-factor personality (96 items, 24 facets); 30 forced-choice ranking blocks designed to suppress social desirability bias; Schwartz 10 Basic Human Values; and an attachment style brief screen. Results layer in a profile archetype, facet highlights, shadow/stress tendencies, career domain fit, relationship profile, and an integrated cosmic reading drawn from Western astrology, Chinese zodiac, and Pythagorean numerology.`,

    howItWorks: [
      { step: 1, title: 'Module 1 — HEXACO personality', desc: '96 items across 6 domains and 24 facets. Rate each statement 1–5 on how accurately it describes you. Covers Honesty-Humility, Emotionality, eXtraversion, Agreeableness, Conscientiousness, and Openness. Keyboard navigation supported: press 1–5 to answer, ↑↓ to move, Enter to advance.' },
      { step: 2, title: 'Module 2 — Forced-choice ranking', desc: '30 triplets spanning all 20 three-domain combinations. Rank three statements from most to least like you. Weighted at 30% of the composite score to suppress acquiescence and impression-management bias that Likert scales can\'t catch.' },
      { step: 3, title: 'Module 3 — Values & Attachment', desc: '10 Schwartz values items rated by importance (Achievement, Benevolence, Self-Direction, Universalism, and six more) plus a 6-item attachment brief screen yielding Secure, Preoccupied, Dismissing, or Fearful-Avoidant orientation.' },
      { step: 4, title: 'Scoring', desc: 'All scoring is local — nothing leaves your browser. Likert items are reverse-scored where needed. HEXACO+FC composite converts to T-scores (M=50, SD=10) and population percentiles across all 24 facets. Values ranked by importance. Attachment classified on a 2-axis anxiety×avoidance model.' },
      { step: 5, title: 'Results', desc: 'Profile Type (15 archetypes by top-2 HEXACO domains), Facet Highlights (top and bottom 3 across all 24 facets), radar chart, domain narratives, Relationship Profile, Under Pressure (shadow tendencies), Career Domain Fit (8 domains), Attachment Style narrative, Cosmic Profile (sun sign, Chinese zodiac + element, Life Path, Expression, Soul Urge, Personality Number, Maturity Number, Personal Year), and Values×Personality cross-reference.' },
    ],

    features: [
      '142 items across 3 modules — HEXACO, forced-choice, values, and attachment',
      'HEXACO six-factor model — 96 novel items across 6 domains and 24 facets',
      '30 forced-choice triplets — full coverage of all 20 three-domain combinations',
      'Schwartz 10 Basic Human Values hierarchy — what you want, not just who you are',
      'Attachment style classification — Secure / Preoccupied / Dismissing / Fearful-Avoidant',
      '15 profile archetypes keyed by your top-2 HEXACO domains',
      'Shadow / Under Pressure profile — stress-response patterns derived from domain extremes',
      'Career Domain Fit — 8 domains rated from established occupational personality correlates',
      'Relationship Profile — emotional availability, conflict style, trust, social energy',
      'Cosmic Profile — sun sign, Chinese zodiac, 5 Pythagorean numerology numbers',
      'Keyboard navigation — press 1–5 to answer, auto-scroll to next item',
      'Fully client-side — no data transmitted, no accounts, no tracking',
    ],

    links: {
      download:    null,
      chromeStore: null,
      github:      'https://github.com/SeldomSought/Psychometrics-Assessment-Battery',
      website:     null,
      demo:        'projects/psychometrics-battery/index.html',
      demoLabel:   'Take Assessment',
      demoSameTab: true,
    },

    lastUpdated: 'Mar 2026',
  },

  {
    id: 'curated-feed',
    name: 'Curated Feed',
    tagline: 'An Instagram archive sequenced by hue — not time.',
    excerpt: 'Every post from @seldomsought arranged by color to create a continuous shifting gradient across the feed. Photography, found objects, and everyday moments choreographed as a single chromatic journey.',
    status: 'Live',
    platforms: ['Photography', 'Curation', 'Instagram'],
    icon: null,

    screenshots: [],

    problem: `Instagram orders content by time. That's the wrong axis for a curated aesthetic account. Chronological sorting shows you individual moments — it hides the thing that makes a deliberately built feed worth studying: the color story, the eye behind it, the gradual shift in tone and mood across hundreds of posts.`,

    solution: `Every post from @seldomsought has been sequenced not by date, but by color — arranged so the feed drifts continuously across the spectrum. Muted interior photography flows into botanical greens, into warm amber, into deep evening shadow, into chalk and linen. The grid becomes a gradient. The archive becomes an argument about what it means to look at the world with intention.`,

    howItWorks: [
      { step: 1, title: 'Post by post', desc: 'Each image was individually evaluated for its dominant hue and tonal weight — warm, cool, saturated, desaturated, light, dark.' },
      { step: 2, title: 'Color sequencing', desc: 'Posts were manually ordered to create smooth transitions between neighboring images in the grid, avoiding jarring jumps in hue or luminosity.' },
      { step: 3, title: 'Grid geometry', desc: 'Instagram\'s 3-column grid means each row of three images must work as a visual unit, and each image must also read well adjacent to its vertical neighbors.' },
      { step: 4, title: 'Ongoing curation', desc: 'New posts are placed where they fit the gradient, not when they were taken. Content is subordinate to composition.' },
    ],

    features: [
      'Manually sequenced — every transition hand-evaluated, no algorithm',
      'Three-column grid geometry preserved from the live Instagram feed',
      'Photography spans interiors, botanicals, objects, landscape, and texture',
    ],

    links: {
      download:    null,
      chromeStore: null,
      github:      null,
      website:     'https://www.instagram.com/seldomsought',
      demo:        null,
    },

    lastUpdated: 'Mar 2026',
  },

  {
    id: 'bookmark-mirror',
    name: 'Bookmark Mirror',
    tagline: 'Your bookmarks are a fingerprint. This reads it.',
    excerpt: 'A Chrome extension that scrapes your Twitter/X bookmarks and generates a deep psychological profile — completely offline. Big Five personality traits, Schwartz values, LIWC linguistic analysis, cognitive style, topic velocity, and more. No API key, no server, no data leaving your device.',
    status: 'Beta',
    platforms: ['Chrome Extension', 'Twitter / X', 'Psychometrics'],
    icon: null,

    screenshots: [],

    problem: `What you save is more revealing than what you say. Bookmarks are unperformed — you're not curating for an audience when you hit that button at 1 AM. They're an unguarded record of what actually caught your attention: the ideas that made you pause, the arguments you wanted to revisit, the things that resonated before you had words for why.

Most people have hundreds of them and have never examined the pattern. Twitter offers no analysis. Third-party tools require API access, OAuth, account permissions, and trust in a server somewhere that now holds a map of your interior life.`,

    solution: `Bookmark Mirror runs entirely inside your browser. It injects a content script into your bookmarks page, scrolls through everything you've saved, and extracts structured data locally — no API, no login, no server call. The inference engine then runs a multi-dimensional psychological analysis directly in the extension's service worker and writes the result to IndexedDB, where it stays on your device.

The analysis is grounded in validated psychometric frameworks: Big Five (OCEAN) personality traits inferred from topic patterns and behavioral signals, Schwartz Basic Human Values clustered across four higher-order dimensions, and a LIWC-inspired linguistic profile that scores your analytical thinking, authenticity, cognitive complexity, and emotional tone from the words in the content you chose to save.

The result isn't a personality quiz. It's a mirror.`,

    howItWorks: [
      {
        step: 1,
        title: 'Install and open bookmarks',
        desc: 'Load the unpacked extension in Chrome. Click the popup and hit "Analyze My Bookmarks." The extension opens your Twitter/X bookmarks tab.',
      },
      {
        step: 2,
        title: 'Self-driving scraper',
        desc: 'A content script injects into the bookmarks page and runs its own capture loop — scrolling, expanding truncated text, extracting tweet text, author, timestamp, engagement metrics, view counts, media, links, hashtags, quoted tweets, and pronouns. A port keepalive resists Chrome\'s background tab throttling.',
      },
      {
        step: 3,
        title: 'Real-time inference',
        desc: 'Batches of bookmarks stream to the service worker as they\'re captured. An inference engine classifies each tweet across a 23-topic taxonomy, accumulates psycholinguistic signals, and builds temporal, author, and vocabulary profiles incrementally.',
      },
      {
        step: 4,
        title: 'Deep analysis on completion',
        desc: 'When scraping finishes, the engine runs full psychometric analysis: Big Five (OCEAN) personality inference, Schwartz Values profiling, LIWC linguistic dimensions, cognitive style, emotional landscape, intellectual character, social orientation, hidden patterns, blind spots, and topic velocity.',
      },
      {
        step: 5,
        title: 'Profile rendered locally',
        desc: 'Results are saved to IndexedDB and a full-page profile opens automatically. Everything is rendered client-side from data that never left your browser.',
      },
    ],

    features: [
      'Fully offline — no API key, no OAuth, no server, no data transmission',
      'Big Five (OCEAN) personality profile — inferred from topic patterns and behavioral signals',
      'Schwartz (1992) Basic Human Values — four higher-order motivational clusters',
      'LIWC-inspired linguistic profile — analytical thinking, clout, authenticity, cognitive complexity, emotional tone',
      'Topic velocity — which interests are rising or fading over your bookmark history',
      '23-topic taxonomy with weighted keyword matching and Shannon entropy diversity scoring',
      'Cognitive style (8 dimensions), emotional landscape, intellectual character, social orientation',
      'Hidden pattern detection: night mind, niche hunter, single-author dependency, question collector',
      'Blind spot identification across 8 psychological domains',
      'Archetype assignment from 11 archetypes based on convergence of psychometric dimensions',
      'Temporal rhythm: hourly distribution chart, peak hour/day, time persona, trend',
      'Author profiling: trust concentration, loyalty vs. exploration, authority bias',
      'Vocabulary analysis: richness, word cloud, hashtag frequency, top mentions',
      'Hash-based deduplication — robust across slow loads and repeated scrolls',
      'Port keepalive architecture for reliable operation in background tabs',
    ],

    links: {
      download:    'projects/bookmark-mirror/bookmark-mirror.zip',
      chromeStore: null,
      github:      'https://github.com/SeldomSought/Twitter-bookmark-analyzer',
      website:     null,
      demo:        null,
    },

    lastUpdated: 'Mar 2026',
  },

  // ─── Add your next project here ─────────────────────────────────────────────
  // {
  //   id: 'your-project-id',        // URL-safe, lowercase, hyphenated
  //   name: 'Your Project Name',
  //   tagline: 'One line. What it does and for whom.',
  //   excerpt: 'Two to three sentences for the card view.',
  //   status: 'Beta',               // 'Live' | 'Beta' | 'Private'
  //   platforms: ['Chrome Extension'],
  //   icon: 'assets/your-project-icon.svg',
  //   screenshots: [],
  //   problem: `...`,
  //   solution: `...`,
  //   howItWorks: [
  //     { step: 1, title: '...', desc: '...' },
  //   ],
  //   features: ['...'],
  //   links: { chromeStore: null, github: null, website: null, demo: null },
  //   lastUpdated: 'Feb 2026',
  // },
];
