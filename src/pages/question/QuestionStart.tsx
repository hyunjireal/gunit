import { Link } from 'react-router-dom'

export function QuestionStart() {
  return (
    <div className="page">
      <h1 className="page_title">무엇이 궁금한가요?</h1>
      <p className="page_description">질문을 바로 글로 올리기 전에, 상황을 먼저 정리해볼게요.</p>
      <section className="section">
        <Link className="button primary_button" to="/question/category">질문 시작하기</Link>
        <Link className="button" to="/chat" state={{ returnTo: '/question' }}>AI에게 바로 묻기</Link>
      </section>
    </div>
  )
}
