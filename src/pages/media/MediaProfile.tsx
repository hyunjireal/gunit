import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import iconArrowLeft from '../../asset/icons/arrow_l.svg'
import iconInstagram from '../../asset/icons/creator_instagram.svg'
import iconShorts from '../../asset/icons/creator_shorts.svg'
import iconTiktok from '../../asset/icons/creator_tiktok.svg'
import iconTwitch from '../../asset/icons/creator_twtich.svg'
import iconYoutube from '../../asset/icons/creator_youtube.svg'
import hero01 from '../../asset/images/creator_hero_img01.png'
import hero02 from '../../asset/images/creator_hero_img02.png'
import hero03 from '../../asset/images/creator_hero_img03.png'
import shorts01 from '../../asset/images/creator_shorts_img01.png'
import shorts02 from '../../asset/images/creator_shorts_img02.png'
import shorts03 from '../../asset/images/creator_shorts_img03.png'
import shorts04 from '../../asset/images/creator_shorts_img04.png'
import shorts05 from '../../asset/images/creator_shorts_img05.png'
import youtube01 from '../../asset/images/creator_youtube_img01.png'
import youtube02 from '../../asset/images/creator_youtube_img02.png'
import youtube03 from '../../asset/images/creator_youtube_img03.png'
import youtube04 from '../../asset/images/creator_youtube_img04.png'
import youtube05 from '../../asset/images/creator_youtube_img05.png'
import './MediaProfile.css'

const CREATOR_LIKES_STORAGE_KEY = 'creatorProfileLikes'

type SocialLink = {
  id: 'youtube' | 'tiktok' | 'instagram' | 'twitch'
  icon: string
  label: string
  variant: 'plain' | 'dark' | 'brand'
}

type MediaItem = {
  id: string
  image: string
  alt: string
}

type MediaProfileData = {
  intro: string
  likes: string
  name: string
  verified?: boolean
  heroImage: string
  heroOffsetY?: number
  years: string[]
  stats: Array<{ label: string; value: string }>
  socialLinks: SocialLink[]
  youtubeItems: MediaItem[]
  shortsItems: MediaItem[]
}

const socialLinks: SocialLink[] = [
  { id: 'youtube', icon: iconYoutube, label: 'YouTube', variant: 'plain' },
  { id: 'tiktok', icon: iconTiktok, label: 'TikTok', variant: 'dark' },
  { id: 'instagram', icon: iconInstagram, label: 'Instagram', variant: 'brand' },
  { id: 'twitch', icon: iconTwitch, label: 'Twitch', variant: 'plain' },
]

const youtubeItems: MediaItem[] = [
  { id: 'youtube-01', image: youtube01, alt: '멘토와의 첫 만남 영상 썸네일' },
  { id: 'youtube-02', image: youtube02, alt: 'GUNIT 초보자 시점 입문 영상 썸네일' },
  { id: 'youtube-03', image: youtube03, alt: '랭킹 TOP5 장비 추천 영상 썸네일' },
  { id: 'youtube-04', image: youtube04, alt: '실전 하이라이트 분석 영상 썸네일' },
  { id: 'youtube-05', image: youtube05, alt: '필드 리뷰 영상 썸네일' },
]

const shortsItems: MediaItem[] = [
  { id: 'shorts-01', image: shorts01, alt: '장비 랭킹 숏츠 썸네일' },
  { id: 'shorts-02', image: shorts02, alt: 'CQB 플레이 숏츠 썸네일' },
  { id: 'shorts-03', image: shorts03, alt: '드리프트 장면 숏츠 썸네일' },
  { id: 'shorts-04', image: shorts04, alt: '필드 장면 숏츠 썸네일' },
  { id: 'shorts-05', image: shorts05, alt: '세팅 팁 숏츠 썸네일' },
]

const CREATOR_YOUTUBE_URL = 'https://youtu.be/lSeaJxZbNw4?si=Jn68hSu9WnkkkuRw'
const CREATOR_SHORTS_URL = 'https://www.youtube.com/shorts/VEkFbAMYHLI'

