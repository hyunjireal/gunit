import { Link } from 'react-router-dom'

export function QuestionWrite() {
  return (
    <div className="page">
      <h1 className="page_title">질문 내용 정리</h1>
      <section className="section">
        <label className="field">궁금한 내용을 한 줄로 적어주세요<input className="input" /></label>
        <label className="field">상황을 조금 더 자세히 적어주세요<textarea className="textarea" /></label>
        <Link className="button primary_button" to="/question/similar">비슷한 질문 먼저 확인하기</Link>
      </section>
    </div>
  )
}
