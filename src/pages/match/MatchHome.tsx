import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { consumeMatchRegistrationToastPending, MatchRegistrationToast } from './MatchRegistrationToast'
import { MatchTypeSheet } from './MatchTypeSheet'
import AnimatedList from '../../components/AnimatedList'
import KeywordTag from '../../components/KeywordTag'
import MainTag from '../../components/MainTag'
import More from '../../components/More'
import { PageHeader } from '../../components/PageHeader'
import matchPlusIcon from '../../asset/icons/match_plus.svg'
import matchPresetIcon from '../../asset/icons/match_preset.svg'
import presetCheckIcon from '../../asset/icons/preset_check.svg'
import presetPlusIcon from '../../asset/icons/preset_plus.svg'
import matchNolistImage from '../../asset/images/match_nolist01.png'
import mainUserImage from '../../asset/images/main_user01.png'
import matchList01 from '../../asset/images/match_list01.jpg'
import matchList02 from '../../asset/images/match_list02.jpg'
import matchList04 from '../../asset/images/match_list04.jpg'
import { LoginButton } from '../../components/LoginButton'
import { aiRecommendedMatches, type AiRecommendedMatch } from '../../data/aiRecommendedMatches'
import { getMyMatchGroups } from '../my/myMatchData'
import { createGeneratedMatchSchedules } from './generatedMatchSchedules'
import { cacheMatchSnapshot } from './matchApplicationStorage'
import {
  readAppliedMatchPresetId,
  readMatchPresets,
  writeAppliedMatchPresetId,
  type MatchPresetItem,
} from './matchPresetStorage'
import './match.css'

type MatchType = 'personal' | 'team' | 'mercenary'

type MatchSchedule = {
  id: string
  type: MatchType
  title: string
  time: string
  region: string
  fieldName: string
  difficulty: string
  currentParticipants: number
  maxParticipants: number
  action: string
  body?: string
  date?: string
  imageSrc?: string
}

type MatchTypeFilter = 'all' | MatchType
type MatchPresetId = string
type WeekSlideDirection = 'prev' | 'next' | null

type MatchHomeLocationState = {
  scrollTo?: 'ai-recommend' | 'schedule'
  returnTo?: string
}

const CREATED_MATCHES_KEY = 'airsoft:created-matches'
const CREATED_MATCH_FOCUS_DATE_KEY = 'airsoft:created-match-focus-date'

const typeFilters: Array<{ label: string; value: MatchTypeFilter }> = [
  { label: '전체', value: 'all' },
  { label: '개인', value: 'personal' },
  { label: '팀', value: 'team' },
  { label: '용병', value: 'mercenary' },
]

type MatchPresetOption = MatchPresetItem & {
  icon: string
  isCreateAction?: boolean
}

function createMatchPresetOptions(): MatchPresetOption[] {
  return [
    ...readMatchPresets().map((preset) => ({
      ...preset,
      icon: preset.isCustom ? presetPlusIcon : presetCheckIcon,
    })),
    {
      id: 'custom',
      title: '커스텀 프리셋',
      description: '직접 설정하는 맞춤 프리셋',
      level: [],
      distance: [],
      distanceValue: 10,
      time: [],
      weekdays: [],
      playStyle: [],
      gameTone: [],
      teamwork: [],
      priority: [],
      purpose: [],
      icon: presetPlusIcon,
      isCreateAction: true,
    },
  ]
}

const homeMatchMoreStyle = {
  gap: 4,
  color: '#9f9f9f',
  fontSize: 14,
  fontWeight: 500,
  lineHeight: '130%',
  letterSpacing: '-0.02em',
} as const

function filterMatches(matches: MatchSchedule[], filter: MatchTypeFilter) {
  if (filter === 'all') {
    return matches
  }

  return matches.filter((match) => match.type === filter)
}

function formatCalendarTitle(month: Date) {
  return `${month.getFullYear()}. ${String(month.getMonth() + 1).padStart(2, '0')}`
}

const weekDayLabels = ['일', '월', '화', '수', '목', '금', '토']
const WEEK_SWIPE_THRESHOLD = 48

function getWeekDates(date: Date) {
  const start = new Date(date)
  start.setDate(date.getDate() - date.getDay())

  return Array.from({ length: 7 }, (_, index) => {
    const nextDate = new Date(start)
    nextDate.setDate(start.getDate() + index)
    return nextDate
  })
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isPastDate(date: Date) {
  return getStartOfDay(date).getTime() < getStartOfDay(new Date()).getTime()
}

function isPastSchedule(match: Pick<MatchSchedule, 'time'>, date: Date) {
  const [hourText, minuteText] = match.time.split(':')
  const hour = Number(hourText)
  const minute = Number(minuteText)

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return isPastDate(date)
  }

  const scheduleDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute)
  return scheduleDate.getTime() < Date.now()
}

