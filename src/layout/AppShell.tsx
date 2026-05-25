import { useEffect, useState, type CSSProperties } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import coachDotIcon from '../asset/icons/coach_dot.svg'
import gaiHeaderImage from '../asset/images/gai_header.png'
import gaiImage from '../asset/images/gai.png'
import { BottomNav } from './BottomNav'

const CHAT_COACHMARK_PENDING_KEY = 'airsoft:chat-coachmark-pending'
const CHAT_COACHMARK_SEEN_KEY = 'airsoft:chat-coachmark-seen'
const HOME_INTRO_RESTART_EVENT = 'airsoft:restart-home-intro'

type CoachmarkFocusRect = {
  left: number
  top: number
  width: number
  height: number
}

function shouldShowChatCoachmark(pathname: string) {
  if (typeof window === 'undefined') {
    return false
  }

  return pathname === '/home' && localStorage.getItem(CHAT_COACHMARK_PENDING_KEY) === 'true'
}

function getCoachmarkFocusRect(selector: string): CoachmarkFocusRect | null {
  const target = document.querySelector<HTMLElement>(selector)
  const frame = document.querySelector<HTMLElement>('.home_chat_coachmark_frame')

  if (!target || !frame) {
    return null
  }

  const targetRect = target.getBoundingClientRect()
  const frameRect = frame.getBoundingClientRect()

  return {
    left: targetRect.left - frameRect.left,
    top: targetRect.top - frameRect.top,
    width: targetRect.width,
    height: targetRect.height,
  }
}

function areCoachmarkRectsEqual(currentRect: CoachmarkFocusRect | null, nextRect: CoachmarkFocusRect) {
  if (!currentRect) {
    return false
  }

  return (
    Math.abs(currentRect.left - nextRect.left) < 0.5 &&
    Math.abs(currentRect.top - nextRect.top) < 0.5 &&
    Math.abs(currentRect.width - nextRect.width) < 0.5 &&
    Math.abs(currentRect.height - nextRect.height) < 0.5
  )
}

function scrollToCoachmarkTarget(selector: string, topOffset: number) {
  const target = document.querySelector<HTMLElement>(selector)

  if (!target) {
    return null
  }

  const targetTop = target.getBoundingClientRect().top + window.scrollY
  const nextScrollTop = Math.max(0, targetTop - topOffset)

  window.scrollTo({
    top: nextScrollTop,
    behavior: 'smooth',
  })

  return Math.abs(window.scrollY - nextScrollTop)
}

