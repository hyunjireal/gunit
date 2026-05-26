import { useRef, type CSSProperties, type PointerEvent } from 'react'
import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CategoryTag from '../../components/CategoryTag'
import { EventBanner } from '../../components/EventBanner'
import GlareHover from '../../components/GlareHover'
import KeywordTag from '../../components/KeywordTag'
import { LoginButton } from '../../components/LoginButton'
import MainTag from '../../components/MainTag'
import More from '../../components/More'
import { PageHeader } from '../../components/PageHeader'
import arrowDownIcon from '../../asset/icons/arrow_down.svg'
import arrowR from '../../asset/icons/arrow_r.svg'
import arrowUpIcon from '../../asset/icons/arrow_up.svg'
import buddyAlertIcon from '../../asset/icons/match_alert.svg'
import buddyCalendarIcon from '../../asset/icons/match_calendar.svg'
import buddyInfoIcon from '../../asset/icons/buddy_info.svg'
import buddyPinIcon from '../../asset/icons/match_pin.svg'
import buddyUsersIcon from '../../asset/icons/com_user.svg'
import mainBuddyClockIcon from '../../asset/icons/main_buddy_clock.svg'
import myPointIcon from '../../asset/icons/my_point.svg'
import mainProfileIcon from '../../asset/icons/main_profile01.svg'
import mainStarIcon from '../../asset/icons/main_star.svg'
import settingsIcon from '../../asset/icons/settings.svg'
import { TournamentHero } from './TournamentHero'
import mainProfileTag01 from '../../asset/images/main_profile_tag01.png'
import mainProfileTag02 from '../../asset/images/main_profile_tag02.png'
import userAvatar from '../../asset/images/main_user01.png'
import mainAiBg from '../../asset/images/main_aiBG.png'
import mainAiImg from '../../asset/images/main_aiImg.png'
import mainBuddy01 from '../../asset/images/main_buddy01.png'
import mainBuddy02 from '../../asset/images/main_buddy02.png'
import mainBuddy03 from '../../asset/images/main_buddy03.png'
import mainBuddy04 from '../../asset/images/main_buddy04.png'
import homeBannerBg01 from '../../asset/images/home_banner_bg01.png'
import homeBannerBg02 from '../../asset/images/home_banner_bg02.png'
import homeBannerBg03 from '../../asset/images/home_banner_bg03.png'
import badge03 from '../../asset/images/badge03.png'
import symbolBeginner from '../../asset/images/symbol_beginner.png'
import mainTournament01 from '../../asset/images/main_tournament01.png'
import mainTournament02 from '../../asset/images/main_tournament02.png'
import mainTournament03 from '../../asset/images/main_tournament03.png'
import mainTournament04 from '../../asset/images/main_tournament04.png'
import mainTournament05 from '../../asset/images/main_tournament05.png'
import mainTeamImg01 from '../../asset/images/main_teamImg01.png'
import mainTeamImg02 from '../../asset/images/main_teamImg02.png'
import mainTeamImg03 from '../../asset/images/main_teamImg03.png'
import mainTeamImg04 from '../../asset/images/main_teamImg04.png'
import matchImg01 from '../../asset/images/main_img03.jpg'
import matchImg02 from '../../asset/images/main_img04.jpg'
import matchImg03 from '../../asset/images/main_img05.jpg'
import matchImg04 from '../../asset/images/main_img06.jpg'
import { primaryAiRecommendedMatch } from '../../data/aiRecommendedMatches'
import { getMyMatchGroups, type MyMatchItem } from '../my/myMatchData'
import './Home.css'

type HomeMatchCard = {
  id: string | number
  dday: string
  notice: string
  place: string
  datetime: string
  img: string
}

const teamCards = [
  { id: 1, name: '스모크 포인트', region: '경기 파주권', logo: mainTeamImg01 },
  { id: 2, name: '그린존 루키즈', region: '서울 노원권', logo: mainTeamImg02 },
  { id: 3, name: '델타 브리프', region: '인천 송도권', logo: mainTeamImg03 },
  { id: 4, name: '브라보 네스트', region: '경기 용인권', logo: mainTeamImg04 },
  { id: 5, name: '택티컬 블룸', region: '서울 마포권', logo: mainTeamImg01 },
  { id: 6, name: '알파 웨이브', region: '경기 고양권', logo: mainTeamImg02 },
]
const visibleTeamCards = teamCards

const homeEventBanners = [
  {
    id: 'overwatch-quiz-1',
    to: '/guide/quiz',
    backgroundImage: homeBannerBg01,
    label: '건잇 x 오버워치',
    title: '초보자 퀴즈 풀고',
    accent: '오버워치 스킨',
    suffix: ' 받자!',
  },
  {
    id: 'overwatch-quiz-2',
    to: '/buddy',
    backgroundImage: homeBannerBg02,
    label: '나의 버디 매치',
    title: '초행도 걱정 없이',
    accent: '버디와 함께',
    suffix: ' 플레이!',
  },
  {
    id: 'r6-tactics',
    to: '/community',
    backgroundImage: homeBannerBg03,
    label: '플레이 팁부터 후기까지',
    title: '초보질문방에서',
    accent: '고민을 공유',
    suffix: '해보세요',
    className: 'event_banner--community',
  },
]

const mvpMatches = [
  {
    id: 1,
    voteMatchId: 'quarter-3',
    round: '8강 3경기',
    team1: { name: '바주카', icon: mainTournament01 },
    team2: { name: '블랙워터', icon: mainTournament02 },
  },
  {
    id: 2,
    voteMatchId: 'quarter-4',
    round: '8강 4경기',
    team1: { name: '스모크', icon: mainTournament03 },
    team2: { name: '델타포스', icon: mainTournament04 },
  },
]

const homeMatchFallbackImages = [matchImg01, matchImg02, matchImg03, matchImg04]

function formatHomeDday(tagLabel: string) {
  if (tagLabel === 'D-DAY') return '경기 당일'

  const daysUntil = tagLabel.match(/^D-(\d+)$/)?.[1]
  if (daysUntil) return `경기 ${daysUntil}일 전`

  return tagLabel
}