function readCreatorLikes() {
  if (typeof window === 'undefined') {
    return {} as Record<string, boolean>
  }

  try {
    const saved = window.localStorage.getItem(CREATOR_LIKES_STORAGE_KEY)
    return saved ? (JSON.parse(saved) as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

const mediaProfiles: Record<string, MediaProfileData> = {
  'creator-001': {
    name: '레드닷존',
    likes: '2.1K',
    verified: true,
    heroImage: hero01,
    intro:
      '에어소프트건 경기 콘텐츠를 중심으로 실전 기반의 분석과 전략을 제시하는 크리에이터입니다. 경기 흐름을 꿰뚫는 세밀한 해설과 직관적인 전달력으로 시청자들의 몰입도를 높이며, 탄탄한 전문성으로 커뮤니티 내에서 높은 신뢰를 얻고 있습니다.',
    years: ['2026', '2025', '2024', '2023', '2022'],
    stats: [
      { label: '구독자', value: '150K' },
      { label: '영상', value: '70+' },
      { label: '조회수', value: '2.3M' },
    ],
    socialLinks,
    youtubeItems,
    shortsItems,
  },
  'creator-002': {
    name: '하나캠',
    likes: '1.8K',
    verified: true,
    heroImage: hero02,
    heroOffsetY: -20,
    intro:
      '에어소프트건의 다양한 경기 상황과 플레이 스타일을 분석하며, 실전감 있는 전술 해설을 전달하는 크리에이터입니다. 경기의 핵심 장면과 흐름을 이해하기 쉽게 풀어내며, 몰입감 있는 설명과 안정적인 진행으로 시청자들에게 꾸준한 관심을 받고 있는 크리에이터입니다.',
    years: ['2026', '2025', '2024', '2023', '2022'],
    stats: [
      { label: '구독자', value: '98K' },
      { label: '영상', value: '81+' },
      { label: '조회수', value: '2.3M' },
    ],
    socialLinks,
    youtubeItems,
    shortsItems,
  },
  'creator-003': {
    name: '꼬꼬댁',
    likes: '1.7K',
    verified: true,
    heroImage: hero03,
    intro:
      '생생한 리액션과 유쾌한 진행 스타일로 많은 관심을 받고 있는 크리에이터입니다. 자연스럽고 공감 가는 반응으로 젊은 세대 시청자들과 활발히 소통하고 있으며, 어렵지 않은 설명과 친근한 분위기로 에어소프트건을 처음 접하는 초보자들의 유입에도 큰 영향을 주고 있는 크리에이터입니다.',
    years: ['2026', '2025', '2024', '2023', '2022'],
    stats: [
      { label: '구독자', value: '63K' },
      { label: '영상', value: '55+' },
      { label: '조회수', value: '2.3M' },
    ],
    socialLinks,
    youtubeItems,
    shortsItems,
  },
  'creator-004': {
    name: '필드노트',
    likes: '980',
    heroImage: hero02,
    intro:
      '현장감 있는 필드 리뷰와 매너 가이드를 중심으로 활동하는 크리에이터입니다. 처음 방문하는 사람도 부담 없이 즐길 수 있도록 실용적인 팁을 전달합니다.',
    years: ['2026', '2025', '2024', '2023', '2022'],
    stats: [
      { label: '구독자', value: '47K' },
      { label: '영상', value: '36+' },
      { label: '조회수', value: '820K' },
    ],
    socialLinks,
    youtubeItems,
    shortsItems,
  },
  'creator-005': {
    name: '하나캠',
    likes: '1.8K',
    verified: true,
    heroImage: hero02,
    heroOffsetY: -20,
    intro:
      '에어소프트건의 다양한 경기 상황과 플레이 스타일을 분석하며, 실전감 있는 전술 해설을 전달하는 크리에이터입니다. 경기의 핵심 장면과 흐름을 이해하기 쉽게 풀어내며, 몰입감 있는 설명과 안정적인 진행으로 시청자들에게 꾸준한 관심을 받고 있는 크리에이터입니다.',
    years: ['2026', '2025', '2024', '2023', '2022'],
    stats: [
      { label: '구독자', value: '98K' },
      { label: '영상', value: '81+' },
      { label: '조회수', value: '2.3M' },
    ],
    socialLinks,
    youtubeItems,
    shortsItems,
  },
}

function VerifiedBadgeIcon() {
  return (
    <svg aria-hidden="true" className="creator_detail_verified_icon" viewBox="0 0 20 21" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.3 1.2a1 1 0 0 1 1.4 0l1.2 1.1a1 1 0 0 0 .7.3l1.6-.1a1 1 0 0 1 1 .8l.3 1.5a1 1 0 0 0 .4.7l1.3.9a1 1 0 0 1 .4 1.4l-.7 1.4a1 1 0 0 0-.1.8l.7 1.4a1 1 0 0 1-.4 1.4l-1.3.8a1 1 0 0 0-.4.7l-.3 1.6a1 1 0 0 1-1 .8l-1.6-.2a1 1 0 0 0-.7.3l-1.2 1.1a1 1 0 0 1-1.4 0l-1.2-1.1a1 1 0 0 0-.7-.3l-1.6.2a1 1 0 0 1-1-.8l-.3-1.6a1 1 0 0 0-.4-.7L2.4 14a1 1 0 0 1-.4-1.4l.7-1.4a1 1 0 0 0 0-.8L2 8.9a1 1 0 0 1 .4-1.4l1.3-.9a1 1 0 0 0 .4-.7l.3-1.5a1 1 0 0 1 1-.8l1.6.1a1 1 0 0 0 .7-.3l1.2-1.1Z"
        fill="var(--color-white)"
      />
      <path d="m7.5 10.6 1.5 1.5 3.6-3.7" fill="none" stroke="var(--color-black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

function CreatorHeartIcon({ liked }: { liked: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="creator_detail_like_icon"
      viewBox="0 0 18 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13 0C15.7614 0 18 2.23858 18 5C18 6.60255 17.2448 8.02735 16.0723 8.94238L9.13379 16L2.0625 9.04492C0.813014 8.13596 0 6.66337 0 5C0 2.23858 2.23858 0 5 0C6.63574 0 8.08779 0.785653 9 2C9.91221 0.785653 11.3643 0 13 0Z"
        fill={liked ? 'var(--color-orange-red)' : 'var(--color-white)'}
        fillOpacity={liked ? 1 : 0.6}
      />
    </svg>
  )
}

export function MediaProfile() {
  const navigate = useNavigate()
  const { mediaId } = useParams()
  const resolvedMediaId = mediaId && mediaProfiles[mediaId] ? mediaId : 'creator-001'
  const profile = mediaProfiles[resolvedMediaId]
  const [activeYear, setActiveYear] = useState(profile.years[0])
  const [likedCreators, setLikedCreators] = useState<Record<string, boolean>>(() => readCreatorLikes())
  const [likeBurstKey, setLikeBurstKey] = useState(0)
  const liked = likedCreators[resolvedMediaId] ?? false

  useEffect(() => {
    setActiveYear(profile.years[0])
  }, [profile])

  const handleLikeToggle = () => {
    const nextLiked = !liked

    setLikedCreators((previous) => {
      const nextState = { ...previous, [resolvedMediaId]: nextLiked }
      window.localStorage.setItem(CREATOR_LIKES_STORAGE_KEY, JSON.stringify(nextState))
      return nextState
    })

    if (nextLiked) {
      setLikeBurstKey((current) => current + 1)
    }
  }

  return (
    <div className="creator_detail_page">
      <PageHeader
        className="creator_detail_page_header"
        backIcon={iconArrowLeft}
        layout="standard"
        title="크리에이터 프로필"
        onBack={() => navigate(-1)}
      />

      <section
        className="creator_detail_hero"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.05) 22%, rgba(0, 0, 0, 0.4) 100%), url(${profile.heroImage})`,
          backgroundPositionX: 'center',
          backgroundPositionY: `${profile.heroOffsetY ?? 0}px`,
        }}
      >
        <button
          className={`creator_detail_like_button creator_detail_like_button_floating ${liked ? 'is_liked' : ''}`}
          type="button"
          aria-label={`${profile.name} 좋아요 ${liked ? '취소' : '선택'}`}
          aria-pressed={liked}
          onClick={handleLikeToggle}
        >
          <span className="creator_detail_like_icon_shell">
            {liked && likeBurstKey > 0 ? (
              <span className="creator_detail_like_burst" key={likeBurstKey} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            ) : null}
            <CreatorHeartIcon liked={liked} />
          </span>
          <span>{profile.likes}</span>
        </button>

        <div className="creator_detail_hero_content">
          <div className="creator_detail_name_row">
            <h1>{profile.name}</h1>
            {profile.verified ? <VerifiedBadgeIcon /> : null}
          </div>

          <div className="creator_detail_socials" aria-label={`${profile.name} 소셜 채널`}>
            {profile.socialLinks.map((social) => (
              <button
                key={social.id}
                className={`creator_detail_social_button creator_detail_social_button_${social.variant}`}
                type="button"
                aria-label={`${social.label} 보기`}
              >
                <span className="creator_detail_social_button_inner">
                  <img
                    className={`creator_detail_social_icon creator_detail_social_icon_${social.id}`}
                    src={social.icon}
                    alt=""
                    aria-hidden="true"
                  />
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="creator_detail_stats_card" aria-label="크리에이터 통계">
          {profile.stats.map((stat) => (
            <div className="creator_detail_stat" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <main className="creator_detail_main">
        <section className="creator_detail_section">
          <h2>소개</h2>
          <p>{profile.intro}</p>
        </section>

        <section className="creator_detail_section creator_detail_media_section">
          <div className="creator_detail_years" aria-label="콘텐츠 연도">
            {profile.years.map((year) => (
              <button
                key={year}
                className={activeYear === year ? 'is_active' : ''}
                type="button"
                disabled={year !== '2026'}
                onClick={() => setActiveYear(year)}
              >
                {year}
              </button>
            ))}
          </div>

          <section className="creator_detail_media_block" aria-labelledby="creator-youtube-title">
            <div className="creator_detail_media_heading">
              <img src={iconYoutube} alt="" aria-hidden="true" />
              <h3 id="creator-youtube-title">크리에이터 유튜브</h3>
            </div>

            <div className="creator_detail_media_strip" aria-label={`${profile.name} 유튜브 콘텐츠`}>
              {profile.youtubeItems.map((item) => (
                <a
                  className="creator_detail_video_card"
                  key={`${activeYear}-${item.id}`}
                  href={CREATOR_YOUTUBE_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${item.alt} 유튜브 영상 열기`}
                >
                  <img src={item.image} alt={item.alt} loading="lazy" />
                </a>
              ))}
            </div>
          </section>

          <section className="creator_detail_media_block" aria-labelledby="creator-shorts-title">
            <div className="creator_detail_media_heading">
              <img src={iconShorts} alt="" aria-hidden="true" />
              <h3 id="creator-shorts-title">크리에이터 숏츠</h3>
            </div>

            <div className="creator_detail_media_strip creator_detail_media_strip_shorts" aria-label={`${profile.name} 숏츠 콘텐츠`}>
              {profile.shortsItems.map((item) => (
                <a
                  className="creator_detail_shorts_card"
                  key={`${activeYear}-${item.id}`}
                  href={CREATOR_SHORTS_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${item.alt} 유튜브 숏츠 열기`}
                >
                  <img src={item.image} alt={item.alt} loading="lazy" />
                </a>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}
