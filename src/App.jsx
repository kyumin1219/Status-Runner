import { useCallback, useEffect, useState } from 'react'
import CharacterDashboard from './components/CharacterDashboard'
import ShopOverlay from './components/ShopOverlay'
import StatsGraph from './components/StatsGraph'
import WorkoutButtons from './components/WorkoutButtons'
import { getDecayShieldDisplay, getTitleLabel, isDecayShieldActive } from './shop'
import { applyWorkout } from './workout'
import { STORAGE_KEY, defaultUserStatus, normalizeUserStatus } from './userStatus'

function readStoredUserStatus() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultUserStatus()
    return normalizeUserStatus(JSON.parse(raw))
  } catch {
    return defaultUserStatus()
  }
}

export default function App() {
  const [userStatus, setUserStatus] = useState(readStoredUserStatus)
  const [shopOpen, setShopOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userStatus))
    } catch {
      /* ignore quota / private mode */
    }
  }, [userStatus])

  const onWorkoutComplete = useCallback((workoutType, difficulty) => {
    setUserStatus((prev) => applyWorkout(prev, workoutType, difficulty))
  }, [])

  const titleLabel =
    userStatus.equippedTitleId != null
      ? getTitleLabel(userStatus.equippedTitleId)
      : null

  const decayShieldDetail =
    isDecayShieldActive(userStatus) ? getDecayShieldDisplay(userStatus.decayShieldDay) : null

  return (
    <div className="min-h-svh bg-gradient-to-b from-slate-50 to-violet-50/40 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <header className="border-b border-violet-200/60 bg-white/70 px-4 py-4 backdrop-blur dark:border-violet-900/40 dark:bg-slate-900/70">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-xl font-bold tracking-tight text-violet-800 dark:text-violet-300">
              Status Runner
            </h1>
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              몸의 스탯을 캐릭터와 함께 키워 보세요
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              마지막 기록: {userStatus.lastWorkoutDate}
            </p>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              코인 {userStatus.coins}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShopOpen(true)}
            className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-violet-500"
          >
            상점 열기
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg">
        <CharacterDashboard
          seed={userStatus.currentBody}
          titleLabel={titleLabel}
          decayShieldDetail={decayShieldDetail}
        />
        <StatsGraph stats={userStatus.stats} />
        <WorkoutButtons onComplete={onWorkoutComplete} />
      </main>

      <ShopOverlay
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        userStatus={userStatus}
        setUserStatus={setUserStatus}
      />
    </div>
  )
}
