import { useEffect, useState, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import KeywordTag from '../../components/KeywordTag'
import { PageHeader } from '../../components/PageHeader'
import { ReactBitsMasonry } from '../../components/ReactBitsMasonry'
import arrowDownIcon from '../../asset/icons/arrow_down.svg'
import rankingCheckIcon from '../../asset/icons/ranking_check.svg'
import userIcon from '../../asset/icons/creator_profile.svg'
import mediaMainLightBg from '../../asset/images/media_main.png'
import mediaMainBg from '../../asset/images/media_main01.png'
import mediaRankingIcon from '../../asset/images/media_ranking.svg'
import mediaFrame1 from '../../asset/images/media_1.png'
import mediaFrame2 from '../../asset/images/media_2.png'
import mediaFrame3 from '../../asset/images/media_3.png'
import mediaUser1 from '../../asset/images/media_user1.png'
import mediaUser2 from '../../asset/images/media_user2.png'
import mediaUser3 from '../../asset/images/media_user3.png'
import creatorThumbnail01 from '../../asset/images/creator_thumbnail_img01.png'
import creatorThumbnail02 from '../../asset/images/creator_thumbnail_img02.png'
import creatorThumbnail03 from '../../asset/images/creator_thumbnail_img03.png'
import creatorThumbnail04 from '../../asset/images/creator_thumbnail_img04.png'
import creatorThumbnail05 from '../../asset/images/creator_thumbnail_img05.png'
import mediaBanner01 from '../../asset/images/media_banner01.png'
import creatorGrade04 from '../../asset/images/creator_grade04.png'
import creatorGrade05 from '../../asset/images/creator_grade05.png'
import creatorGrade06 from '../../asset/images/creator_grade06.png'
import creatorGrade07 from '../../asset/images/creator_grade07.png'
import creatorGrade08 from '../../asset/images/creator_grade08.png'
import creatorGrade09 from '../../asset/images/creator_grade09.png'
import creatorGrade10 from '../../asset/images/creator_grade10.png'
import creatorGrade11 from '../../asset/images/creator_grade11.png'
import './MediaHome.css'

const podiumCreators = [
  {
    rank: 2,
    name: '하나캠',
    subscribers: '98K',
    frame: mediaFrame2,
    user: mediaUser2,
    className: 'media_podium_second',
    profileId: 'creator-002',
  },
  {
    rank: 1,
    name: '레드닷존',
    subscribers: '150K',
    frame: mediaFrame1,
    user: mediaUser1,
    className: 'media_podium_first',
    profileId: 'creator-001',
  },
  {
    rank: 3,
    name: '꼬꼬댁',
    subscribers: '63K',
    frame: mediaFrame3,
    user: mediaUser3,
    className: 'media_podium_third',
    profileId: 'creator-003',
  },
]

const videoItems = [
  {
    id: 'media-video-1',
    creator: '레드닷존',
    title: '2024 가성비 전동건 TOP 5 리뷰',
    thumbnail: creatorThumbnail01,
    views: 56,
    daysAgo: 2,
  },
  {
    id: 'media-video-2',
    creator: '하나캠',
    title: '초보자를 위한 CQB 입문 세팅',
    thumbnail: creatorThumbnail02,
    views: 18,
    daysAgo: 4,
  },
  {
    id: 'media-video-3',
    creator: '꼬꼬댁',
    title: '필드에서 바로 쓰는 엄폐 이동 팁',
    thumbnail: creatorThumbnail03,
    views: 64,
    daysAgo: 7,
  },
  {
    id: 'media-video-4',
    creator: '베키사리',
    title: '야외전 필수 장비 체크리스트',
    thumbnail: creatorThumbnail04,
    views: 29,
    daysAgo: 14,
  },
  {
    id: 'media-video-5',
    creator: '알파튜브',
    title: '팀 매치에서 콜사인 제대로 쓰는 법',
    thumbnail: creatorThumbnail05,
    views: 41,
    daysAgo: 21,
  },
]

type ContentSort = 'latest' | 'popular'

type FeedItem = {
  id: string
  avatar: string
  actorName: string
  body: string
  highlightName?: string
  bodyAfter?: string
  subtitle?: string
  time: string
  isLive?: boolean
  hasNewDot: boolean
}

const feedAvatarImages = [
  creatorGrade04,
  creatorGrade05,
  creatorGrade06,
  creatorGrade07,
  creatorGrade08,
  creatorGrade09,
  creatorGrade10,
  creatorGrade11,
]

function createFeedItemsWithUniqueAvatars(items: Omit<FeedItem, 'avatar'>[]): FeedItem[] {
  const avatarByNickname = new Map<string, string>()
  let nextAvatarIndex = Math.floor(Math.random() * feedAvatarImages.length)

  return items.map((item) => {
    const nicknameKey = item.actorName.trim()
    const existingAvatar = avatarByNickname.get(nicknameKey)

    if (existingAvatar) {
      return { ...item, avatar: existingAvatar }
    }

    const avatar = feedAvatarImages[nextAvatarIndex % feedAvatarImages.length]
    nextAvatarIndex += 1
    avatarByNickname.set(nicknameKey, avatar)

    return { ...item, avatar }
  })
}

const feedItems: FeedItem[] = createFeedItemsWithUniqueAvatars([
  {
    id: 'feed-01',
    actorName: '영은',
    body: '님이 ',
    highlightName: '레드닷존',
    bodyAfter: '님의 영상에 좋아요를 눌렀어요',
    time: '5분 전',
    hasNewDot: true,
  },
  {
    id: 'feed-02',
    actorName: '24영이',
    body: '님이 ',
    highlightName: '꼬꼬댁',
    bodyAfter: ' 팬클럽에 가입했어요',
    time: '10분 전',
    hasNewDot: true,
  },
  {
    id: 'feed-03',
    actorName: '베키사리',
    body: '님이 새로운 영상을 업로드했어요',
    subtitle: '야외전 장비 리뷰 7가지',
    time: '20분 전',
    hasNewDot: true,
  },
  {
    id: 'feed-04',
    actorName: '하나캠',
    body: '님이 라이브를 시작했어요',
    isLive: true,
    time: '1시간 전',
    hasNewDot: true,
  },
])

const CREATOR_CONTENT_VIDEO_URL = 'https://youtu.be/bnjqWY4uULA?si=dYwoqQb0AoOB7vp9'

function formatDaysAgo(daysAgo: number) {
  if (daysAgo < 7) return `${daysAgo}일 전`
  if (daysAgo % 7 === 0) return `${daysAgo / 7}주 전`
  return `${daysAgo}일 전`
}

const rankingItems = [
  { rank: 1, name: '레드닷존', score: 1500 },
  { rank: 2, name: '하나캠', score: 1225 },
  { rank: 3, name: '꼬꼬댁', score: 1080 },
  { rank: 4, name: '베키사리', score: 985 },
  { rank: 5, name: '나르마치고', score: 922 },
  { rank: 6, name: '알파튜브', score: 885 },
  { rank: 7, name: '빛나는꼬꼬', score: 823 },
  { rank: 8, name: '비온', score: 736 },
  { rank: 9, name: '깡나브리', score: 650 },
  { rank: 10, name: '육조준', score: 557 },
]

const rankingProfileByRank: Record<number, string> = {
  1: 'creator-001',
  2: 'creator-002',
  3: 'creator-003',
}

function PodiumProfile({ creator }: { creator: (typeof podiumCreators)[number] }) {
  return (
    <Link
      className={`media_podium_profile ${creator.className}`}
      to={`/media/${creator.profileId}`}
      aria-label={`${creator.name} 프로필 보기`}
    >
      <div className="media_podium_image" aria-hidden="true">
        <img className="media_podium_user" src={creator.user} alt="" />
        <img className="media_podium_frame" src={creator.frame} alt="" />
      </div>
      <strong className="media_podium_name">{creator.name}</strong>
      <p className="media_podium_subscribers">
        <img src={userIcon} alt="" aria-hidden="true" />
        <span>구독자 {creator.subscribers}</span>
      </p>
    </Link>
  )
}

export function MediaHome() {
  const navigate = useNavigate()
  const [rankingOpen, setRankingOpen] = useState(false)
  const [activeRankIndex, setActiveRankIndex] = useState(0)
  const [contentSort, setContentSort] = useState<ContentSort>('latest')
  const [introComplete, setIntroComplete] = useState(false)
  const [feedRefreshIndex, setFeedRefreshIndex] = useState(0)
  const activeRanking = rankingItems[activeRankIndex % rankingItems.length]
  const sortedVideoItems = [...videoItems].sort((a, b) => {
    if (contentSort === 'popular') {
      return b.views - a.views
    }

    return a.daysAgo - b.daysAgo
  })
  const refreshedFeedItems = feedItems.map((_, index) => (
    feedItems[(index + feedRefreshIndex) % feedItems.length]
  ))

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveRankIndex((current) => (current + 1) % rankingItems.length)
    }, 1800)
    const feedTimer = window.setInterval(() => {
      setFeedRefreshIndex((current) => (current + 1) % feedItems.length)
    }, 5200)
    const introTimer = window.setTimeout(() => {
      setIntroComplete(true)
    }, 760)

    return () => {
      window.clearInterval(timer)
      window.clearInterval(feedTimer)
      window.clearTimeout(introTimer)
    }
  }, [])

  return (
    <div className="media_page">
      <section
        className="media_hero"
        style={{
          '--media-hero-light-bg': `url(${mediaMainLightBg})`,
          '--media-hero-dark-bg': `url(${mediaMainBg})`,
        } as CSSProperties}
      >
        <PageHeader
          className="media_home_top"
          backButtonClassName="media_home_back"
          layout="standard"
          title="크리에이터 랭킹"
          variant="overlay"
          onBack={() => navigate('/home')}
        />

        <ReactBitsMasonry
          ariaLabel="크리에이터 단상"
          baseDelayMs={780}
          className="media_podium_row"
          getKey={(creator) => creator.rank}
          items={podiumCreators}
          revealOrder={[1, 0, 2]}
          renderItem={(creator) => <PodiumProfile creator={creator} />}
          staggerMs={140}
        />
      </section>

      <section className="media_ranking_section" aria-labelledby="media-ranking-title">
        <div className="media_section_title" id="media-ranking-title">
          <img src={mediaRankingIcon} alt="" aria-hidden="true" />
          <h2 className="body_sb_16">실시간 크리에이터 랭킹 TOP 10</h2>
        </div>

        <div className={`media_ranking_box ${rankingOpen ? 'is_open' : ''}`}>
          <button
            className="media_ranking_toggle"
            type="button"
            aria-expanded={rankingOpen}
            aria-label="실시간 크리에이터 랭킹 펼치기"
            onClick={() => setRankingOpen((open) => !open)}
          >
            <span className="media_ranking_left">
              <span className="media_ranking_ticker" key={activeRanking.rank}>
                <span className="media_ranking_number body_b_16">{activeRanking.rank}</span>
                <strong className="body_sb_16">{activeRanking.name}</strong>
              </span>
            </span>
            <img src={arrowDownIcon} alt="" aria-hidden="true" />
          </button>

          <ol className="media_ranking_list" aria-label="Creator ranking top 10" aria-hidden={!rankingOpen}>
              {rankingItems.map((item) => {
                const profileId = rankingProfileByRank[item.rank]
                const itemContent = (
                  <>
                    <span className="media_ranking_item_left">
                      <span className={`media_ranking_item_rank body_b_14 ${item.rank <= 3 ? 'is_top' : ''}`}>{item.rank}</span>
                      <strong className="body_b_14">{item.name}</strong>
                    </span>
                    <span className="media_ranking_item_score body_sb_14">{item.score}</span>
                  </>
                )

                return (
                  <li className={`media_ranking_item ${item.rank === activeRanking.rank ? 'is_active' : ''}`} key={item.rank}>
                    {profileId ? (
                      <Link
                        className="media_ranking_item_link"
                        to={`/media/${profileId}`}
                        tabIndex={rankingOpen ? undefined : -1}
                        aria-label={`${item.name} ?꾨줈??蹂닿린`}
                      >
                        {itemContent}
                      </Link>
                    ) : (
                      <div className="media_ranking_item_static">
                        {itemContent}
                      </div>
                    )}
                  </li>
                )
              })}
          </ol>
        </div>
      </section>

      <div className="media_promo_banner" role="img" aria-label="프로모션 배너">
        <svg className="media_banner_circuit mbcirc_tl" aria-hidden="true" width="90" height="46" viewBox="0 0 90 46" fill="none">
          <line x1="2" y1="10" x2="45" y2="10" stroke="#9BFF1A" strokeWidth="0.8" strokeOpacity="0.5" />
          <line x1="45" y1="10" x2="45" y2="4" stroke="#9BFF1A" strokeWidth="0.8" strokeOpacity="0.5" />
          <line x1="45" y1="4" x2="88" y2="4" stroke="#9BFF1A" strokeWidth="0.8" strokeOpacity="0.5" />
          <circle cx="45" cy="10" r="1.5" fill="#9BFF1A" fillOpacity="0.7" />
          <circle cx="88" cy="4" r="2" fill="#9BFF1A" fillOpacity="0.9" />
          <line x1="2" y1="24" x2="22" y2="24" stroke="#9BFF1A" strokeWidth="0.8" strokeOpacity="0.22" />
          <line x1="2" y1="36" x2="13" y2="36" stroke="#9BFF1A" strokeWidth="0.8" strokeOpacity="0.13" />
        </svg>
        <svg className="media_banner_circuit mbcirc_bc" aria-hidden="true" width="130" height="28" viewBox="0 0 130 28" fill="none">
          <line x1="0" y1="16" x2="55" y2="16" stroke="#9BFF1A" strokeWidth="0.8" strokeOpacity="0.38" />
          <line x1="55" y1="16" x2="55" y2="24" stroke="#9BFF1A" strokeWidth="0.8" strokeOpacity="0.38" />
          <line x1="55" y1="24" x2="130" y2="24" stroke="#9BFF1A" strokeWidth="0.8" strokeOpacity="0.38" />
          <circle cx="55" cy="16" r="1.5" fill="#9BFF1A" fillOpacity="0.6" />
          <circle cx="55" cy="24" r="1.5" fill="#9BFF1A" fillOpacity="0.6" />
        </svg>
        <span className="media_banner_dot mbdot1" aria-hidden="true" />
        <span className="media_banner_dot mbdot2" aria-hidden="true" />
        <span className="media_banner_dot mbdot3" aria-hidden="true" />
        <span className="media_banner_dot mbdot4" aria-hidden="true" />
        <p className="media_banner_copy">
          최애 크리에이터를 팔로우하고
          <br />
          새로운 소식을 가장 먼저 받아보세요!
        </p>
        <div className="media_banner_img_wrap" aria-hidden="true">
          <img className="media_banner_img" src={mediaBanner01} alt="" />
        </div>
      </div>

      <section className="media_feed_section" aria-labelledby="media-feed-title">
        <div className="media_feed_head">
          <h2 id="media-feed-title" className="body_b_20">팬 활동 피드</h2>
          <button className="media_feed_more_btn" type="button">더보기</button>
        </div>
        <ul className="media_feed_list" aria-label="팬 활동 목록">
          {refreshedFeedItems.map((item, idx) => (
            <li
              className="media_feed_item"
              key={`${item.id}-${feedRefreshIndex}`}
              style={{ animationDelay: `${idx * 45}ms` }}
            >
              <div className="media_feed_avatar" aria-hidden="true">
                <img src={item.avatar} alt="" />
              </div>
              <div className="media_feed_content">
                <p className="media_feed_text">
                  <span className="media_feed_actor">{item.actorName}</span>
                  {item.body}
                  {item.highlightName && (
                    <span className="media_feed_highlight">{item.highlightName}</span>
                  )}
                  {item.bodyAfter}
                  {item.isLive && (
                    <span className="media_feed_live" aria-label="라이브 중">LIVE</span>
                  )}
                </p>
                {item.subtitle && (
                  <p className="media_feed_subtitle">{item.subtitle}</p>
                )}
                <p className="media_feed_time">{item.time}</p>
              </div>
              {item.hasNewDot && <span className="media_feed_dot" aria-label="새 활동" />}
            </li>
          ))}
        </ul>
      </section>

      <section className="media_contents_section" aria-labelledby="media-contents-title">
        <div className="media_contents_head">
          <h2 id="media-contents-title" className="body_b_20">크리에이터 컨텐츠</h2>
          <div className="media_content_filters" aria-label="컨텐츠 정렬">
            <button className="media_content_filter_button" type="button" onClick={() => setContentSort('latest')}>
              <KeywordTag className={`media_content_filter ${contentSort === 'latest' ? 'is_active' : ''}`}>최신순</KeywordTag>
            </button>
            <button className="media_content_filter_button" type="button" onClick={() => setContentSort('popular')}>
              <KeywordTag className={`media_content_filter ${contentSort === 'popular' ? 'is_active' : ''}`}>인기순</KeywordTag>
            </button>
          </div>
        </div>

        <div className="media_video_list" key={contentSort}>
          {sortedVideoItems.map((item, itemIndex) => (
            <a
              className="media_video_item"
              key={item.id}
              style={{
                animationDelay: introComplete
                  ? `${itemIndex * 0.035}s`
                  : `${0.18 + itemIndex * 0.025}s`,
              }}
              href={CREATOR_CONTENT_VIDEO_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={`${item.title} 영상 열기`}
            >
              <div className="media_video_thumb" aria-hidden="true">
                <img src={item.thumbnail} alt="" loading="lazy" />
              </div>
              <div className="media_video_info">
                <div className="media_video_top">
                  <span className="body_m_14">{item.creator}</span>
                  <img src={rankingCheckIcon} alt="" aria-hidden="true" />
                </div>
                <strong className="media_video_title body_sb_16">{item.title}</strong>
                <p className="media_video_meta body_m_14">조회수 {item.views}K · {formatDaysAgo(item.daysAgo)}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
