import { useEffect, useState } from 'react'
import {
  DIFFICULTY_LABELS,
  WORKOUT_LABELS,
  formatQuestRemainingMs,
  getQuestInstruction,
  QUEST_DEADLINE,
  todayIsoUtc,
} from '../workout'

const difficulties = /** @type {const} */ (['easy', 'medium', 'hard'])

const btnBase =
  'rounded-xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-40'
const inactive =
  'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
const active =
  'border-violet-500 bg-violet-600 text-white shadow-sm hover:bg-violet-500 dark:border-violet-400 dark:bg-violet-600'

export default function WorkoutButtons({
  userStatus,
  onPrepareQuest,
  onSelectQuest,
  onCompleteQuest,
}) {
  const [now, setNow] = useState(() => Date.now())
  const [difficulty, setDifficulty] = useState(/** @type {'easy'|'medium'|'hard'|null} */ (null))

  const today = todayIsoUtc()
  const completedToday = userStatus.lastWorkoutDate === today
  const quest = userStatus.activeQuest
  const questChoices = userStatus.questChoices
  const questActive = quest != null && now <= quest.deadline

  useEffect(() => {
    if (!userStatus.activeQuest) return
    const t = setTimeout(() => setNow(Date.now()), 0)
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => {
      clearTimeout(t)
      clearInterval(id)
    }
  }, [userStatus.activeQuest])

  const canPrepare = !completedToday && !questActive && questChoices == null && difficulty != null

  function handlePrepare(e) {
    e.preventDefault()
    if (!canPrepare || !difficulty) return
    onPrepareQuest(difficulty)
  }

  function handleComplete(e) {
    e.preventDefault()
    if (!questActive) return
    onCompleteQuest()
  }

  if (completedToday) {
    return (
      <section className="mt-6 space-y-5 px-4 pb-10">
        <div>
          <h2 className="mb-2 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
            오늘의 운동
          </h2>
          <p className="text-center text-sm text-emerald-700 dark:text-emerald-400">
            오늘 퀘스트를 완료했습니다. 내일 다시 도전해 보세요.
          </p>
        </div>
      </section>
    )
  }

  if (questActive && quest) {
    const remaining = quest.deadline - now
    const instruction = getQuestInstruction(quest.workoutType, quest.difficulty)

    return (
      <section className="mt-6 space-y-5 px-4 pb-10">
        <div>
          <h2 className="mb-2 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
            진행 중인 퀘스트
          </h2>
          <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50/80 px-4 py-3 text-left dark:border-violet-800/60 dark:bg-violet-950/40">
            <p className="text-xs font-semibold text-violet-800 dark:text-violet-200">
              {WORKOUT_LABELS[quest.workoutType]} · 난이도 {DIFFICULTY_LABELS[quest.difficulty]}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {instruction}
            </p>
          </div>
          <p className="mb-3 text-center text-xs text-slate-500 dark:text-slate-400">
            위 내용대로 운동하고 오늘 안에 완료 버튼을 누르세요.
          </p>
          {QUEST_DEADLINE === 'today' ? (
            <p className="mb-3 text-center text-xs font-semibold text-violet-700 dark:text-violet-300">
              오늘의 퀘스트: 자정 전까지 완료
            </p>
          ) : null}
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center dark:border-amber-900/50 dark:bg-amber-950/40">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200">남은 시간</p>
            <p className="text-2xl font-bold tabular-nums text-amber-900 dark:text-amber-100">
              {formatQuestRemainingMs(remaining)}
            </p>
          </div>
          <form onSubmit={handleComplete} className="mx-auto max-w-md">
            <button
              type="submit"
              disabled={remaining <= 0}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
            >
              운동 완료
            </button>
          </form>
        </div>
      </section>
    )
  }

  if (questChoices) {
    return (
      <section className="mt-6 space-y-5 px-4 pb-10">
        <div>
          <h2 className="mb-2 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
            오늘의 퀘스트 후보
          </h2>
          <p className="mb-3 text-center text-xs text-slate-500 dark:text-slate-400">
            난이도 {DIFFICULTY_LABELS[questChoices.difficulty]} 기준입니다. 아래에서 하나를 선택하세요.
          </p>
          <div className="space-y-2">
            {questChoices.options.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onSelectQuest(type)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-violet-300 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-violet-700 dark:hover:bg-violet-950/30"
              >
                <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                  {WORKOUT_LABELS[type]}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {getQuestInstruction(type, questChoices.difficulty)}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mt-6 space-y-5 px-4 pb-10">
      <div>
        <h2 className="mb-2 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
          오늘의 운동
        </h2>
        <p className="mb-3 text-center text-xs text-slate-500 dark:text-slate-400">
          난이도를 먼저 고르고 후보 3개 중 하나를 선택해 오늘 퀘스트를 확정하세요.
        </p>
        <form onSubmit={handlePrepare} className="mx-auto max-w-md space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {difficulties.map((key) => (
              <button
                key={key}
                type="button"
                className={`${btnBase} ${difficulty === key ? active : inactive}`}
                aria-pressed={difficulty === key}
                onClick={() => setDifficulty(key)}
              >
                {DIFFICULTY_LABELS[key]}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={!canPrepare}
            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white shadow transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
          >
            퀘스트 후보 받기
          </button>
        </form>
      </div>
    </section>
  )
}
