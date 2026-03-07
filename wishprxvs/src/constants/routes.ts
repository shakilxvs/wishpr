export const ROUTES = {
  HOME:         '/',
  SIGN_IN:      '/auth/signin',
  SIGN_UP:      '/auth/signup',
  DASHBOARD:    '/dashboard',
  FEED:         '/feed',
  INBOX:        '/inbox',
  SETTINGS:     '/settings',
  GROUPS:       '/groups',
  MESSAGES:     '/messages',
  GROUP:        (id: string)       => `/groups/${id}`,
  PROFILE:      (uid: string)      => `/u/${uid}`,
  SEND_MESSAGE: (slug: string)     => `/s/${slug}`,
} as const
