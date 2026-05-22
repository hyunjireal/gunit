import { useEffect, useRef, useState } from 'react'
import './Community.css'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import pinIcon from '../../asset/icons/com_pin.svg'
import chatSmallIcon from '../../asset/icons/com_chat02.svg'
import eyeIcon from '../../asset/icons/com_eyes.svg'
import hotFieldOne from '../../asset/images/com_field01.png'
import hotFieldTwo from '../../asset/images/com_field02.png'
import hotFieldThree from '../../asset/images/com_field03.png'
import hotFieldFour from '../../asset/images/match_list01.jpg'
import hotFieldFive from '../../asset/images/match_list02.jpg'
import hotFieldSix from '../../asset/images/match_list03.jpg'
import CategoryTag from '../../components/CategoryTag'
import MainTag from '../../components/MainTag'
import More from '../../components/More'
import { ToastMessage, useToastMessage } from '../../components/ToastMessage'
import { boardNames } from '../../data/copy'
import { boardPosts } from '../../data/mockData'
import { RequireLoginModal } from '../../layout/RequireLoginModal'
import type { BoardPost } from '../../types'
import {
  hasCommunityBookmarkStore,
  readCommunityBookmarks,
  toggleCommunityBookmark,
  writeCommunityBookmarks,
} from './communityBookmarkStore'
import { getCommunityRelativeTime, readCommunityPosts } from './communityPostStore'

const freeBoardCategories = ['전체', '자유수다', '팀원모집', '경기후기', '장비', '정보', '이벤트']
const freeBoardTypes: BoardPost['boardType'][] = ['free', 'tip', 'review']
const INITIAL_VISIBLE_GENERAL_POST_COUNT = 5

interface GeneralPostItem {
  id: string
  category: string
  title: string
  author: string
  createdAt: string
  views: number
  commentsCount: number
  saved?: boolean
  isNew?: boolean
}

type BoardListLocationState = {
  focusPostId?: string
  newPostId?: string
  toastMessage?: string
  tabSlide?: 'from-left' | 'from-right'
}

const hotPosts = [
  { id: 'hot-001', title: '서울 근교 필드 BEST 5', image: hotFieldOne, comments: 42 },
  { id: 'hot-002', title: '숲 필드 주의할 점 7가지', image: hotFieldTwo, comments: 29 },
  { id: 'hot-003', title: '장비 직구 조언 부탁드립니다', image: hotFieldThree, comments: 26 },
  { id: 'hot-004', title: '실내 CQB 입문자 추천 팁', image: hotFieldFour, comments: 38 },
  { id: 'hot-005', title: '팀플레이 포지션 정하는 법', image: hotFieldFive, comments: 21 },
  { id: 'hot-006', title: '에어소프트 총기 관리 기초', image: hotFieldSix, comments: 33 },
]

