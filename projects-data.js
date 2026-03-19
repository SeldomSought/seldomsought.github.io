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
    tagline: 'A research-grade personality assessment built from scratch — open methodology, no black boxes.',
    excerpt: 'A full HEXACO six-factor personality assessment with forced-choice ranking blocks. Novel, non-copyrighted items. Scores entirely in your browser — no data leaves your device.',
    status: 'Beta',
    platforms: ['Web App', 'Personality', 'Psychometrics'],
    icon: null,

    screenshots: [],

    problem: `Most personality assessments are either proprietary black boxes (you pay, get a label, never see the math) or academically inaccessible instruments locked behind licensing walls. The items are decades old, the scoring models are opaque, and the outputs are designed for HR departments rather than genuine self-knowledge.`,

    solution: `A ground-up psychometric battery using the HEXACO six-factor model — the most scientifically defensible personality framework available — with novel, non-copyrighted items written to modern standards. The assessment runs entirely in your browser with no data transmission. Scoring is transparent, reports are plain-language, and the full methodology is open on GitHub.

The battery includes: a 96-item HEXACO short-form across 6 domains and 24 facets; 10 forced-choice ranking blocks designed to suppress social desirability bias; and a full results dashboard with radar chart, percentile scores, facet-level breakdown, and an integrated profile narrative.`,

    howItWorks: [
      { step: 1, title: 'Module 1 — HEXACO personality', desc: '96 items, 8 per page. Rate each statement on a 1–5 scale from how accurately it describes you. Covers Honesty-Humility, Emotionality, eXtraversion, Agreeableness, Conscientiousness, and Openness.' },
      { step: 2, title: 'Module 2 — Forced-choice blocks', desc: '10 triplets. Rank three statements from most to least like you. Designed to detect and correct acquiescence and impression-management bias that standard Likert items can\'t catch.' },
      { step: 3, title: 'Scoring', desc: 'All scoring happens locally in your browser. Likert items are reverse-scored where needed. FC data is weighted at 30% of the composite. Scores convert to T-scores (M=50, SD=10) and approximate population percentiles.' },
      { step: 4, title: 'Results', desc: 'Radar chart across all 6 domains. Per-domain bar with percentile, T-score, band label, and a full narrative. Facet-level breakdown for all 24 facets. Integrated profile summary.' },
    ],

    features: [
      'HEXACO six-factor model — the most well-validated personality framework',
      '96 novel, non-copyrighted items — 4 per facet, 24 facets across 6 domains',
      '10 forced-choice triplets — acquiescence-resistant ranking format',
      'Fully client-side — no data transmitted, no accounts, no tracking',
      'Facet-level scores for all 24 facets, not just domain composites',
      'Radar chart + bar charts + integrated narrative report',
      'Full methodology and item bank open-sourced on GitHub',
    ],

    links: {
      download:    null,
      chromeStore: null,
      github:      'https://github.com/SeldomSought/Psychometrics-Assessment-Battery',
      website:     null,
      demo:        'projects/psychometrics-battery/index.html',
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
