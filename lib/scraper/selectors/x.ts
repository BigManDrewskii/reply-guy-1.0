// X (Twitter) DOM Selectors
// Reference: OgnjenAdzic28/x-post-scraper-extension

export const X_SELECTORS = {
  // Profile basic info
  name: '[data-testid="UserName"] > div > div > span',
  handle: '[data-testid="UserName"] + div span',
  bio: '[data-testid="UserDescription"]',
  location: '[data-testid="UserLocation"]',
  website: '[data-testid="UserUrl"] a',
  followers: '[href$="/followers"] span',
  following: '[href$="/following"] span',
  verified: '[data-testid="icon-verified"]',

  // Posts
  tweets: '[data-testid="tweet"]',
  tweetText: '[data-testid="tweetText"]',
  tweetTime: 'time[datetime]',
  tweetLikes: '[data-testid="like"] span',
  tweetRetweets: '[data-testid="retweet"] span',

  // Navigation
  navHome: '[data-testid="AppTabBar_Home_Link"]',
  navProfile: '[data-testid="AppTabBar_Profile_Link"]',
} as const;

// Selector update log (for when X changes their DOM)
export const SELECTOR_VERSION = '2025-02-07';
export const LAST_VERIFIED = '2025-02-07';
