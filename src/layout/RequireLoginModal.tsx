import { useNavigate } from 'react-router-dom'

interface RequireLoginModalProps {
  open: boolean
  onClose: () => void
}

export function RequireLoginModal({ open, onClose }: RequireLoginModalProps) {
  const navigate = useNavigate()

  if (!open) {
    return null
  }

  return (
    <div className="modal_backdrop" role="dialog" aria-modal="true">
      <div className="modal list">
        <h2>로그인이 필요한 기능이에요</h2>
        <p className="muted">신청, 글쓰기, 투표 기능은 로그인 후 이용할 수 있어요.</p>
        <button className="button primary_button" type="button" onClick={() => navigate('/login')}>
          로그인하기
        </button>
        <button className="button" type="button" onClick={onClose}>
          계속 둘러보기
        </button>
      </div>
    </div>
  )
}
