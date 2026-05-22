import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginButton } from '../../components/LoginButton'
import { PageHeader } from '../../components/PageHeader'
import arrowLIcon from '../../asset/icons/arrow_l.svg'
import quizErrorIcon from '../../asset/icons/quiz_error.svg'
import quizInfoIcon from '../../asset/icons/quiz_info.svg'
import quizRepostIcon from '../../asset/icons/quiz_repost.svg'
import quizShieldIcon from '../../asset/icons/quiz_shield.svg'
import quizStartImage from '../../asset/images/quiz_start01.png'
import './Guide.css'

type Quiz = {
  question: string
  hint: string
  choices: string[]
  answer: string
  errorNote: string
}

const quizzes: Quiz[] = [
  {
    question: '게임 구역에 들어가기 전,\n반드시 착용해야 하는 장비는 무엇인가요?',
    hint: '안전이 최우선! 가장 기본적인 보호 장비예요.',
    choices: ['보안경(고글)', '전술 조끼', 'BB탄(탄창)', '무전기'],
    answer: '보안경(고글)',
    errorNote: '게임 구역에서는 반드시 착용해야 해요.',
  },
  {
    question: '고글이 흐려 앞이 잘 보이지 않을 때 올바른 행동은 무엇인가요?',
    hint: '시야 문제가 생기면 멈추고 운영자의 안내를 받아야 해요.',
    choices: ['잠깐 고글을 벗는다', '혼자 구석으로 이동한다', '손을 들고 운영자에게 알린다', '그대로 뛰어다닌다'],
    answer: '손을 들고 운영자에게 알린다',
    errorNote: '시야가 불편할 때도 고글을 벗지 말고 운영자에게 알려야 해요.',
  },
  {
    question: '세이프존에서 하면 안 되는 행동은 무엇인가요?',
    hint: '세이프존에서는 총구 방향과 방아쇠 관리가 중요해요.',
    choices: ['장비를 정리한다', '물을 마신다', '사람을 향해 총구를 둔다', '운영자 안내를 듣는다'],
    answer: '사람을 향해 총구를 둔다',
    errorNote: '세이프존에서도 총구는 항상 안전한 방향으로 두어야 해요.',
  },
  {
    question: '상대에게 맞았을 때 가장 먼저 해야 하는 행동은 무엇인가요?',
    hint: '히트 선언은 크게, 모두가 들을 수 있게 해주세요.',
    choices: ['바로 숨는다', '손을 들고 히트라고 말한다', '상대에게 다시 쏜다', '맞지 않은 척 이동한다'],
    answer: '손을 들고 히트라고 말한다',
    errorNote: '맞았을 때는 바로 히트를 알리고 안전하게 이동해야 해요.',
  },
  {
    question: '경기 전 가장 먼저 확인하면 좋은 것은 무엇인가요?',
    hint: '필드마다 장비와 탄속 규정이 다를 수 있어요.',
    choices: ['현장 규칙과 장비 제한', '무조건 장비 구매', '친구 장비 몰래 사용', '복장 색상만 확인'],
    answer: '현장 규칙과 장비 제한',
    errorNote: '경기 전에는 현장 규칙과 장비 제한을 먼저 확인해야 해요.',
  },
  {
    question: '가까운 거리에서 상대를 발견했을 때 좋은 판단은 무엇인가요?',
    hint: '근거리 상황은 필드 규정과 운영자 안내를 우선해요.',
    choices: ['무조건 사격한다', '안전거리와 권고를 따른다', '큰 소리로 겁준다', '장난으로 위협한다'],
    answer: '안전거리와 권고를 따른다',
    errorNote: '가까운 거리에서는 필드의 안전거리와 권고를 따라야 해요.',
  },
  {
    question: '이동 중 에어소프트건을 들고 있을 때 기본 자세는 무엇인가요?',
    hint: '총구와 방아쇠 관리는 기본 안전 습관이에요.',
    choices: ['사람을 향해 겨눈다', '방아쇠에 손가락을 올린다', '총구를 안전한 방향으로 둔다', '옆면에 숨긴다'],
    answer: '총구를 안전한 방향으로 둔다',
    errorNote: '이동할 때는 총구를 안전한 방향으로 두는 것이 기본이에요.',
  },
  {
    question: '운영자의 경기 중지 안내가 들렸다면 어떻게 해야 하나요?',
    hint: '운영자 안내는 안전 상황일 수 있어 즉시 따라야 해요.',
    choices: ['계속 진행한다', '즉시 사격을 멈추고 안내를 따른다', '몰래 위치를 바꾼다', '장비를 만지며 발사한다'],
    answer: '즉시 사격을 멈추고 안내를 따른다',
    errorNote: '경기 중지 안내가 들리면 즉시 멈추고 안내를 따라야 해요.',
  },
  {
    question: '필드 밖으로 이동할 때 장비는 어떻게 두는 것이 좋을까요?',
    hint: '이동 중 오해와 위험을 줄이는 보관이 필요해요.',
    choices: ['노출한 채 들고 간다', '케이스나 가방에 넣어 이동한다', '공공장소에서 충전한다', '장난으로 겨눈다'],
    answer: '케이스나 가방에 넣어 이동한다',
    errorNote: '필드 밖에서는 장비를 케이스나 가방에 넣어 이동해야 해요.',
  },
  {
    question: '처음 가는 필드에서 가장 좋은 행동은 무엇인가요?',
    hint: '모르는 규칙은 시작 전에 질문하는 것이 안전해요.',
    choices: ['브리핑을 대충 듣는다', '모르는 규칙은 시작 전에 질문한다', '주변 사람만 따라 한다', '규칙을 모르고 바로 시작한다'],
    answer: '모르는 규칙은 시작 전에 질문한다',
    errorNote: '처음 가는 필드에서는 모르는 규칙을 시작 전에 꼭 질문해야 해요.',
  },
]

