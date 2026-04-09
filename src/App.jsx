import { useCallback, useEffect, useState } from 'react'
import CharacterDashboard from './components/CharacterDashboard'
import ShopOverlay from './components/ShopOverlay'
import StatsGraph from './components/StatsGraph'
import WorkoutButtons from './components/WorkoutButtons'
import { getDecayShieldDisplay, getTitleLabel, isDecayShieldActive } from './shop'
import {
  acceptQuestChoice,
  completeActiveQuest,
  prepareQuestChoices,
  resolveExpiredQuest,
} from './workout'
import { STORAGE_KEY, defaultUserStatus, normalizeUserStatus } from './userStatus'

function readStoredUserStatus() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return resolveExpiredQuest(defaultUserStatus())
    return resolveExpiredQuest(normalizeUserStatus(JSON.parse(raw)))
  } catch {
    return resolveExpiredQuest(defaultUserStatus())
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

  useEffect(() => {
    const t = setInterval(() => {
      setUserStatus((prev) => resolveExpiredQuest(prev))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const dismissFailureMessage = useCallback(() => {
    setUserStatus((prev) => ({ ...prev, pendingFailureMessage: null }))
  }, [])

  const onPrepareQuest = useCallback((difficulty) => {
    setUserStatus((prev) => {
      const cleared = resolveExpiredQuest(prev)
      return prepareQuestChoices(cleared, difficulty)
    })
  }, [])

  const onSelectQuest = useCallback((workoutType) => {
    setUserStatus((prev) => acceptQuestChoice(resolveExpiredQuest(prev), workoutType))
  }, [])

  const onCompleteQuest = useCallback(() => {
    setUserStatus((prev) => completeActiveQuest(resolveExpiredQuest(prev)))
  }, [])

  const titleLabel =
    userStatus.equippedTitleId != null
      ? getTitleLabel(userStatus.equippedTitleId)
      : null

  const decayShieldDetail =
    isDecayShieldActive(userStatus) ? getDecayShieldDisplay(userStatus.decayShieldDay) : null

  const failureMsg = userStatus.pendingFailureMessage

  return (
    <div className="min-h-svh bg-gradient-to-b from-slate-50 to-violet-50/40 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      {failureMsg ? (
        <div
          role="alert"
          className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-center dark:border-rose-900/50 dark:bg-rose-950/50"
        >
          <p className="mx-auto max-w-lg text-sm font-medium text-rose-900 dark:text-rose-100">
            {failureMsg}
          </p>
          <button
            type="button"
            onClick={dismissFailureMessage}
            className="mt-2 rounded-lg bg-rose-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
          >
            확인
          </button>
        </div>
      ) : null}

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
              마지막 기록: {userStatus.lastWorkoutDate ?? '—'}
            </p>
            {userStatus.workoutStreak > 0 ? (
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                연속 기록: {userStatus.workoutStreak}일
              </p>
            ) : null}
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
          titleId={userStatus.equippedTitleId}
          titleLabel={titleLabel}
          decayShieldDetail={decayShieldDetail}
        />
        <StatsGraph stats={userStatus.stats} />
        <WorkoutButtons
          userStatus={userStatus}
          onPrepareQuest={onPrepareQuest}
          onSelectQuest={onSelectQuest}
          onCompleteQuest={onCompleteQuest}
        />
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
