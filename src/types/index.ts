export type UserLevel = '입문자' | '초보' | '경험자' | '숙련자'

export interface User {
  id: string
  nickname: string
  level: UserLevel
  region: string
  hasTeam: boolean
  joinedMatchIds: string[]
  savedPostIds: string[]
}

export interface GuideCard {
  id: string
  title: string
  description: string
  route: string
  required: boolean
}

export interface MatchEvent {
  id: string
  title: string
  date: string
  dateValue?: string
  time: string
  region: string
  fieldName: string
  fieldAddress?: string
  difficulty: string
  beginnerFriendly: boolean
  rentalAvailable: boolean
  currentParticipants: number
  maxParticipants: number
  fee: string
  tags: string[]
  description: string
  organizerName?: string
  preparationItems?: string[]
  skillGuide?: string
  organizerNotice?: string
}

export interface Team {
  id: string
  name: string
  region: string
  memberCount: number
  style: string
  beginnerFriendly: boolean
  description: string
  recruiting: boolean
}

export interface MercenaryPost {
  id: string
  type: 'guestWanted' | 'lookingForTeam'
  title: string
  date: string
  region: string
  fieldName: string
  requiredLevel: string
  currentCount: number
  maxCount: number
  description: string
  tags: string[]
}

export interface BoardPost {
  id: string
  boardType: 'notice' | 'free' | 'review' | 'tip' | 'question'
  title: string
  content: string
  author: string
  createdAt: string
  category?: string
  tags: string[]
  commentsCount: number
  isBeginnerQuestion: boolean
}

export interface Tournament {
  id: string
  title: string
  date: string
  status: string
  description: string
}

export interface Highlight {
  id: string
  tournamentId: string
  title: string
  playerName: string
  teamName: string
  description: string
  votes: number
}
