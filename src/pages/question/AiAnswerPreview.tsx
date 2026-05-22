import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RequireLoginModal } from '../../layout/RequireLoginModal'

export function AiAnswerPreview() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  const goCommunity = () => {
    if (isLoggedIn) {
      navigate('/question/complete')
      return
    }
    setModalOpen(true)
  }

  return (
    <div className="page">
      <h1 className="page_title">AI가 먼저 정리했어요</h1>
      <section className="card">
        <p>초보자 기준으로 먼저 확인해야 할 내용은 안전수칙, 현장 규정, 장비 대여 여부예요. 더 정확한 답변이 필요하면 커뮤니티에도 질문을 남길 수 있어요.</p>
      </section>
      <div className="list">
        <button className="button primary_button" type="button" onClick={goCommunity}>커뮤니티에 질문 남기기</button>
        <button className="button" type="button" onClick={() => navigate('/question/complete')}>질문 완료하기</button>
      </div>
      <RequireLoginModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
