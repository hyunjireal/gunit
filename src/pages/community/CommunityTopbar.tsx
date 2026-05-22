import type { MouseEvent } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'

type CommunityTab = 'beginner' | 'free'

type CommunityTopbarProps = {
  activeTab: CommunityTab
  onBeginnerClick?: (event: MouseEvent<HTMLAnchorElement>) => void
  onFreeClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

export function CommunityTopbar({
  activeTab,
  onBeginnerClick,
  onFreeClick,
}: CommunityTopbarProps) {
  const navigate = useNavigate()

  return (
    <div className="community_topbar_shell">
      <PageHeader
        className="community_header"
        title="커뮤니티 게시판"
        titleClassName="community_header_title"
        onBack={() => navigate('/home')}
      />
      <nav
        className={`community_tabs community_tabs--${activeTab}`}
        aria-label="커뮤니티 게시판"
      >
        <NavLink
          className={() => (activeTab === 'beginner' ? 'active' : '')}
          to="/community"
          end
          onClick={onBeginnerClick}
        >
          초보 질문방
        </NavLink>
        <NavLink
          className={() => (activeTab === 'free' ? 'active' : '')}
          to="/community/free"
          onClick={onFreeClick}
        >
          일반 게시판
        </NavLink>
      </nav>
    </div>
  )
}