const choiceLabels = ['A', 'B', 'C', 'D']

type QuizSlideDirection = 'forward' | 'backward'

const ERROR_NOTE_EXIT_DURATION_MS = 520

const quizButtonStyle: CSSProperties = {
  width: '100%',
  height: 50,
  minHeight: 50,
  padding: '12px 16px',
  border: 0,
  borderRadius: 10,
  background: 'var(--color-khaki)',
  backgroundColor: 'var(--color-khaki)',
  backgroundImage: 'none',
  color: 'var(--color-white)',
  WebkitTextFillColor: 'var(--color-white)',
  fontFamily: 'var(--font-pretendard)',
  fontSize: 18,
  fontWeight: 700,
  lineHeight: 1.3,
  letterSpacing: '-0.36px',
  boxShadow: 'none',
}

const disabledQuizButtonStyle: CSSProperties = {
  ...quizButtonStyle,
  background: 'var(--color-gray04)',
  backgroundColor: 'var(--color-gray04)',
  color: 'var(--color-gray02)',
  WebkitTextFillColor: 'var(--color-gray02)',
  cursor: 'not-allowed',
}

const previousQuizButtonStyle: CSSProperties = {
  ...quizButtonStyle,
  border: '1px solid var(--color-khaki)',
  background: 'transparent',
  backgroundColor: 'transparent',
  color: 'var(--color-gray02)',
  WebkitTextFillColor: 'var(--color-gray02)',
}

const startQuizButtonStyle: CSSProperties = {
  ...quizButtonStyle,
  border: '1px solid rgba(255, 255, 255, 0.14)',
  background: 'rgba(255, 255, 255, 0.25)',
  backgroundColor: 'rgba(255, 255, 255, 0.25)',
  color: 'var(--color-white)',
  WebkitTextFillColor: 'var(--color-white)',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
}

