import { useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoginButton } from '../../components/LoginButton'
import { PageHeader } from '../../components/PageHeader'
import { createMatchPresetId, findMatchPreset, upsertMatchPreset } from './matchPresetStorage'
import './match.css'

type ChipOption = {
  label: string
  subLabel?: string
}

const levelOptions: ChipOption[] = [{ label: '초보' }, { label: '중급' }, { label: '숙련자' }]
const distanceOptions: ChipOption[] = [
  { label: '근거리', subLabel: '10km 이내' },
  { label: '중거리', subLabel: '10~30 km' },
  { label: '원거리', subLabel: '30km 이상' },
]
const distanceRangePoints = [10, 25, 50]
const timeOptions: ChipOption[] = [{ label: '전체' }, { label: '주간' }, { label: '야간' }]
const weekdayOptions = ['일', '월', '화', '수', '목', '금', '토']
const playStyleOptions: ChipOption[] = [{ label: '팀 플레이' }, { label: '개인 플레이' }, { label: '용병' }]
const gameToneOptions: ChipOption[] = [{ label: '전술' }, { label: '속도감' }, { label: '캐주얼' }, { label: '경쟁' }, { label: '실력 향상' }]
const teamworkOptions: ChipOption[] = [{ label: '솔플/자유' }, { label: '팀플/협동' }, { label: '버디 우선' }]
const priorityOptions: ChipOption[] = [{ label: '안전' }, { label: '매너' }, { label: '장비' }, { label: '경쟁' }, { label: '즐거움' }, { label: '스릴' }]
const purposeOptions: ChipOption[] = [{ label: '친목' }, { label: '실력 향상' }, { label: '스트레스 해소' }, { label: '대회/경쟁' }, { label: '취미' }]

function toggleMultiValue(current: string[], value: string) {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
}

function ChipGroup({
  options,
  selected,
  onToggle,
  round = false,
}: {
  options: ChipOption[]
  selected: string[]
  onToggle: (value: string) => void
  round?: boolean
}) {
  return (
    <div className={`match_preset_edit_chip_group${round ? ' is_round' : ''}`}>
      {options.map((option) => {
        const isSelected = selected.includes(option.label)

        return (
          <button
            key={option.label}
            className={`match_preset_edit_chip${isSelected ? ' is_selected' : ''}`}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(option.label)}
          >
            <span>{option.label}</span>
            {option.subLabel ? <small>{option.subLabel}</small> : null}
          </button>
        )
      })}
    </div>
  )
}

type MatchPresetEditProps = {
  mode?: 'edit' | 'create'
}