function getMatchTypeLabel(match: MatchSchedule) {
  if (match.type === 'personal') return '개인'
  if (match.type === 'team') return '팀'

  return match.difficulty
}

function getAiMatchFieldName(match: AiRecommendedMatch) {
  return match.title.split('\n')[0] || match.region
}

function getAiMatchDateValue(match: AiRecommendedMatch) {
  const dateMatch = match.time.match(/(\d{1,2})\.(\d{1,2})/)
  if (!dateMatch) return undefined

  return `2026-${dateMatch[1].padStart(2, '0')}-${dateMatch[2].padStart(2, '0')}`
}

function getAiMatchTime(match: AiRecommendedMatch) {
  return match.time.match(/\d{1,2}:\d{2}/)?.[0] ?? match.time
}

function getAiMatchScheduleDate(match: AiRecommendedMatch) {
  const dateValue = getAiMatchDateValue(match)
  const matchedTime = getAiMatchTime(match).match(/(\d{1,2}):(\d{2})/)

  if (!dateValue || !matchedTime) {
    return null
  }

  const [, hour, minute] = matchedTime
  const scheduleDate = new Date(`${dateValue}T${hour.padStart(2, '0')}:${minute}:00`)

  return Number.isNaN(scheduleDate.getTime()) ? null : scheduleDate
}

function isPastAiRecommendedMatch(match: AiRecommendedMatch) {
  const scheduleDate = getAiMatchScheduleDate(match)

  if (!scheduleDate) {
    return false
  }

  return scheduleDate.getTime() < Date.now()
}

const matchTypeColor: Record<MatchType, string> = {
  team: 'var(--color-navy)',
  personal: 'var(--color-teal)',
  mercenary: 'var(--color-khaki)',
}

function isMatchType(type: unknown): type is MatchType {
  return type === 'personal' || type === 'team' || type === 'mercenary'
}

function isMyCreatedMatch(match: MatchSchedule) {
  return match.id.startsWith('created-')
}

function readCreatedMatches() {
  if (typeof window === 'undefined') {
    return []
  }

  const savedMatches = (() => {
    try {
      return JSON.parse(localStorage.getItem(CREATED_MATCHES_KEY) ?? '[]')
    } catch {
      return []
    }
  })()

  if (!Array.isArray(savedMatches)) {
    return []
  }

  return savedMatches
    .filter((match): match is MatchSchedule => {
      return (
        typeof match === 'object' &&
        match !== null &&
        'type' in match &&
        isMatchType(match.type)
      )
    })
    .map((match) => ({
      ...match,
      imageSrc: match.imageSrc ?? (match.type === 'team' ? matchList02 : match.type === 'mercenary' ? matchList04 : matchList01),
    }))
}

function readFocusedMatchDate() {
  const today = new Date()
  const defaultDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  if (typeof window === 'undefined') {
    return defaultDate
  }

  const savedDate = localStorage.getItem(CREATED_MATCH_FOCUS_DATE_KEY)
  localStorage.removeItem(CREATED_MATCH_FOCUS_DATE_KEY)

  if (!savedDate) {
    return defaultDate
  }

  const date = new Date(`${savedDate}T00:00:00`)
  return Number.isNaN(date.getTime()) ? defaultDate : date
}

function getSafeMatchReturnPath(path?: string) {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/match')) {
    return '/home'
  }

  return path
}

