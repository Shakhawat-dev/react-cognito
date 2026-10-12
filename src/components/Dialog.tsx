import { useEffect, useId, useRef, type ReactNode } from 'react'

type DialogProps = {
  open: boolean
  title: string
  // Called on Escape or a backdrop click; the parent closes the dialog by setting `open` to false.
  onClose: () => void
  // The buttons in the footer. The browser focuses the first one when the dialog opens.
  actions: ReactNode
  children: ReactNode
}

// Modal built on the native <dialog>, so focus trapping and Escape come from the browser.
// Don't give the <dialog> a class that sets `display` (like .card): that overrides the
// browser's `display: none` for a closed dialog and leaves it visible on the page.
export default function Dialog({ open, title, onClose, actions, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={titleId}
      onCancel={(e) => {
        // Escape: let the parent decide, so `open` stays the source of truth.
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        // The content fills the dialog, so a click that lands on the <dialog> itself is on the backdrop.
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="dialog-body">
        <h2 id={titleId}>{title}</h2>
        {children}
        <div className="actions">{actions}</div>
      </div>
    </dialog>
  )
}
