import { useState } from 'react'
import { Link } from 'react-router-dom'
import './MediaHome.css'
import list01 from '../../asset/images/creator_list01.png'
import list02 from '../../asset/images/creator_list02.png'
import list03 from '../../asset/images/creator_list03.png'
import list04 from '../../asset/images/creator_list04.png'
import list05 from '../../asset/images/creator_list05.png'
import list06 from '../../asset/images/creator_list06.png'
import list07 from '../../asset/images/creator_list07.png'
import list08 from '../../asset/images/creator_list08.png'
import list09 from '../../asset/images/creator_list09.png'

type CreatorFilter = 'gear' | 'game'

const creatorProfiles = [
  { id: 'creator-001', name: '캡틴_서울', stat: '12.4만명', avatar: list01, category: 'gear' },
  { id: 'creator-002', name: '바이오탄 메이커', stat: '8.9만명', avatar: list02, category: 'gear' },
  { id: 'creator-004', name: '필드노트', stat: '4.7만명', avatar: list04, category: 'gear' },
  { id: 'creator-001', name: '장비분해소', stat: '3.8만명', avatar: list05, category: 'gear' },
  { id: 'creator-002', name: '렌탈가이드', stat: '3.1만명', avatar: list06, category: 'gear' },
  { id: 'creator-004', name: '고글체크', stat: '2.6만명', avatar: list08, category: 'gear' },
  { id: 'creator-003', name: '스피드런 정후', stat: '6.1만명', avatar: list03, category: 'game' },
  { id: 'creator-004', name: '포레스트 콜사인', stat: '5.3만명', avatar: list07, category: 'game' },
  { id: 'creator-003', name: '하이라이트랩', stat: '4.9만명', avatar: list09, category: 'game' },
  { id: 'creator-001', name: 'CQB 플레이북', stat: '4.2만명', avatar: list01, category: 'game' },
  { id: 'creator-002', name: '팀매치 분석실', stat: '3.7만명', avatar: list06, category: 'game' },
  { id: 'creator-003', name: 'MVP 리플레이', stat: '2.9만명', avatar: list03, category: 'game' },
] satisfies Array<{
  id: string
  name: string
  stat: string
  avatar: string
  category: CreatorFilter
}>

const creatorFilters: Array<{ label: string; value: CreatorFilter }> = [
  { label: '장비', value: 'gear' },
  { label: '게임', value: 'game' },
]

const SearchIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4.5-4.5" />
  </svg>
)

export function MediaList() {
  const [activeFilter, setActiveFilter] = useState<CreatorFilter>('gear')
  const filteredCreators = creatorProfiles.filter((creator) => creator.category === activeFilter)

  return (
    <div className="creator_list_page">
      <h1>크리에이터 리스트</h1>

      <label className="creator_list_search" aria-label="크리에이터 검색">
        <SearchIcon />
        <input type="search" />
      </label>

      <div className="creator_list_filters" aria-label="크리에이터 카테고리">
        {creatorFilters.map((filter) => (
          <button
            className={activeFilter === filter.value ? 'is_active' : ''}
            type="button"
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <section className="creator_profile_grid" aria-label="크리에이터 프로필 목록">
        {filteredCreators.map((creator, index) => (
          <Link className="creator_profile_tile" key={`${creator.name}-${index}`} to={`/media/${creator.id}`}>
            <img src={creator.avatar} alt="" />
            <strong>{creator.name}</strong>
            <span>{creator.stat}</span>
          </Link>
        ))}
      </section>
    </div>
  )
}
