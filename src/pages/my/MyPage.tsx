import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import KeywordTag from '../../components/KeywordTag'
import More from '../../components/More'
import { PageHeader } from '../../components/PageHeader'
import arrowLeftIcon from '../../asset/icons/arrow_l.svg'
import profilePointArrowIcon from '../../asset/icons/arrow_r.svg'
import arrowRightIcon from '../../asset/icons/arrow_r.svg'
import mainProfileIcon from '../../asset/icons/main_profile01.svg'
import myPointIcon from '../../asset/icons/my_point.svg'
import quickBookmarkIcon from '../../asset/icons/my_quick_bookmark.svg'
import quickHandIcon from '../../asset/icons/my_quick_hand.svg'
import quickTeamIcon from '../../asset/icons/my_quick_team.svg'
import quickWriteIcon from '../../asset/icons/my_quick_write.svg'
import defaultProfileImage from '../../asset/images/main_user01.png'
import symbolBeginner from '../../asset/images/symbol_beginner.png'
import { getMyMatchGroups, type MyMatchItem } from './myMatchData'
import './my.css'

type MatchTab = 'waiting' | 'confirmed' | 'past'
type QuickMenuIconKind = 'team' | 'buddy' | 'posts' | 'saved'
type MyPageLocationState = {
  from?: string
}

const PROFILE_IMAGE_KEY = 'airsoft:home-profile-image'

function saveProfileImage(dataUrl: string) {
  try {
    localStorage.setItem(PROFILE_IMAGE_KEY, dataUrl)
  } catch {
    localStorage.removeItem(PROFILE_IMAGE_KEY)
  }

  window.dispatchEvent(new StorageEvent('storage', { key: PROFILE_IMAGE_KEY, newValue: dataUrl }))
}

type QuickMenuItem = {
  label: string
  to?: string
  icon: QuickMenuIconKind
}

type MenuItem = {
  label: string
  to?: string
}

const matchTabs: Array<{ key: MatchTab; label: string }> = [
  { key: 'waiting', label: '대기 중' },
  { key: 'confirmed', label: '확정' },
  { key: 'past', label: '지난 매치' },
]

const quickMenuItems: QuickMenuItem[] = [
  { label: '내 소속 팀', icon: 'team' },
  { label: '버디 매칭', to: '/buddy', icon: 'buddy' },
  { label: '내가 쓴 글', icon: 'posts' },
  { label: '저장한 글', icon: 'saved' },
]

const quickIconMap: Record<QuickMenuIconKind, { src: string; className: string }> = {
  team: { src: quickTeamIcon, className: 'my_quick_icon my_quick_icon_team' },
  buddy: { src: quickHandIcon, className: 'my_quick_icon my_quick_icon_buddy' },
  posts: { src: quickWriteIcon, className: 'my_quick_icon my_quick_icon_write' },
  saved: { src: quickBookmarkIcon, className: 'my_quick_icon my_quick_icon_bookmark' },
}

const teamManagementItems: MenuItem[] = [
  { label: '내 소속 팀' },
  { label: '내가 생성한 팀' },
  { label: '버디 매칭', to: '/buddy' },
]

const communityItems: MenuItem[] = [
  { label: '내가 쓴 글' },
  { label: '내가 남긴 질문' },
  { label: '저장한 글' },
]

const settingsItems: MenuItem[] = [
  { label: '알림 설정' },
  { label: '개인정보 및 보안' },
  { label: '고객센터' },
]

const profileStats = [
  { label: '활동배지', value: '준비중', disabled: true },
  { label: '받은 후기', value: '준비중', disabled: true },
  { label: '작성한 글', value: '준비중', disabled: true },
]

const moreActionStyle = {
  gap: 4,
  color: '#9f9f9f',
  fontSize: 14,
  fontWeight: 500,
  lineHeight: '130%',
  letterSpacing: '-0.02em',
} as const

function resolveProfileName(savedNickname: string | null) {
  const trimmedNickname = savedNickname?.trim()

  if (!trimmedNickname || trimmedNickname === '에어소프트 루키' || trimmedNickname === '삼삼오오 유저') {
    return '삼삼오오'
  }

  return trimmedNickname
}

