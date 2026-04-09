/** @typedef {'running' | 'bodyweight' | 'stretch'} WorkoutType */
/** @typedef {'easy' | 'medium' | 'hard'} Difficulty */

const PRIMARY_STAT = {
  running: 'agility',
  bodyweight: 'strength',
  stretch: 'flexibility',
}

const DIFF_BONUS = {
  easy: { primary: 1, vitality: 0 },
  medium: { primary: 2, vitality: 1 },
  hard: { primary: 3, vitality: 2 },
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
  const statKey = PRIMARY_STAT[workoutType]
  const bonus = DIFF_BONUS[difficulty]
  if (!statKey || !bonus) return userStatus

  const today = new Date().toISOString().slice(0, 10)
  const coins = userStatus.coins + (COIN_REWARD[difficulty] ?? 0)

  return {
    ...userStatus,
    coins,
    stats: {
      ...userStatus.stats,
      [statKey]: userStatus.stats[statKey] + bonus.primary,
      vitality: userStatus.stats.vitality + bonus.vitality,
    },
    lastWorkoutDate: today,
  }
}

export const WORKOUT_LABELS = {
  running: '러닝',
  bodyweight: '맨몸',
  stretch: '스트레칭',
}

export const DIFFICULTY_LABELS = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
}