export function GuideQuiz() {
  const navigate = useNavigate()
  const [isStarted, setIsStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [isErrorNoteVisible, setIsErrorNoteVisible] = useState(false)
  const [renderedErrorNoteChoice, setRenderedErrorNoteChoice] = useState<string | null>(null)
  const [isErrorNoteExiting, setIsErrorNoteExiting] = useState(false)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [animatedFinalScore, setAnimatedFinalScore] = useState(0)
  const [animatedCorrectCount, setAnimatedCorrectCount] = useState(0)
  const [slideDirection, setSlideDirection] = useState<QuizSlideDirection>('forward')
  const errorNoteExitTimerRef = useRef<number | null>(null)

  const currentQuiz = quizzes[currentIndex]
  const progress = useMemo(
    () => Math.round(((currentIndex + 1) / quizzes.length) * 100),
    [currentIndex],
  )

  const clearErrorNoteExitTimer = () => {
    if (errorNoteExitTimerRef.current === null) return

    window.clearTimeout(errorNoteExitTimerRef.current)
    errorNoteExitTimerRef.current = null
  }

  const showErrorNote = (choice: string) => {
    clearErrorNoteExitTimer()
    setRenderedErrorNoteChoice(choice)
    setIsErrorNoteExiting(false)
    setIsErrorNoteVisible(true)
  }

  const hideErrorNote = () => {
    if (!renderedErrorNoteChoice) {
      setIsErrorNoteVisible(false)
      setIsErrorNoteExiting(false)
      return
    }

    clearErrorNoteExitTimer()
    setIsErrorNoteVisible(false)
    setIsErrorNoteExiting(true)
    errorNoteExitTimerRef.current = window.setTimeout(() => {
      setRenderedErrorNoteChoice(null)
      setIsErrorNoteExiting(false)
      errorNoteExitTimerRef.current = null
    }, ERROR_NOTE_EXIT_DURATION_MS)
  }

  const resetErrorNote = () => {
    clearErrorNoteExitTimer()
    setIsErrorNoteVisible(false)
    setIsErrorNoteExiting(false)
    setRenderedErrorNoteChoice(null)
  }

  const goNext = () => {
    if (!selectedChoice) return

    const isCorrectAnswer = selectedChoice === currentQuiz.answer

    if (!isCorrectAnswer && !isErrorNoteVisible) {
      showErrorNote(selectedChoice)
      return
    }

    if (isCorrectAnswer) {
      setScore((currentScore) => currentScore + 1)
    }

    setSlideDirection('forward')

    if (currentIndex === quizzes.length - 1) {
      setIsComplete(true)
      return
    }

    setCurrentIndex((index) => index + 1)
    setSelectedChoice(null)
    resetErrorNote()
  }

  const goPrevious = () => {
    if (currentIndex === 0) return

    setSlideDirection('backward')
    setCurrentIndex((index) => index - 1)
    setSelectedChoice(null)
    resetErrorNote()
  }

  const restartQuiz = () => {
    setIsStarted(true)
    setSlideDirection('backward')
    setCurrentIndex(0)
    setSelectedChoice(null)
    resetErrorNote()
    setScore(0)
    setIsComplete(false)
  }

  const skipToCompletePreview = () => {
    setIsStarted(true)
    setSlideDirection('forward')
    setCurrentIndex(quizzes.length - 1)
    setSelectedChoice(null)
    resetErrorNote()
    setScore(Math.round(quizzes.length * 0.3))
    setIsComplete(true)
  }

  useEffect(() => {
    return () => {
      if (errorNoteExitTimerRef.current !== null) {
        window.clearTimeout(errorNoteExitTimerRef.current)
      }
    }
  }, [])

  const finalScore = Math.round((score / quizzes.length) * 100)
  const animatedCorrectRate = Math.round((animatedCorrectCount / quizzes.length) * 100)

  useEffect(() => {
    if (!isComplete) {
      setAnimatedFinalScore(0)
      setAnimatedCorrectCount(0)
      return
    }

    let frameId = 0
    let startTime = 0
    const duration = 700
    const delay = 1050

    const timeoutId = window.setTimeout(() => {
      const animateCount = (timestamp: number) => {
        if (!startTime) startTime = timestamp

        const progressValue = Math.min((timestamp - startTime) / duration, 1)
        const easedProgress = 1 - Math.pow(1 - progressValue, 3)

        setAnimatedFinalScore(Math.round(finalScore * easedProgress))
        setAnimatedCorrectCount(Math.round(score * easedProgress))

        if (progressValue < 1) {
          frameId = window.requestAnimationFrame(animateCount)
        }
      }

      frameId = window.requestAnimationFrame(animateCount)
    }, delay)

    return () => {
      window.clearTimeout(timeoutId)
      window.cancelAnimationFrame(frameId)
    }
  }, [finalScore, isComplete, score])

  const finishMessage =
    finalScore <= 30
      ? {
          title: '다시 도전해볼까요?',
          description: '처음엔 누구나 어려울 수 있어요.',
          hintTitle: '안전 수칙부터 천천히 익혀봐요!',
          hintDescription: '퀴즈를 다시 풀면서 기본 개념을 익혀보세요.',
        }
      : finalScore <= 70
        ? {
            title: '잘하고 있어요!',
            description: '몇 가지만 더 익히면 충분해요.',
            hintTitle: '기본기는 충분해요!',
            hintDescription: '부족한 부분만 다시 확인해보세요.',
          }
        : {
            title: '정말 잘했어요!',
            description: '모든 문제를 완벽하게 풀었어요.',
            hintTitle: '이제 기본 상식은 문제 없어요!',
            hintDescription: '안전 수칙을 항상 기억하고 즐거운 게임 되세요!',
          }

  if (!isStarted) {
    return (
      <div className="guide_quiz_start_page">
        <img src={quizStartImage} alt="" className="guide_quiz_start_bg" aria-hidden="true" />
        <div className="guide_quiz_start_overlay" aria-hidden="true" />

        <main className="guide_quiz_start_content">
          <section className="guide_quiz_start_title">
            <PageHeader
              className="guide_quiz_start_heading"
              backIcon={arrowLIcon}
              backButtonClassName="guide_quiz_start_back"
              title="초보자 퀴즈"
              onBack={() => navigate('/home')}
              variant="overlay"
            />
            <p className="guide_quiz_start_description">
              <span>안전과 기본 룰을 가볍게 익히고,</span>
              <span>첫 게임을 더 편하게 시작해보세요.</span>
            </p>
          </section>
        </main>

        <section className="guide_quiz_start_cta">
          <LoginButton
            className="guide_quiz_start_button"
            onClick={() => {
              setSlideDirection('forward')
              setIsStarted(true)
            }}
            style={startQuizButtonStyle}
          >
            시작하기
          </LoginButton>
        </section>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className={`guide_quiz_page guide_quiz_figma_page guide_quiz_finish_page guide_quiz_slide_page guide_quiz_slide_${slideDirection}`}>
        <PageHeader
          backIcon={arrowLIcon}
          title="초보자 퀴즈"
          onBack={() => navigate('/home')}
          hideRight
        />

        <main className="guide_quiz_finish">
          <section className="guide_quiz_finish_intro">
            <div className="guide_quiz_finish_complete">
              <div className="guide_quiz_success_circle_mark" aria-hidden="true">
                <div className="guide_quiz_success_background" />
                <div className="guide_quiz_success_draw" />
              </div>
              <strong>퀴즈 완료!</strong>
            </div>
            <div className="guide_quiz_finish_message">
              <h2>{finishMessage.title}</h2>
              <p>{finishMessage.description}</p>
            </div>
          </section>

          <section className="guide_quiz_finish_score" aria-label="퀴즈 결과">
            <article className="guide_quiz_finish_score_left">
              <span>최종점수</span>
              <strong>
                {animatedFinalScore}
                <small>점</small>
              </strong>
            </article>
            <i aria-hidden="true" />
            <article className="guide_quiz_finish_score_right">
              <span>정답률</span>
              <div>
                <strong>{animatedCorrectCount} / {quizzes.length}</strong>
                <em>{animatedCorrectRate}%</em>
              </div>
            </article>
          </section>

          <section className="guide_quiz_finish_hint">
            <img src={quizShieldIcon} alt="" aria-hidden="true" />
            <div>
              <strong>{finishMessage.hintTitle}</strong>
              <p>{finishMessage.hintDescription}</p>
            </div>
          </section>

          <section className="guide_quiz_finish_hint guide_quiz_finish_hint_reward" aria-label="포인트 적립 안내">
            <div className="guide_quiz_finish_reward_info">
              <svg
                className="guide_quiz_finish_reward_icon"
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M15.75 33C7.87994 33 1.5 26.2843 1.5 18C1.5 9.71573 7.87994 3 15.75 3C23.6201 3 30 9.71573 30 18C30 26.2843 23.6201 33 15.75 33Z"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19.5 13.2C18.5455 12.4255 17.3542 12.0019 16.125 12C13.0185 12 10.5 14.685 10.5 18C10.5 21.315 13.0185 24 16.125 24C17.391 24 18.5595 23.553 19.5 22.8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 3C21.4995 3 34.5 4.5 34.5 18C34.5 31.5 21.4995 33 15 33"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>
              <div className="guide_quiz_finish_reward_text">
                <strong>포인트 적립 완료</strong>
                <p>초보자 퀴즈 참여 보상</p>
              </div>
            </div>
            <strong className="guide_quiz_finish_reward_point">+ 500P</strong>
          </section>
        </main>

        <section className="guide_quiz_finish_actions">
          <LoginButton
            className="guide_quiz_finish_done"
            onClick={() => navigate('/home')}
            style={quizButtonStyle}
          >
            완료
          </LoginButton>
          <LoginButton
            className="guide_quiz_finish_restart"
            onClick={restartQuiz}
            style={previousQuizButtonStyle}
          >
            <img src={quizRepostIcon} alt="" aria-hidden="true" />
            퀴즈 다시 풀기
          </LoginButton>
        </section>
      </div>
    )
  }

  return (
    <div className={`guide_quiz_page guide_quiz_figma_page guide_quiz_slide_page guide_quiz_slide_${slideDirection}`}>
      <div className="guide_quiz_sticky_top">
        <PageHeader
          className="guide_quiz_figma_title"
          backIcon={arrowLIcon}
          title="초보자 퀴즈"
          onBack={() => navigate('/home')}
          rightSlot={(
            <button className="guide_quiz_header_skip" type="button" onClick={skipToCompletePreview}>
              체험용 건너뛰기
            </button>
          )}
        />
        <p className="page_header__subtitle guide_quiz_figma_subtitle">
          퀴즈를 풀고 에어소프트 기본 상식을 익혀보세요!
        </p>

        <section className="guide_quiz_progress_row" aria-label="퀴즈 진행률">
          <span>
            <strong>{currentIndex + 1}</strong> / {quizzes.length}
          </span>
          <div className="guide_quiz_figma_progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <strong>{progress}%</strong>
        </section>
      </div>

      <main
        className={`guide_quiz_figma_content guide_quiz_slide_panel guide_quiz_slide_${slideDirection}`}
        key={currentIndex}
      >
        <article className="guide_quiz_question_box">
          <div className="guide_quiz_question_head">
            <span className="guide_quiz_number">{String(currentIndex + 1).padStart(2, '0')}.</span>
            <h2>{currentQuiz.question}</h2>
            <p className="guide_quiz_hint">
              <img src={quizInfoIcon} alt="" aria-hidden="true" />
              {currentQuiz.hint}
            </p>
          </div>

          <div className="guide_quiz_answer_list">
            {currentQuiz.choices.map((choice, index) => {
              const isSelected = selectedChoice === choice
              const isErrorNoteChoice = renderedErrorNoteChoice === choice
              const shouldRenderErrorNote = isErrorNoteChoice && (isErrorNoteVisible || isErrorNoteExiting)
              const isWrong = (isSelected && choice !== currentQuiz.answer) || isErrorNoteChoice
              const isCorrect = isSelected && choice === currentQuiz.answer

              return (
                <button
                  className={[
                    'guide_quiz_answer',
                    isSelected ? 'is_selected' : '',
                    isCorrect ? 'is_correct' : '',
                    isWrong ? 'is_wrong' : '',
                    shouldRenderErrorNote ? 'has_error_note' : '',
                    isErrorNoteChoice && isErrorNoteExiting ? 'is_error_note_exiting' : '',
                  ].filter(Boolean).join(' ')}
                  type="button"
                  key={choice}
                  onClick={() => {
                    if (isErrorNoteChoice && isErrorNoteVisible) return
                    if (renderedErrorNoteChoice && choice !== renderedErrorNoteChoice) {
                      hideErrorNote()
                    }
                    setSelectedChoice(choice)
                  }}
                >
                  <span className="guide_quiz_answer_label">{choiceLabels[index]}</span>
                  <strong>{choice}</strong>
                  {isSelected ? (
                    <svg
                      className="guide_quiz_answer_check"
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M8 12.2L10.7 14.9L16.2 9.4" />
                    </svg>
                  ) : null}
                  {shouldRenderErrorNote ? (
                    <span
                      className={`guide_quiz_error_note${isErrorNoteExiting ? ' is_exiting' : ''}`}
                    >
                      <img src={quizErrorIcon} alt="" aria-hidden="true" />
                      <span>
                        정답은 ‘{currentQuiz.answer}’이에요.
                        <br />
                        {currentQuiz.errorNote}
                      </span>
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </article>
      </main>

      <section className={`guide_quiz_cta ${currentIndex > 0 ? 'has_previous' : ''}`}>
        {currentIndex > 0 ? (
          <LoginButton
            className="guide_quiz_previous_button"
            onClick={goPrevious}
            style={previousQuizButtonStyle}
          >
            이전
          </LoginButton>
        ) : null}
        <LoginButton
          className="guide_quiz_figma_button"
          onClick={goNext}
          disabled={!selectedChoice}
          style={selectedChoice ? quizButtonStyle : disabledQuizButtonStyle}
        >
          다음
        </LoginButton>
      </section>
    </div>
  )
}