function formatHomeTime(time: string) {
  const matchedTime = time.match(/(\d{1,2}):(\d{2})/)
  if (!matchedTime) return time

  const hour = Number(matchedTime[1])
  const minute = matchedTime[2]
  const period = hour < 12 ? '오전' : '오후'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12

  return `${period} ${String(displayHour).padStart(2, '0')}:${minute}`
}

function formatHomeDatetime(match: MyMatchItem) {
  const dateLabel = match.dateValue?.replaceAll('-', '.') ?? match.time.match(/\d{4}\.\d{2}\.\d{2}/)?.[0]
  const timeLabel = formatHomeTime(match.time)

  return [dateLabel, timeLabel].filter(Boolean).join(' ')
}

function toHomeScheduleCard(match: MyMatchItem, index: number): HomeMatchCard {
  return {
    id: match.id,
    dday: formatHomeDday(match.tagLabel),
    notice: match.title,
    place: `${match.region} · ${match.fieldName}`,
    datetime: formatHomeDatetime(match),
    img: match.imageSrc || homeMatchFallbackImages[index % homeMatchFallbackImages.length],
  }
}

const buddyItems = [
  {
    id: 1,
    image: mainBuddy02,
    title: '장비 체크',
  },
  {
    id: 2,
    image: mainBuddy03,
    title: '룰 안내',
  },
  {
    id: 3,
    image: mainBuddy04,
    title: '첫 라운드 동행',
  },
]

const buddyProcessSteps = [
  {
    id: 1,
    icon: buddyCalendarIcon,
    title: '일정 선택',
    description: '다가올 게임 선택',
  },
  {
    id: 2,
    icon: buddyPinIcon,
    title: '버디 필요 체크',
    description: '도움 필요 여부 입력',
  },
  {
    id: 3,
    icon: buddyAlertIcon,
    title: '참여자 추천',
    description: '같은 게임에 참여하는 사람 중 버디를 추천받아요.',
  },
  {
    id: 4,
    icon: buddyUsersIcon,
    title: '요청 후 확인',
    description: '상대가 수락하면 내 매칭 현황에서 확인하고 채팅할 수 있어요.',
  },
]

const HOME_PROFILE_IMAGE_KEY = 'airsoft:home-profile-image'
const homeProfileGreetings = [
  '오늘도 안전한 슈팅 하세요!',
  '필드에서는 안전이 가장 멋진 플레이예요!',
  '좋은 팀워크로 즐거운 게임 되세요!',
  '컨디션 맞춰 준비해요!',
  '장비 체크하고 기분 좋게 출발해요!',
  '무리하지 말고 안전하게 즐겨요!',
  '오늘도 매너 있는 플레이를 기대할게요!',
  '든든한 준비가 좋은 게임을 만들어요!',
  '필드에서 멋진 순간을 만들어봐요!',
  '침착하게, 안전하게, 재미있게 즐겨요!',
]

function saveProfileImage(dataUrl: string) {
  try {
    localStorage.setItem(HOME_PROFILE_IMAGE_KEY, dataUrl)
  } catch {
    localStorage.removeItem(HOME_PROFILE_IMAGE_KEY)
  }
  window.dispatchEvent(new StorageEvent('storage', { key: HOME_PROFILE_IMAGE_KEY, newValue: dataUrl }))
}
const BUDDY_SHEET_CLOSE_DURATION = 280
const HOME_OPENING_DURATION = 2050
const HOME_HERO_INTRO_SEEN_KEY = 'airsoft:home-hero-intro-seen'
const HOME_INTRO_RESTART_EVENT = 'airsoft:restart-home-intro'

const homeAchievementTagStyle: CSSProperties = {
  border: 0,
  fontFamily: 'var(--font-pretendard)',
  fontSize: 'var(--font-size-14)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 'var(--line-height-130)',
  letterSpacing: 'var(--letter-spacing-tight)',
}

const visibleAchievementBadges = [
  {
    label: '첫 AI 질문 완료',
    icon: mainProfileTag02,
    background: '#E0E5EF',
    color: 'var(--color-navy)',
  },
  {
    label: '친환경 바이오탄 지식인',
    icon: mainProfileTag01,
    background: '#EDF4E5',
    color: '#637A45',
  },
]

const hiddenAchievementBadges = [
  {
    label: '첫 경기 예약 완료',
    icon: mainProfileTag02,
    background: '#F2E8DB',
    color: '#7A5935',
  },
  {
    label: '안전수칙 퀴즈 통과',
    icon: mainProfileTag01,
    background: '#E8F1F4',
    color: '#416E7A',
  },
  {
    label: '필드 버디 신청',
    icon: mainProfileTag02,
    background: '#F1E8F5',
    color: '#70507A',
  },
  {
    label: '장비 체크 완료',
    icon: mainProfileTag01,
    background: '#F4EFE5',
    color: '#74633F',
  },
  {
    label: '커뮤니티 첫 댓글',
    icon: mainProfileTag02,
    background: '#E8F0EA',
    color: '#4F7359',
  },
]

function useDragScroll() {
  const dragState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
  })

  const stopDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.isDown) return

    dragState.current.isDown = false
    event.currentTarget.classList.remove('is_dragging')
  }

  return {
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return

      dragState.current = {
        isDown: true,
        startX: event.clientX,
        scrollLeft: event.currentTarget.scrollLeft,
      }
      event.currentTarget.classList.add('is_dragging')
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
      if (!dragState.current.isDown) return

      const distance = event.clientX - dragState.current.startX
      event.currentTarget.scrollLeft = dragState.current.scrollLeft - distance
      event.preventDefault()
    },
    onPointerUp: stopDrag,
    onPointerCancel: stopDrag,
    onPointerLeave: stopDrag,
  }
}

