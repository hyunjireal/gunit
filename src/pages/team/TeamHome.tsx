import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RequireLoginModal } from '../../layout/RequireLoginModal'

export function TeamHome() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)

  const create = () => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigate('/team/create')
      return
    }
    setModalOpen(true)
  }

  return (
    <div className="page">
      <h1 className="page_title">팀/용병 찾기</h1>
      <section className="section">
        <Link className="card" to="/team/list"><h2>팀 찾기</h2><p>내 지역과 플레이 스타일에 맞는 팀을 찾아요.</p></Link>
        <button className="card" type="button" onClick={create}><h2>팀 만들기</h2><p>새로운 팀 모집 글을 작성해요.</p></button>
        <Link className="card" to="/mercenary"><h2>용병/게스트</h2><p>팀에 고정 소속되지 않고 참여할 자리를 찾아요.</p></Link>
      </section>
      <RequireLoginModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
