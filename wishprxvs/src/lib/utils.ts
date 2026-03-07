import { UsernameVisibility } from '@/types'

// ─── Location data: flag + city/state label ──────────────────────────────────
// Each entry: [keywords[], flag, short location label]
const LOCATIONS: [string[], string, string][] = [
  [['dhaka'],                                              '🇧🇩', 'Dhaka'],
  [['chittagong','chattogram'],                            '🇧🇩', 'Chittagong'],
  [['sylhet'],                                             '🇧🇩', 'Sylhet'],
  [['rajshahi'],                                           '🇧🇩', 'Rajshahi'],
  [['bangladesh'],                                         '🇧🇩', 'BD'],
  [['new york','nyc'],                                     '🇺🇸', 'NY'],
  [['los angeles','la'],                                   '🇺🇸', 'LA'],
  [['chicago'],                                            '🇺🇸', 'Chicago'],
  [['houston'],                                            '🇺🇸', 'Houston'],
  [['miami'],                                              '🇺🇸', 'Miami'],
  [['california'],                                         '🇺🇸', 'CA'],
  [['texas'],                                              '🇺🇸', 'TX'],
  [['florida'],                                            '🇺🇸', 'FL'],
  [['usa','united states','america'],                      '🇺🇸', 'US'],
  [['london'],                                             '🇬🇧', 'London'],
  [['manchester'],                                         '🇬🇧', 'Manchester'],
  [['birmingham'],                                         '🇬🇧', 'Birmingham'],
  [['uk','united kingdom','england','britain','scotland','wales'], '🇬🇧', 'UK'],
  [['mumbai'],                                             '🇮🇳', 'Mumbai'],
  [['delhi','new delhi'],                                  '🇮🇳', 'Delhi'],
  [['bangalore','bengaluru'],                              '🇮🇳', 'Bangalore'],
  [['kolkata'],                                            '🇮🇳', 'Kolkata'],
  [['india'],                                              '🇮🇳', 'India'],
  [['karachi'],                                            '🇵🇰', 'Karachi'],
  [['lahore'],                                             '🇵🇰', 'Lahore'],
  [['islamabad'],                                          '🇵🇰', 'Islamabad'],
  [['pakistan'],                                           '🇵🇰', 'PK'],
  [['toronto'],                                            '🇨🇦', 'Toronto'],
  [['vancouver'],                                          '🇨🇦', 'Vancouver'],
  [['montreal'],                                           '🇨🇦', 'Montreal'],
  [['canada'],                                             '🇨🇦', 'Canada'],
  [['sydney'],                                             '🇦🇺', 'Sydney'],
  [['melbourne'],                                          '🇦🇺', 'Melbourne'],
  [['australia'],                                          '🇦🇺', 'AU'],
  [['berlin'],                                             '🇩🇪', 'Berlin'],
  [['munich'],                                             '🇩🇪', 'Munich'],
  [['germany'],                                            '🇩🇪', 'DE'],
  [['paris'],                                              '🇫🇷', 'Paris'],
  [['france'],                                             '🇫🇷', 'FR'],
  [['tokyo'],                                              '🇯🇵', 'Tokyo'],
  [['osaka'],                                              '🇯🇵', 'Osaka'],
  [['japan'],                                              '🇯🇵', 'JP'],
  [['beijing'],                                            '🇨🇳', 'Beijing'],
  [['shanghai'],                                           '🇨🇳', 'Shanghai'],
  [['china'],                                              '🇨🇳', 'CN'],
  [['dubai'],                                              '🇦🇪', 'Dubai'],
  [['abu dhabi'],                                          '🇦🇪', 'Abu Dhabi'],
  [['uae','united arab emirates'],                         '🇦🇪', 'UAE'],
  [['riyadh'],                                             '🇸🇦', 'Riyadh'],
  [['jeddah'],                                             '🇸🇦', 'Jeddah'],
  [['saudi arabia'],                                       '🇸🇦', 'KSA'],
  [['singapore'],                                          '🇸🇬', 'Singapore'],
  [['kuala lumpur','kl'],                                  '🇲🇾', 'KL'],
  [['malaysia'],                                           '🇲🇾', 'MY'],
  [['manila'],                                             '🇵🇭', 'Manila'],
  [['philippines'],                                        '🇵🇭', 'PH'],
  [['bangkok'],                                            '🇹🇭', 'Bangkok'],
  [['thailand'],                                           '🇹🇭', 'TH'],
  [['jakarta'],                                            '🇮🇩', 'Jakarta'],
  [['indonesia'],                                          '🇮🇩', 'ID'],
  [['istanbul'],                                           '🇹🇷', 'Istanbul'],
  [['turkey'],                                             '🇹🇷', 'TR'],
  [['cairo'],                                              '🇪🇬', 'Cairo'],
  [['egypt'],                                              '🇪🇬', 'EG'],
  [['lagos'],                                              '🇳🇬', 'Lagos'],
  [['nigeria'],                                            '🇳🇬', 'NG'],
  [['nairobi'],                                            '🇰🇪', 'Nairobi'],
  [['kenya'],                                              '🇰🇪', 'KE'],
  [['johannesburg'],                                       '🇿🇦', 'JHB'],
  [['cape town'],                                          '🇿🇦', 'Cape Town'],
  [['south africa'],                                       '🇿🇦', 'SA'],
  [['moscow'],                                             '🇷🇺', 'Moscow'],
  [['russia'],                                             '🇷🇺', 'RU'],
  [['seoul'],                                              '🇰🇷', 'Seoul'],
  [['south korea','korea'],                                '🇰🇷', 'KR'],
  [['sao paulo'],                                          '🇧🇷', 'São Paulo'],
  [['rio de janeiro'],                                     '🇧🇷', 'Rio'],
  [['brazil'],                                             '🇧🇷', 'BR'],
  [['buenos aires'],                                       '🇦🇷', 'Buenos Aires'],
  [['argentina'],                                          '🇦🇷', 'AR'],
  [['mexico city'],                                        '🇲🇽', 'CDMX'],
  [['mexico'],                                             '🇲🇽', 'MX'],
  [['madrid'],                                             '🇪🇸', 'Madrid'],
  [['barcelona'],                                          '🇪🇸', 'Barcelona'],
  [['spain'],                                              '🇪🇸', 'ES'],
  [['rome'],                                               '🇮🇹', 'Rome'],
  [['milan'],                                              '🇮🇹', 'Milan'],
  [['italy'],                                              '🇮🇹', 'IT'],
  [['amsterdam'],                                          '🇳🇱', 'Amsterdam'],
  [['netherlands'],                                        '🇳🇱', 'NL'],
  [['stockholm'],                                          '🇸🇪', 'Stockholm'],
  [['sweden'],                                             '🇸🇪', 'SE'],
  [['oslo'],                                               '🇳🇴', 'Oslo'],
  [['norway'],                                             '🇳🇴', 'NO'],
  [['zurich'],                                             '🇨🇭', 'Zurich'],
  [['switzerland'],                                        '🇨🇭', 'CH'],
  [['kyiv','kiev'],                                        '🇺🇦', 'Kyiv'],
  [['ukraine'],                                            '🇺🇦', 'UA'],
  [['tehran'],                                             '🇮🇷', 'Tehran'],
  [['iran'],                                               '🇮🇷', 'IR'],
]

