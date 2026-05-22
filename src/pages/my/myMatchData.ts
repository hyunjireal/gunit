import matchList01 from '../../asset/images/match_list01.jpg'
import matchList02 from '../../asset/images/match_list02.jpg'
import matchList03 from '../../asset/images/match_list03.jpg'
import { matches } from '../../data/mockData'
import { findGeneratedMatchSchedule } from '../match/generatedMatchSchedules'
import { readMatchSnapshots } from '../match/matchApplicationStorage'

export type MyMatchStatus = 'applied' | 'confirmed' | 'past'
export type MyMatchType = 'personal' | 'team' | 'mercenary'

export type MyMatchItem = {
  id: string
  matchId: string
  status: MyMatchStatus
  type: MyMatchType
  title: string
  dateValue?: string
  time: string
  detail: string
  region: string
  fieldName: string
  currentParticipants: number
  maxParticipants: number
  imageSrc: string
  tagLabel: string
  to: string
  isMine?: boolean
}

const JOINED_MATCH_IDS_KEY = 'joinedMatchIds'
const CANCELED_MATCH_IDS_KEY = 'airsoft:canceled-match-ids'
const CREATED_MATCHES_KEY = 'airsoft:created-matches'
const ONE_DAY_MS = 24 * 60 * 60 * 1000

type DefaultMyMatchTemplate = {
  id: string
  matchId: string
  status: Extract<MyMatchStatus, 'applied' | 'confirmed'>
  type: MyMatchType
  title: string
  offsetDays: number
  time: string
  region: string
  fieldName: string
  currentParticipants: number
  maxParticipants: number
  imageSrc: string
  to: string
}

const defaultMyMatchTemplates: DefaultMyMatchTemplate[] = [
  {
    id: 'seed-applied-001',
    matchId: 'match-003',
    status: 'applied',
    type: 'personal',
    title: '서울 CQB 입문 스크림',
    offsetDays: 2,
    time: '12:00',
    region: '서울',
    fieldName: '어반 CQB',
    currentParticipants: 14,
    maxParticipants: 16,
    imageSrc: matchList01,
    to: '/match/detail/match-003',
  },
  {
    id: 'seed-applied-002',
    matchId: 'match-002',
    status: 'applied',
    type: 'team',
    title: '주말 포레스트 매치',
    offsetDays: 5,
    time: '10:30',
    region: '경기 북부',
    fieldName: '포레스트 아레나',
    currentParticipants: 22,
    maxParticipants: 30,
    imageSrc: matchList02,
    to: '/match/detail/match-002',
  },
  {
    id: 'seed-confirmed-001',
    matchId: 'match-001',
    status: 'confirmed',
    type: 'personal',
    title: '초보 환영 야외전',
    offsetDays: 9,
    time: '14:00',
    region: '경기 남부',
    fieldName: '택티컬 필드',
    currentParticipants: 18,
    maxParticipants: 24,
    imageSrc: matchList03,
    to: '/match/detail/match-001',
  },
  {
    id: 'seed-confirmed-002',
    matchId: 'match-005',
    status: 'confirmed',
    type: 'team',
    title: '수도권 팀 전술 정규전',
    offsetDays: 11,
    time: '09:30',
    region: '경기 고양',
    fieldName: '블랙아웃 아레나',
    currentParticipants: 26,
    maxParticipants: 30,
    imageSrc: matchList02,
    to: '/match/detail/match-005',
  },
  {
    id: 'seed-confirmed-003',
    matchId: 'match-006',
    status: 'confirmed',
    type: 'personal',
    title: '야간 CQB 라이트 매치',
    offsetDays: 16,
    time: '19:00',
    region: '서울 강서',
    fieldName: '나이트 CQB 돔',
    currentParticipants: 12,
    maxParticipants: 16,
    imageSrc: matchList01,
    to: '/match/detail/match-006',
  },
  {
    id: 'seed-confirmed-004',
    matchId: 'match-007',
    status: 'confirmed',
    type: 'mercenary',
    title: '용병 합류 오픈 필드전',
    offsetDays: 23,
    time: '13:30',
    region: '인천 송도',
    fieldName: '델타 포스트 필드',
    currentParticipants: 20,
    maxParticipants: 24,
    imageSrc: matchList03,
    to: '/match/detail/match-007',
  },
  {
    id: 'seed-applied-003',
    matchId: 'match-004',
    status: 'applied',
    type: 'personal',
    title: '입문자 장비 체크 매치',
    offsetDays: 13,
    time: '16:00',
    region: '인천',
    fieldName: '서구 실내 필드',
    currentParticipants: 10,
    maxParticipants: 18,
    imageSrc: matchList01,
    to: '/match/detail/match-004',
  },
]

