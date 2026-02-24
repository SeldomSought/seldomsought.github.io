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
    excerpt: 'A Chrome extension that limits passive feed consumption to 30 minutes per day while keeping your bookmarks, saved posts, and creation tools always accessible.',
    status: 'Beta',
    platforms: ['Chrome Extension', 'Twitter / X', 'Instagram', 'YouTube'],
    icon: 'assets/focus-shield-icon.svg',

    // Drop in screenshot paths when ready. Leave empty to hide the section.
    screenshots: [
      // 'assets/focus-shield-screen-1.png',
      // 'assets/focus-shield-screen-2.png',
    ],

    problem: `Social platforms are engineered for passive consumption — not for you, but for them. The average person scrolls far more than they intend to, and the posts they actually saved to revisit get buried, forgotten, and never seen again. Bookmarks become a graveyard. Attention becomes a resource extracted rather than deployed.`,

    solution: `Focus Shield enforces a 30-minute daily limit on feed consumption. Outside that window, the feed is blocked — but bookmarks, saved posts, and all creation tools remain fully accessible. The extension reframes your saved content as your curated feed: the one feed worth consuming. It converts a passive habit into an intentional practice, and nudges platforms toward the thing they were always better suited for — creation and connection, not endless scrolling.`,

    howItWorks: [
      {
        step: 1,
        title: 'Install',
        desc: 'Add Focus Shield from the Chrome Web Store. No account required.',
      },
      {
        step: 2,
        title: 'Budget starts',
        desc: 'A 30-minute daily scroll budget begins the moment you first open a feed. A subtle timer runs in the extension icon.',
      },
      {
        step: 3,
        title: 'Budget expires',
        desc: 'When time runs out, the live feed is replaced. You land on your Bookmarks and Saved posts instead — your curated content, finally surfaced.',
      },
      {
        step: 4,
        title: 'Creation stays open',
        desc: 'Post, reply, DM, comment — all of it remains available at all times. The limit is on consumption, not contribution.',
      },
      {
        step: 5,
        title: 'Reset at midnight',
        desc: 'Your 30-minute window refreshes each day. No streaks, no gamification. Just a daily boundary you can actually rely on.',
      },
    ],

    features: [
      '30-minute daily consumption budget — enforced, not suggested',
      'Bookmarks and saved posts always accessible, any time',
      'Post, reply, and create — always on, no restrictions',
      'Works across Twitter / X, Instagram, and YouTube',
      'Converts saved posts into a timeline you actually return to',
      'No account, no data collection, no subscriptions',
      'Nudges platforms toward creation and intentional learning',
    ],

    links: {
      chromeStore: null,   // e.g. 'https://chromewebstore.google.com/detail/...'
      github:      null,   // e.g. 'https://github.com/yourhandle/focus-shield'
      website:     null,   // e.g. 'https://focusshield.app'
      demo:        null,   // e.g. 'https://www.youtube.com/watch?v=...'
    },

    lastUpdated: 'Feb 2026',
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
