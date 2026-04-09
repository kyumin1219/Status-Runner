/** @typedef {'running' | 'bodyweight' | 'stretch'} WorkoutType */
/** @typedef {'easy' | 'medium' | 'hard'} Difficulty */

const WORKOUT_STATS = {
  running: ['agility', 'vitality'],
  bodyweight: ['strength', 'vitality'],
  stretch: ['flexibility', 'agility'],
}

const DIFFICULTY_STAT_BONUS = {
  easy: 1,
  medium: 2,
  hard: 3,
}

/** 연속 3일을 넘긴 뒤(4일째 운동부터) 성실이 오름 */
const DILIGENCE_MIN_STREAK = 4

const COIN_REWARD = {
  easy: 8,
  medium: 16,
  hard: 28,
}

function todayIsoUtc() {
  return new Date().toISOString().slice(0, 10)
}

function prevDayIso(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() - 1)
  return dt.toISOString().slice(0, 10)
}

/**
 * @param {string | null | undefined} lastWorkoutDate
 * @param {number} prevStreak
 * @param {string} today
 */
export function nextWorkoutStreak(lastWorkoutDate, prevStreak, today) {
  const prev = Number.isFinite(prevStreak) ? Math.max(0, Math.round(prevStreak)) : 0
  if (!lastWorkoutDate || !/^\d{4}-\d{2}-\d{2}$/.test(lastWorkoutDate)) {
    return 1
  }
  if (lastWorkoutDate === today) {
    return Math.max(1, prev)
  }
  if (lastWorkoutDate === prevDayIso(today)) {
    return prev + 1
  }
  return 1
}

/**
 * @param {object} userStatus
 * @param {WorkoutType} workoutType
 * @param {Difficulty} difficulty
 */
export function applyWorkout(userStatus, workoutType, difficulty) {
  const statKeys = WORKOUT_STATS[workoutType]
  const bonus = DIFFICULTY_STAT_BONUS[difficulty]
  if (!statKeys || !bonus) return userStatus

  const today = todayIsoUtc()
  const coins = userStatus.coins + (COIN_REWARD[difficulty] ?? 0)
  const nextStats = { ...userStatus.stats }

  for (const key of statKeys) {
    nextStats[key] = (nextStats[key] ?? 0) + bonus
  }

  const newStreak = nextWorkoutStreak(userStatus.lastWorkoutDate, userStatus.workoutStreak ?? 0, today)
  if (newStreak >= DILIGENCE_MIN_STREAK) {
    nextStats.diligence = (nextStats.diligence ?? 0) + bonus
  }

  return {
    ...userStatus,
    coins,
    stats: nextStats,
    workoutStreak: newStreak,
    lastWorkoutDate: today,
  }
}

export const WORKOUT_LABELS = {
  running: '러닝',
  bodyweight: '맨몸 운동',
  stretch: '스트레칭',
}

export const DIFFICULTY_LABELS = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
}
