// All tuneable numbers. Change here, applies everywhere automatically.
export const LIMITS = {
  MAX_VOICE_SECONDS:    30,
  VOICE_EXPIRE_HOURS:   24,
  MAX_MESSAGE_LENGTH:   500,
  MAX_POST_LENGTH:      1000,
  USERNAME_MIN_LENGTH:  3,
  USERNAME_MAX_LENGTH:  20,
  USERNAME_REGEX:       /^[a-zA-Z0-9_]+$/,
  FEED_PAGE_SIZE:       20,
} as const
