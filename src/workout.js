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

const COIN_REWARD = {
  easy: 8,
  medium: 16,
  hard: 28,
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

  const today = new Date().toISOString().slice(0, 10)
  const coins = userStatus.coins + (COIN_REWARD[difficulty] ?? 0)
  const nextStats = { ...userStatus.stats }

  for (const key of statKeys) {
    nextStats[key] = (nextStats[key] ?? 0) + bonus
  }

  return {
    ...userStatus,
    coins,
    stats: nextStats,
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