export const generalPosts: GeneralPostItem[] = [
  {
    id: 'general-001',
    category: '정보',
    title: '이번달 국내 에어소프트 행사 일정 공유',
    author: '레드도트',
    createdAt: '55분 전',
    views: 629,
    commentsCount: 138,
  },
  {
    id: 'general-002',
    category: '자유수다',
    title: '주말 야외전 다녀왔습니다. 재밌었네요',
    author: '화가난뼝아리',
    createdAt: '2시간 전',
    views: 470,
    commentsCount: 24,
  },
  {
    id: 'general-003',
    category: '팀원모집',
    title: '팀 스나이퍼 신규 팀원 모집합니다 (경험자 우대)',
    author: '블랙워리어',
    createdAt: '1시간 전',
    views: 150,
    commentsCount: 120,
  },
  {
    id: 'general-004',
    category: '장비',
    title: '신형 고글 써봤는데',
    author: '장비오리',
    createdAt: '3시간 전',
    views: 320,
    commentsCount: 138,
  },
  {
    id: 'general-005',
    category: '팀원모집',
    title: '[마포구] 이번주 주말 서바이벌 같이 가실 분 구합니다 (입문자 가능)',
    author: '필드러버',
    createdAt: '3시간 전',
    views: 320,
    commentsCount: 103,
  },
  {
    id: 'general-006',
    category: '경기후기',
    title: '비 와서 우중전 뛰었는데 안개탄 빡셌던 후기',
    author: '벙커장인',
    createdAt: '3시간 전',
    views: 320,
    commentsCount: 138,
  },
  {
    id: 'general-007',
    category: '장비',
    title: '탄창 파우치 세팅 다들 어떻게 함',
    author: '야전삽',
    createdAt: '2시간 전',
    views: 192,
    commentsCount: 138,
  },
  {
    id: 'general-008',
    category: '이벤트',
    title: '오버워치 스킨 받는 이벤트 관련 늅늅 질문입니다',
    author: '너무너무너무',
    createdAt: '3시간 전',
    views: 361,
    commentsCount: 138,
    saved: true,
  },
  {
    id: 'general-009',
    category: '자유수다',
    title: '오늘 처음 필드 다녀왔는데 생각보다 체력 소모가 크네요',
    author: '첫게임완료',
    createdAt: '20분 전',
    views: 214,
    commentsCount: 33,
  },
  {
    id: 'general-010',
    category: '자유수다',
    title: '비 오는 날 우중전 해본 분들, 신발 뭐 신으세요?',
    author: '젖은양말',
    createdAt: '1시간 전',
    views: 182,
    commentsCount: 21,
  },
  {
    id: 'general-011',
    category: '자유수다',
    title: '게임 끝나고 다들 장비 정리는 얼마나 꼼꼼하게 하나요?',
    author: '정리정돈러',
    createdAt: '3시간 전',
    views: 128,
    commentsCount: 17,
  },
  {
    id: 'general-012',
    category: '자유수다',
    title: '초보 데리고 가기 좋은 수도권 필드 추천 부탁드립니다',
    author: '주말원정',
    createdAt: '5시간 전',
    views: 267,
    commentsCount: 44,
  },
  {
    id: 'general-013',
    category: '팀원모집',
    title: '[인천] 월 2회 정기전 함께하실 팀원 모집합니다',
    author: '도시전사',
    createdAt: '35분 전',
    views: 241,
    commentsCount: 28,
  },
  {
    id: 'general-014',
    category: '팀원모집',
    title: 'CQB 위주로 뛰는 소규모 팀에서 신규 멤버 구합니다',
    author: '실내파',
    createdAt: '1시간 전',
    views: 193,
    commentsCount: 14,
  },
  {
    id: 'general-015',
    category: '팀원모집',
    title: '[경기북부] 차량 카풀 가능하신 분 같이 게임 다녀요',
    author: '필드출근',
    createdAt: '4시간 전',
    views: 158,
    commentsCount: 22,
  },
  {
    id: 'general-016',
    category: '경기후기',
    title: '이번주 실내전 후기, 운영 깔끔해서 만족도 높았습니다',
    author: '후기남겨요',
    createdAt: '40분 전',
    views: 284,
    commentsCount: 39,
  },
  {
    id: 'general-017',
    category: '경기후기',
    title: '야외 필드 첫 방문 후기, 동선이 넓어서 재밌었어요',
    author: '숲길정찰병',
    createdAt: '1시간 전',
    views: 176,
    commentsCount: 18,
  },
  {
    id: 'general-018',
    category: '경기후기',
    title: '야간전 처음 뛰어봤는데 라이트 세팅 중요하네요',
    author: '밤전문',
    createdAt: '2시간 전',
    views: 149,
    commentsCount: 15,
  },
  {
    id: 'general-019',
    category: '경기후기',
    title: '비기너 친구랑 다녀온 필드 후기, 렌탈도 괜찮았습니다',
    author: '동반입문',
    createdAt: '6시간 전',
    views: 133,
    commentsCount: 12,
  },
  {
    id: 'general-020',
    category: '장비',
    title: '초보용 체스트리그 가볍게 쓰기 좋은 모델 뭐가 있나요',
    author: '파우치고민',
    createdAt: '25분 전',
    views: 194,
    commentsCount: 26,
  },
  {
    id: 'general-021',
    category: '장비',
    title: '고글 김서림 방지제 써보신 분들 추천 제품 있나요?',
    author: '시야확보',
    createdAt: '2시간 전',
    views: 168,
    commentsCount: 19,
  },
  {
    id: 'general-022',
    category: '장비',
    title: '배터리 보관 케이스 따로 쓰시나요? 안전하게 관리하고 싶어요',
    author: '배터리보호',
    createdAt: '5시간 전',
    views: 119,
    commentsCount: 11,
  },
  {
    id: 'general-023',
    category: '정보',
    title: '초보자 대상 안전 교육 있는 필드 정리해봤습니다',
    author: '정리요정',
    createdAt: '30분 전',
    views: 341,
    commentsCount: 46,
    saved: true,
  },
  {
    id: 'general-024',
    category: '정보',
    title: '서울 근교 실내 필드 운영시간 비교표 공유합니다',
    author: '지도장인',
    createdAt: '2시간 전',
    views: 228,
    commentsCount: 31,
  },
  {
    id: 'general-025',
    category: '정보',
    title: '국내 택티컬 장비 매장 오프라인 방문 후기 모음',
    author: '오프매장탐방',
    createdAt: '4시간 전',
    views: 177,
    commentsCount: 16,
  },
  {
    id: 'general-026',
    category: '정보',
    title: '에어소프트 입문 비용 대략적으로 정리해봤어요',
    author: '입문계산기',
    createdAt: '7시간 전',
    views: 392,
    commentsCount: 54,
  },
  {
    id: 'general-027',
    category: '이벤트',
    title: '이번달 필드 할인 이벤트 정리본 업데이트했습니다',
    author: '할인추적자',
    createdAt: '45분 전',
    views: 205,
    commentsCount: 23,
  },
  {
    id: 'general-028',
    category: '이벤트',
    title: '장비 브랜드 사은품 행사 참여해보신 분 후기 궁금해요',
    author: '사은품헌터',
    createdAt: '3시간 전',
    views: 144,
    commentsCount: 12,
  },
  {
    id: 'general-029',
    category: '이벤트',
    title: '필드 협찬 미니게임 이벤트 상품 수령하신 분 있나요?',
    author: '럭키박스',
    createdAt: '6시간 전',
    views: 118,
    commentsCount: 9,
  },
  {
    id: 'general-030',
    category: '이벤트',
    title: '커뮤니티 출석 이벤트 포인트 들어온 분 체크해봐요',
    author: '출석체커',
    createdAt: '8시간 전',
    views: 156,
    commentsCount: 18,
  },
]

