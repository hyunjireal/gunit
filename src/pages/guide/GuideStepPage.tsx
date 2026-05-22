import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { beginnerGuideSections } from '../../data/beginnerGuideSections'
import './Guide.css'

type GuideStepPageProps = {
  stepId: string
}

export function GuideStepPage({ stepId }: GuideStepPageProps) {
  const tutorialSteps = beginnerGuideSections.map((step) => ({
    ...step,
    number: step.number.replace('.', ''),
  }))

  const stepIndex = tutorialSteps.findIndex((step) => step.id === stepId)
  const currentIndex = stepIndex >= 0 ? stepIndex : 0
  const step = tutorialSteps[currentIndex]
  const prevStep = tutorialSteps[currentIndex - 1]
  const nextStep = tutorialSteps[currentIndex + 1]

  return (
    <div className="guide_tutorial_page">
      <PageHeader className="guide_tutorial_header">
        <p>AIRSOFT TUTORIAL CHECK</p>
        <div className="guide_tutorial_steps" aria-label={`가이드 ${step.number}번 단계`}>
          {tutorialSteps.map((item, index) => (
            <span className={index === currentIndex ? 'is_active' : ''} key={item.id}>
              {item.number}
            </span>
          ))}
        </div>
      </PageHeader>

      <main className="guide_tutorial_card">
        <div className="guide_tutorial_badges">
          <strong>{step.number}</strong>
          <span>필수 안전 체크</span>
        </div>

        <h1>{step.title}</h1>
        <p className="guide_tutorial_summary">{step.summary}</p>

        <section className="guide_tutorial_point_box" aria-label="핵심 체크">
          <span className="guide_tutorial_shield" aria-hidden="true">✓</span>
          <ul>
            {step.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
      </main>

      <nav className="guide_tutorial_actions" aria-label="가이드 이동">
        <Link to={prevStep ? prevStep.route : '/guide'}>
          &lt; 이전
        </Link>
        <Link to={nextStep ? nextStep.route : '/guide/complete'}>
          {nextStep ? '다음 >' : '완료 >'}
        </Link>
      </nav>
    </div>
  )
}
