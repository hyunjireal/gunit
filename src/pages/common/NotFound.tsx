import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="page">
      <h1 className="page_title">페이지를 찾을 수 없어요</h1>
      <Link className="button primary_button" to="/home">홈으로</Link>
    </div>
  )
}