function BellIcon() {
  return (
    <svg aria-hidden="true" className="my_bell_icon" viewBox="0 0 17 19" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.5 1.2a4.8 4.8 0 0 0-4.8 4.8v2.2c0 .8-.3 1.5-.8 2.1L1.7 12c-.5.6-.2 1.6.6 1.6h12.4c.8 0 1.1-1 .6-1.6L14 10.3a3.2 3.2 0 0 1-.8-2.1V6A4.8 4.8 0 0 0 8.5 1.2Zm0 16.3a2.3 2.3 0 0 0 2.1-1.4H6.4a2.3 2.3 0 0 0 2.1 1.4Z"
        fill="currentColor"
      />
    </svg>
  )
}

function PointIcon() {
  return <img aria-hidden="true" className="my_point_icon" src={myPointIcon} alt="" />
}

function QuickMenuIcon({ kind }: { kind: QuickMenuIconKind }) {
  const { src, className } = quickIconMap[kind]
  return <img aria-hidden="true" className={className} src={src} alt="" />
}

function QuickMenuLink({ item }: { item: QuickMenuItem }) {
  const content = (
    <>
      <span className="my_quick_link_left">
        <QuickMenuIcon kind={item.icon} />
        <span className="my_quick_link_label">{item.label}</span>
      </span>
      <img alt="" aria-hidden="true" className="my_quick_link_arrow" src={arrowRightIcon} />
    </>
  )

  if (!item.to) {
    return (
      <div className="my_quick_link my_quick_link_static" aria-disabled="true">
        {content}
      </div>
    )
  }

  return (
    <Link className="my_quick_link" to={item.to}>
      {content}
    </Link>
  )
}

