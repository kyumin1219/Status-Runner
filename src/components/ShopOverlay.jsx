import { useEffect, useState } from 'react'
import CoinShop from './CoinShop'

const OVERLAY_MS = 300

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {object} props.userStatus
 * @param {import('react').Dispatch<import('react').SetStateAction<object>>} props.setUserStatus
 */
export default function ShopOverlay({ open, onClose, userStatus, setUserStatus }) {
  const [mounted, setMounted] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    let raf1 = 0
    let raf2 = 0
    let closeTimer = 0

    if (open) {
      raf1 = requestAnimationFrame(() => {
        setMounted(true)
        raf2 = requestAnimationFrame(() => setAnimating(true))
      })
    } else {
      raf1 = requestAnimationFrame(() => {
        setAnimating(false)
      })
      closeTimer = window.setTimeout(() => setMounted(false), OVERLAY_MS)
    }

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      if (closeTimer) window.clearTimeout(closeTimer)
    }
  }, [open])

  useEffect(() => {
    if (!mounted) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mounted, onClose])

  if (!mounted) return null

  const transition =
    'motion-safe:transition-[transform,opacity] motion-safe:duration-300 motion-safe:ease-out'

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
        className={`absolute inset-0 z-40 bg-black/45 ${transition} ${
          animating ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="상점 닫기"
        onClick={onClose}
      />
      <aside
        className={`absolute inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-violet-200/80 bg-slate-50 shadow-2xl will-change-transform dark:border-violet-800/60 dark:bg-slate-950 ${transition} ${
          animating ? 'translate-x-0' : 'translate-x-full'
        }`}
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
