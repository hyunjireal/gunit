import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import resultAlertIcon from '../../asset/icons/chatbot_result_alert.svg'
import resultBatteryIcon from '../../asset/icons/chatbot_result_battery.svg'
import resultDartIcon from '../../asset/icons/chatbot_result_dart.svg'
import resultPerformanceIcon from '../../asset/icons/chatbot_result_performance.svg'
import resultToolIcon from '../../asset/icons/chatbot_result_tool.svg'
import upgradeDotSightImage from '../../asset/images/chatbot_result_img01.png'
import upgradeGripImage from '../../asset/images/chatbot_result_img02.png'
import upgradeBatteryImage from '../../asset/images/chatbot_result_img03.png'
import gaiImage from '../../asset/images/gai.png'
import './ChatAnalysis.css'

const getAnalysisImage = () => sessionStorage.getItem('gai_analysis_image') ?? gaiImage

type ChatAnalysisLocationState = {
  returnTo?: string
  returnState?: Record<string, unknown> | null
}

function getSafeReturnPath(path?: string) {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/chat')) {
    return '/home'
  }

  return path
}

const regulationItems = [
  { label: '실내 필드 탄속', value: '0.98J 이하 (약 90m/s)' },
  { label: '실외 필드 탄속', value: '1.0J 이하 (약 100m/s)' },
  { label: '보호장비', value: '고글 착용 필수 (ANSI Z87.1 이상)' },
  { label: '칼라파트', value: '이동 중 항상 장착 유지' },
]

const coreAnalysisItems = [
  { id: 'performance', icon: resultPerformanceIcon, label: '성능', value: '양호', tone: 'lime' },
  { id: 'accuracy', icon: resultDartIcon, label: '정확도', value: '보통', tone: 'green' },
  { id: 'battery', icon: resultBatteryIcon, label: '전력 효율', value: '양호', tone: 'lime' },
  { id: 'custom', icon: resultToolIcon, label: '커스텀 여지', value: '높음', tone: 'blue' },
]

const improvementItems = [
  { id: 'light', title: '광학 장비 미장착', desc: '도트사이트 추가로 명중률 향상 가능' },
  { id: 'battery', title: '배터리 위치 노출', desc: '외부 충격 시 손상 위험 존재' },
  { id: 'hopup', title: '홉업 세팅 미확인', desc: '정확도 편차가 발생할 수 있어요' },
]

const upgradeItems = [
  {
    id: 'dot-sight',
    image: upgradeDotSightImage,
    title: '도트사이트',
    desc: '명중률 크게 향상',
  },
  {
    id: 'short-grip',
    image: upgradeGripImage,
    title: '숏그립',
    desc: 'CQB 조작성 개선',
  },
  {
    id: 'battery',
    image: upgradeBatteryImage,
    title: '11.1V 배터리',
    desc: '반응 속도 향상',
  },
]

