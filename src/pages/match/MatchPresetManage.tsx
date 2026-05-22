import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import AnimatedContent from '../../components/AnimatedContent'
import AnimatedList from '../../components/AnimatedList'
import { PageHeader } from '../../components/PageHeader'
import presetPencilIcon from '../../asset/icons/preset_pencil.svg'
import presetTrashIcon from '../../asset/icons/preset_trash.svg'
import presetPlusIcon from '../../asset/icons/preset_plus.svg'
import {
  deleteMatchPreset,
  findMatchPreset,
  readAppliedMatchPresetId,
  readMatchPresets,
  writeAppliedMatchPresetId,
  type MatchPresetItem,
} from './matchPresetStorage'
import './match.css'

function PresetActionButtons({ onDelete, onEdit }: { onDelete: () => void; onEdit?: () => void }) {
  return (
    <div className="match_preset_manage_actions" aria-label="프리셋 관리 작업">
      <button
        className="match_preset_manage_action is_edit"
        type="button"
        aria-label="프리셋 수정"
        onClick={(event) => {
          event.stopPropagation()
          onEdit?.()
        }}
      >
        <img src={presetPencilIcon} alt="" aria-hidden="true" />
      </button>
      <button
        className="match_preset_manage_action is_delete"
        type="button"
        aria-label="프리셋 삭제"
        onClick={(event) => {
          event.stopPropagation()
          onDelete()
        }}
      >
        <img src={presetTrashIcon} alt="" aria-hidden="true" />
      </button>
    </div>
  )
}

function PresetCard({
  preset,
  active = false,
  switching = false,
  onDelete,
  onEdit,
  onApply,
  useListExit = false,
}: {
  preset: MatchPresetItem
  active?: boolean
  switching?: boolean
  onDelete: () => void
  onEdit?: () => void
  onApply?: () => void
  useListExit?: boolean
}) {
  const cardRef = useRef<HTMLElement>(null)

  const deletePreset = () => {
    if (useListExit) {
      onDelete()
      return
    }

    const card = cardRef.current

    if (!card) {
      onDelete()
      return
    }

    gsap.to(card, {
      x: -120,
      opacity: 0,
      duration: 0.35,
      ease: 'power3.in',
      pointerEvents: 'none',
      onComplete: onDelete,
    })
  }

  return (
    <article
      ref={cardRef}
      className={`match_preset_manage_card${active ? ' is_active' : ''}${onApply ? ' is_clickable' : ''}${switching ? ' is_switching' : ''}`}
      role={onApply ? 'button' : undefined}
      tabIndex={onApply ? 0 : undefined}
      aria-pressed={onApply ? active : undefined}
      onClick={onApply}
      onKeyDown={(event) => {
        if (!onApply || (event.key !== 'Enter' && event.key !== ' ')) return
        event.preventDefault()
        onApply()
      }}
    >
      <div className="match_preset_manage_card_text">
        <h3>{preset.title}</h3>
        <p>{preset.description}</p>
      </div>
      <PresetActionButtons onDelete={deletePreset} onEdit={onEdit} />
    </article>
  )
}