function getCoachmarkTargetSelector(step: number) {
  return step === 1 ? '.home_mvp_card.is_active' : '.buddy'
}

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [chatCoachmarkDismissed, setChatCoachmarkDismissed] = useState(false)
  const [chatCoachmarkStep, setChatCoachmarkStep] = useState(0)
  const [coachmarkFocusRect, setCoachmarkFocusRect] = useState<CoachmarkFocusRect | null>(null)
  const [isCoachmarkMeasuring, setIsCoachmarkMeasuring] = useState(false)
  const isMatchPage = location.pathname === '/match' || location.pathname.startsWith('/match/')
  const isMediaPage = location.pathname === '/media' || location.pathname.startsWith('/media/')
  const isMediaProfile =
    location.pathname.startsWith('/media/') && location.pathname !== '/media/list'
  const isBeginnerBoardHome = location.pathname === '/community'
  const isGeneralBoardHome = location.pathname === '/community/free'
  const isCommunityPostDetail = location.pathname.startsWith('/community/post/')
  const isTournamentMain = location.pathname === '/tournament'
  const isTournamentMvpVote = location.pathname === '/tournament/mvp-vote'
  const isTournamentMvpComplete = location.pathname === '/tournament/mvp-complete'
  const isTournamentExperience = isTournamentMain || isTournamentMvpVote || isTournamentMvpComplete
  const hasTournamentBottomNav = isTournamentMain || isTournamentMvpVote
  const isChatPage = location.pathname === '/chat'
  const isChatAnalysisPage = location.pathname === '/chat/analysis'
  const isBuddyPage = location.pathname === '/buddy' || location.pathname === '/buddy/loading'
  const isBuddyRecommendPage = location.pathname === '/buddy/recommend'
  const isBuddyDetailPage = /^\/buddy\/recommend\/[^/]+$/.test(location.pathname)
  const isMySchedulePage = location.pathname === '/my/schedule'
  const isMyPage = location.pathname === '/my'
  const isPointShopPage = location.pathname === '/my/point-shop'
  const isPointShopCouponsPage = location.pathname === '/my/point-shop/coupons'
  const isPointHistoryPage = location.pathname === '/my/point-shop/history'
  const isGuidePage = location.pathname === '/guide' || location.pathname.startsWith('/guide/')
  const isGuideHubPage = location.pathname === '/guide'
  const isGuideQuizPage = location.pathname === '/guide/quiz'
  const isMatchEditPage = /^\/match\/edit\/[^/]+$/.test(location.pathname)
  const isMatchApplyPage = /^\/match\/[^/]+\/apply$/.test(location.pathname)
  const isMatchApplyCompletePage = /^\/match\/[^/]+\/complete$/.test(location.pathname)
  const isMatchPresetEditPage = /^\/match\/presets\/[^/]+\/edit$/.test(location.pathname)
  const isMatchPresetCreatePage = location.pathname === '/match/presets/create'
  const isMatchPresetFinishPage = location.pathname === '/match/presets/finish'
  const showBottomNav =
    !isCommunityPostDetail &&
    !isChatPage &&
    !isChatAnalysisPage &&
    !isBuddyDetailPage &&
    !isBuddyPage &&
    !isBuddyRecommendPage &&
    !isGuidePage &&
    !location.pathname.startsWith('/match/schedule/') &&
    !isMatchEditPage &&
    !isMatchApplyPage &&
    !isMatchApplyCompletePage &&
    !isMatchPresetEditPage &&
    !isMatchPresetCreatePage &&
    !isMatchPresetFinishPage &&
    !isMyPage &&
    !isPointShopPage &&
    !isPointShopCouponsPage &&
    !isPointHistoryPage
  const keepTopInset = false
  const showBackButton =
    !isMatchPage &&
    !isMediaPage &&
    !isBuddyPage &&
    !isBuddyRecommendPage &&
    !isBuddyDetailPage &&
    !isMediaProfile &&
    !isBeginnerBoardHome &&
    !isGeneralBoardHome &&
    !isCommunityPostDetail &&
    !isTournamentExperience &&
    !isChatPage &&
    !isGuideHubPage &&
    !isMySchedulePage &&
    !isPointShopPage &&
    !isPointShopCouponsPage &&
    !isPointHistoryPage &&
    !isGuideQuizPage &&
    location.pathname !== '/home' &&
    location.pathname !== '/my'

  const frameClassName = [
    'mobile_frame',
    showBottomNav ? 'has_app_bottom_nav' : '',
    hasTournamentBottomNav ? 'tournament_bottom_nav_frame' : '',
    isChatPage ? 'chat_frame' : '',
    isGuideHubPage ? 'guide_hub_frame' : '',
    isMediaProfile
      ? 'media_profile_frame'
      : isGuideQuizPage
        ? 'guide_quiz_frame'
      : showBackButton
        ? 'has_app_back_button'
        : keepTopInset
          ? 'has_app_top_inset'
          : '',
  ]
    .filter(Boolean)
    .join(' ')

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/home')
  }

  const showChatCoachmark = !chatCoachmarkDismissed && shouldShowChatCoachmark(location.pathname)

  useEffect(() => {
    if (!showChatCoachmark) {
      return undefined
    }

    const preventUserScroll = (event: Event) => {
      event.preventDefault()
    }

    const preventScrollKey = (event: KeyboardEvent) => {
      if ([' ', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) {
        event.preventDefault()
      }
    }

    window.addEventListener('wheel', preventUserScroll, { passive: false })
    window.addEventListener('touchmove', preventUserScroll, { passive: false })
    window.addEventListener('keydown', preventScrollKey)

    return () => {
      window.removeEventListener('wheel', preventUserScroll)
      window.removeEventListener('touchmove', preventUserScroll)
      window.removeEventListener('keydown', preventScrollKey)
    }
  }, [showChatCoachmark])

  useEffect(() => {
    if (!showChatCoachmark || chatCoachmarkStep === 0) {
      return undefined
    }

    const targetSelector = getCoachmarkTargetSelector(chatCoachmarkStep)
    const scrollOffset = chatCoachmarkStep === 1 ? 390 : 110
    let rafId = 0
    let firstMeasureTimer = 0
    let settledMeasureTimer = 0
    let scrollIdleTimer = 0

    const measureTarget = () => {
      const nextRect = getCoachmarkFocusRect(targetSelector)

      if (!nextRect) {
        return
      }

      setCoachmarkFocusRect((currentRect) =>
        areCoachmarkRectsEqual(currentRect, nextRect) ? currentRect : nextRect,
      )
      setIsCoachmarkMeasuring(false)
    }

    const measureOnNextFrame = () => {
      if (rafId) {
        return
      }

      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        measureTarget()
      })
    }

    const scrollDistance = scrollToCoachmarkTarget(targetSelector, scrollOffset)

    if (scrollDistance !== null && scrollDistance < 8) {
      firstMeasureTimer = window.setTimeout(measureOnNextFrame, 80)
    }

    const measureAfterScrollIdle = () => {
      window.clearTimeout(scrollIdleTimer)
      scrollIdleTimer = window.setTimeout(measureOnNextFrame, 120)
    }

    settledMeasureTimer = window.setTimeout(measureOnNextFrame, 900)

    window.addEventListener('scroll', measureAfterScrollIdle, { passive: true })
    window.addEventListener('resize', measureOnNextFrame)
    window.addEventListener('orientationchange', measureOnNextFrame)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.clearTimeout(firstMeasureTimer)
      window.clearTimeout(settledMeasureTimer)
      window.clearTimeout(scrollIdleTimer)
      window.removeEventListener('scroll', measureAfterScrollIdle)
      window.removeEventListener('resize', measureOnNextFrame)
      window.removeEventListener('orientationchange', measureOnNextFrame)
    }
  }, [chatCoachmarkStep, showChatCoachmark])

  const handleChatCoachmarkClick = () => {
    if (chatCoachmarkStep < 2) {
      setIsCoachmarkMeasuring(true)
      setChatCoachmarkStep((currentStep) => currentStep + 1)
      return
    }

    closeChatCoachmark()
  }

  const closeChatCoachmark = () => {
    localStorage.removeItem(CHAT_COACHMARK_PENDING_KEY)
    localStorage.setItem(CHAT_COACHMARK_SEEN_KEY, 'true')
    setChatCoachmarkDismissed(true)
    setChatCoachmarkStep(0)
    setCoachmarkFocusRect(null)
    setIsCoachmarkMeasuring(false)
    window.dispatchEvent(new CustomEvent(HOME_INTRO_RESTART_EVENT))
  }

  const coachmarkFocusStyle = coachmarkFocusRect
    ? ({
        '--coachmark-focus-left': `${coachmarkFocusRect.left}px`,
        '--coachmark-focus-top': `${coachmarkFocusRect.top}px`,
        '--coachmark-focus-width': `${coachmarkFocusRect.width}px`,
        '--coachmark-focus-height': `${coachmarkFocusRect.height}px`,
      } as CSSProperties)
    : undefined
  const isCoachmarkTargetReady =
    chatCoachmarkStep === 0 || (!isCoachmarkMeasuring && coachmarkFocusRect !== null)

  return (
    <div className={frameClassName}>
      {showBackButton ? (
        <button className="app_back_button" type="button" aria-label="뒤로가기" onClick={goBack}>
          ‹
        </button>
      ) : null}
      <main>
        <Outlet />
      </main>
      {showBottomNav ? <BottomNav /> : null}
      {showBottomNav && showChatCoachmark ? (
        <section
          className={[
            'home_chat_coachmark',
            chatCoachmarkStep === 1 ? 'is_mvp_step' : '',
            chatCoachmarkStep === 2 ? 'is_buddy_step' : '',
            isCoachmarkTargetReady ? 'is_target_ready' : 'is_target_pending',
          ].filter(Boolean).join(' ')}
          role="dialog"
          aria-modal="true"
          aria-label="홈 기능 안내"
        >
          <button
            className="home_chat_coachmark_skip"
            type="button"
            aria-label="Skip coachmark"
            onClick={closeChatCoachmark}
          >
            Skip
          </button>
          <button
            className="home_chat_coachmark_scrim"
            type="button"
            aria-label={chatCoachmarkStep < 2 ? '다음 코치마크 보기' : '코치마크 닫기'}
            onClick={handleChatCoachmarkClick}
          />
          <div className="home_chat_coachmark_frame" style={chatCoachmarkStep > 0 ? coachmarkFocusStyle : undefined} aria-hidden="true">
            <div className="home_chat_coachmark_nav">
              <span className={chatCoachmarkStep === 0 ? 'is_active' : ''} />
              <span className={chatCoachmarkStep === 1 ? 'is_active' : ''} />
              <span className={chatCoachmarkStep === 2 ? 'is_active' : ''} />
            </div>
            {chatCoachmarkStep === 0 ? (
              <>
                <div className="home_chat_coachmark_bubble">
                  AI 챗봇 가이에게 물어보세요!
                </div>
                <p className="home_chat_coachmark_text">
                  자주 묻는 질문을 빠르게 찾고
                  <br />
                  사진을 올리면 장비를 분석해드려요.
                </p>
                <img className="home_chat_coachmark_gai" src={gaiHeaderImage} alt="" />
                <span className="home_chat_coachmark_line" />
                <img className="home_chat_coachmark_joint" src={coachDotIcon} alt="" />
                <span className="home_chat_coachmark_target">
                  <img src={gaiImage} alt="" />
                </span>
              </>
            ) : chatCoachmarkStep === 1 ? (
              <>
                <span className="home_chat_coachmark_mvp_scrim_piece home_chat_coachmark_mvp_scrim_piece--top" />
                <span className="home_chat_coachmark_mvp_scrim_piece home_chat_coachmark_mvp_scrim_piece--left" />
                <span className="home_chat_coachmark_mvp_scrim_piece home_chat_coachmark_mvp_scrim_piece--right" />
                <span className="home_chat_coachmark_mvp_scrim_piece home_chat_coachmark_mvp_scrim_piece--bottom" />
                <div className="home_chat_coachmark_bubble home_chat_coachmark_bubble--mvp">
                  내가 뽑은 MVP에게 한 표!
                </div>
                <p className="home_chat_coachmark_text home_chat_coachmark_text--mvp">
                  흥미진진한 경기 영상을 시청하고
                  <br />
                  MVP 투표 후 포인트를 모아 사용해보세요.
                </p>
                <span className="home_chat_coachmark_mvp_connector" aria-hidden="true">
                  <span className="home_chat_coachmark_mvp_connector_dot home_chat_coachmark_mvp_connector_dot--bubble" />
                  <span className="home_chat_coachmark_mvp_connector_line home_chat_coachmark_mvp_connector_line--top" />
                  <span className="home_chat_coachmark_mvp_connector_line home_chat_coachmark_mvp_connector_line--right" />
                  <span className="home_chat_coachmark_mvp_connector_line home_chat_coachmark_mvp_connector_line--button" />
                  <span className="home_chat_coachmark_mvp_connector_dot home_chat_coachmark_mvp_connector_dot--button" />
                </span>
                <span className="home_chat_coachmark_mvp_focus" />
              </>
            ) : (
              <>
                <span className="home_chat_coachmark_buddy_scrim_piece home_chat_coachmark_buddy_scrim_piece--top" />
                <span className="home_chat_coachmark_buddy_scrim_piece home_chat_coachmark_buddy_scrim_piece--left" />
                <span className="home_chat_coachmark_buddy_scrim_piece home_chat_coachmark_buddy_scrim_piece--right" />
                <span className="home_chat_coachmark_buddy_scrim_piece home_chat_coachmark_buddy_scrim_piece--bottom" />
                <span className="home_chat_coachmark_buddy_focus" />
                <span className="home_chat_coachmark_buddy_connector" aria-hidden="true">
                  <span className="home_chat_coachmark_buddy_connector_dot home_chat_coachmark_buddy_connector_dot--button" />
                  <span className="home_chat_coachmark_buddy_connector_line home_chat_coachmark_buddy_connector_line--vertical" />
                  <span className="home_chat_coachmark_buddy_connector_line home_chat_coachmark_buddy_connector_line--bottom" />
                  <span className="home_chat_coachmark_buddy_connector_dot home_chat_coachmark_buddy_connector_dot--bubble" />
                </span>
                <div className="home_chat_coachmark_bubble home_chat_coachmark_bubble--buddy">
                  혼자보다 든든한 버디 매칭
                </div>
                <p className="home_chat_coachmark_text home_chat_coachmark_text--buddy">
                  예약한 경기에 버디를 요청하고
                  <br />
                  나에게 맞는 플레이어를 찾아보세요.
                </p>
              </>
            )}
          </div>
        </section>
      ) : null}
    </div>
  )
}
