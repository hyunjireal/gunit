import { Link } from 'react-router-dom'

export function QuestionComplete() {
  return (
    <div className="page">
      <h1 className="page_title">질문이 정리되었어요</h1>
      <div className="list">
        <Link className="button primary_button" to="/community/question">커뮤니티 보기</Link>
        <Link className="button" to="/home">홈으로</Link>
      </div>
    </div>
  )
}