const defaultPastMatchTemplate: DefaultMyMatchTemplate = {
  id: 'seed-past-001',
  matchId: 'seed-past-001',
  status: 'confirmed',
  type: 'personal',
  title: '최근 완료한 입문전',
  offsetDays: -4,
  time: '10:00',
  region: '경기 하남',
  fieldName: '하남 실내 필드',
  currentParticipants: 12,
  maxParticipants: 12,
  imageSrc: matchList01,
  to: '/my/schedule',
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function getTodayStart() {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function normalizeDateValue(value?: string) {
  const matchedDate = value?.trim().replaceAll('.', '-').match(/(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (!matchedDate) return undefined

  const [, year, month, day] = matchedDate
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function formatDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDateLabel(dateValue: string) {
  return dateValue.replaceAll('-', '.')
}

function normalizeTimeValue(value?: string) {
  const matchedTime = value?.match(/(\d{1,2}):(\d{2})/)
  if (!matchedTime) return '00:00'

  const [, hour, minute] = matchedTime
  return `${hour.padStart(2, '0')}:${minute}`
}

function getDaysUntil(dateValue?: string) {
  const normalizedDate = normalizeDateValue(dateValue)
  if (!normalizedDate) return 0

  const date = new Date(`${normalizedDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return 0

  return Math.ceil((date.getTime() - getTodayStart().getTime()) / ONE_DAY_MS)
}

function getStatusByDate(dateValue: string, fallbackStatus: Extract<MyMatchStatus, 'applied' | 'confirmed'>) {
  return getDaysUntil(dateValue) < 0 ? 'past' : fallbackStatus
}

function getTagLabel(dateValue?: string) {
  const daysUntil = getDaysUntil(dateValue)
  if (daysUntil < 0) return '완료'
  if (daysUntil === 0) return 'D-DAY'
  return `D-${daysUntil}`
}

function createDetail(dateValue: string, time: string, fieldName: string) {
  const [, month, day] = dateValue.split('-')
  return `${Number(month)}/${Number(day)} ${time} I ${fieldName}`
}

function readStringList(key: string) {
  if (!canUseLocalStorage()) return []

  try {
    const value = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

function createDefaultMatch(template: DefaultMyMatchTemplate): MyMatchItem {
  const dateValue = formatDateValue(addDays(getTodayStart(), template.offsetDays))

  return {
    id: template.id,
    matchId: template.matchId,
    status: getStatusByDate(dateValue, template.status),
    type: template.type,
    title: template.title,
    dateValue,
    time: `${formatDateLabel(dateValue)} · ${template.time}`,
    detail: createDetail(dateValue, template.time, template.fieldName),
    region: template.region,
    fieldName: template.fieldName,
    currentParticipants: template.currentParticipants,
    maxParticipants: template.maxParticipants,
    imageSrc: template.imageSrc,
    tagLabel: getTagLabel(dateValue),
    to: template.to,
  }
}

function createDefaultMyMatches() {
  return [...defaultMyMatchTemplates, defaultPastMatchTemplate].map(createDefaultMatch)
}

function readCreatedMatches(): MyMatchItem[] {
  if (!canUseLocalStorage()) return []

  try {
    const value = JSON.parse(localStorage.getItem(CREATED_MATCHES_KEY) ?? '[]')
    if (!Array.isArray(value)) return []

    return value
      .filter((match) => match && typeof match === 'object' && typeof match.id === 'string')
      .map((match): MyMatchItem => {
        const type: MyMatchType = match.type === 'team' || match.type === 'mercenary' ? match.type : 'personal'
        const imageSrc =
          typeof match.imageSrc === 'string' && match.imageSrc
            ? match.imageSrc
            : type === 'team'
              ? matchList02
              : type === 'mercenary'
                ? matchList03
                : matchList01
        const rawDate = normalizeDateValue(typeof match.date === 'string' ? match.date : undefined) ?? formatDateValue(addDays(getTodayStart(), 2))
        const time = normalizeTimeValue(typeof match.time === 'string' ? match.time : undefined)
        const region = typeof match.region === 'string' ? match.region : '서울'
        const fieldName = typeof match.fieldName === 'string' ? match.fieldName : '어반 CQB'
        const title = typeof match.title === 'string' ? match.title : '내가 만든 매치'

        return {
          id: `created-${match.id}`,
          matchId: match.id,
          status: getStatusByDate(rawDate, 'applied'),
          type,
          title,
          dateValue: rawDate,
          time: `${formatDateLabel(rawDate)} · ${time}`,
          detail: createDetail(rawDate, time, fieldName),
          region,
          fieldName,
          currentParticipants: Number(match.currentParticipants) || 1,
          maxParticipants: Number(match.maxParticipants) || 12,
          imageSrc,
          tagLabel: getTagLabel(rawDate),
          to: '/my/schedule',
          isMine: true,
        }
      })
  } catch {
    return []
  }
}

function createJoinedMatches(canceledIds: string[], existingMatchIds: string[]) {
  return readStringList(JOINED_MATCH_IDS_KEY)
    .filter((id) => !canceledIds.includes(id) && !existingMatchIds.includes(id))
    .map((matchId) => matches.find((match) => match.id === matchId) ?? findGeneratedMatchSchedule(matchId))
    .filter((match): match is NonNullable<typeof match> => Boolean(match))
    .map((match): MyMatchItem => {
      const dateValue = normalizeDateValue(match.dateValue ?? match.date) ?? formatDateValue(addDays(getTodayStart(), 2))
      const time = normalizeTimeValue(match.time)

      return {
        id: `joined-${match.id}`,
        matchId: match.id,
        status: getStatusByDate(dateValue, 'applied'),
        type: 'type' in match && (match.type === 'team' || match.type === 'mercenary') ? match.type : 'personal',
        title: match.title,
        dateValue,
        time: `${formatDateLabel(dateValue)} · ${time}`,
        detail: createDetail(dateValue, time, match.fieldName),
        region: match.region,
        fieldName: match.fieldName,
        currentParticipants: match.currentParticipants,
        maxParticipants: match.maxParticipants,
        imageSrc: 'imageSrc' in match && match.imageSrc ? match.imageSrc : matchList01,
        tagLabel: getTagLabel(dateValue),
        to: `/match/detail/${match.id}`,
      }
    })
}

function createStoredJoinedMatches(canceledIds: string[], existingMatchIds: string[]) {
  const joinedIds = readStringList(JOINED_MATCH_IDS_KEY).filter(
    (id) => !canceledIds.includes(id) && !existingMatchIds.includes(id),
  )
  const defaultItems = createJoinedMatches(canceledIds, existingMatchIds)
  const defaultIds = new Set(defaultItems.map((match) => match.matchId))
  const snapshotItems = readMatchSnapshots(joinedIds)
    .filter((match) => !defaultIds.has(match.id))
    .map((match): MyMatchItem => {
      const dateValue = normalizeDateValue(match.dateValue ?? match.date) ?? formatDateValue(addDays(getTodayStart(), 2))
      const time = normalizeTimeValue(match.time)

      return {
        id: `joined-${match.id}`,
        matchId: match.id,
        status: getStatusByDate(dateValue, 'applied'),
        type: match.type === 'team' || match.type === 'mercenary' ? match.type : 'personal',
        title: match.title,
        dateValue,
        time: `${formatDateLabel(dateValue)} · ${time}`,
        detail: createDetail(dateValue, time, match.fieldName),
        region: match.region,
        fieldName: match.fieldName,
        currentParticipants: match.currentParticipants,
        maxParticipants: match.maxParticipants,
        imageSrc: match.imageSrc || matchList01,
        tagLabel: getTagLabel(dateValue),
        to: `/match/detail/${match.id}`,
      }
    })

  return [...defaultItems, ...snapshotItems]
}

export function getMyMatches() {
  const canceledIds = readStringList(CANCELED_MATCH_IDS_KEY)
  const joinedIds = readStringList(JOINED_MATCH_IDS_KEY)
  const baseMatches = createDefaultMyMatches()
    .filter((match) => !canceledIds.includes(match.matchId))
    .map((match) =>
      joinedIds.includes(match.matchId) && match.status !== 'past'
        ? { ...match, id: `joined-${match.matchId}`, status: 'applied' as const }
        : match,
    )
  const joinedMatches = createStoredJoinedMatches(
    canceledIds,
    baseMatches.map((match) => match.matchId),
  )
  const createdMatches = readCreatedMatches()

  return [...baseMatches, ...joinedMatches, ...createdMatches].sort((a, b) => {
    const aTime = new Date(`${a.dateValue ?? '9999-12-31'}T${normalizeTimeValue(a.time)}:00`).getTime()
    const bTime = new Date(`${b.dateValue ?? '9999-12-31'}T${normalizeTimeValue(b.time)}:00`).getTime()
    return aTime - bTime
  })
}

export function getMyMatchGroups() {
  const all = getMyMatches()
  const applied = all.filter((match) => match.status === 'applied')
  const confirmed = all.filter((match) => match.status === 'confirmed')
  const past = all.filter((match) => match.status === 'past')
  const created = all.filter((match) => match.isMine)

  return {
    all,
    applied,
    confirmed,
    past,
    created,
  }
}