// Returns { flag, city } e.g. { flag: '🇧🇩', city: 'Dhaka' }
export function getLocationInfo(address?: string): { flag: string; city: string } {
  if (!address) return { flag: '', city: '' }
  const lower = address.toLowerCase()
  for (const [keywords, flag, city] of LOCATIONS) {
    if (keywords.some(k => lower.includes(k))) return { flag, city }
  }
  return { flag: '🌍', city: '' }
}

// Legacy helper for settings preview
export function getCountryFlag(address?: string): string {
  return getLocationInfo(address).flag
}

// ─── Display name logic ───────────────────────────────────────────────────────
// Returns what to show for a post author: "@user 🇧🇩 Dhaka" or "Anonymous 🇧🇩 Dhaka"
export function resolveAuthorDisplay(
  authorUsername:   string,
  authorFlag:       string,
  authorCity:       string,
  authorVisibility: UsernameVisibility,
  isMutualFollow:   boolean,
): { label: string; isAnon: boolean } {
  let showUsername = false
  if (authorVisibility === 'public')  showUsername = true
  if (authorVisibility === 'friends') showUsername = isMutualFollow

  const location = [authorFlag, authorCity].filter(Boolean).join(' ')
  const suffix   = location ? ` ${location}` : ''

  if (showUsername) {
    return { label: `@${authorUsername}${suffix}`, isAnon: false }
  }
  return { label: `Anonymous${suffix}`, isAnon: true }
}

// ─── Time formatting ──────────────────────────────────────────────────────────
export function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}
