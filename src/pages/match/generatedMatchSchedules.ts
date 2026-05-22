import matchList01 from '../../asset/images/match_list01.jpg'
import matchList02 from '../../asset/images/match_list02.jpg'
import matchList03 from '../../asset/images/match_list03.jpg'
import matchList04 from '../../asset/images/match_list04.jpg'
import matchList05 from '../../asset/images/match_list05.jpg'
import type { MatchApplicationSnapshot } from './matchApplicationStorage'

export type GeneratedMatchType = 'personal' | 'team' | 'mercenary'

export type GeneratedMatchSchedule = Omit<MatchApplicationSnapshot, 'date' | 'dateValue' | 'difficulty' | 'type'> & {
  type: GeneratedMatchType
  date: string
  dateValue: string
  difficulty: string
  action: string
  body?: string
}

const ROLLING_MATCH_WINDOW_DAYS = 21
const NEAR_MATCH_WINDOW_DAYS = 14
const MIN_ACTIVE_MATCH_DAYS = 8
const MAX_NEAR_ACTIVE_DAYS = 8

const timeSlots = ['09:30', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30']

const fieldTemplates = [
  {
    region: '서울',
    fieldName: '어반 CQB',
    imageSrc: matchList05,
  },
  {
    region: '경기 남부',
    fieldName: '택티쿨 필드',
    imageSrc: matchList01,
  },
  {
    region: '경기 북부',
    fieldName: '포레스트 아레나',
    imageSrc: matchList03,
  },
  {
    region: '인천',
    fieldName: '리버 필드',
    imageSrc: matchList02,
  },
  {
    region: '경기 동부',
    fieldName: '힐사이드 베이스',
    imageSrc: matchList04,
  },
]

const matchTemplates: Record<
  GeneratedMatchType,
  Array<{
    title: string
    difficulty: string
    minParticipants: number
    maxParticipants: number
    action: string
  }>
> = {
  personal: [
    { title: '입문자 환영 개인전', difficulty: '초보', minParticipants: 8, maxParticipants: 16, action: '상세 보기' },
    { title: '라이트 CQB 매치', difficulty: '입문자', minParticipants: 10, maxParticipants: 18, action: '상세 보기' },
    { title: '주말 캐주얼 개인전', difficulty: '초보 가능', minParticipants: 12, maxParticipants: 24, action: '상세 보기' },
  ],
  team: [
    { title: '팀 단위 전술 스크림', difficulty: '팀', minParticipants: 10, maxParticipants: 20, action: '상세 보기' },
    { title: '밸런스 팀 매치', difficulty: '중급', minParticipants: 12, maxParticipants: 24, action: '상세 보기' },
    { title: '주말 팀 로테이션', difficulty: '팀', minParticipants: 14, maxParticipants: 28, action: '상세 보기' },
  ],
  mercenary: [
    { title: '용병 조인 야외전', difficulty: '용병', minParticipants: 6, maxParticipants: 12, action: '참가 신청' },
    { title: '부족 인원 용병 모집', difficulty: '용병', minParticipants: 4, maxParticipants: 10, action: '참가 신청' },
    { title: '팀 합류 용병전', difficulty: '용병', minParticipants: 5, maxParticipants: 12, action: '참가 신청' },
  ],
}

function getStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(date.getDate() + days)
  return nextDate
}

