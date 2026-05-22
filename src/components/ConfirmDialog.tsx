import './ConfirmDialog.css'

type ConfirmDialogTone = 'default' | 'danger'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description?: string
  className?: string
  cancelLabel?: string
  confirmLabel?: string
  closeLabel?: string
  showCancel?: boolean
  tone?: ConfirmDialogTone
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  className,
  cancelLabel = '취소',
  confirmLabel = '확인',
  closeLabel = '확인창 닫기',
  showCancel = true,
  tone = 'default',
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className={['confirm_dialog_layer', className].filter(Boolean).join(' ')} role="presentation">
      <button
        className="confirm_dialog_backdrop"
        type="button"
        aria-label={closeLabel}
        onClick={onCancel}
      />
      <div
        className="confirm_dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? 'confirm-dialog-desc' : undefined}
      >
        <div className="confirm_dialog_text">
          <h2 id="confirm-dialog-title">{title}</h2>
          {description ? <p id="confirm-dialog-desc">{description}</p> : null}
        </div>
        <div className="confirm_dialog_actions">
          {showCancel ? (
            <button type="button" onClick={onCancel}>
              {cancelLabel}
            </button>
          ) : null}
          <button
            className={tone === 'danger' ? 'is_danger' : undefined}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
