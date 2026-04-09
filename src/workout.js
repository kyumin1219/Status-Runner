import { localDateString, localMidnightAfterYmd } from './dateUtils'

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

/** 오늘 자정 전까지 완료 */
export const QUEST_DEADLINE = 'today'

/** 종류·난이도 조합별 퀘스트 안내 (랜덤 배정 시 표시) */
export const QUEST_INSTRUCTIONS = {
  running: {
    easy: '3km 러닝 또는 20분 걷기',
    medium: '5km 러닝',
    hard: '7km 러닝 또는 인터벌 30분',
  },
  bodyweight: {
    easy: '푸시업 50회 + 스쿼트 80회',
    medium: '푸시업 100회 + 스쿼트 150회',
    hard: '푸시업 150회 + 스쿼트 200회 + 버피 30회',
  },
  stretch: {
    easy: '전신 스트레칭 15분',
    medium: '전신 스트레칭 25분',
    hard: '전신 스트레칭 35분 + 자세 유지',
  },
}

const WORKOUT_TYPES_ALL = /** @type {const} */ (['running', 'bodyweight', 'stretch'])
const DIFFICULTIES_ALL = /** @type {const} */ (['easy', 'medium', 'hard'])

/**
 * @returns {{ workoutType: WorkoutType, difficulty: Difficulty }}
 */
export function rollRandomQuest() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = crypto.getRandomValues(new Uint32Array(2))
    return {
      workoutType: WORKOUT_TYPES_ALL[buf[0] % WORKOUT_TYPES_ALL.length],
      difficulty: DIFFICULTIES_ALL[buf[1] % DIFFICULTIES_ALL.length],
    }
  }
  return {
    workoutType: WORKOUT_TYPES_ALL[Math.floor(Math.random() * WORKOUT_TYPES_ALL.length)],
    difficulty: DIFFICULTIES_ALL[Math.floor(Math.random() * DIFFICULTIES_ALL.length)],
  }
}

function shuffledWorkoutTypes() {
  const arr = [...WORKOUT_TYPES_ALL]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * @param {WorkoutType} workoutType
 * @param {Difficulty} difficulty
 */
export function getQuestInstruction(workoutType, difficulty) {
  const block = QUEST_INSTRUCTIONS[workoutType]
  return block?.[difficulty] ?? ''
}

export function todayIsoUtc() {
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
 * @param {number} [now]
 */
export function resolveExpiredQuest(userStatus, now = Date.now()) {
  const q = userStatus.activeQuest
  if (!q || now <= q.deadline) return userStatus
  return {
    ...userStatus,
    activeQuest: null,
    questChoices: null,
    pendingFailureMessage: '오늘 안에 퀘스트를 완료하지 못해 자동으로 실패했습니다.',
  }
}

/**
 * 난이도를 선택하면 운동 종류 3개 후보를 만들어 보여준다.
 * @param {object} userStatus
 * @param {Difficulty} difficulty
 */
export function prepareQuestChoices(userStatus, difficulty) {
  const today = todayIsoUtc()
  if (userStatus.lastWorkoutDate === today) return userStatus
  const existing = userStatus.activeQuest
  if (existing && existing.deadline > Date.now()) return userStatus
  if (!DIFFICULTIES_ALL.includes(difficulty)) return userStatus
  const options = shuffledWorkoutTypes().slice(0, 3)
  const localToday = localDateString()
  return {
    ...userStatus,
    questChoices: {
      difficulty,
      day: localToday,
      options,
    },
  }
}

/**
 * 후보 중 하나를 선택해서 오늘 퀘스트를 확정한다.
 * @param {object} userStatus
 * @param {WorkoutType} workoutType
 */
export function acceptQuestChoice(userStatus, workoutType) {
  const qc = userStatus.questChoices
  if (!qc) return userStatus
  if (!qc.options.includes(workoutType)) return userStatus
  const localToday = localDateString()
  const midnight = localMidnightAfterYmd(localToday)
  if (!midnight) return userStatus
  const deadline = midnight.getTime()
  return {
    ...userStatus,
    activeQuest: {
      workoutType,
      difficulty: qc.difficulty,
      deadline,
      day: localToday,
    },
    questChoices: null,
  }
}

/**
 * 진행 중인 퀘스트를 완료 처리(스탯·코인·연속일 반영). 제한 시간 초과 시 상태 변경 없음.
 * @param {object} userStatus
 */
export function completeActiveQuest(userStatus) {
  const q = userStatus.activeQuest
  if (!q) return userStatus
  if (Date.now() > q.deadline) return userStatus
  const { activeQuest: _, ...rest } = userStatus
  return applyWorkout(rest, q.workoutType, q.difficulty)
}

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

/** @param {number} ms */
export function formatQuestRemainingMs(ms) {
  if (ms <= 0) return '0:00:00'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