export function Home() {
  const navigate = useNavigate()
  const teamTrackRef = useRef<HTMLDivElement>(null)
  const matchSectionRef = useRef<HTMLDivElement>(null)
  const buddySectionRef = useRef<HTMLDivElement>(null)
  const teamSectionRef = useRef<HTMLElement>(null)
  const bannerSectionRef = useRef<HTMLElement>(null)
  const tournamentSectionRef = useRef<HTMLElement>(null)
  const isTeamAutoPausedRef = useRef(false)
  const isTeamGridModeRef = useRef(false)
  const teamAutoResumeTimerRef = useRef<number | null>(null)
  const teamOffsetRef = useRef(0)
  const teamLoopWidthRef = useRef(0)
  const isTeamDraggingRef = useRef(false)
  const teamDragStartXRef = useRef(0)
  const teamDragStartOffsetRef = useRef(0)
  const matchDragScroll = useDragScroll()
  const bannerDragScroll = useDragScroll()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const albumInputRef = useRef<HTMLInputElement>(null)
  const cameraVideoRef = useRef<HTMLVideoElement>(null)
  const [isAchievementExpanded, setIsAchievementExpanded] = useState(false)
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isBuddySheetOpen, setIsBuddySheetOpen] = useState(false)
  const [isBuddySheetClosing, setIsBuddySheetClosing] = useState(false)
  const [profilePreview, setProfilePreview] = useState(() => localStorage.getItem(HOME_PROFILE_IMAGE_KEY) || userAvatar)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [isFlashing, setIsFlashing] = useState(false)
  const [pendingAlbumImage, setPendingAlbumImage] = useState<string | null>(null)
  const [hasSeenHomeHeroIntro, setHasSeenHomeHeroIntro] = useState(() => {
    if (typeof window === 'undefined') return true
    return sessionStorage.getItem(HOME_HERO_INTRO_SEEN_KEY) === 'true'
  })
  const [homeHeroIntroKey, setHomeHeroIntroKey] = useState(0)
  const [isHomeOpeningDone, setIsHomeOpeningDone] = useState(() => {
    if (typeof window === 'undefined') return true
    return hasSeenHomeHeroIntro || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  const [visibleHomeSections, setVisibleHomeSections] = useState({
    match: false,
    buddy: false,
    team: false,
    banner: false,
  })
  const [isTournamentVisible, setIsTournamentVisible] = useState(false)
  const [mvpActiveIndex, setMvpActiveIndex] = useState(0)
  const mvpDragStartXRef = useRef(0)
  const mvpDragDistanceRef = useRef(0)
  const isMvpDraggingRef = useRef(false)
  const [homeProfileGreeting] = useState(() => {
    const randomIndex = Math.floor(Math.random() * homeProfileGreetings.length)

    return homeProfileGreetings[randomIndex]
  })
  const savedProfileBadge = localStorage.getItem('homeProfileBadge')
  const savedProfileTitle = localStorage.getItem('homeProfileTitle')
  const savedLevel = localStorage.getItem('level')
  const savedSkillAlias = localStorage.getItem('skillAlias')
  const savedNickname = localStorage.getItem('nickname')
  const isVeteranProfile =
    savedProfileBadge === 'badge03' || savedLevel === '숙련자' || savedSkillAlias === '베테랑'
  const homeProfileBadge = isVeteranProfile ? badge03 : symbolBeginner
  const homeProfileTitle = savedProfileTitle || (isVeteranProfile ? '베테랑 숙련자' : '안전제일 뉴비')
  const homeScheduleCards = getMyMatchGroups()
    .confirmed
    .slice(0, 4)
    .map(toHomeScheduleCard)
  const homeAiRecommendedMatchTitleLines = primaryAiRecommendedMatch.title.split('\n')

  useEffect(() => {
    if (isHomeOpeningDone) return undefined

    const timer = window.setTimeout(() => {
      sessionStorage.setItem(HOME_HERO_INTRO_SEEN_KEY, 'true')
      setIsHomeOpeningDone(true)
    }, HOME_OPENING_DURATION)

    return () => {
      window.clearTimeout(timer)
    }
  }, [isHomeOpeningDone])

  useEffect(() => {
    const restartHomeIntro = () => {
      sessionStorage.removeItem(HOME_HERO_INTRO_SEEN_KEY)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setHasSeenHomeHeroIntro(false)
      setIsHomeOpeningDone(false)
      setVisibleHomeSections({
        match: false,
        buddy: false,
        team: false,
        banner: false,
      })
      setIsTournamentVisible(false)
      setHomeHeroIntroKey((currentKey) => currentKey + 1)
    }

    window.addEventListener(HOME_INTRO_RESTART_EVENT, restartHomeIntro)

    return () => {
      window.removeEventListener(HOME_INTRO_RESTART_EVENT, restartHomeIntro)
    }
  }, [])

  useEffect(() => {
    const videoElement = cameraVideoRef.current
    if (!videoElement || !cameraStream) return undefined

    videoElement.srcObject = cameraStream
    void videoElement.play()

    return () => {
      videoElement.srcObject = null
    }
  }, [cameraStream])

  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((track) => track.stop())
    }
  }, [cameraStream])

  useEffect(() => {
    const trackElement = teamTrackRef.current
    if (!trackElement) return undefined

    let frameId = 0
    let previousTime = performance.now()
    const speed = 18
    const gridModeQuery = window.matchMedia('(min-width: 1024px)')

    const renderTeamTrack = () => {
      if (isTeamGridModeRef.current) {
        trackElement.style.transform = 'none'
        return
      }

      trackElement.style.transform = `translate3d(${-teamOffsetRef.current}px, 0, 0)`
    }

    const updateLoopWidth = () => {
      if (isTeamGridModeRef.current) {
        teamLoopWidthRef.current = 0
        teamOffsetRef.current = 0
        renderTeamTrack()
        return
      }

      teamLoopWidthRef.current = trackElement.scrollWidth / 2

      if (teamLoopWidthRef.current > 0) {
        teamOffsetRef.current %= teamLoopWidthRef.current
        renderTeamTrack()
      }
    }

    const syncTeamLayoutMode = () => {
      isTeamGridModeRef.current = gridModeQuery.matches
      updateLoopWidth()
    }

    const resizeObserver = new ResizeObserver(updateLoopWidth)
    resizeObserver.observe(trackElement)
    gridModeQuery.addEventListener('change', syncTeamLayoutMode)
    syncTeamLayoutMode()

    const animate = (time: number) => {
      const deltaSeconds = (time - previousTime) / 1000
      previousTime = time

      const loopWidth = teamLoopWidthRef.current

      if (!isTeamGridModeRef.current && !isTeamAutoPausedRef.current && !isTeamDraggingRef.current && loopWidth > 0) {
        teamOffsetRef.current = (teamOffsetRef.current + speed * deltaSeconds) % loopWidth
        renderTeamTrack()
      }

      frameId = window.requestAnimationFrame(animate)
    }

    frameId = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      gridModeQuery.removeEventListener('change', syncTeamLayoutMode)

      if (teamAutoResumeTimerRef.current) {
        window.clearTimeout(teamAutoResumeTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const sectionElement = tournamentSectionRef.current
    if (!sectionElement || isTournamentVisible) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setIsTournamentVisible(true)
        observer.disconnect()
      },
      {
        threshold: 0.32,
        rootMargin: '0px 0px -8% 0px',
      },
    )

    observer.observe(sectionElement)

    return () => {
      observer.disconnect()
    }
  }, [isTournamentVisible])

  useEffect(() => {
    if (!isHomeOpeningDone) return undefined

    const revealTargets = [
      ['match', matchSectionRef.current],
      ['buddy', buddySectionRef.current],
      ['team', teamSectionRef.current],
      ['banner', bannerSectionRef.current],
    ] as const

    const targetMap = new Map<HTMLElement, keyof typeof visibleHomeSections>()
    revealTargets.forEach(([key, element]) => {
      if (!element) return
      targetMap.set(element, key)
    })

    if (targetMap.size === 0) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          const key = targetMap.get(entry.target as HTMLElement)
          if (!key) return

          setVisibleHomeSections((current) => {
            if (current[key]) return current
            return { ...current, [key]: true }
          })
          observer.unobserve(entry.target)
        })
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px',
      },
    )

    targetMap.forEach((_, element) => observer.observe(element))

    return () => {
      observer.disconnect()
    }
  }, [isHomeOpeningDone])

  const pauseTeamAutoScroll = () => {
    isTeamAutoPausedRef.current = true

    if (teamAutoResumeTimerRef.current) {
      window.clearTimeout(teamAutoResumeTimerRef.current)
      teamAutoResumeTimerRef.current = null
    }
  }

  const resumeTeamAutoScrollSoon = () => {
    if (teamAutoResumeTimerRef.current) {
      window.clearTimeout(teamAutoResumeTimerRef.current)
    }

    teamAutoResumeTimerRef.current = window.setTimeout(() => {
      isTeamAutoPausedRef.current = false
      teamAutoResumeTimerRef.current = null
    }, 900)
  }

  const normalizeTeamOffset = (offset: number) => {
    const loopWidth = teamLoopWidthRef.current
    if (loopWidth <= 0) return 0
    return ((offset % loopWidth) + loopWidth) % loopWidth
  }

  const renderTeamTrackOffset = () => {
    const trackElement = teamTrackRef.current
    if (!trackElement) return
    trackElement.style.transform = `translate3d(${-teamOffsetRef.current}px, 0, 0)`
  }

  const handleTeamPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (isTeamGridModeRef.current) return
    if (event.button !== 0 && event.pointerType === 'mouse') return

    pauseTeamAutoScroll()
    isTeamDraggingRef.current = true
    teamDragStartXRef.current = event.clientX
    teamDragStartOffsetRef.current = teamOffsetRef.current
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handleTeamPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (isTeamGridModeRef.current) return
    if (!isTeamDraggingRef.current) return

    const deltaX = event.clientX - teamDragStartXRef.current
    teamOffsetRef.current = normalizeTeamOffset(teamDragStartOffsetRef.current - deltaX)
    renderTeamTrackOffset()
    event.preventDefault()
  }

  const handleTeamPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (isTeamGridModeRef.current) return
    if (isTeamDraggingRef.current) {
      event.currentTarget.releasePointerCapture?.(event.pointerId)
    }

    isTeamDraggingRef.current = false
    resumeTeamAutoScrollSoon()
  }

  const updateProfileImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') return
      setPendingAlbumImage(reader.result)
      setIsProfileSheetOpen(false)
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const confirmAlbumImage = () => {
    if (!pendingAlbumImage) return
    setProfilePreview(pendingAlbumImage)
    saveProfileImage(pendingAlbumImage)
    setPendingAlbumImage(null)
  }

  const cancelAlbumImage = () => {
    setPendingAlbumImage(null)
  }

  const closeProfileCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop())
    setCameraStream(null)
    setIsCameraOpen(false)
  }

  const openProfileCamera = async (mode: 'user' | 'environment' = 'user') => {
    setCameraError('')

    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click()
      return
    }

    cameraStream?.getTracks().forEach((track) => track.stop())

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      })
      setCameraStream(stream)
      setFacingMode(mode)
      setIsProfileSheetOpen(false)
      setIsCameraOpen(true)
    } catch {
      setCameraError('카메라 권한을 확인해주세요.')
      cameraInputRef.current?.click()
    }
  }

  const switchCamera = async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user'
    await openProfileCamera(nextMode)
  }

  const captureProfilePhoto = () => {
    const video = cameraVideoRef.current
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError('카메라 화면을 불러오는 중이에요.')
      return
    }

    setIsFlashing(true)
    window.setTimeout(() => setIsFlashing(false), 200)

    const canvas = document.createElement('canvas')
    const size = Math.min(video.videoWidth, video.videoHeight)
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    if (!context) return

    const offsetX = (video.videoWidth - size) / 2
    const offsetY = (video.videoHeight - size) / 2
    if (facingMode === 'user') {
      context.translate(size, 0)
      context.scale(-1, 1)
    }
    context.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size)
    const nextPreview = canvas.toDataURL('image/jpeg', 0.9)
    setProfilePreview(nextPreview)
    saveProfileImage(nextPreview)
    closeProfileCamera()
  }

  const openBuddyProcessSheet = () => {
    setIsBuddySheetClosing(false)
    setIsBuddySheetOpen(true)
  }

  const closeBuddyProcessSheet = () => {
    if (isBuddySheetClosing) return

    setIsBuddySheetClosing(true)
    window.setTimeout(() => {
      setIsBuddySheetOpen(false)
      setIsBuddySheetClosing(false)
    }, BUDDY_SHEET_CLOSE_DURATION)
  }

  return (
    <div className={`home_page ${isHomeOpeningDone ? 'is_home_opening_done' : ''}`}>
      <PageHeader className="home_page_header" layout="standard" hideLeft />
      <section className="home_main">
        {/* ① 히어로 섹션 */}
        <Link className="home_hero_tournament_link" to="/tournament" aria-label="토너먼트 페이지로 이동">
          <TournamentHero key={homeHeroIntroKey} skipIntro={hasSeenHomeHeroIntro} />
        </Link>

        {/* ② 사용자 정보 + 경기 일정 */}
        <div className="home_userinfo_bg">
          <section className="home_userinfo">
            <div className="home_userinfo_summary">
              <div className="home_userinfo_profile">
                <div className="home_userinfo_pic_wrap">
                  <img src={profilePreview} alt="프로필" className="home_userinfo_pic" />
                  <button
                    className="home_userinfo_pic_badge"
                    type="button"
                    aria-label="프로필 사진 변경"
                    onClick={() => setIsProfileSheetOpen(true)}
                  >
                    <img src={mainProfileIcon} alt="" className="home_userinfo_pic_badge_icon" />
                  </button>
                </div>
                <div className="home_userinfo_tit">
                  <div className="home_userinfo_icons">
                    <div className="home_userinfo_user_icon">
                      <img src={homeProfileBadge} alt="" className="home_userinfo_symbol" />
                      <span className="body_m_14">{homeProfileTitle}</span>
                    </div>
                    <button
                      className="home_userinfo_settings"
                      type="button"
                      aria-label="마이페이지로 이동"
                      onClick={() => navigate('/my')}
                    >
                      <img src={settingsIcon} alt="" className="home_userinfo_settings_icon" />
                    </button>
                  </div>
                  <p className="home_userinfo_name">
                    <span className="home_userinfo_name_user">{savedNickname || '삼삼오오'}</span>
                    <span className="home_userinfo_name_suffix">님</span>
                    <br />
                    <span className="home_userinfo_greeting body_m_16">{homeProfileGreeting}</span>
                  </p>
                </div>
              </div>

              <div className="home_userinfo_badge">
                <div className="home_userinfo_badge_top">
                  <img src={mainStarIcon} alt="" className="home_userinfo_badge_icon" />
                  <p className="home_userinfo_badge_title body_sb_16">보유 뱃지</p>
                </div>
                <div className="home_userinfo_tag_row">
                  <div className="home_userinfo_category_group">
                    <div className="home_userinfo_category_tags">
                      {visibleAchievementBadges.map((badge) => (
                        <CategoryTag
                          key={badge.label}
                          className="home_userinfo_category_tag body_m_14"
                          style={{
                            ...homeAchievementTagStyle,
                            background: badge.background,
                            color: badge.color,
                          }}
                        >
                          <img src={badge.icon} alt="" className="home_userinfo_category_icon" />
                          <span>{badge.label}</span>
                        </CategoryTag>
                      ))}
                    </div>
                    <div className={`home_userinfo_hidden_badges${isAchievementExpanded ? ' is_expanded' : ''}`}>
                      <div className="home_userinfo_hidden_badges_inner">
                        {hiddenAchievementBadges.map((badge, index) => (
                          <CategoryTag
                            key={badge.label}
                            className="home_userinfo_category_tag body_m_14"
                            style={{
                              ...homeAchievementTagStyle,
                              background: badge.background,
                              color: badge.color,
                              '--home-badge-index': index,
                            } as CSSProperties}
                          >
                            <img src={badge.icon} alt="" className="home_userinfo_category_icon" />
                            <span>{badge.label}</span>
                          </CategoryTag>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    className={`home_userinfo_category_more body_m_14${isAchievementExpanded ? ' is_expanded' : ''}`}
                    type="button"
                    onClick={() => setIsAchievementExpanded((current) => !current)}
                    aria-label={isAchievementExpanded ? '보유 뱃지 접기' : '숨겨진 보유 뱃지 5개 더 보기'}
                    aria-expanded={isAchievementExpanded}
                  >
                    <img
                      src={isAchievementExpanded ? arrowUpIcon : arrowDownIcon}
                      alt=""
                      className="home_userinfo_category_more_icon"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>

              <Link
                to="/match"
                state={{ scrollTo: 'ai-recommend' }}
                className="home_ai_recommend_card"
                style={
                  {
                    '--home-ai-bg': `url(${mainAiBg})`,
                  } as CSSProperties
                }
                aria-label={`AI 추천 매치 보러가기, 매칭률 ${primaryAiRecommendedMatch.matchRate}%`}
              >
                <img src={mainAiImg} alt="" className="home_ai_recommend_image" aria-hidden="true" />
                <div className="home_ai_recommend_textbox">
                  <span className="home_ai_recommend_tag">AI 추천</span>
                  <p className="home_ai_recommend_title">
                    {homeAiRecommendedMatchTitleLines.map((line, index) => (
                      <span key={`${line}-${index}`}>
                        {line}
                        {index < homeAiRecommendedMatchTitleLines.length - 1 ? <br /> : null}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="home_ai_recommend_match_rate" aria-label={`매칭률 ${primaryAiRecommendedMatch.matchRate}%`}>
                  <span className="home_ai_recommend_match_label">매칭률</span>
                  <strong>{primaryAiRecommendedMatch.matchRate}%</strong>
                </div>
              </Link>
            </div>

            <div
              className={`home_userinfo_match home_reveal_section ${visibleHomeSections.match ? 'is_visible' : ''}`}
              ref={matchSectionRef}
            >
              <div className="home_userinfo_match_header">
                <h2 className="home_userinfo_match_title">내 경기 일정</h2>
                <Link className="home_more_link" to="/my/schedule?tab=confirmed" state={{ from: '/home' }} aria-label="내 경기 일정 더보기">
                  <More />
                </Link>
              </div>
              <div className="home_match_scroll" {...matchDragScroll}>
                {homeScheduleCards.map((card) => (
                  <article key={card.id} className="home_match_card" style={{ backgroundImage: `url(${card.img})` }}>
                    <div className="home_match_card_top">
                      <MainTag className="home_match_dday_tag">{card.dday}</MainTag>
                      <p className="home_match_card_notice">{card.notice}</p>
                    </div>
                    <div className="home_match_card_txt">
                      <p className="home_match_card_place">{card.place}</p>
                      <p className="home_match_card_datetime">{card.datetime}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="banner">
        <div
          className={`buddy home_reveal_section ${visibleHomeSections.buddy ? 'is_visible' : ''}`}
          ref={buddySectionRef}
        >
          <div className="buddy_top">
            <div className="buddy_visual" aria-hidden="true">
              <img src={mainBuddy01} alt="" className="buddy_main_img" />
            </div>
            <div className="buddy_text">
              <div className="buddy_tit">
                <p className="buddy_title body_sb_14">나의 필드 버디</p>
                <KeywordTag className="buddy_status_tag" style={{ padding: '2px 5px' }}>
                  <img src={mainBuddyClockIcon} alt="" className="buddy_status_icon" />
                  <span>매칭 전</span>
                </KeywordTag>
              </div>
              <div className="buddy_info">
                <p className="buddy_info_title">
                  첫 게임이 걱정된다면{' '}
                  <br className="buddy_desktop_hidden_break" />
                  <span className="buddy_lime_text">함께할 버디</span>를 연결해드려요
                </p>
                <p className="buddy_info_desc">
                  초보 케어 · 멘토링 매칭 · 함께 플레이
                </p>
              </div>
            </div>
          </div>

          <div className="buddy_bottom">
            <div className="buddy_con">
              {buddyItems.map((item) => (
                <div key={item.id} className="buddy_item">
                  <img src={item.image} alt="" className="buddy_item_img" />
                  <div className="buddy_item_text">
                    <p className="buddy_item_title body_sb_14">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="buddy_cta">
              <LoginButton
                className="buddy_button"
                style={{
                  background: 'var(--color-khaki)',
                  backgroundColor: 'var(--color-khaki)',
                  color: '#fff',
                  WebkitTextFillColor: '#fff',
                }}
                onClick={() => navigate('/buddy')}
              >
                <span className="body_b_18">버디 찾기</span>
              </LoginButton>
              <button className="buddy_process" type="button" onClick={openBuddyProcessSheet}>
                <span className="body_sb_14">어떻게 진행되나요?</span>
                <img src={arrowR} alt="" className="buddy_process_icon" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="bottom">
        {/* ⑥ 오바워치 배너 */}
        <section
          className={`home_banner home_reveal_section ${visibleHomeSections.banner ? 'is_visible' : ''}`}
          ref={bannerSectionRef}
          {...bannerDragScroll}
        >
          {homeEventBanners.map((banner, index) => (
            <EventBanner
              key={banner.id}
              to={banner.to}
              backgroundImage={banner.backgroundImage}
              label={banner.label}
              title={banner.title}
              accent={banner.accent}
              suffix={banner.suffix}
              className={banner.className}
              page={index + 1}
              total={homeEventBanners.length}
            />
          ))}
        </section>

        {/* ⑦ MVP 투표 섹션 */}
        <section
          className={`home_mvp_vote ${isTournamentVisible ? 'is_visible' : ''}`}
          ref={tournamentSectionRef}
        >
          <div className="home_mvp_vote_header">
            <h2 className="home_mvp_vote_title sub_en">
              MVP
              <br />
              TOURNAMENT
            </h2>
          </div>
          <div
            className="home_mvp_carousel_area"
            style={{ '--mvp-idx': mvpActiveIndex } as CSSProperties}
            onPointerDown={(e) => {
              mvpDragStartXRef.current = e.clientX
              mvpDragDistanceRef.current = 0
              isMvpDraggingRef.current = true
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              if (!isMvpDraggingRef.current) return
              mvpDragDistanceRef.current = Math.max(
                mvpDragDistanceRef.current,
                Math.abs(e.clientX - mvpDragStartXRef.current),
              )
            }}
            onPointerUp={(e) => {
              if (!isMvpDraggingRef.current) return
              isMvpDraggingRef.current = false
              const delta = e.clientX - mvpDragStartXRef.current
              if (Math.abs(delta) < 8) return
              if (delta < -40) setMvpActiveIndex((i) => Math.min(i + 1, mvpMatches.length - 1))
              else if (delta > 40) setMvpActiveIndex((i) => Math.max(i - 1, 0))
            }}
            onPointerCancel={() => { isMvpDraggingRef.current = false }}
          >
            <div className="home_mvp_track">
              {mvpMatches.map((match, index) => {
                const isActive = index === mvpActiveIndex
                return (
                  <GlareHover
                    key={match.id}
                    className={`home_mvp_card${isActive ? ' is_active' : ''}`}
                    width="var(--mvp-card-w)"
                    height="auto"
                    background="var(--home-mvp-card-bg)"
                    borderRadius="15px"
                    borderColor="var(--home-mvp-card-border)"
                    glareColor="#ffffff"
                    glareOpacity={0.1}
                    glareAngle={-55}
                    glareSize={260}
                    transitionDuration={1900}
                    autoPlay={isActive}
                    autoPlayInterval={7200}
                    autoPlayDelay={isActive ? 400 : index * 900}
                    aria-hidden={!isActive}
                    role="button"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => {
                      if (mvpDragDistanceRef.current > 8) return
                      navigate(`/tournament/mvp-vote?match=${match.voteMatchId}`)
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter' && e.key !== ' ') return
                      e.preventDefault()
                      navigate(`/tournament/mvp-vote?match=${match.voteMatchId}`)
                    }}
                  >
                    <span className="home_mvp_card_round">{match.round}</span>
                    <div className="home_mvp_card_teams">
                      <div className="home_mvp_card_team">
                        <img src={match.team1.icon} alt="" className="home_mvp_team_icon" />
                        <p className="home_mvp_team_name">{match.team1.name}</p>
                      </div>
                      <span className="home_mvp_vs_wrap" aria-hidden="true">
                        <svg className="home_mvp_vs_clash" viewBox="0 0 92 132" preserveAspectRatio="none" focusable="false">
                          <defs>
                            <linearGradient id={`homeMvpClashAmbient-${match.id}`} gradientUnits="userSpaceOnUse" x1="17" y1="132" x2="82" y2="0">
                              <stop offset="0%" stopColor="#e2fd34" stopOpacity="0" />
                              <stop offset="34%" stopColor="#e2fd34" stopOpacity="0.08" />
                              <stop offset="50%" stopColor="#f6ffbf" stopOpacity="0.24" />
                              <stop offset="66%" stopColor="#e2fd34" stopOpacity="0.1" />
                              <stop offset="100%" stopColor="#e2fd34" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id={`homeMvpClashGlow-${match.id}`} gradientUnits="userSpaceOnUse" x1="17" y1="132" x2="82" y2="0">
                              <stop offset="0%" stopColor="#e2fd34" stopOpacity="0" />
                              <stop offset="38%" stopColor="#dfff1b" stopOpacity="0.26" />
                              <stop offset="50%" stopColor="#fbffd9" stopOpacity="0.68" />
                              <stop offset="62%" stopColor="#dfff1b" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#e2fd34" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id={`homeMvpClashMain-${match.id}`} gradientUnits="userSpaceOnUse" x1="17" y1="132" x2="82" y2="0">
                              <stop offset="0%" stopColor="#e2fd34" stopOpacity="0" />
                              <stop offset="42%" stopColor="#e2fd34" stopOpacity="0.62" />
                              <stop offset="50%" stopColor="#fbffd9" stopOpacity="0.95" />
                              <stop offset="58%" stopColor="#e2fd34" stopOpacity="0.68" />
                              <stop offset="100%" stopColor="#e2fd34" stopOpacity="0" />
                            </linearGradient>
                            <filter id={`homeMvpBlurAmbient-${match.id}`} x="-100%" y="-100%" width="300%" height="300%">
                              <feGaussianBlur stdDeviation="8" />
                            </filter>
                            <filter id={`homeMvpBlurMid-${match.id}`} x="-50%" y="-50%" width="200%" height="200%">
                              <feGaussianBlur stdDeviation="2.4" />
                            </filter>
                            <filter id={`homeMvpBlurCore-${match.id}`} x="-30%" y="-30%" width="160%" height="160%">
                              <feGaussianBlur stdDeviation="0.7" />
                            </filter>
                          </defs>
                          <line x1="17" y1="132" x2="82" y2="0" stroke={`url(#homeMvpClashAmbient-${match.id})`} strokeWidth="24" filter={`url(#homeMvpBlurAmbient-${match.id})`} />
                          <line x1="17" y1="132" x2="82" y2="0" stroke={`url(#homeMvpClashGlow-${match.id})`} strokeWidth="4.2" filter={`url(#homeMvpBlurMid-${match.id})`} />
                          <line x1="17" y1="132" x2="82" y2="0" stroke={`url(#homeMvpClashMain-${match.id})`} strokeWidth="1.55" filter={`url(#homeMvpBlurCore-${match.id})`} opacity="0.78" />
                          <line x1="17" y1="132" x2="82" y2="0" stroke={`url(#homeMvpClashMain-${match.id})`} strokeWidth="0.58" />
                          <line x1="19" y1="132" x2="84" y2="0" stroke={`url(#homeMvpClashMain-${match.id})`} strokeWidth="0.24" opacity="0.2" />
                          <circle cx="43" cy="78" r="1.1" fill="#f6ffbf" opacity="0.22" />
                          <circle cx="54" cy="48" r="0.9" fill="#e2fd34" opacity="0.22" />
                        </svg>
                        <img src={mainTournament05} alt="VS" className="home_mvp_vs_img" />
                      </span>
                      <div className="home_mvp_card_team">
                        <img src={match.team2.icon} alt="" className="home_mvp_team_icon" />
                        <p className="home_mvp_team_name">{match.team2.name}</p>
                      </div>
                    </div>
                    <div className="home_mvp_card_bottom">
                      <LoginButton
                        variant="apply"
                        className="home_mvp_vote_button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/tournament/mvp-vote?match=${match.voteMatchId}`)
                        }}
                      >
                        <span>투표하기</span>
                        <span className="home_mvp_vote_btn_arr" aria-hidden="true">›</span>
                      </LoginButton>
                      <p className="home_mvp_point_notice" aria-label="투표 시 30포인트 지급">
                        <img className="home_mvp_point_dot" src={myPointIcon} alt="" aria-hidden="true" />
                        <span>투표 시 </span>
                        <span className="home_mvp_point_highlight">+300P</span>
                        <span>지급</span>
                      </p>
                    </div>
                  </GlareHover>
                )
              })}
            </div>
            <div className="home_mvp_pagination" aria-hidden="true">
              {mvpMatches.map((_, i) => (
                <span
                  key={i}
                  className={`home_mvp_pg_dot${i === mvpActiveIndex ? ' is_active' : ''}`}
                />
              ))}
              <span className="home_mvp_pg_count">{mvpActiveIndex + 1} / {mvpMatches.length}</span>
            </div>
          </div>
        </section>

        {/* ⑧ 팀 추천 섹션 */}
        <section
          className={`home_team home_reveal_section ${visibleHomeSections.team ? 'is_visible' : ''}`}
          ref={teamSectionRef}
        >
          <div className="home_team_content_box">
            <div className="home_team_header">
              <h2 className="home_team_title">
                <span className="home_team_title_user sub_kr">AI 맞춤 추천 팀</span>
              </h2>
            </div>
            <div className="home_team_con">
              <div
                className="home_team_scroll"
                onPointerDown={handleTeamPointerDown}
                onPointerMove={handleTeamPointerMove}
                onPointerUp={handleTeamPointerEnd}
                onPointerCancel={handleTeamPointerEnd}
                onPointerLeave={handleTeamPointerEnd}
              >
                <div className="home_team_track" ref={teamTrackRef}>
                  {[...visibleTeamCards, ...visibleTeamCards].map((team, index) => (
                    <article
                      key={`${team.id}-${index}`}
                      className={`home_team_card${index >= visibleTeamCards.length ? ' is_duplicate' : ''}`}
                      aria-hidden={index >= visibleTeamCards.length}
                    >
                      <div className="home_team_card_logo">
                        <img src={team.logo} alt="" className="home_team_card_logo_img" draggable={false} />
                      </div>
                      <div className="txt">
                         <p className="home_team_card_name">{team.name}</p>
                         <p className="home_team_card_region">{team.region}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <input
        ref={cameraInputRef}
        className="home_profile_file_input"
        type="file"
        accept="image/*"
        capture="user"
        onChange={updateProfileImage}
      />
      <input
        ref={albumInputRef}
        className="home_profile_file_input"
        type="file"
        accept="image/*"
        onChange={updateProfileImage}
      />
      {isProfileSheetOpen ? (
        <div className="home_profile_sheet_layer" role="presentation">
          <button
            className="home_profile_sheet_backdrop"
            type="button"
            aria-label="프로필 사진 변경 닫기"
            onClick={() => setIsProfileSheetOpen(false)}
          />
          <section className="home_profile_sheet" role="dialog" aria-modal="true" aria-labelledby="home_profile_sheet_title">
            <div className="home_profile_sheet_handle" aria-hidden="true" />
            <h2 id="home_profile_sheet_title">프로필 사진 변경</h2>
            <div className="home_profile_sheet_actions">
              <button
                className="home_profile_sheet_action"
                type="button"
                onClick={() => openProfileCamera()}
              >
                카메라로 촬영
              </button>
              <button
                className="home_profile_sheet_action"
                type="button"
                onClick={() => albumInputRef.current?.click()}
              >
                앨범에서 선택
              </button>
            </div>
            <button
              className="home_profile_sheet_cancel"
              type="button"
              onClick={() => setIsProfileSheetOpen(false)}
            >
              취소
            </button>
          </section>
        </div>
      ) : null}
      {isCameraOpen ? (
        <div className={`home_camera_layer${isFlashing ? ' is_flashing' : ''}`} role="dialog" aria-modal="true" aria-label="프로필 사진 촬영">
          <video
            ref={cameraVideoRef}
            className={`home_camera_video${facingMode === 'user' ? ' is_mirrored' : ''}`}
            autoPlay
            muted
            playsInline
          />
          <div className="home_camera_overlay" aria-hidden="true">
            <div className="home_camera_guide_circle" />
          </div>
          <div className="home_camera_flash" aria-hidden="true" />
          <div className="home_camera_top_bar">
            <button className="home_camera_icon_btn" type="button" aria-label="촬영 닫기" onClick={closeProfileCamera}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {cameraError ? <p className="home_camera_error">{cameraError}</p> : <span className="home_camera_label">프로필 사진 촬영</span>}
          </div>
          <div className="home_camera_bottom_bar">
            <div className="home_camera_bottom_side" />
            <button className="home_camera_shutter" type="button" aria-label="촬영" onClick={captureProfilePhoto}>
              <span className="home_camera_shutter_inner" />
            </button>
            <div className="home_camera_bottom_side">
              <button className="home_camera_icon_btn" type="button" aria-label="카메라 전환" onClick={switchCamera}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <path d="M5 10C5 7.24 7.24 5 10 5h8.5l-2-2M23 18c0 2.76-2.24 5-5 5H9.5l2 2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.5 14a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Z" stroke="#fff" strokeWidth="1.8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {pendingAlbumImage ? (
        <div className="home_album_confirm_layer" role="presentation">
          <button
            className="home_album_confirm_backdrop"
            type="button"
            aria-label="사진 선택 취소"
            onClick={cancelAlbumImage}
          />
          <div className="home_album_confirm_dialog" role="dialog" aria-modal="true" aria-labelledby="album_confirm_title">
            <div className="home_album_confirm_preview_wrap">
              <img src={pendingAlbumImage} alt="선택한 프로필 사진" className="home_album_confirm_preview" />
            </div>
            <p id="album_confirm_title" className="home_album_confirm_title">이 사진으로 설정할까요?</p>
            <div className="home_album_confirm_actions">
              <button className="home_album_confirm_btn home_album_confirm_btn--cancel" type="button" onClick={cancelAlbumImage}>
                취소
              </button>
              <button className="home_album_confirm_btn home_album_confirm_btn--ok" type="button" onClick={confirmAlbumImage}>
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isBuddySheetOpen ? (
        <div
          className={`buddy_process_sheet_layer${isBuddySheetClosing ? ' is_closing' : ''}`}
          role="presentation"
        >
          <button
            className="buddy_process_sheet_backdrop"
            type="button"
            aria-label="버디 진행 안내 닫기"
            onClick={closeBuddyProcessSheet}
          />
          <section
            className="buddy_process_sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="buddy_process_sheet_title"
          >
            <div className="buddy_process_sheet_handle" aria-hidden="true" />
            <div className="buddy_process_sheet_titlebox">
              <h2 id="buddy_process_sheet_title">버디찾기, 이렇게 진행돼요</h2>
              <p>
                다가올 일정에서 버디 필요를 체크하면,
                <br />
                같은 게임 참여자 중 함께할 버디를 연결해드려요.
              </p>
            </div>
            <div className="buddy_process_sheet_grid">
              {buddyProcessSteps.map((step) => (
                <article key={step.id} className="buddy_process_step_card">
                  <img src={step.icon} alt="" className="buddy_process_step_icon" />
                  <div className="buddy_process_step_text">
                    <p className="buddy_process_step_title">
                      <span>{String(step.id).padStart(2, '0')}</span>
                      <span>{step.title}</span>
                    </p>
                    <p className="buddy_process_step_desc">{step.description}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="buddy_process_sheet_notice">
              <img src={buddyInfoIcon} alt="" />
              <span>버디는 같은 게임 참여자끼리만 연결돼요.</span>
            </p>
            <LoginButton className="buddy_process_sheet_start" onClick={() => navigate('/buddy')}>
              버디 찾기
            </LoginButton>
          </section>
        </div>
      ) : null}
    </div>
  )
}
