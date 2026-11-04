import { CheckCircle, Warning } from '@phosphor-icons/react'

interface BuilderToastProps {
  toast: { type: 'success' | 'error'; message: string } | null
}

export default function BuilderToast({ toast }: BuilderToastProps) {
  if (!toast) return null

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border animate-in fade-in slide-in-from-bottom-3 duration-200 ${
        toast.type === 'success'
          ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
          : 'bg-red-950 text-red-200 border-red-800'
      }`}
    >
      {toast.type === 'success' ? (
        <CheckCircle size={16} weight="fill" />
      ) : (
        <Warning size={16} weight="fill" />
      )}
      <span>{toast.message}</span>
    </div>
  )
}