export function MatchPresetManage() {
  const navigate = useNavigate()
  const [isAppliedVisible, setIsAppliedVisible] = useState(true)
  const [managedPresets, setManagedPresets] = useState(readMatchPresets)
  const [appliedPresetId, setAppliedPresetId] = useState(readAppliedMatchPresetId)
  const [switchingPresetId, setSwitchingPresetId] = useState<string | null>(null)
  const [deleteTargetPreset, setDeleteTargetPreset] = useState<MatchPresetItem | null>(null)
  const switchingTimerRef = useRef<number | null>(null)
  const appliedPreset = findMatchPreset(appliedPresetId) ?? managedPresets[0]

  const applyPreset = (presetId: string) => {
    if (presetId === appliedPresetId) return

    writeAppliedMatchPresetId(presetId)
    setAppliedPresetId(presetId)
    setSwitchingPresetId(presetId)
    setIsAppliedVisible(true)

    if (switchingTimerRef.current) {
      window.clearTimeout(switchingTimerRef.current)
    }

    switchingTimerRef.current = window.setTimeout(() => {
      setSwitchingPresetId(null)
      switchingTimerRef.current = null
    }, 560)
  }

  useEffect(() => {
    return () => {
      if (switchingTimerRef.current) {
        window.clearTimeout(switchingTimerRef.current)
      }
    }
  }, [])

  const goBack = () => {
    navigate('/match')
  }

  const requestDeletePreset = (preset: MatchPresetItem) => {
    setDeleteTargetPreset(preset)
  }

  const cancelDeletePreset = () => {
    setDeleteTargetPreset(null)
  }

  const confirmDeletePreset = () => {
    if (!deleteTargetPreset) return

    deleteMatchPreset(deleteTargetPreset.id)
    const nextPresets = readMatchPresets()
    setManagedPresets(nextPresets)

    if (deleteTargetPreset.id === appliedPresetId) {
      const nextAppliedPresetId = nextPresets[0]?.id ?? 'weekend'
      writeAppliedMatchPresetId(nextAppliedPresetId)
      setAppliedPresetId(nextAppliedPresetId)
      setIsAppliedVisible(true)
    }

    setDeleteTargetPreset(null)
  }

  return (
    <div className="match_preset_manage_page">
      <PageHeader
        className="match_page_header match_preset_manage_header"
        backButtonClassName="match_page_back_button"
        layout="standard"
        title="프리셋 관리"
        titleClassName="match_page_title"
        onBack={goBack}
      />

      <main className="match_preset_manage_body">
        <section className="match_preset_manage_section" aria-labelledby="match-preset-applied-title">
          <h2 id="match-preset-applied-title" className="match_preset_manage_section_title">
            적용된 프리셋
          </h2>
          {isAppliedVisible && appliedPreset ? (
            <AnimatedContent distance={28} duration={0.85} ease="power3.out" threshold={0.05} className="match_preset_manage_motion_card">
              <PresetCard
                key={appliedPreset.id}
                preset={appliedPreset}
                active
                switching={switchingPresetId === appliedPreset.id}
                onDelete={() => requestDeletePreset(appliedPreset)}
              />
            </AnimatedContent>
          ) : null}
        </section>

        <section className="match_preset_manage_section" aria-labelledby="match-preset-list-title">
          <div className="match_preset_manage_section_head">
            <div className="match_preset_manage_section_label">
              <h2 id="match-preset-list-title" className="match_preset_manage_section_title">
                내 프리셋
              </h2>
              <span className="match_preset_manage_count">({managedPresets.length}/10)</span>
            </div>
            <button
              className="match_preset_manage_head_add"
              type="button"
              aria-label="프리셋 추가"
              onClick={() => navigate('/match/presets/create')}
            >
              <img src={presetPlusIcon} alt="" className="match_preset_option_icon" aria-hidden="true" />
            </button>
          </div>

          <AnimatedList
            items={managedPresets}
            className="match_preset_manage_list"
            displayScrollbar={false}
            showGradients={false}
            enableArrowNavigation={false}
            enableLayoutAnimation
            getItemKey={(preset) => preset.id}
            renderItem={(preset) => (
              <PresetCard
                preset={preset}
                active={preset.id === appliedPresetId}
                useListExit
                onApply={() => applyPreset(preset.id)}
                onEdit={() => navigate(`/match/presets/${preset.id}/edit`)}
                onDelete={() => requestDeletePreset(preset)}
              />
            )}
          />
        </section>
      </main>

      {deleteTargetPreset ? (
        <div className="match_preset_delete_modal_backdrop" role="presentation" onClick={cancelDeletePreset}>
          <section
            className="match_preset_delete_modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="match-preset-delete-title"
            aria-describedby="match-preset-delete-desc"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="match-preset-delete-title">프리셋을 삭제할까요?</h2>
            <p id="match-preset-delete-desc">
              {deleteTargetPreset.title} 프리셋은 삭제 후 되돌릴 수 없어요.
            </p>
            <div className="match_preset_delete_modal_actions">
              <button className="match_preset_delete_modal_cancel" type="button" onClick={cancelDeletePreset}>
                취소
              </button>
              <button className="match_preset_delete_modal_confirm" type="button" onClick={confirmDeletePreset}>
                삭제
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