export function MatchHome() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as MatchHomeLocationState | null
  const returnTo = getSafeMatchReturnPath(locationState?.returnTo)
  const scheduleSectionRef = useRef<HTMLElement | null>(null)
  const aiSectionRef = useRef<HTMLElement | null>(null)
  const aiRefreshButtonRef = useRef<HTMLButtonElement | null>(null)
  const hasShownAiRefreshHintRef = useRef(false)
  const weekDragRef = useRef<{ pointerId: number; startX: number; startY: number } | null>(null)
  const suppressWeekDayClickRef = useRef(false)
  const [selectedDate, setSelectedDate] = useState<Date>(() => readFocusedMatchDate())
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  )
  const [matchTypeFilter, setMatchTypeFilter] = useState<MatchTypeFilter>('all')
  const [createdMatches] = useState<MatchSchedule[]>(readCreatedMatches)
  const [registrationToastOpen, setRegistrationToastOpen] = useState(consumeMatchRegistrationToastPending)
  const [showPresetSheet, setShowPresetSheet] = useState(false)
  const [matchPresetOptions, setMatchPresetOptions] = useState(createMatchPresetOptions)
  const [appliedPresetId, setAppliedPresetId] = useState<MatchPresetId>(readAppliedMatchPresetId)
  const [selectedPresetId, setSelectedPresetId] = useState<MatchPresetId>(readAppliedMatchPresetId)
  const [weekSlideDirection, setWeekSlideDirection] = useState<WeekSlideDirection>(null)
  const [weekDragOffset, setWeekDragOffset] = useState(0)
  const [isWeekDragging, setIsWeekDragging] = useState(false)
  const [aiMatchIndex, setAiMatchIndex] = useState(0)
  const [isAiMatchRefreshing, setIsAiMatchRefreshing] = useState(false)
  const [showAiRefreshHint, setShowAiRefreshHint] = useState(false)
  const generatedMatches = useMemo(() => createGeneratedMatchSchedules(), [])
  const myMatchGroups = getMyMatchGroups()
  const presetSelectionOptions = matchPresetOptions.filter((preset) => !preset.isCreateAction)
  const appliedPreset = presetSelectionOptions.find((preset) => preset.id === appliedPresetId) ?? presetSelectionOptions[0]
  const appliedPresetTitle = appliedPreset?.title ?? '프리셋 없음'
  const appliedPresetSummary = appliedPreset
    ? `${appliedPreset.distance[0] ?? '거리 미정'} · ${appliedPreset.weekdays.join(', ') || '요일 미정'} · ${appliedPreset.level[0] ?? '숙련도 미정'}`
    : '프리셋을 만들어 추천 조건을 설정하세요'
  const availableAiRecommendedMatches = aiRecommendedMatches.filter((match) => !isPastAiRecommendedMatch(match))
  const safeAiMatchIndex = availableAiRecommendedMatches.length > 0
    ? Math.min(aiMatchIndex, availableAiRecommendedMatches.length - 1)
    : 0
  const aiRecommendedMatch = availableAiRecommendedMatches[safeAiMatchIndex] ?? aiRecommendedMatches[0]
  const hiddenAiMemberCount = Math.max(aiRecommendedMatch.currentMembers - 3, 0)
  const selectedDay = String(selectedDate.getDate())
  const selectedDateLabel = `${selectedDate.getMonth() + 1}월 ${selectedDay}일`
  const selectedDateKey = [
    selectedDate.getFullYear(),
    String(selectedDate.getMonth() + 1).padStart(2, '0'),
    String(selectedDate.getDate()).padStart(2, '0'),
  ].join('-')
  const isSelectedDatePast = isPastDate(selectedDate)
  const selectedDayCreatedMatches = createdMatches.filter((match) => match.date === selectedDateKey)
  const selectedDayGeneratedMatches = generatedMatches.filter((match) => match.dateValue === selectedDateKey)
  const selectedDayMatches = [...selectedDayGeneratedMatches, ...selectedDayCreatedMatches]
  const selectedMatches = filterMatches(selectedDayMatches, matchTypeFilter)
  const filteredCreatedMatchDates = createdMatches
    .filter((match) => filterMatches([match], matchTypeFilter).length > 0 && match.date)
    .map((match) => new Date(`${match.date}T00:00:00`))
    .filter((date) => !Number.isNaN(date.getTime()))
  const filteredGeneratedMatchDates = generatedMatches
    .filter((match) => filterMatches([match], matchTypeFilter).length > 0)
    .map((match) => new Date(`${match.dateValue}T00:00:00`))
    .filter((date) => !Number.isNaN(date.getTime()))
  const filteredMatchDates = [...filteredCreatedMatchDates, ...filteredGeneratedMatchDates]
  const weekDates = getWeekDates(selectedDate)
  const selectedWeekDayIndex = Math.max(weekDates.findIndex((date) => isSameDay(date, selectedDate)), 0)

  const moveWeek = (direction: Exclude<WeekSlideDirection, null>) => {
    setWeekSlideDirection(direction)
    setSelectedDate((date) => {
      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + (direction === 'next' ? 7 : -7))
      setCalendarMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1))
      return nextDate
    })
  }
  const goPrevWeek = () => {
    moveWeek('prev')
  }
  const goNextWeek = () => {
    moveWeek('next')
  }
  const handleWeekPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return

    weekDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }
  const handleWeekPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = weekDragRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) return

    const deltaX = event.clientX - dragState.startX
    const deltaY = event.clientY - dragState.startY
    const isHorizontalDrag = Math.abs(deltaX) > 6 && Math.abs(deltaX) > Math.abs(deltaY)

    if (!isHorizontalDrag) return

    event.preventDefault()
    setIsWeekDragging(true)
    setWeekDragOffset(Math.max(-72, Math.min(72, deltaX * 0.45)))
  }
  const handleWeekPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = weekDragRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) return

    weekDragRef.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    setIsWeekDragging(false)
    setWeekDragOffset(0)

    const deltaX = event.clientX - dragState.startX
    const deltaY = event.clientY - dragState.startY
    const isHorizontalSwipe = Math.abs(deltaX) >= WEEK_SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY) * 1.2

    if (!isHorizontalSwipe) return

    suppressWeekDayClickRef.current = true
    moveWeek(deltaX < 0 ? 'next' : 'prev')
    window.setTimeout(() => {
      suppressWeekDayClickRef.current = false
    }, 350)
  }
  const handleWeekPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (weekDragRef.current?.pointerId === event.pointerId) {
      weekDragRef.current = null
      setIsWeekDragging(false)
      setWeekDragOffset(0)
    }
  }
  const goBack = () => {
    navigate(returnTo)
  }

  const [showTypeSheet, setShowTypeSheet] = useState(false)

  useEffect(() => {
    if (registrationToastOpen) {
      window.setTimeout(() => {
        scheduleSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 180)
    }
  }, [registrationToastOpen])

  useEffect(() => {
    const syncPresets = () => {
      const nextOptions = createMatchPresetOptions()
      const nextAppliedPresetId = readAppliedMatchPresetId()

      setMatchPresetOptions(nextOptions)
      setAppliedPresetId(nextAppliedPresetId)
      setSelectedPresetId((currentId) => {
        return nextOptions.some((preset) => preset.id === currentId) ? currentId : nextAppliedPresetId
      })
    }

    window.addEventListener('focus', syncPresets)
    window.addEventListener('storage', syncPresets)

    return () => {
      window.removeEventListener('focus', syncPresets)
      window.removeEventListener('storage', syncPresets)
    }
  }, [])

  useEffect(() => {
    if (locationState?.scrollTo === 'ai-recommend') {
      window.setTimeout(() => {
        aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
    }
    if (locationState?.scrollTo === 'schedule') {
      window.setTimeout(() => {
        scheduleSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
    }
  }, [locationState?.scrollTo])

  useEffect(() => {
    let triggerTimer: number | undefined
    let hintTimer: number | undefined
    let rafId: number | undefined
    const showHint = () => {
      if (hasShownAiRefreshHintRef.current) return

      hasShownAiRefreshHintRef.current = true
      setShowAiRefreshHint(true)
      hintTimer = window.setTimeout(() => {
        setShowAiRefreshHint(false)
      }, 1250)
    }

    const checkHintTiming = () => {
      rafId = undefined
      if (hasShownAiRefreshHintRef.current) return

      const button = aiRefreshButtonRef.current
      if (!button) return

      const rect = button.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const buttonCenter = rect.top + rect.height / 2
      const isButtonInViewingZone = buttonCenter <= viewportHeight * 0.58 && rect.bottom >= viewportHeight * 0.18

      if (isButtonInViewingZone && triggerTimer === undefined) {
        triggerTimer = window.setTimeout(() => {
          triggerTimer = undefined
          showHint()
        }, 160)
      }
    }

    const scheduleCheck = () => {
      if (rafId !== undefined || hasShownAiRefreshHintRef.current) return
      rafId = window.requestAnimationFrame(checkHintTiming)
    }

    scheduleCheck()
    window.addEventListener('scroll', scheduleCheck, { passive: true })
    window.addEventListener('resize', scheduleCheck)

    return () => {
      window.removeEventListener('scroll', scheduleCheck)
      window.removeEventListener('resize', scheduleCheck)
      if (rafId !== undefined) {
        window.cancelAnimationFrame(rafId)
      }
      if (triggerTimer !== undefined) {
        window.clearTimeout(triggerTimer)
      }
      if (hintTimer !== undefined) {
        window.clearTimeout(hintTimer)
      }
    }
  }, [])

  const handleTypeSelect = (kind: 'personal' | 'team' | 'guest', guestFlow?: 'wanted' | 'join') => {
    if (kind !== 'guest') {
      return
    }

    setShowTypeSheet(false)
    if (guestFlow === 'wanted') {
      navigate(`/match/create/guest-wanted?date=${selectedDateKey}`)
      return
    }

    if (guestFlow === 'join') {
      navigate(`/match/create/guest-join?date=${selectedDateKey}`)
      return
    }
  }

  const openPresetSheet = () => {
    setSelectedPresetId(appliedPresetId)
    setShowPresetSheet(true)
  }

  const applyPreset = () => {
    writeAppliedMatchPresetId(selectedPresetId)
    setAppliedPresetId(selectedPresetId)
    setShowPresetSheet(false)
  }

  const refreshAiRecommendedMatch = () => {
    if (isAiMatchRefreshing) return

    setIsAiMatchRefreshing(true)
    window.setTimeout(() => {
      setAiMatchIndex((currentIndex) => {
        if (availableAiRecommendedMatches.length <= 1) return currentIndex

        const currentSafeIndex = currentIndex >= availableAiRecommendedMatches.length ? 0 : currentIndex
        let nextIndex = currentIndex

        while (nextIndex === currentSafeIndex) {
          nextIndex = Math.floor(Math.random() * availableAiRecommendedMatches.length)
        }

        return nextIndex
      })
    }, 160)
    window.setTimeout(() => {
      setIsAiMatchRefreshing(false)
    }, 420)
  }

  const cacheScheduleMatch = (match: MatchSchedule) => {
    const dateValue = match.date ?? selectedDateKey

    cacheMatchSnapshot({
      id: match.id,
      type: match.type,
      title: match.title,
      date: dateValue,
      dateValue,
      time: match.time,
      region: match.region,
      fieldName: match.fieldName,
      difficulty: match.difficulty,
      currentParticipants: match.currentParticipants,
      maxParticipants: match.maxParticipants,
      imageSrc: match.imageSrc,
    })
  }

  return (
    <div className="match_page">
      <PageHeader
        className="match_page_header"
        backButtonClassName="match_page_back_button"
        layout="standard"
        title="매치"
        titleClassName="match_page_title"
        onBack={goBack}
      />

      <section className="match_home_my_matches" aria-labelledby="match-status-title">
        <div className="my_matches_heading">
          <h2 id="match-status-title" className="my_section_title">내 매치</h2>
          <More
            className="my_matches_more"
            style={homeMatchMoreStyle}
            state={{ from: '/match' }}
            to="/my/schedule"
          />
        </div>

        <div className="match_status_list">
          <Link className="match_status_summary_card is_waiting" to="/my/schedule?tab=applied" state={{ from: '/match' }}>
            <span>
              <strong>승인대기 일정</strong>
              <small>참가 신청한 매치를 확인하세요</small>
            </span>
            <b>{myMatchGroups.applied.length}건</b>
          </Link>
          <Link className="match_status_summary_card is_confirmed" to="/my/schedule?tab=confirmed" state={{ from: '/match' }}>
            <span>
              <strong>확정 일정</strong>
              <small>확정된 매치 일정을 확인하세요</small>
            </span>
            <b>{myMatchGroups.confirmed.length}건</b>
          </Link>
        </div>
      </section>

      <section className="match_section match_ai_recommend_section" aria-labelledby="match-ai-title" ref={aiSectionRef}>
        <div className="match_ai_heading">
          <h2 id="match-ai-title" className="match_section_title">AI 추천 매치</h2>
          <button className="match_ai_preset_button" type="button" onClick={openPresetSheet}>
            <img src={matchPresetIcon} alt="" aria-hidden="true" />
            <span>프리셋</span>
          </button>
        </div>

        <div className="match_ai_recommend_group">
          <div className="match_ai_preset_card">
            <strong>적용된 프리셋</strong>
            <p>
              <span>{appliedPresetTitle}</span>
              {appliedPresetSummary}
            </p>
          </div>

          <article className={`match_ai_match_card${isAiMatchRefreshing ? ' is_refreshing' : ''}`} key={aiRecommendedMatch.id}>
            <img className="match_ai_match_bg" src={aiRecommendedMatch.imageSrc} alt="" aria-hidden="true" />
            <div className="match_ai_match_top">
              <div className="match_ai_match_copy">
                <h3 className="match_ai_match_title">
                  <span className="match_ai_match_title_group">
                    {aiRecommendedMatch.title.split('\n').map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </span>
                </h3>
                <p className="match_ai_match_meta">
                  <span>{aiRecommendedMatch.time}</span>
                  <span>{aiRecommendedMatch.region}</span>
                </p>
              </div>
              <button
                ref={aiRefreshButtonRef}
                className={`match_ai_percent${showAiRefreshHint ? ' is_intro_spin' : ''}`}
                type="button"
                aria-label="AI 추천 매치 새로고침"
                disabled={isAiMatchRefreshing}
                onClick={refreshAiRecommendedMatch}
              >
                <svg
                  className="match_ai_refresh_icon"
                  width="35"
                  height="35"
                  viewBox="0 0 35 35"
                  fill="none"
                  aria-hidden="true"
                  focusable="false"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="34.4762" height="34.4762" rx="17.2381" fill="#1A1A1A" />
                  <path
                    d="M10.9753 13.6093C11.8554 12.0904 13.2575 10.9431 14.9205 10.3811C16.5836 9.81898 18.3942 9.88044 20.0153 10.554C21.6364 11.2275 22.9574 12.4673 23.7325 14.0424C24.5076 15.6174 24.6838 17.4205 24.2284 19.1159C23.773 20.8112 22.7169 22.2833 21.2569 23.258C19.7969 24.2327 18.0325 24.6435 16.2921 24.4141C14.5517 24.1847 12.954 23.3306 11.7965 22.0108C10.6389 20.6911 10.0005 18.9956 10 17.2402"
                    stroke="white"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.5238 13.621H10.9048V10.002"
                    stroke="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    className="match_ai_refresh_lime_stroke"
                    d="M10.9753 13.6093C11.8554 12.0904 13.2575 10.9431 14.9205 10.3811C16.5836 9.81898 18.3942 9.88044 20.0153 10.554C21.6364 11.2275 22.9574 12.4673 23.7325 14.0424C24.5076 15.6174 24.6838 17.4205 24.2284 19.1159C23.773 20.8112 22.7169 22.2833 21.2569 23.258C19.7969 24.2327 18.0325 24.6435 16.2921 24.4141C14.5517 24.1847 12.954 23.3306 11.7965 22.0108C10.6389 20.6911 10.0005 18.9956 10 17.2402"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    className="match_ai_refresh_lime_stroke"
                    d="M14.5238 13.621H10.9048V10.002"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <span>매칭률</span>
                  <strong>{aiRecommendedMatch.matchRate}%</strong>
                </div>
              </button>
            </div>
            <div className="match_ai_match_bottom">
              <div className="match_ai_members">
                <div className="match_ai_member_avatars" aria-hidden="true">
                  <img src={mainUserImage} alt="" />
                  <img src={mainUserImage} alt="" />
                  <img src={mainUserImage} alt="" />
                </div>
                <span>+{hiddenAiMemberCount}명</span>
              </div>
              <strong>{aiRecommendedMatch.currentMembers} <small>/ {aiRecommendedMatch.maxMembers}</small></strong>
            </div>
          </article>
          <Link
            className="match_full_button match_dark_button match_ai_join_button"
            to={`/match/schedule/${aiRecommendedMatch.id}/join`}
            onClick={() =>
              cacheMatchSnapshot({
                id: aiRecommendedMatch.id,
                type: 'personal',
                title: aiRecommendedMatch.title.replace(/\n/g, ' '),
                date: getAiMatchDateValue(aiRecommendedMatch) ?? selectedDateKey,
                dateValue: getAiMatchDateValue(aiRecommendedMatch) ?? selectedDateKey,
                time: getAiMatchTime(aiRecommendedMatch),
                region: aiRecommendedMatch.region,
                fieldName: getAiMatchFieldName(aiRecommendedMatch),
                difficulty: 'AI 추천',
                currentParticipants: aiRecommendedMatch.currentMembers,
                maxParticipants: aiRecommendedMatch.maxMembers,
                imageSrc: aiRecommendedMatch.imageSrc,
              })
            }
          >
            참가하기
          </Link>
        </div>
      </section>

      <section ref={scheduleSectionRef} className="match_section match_schedule_section" aria-labelledby="match-schedule-title">
        <div>
          <h2 id="match-schedule-title" className="match_section_title">매치 일정 탐색</h2>
          <p className="match_section_description">참가 방식을 고르고 날짜를 선택하면 해당 일정이 바로 이어져요.</p>
        </div>

        <div className="match_type_filters" aria-label="참가 방식 필터">
          {typeFilters.map((filter) => (
            <button
              className={`match_type_filter ${matchTypeFilter === filter.value ? 'is_active' : ''}`}
              type="button"
              key={filter.value}
              data-type={filter.value}
              onClick={() => setMatchTypeFilter(filter.value)}
            >
              <KeywordTag className="match_type_filter_tag">{filter.label}</KeywordTag>
            </button>
          ))}
        </div>

        <div className="match_calendar_view">
          <article className="match_month_card">
            <div className="match_month_header">
              <button type="button" aria-label="이전 주" onClick={goPrevWeek}>&lt;</button>
              <h3>{formatCalendarTitle(calendarMonth)}</h3>
              <button type="button" aria-label="다음 주" onClick={goNextWeek}>&gt;</button>
            </div>

            <div className="match_week_calendar_view">
              <div
                className={[
                  'match_week_calendar',
                  weekSlideDirection === 'prev' ? 'is_sliding_prev' : '',
                  weekSlideDirection === 'next' ? 'is_sliding_next' : '',
                  isWeekDragging ? 'is_dragging' : '',
                ].filter(Boolean).join(' ')}
                style={{
                  '--selected-day-index': selectedWeekDayIndex,
                  '--week-drag-offset': `${weekDragOffset}px`,
                } as CSSProperties}
                role="list"
                aria-label="주간 매치 일정 달력"
                onPointerDown={handleWeekPointerDown}
                onPointerMove={handleWeekPointerMove}
                onPointerUp={handleWeekPointerUp}
                onPointerCancel={handleWeekPointerCancel}
                onAnimationEnd={() => setWeekSlideDirection(null)}
              >
              {weekDates.map((date) => {
                const isSelected = isSameDay(date, selectedDate)
                const hasMatch = filteredMatchDates.some((matchDate) => isSameDay(matchDate, date))
                const day = date.getDay()
                const isPast = isPastDate(date)

                return (
                  <button
                    className={[
                      'match_week_day',
                      isSelected ? 'is_selected' : '',
                      hasMatch ? 'has_match' : '',
                      isPast ? 'is_past' : '',
                      day === 0 ? 'is_sunday' : '',
                      day === 6 ? 'is_saturday' : '',
                    ].filter(Boolean).join(' ')}
                    type="button"
                    key={date.toISOString()}
                    onClick={() => {
                      if (suppressWeekDayClickRef.current) {
                        suppressWeekDayClickRef.current = false
                        return
                      }
                      setSelectedDate(date)
                      setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1))
                    }}
                    aria-pressed={isSelected}
                    aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일 ${weekDayLabels[day]}요일`}
                  >
                    <i aria-hidden="true" />
                    <strong>{date.getDate()}</strong>
                    <span>{weekDayLabels[day]}</span>
                  </button>
                )
              })}
              </div>
            </div>
          </article>

          <article className={`match_selected_schedule${isSelectedDatePast ? ' is_past' : ''}`}>
            <div className="match_selected_schedule_header">
              <h3 aria-label={`${selectedDateLabel} 일정 ${selectedMatches.length}건`}>{selectedDateLabel}</h3>
              {isSelectedDatePast ? (
                <span className="match_past_date_label">지난 날짜</span>
              ) : (
                <button
                  className="match_manage_button"
                  type="button"
                  aria-label="일정 만들기"
                  onClick={() => setShowTypeSheet(true)}
                >
                  <img src={matchPlusIcon} alt="" aria-hidden="true" />
                  <span>일정 만들기</span>
                </button>
              )}
            </div>
            {selectedMatches.length > 0 ? (
              <>
                <div className="match_selected_list">
                  {selectedMatches.map((match) => {
                    const isMine = isMyCreatedMatch(match)
                    const isPastMatch = isPastSchedule(match, selectedDate)

                    return (
                      <Link
                        className={[
                          'match_selected_item',
                          isMine ? 'is_mine' : '',
                          isPastMatch ? 'is_past' : '',
                        ].filter(Boolean).join(' ')}
                        to={isPastMatch ? '#' : isMine ? `/match/edit/${match.id}` : `/match/schedule/${match.id}/join`}
                        aria-label={isPastMatch ? `${match.title} 지난 일정` : isMine ? `${match.title} 수정하기` : `${match.title} 참가 안내 보기`}
                        aria-disabled={isPastMatch}
                        tabIndex={isPastMatch ? -1 : undefined}
                        onClick={(event) => {
                          if (isPastMatch) {
                            event.preventDefault()
                            return
                          }

                          if (!isMine) {
                            cacheScheduleMatch(match)
                          }
                        }}
                        key={match.id}
                      >
                        <div className="match_selected_item_main">
                          <MainTag
                            className="match_item_tag"
                            style={{ padding: '3px 10px', backgroundColor: matchTypeColor[match.type], color: 'var(--color-white)' }}
                          >
                            {getMatchTypeLabel(match)}
                          </MainTag>
                          {isPastMatch || isMine ? (
                            <div className="match_schedule_badge_stack" aria-hidden="true">
                              {isMine ? <span className="match_my_schedule_badge">내가 올린 일정</span> : null}
                              {isPastMatch ? <span className="match_past_schedule_badge">지난 일정</span> : null}
                            </div>
                          ) : null}
                          <div className="match_item_media">
                            <img className="match_selected_thumb" src={match.imageSrc ?? matchList01} alt="" aria-hidden="true" />
                            <div className="match_selected_info">
                              <strong className="match_item_title">{match.title}</strong>
                              <div className="match_item_meta">
                                <p className="match_meta_row">
                                  <span className="match_meta_label">시간</span>
                                  <span className="match_meta_value">{match.time}</span>
                                </p>
                                <p className="match_meta_row">
                                  <span className="match_meta_label">장소</span>
                                  <span className="match_meta_value">{match.region} · {match.fieldName}</span>
                                </p>
                              </div>
                              <p className="match_meta_row">
                                <span className="match_meta_label">인원</span>
                                <span className="match_meta_value">{match.currentParticipants}/{match.maxParticipants}명</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
                <Link className="match_full_button match_dark_button" to="/match">
                  전체 보기
                </Link>
              </>
            ) : (
              <article className="match_empty_recommend_card">
                <div className="match_empty_recommend_copy">
                  {isSelectedDatePast ? (
                    <>
                      <h3>지난 날짜예요</h3>
                      <p>이 날짜에는 확인할 수 있는<br />일정이 없어요.</p>
                    </>
                  ) : (
                    <>
                      <h3>일정이 없나요?</h3>
                      <p>다른 날짜를 보거나<br />AI가 추천하는<br />맞춤 일정을 찾아보세요.</p>
                    </>
                  )}
                </div>
                <img className="match_empty_recommend_img" src={matchNolistImage} alt="" aria-hidden="true" />
                {!isSelectedDatePast ? (
                  <div className="match_empty_recommend_actions">
                    <LoginButton
                      className="match_empty_login_btn"
                      style={{ background: 'rgba(0,0,0,0.55)', color: 'var(--color-white)', fontSize: 16, fontWeight: 500 }}
                      onClick={() => setShowTypeSheet(true)}
                    >
                      일정 만들러 가기
                    </LoginButton>
                  </div>
                ) : null}
              </article>
            )}
          </article>
        </div>
      </section>

      <section className="match_section match_tournament_section" aria-labelledby="match-tournament-title">
        <Link className="match_tournament_card" to="/tournament" aria-labelledby="match-tournament-title">
          <MainTag className="match_tournament_tag" style={{ padding: '3px 8px', background: 'var(--color-orange-red)' }}>
            <span className="match_tournament_tag_dot" aria-hidden="true" />
            <span>토너먼트 진행중</span>
          </MainTag>

          <div className="match_tournament_textbox">
            <div className="match_tournament_titlebox">
              <h2 id="match-tournament-title" className="match_tournament_title">
                곧 시작되는 <span>4강전</span>
              </h2>
              <p className="match_tournament_desc">치열한 승부가 펼쳐집니다!</p>
            </div>
            <div className="match_tournament_info">
              <p className="match_tournament_time">오늘 18:00</p>
              <p className="match_tournament_matchup">바주카 VS 블랙워터</p>
            </div>
          </div>
        </Link>
      </section>

      <MatchTypeSheet
        open={showTypeSheet}
        onClose={() => setShowTypeSheet(false)}
        onSelect={handleTypeSelect}
      />

      {showPresetSheet ? (
        <div className="match_preset_sheet_layer" role="presentation">
          <div className="match_preset_sheet_backdrop" onClick={() => setShowPresetSheet(false)} aria-hidden="true" />
          <section
            className="match_preset_sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="match-preset-sheet-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="match_preset_sheet_top">
              <span className="match_preset_sheet_handle" aria-hidden="true" />
              <h2 id="match-preset-sheet-title" className="match_preset_sheet_title">
                프리셋 변경
              </h2>
            </div>

            <div className="match_preset_sheet_body">
              <AnimatedList
                items={matchPresetOptions}
                className="match_preset_option_list"
                displayScrollbar={false}
                showGradients={false}
                enableArrowNavigation={false}
                initialSelectedIndex={matchPresetOptions.findIndex((preset) => preset.id === selectedPresetId)}
                onItemSelect={(preset) => {
                  if (preset.isCreateAction) {
                    setShowPresetSheet(false)
                    navigate('/match/presets/create')
                    return
                  }

                  setSelectedPresetId(preset.id)
                }}
                renderItem={(preset) => {
                  const isSelected = selectedPresetId === preset.id
                  return (
                    <button
                      className={`match_preset_option${isSelected ? ' is_selected' : ''}`}
                      type="button"
                    >
                      <span className="match_preset_option_text">
                        <strong>{preset.title}</strong>
                        <span>{preset.description}</span>
                      </span>
                      <span className="match_preset_option_icon_wrap" aria-hidden="true">
                        {isSelected || preset.isCreateAction ? (
                          <img
                            src={preset.icon}
                            alt=""
                            className={`match_preset_option_icon${preset.isCreateAction ? ' is_plus' : ''}`}
                          />
                        ) : (
                          <span className="match_preset_option_empty_icon" />
                        )}
                      </span>
                    </button>
                  )
                }}
              />

              <div className="match_preset_sheet_bottom">
                <LoginButton className="match_preset_apply_button" onClick={applyPreset}>
                  적용하기
                </LoginButton>
                <button
                  className="match_preset_manage_text"
                  type="button"
                  onClick={() => {
                    setShowPresetSheet(false)
                    navigate('/match/presets')
                  }}
                >
                  프리셋 관리
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      <MatchRegistrationToast open={registrationToastOpen} onClose={() => setRegistrationToastOpen(false)} />
    </div>
  )
}

