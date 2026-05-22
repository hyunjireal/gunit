import { Link } from 'react-router-dom'
import './Guide.css'

export function GuideComplete() {
  return (
    <div className="page guide_complete_page">
      <section className="card guide_complete_hero">
        <span className="guide_complete_icon" aria-hidden="true">✓</span>
        <h1>가이드 완료</h1>
        <p>첫 게임 전 기본 규칙을 확인했어요. 이제 필드에서 더 안전하고 즐겁게 즐겨요!</p>
      </section>

      <section className="section">
        <Link className="card guide_next_card" to="/guide/quiz">
          <h2>초보자 퀴즈 참여하기</h2>
          <span aria-hidden="true">›</span>
        </Link>
        <Link className="card guide_next_card" to="/community/beginner">
          <h2>초보 질문방으로 가기</h2>
          <span aria-hidden="true">›</span>
        </Link>
        <Link className="card guide_next_card" to="/match">
          <h2>매치 찾으러 가기</h2>
          <span aria-hidden="true">›</span>
        </Link>
      </section>
    </div>
  )
}
