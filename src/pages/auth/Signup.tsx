import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import MagicRings from '../../components/MagicRings'
import phoneNumberImage from '../../asset/images/login_number_img.png'
import arrowRightIcon from '../../asset/icons/arrow_r.svg'
import iconEyeOff from '../../asset/icons/login_eye_off.svg'
import iconLocation from '../../asset/icons/login_location.svg'
import mainProfileIcon from '../../asset/icons/main_profile01.svg'
import beginnerProfileImage from '../../asset/images/main_user01.png'
import veteranProfileImage from '../../asset/images/main_user03.png'
import { BEGINNER_MATCH_PRESET_ID, VETERAN_MATCH_PRESET_ID, writeAppliedMatchPresetId } from '../match/matchPresetStorage'
import { AuthShell } from './AuthShell'

const SIGNUP_COMPLETED_KEY = 'airsoft:signup-completed'
const SIGNUP_MODE_KEY = 'airsoft:signup-mode'
const HOME_PROFILE_IMAGE_KEY = 'airsoft:home-profile-image'
const CHAT_COACHMARK_PENDING_KEY = 'airsoft:chat-coachmark-pending'
const PROFILE_SHEET_CLOSE_DURATION = 240

type SignupModeId = 'beginner' | 'veteran'

type SignupMode = {
  id: SignupModeId
  alias: string
  formSubtitle: string
  homePreset: string
  label: string
  title: string
  description: string
}

const signupModes: SignupMode[] = [
  {
    id: 'beginner',
    label: '입문자',
    alias: '뉴비',
    title: '입문자 (뉴비)',
    description: '에어소프트건이 처음이거나 배우는 중이에요',
    homePreset: 'AI 질문 가이드, 기초 퀴즈 위주',
    formSubtitle: '입문자(뉴비) 맞춤 세팅으로 시작합니다.',
  },
  {
    id: 'veteran',
    label: '숙련자',
    alias: '베테랑',
    title: '숙련자 (베테랑)',
    description: '필드 경험이 많고, 경기 지식이 풍부해요',
    homePreset: '전술 지도, 경기 매칭 위주',
    formSubtitle: '숙련자(베테랑) 맞춤 세팅으로 시작합니다.',
  },
]

const regionOptions = [
  '서울',
  '경기 북부',
  '경기 남부',
  '인천',
  '강원',
  '대전',
  '세종',
  '충북',
  '충남',
  '광주',
  '전북',
  '전남',
  '대구',
  '경북',
  '부산',
  '울산',
  '경남',
  '제주',
]

const regionPlaceholder = '활동 지역을 선택해주세요'

const dummySignupProfile = {
  email: 'dummy3355@airsoft.test',
  password: 'Dummy3355!',
  region: '서울',
  phoneNumber: '010-3355-0000',
}

const dummyNicknameByMode: Record<SignupModeId, string> = {
  beginner: '뉴비요원3355',
  veteran: '베테랑요원3355',
}