function getPostCategory(post: BoardPost) {
  if (post.category) {
    return post.category
  }
  if (post.boardType === 'tip') {
    return '정보'
  }
  if (post.boardType === 'review') {
    return '경기후기'
  }
  return '자유수다'
}

export function BoardList() {
  const { boardType = 'free' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as BoardListLocationState | null
  const focusPostId = locationState?.focusPostId
  const newPostId = locationState?.newPostId
  const introTimerRef = useRef<number | null>(null)
  const [enterDirection] = useState(() => locationState?.tabSlide ?? null)
  const [introComplete, setIntroComplete] = useState(false)
  const [heroCollapsed, setHeroCollapsed] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const { toast } = useToastMessage(locationState?.toastMessage)
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [selectedSort, setSelectedSort] = useState<'latest' | 'popular'>('latest')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set())
  const [storedPosts, setStoredPosts] = useState(() => readCommunityPosts())
  const filtersRef = useRef<HTMLElement | null>(null)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    const savedBookmarks = readCommunityBookmarks()

    if (hasCommunityBookmarkStore()) {
      return savedBookmarks
    }

    const initialBookmarks = new Set(generalPosts.filter((post) => post.saved).map((post) => post.id))
    writeCommunityBookmarks(initialBookmarks)

    return initialBookmarks
  })
  const typedBoard = boardType as BoardPost['boardType']
  const isFreeBoard = typedBoard === 'free'
  const storedGeneralPosts: GeneralPostItem[] = storedPosts
    .filter((post) => post.boardContext === 'general')
    .map((post) => ({
      id: post.id,
      category: post.category,
      title: post.title,
      author: post.author,
      createdAt: getCommunityRelativeTime(post.createdAtISO),
      views: post.views,
      commentsCount: post.commentsCount,
      isNew: post.isNew || post.id === newPostId,
    }))
  const posts = boardPosts.filter((post) => {
    const matchesBoard = isFreeBoard ? freeBoardTypes.includes(post.boardType) : post.boardType === typedBoard
    const matchesCategory = !isFreeBoard || selectedCategory === '전체' || getPostCategory(post) === selectedCategory

    return matchesBoard && matchesCategory
  })
  const displayPosts: GeneralPostItem[] = isFreeBoard
    ? [...storedGeneralPosts, ...generalPosts].filter((post) => selectedCategory === '전체' || post.category === selectedCategory)
    : posts.map((post) => ({
        id: post.id,
        category: getPostCategory(post),
        title: post.title,
        author: post.author,
        createdAt: post.createdAt,
        views: 320,
        commentsCount: post.commentsCount,
      }))
  const displayPostOrder = new Map(displayPosts.map((post, index) => [post.id, index]))
  const sortedDisplayPosts = [...displayPosts].sort((a, b) => {
    const aBookmarked = bookmarkedIds.has(a.id)
    const bBookmarked = bookmarkedIds.has(b.id)

    if (aBookmarked !== bBookmarked) {
      return aBookmarked ? -1 : 1
    }

    if (selectedSort === 'popular') {
      return b.commentsCount - a.commentsCount || b.views - a.views
    }

    return (displayPostOrder.get(a.id) ?? 0) - (displayPostOrder.get(b.id) ?? 0)
  })
  const categoryKey = isFreeBoard ? selectedCategory : typedBoard
  const isExpanded = expandedCategories.has(categoryKey)
  const pinnedDisplayPosts = sortedDisplayPosts.filter((post) => bookmarkedIds.has(post.id))
  const unpinnedDisplayPosts = sortedDisplayPosts.filter((post) => !bookmarkedIds.has(post.id))
  const visiblePosts = isExpanded
    ? sortedDisplayPosts
    : [...pinnedDisplayPosts, ...unpinnedDisplayPosts.slice(0, INITIAL_VISIBLE_GENERAL_POST_COUNT)]
  const hasMorePosts = unpinnedDisplayPosts.length > INITIAL_VISIBLE_GENERAL_POST_COUNT && !isExpanded

  const write = () => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigate('/community/post/create', { state: { boardContext: 'general' } })
      return
    }
    setModalOpen(true)
  }

  const openPost = (postId: string) => {
    navigate(`/community/post/${postId}`)
  }

  const toggleBookmark = (postId: string) => {
    setBookmarkedIds(toggleCommunityBookmark(postId))
  }

  const showMorePosts = () => {
    setExpandedCategories((current) => {
      const next = new Set(current)
      next.add(categoryKey)
      return next
    })
  }

  useEffect(() => {
    introTimerRef.current = window.setTimeout(() => {
      setIntroComplete(true)
    }, 760)

    return () => {
      if (introTimerRef.current !== null) {
        window.clearTimeout(introTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const syncStoredPosts = () => {
      setStoredPosts(readCommunityPosts())
    }

    window.addEventListener('focus', syncStoredPosts)
    window.addEventListener('storage', syncStoredPosts)

    return () => {
      window.removeEventListener('focus', syncStoredPosts)
      window.removeEventListener('storage', syncStoredPosts)
    }
  }, [])

  useEffect(() => {
    if (!locationState?.toastMessage) return

    const nextState = {
      ...(focusPostId ? { focusPostId } : {}),
      ...(newPostId ? { newPostId } : {}),
    }

    navigate(location.pathname, {
      replace: true,
      state: Object.keys(nextState).length ? nextState : null,
    })
  }, [focusPostId, location.pathname, locationState?.toastMessage, navigate, newPostId])

  useEffect(() => {
    if (!focusPostId) return

    const frameId = window.requestAnimationFrame(() => {
      const postCard = document.querySelector<HTMLElement>(`[data-community-post-id="${focusPostId}"]`)
      postCard?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      postCard?.focus({ preventScroll: true })
      navigate(location.pathname, { replace: true, state: null })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [focusPostId, location.pathname, navigate, visiblePosts])

  useEffect(() => {
    if (!isFreeBoard) return undefined

    const filters = filtersRef.current
    if (!filters) return undefined

    let frameId = 0
    const collapseOffset = 112

    const updateHeroCollapsed = () => {
      frameId = 0
      setHeroCollapsed(filters.getBoundingClientRect().top <= collapseOffset)
    }

    const requestHeroCollapsedUpdate = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(updateHeroCollapsed)
    }

    updateHeroCollapsed()
    window.addEventListener('scroll', requestHeroCollapsedUpdate, { passive: true })
    window.addEventListener('resize', requestHeroCollapsedUpdate)

    return () => {
      window.removeEventListener('scroll', requestHeroCollapsedUpdate)
      window.removeEventListener('resize', requestHeroCollapsedUpdate)
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [isFreeBoard])

  const toastElement = <ToastMessage toast={toast} />

  if (isFreeBoard) {
    return (
      <div className={`general_board_page${enterDirection === 'from-right' ? ' is_entering_from_right' : ''}${heroCollapsed ? ' is_hero_collapsed' : ''}`}>
        {toastElement}

        <section className="general_board_hero">
          <div className="general_board_hero_copy">
            <h1>일반 게시판</h1>
            <p>
              팀 모집, 장비 정보, 경기 후기를
              <br />
              자유롭게 공유해보세요
            </p>
          </div>
        </section>

        <section className="general_hot_section" aria-labelledby="hot-posts-heading">
          <div className="general_section_header">
            <h2 id="hot-posts-heading">오늘의 HOT 게시글</h2>
            <button className="general_more_button" type="button" aria-label="HOT 게시글 더보기">
              <More className="general_more_text" />
            </button>
          </div>
          <div className="general_hot_scroller">
            {hotPosts.map((post, postIndex) => (
              <button
                className="general_hot_card"
                key={post.title}
                type="button"
                style={{
                  animationDelay: introComplete
                    ? `${postIndex * 0.035}s`
                    : `${0.13 + postIndex * 0.025}s`,
                }}
                onClick={() => openPost(post.id)}
              >
                <span className="general_hot_image">
                  <img src={post.image} alt="" />
                  <MainTag className="general_hot_badge">HOT</MainTag>
                </span>
                <strong>{post.title}</strong>
                <span className="general_hot_stats">
                  <span>
                    <img src={eyeIcon} alt="" />
                    999+
                  </span>
                  <span>
                    <img src={chatSmallIcon} alt="" />
                    {post.comments}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="general_board_filters" ref={filtersRef} aria-label="게시글 정렬과 카테고리">
          <div className="general_sort_tabs">
            <button
              className={selectedSort === 'latest' ? 'active' : ''}
              type="button"
              onClick={() => setSelectedSort('latest')}
            >
              최신순
            </button>
            <button
              className={selectedSort === 'popular' ? 'active' : ''}
              type="button"
              onClick={() => setSelectedSort('popular')}
            >
              인기순
            </button>
          </div>
          <div className="general_category_scroller" aria-label="일반게시판 카테고리">
            {freeBoardCategories.map((category) => (
              <button
                className={selectedCategory === category ? 'active' : ''}
                type="button"
                key={category}
                onClick={() => setSelectedCategory(category)}
              >
                <CategoryTag className={selectedCategory === category ? 'active' : ''}>{category}</CategoryTag>
              </button>
            ))}
          </div>
        </section>

        <div className="general_post_list" aria-label="일반 게시글 목록">
          {visiblePosts.map((post, postIndex) => (
            <button
              className="general_post_card"
              key={post.id}
              type="button"
              data-community-post-id={post.id}
              style={{
                animationDelay: introComplete
                  ? `${postIndex * 0.035}s`
                  : `${0.18 + postIndex * 0.025}s`,
              }}
              onClick={() => openPost(post.id)}
            >
              <span className="general_post_card_top">
                <span className="general_post_labels">
                  <span className="general_post_category">{post.category}</span>
                  {post.isNew || post.id === newPostId ? <span className="community_new_badge">NEW</span> : null}
                </span>
                <span
                  className={`general_bookmark_icon${bookmarkedIds.has(post.id) ? ' is_active' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${post.title} 북마크`}
                  aria-pressed={bookmarkedIds.has(post.id)}
                  onClick={(event) => {
                    event.stopPropagation()
                    toggleBookmark(post.id)
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return
                    event.preventDefault()
                    event.stopPropagation()
                    toggleBookmark(post.id)
                  }}
                >
                  <img src={pinIcon} alt="" />
                </span>
              </span>
              <span className="general_post_title">{post.title}</span>
              <span className="general_post_meta">
                <span>
                  {post.author} · {post.createdAt}
                </span>
                <span className="general_post_stats">
                  <span>
                    <img src={eyeIcon} alt="" />
                    {post.views}
                  </span>
                  <span>
                    <img src={chatSmallIcon} alt="" />
                    {post.commentsCount}
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>

        {hasMorePosts ? (
          <div className="general_post_more_wrap">
            <More
              ariaLabel={`${selectedCategory} 게시글 더보기`}
              className="general_post_more_button"
              onClick={showMorePosts}
              style={{ fontSize: 14, fontWeight: 500, lineHeight: '18px' }}
            />
          </div>
        ) : null}

        <RequireLoginModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    )
  }

  return (
    <div className="page">
      {toastElement}
      <h1 className="page_title">{boardNames[typedBoard] ?? '게시판'}</h1>
      <section className="section">
        <input className="input" placeholder="검색" />
        <div className="chip_row"><span className="chip">전체</span><span className="chip">초보</span><span className="chip">인기</span></div>
        <button className="button primary_button" type="button" onClick={write}>글쓰기</button>
      </section>
      <section className="section">
        {displayPosts.map((post) => (
          <button className="card post_card_button" key={post.id} type="button" onClick={() => openPost(post.id)}>
            <span className="badge">{post.category}</span>
            <h2>{post.title}</h2>
            <p>{post.author} / {post.createdAt} / 댓글 {post.commentsCount}</p>
          </button>
        ))}
      </section>
      <RequireLoginModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

