import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RequireLoginModal } from '../../layout/RequireLoginModal'

export function MercenaryHome() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)

  const create = () => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigate('/mercenary/create')
      return
    }
    setModalOpen(true)
  }

  return (
    <div className="page">
      <h1 className="page_title">용병/게스트</h1>
      <section className="section">
        <Link className="card" to="/mercenary/list?type=guestWanted"><h2>게스트를 모집해요</h2><p>우리 팀 경기에 함께할 인원을 모집해요.</p></Link>
        <Link className="card" to="/mercenary/list?type=lookingForTeam"><h2>용병 자리를 구해요</h2><p>혼자 참여 가능한 자리를 찾아요.</p></Link>
        <button className="card" type="button" onClick={create}><h2>모집 글 작성</h2></button>
      </section>
      <RequireLoginModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
