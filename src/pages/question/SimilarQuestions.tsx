import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RequireLoginModal } from '../../layout/RequireLoginModal'

const questions = [
  '처음 경기장에 가면 어떤 장비가 필요한가요?',
  '히트 선언은 어떻게 하나요?',
  '혼자 가도 경기에 참여할 수 있나요?',
]

export function SimilarQuestions() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  const leaveQuestion = () => {
    if (isLoggedIn) {
      navigate('/question/complete')
      return
    }
    setModalOpen(true)
  }

  return (
    <div className="page">
      <h1 className="page_title">비슷한 질문이 있어요</h1>
      <section className="section">
        {questions.map((question) => <article className="card" key={question}>{question}</article>)}
      </section>
      <div className="list">
        <Link className="button primary_button" to="/question/ai-preview">AI 답변 먼저 보기</Link>
        <button className="button" type="button" onClick={leaveQuestion}>그래도 질문 남기기</button>
      </div>
      <RequireLoginModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
