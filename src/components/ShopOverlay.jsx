import { useEffect } from 'react'
import CoinShop from './CoinShop'

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {object} props.userStatus
 * @param {import('react').Dispatch<import('react').SetStateAction<object>>} props.setUserStatus
 */
export default function ShopOverlay({ open, onClose, userStatus, setUserStatus }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const chrome = (
    <div className="flex shrink-0 items-start justify-between gap-3 border-b border-violet-200/70 bg-violet-50/50 px-4 py-3 dark:border-violet-800/60 dark:bg-violet-950/30">
      <div className="min-w-0 text-left">
        <h2 className="text-sm font-bold text-violet-900 dark:text-violet-200">심심풀이 상점</h2>
        <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
          오른쪽 패널 · 배경을 누르거나 Esc로 닫을 수 있어요.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        닫기
      </button>
    </div>
  )

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-labelledby="shop-overlay-title">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="상점 닫기"
        onClick={onClose}
      />
      <aside
        className="absolute inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-violet-200/80 bg-slate-50 shadow-2xl dark:border-violet-800/60 dark:bg-slate-950"
        onClick={(e) => e.stopPropagation()}
      >
        <span id="shop-overlay-title" className="sr-only">
          심심풀이 상점
        </span>
        {chrome}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <CoinShop embedded userStatus={userStatus} setUserStatus={setUserStatus} />
        </div>
      </aside>
    </div>
  )
}