function formatDateValue(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function createSeed(value: string) {
  let seed = 0

  for (let index = 0; index < value.length; index += 1) {
    seed = (seed * 31 + value.charCodeAt(index)) >>> 0
  }

  return seed || 1
}

function seededRandom(seed: number) {
  let value = seed >>> 0

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function pick<T>(items: T[], random: () => number) {
  return items[Math.floor(random() * items.length)]
}

function createFutureTimeSlots(date: Date, baseDate: Date) {
  if (getStartOfDay(date).getTime() !== getStartOfDay(baseDate).getTime()) {
    return timeSlots
  }

  return timeSlots.filter((time) => {
    const [hour, minute] = time.split(':').map(Number)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute).getTime() > baseDate.getTime()
  })
}

function createActiveDayOffsets(baseDate: Date) {
  const todayKey = formatDateValue(getStartOfDay(baseDate))
  const random = seededRandom(createSeed(`${todayKey}:active-match-days`))
  const offsets: number[] = []

  for (let dayOffset = 0; dayOffset <= ROLLING_MATCH_WINDOW_DAYS; dayOffset += 1) {
    const activeChance = dayOffset <= NEAR_MATCH_WINDOW_DAYS ? 0.46 : 0.38

    if (random() < activeChance) {
      offsets.push(dayOffset)
    }
  }

  while (offsets.filter((dayOffset) => dayOffset <= NEAR_MATCH_WINDOW_DAYS).length > MAX_NEAR_ACTIVE_DAYS) {
    const nearOffsets = offsets.filter((dayOffset) => dayOffset <= NEAR_MATCH_WINDOW_DAYS)
    const removeOffset = pick(nearOffsets, random)
    offsets.splice(offsets.indexOf(removeOffset), 1)
  }

  if (!offsets.some((dayOffset) => dayOffset > NEAR_MATCH_WINDOW_DAYS)) {
    offsets.push(NEAR_MATCH_WINDOW_DAYS + 1 + Math.floor(random() * (ROLLING_MATCH_WINDOW_DAYS - NEAR_MATCH_WINDOW_DAYS)))
  }

  while (offsets.length < MIN_ACTIVE_MATCH_DAYS) {
    const nextOffset = Math.floor(random() * (ROLLING_MATCH_WINDOW_DAYS + 1))

    const nearActiveCount = offsets.filter((dayOffset) => dayOffset <= NEAR_MATCH_WINDOW_DAYS).length
    const canAddNearOffset = nextOffset > NEAR_MATCH_WINDOW_DAYS || nearActiveCount < MAX_NEAR_ACTIVE_DAYS

    if (!offsets.includes(nextOffset) && canAddNearOffset) {
      offsets.push(nextOffset)
    }
  }

  return offsets.sort((a, b) => a - b)
}

export function createGeneratedMatchSchedules(baseDate = new Date()) {
  const today = getStartOfDay(baseDate)
  const schedules: GeneratedMatchSchedule[] = []
  const activeDayOffsets = createActiveDayOffsets(baseDate)

  activeDayOffsets.forEach((dayOffset) => {
    const date = addDays(today, dayOffset)
    const dateValue = formatDateValue(date)
    const random = seededRandom(createSeed(dateValue))
    const availableTimes = createFutureTimeSlots(date, baseDate)

    if (availableTimes.length === 0) {
      return
    }

    const countRoll = random()
    const count = countRoll > 0.82 ? 3 : countRoll > 0.42 ? 2 : 1
    const usedTimes = new Set<string>()

    for (let index = 0; index < count; index += 1) {
      const type = pick<GeneratedMatchType>(['personal', 'team', 'mercenary'], random)
      const field = pick(fieldTemplates, random)
      const template = pick(matchTemplates[type], random)
      const availableUnusedTimes = availableTimes.filter((time) => !usedTimes.has(time))
      const time = pick(availableUnusedTimes.length > 0 ? availableUnusedTimes : availableTimes, random)
      const maxParticipants = template.maxParticipants
      const currentParticipants = Math.min(
        maxParticipants - 1,
        template.minParticipants + Math.floor(random() * Math.max(1, maxParticipants - template.minParticipants)),
      )

      usedTimes.add(time)
      schedules.push({
        id: `auto-match-${dateValue.replaceAll('-', '')}-${index + 1}`,
        type,
        title: template.title,
        date: dateValue,
        dateValue,
        time,
        region: field.region,
        fieldName: field.fieldName,
        difficulty: template.difficulty,
        currentParticipants,
        maxParticipants,
        action: template.action,
        imageSrc: field.imageSrc,
        body: `${field.fieldName}에서 진행되는 ${template.title} 일정입니다.`,
      })
    }
  })

  return schedules
}

export function findGeneratedMatchSchedule(matchId?: string, baseDate = new Date()) {
  if (!matchId) return undefined

  return createGeneratedMatchSchedules(baseDate).find((match) => match.id === matchId)
}
