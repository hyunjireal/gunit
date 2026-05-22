export type MatchPresetItem = {
  id: string
  title: string
  description: string
  level: string[]
  distance: string[]
  distanceValue: number
  time: string[]
  weekdays: string[]
  playStyle: string[]
  gameTone: string[]
  teamwork: string[]
  priority: string[]
  purpose: string[]
  isCustom?: boolean
}

const MATCH_PRESETS_KEY = 'airsoft:match-presets'
const MATCH_APPLIED_PRESET_KEY = 'airsoft:match-applied-preset'
export const BEGINNER_MATCH_PRESET_ID = 'beginner'
export const VETERAN_MATCH_PRESET_ID = 'weekend'

export const defaultMatchPresets: MatchPresetItem[] = [
  {
    id: 'beginner',
    title: '초보 입문자',
    description: '입문하는 플레이어를 위한\n부담 없는 초보형 프리셋',
    level: ['초보'],
    distance: ['근거리'],
    distanceValue: 10,
    time: ['전체'],
    weekdays: ['일', '토'],
    playStyle: ['개인 플레이', '용병'],
    gameTone: ['캐주얼', '실력 향상'],
    teamwork: ['솔플/자유'],
    priority: ['안전', '매너', '즐거움'],
    purpose: ['실력 향상', '스트레스 해소', '취미'],
  },
  {
    id: 'weekend',
    title: '주말 캐주얼',
    description: '주말 위주로 가볍게 즐기는\n부담 없는 캐주얼 프리셋',
    level: ['초보'],
    distance: ['근거리'],
    distanceValue: 10,
    time: ['주간'],
    weekdays: ['일', '토'],
    playStyle: ['개인 플레이'],
    gameTone: ['캐주얼'],
    teamwork: ['솔플/자유'],
    priority: ['안전', '매너', '즐거움'],
    purpose: ['친목', '취미'],
  },
  {
    id: 'team',
    title: '팀플 선호',
    description: '팀원과 협동하며 움직이는\n팀 중심 플레이 프리셋',
    level: ['중급'],
    distance: ['중거리'],
    distanceValue: 25,
    time: ['전체'],
    weekdays: ['토'],
    playStyle: ['팀 플레이'],
    gameTone: ['전술', '경쟁'],
    teamwork: ['팀플/협동'],
    priority: ['매너', '경쟁'],
    purpose: ['실력 향상', '대회/경쟁'],
  },
  {
    id: 'cqb',
    title: 'CQB 선호',
    description: '근거리 교전을 즐기는\n실내 CQB 중심 프리셋',
    level: ['중급'],
    distance: ['근거리'],
    distanceValue: 10,
    time: ['야간'],
    weekdays: ['금', '토'],
    playStyle: ['개인 플레이'],
    gameTone: ['속도감', '스릴'],
    teamwork: ['솔플/자유'],
    priority: ['장비', '스릴'],
    purpose: ['스트레스 해소', '취미'],
  },
]

const createFallbackPreset = (): MatchPresetItem => ({
  id: createMatchPresetId(),
  title: '새 프리셋',
  description: '내 플레이 취향에 맞춰 저장해둘래요',
  level: ['초보'],
  distance: ['근거리'],
  distanceValue: 10,
  time: ['전체'],
  weekdays: ['일', '토'],
  playStyle: ['개인 플레이', '용병'],
  gameTone: ['캐주얼', '실력 향상'],
  teamwork: ['솔플/자유'],
  priority: ['안전', '매너', '즐거움'],
  purpose: ['실력 향상', '스트레스 해소', '취미'],
  isCustom: true,
})

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function normalizePreset(value: unknown): MatchPresetItem | null {
  if (!value || typeof value !== 'object') return null

  const preset = value as Partial<MatchPresetItem>
  if (typeof preset.id !== 'string' || typeof preset.title !== 'string') return null

  const fallback = createFallbackPreset()

  return {
    id: preset.id,
    title: preset.title,
    description: typeof preset.description === 'string' ? preset.description : '',
    level: isStringArray(preset.level) ? preset.level : fallback.level,
    distance: isStringArray(preset.distance) ? preset.distance : fallback.distance,
    distanceValue: typeof preset.distanceValue === 'number' ? preset.distanceValue : fallback.distanceValue,
    time: isStringArray(preset.time) ? preset.time : fallback.time,
    weekdays: isStringArray(preset.weekdays) ? preset.weekdays : fallback.weekdays,
    playStyle: isStringArray(preset.playStyle) ? preset.playStyle : fallback.playStyle,
    gameTone: isStringArray(preset.gameTone) ? preset.gameTone : fallback.gameTone,
    teamwork: isStringArray(preset.teamwork) ? preset.teamwork : fallback.teamwork,
    priority: isStringArray(preset.priority) ? preset.priority : fallback.priority,
    purpose: isStringArray(preset.purpose) ? preset.purpose : fallback.purpose,
    isCustom: Boolean(preset.isCustom),
  }
}

export function createMatchPresetId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `custom-${crypto.randomUUID()}`
  }

  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function readMatchPresets() {
  const fallback = defaultMatchPresets.map((preset) => ({ ...preset }))

  try {
    const savedValue = localStorage.getItem(MATCH_PRESETS_KEY)
    if (!savedValue) return fallback

    const parsedValue = JSON.parse(savedValue)
    if (!Array.isArray(parsedValue)) return fallback

    return parsedValue.map(normalizePreset).filter(Boolean) as MatchPresetItem[]
  } catch {
    return fallback
  }
}

export function writeMatchPresets(presets: MatchPresetItem[]) {
  localStorage.setItem(MATCH_PRESETS_KEY, JSON.stringify(presets))
  window.dispatchEvent(new StorageEvent('storage', { key: MATCH_PRESETS_KEY, newValue: JSON.stringify(presets) }))
}

export function findMatchPreset(presetId: string) {
  return readMatchPresets().find((preset) => preset.id === presetId)
}

export function upsertMatchPreset(preset: MatchPresetItem) {
  const presets = readMatchPresets()
  const nextPresets = presets.some((item) => item.id === preset.id)
    ? presets.map((item) => (item.id === preset.id ? preset : item))
    : [preset, ...presets]

  writeMatchPresets(nextPresets)
}

export function deleteMatchPreset(presetId: string) {
  writeMatchPresets(readMatchPresets().filter((preset) => preset.id !== presetId))
}

function readDefaultAppliedMatchPresetId() {
  const profileBadge = localStorage.getItem('homeProfileBadge')
  const level = localStorage.getItem('level') ?? ''
  const skillAlias = localStorage.getItem('skillAlias') ?? ''

  const isVeteran =
    profileBadge === 'badge03' ||
    level.includes('숙련') ||
    skillAlias.includes('베테랑')

  if (isVeteran) {
    return VETERAN_MATCH_PRESET_ID
  }

  const isBeginner =
    profileBadge === 'symbol_beginner' ||
    level.includes('입문') ||
    level.includes('초보') ||
    skillAlias.includes('뉴비')

  return isBeginner ? BEGINNER_MATCH_PRESET_ID : VETERAN_MATCH_PRESET_ID
}

export function readAppliedMatchPresetId() {
  return localStorage.getItem(MATCH_APPLIED_PRESET_KEY) || readDefaultAppliedMatchPresetId()
}

export function writeAppliedMatchPresetId(presetId: string) {
  localStorage.setItem(MATCH_APPLIED_PRESET_KEY, presetId)
  window.dispatchEvent(new StorageEvent('storage', { key: MATCH_APPLIED_PRESET_KEY, newValue: presetId }))
}
