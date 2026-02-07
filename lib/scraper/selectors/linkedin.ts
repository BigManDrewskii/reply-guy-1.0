// LinkedIn DOM Selectors
// Reference: KartikayKaul/Yale3

export const LINKEDIN_SELECTORS = {
  // Profile basic info
  name: '.text-heading-xlarge',
  headline: '.text-body-medium.break-words',
  bio: '.pv-about__summary-text .lt-line-clamp__raw-line',
  location: '.text-body-small.inline.t-black--light',
  followers: '.t-black--light .t-bold',
  connections: '.pv-top-card--list-bullet li .t-bold',

  // Experience
  experienceItem: '.pvs-list__item--line-separated',
  experienceTitle: '.t-bold span',
  experienceCompany: '.t-14 span',

  // Posts
  post: '.feed-shared-update-v2',
  postText: '.feed-shared-update-v2__description',
  postTime: '.feed-shared-actor__sub-description',
  postLikes: '.social-details-social-counts__reactions-count',
  postComments: '.social-details-social-counts__comments',

  // Navigation
  navProfile: '.app-nav-bar__profile-menu',
} as const;

// Selector update log
export const SELECTOR_VERSION = '2025-02-07';
export const LAST_VERIFIED = '2025-02-07';
