import { useState } from 'react'
import { DIFFICULTY_LABELS, WORKOUT_LABELS } from '../workout'

const workoutTypes = /** @type {const} */ (['running', 'bodyweight', 'stretch'])
const difficulties = /** @type {const} */ (['easy', 'medium', 'hard'])

const btnBase =
  'rounded-xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-40'

const inactive =
  'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
const active =
  'border-violet-500 bg-violet-600 text-white shadow-sm hover:bg-violet-500 dark:border-violet-400 dark:bg-violet-600'

export default function WorkoutButtons({ onComplete }) {
  const [workoutType, setWorkoutType] = useState(
    /** @type {'running' | 'bodyweight' | 'stretch' | null} */ (null),
  )
  const [difficulty, setDifficulty] = useState(
    /** @type {'easy' | 'medium' | 'hard' | null} */ (null),
  )

  const canSubmit = workoutType != null && difficulty != null

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    onComplete(workoutType, difficulty)
  }

  return (
    <section className="mt-6 space-y-5 px-4 pb-10">
      <div>
        <h2 className="mb-2 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
          오늘의 운동
        </h2>
        <p className="mb-3 text-center text-xs text-slate-500 dark:text-slate-400">
          종류와 난이도를 고른 뒤 운동 완료를 누르세요.
        </p>
        <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
          <fieldset className="space-y-2">
            <legend className="sr-only">운동 종류</legend>
            <div className="grid grid-cols-3 gap-2">
              {workoutTypes.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`${btnBase} ${workoutType === key ? active : inactive}`}
                  aria-pressed={workoutType === key}
                  onClick={() => setWorkoutType(key)}
                >
                  {WORKOUT_LABELS[key]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="sr-only">난이도</legend>
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
          </fieldset>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
          >
            운동 완료
          </button>
        </form>
      </div>
    </section>
  )
}
