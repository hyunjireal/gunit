export type MatchApplicationSnapshot = {
  id: string
  type?: 'personal' | 'team' | 'mercenary'
  title: string
  date?: string
  dateValue?: string
  time: string
  region: string
  fieldName: string
  difficulty?: string
  currentParticipants: number
  maxParticipants: number
  imageSrc?: string
}

export const JOINED_MATCH_IDS_KEY = 'joinedMatchIds'
export const CANCELED_MATCH_IDS_KEY = 'airsoft:canceled-match-ids'
const MATCH_SNAPSHOT_KEY = 'airsoft:match-application-snapshots'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function readStringList(key: string) {
  if (!canUseStorage()) return []

  try {
    const value = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function writeStringList(key: string, value: string[]) {
  if (!canUseStorage()) return

  localStorage.setItem(key, JSON.stringify(Array.from(new Set(value))))
}

function readSnapshotMap() {
  if (!canUseStorage()) return {} as Record<string, MatchApplicationSnapshot>

  try {
    const value = JSON.parse(localStorage.getItem(MATCH_SNAPSHOT_KEY) ?? '{}')
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {} as Record<string, MatchApplicationSnapshot>
    }

    return value as Record<string, MatchApplicationSnapshot>
  } catch {
    return {} as Record<string, MatchApplicationSnapshot>
  }
}

function writeSnapshotMap(value: Record<string, MatchApplicationSnapshot>) {
  if (!canUseStorage()) return

  localStorage.setItem(MATCH_SNAPSHOT_KEY, JSON.stringify(value))
}

export function cacheMatchSnapshot(snapshot: MatchApplicationSnapshot) {
  if (!snapshot.id) return

  writeSnapshotMap({
    ...readSnapshotMap(),
    [snapshot.id]: snapshot,
  })
}

export function readMatchSnapshot(id?: string) {
  if (!id) return undefined

  return readSnapshotMap()[id]
}

export function readMatchSnapshots(ids: string[]) {
  const snapshots = readSnapshotMap()

  return ids.map((id) => snapshots[id]).filter((snapshot): snapshot is MatchApplicationSnapshot => Boolean(snapshot))
}

export function markMatchJoined(id: string) {
  const joinedIds = readStringList(JOINED_MATCH_IDS_KEY)
  const canceledIds = readStringList(CANCELED_MATCH_IDS_KEY)

  writeStringList(JOINED_MATCH_IDS_KEY, [...joinedIds, id])
  writeStringList(
    CANCELED_MATCH_IDS_KEY,
    canceledIds.filter((matchId) => matchId !== id),
  )
}

export function markMatchCanceled(id: string) {
  const joinedIds = readStringList(JOINED_MATCH_IDS_KEY)
  const canceledIds = readStringList(CANCELED_MATCH_IDS_KEY)

  writeStringList(
    JOINED_MATCH_IDS_KEY,
    joinedIds.filter((matchId) => matchId !== id),
  )
  writeStringList(CANCELED_MATCH_IDS_KEY, [...canceledIds, id])
}
