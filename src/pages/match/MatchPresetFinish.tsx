import { useNavigate } from 'react-router-dom'
import { LoginButton } from '../../components/LoginButton'
import { PageHeader } from '../../components/PageHeader'
import presetFinishImage from '../../asset/images/preset_finish.png'
import './match.css'

export function MatchPresetFinish() {
  const navigate = useNavigate()

  return (
    <div className="match_preset_finish_page">
      <PageHeader
        className="match_page_header match_preset_finish_header"
        backButtonClassName="match_page_back_button"
        layout="standard"
        title="프리셋 수정 완료"
        titleClassName="match_page_title"
        onBack={() => navigate('/match/presets')}
      />

      <main className="match_preset_finish_body">
        <section className="match_preset_finish_content" aria-labelledby="match-preset-finish-title">
          <div className="match_preset_finish_visual" aria-hidden="true">
            <img src={presetFinishImage} alt="" />
          </div>

          <div className="match_preset_finish_text">
            <h1 id="match-preset-finish-title">프리셋이 적용되었어요!</h1>
            <p>
              방금 만든 프리셋 기준으로
              <br />
              AI 매치를 추천해드릴게요
            </p>
          </div>
        </section>

        <section className="match_preset_finish_result" aria-label="현재 적용된 프리셋">
          <span>현재 적용된 프리셋</span>
          <strong>주말 즐겜용</strong>
        </section>
      </main>

      <section className="match_preset_finish_actions">
        <LoginButton className="match_preset_finish_ai_button" onClick={() => navigate('/match')}>
          AI 추천 보러가기
        </LoginButton>
        <LoginButton className="match_preset_finish_manage_button" onClick={() => navigate('/match/presets')}>
          프리셋 관리
        </LoginButton>
      </section>
    </div>
  )
}
