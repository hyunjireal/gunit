import type { MouseEvent } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import writeIcon from '../../asset/icons/com_write.svg'
import { RequireLoginModal } from '../../layout/RequireLoginModal'
import { CommunityTopbar } from './CommunityTopbar'
import './Community.css'
import { useState } from 'react'

export function CommunityHome() {
  const location = useLocation()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const isBeginnerTab = location.pathname === '/community' || location.pathname === '/community/'
  const activeTab = isBeginnerTab ? 'beginner' : 'free'

  const handleBeginnerClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (activeTab === 'beginner') return
    navigate('/community', { state: { tabSlide: 'from-left' } })
  }

  const handleFreeClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (activeTab === 'free') return
    navigate('/community/free', { state: { tabSlide: 'from-right' } })
  }

  const write = () => {
    if (activeTab === 'beginner') {
      navigate('/community/post/create', { state: { boardContext: 'beginner' } })
      return
    }

    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigate('/community/post/create', { state: { boardContext: 'general' } })
      return
    }

    setModalOpen(true)
  }

  return (
    <div className="community_page">
      <CommunityTopbar
        activeTab={activeTab}
        onBeginnerClick={handleBeginnerClick}
        onFreeClick={handleFreeClick}
      />
      <Outlet />
      <button
        className="general_write_fab community_write_fab"
        type="button"
        aria-label="글쓰기"
        onClick={write}
      >
        <img src={writeIcon} alt="" />
      </button>
      <RequireLoginModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
