import { Link } from 'react-router-dom'
import './Guide.css'

export function GearGuide() {
  const items = [
    '처음부터 모든 장비를 구매하지 않아도 괜찮아요.',
    '장비 대여 가능 여부를 경기 상세에서 확인해요.',
    '고글, 장갑, 편한 신발은 우선적으로 확인해요.',
    '개인 장비 사용 시 현장 규정과 탄속 제한을 확인해요.',
  ]

  return (
    <div className="page">
      <h1 className="page_title">장비 가이드</h1>
      <section className="section">{items.map((item) => <article className="card" key={item}>{item}</article>)}</section>
      <Link className="button primary_button" to="/guide/terms">다음: 용어 가이드</Link>
    </div>
  )
}