export function MatchPresetEdit({ mode = 'edit' }: MatchPresetEditProps) {
  const navigate = useNavigate()
  const { presetId = 'weekend' } = useParams()
  const isCreateMode = mode === 'create'
  const editingPreset = useMemo(() => (isCreateMode ? undefined : findMatchPreset(presetId)), [isCreateMode, presetId])
  const nameFieldRef = useRef<HTMLElement | null>(null)
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const [presetFormId] = useState(() => editingPreset?.id ?? createMatchPresetId())
  const [name, setName] = useState(editingPreset?.title ?? '')
  const [nameError, setNameError] = useState(false)
  const [description, setDescription] = useState(editingPreset?.description ?? '')
  const [level, setLevel] = useState(editingPreset?.level ?? ['초보'])
  const [distance, setDistance] = useState(editingPreset?.distance ?? ['근거리'])
  const [distanceValue, setDistanceValue] = useState(editingPreset?.distanceValue ?? 10)
  const [time, setTime] = useState(editingPreset?.time ?? ['전체'])
  const [weekdays, setWeekdays] = useState(editingPreset?.weekdays ?? ['일', '토'])
  const [playStyle, setPlayStyle] = useState(editingPreset?.playStyle ?? ['개인 플레이', '용병'])
  const [gameTone, setGameTone] = useState(editingPreset?.gameTone ?? ['캐주얼', '실력 향상'])
  const [teamwork, setTeamwork] = useState(editingPreset?.teamwork ?? ['솔플/자유'])
  const [priority, setPriority] = useState(editingPreset?.priority ?? ['안전', '매너', '즐거움'])
  const [purpose, setPurpose] = useState(editingPreset?.purpose ?? ['실력 향상', '스트레스 해소', '취미'])

  const goBack = () => {
    navigate('/match/presets', { replace: true })
  }

  const savePreset = () => {
    if (!name.trim()) {
      setNameError(true)
      nameFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      window.setTimeout(() => nameInputRef.current?.focus(), 220)
      return
    }

    upsertMatchPreset({
      id: presetFormId,
      title: name.trim(),
      description: description.trim() || '직접 설정하는 맞춤 프리셋',
      level,
      distance,
      distanceValue,
      time,
      weekdays,
      playStyle,
      gameTone,
      teamwork,
      priority,
      purpose,
      isCustom: isCreateMode || editingPreset?.isCustom,
    })
    navigate('/match/presets', { replace: true })
  }

  const updateDistanceByIndex = (index: number) => {
    const option = distanceOptions[index]

    if (!option) return

    setDistance([option.label])
    setDistanceValue(distanceRangePoints[index])
  }

  const updateDistanceValue = (value: number) => {
    const selectedIndex = value <= 10 ? 0 : value <= 30 ? 1 : 2

    setDistanceValue(value)
    setDistance([distanceOptions[selectedIndex].label])
  }
  const distanceRangePercent = `${Math.min(Math.max(distanceValue / 50, 0), 1) * 100}%`

  return (
    <div className="match_preset_edit_page">
      <PageHeader
        className="match_page_header match_preset_edit_header"
        backButtonClassName="match_page_back_button"
        layout="standard"
        title={isCreateMode ? '프리셋 만들기' : '프리셋 수정'}
        titleClassName="match_page_title"
        onBack={goBack}
      />

      <main className="match_preset_edit_body">
        <section className="match_preset_edit_field" ref={nameFieldRef}>
          <h2>프리셋 이름</h2>
          <label className="match_preset_edit_input_box">
            <input
              ref={nameInputRef}
              value={name}
              maxLength={20}
              placeholder="예) 주말 즐겜용"
              aria-invalid={nameError ? 'true' : undefined}
              aria-describedby={nameError ? 'match-preset-name-error' : undefined}
              onChange={(event) => {
                setName(event.target.value)
                if (nameError && event.target.value.trim()) {
                  setNameError(false)
                }
              }}
            />
            <span>{name.length}/20</span>
          </label>
          {nameError ? (
            <p id="match-preset-name-error" className="match_preset_edit_error">
              프리셋 이름을 입력해주세요.
            </p>
          ) : null}
        </section>

        <section className="match_preset_edit_field">
          <h2>
            프리셋 설명 <span>(선택)</span>
          </h2>
          <label className="match_preset_edit_textarea_box">
            <textarea
              value={description}
              maxLength={50}
              placeholder="예) 주말에 부담 없이 즐기는 매치가 좋아요"
              onChange={(event) => setDescription(event.target.value)}
            />
            <span>{description.length}/50</span>
          </label>
        </section>

        <section className="match_preset_edit_field">
          <h2>숙련도</h2>
          <ChipGroup options={levelOptions} selected={level} onToggle={(value) => setLevel([value])} />
        </section>

        <section className="match_preset_edit_field">
          <h2>거리</h2>
          <ChipGroup
            options={distanceOptions}
            selected={distance}
            onToggle={(value) => updateDistanceByIndex(distanceOptions.findIndex((option) => option.label === value))}
          />
          <div
            className="match_preset_edit_range"
            style={{ '--match-distance-range-percent': distanceRangePercent } as CSSProperties}
          >
            <input
              type="range"
              min="0"
              max="50"
              value={distanceValue}
              aria-label="거리"
              onChange={(event) => updateDistanceValue(Number(event.target.value))}
            />
            <span style={{ left: distanceRangePercent }}>{distanceValue}km</span>
          </div>
        </section>

        <section className="match_preset_edit_field">
          <h2>
            활동 시간대 <span>(복수 선택)</span>
          </h2>
          <ChipGroup options={timeOptions} selected={time} onToggle={(value) => setTime((current) => toggleMultiValue(current, value))} />
          <div className="match_preset_edit_weekdays">
            {weekdayOptions.map((day) => {
              const isSelected = weekdays.includes(day)

              return (
                <button
                  key={day}
                  className={`match_preset_edit_day${isSelected ? ' is_selected' : ''}`}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setWeekdays((current) => toggleMultiValue(current, day))}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </section>

        <section className="match_preset_edit_field">
          <h2>
            플레이 스타일 <span>(복수 선택)</span>
          </h2>
          <ChipGroup options={playStyleOptions} selected={playStyle} onToggle={(value) => setPlayStyle((current) => toggleMultiValue(current, value))} />
        </section>

        <section className="match_preset_edit_field">
          <h2>
            게임 성향 <span>(복수 선택)</span>
          </h2>
          <ChipGroup options={gameToneOptions} selected={gameTone} onToggle={(value) => setGameTone((current) => toggleMultiValue(current, value))} />
        </section>

        <section className="match_preset_edit_field">
          <h2>팀플 성향</h2>
          <ChipGroup options={teamworkOptions} selected={teamwork} onToggle={(value) => setTeamwork([value])} />
        </section>

        <section className="match_preset_edit_field">
          <h2>
            중요하게 생각하는 요소 <span>(복수 선택)</span>
          </h2>
          <ChipGroup options={priorityOptions} selected={priority} onToggle={(value) => setPriority((current) => toggleMultiValue(current, value))} />
        </section>

        <section className="match_preset_edit_field">
          <h2>
            참여 목적 <span>(복수 선택)</span>
          </h2>
          <ChipGroup options={purposeOptions} selected={purpose} onToggle={(value) => setPurpose((current) => toggleMultiValue(current, value))} />
        </section>

        <div className="match_preset_edit_bottom">
          <LoginButton className="match_preset_edit_save" onClick={savePreset}>
            {isCreateMode ? '만들기' : '저장하기'}
          </LoginButton>
        </div>
      </main>
    </div>
  )
}