export function ChatAnalysisPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as ChatAnalysisLocationState | null
  const returnTo = getSafeReturnPath(locationState?.returnTo)
  const shouldReplaceReturn = returnTo === '/guide' || returnTo.startsWith('/guide/')
  const [uploadedImage, setUploadedImage] = useState(getAnalysisImage)
  const [sectionsVisible, setSectionsVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const syncImage = () => setUploadedImage(getAnalysisImage())

    syncImage()
    window.addEventListener('focus', syncImage)
    window.addEventListener('storage', syncImage)

    return () => {
      window.removeEventListener('focus', syncImage)
      window.removeEventListener('storage', syncImage)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setSectionsVisible(true), 300)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is_visible')
            observerRef.current?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    sectionRefs.current.forEach((el) => el && observerRef.current?.observe(el))
    return () => observerRef.current?.disconnect()
  }, [sectionsVisible])

  const setRef = (index: number) => (el: HTMLElement | null) => {
    sectionRefs.current[index] = el
    if (el && observerRef.current) observerRef.current.observe(el)
  }

  return (
    <div className="gai_report_page">
      <PageHeader title="분석 리포트" onBack={() => navigate('/chat', { replace: true, state: { returnTo, returnState: locationState?.returnState ?? null } })} />

      <div className="gai_report_scroll">
        {/* Hero */}
        <section className="gai_report_hero">
          <h2 className="gai_report_hero_title">분석 완료 장비</h2>
          <div className="gai_report_image_wrap">
            <div className="gai_report_scan_overlay" aria-hidden="true">
              <div className="gai_report_scan_line" />
              <span className="gai_report_corner tl" />
              <span className="gai_report_corner tr" />
              <span className="gai_report_corner bl" />
              <span className="gai_report_corner br" />
            </div>
            <img src={uploadedImage} className="gai_report_hero_img" alt="분석된 장비" />
            <div className="gai_report_done_badge">
              <span className="gai_report_done_dot" aria-hidden="true" />
              분석 완료
            </div>
          </div>

          <div className="gai_report_equipment_summary">
            <strong>M4A1 계열 (전동건)</strong>
            <div className="gai_report_equipment_tags" aria-label="감지된 장비 정보">
              <span>전동식 (AEG)</span>
              <span>CQB 적합</span>
              <span>6mm BB</span>
              <span>약 1.1kg</span>
            </div>
          </div>
        </section>

        <section className="gai_report_core_section gai_reveal" ref={setRef(0)}>
          <h2 className="gai_report_core_title">핵심 분석</h2>
          <div className="gai_report_core_grid">
            {coreAnalysisItems.map((item, i) => (
              <div
                className="gai_report_core_item gai_reveal_item"
                key={item.id}
                style={{ '--reveal-delay': `${i * 70}ms` } as React.CSSProperties}
              >
                <span className={`gai_report_core_icon is_${item.tone}`} aria-hidden="true">
                  <img src={item.icon} alt="" />
                </span>
                <strong>{item.label}</strong>
                <em className={`is_${item.tone}`}>{item.value}</em>
              </div>
            ))}
          </div>
        </section>

        <section className="gai_report_improvement_section gai_reveal" ref={setRef(1)}>
          <div className="gai_report_improvement_head">
            <h2>개선이 필요한 항목</h2>
            <span>전체 3개</span>
          </div>
          <div className="gai_report_improvement_list">
            {improvementItems.map((item, i) => (
              <button
                className="gai_report_improvement_item gai_reveal_item"
                key={item.id}
                type="button"
                style={{ '--reveal-delay': `${i * 70}ms` } as React.CSSProperties}
              >
                <span className="gai_report_improvement_icon" aria-hidden="true">
                  <img src={resultAlertIcon} alt="" />
                </span>
                <span className="gai_report_improvement_body">
                  <strong>{item.title}</strong>
                  <small>{item.desc}</small>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="gai_report_upgrade_section gai_reveal" ref={setRef(2)}>
          <div className="gai_report_upgrade_head">
            <h2>AI 추천 업그레이드</h2>
          </div>
          <div className="gai_report_upgrade_grid">
            {upgradeItems.map((item, i) => (
              <article
                className="gai_report_upgrade_card gai_reveal_item"
                key={item.id}
                style={{ '--reveal-delay': `${i * 80}ms` } as React.CSSProperties}
              >
                <span className="gai_report_upgrade_rank">{i + 1}</span>
                <div className="gai_report_upgrade_image">
                  <img src={item.image} alt="" />
                </div>
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Regulation */}
        <section className="gai_report_section gai_report_reg_section gai_reveal" ref={setRef(3)}>
          <h2 className="gai_report_section_title gai_report_reg_title">
            국내 장비 규정
          </h2>
          <div className="gai_report_reg_card">
            {regulationItems.map((item) => (
              <div className="gai_report_reg_row" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <div className="gai_report_bottom_space" aria-hidden="true" />
      </div>

      {/* Fixed CTA */}
      <div className="gai_report_cta">
        <button
          className="gai_report_cta_btn is_secondary"
          type="button"
          onClick={() => navigate(returnTo, { replace: shouldReplaceReturn, state: locationState?.returnState ?? null })}
        >
          홈으로 돌아가기
        </button>
        <button
          className="gai_report_cta_btn is_primary"
          type="button"
          onClick={() => navigate('/chat', { state: { resumePrompt: true, returnTo, returnState: locationState?.returnState ?? null } })}
        >
          AI에게 추가 질문
        </button>
      </div>
    </div>
  )
}
