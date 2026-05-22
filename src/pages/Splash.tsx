import { useNavigate } from 'react-router-dom'
import { appName } from '../data/copy'

export function Splash() {
  const navigate = useNavigate()

  return (
    <main className="mobile_frame standalone_page">
      <div className="list" style={{ textAlign: 'center' }}>
        <h1>{appName}</h1>
        <p className="muted">에어소프트건을 더 쉽게 시작하는 방법</p>
      </div>
      <button className="button primary_button" type="button" onClick={() => navigate('/onboarding')}>
        바로 시작하기
      </button>
    </main>
  )
}