function ChevronDownIcon({ className = 'auth_phone_chevron' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
      <path
        d="m2 4 4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="auth_region_sheet_check" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.5 8.3 6.7 11.4 12.5 4.8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function Signup() {
  const navigate = useNavigate()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const albumInputRef = useRef<HTMLInputElement>(null)
  const cameraVideoRef = useRef<HTMLVideoElement>(null)
  const profileStatusTimerRef = useRef<number | null>(null)
  const [step, setStep] = useState<'level' | 'profile'>('level')
  const [selectedModeId, setSelectedModeId] = useState<SignupModeId>('beginner')
  const [customProfileImage, setCustomProfileImage] = useState<string | null>(null)
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [region, setRegion] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [regionSheetOpen, setRegionSheetOpen] = useState(false)
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false)
  const [isProfileSheetClosing, setIsProfileSheetClosing] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [isFlashing, setIsFlashing] = useState(false)
  const [pendingAlbumImage, setPendingAlbumImage] = useState<string | null>(null)
  const [profileUploadStatus, setProfileUploadStatus] = useState<'idle' | 'loading' | 'done'>('idle')

  const selectedMode = signupModes.find((mode) => mode.id === selectedModeId) ?? signupModes[0]
  const selectedProfileImage =
    customProfileImage || (selectedMode.id === 'veteran' ? veteranProfileImage : beginnerProfileImage)
  const profilePreviewClassName = [
    'auth_signup_profile_preview',
    !customProfileImage && selectedMode.id === 'veteran' ? 'auth_signup_profile_preview--veteran' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const profileButtonClassName = [
    'auth_signup_profile_button',
    profileUploadStatus === 'loading' ? 'is-loading' : '',
    profileUploadStatus === 'done' ? 'is-done' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const magicRingSpeed = profileUploadStatus === 'loading' ? 2 : profileUploadStatus === 'done' ? 1.3 : 0.5
  const magicRingOpacity = profileUploadStatus === 'loading' ? 0.72 : profileUploadStatus === 'done' ? 0.82 : 0.24
  const nicknameError = submitted && nickname.trim() === '' ? '닉네임을 입력하세요' : ''
  const emailError = submitted && email.trim() === '' ? '이메일을 입력하세요' : ''
  const passwordError = submitted && password.trim() === '' ? '비밀번호를 입력하세요' : ''
  const passwordConfirmError = submitted && passwordConfirm.trim() === '' ? '비밀번호 확인을 입력하세요' : ''

  useEffect(() => {
    if (!regionSheetOpen) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setRegionSheetOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [regionSheetOpen])

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
    return () => {
      if (profileStatusTimerRef.current) {
        window.clearTimeout(profileStatusTimerRef.current)
      }
    }
  }, [])

  const goBack = () => {
    if (regionSheetOpen) {
      setRegionSheetOpen(false)
      return
    }

    if (step === 'profile') {
      setStep('level')
      return
    }

    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/onboarding')
  }

  const handleRegionSelect = (option: string) => {
    setRegion(option)
    setRegionSheetOpen(false)
  }

  const handleUseDummyAccount = () => {
    setNickname(dummyNicknameByMode[selectedMode.id])
    setEmail(dummySignupProfile.email)
    setPassword(dummySignupProfile.password)
    setPasswordConfirm(dummySignupProfile.password)
    setRegion(dummySignupProfile.region)
    setPhoneNumber(dummySignupProfile.phoneNumber)
    setSubmitted(false)
    setRegionSheetOpen(false)
  }

  const openProfileSheet = () => {
    setIsProfileSheetClosing(false)
    setIsProfileSheetOpen(true)
  }

  const closeProfileSheet = () => {
    if (isProfileSheetClosing) return

    setIsProfileSheetClosing(true)
    window.setTimeout(() => {
      setIsProfileSheetOpen(false)
      setIsProfileSheetClosing(false)
    }, PROFILE_SHEET_CLOSE_DURATION)
  }

  const updateProfileImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    setProfileUploadStatus('loading')
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPendingAlbumImage(reader.result)
        closeProfileSheet()
      }
    }
    reader.onerror = () => {
      setProfileUploadStatus('idle')
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const completeProfileImageUpdate = (image: string) => {
    if (profileStatusTimerRef.current) {
      window.clearTimeout(profileStatusTimerRef.current)
    }

    setProfileUploadStatus('loading')
    window.setTimeout(() => {
      setCustomProfileImage(image)
      setProfileUploadStatus('done')

      profileStatusTimerRef.current = window.setTimeout(() => {
        setProfileUploadStatus('idle')
        profileStatusTimerRef.current = null
      }, 850)
    }, 180)
  }

  const confirmAlbumImage = () => {
    if (!pendingAlbumImage) return
    completeProfileImageUpdate(pendingAlbumImage)
    setPendingAlbumImage(null)
  }

  const cancelAlbumImage = () => {
    setPendingAlbumImage(null)
    setProfileUploadStatus('idle')
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
    completeProfileImageUpdate(canvas.toDataURL('image/jpeg', 0.9))
    closeProfileCamera()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    const isVeteran = selectedMode.id === 'veteran'
    const trimmedNickname = nickname.trim()
    const trimmedEmail = email.trim()

    if (!trimmedNickname || !trimmedEmail || !password || !passwordConfirm) {
      return
    }

    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('nickname', trimmedNickname)
    localStorage.setItem('email', trimmedEmail)
    localStorage.setItem('savedEmail', trimmedEmail)
    localStorage.setItem('savedPassword', password)
    localStorage.setItem('region', region || '서울')
    localStorage.setItem('level', isVeteran ? '숙련자' : '입문자')
    localStorage.setItem('skillAlias', isVeteran ? '베테랑' : '뉴비')
    localStorage.setItem('homePreset', selectedMode.homePreset)
    localStorage.setItem('homeProfileBadge', isVeteran ? 'badge03' : 'symbol_beginner')
    localStorage.setItem('homeProfileTitle', isVeteran ? '베테랑 숙련자' : '안전제일 뉴비')
    localStorage.setItem(HOME_PROFILE_IMAGE_KEY, selectedProfileImage)
    localStorage.setItem(SIGNUP_COMPLETED_KEY, 'true')
    localStorage.setItem(SIGNUP_MODE_KEY, selectedMode.id)
    localStorage.setItem(CHAT_COACHMARK_PENDING_KEY, 'true')
    writeAppliedMatchPresetId(isVeteran ? VETERAN_MATCH_PRESET_ID : BEGINNER_MATCH_PRESET_ID)

    navigate('/home')
  }

  return (
    <AuthShell onBack={goBack} showTopbar={false} scrollLock={step === 'profile'}>
      <>
      {step === 'level' ? (
        <section className="auth_page_body auth_signup_level_page">
          <div className="auth_page_header auth_page_header_center">
            <h1 className="auth_page_title auth_page_title_medium">실력을 먼저 알려주세요</h1>
            <p className="auth_page_description auth_page_description_center">
              선택한 실력에 맞춰 가입 후 홈 화면을 맞춤 설정해드릴게요
            </p>
          </div>

          <div className="auth_signup_profile_setup">
            <button
              className={profileButtonClassName}
              type="button"
              aria-label="프로필 사진 설정"
              onClick={openProfileSheet}
            >
              <span className="auth_magic_rings" aria-hidden="true">
                <MagicRings
                  color="#e2fd34"
                  colorTwo="#9cff2f"
                  ringCount={3}
                  speed={magicRingSpeed}
                  attenuation={13}
                  lineThickness={1.35}
                  baseRadius={0.29}
                  radiusStep={0.075}
                  scaleRate={profileUploadStatus === 'loading' ? 0.08 : 0.045}
                  opacity={magicRingOpacity}
                  blur={0}
                  noiseAmount={0.025}
                  rotation={-18}
                  ringGap={1.42}
                  fadeIn={0.42}
                  fadeOut={2.65}
                  followMouse={false}
                  hoverScale={1.04}
                  parallax={0.02}
                  clickBurst={profileUploadStatus === 'done'}
                />
              </span>
              <span className="auth_signup_profile_frame">
                <img className={profilePreviewClassName} src={selectedProfileImage} alt="" />
              </span>
              <span className="auth_signup_profile_done" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M5 12.5 9.4 17 19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="auth_signup_profile_camera" aria-hidden="true">
                <img src={mainProfileIcon} alt="" />
              </span>
            </button>
            <div className="auth_signup_profile_copy">
              <strong>프로필 사진 설정</strong>
              <span>선택 사항 · 나중에 변경 가능</span>
            </div>
          </div>

          <div className="auth_option_list">
            {signupModes.map((mode) => (
              <button
                key={mode.id}
                className={`auth_option_card ${selectedMode.id === mode.id ? 'is_selected' : ''}`}
                type="button"
                onClick={() => setSelectedModeId(mode.id)}
              >
                <strong>{mode.title}</strong>
                <span>{mode.description}</span>
                <small>홈 세팅 : {mode.homePreset}</small>
              </button>
            ))}
          </div>

          <button className="auth_primary_button auth_page_footer_button" type="button" onClick={() => setStep('profile')}>
            다음
          </button>
        </section>
      ) : (
        <form className="auth_page_body auth_signup_form_page" onSubmit={handleSubmit}>
          <div className="auth_signup_scroll_area">
            <div className="auth_page_header auth_page_header_left">
              <h1 className="auth_page_title">회원가입</h1>
              <p className="auth_page_description">{selectedMode.formSubtitle}</p>
              <button className="auth_dummy_account_button" type="button" onClick={handleUseDummyAccount}>
                <span>더미 계정 사용</span>
                <img src={arrowRightIcon} alt="" aria-hidden="true" />
              </button>
            </div>

            <div className="auth_form_block auth_form_block_signup">
              <label className="auth_field">
                <span className="auth_field__label">닉네임</span>
                <input
                  className="auth_input"
                  type="text"
                  value={nickname}
                  placeholder="닉네임을 입력해주세요"
                  onChange={(event) => setNickname(event.target.value)}
                  aria-invalid={nicknameError ? 'true' : undefined}
                  aria-describedby={nicknameError ? 'signup-nickname-error' : undefined}
                />
                {nicknameError ? (
                  <span id="signup-nickname-error" className="auth_field_error">
                    {nicknameError}
                  </span>
                ) : null}
              </label>

            <label className="auth_field">
              <span className="auth_field__label">이메일</span>
              <input
                className="auth_input"
                type="text"
                inputMode="email"
                value={email}
                placeholder="이메일을 입력해주세요"
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={emailError ? 'true' : undefined}
                aria-describedby={emailError ? 'signup-email-error' : undefined}
              />
              {emailError ? (
                <span id="signup-email-error" className="auth_field_error">
                  {emailError}
                </span>
              ) : null}
            </label>

            <label className="auth_field">
              <span className="auth_field__label">비밀번호</span>
              <span className="auth_input_wrap">
                <input
                  className="auth_input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  placeholder="비밀번호를 입력해주세요"
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={passwordError ? 'true' : undefined}
                  aria-describedby={passwordError ? 'signup-password-error' : undefined}
                />
                <button
                  className="auth_input_icon_button"
                  type="button"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <img src={iconEyeOff} alt="" aria-hidden="true" />
                </button>
              </span>
              {passwordError ? (
                <span id="signup-password-error" className="auth_field_error">
                  {passwordError}
                </span>
              ) : null}
            </label>

            <label className="auth_field">
              <span className="auth_field__label">비밀번호 확인</span>
              <span className="auth_input_wrap">
                <input
                  className="auth_input"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordConfirm}
                  placeholder="비밀번호를 한 번 더 입력해주세요"
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  aria-invalid={passwordConfirmError ? 'true' : undefined}
                  aria-describedby={passwordConfirmError ? 'signup-password-confirm-error' : undefined}
                />
                <button
                  className="auth_input_icon_button"
                  type="button"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <img src={iconEyeOff} alt="" aria-hidden="true" />
                </button>
              </span>
              {passwordConfirmError ? (
                <span id="signup-password-confirm-error" className="auth_field_error">
                  {passwordConfirmError}
                </span>
              ) : null}
            </label>

            <label className="auth_field">
              <span className="auth_field__label">활동지역 (선택)</span>
              <button
                className="auth_region_field_button"
                type="button"
                aria-expanded={regionSheetOpen}
                aria-haspopup="dialog"
                onClick={() => setRegionSheetOpen(true)}
              >
                <span className={`auth_region_field_value ${region ? '' : 'is_placeholder'}`}>
                  {region || regionPlaceholder}
                </span>
                <span className="auth_region_field_suffix" aria-hidden="true">
                  <img src={iconLocation} alt="" />
                  <ChevronDownIcon className="auth_region_field_chevron" />
                </span>
              </button>
            </label>

            <label className="auth_field">
              <span className="auth_field__label">전화번호 (선택)</span>
              <span className="auth_phone_input">
                <span className="auth_phone_prefix" aria-hidden="true">
                  <img className="auth_phone_flag" src={phoneNumberImage} alt="" />
                  <ChevronDownIcon />
                </span>
                <input
                  className="auth_input auth_phone_number"
                  type="tel"
                  value={phoneNumber}
                  placeholder="(000) 000-0000"
                  onChange={(event) => setPhoneNumber(event.target.value)}
                />
              </span>
            </label>
            </div>
          </div>

          <button className="auth_primary_button auth_page_footer_button" type="submit">
            시작하기
          </button>

          {regionSheetOpen ? (
            <div className="auth_region_sheet_backdrop" onClick={() => setRegionSheetOpen(false)}>
              <div
                className="auth_region_sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-region-sheet-title"
                onClick={(event) => event.stopPropagation()}
              >
                <span className="auth_region_sheet_handle" aria-hidden="true" />

                <div className="auth_region_sheet_header">
                  <div>
                    <h2 className="auth_region_sheet_title" id="auth-region-sheet-title">
                      활동 지역 선택
                    </h2>
                  </div>

                  <button className="auth_region_sheet_close" type="button" onClick={() => setRegionSheetOpen(false)}>
                    닫기
                  </button>
                </div>

                <div className="auth_region_sheet_list">
                  {regionOptions.map((option) => {
                    const isSelected = region === option

                    return (
                      <button
                        key={option}
                        className={`auth_region_sheet_option ${isSelected ? 'is_selected' : ''}`}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleRegionSelect(option)}
                      >
                        <span>{option}</span>
                        {isSelected ? <CheckIcon /> : null}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </form>
      )}
      <input
        ref={cameraInputRef}
        className="auth_profile_file_input"
        type="file"
        accept="image/*"
        capture="user"
        onChange={updateProfileImage}
      />
      <input
        ref={albumInputRef}
        className="auth_profile_file_input"
        type="file"
        accept="image/*"
        onChange={updateProfileImage}
      />
      {isProfileSheetOpen ? (
        <div className={`auth_profile_sheet_layer${isProfileSheetClosing ? ' is-closing' : ''}`} role="presentation">
          <button
            className="auth_profile_sheet_backdrop"
            type="button"
            aria-label="프로필 사진 변경 닫기"
            onClick={closeProfileSheet}
          />
          <section className="auth_profile_sheet" role="dialog" aria-modal="true" aria-labelledby="auth_profile_sheet_title">
            <div className="auth_profile_sheet_handle" aria-hidden="true" />
            <h2 id="auth_profile_sheet_title">프로필 사진 변경</h2>
            <div className="auth_profile_sheet_actions">
              <button className="auth_profile_sheet_action" type="button" onClick={() => openProfileCamera()}>
                카메라로 촬영
              </button>
              <button className="auth_profile_sheet_action" type="button" onClick={() => albumInputRef.current?.click()}>
                앨범에서 선택
              </button>
            </div>
            <button className="auth_profile_sheet_cancel" type="button" onClick={closeProfileSheet}>
              취소
            </button>
          </section>
        </div>
      ) : null}
      {isCameraOpen ? (
        <div className={`auth_camera_layer${isFlashing ? ' is_flashing' : ''}`} role="dialog" aria-modal="true" aria-label="프로필 사진 촬영">
          <video
            ref={cameraVideoRef}
            className={`auth_camera_video${facingMode === 'user' ? ' is_mirrored' : ''}`}
            autoPlay
            muted
            playsInline
          />
          <div className="auth_camera_overlay" aria-hidden="true">
            <div className="auth_camera_guide_circle" />
          </div>
          <div className="auth_camera_flash" aria-hidden="true" />
          <div className="auth_camera_top_bar">
            <button className="auth_camera_icon_btn" type="button" aria-label="촬영 닫기" onClick={closeProfileCamera}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {cameraError ? <p className="auth_camera_error">{cameraError}</p> : <span className="auth_camera_label">프로필 사진 촬영</span>}
          </div>
          <div className="auth_camera_bottom_bar">
            <div className="auth_camera_bottom_side" />
            <button className="auth_camera_shutter" type="button" aria-label="촬영" onClick={captureProfilePhoto}>
              <span className="auth_camera_shutter_inner" />
            </button>
            <div className="auth_camera_bottom_side">
              <button className="auth_camera_icon_btn" type="button" aria-label="카메라 전환" onClick={switchCamera}>
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
        <div className="auth_album_confirm_layer" role="presentation">
          <button className="auth_album_confirm_backdrop" type="button" aria-label="사진 선택 취소" onClick={cancelAlbumImage} />
          <div className="auth_album_confirm_dialog" role="dialog" aria-modal="true" aria-labelledby="auth_album_confirm_title">
            <div className="auth_album_confirm_preview_wrap">
              <img src={pendingAlbumImage} alt="선택한 프로필 사진" className="auth_album_confirm_preview" />
            </div>
            <p id="auth_album_confirm_title" className="auth_album_confirm_title">이 사진으로 설정할까요?</p>
            <div className="auth_album_confirm_actions">
              <button className="auth_album_confirm_btn auth_album_confirm_btn--cancel" type="button" onClick={cancelAlbumImage}>
                취소
              </button>
              <button className="auth_album_confirm_btn auth_album_confirm_btn--ok" type="button" onClick={confirmAlbumImage}>
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}
      </>
    </AuthShell>
  )
}
