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