function ListSection({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <section className="my_list_section">
      <div className="my_list_section_heading">
        <h2 className="my_section_title">{title}</h2>
      </div>
      <div className="my_list_items">
        {items.map((item) => {
          const content = (
            <>
              <span className="my_list_item_label">{item.label}</span>
              <span className="my_list_item_arrow_wrap" aria-hidden="true">
                <img alt="" className="my_list_item_arrow" src={arrowRightIcon} />
              </span>
            </>
          )

          if (!item.to) {
            return (
              <div className="my_list_item my_list_item_static" key={item.label} aria-disabled="true">
                {content}
              </div>
            )
          }

          return (
            <Link className="my_list_item" key={item.label} to={item.to}>
              {content}
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function ProfileStat({ label, value, disabled }: { label: string; value: string; disabled?: boolean }) {
  return (
    <div className={`my_profile_stat${disabled ? ' is_disabled' : ''}`} aria-disabled={disabled || undefined}>
      <p className="my_profile_stat_label">{label}</p>
      <p className="my_profile_stat_value">{value}</p>
    </div>
  )
}

function getMatchTagClassName(tagLabel: string) {
  if (tagLabel === 'D-14') {
    return 'my_match_tag my_match_tag_d14'
  }

  if (tagLabel === 'D-22') {
    return 'my_match_tag my_match_tag_d22'
  }

  return 'my_match_tag'
}

function getSafeMyBackTo(from?: string) {
  if (from && from.startsWith('/') && !from.startsWith('//') && !from.startsWith('/my')) {
    return from
  }

  return '/home'
}

function MatchCardLink({ match, myBackTo }: { match: MyMatchItem; myBackTo: string }) {
  return (
    <Link className="my_match_card" to={match.to} state={{ returnTo: '/my', myBackTo }}>
      <div className="my_match_thumb" aria-hidden="true">
        <img className="my_match_thumb_image" src={match.imageSrc} alt="" />
      </div>
      <div className="my_match_info">
        <div className="my_match_title_row">
          <KeywordTag className={getMatchTagClassName(match.tagLabel)}>{match.tagLabel}</KeywordTag>
          <p className="my_match_title">{match.title}</p>
        </div>
        <p className="my_match_meta">{match.detail}</p>
      </div>
    </Link>
  )
}

function LoginRequired({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="page">
      <section className="card">
        <h1>로그인이 필요한 메뉴예요</h1>
        <button className="button primary_button" type="button" onClick={onLogin}>
          로그인하기
        </button>
      </section>
    </div>
  )
}

function MyPageHeader({ onBack }: { onBack: () => void }) {
  return (
    <PageHeader
      className="my_header my_section_shell"
      groupClassName="my_header_left"
      backIcon={arrowLeftIcon}
      backButtonClassName="my_header_button"
      backIconClassName="my_back_icon"
      layout="section"
      title="마이페이지"
      titleClassName="my_page_title"
      onBack={onBack}
      hideProfile
      rightTrailSlot={(
        <button className="my_header_button my_bell_button is_disabled" type="button" aria-label="알림 비활성화" aria-disabled="true">
          <BellIcon />
        </button>
      )}
    />
  )
}

function LogoutModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div
      className="my_logout_modal_backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="my-logout-title"
      aria-describedby="my-logout-description"
      onClick={onCancel}
    >
      <div className="my_logout_modal" onClick={(event) => event.stopPropagation()}>
        <h2 id="my-logout-title">로그아웃 하시겠습니까?</h2>
        <p id="my-logout-description">
          현재 계정에서 로그아웃하고
          <br />
          온보딩 첫 화면으로 이동합니다
        </p>
        <div className="my_logout_modal_actions">
          <button
            className="my_logout_modal_button my_logout_modal_button_secondary"
            type="button"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            className="my_logout_modal_button my_logout_modal_button_primary"
            type="button"
            onClick={onConfirm}
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}

function ProfileInfo({
  name,
  statusLabel,
  profileImageSrc,
  onProfileEdit,
  rightSlot,
  pointLinkTo,
}: {
  name: string
  statusLabel: string
  profileImageSrc: string
  onProfileEdit: () => void
  rightSlot: ReactNode
  pointLinkTo?: string
}) {
  const pointsSlot = pointLinkTo ? (
    <Link className="my_profile_points my_profile_points_link" to={pointLinkTo}>
      {rightSlot}
    </Link>
  ) : (
    <div className="my_profile_points">{rightSlot}</div>
  )

  return (
    <section className="my_profile_section my_section_shell">
      <div className="my_profile_card">
        <div className="my_profile_top">
          <div className="my_profile_identity">
            <div className="my_profile_avatar_wrap">
              <img className="my_profile_avatar" src={profileImageSrc} alt={`${name} 프로필`} />
              <button className="my_profile_edit" type="button" aria-label="프로필 이미지 변경" onClick={onProfileEdit}>
                <img className="my_profile_edit_icon" src={mainProfileIcon} alt="" aria-hidden="true" />
              </button>
            </div>

            <div className="my_profile_text">
              <div className="my_profile_status">
                <img className="my_profile_status_icon" src={symbolBeginner} alt="" aria-hidden="true" />
                <span>{statusLabel}</span>
              </div>
              <p className="my_profile_name">
                <span>{name}</span>
                <span className="my_profile_suffix">님</span>
              </p>
            </div>
          </div>

          {pointsSlot}
        </div>

        <div className="my_profile_stats">
          {profileStats.map((stat, index) => (
            <Fragment key={stat.label}>
              {index > 0 && <div className="my_profile_stat_divider" aria-hidden="true" />}
              <ProfileStat label={stat.label} value={stat.value} disabled={stat.disabled} />
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}

export function MyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const albumInputRef = useRef<HTMLInputElement>(null)
  const cameraVideoRef = useRef<HTMLVideoElement>(null)
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true')
  const [matchTab, setMatchTab] = useState<MatchTab>('waiting')
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [scheduleRevision, setScheduleRevision] = useState(0)
  const [profileImageSrc, setProfileImageSrc] = useState(() => localStorage.getItem(PROFILE_IMAGE_KEY) || defaultProfileImage)
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [isFlashing, setIsFlashing] = useState(false)
  const [pendingAlbumImage, setPendingAlbumImage] = useState<string | null>(null)

  const savedNickname = localStorage.getItem('nickname')
  const profileName = resolveProfileName(savedNickname)
  const profileStatusLabel = localStorage.getItem('skillAlias')?.trim() || '안전제일 뉴비'
  const myMatchGroups = useMemo(() => getMyMatchGroups(), [scheduleRevision])
  const visibleMatches = {
    waiting: myMatchGroups.applied,
    confirmed: myMatchGroups.confirmed,
    past: myMatchGroups.past,
  }[matchTab]
  const activeMatchTabIndex = matchTabs.findIndex((tab) => tab.key === matchTab)
  const locationState = location.state as MyPageLocationState | null
  const myBackTo = getSafeMyBackTo(locationState?.from)

  useEffect(() => {
    const refreshSchedules = () => {
      setScheduleRevision((revision) => revision + 1)
    }

    window.addEventListener('focus', refreshSchedules)
    window.addEventListener('storage', refreshSchedules)
    window.addEventListener('pageshow', refreshSchedules)

    return () => {
      window.removeEventListener('focus', refreshSchedules)
      window.removeEventListener('storage', refreshSchedules)
      window.removeEventListener('pageshow', refreshSchedules)
    }
  }, [])

  useEffect(() => {
    const refreshProfileImage = () => {
      setProfileImageSrc(localStorage.getItem(PROFILE_IMAGE_KEY) || defaultProfileImage)
    }

    const syncProfileImage = (event: StorageEvent) => {
      if (event.key === PROFILE_IMAGE_KEY) {
        setProfileImageSrc(event.newValue || defaultProfileImage)
      }
    }

    window.addEventListener('storage', syncProfileImage)
    window.addEventListener('focus', refreshProfileImage)
    window.addEventListener('pageshow', refreshProfileImage)

    return () => {
      window.removeEventListener('storage', syncProfileImage)
      window.removeEventListener('focus', refreshProfileImage)
      window.removeEventListener('pageshow', refreshProfileImage)
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
    if (!logoutModalOpen) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLogoutModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [logoutModalOpen])

  const goBack = () => {
    navigate(myBackTo)
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
    setProfileImageSrc(pendingAlbumImage)
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
    setProfileImageSrc(nextPreview)
    saveProfileImage(nextPreview)
    closeProfileCamera()
  }

  const confirmLogout = () => {
    const keysToClear = [
      'nickname',
      'email',
      'region',
      'level',
      'skillAlias',
      'homePreset',
      'rememberLogin',
      'isLoggedIn',
    ]

    keysToClear.forEach((key) => localStorage.removeItem(key))
    setLoggedIn(false)
    setLogoutModalOpen(false)
    navigate('/onboarding', { replace: true })
  }

  if (!loggedIn) {
    return <LoginRequired onLogin={() => navigate('/login')} />
  }

  return (
    <div className="my_page">
      <MyPageHeader onBack={goBack} />

      <ProfileInfo
        name={profileName}
        statusLabel={profileStatusLabel}
        profileImageSrc={profileImageSrc}
        onProfileEdit={() => setIsProfileSheetOpen(true)}
        pointLinkTo="/my/point-shop"
        rightSlot={
          <>
            <PointIcon />
            <span className="my_profile_points_value">2,450P</span>
            <img alt="" aria-hidden="true" className="my_profile_points_arrow" src={profilePointArrowIcon} />
          </>
        }
      />

      <section className="my_matches_section my_section_shell">
        <div className="my_matches_heading">
          <h2 className="my_section_title">내 매치</h2>
          <More
            className="my_matches_more"
            style={moreActionStyle}
            state={{ from: '/my' }}
            to="/my/schedule"
          />
        </div>

        <div
          className="my_match_tabs"
          role="tablist"
          aria-label="내 매치 상태 탭"
          style={{ '--my-match-tab-index': activeMatchTabIndex } as CSSProperties}
        >
          {matchTabs.map((tab) => (
            <button
              key={tab.key}
              className={`my_match_tab${matchTab === tab.key ? ' is_active' : ''}`}
              type="button"
              role="tab"
              aria-selected={matchTab === tab.key}
              onClick={() => setMatchTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="my_match_cards" key={matchTab}>
          {visibleMatches.map((match) => (
            <MatchCardLink key={match.id} match={match} myBackTo={myBackTo} />
          ))}
        </div>
      </section>

      <section className="my_quick_section my_section_shell">
        <h2 className="my_section_title">퀵 메뉴</h2>
        <div className="my_quick_grid">
          {quickMenuItems.map((item) => (
            <QuickMenuLink key={item.label} item={item} />
          ))}
        </div>
      </section>

      <div className="my_list_group my_section_shell">
        <ListSection title="팀 관리" items={teamManagementItems} />
      </div>
      <div className="my_list_divider" aria-hidden="true" />
      <div className="my_list_group my_section_shell">
        <ListSection title="커뮤니티 활동" items={communityItems} />
      </div>
      <div className="my_list_divider" aria-hidden="true" />
      <div className="my_list_group my_section_shell">
        <ListSection title="설정" items={settingsItems} />
      </div>

      <div className="my_logout_section my_section_shell">
        <button className="my_logout_button" type="button" onClick={() => setLogoutModalOpen(true)}>
          로그아웃
        </button>
      </div>

      <input
        ref={cameraInputRef}
        className="my_profile_file_input"
        type="file"
        accept="image/*"
        capture="user"
        onChange={updateProfileImage}
      />
      <input
        ref={albumInputRef}
        className="my_profile_file_input"
        type="file"
        accept="image/*"
        onChange={updateProfileImage}
      />

      {isProfileSheetOpen ? (
        <div className="my_profile_sheet_layer" role="presentation">
          <button
            className="my_profile_sheet_backdrop"
            type="button"
            aria-label="프로필 사진 변경 닫기"
            onClick={() => setIsProfileSheetOpen(false)}
          />
          <section className="my_profile_sheet" role="dialog" aria-modal="true" aria-labelledby="my_profile_sheet_title">
            <div className="my_profile_sheet_handle" aria-hidden="true" />
            <h2 id="my_profile_sheet_title">프로필 사진 변경</h2>
            <div className="my_profile_sheet_actions">
              <button className="my_profile_sheet_action" type="button" onClick={() => openProfileCamera()}>
                카메라로 촬영
              </button>
              <button className="my_profile_sheet_action" type="button" onClick={() => albumInputRef.current?.click()}>
                앨범에서 선택
              </button>
            </div>
            <button className="my_profile_sheet_cancel" type="button" onClick={() => setIsProfileSheetOpen(false)}>
              취소
            </button>
          </section>
        </div>
      ) : null}

      {isCameraOpen ? (
        <div className={`my_camera_layer${isFlashing ? ' is_flashing' : ''}`} role="dialog" aria-modal="true" aria-label="프로필 사진 촬영">
          <video
            ref={cameraVideoRef}
            className={`my_camera_video${facingMode === 'user' ? ' is_mirrored' : ''}`}
            autoPlay
            muted
            playsInline
          />
          <div className="my_camera_overlay" aria-hidden="true">
            <div className="my_camera_guide_circle" />
          </div>
          <div className="my_camera_flash" aria-hidden="true" />
          <div className="my_camera_top_bar">
            <button className="my_camera_icon_btn" type="button" aria-label="촬영 닫기" onClick={closeProfileCamera}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {cameraError ? <p className="my_camera_error">{cameraError}</p> : <span className="my_camera_label">프로필 사진 촬영</span>}
          </div>
          <div className="my_camera_bottom_bar">
            <div className="my_camera_bottom_side" />
            <button className="my_camera_shutter" type="button" aria-label="촬영" onClick={captureProfilePhoto}>
              <span className="my_camera_shutter_inner" />
            </button>
            <div className="my_camera_bottom_side">
              <button className="my_camera_icon_btn" type="button" aria-label="카메라 전환" onClick={switchCamera}>
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
        <div className="my_album_confirm_layer" role="presentation">
          <button className="my_album_confirm_backdrop" type="button" aria-label="사진 선택 취소" onClick={cancelAlbumImage} />
          <div className="my_album_confirm_dialog" role="dialog" aria-modal="true" aria-labelledby="my_album_confirm_title">
            <div className="my_album_confirm_preview_wrap">
              <img src={pendingAlbumImage} alt="선택한 프로필 사진" className="my_album_confirm_preview" />
            </div>
            <p id="my_album_confirm_title" className="my_album_confirm_title">이 사진으로 설정할까요?</p>
            <div className="my_album_confirm_actions">
              <button className="my_album_confirm_btn my_album_confirm_btn--cancel" type="button" onClick={cancelAlbumImage}>
                취소
              </button>
              <button className="my_album_confirm_btn my_album_confirm_btn--ok" type="button" onClick={confirmAlbumImage}>
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {logoutModalOpen ? (
        <LogoutModal onCancel={() => setLogoutModalOpen(false)} onConfirm={confirmLogout} />
      ) : null}
    </div>
  )
}
