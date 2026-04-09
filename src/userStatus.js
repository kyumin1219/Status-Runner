export const STORAGE_KEY = 'status-runner:userStatus'

export function defaultUserStatus() {
  const seed = 'status-runner'
  return {
    currentBody: seed,
    coins: 0,
    stats: {
      strength: 8,
      agility: 8,
      vitality: 8,
      flexibility: 8,
      diligence: 8,
    },
    inventory: [seed],
    lastWorkoutDate: null,
    workoutStreak: 0,
    ownedTitleIds: [],
    equippedTitleId: null,
    decayShieldDay: null,
  }
}

function clampStat(n, fallback) {
  const x = Number(n)
  if (!Number.isFinite(x)) return fallback
  return Math.max(0, Math.min(999, Math.round(x)))
}

function clampStreak(n, fallback) {
  const x = Number(n)
  if (!Number.isFinite(x)) return fallback
  return Math.max(0, Math.min(999, Math.round(x)))
}

export function normalizeUserStatus(raw) {
  const d = defaultUserStatus()
  if (!raw || typeof raw !== 'object') return d

  const stats = raw.stats && typeof raw.stats === 'object' ? raw.stats : {}

  const ownedTitleIds = Array.isArray(raw.ownedTitleIds)
    ? raw.ownedTitleIds.filter((s) => typeof s === 'string' && s.length > 0)
    : d.ownedTitleIds

  let equippedTitleId =
    typeof raw.equippedTitleId === 'string' && raw.equippedTitleId.length > 0
      ? raw.equippedTitleId
      : null
  if (equippedTitleId && !ownedTitleIds.includes(equippedTitleId)) {
    equippedTitleId = null
  }

  const decayShieldDay =
    typeof raw.decayShieldDay === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.decayShieldDay)
      ? raw.decayShieldDay
      : null

  const lastWorkoutDate =
    typeof raw.lastWorkoutDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.lastWorkoutDate)
      ? raw.lastWorkoutDate
      : null

  return {
    currentBody:
      typeof raw.currentBody === 'string' && raw.currentBody.length > 0
        ? raw.currentBody
        : d.currentBody,
    coins: Number.isFinite(raw.coins) ? Math.max(0, Math.round(raw.coins)) : d.coins,
    stats: {
      strength: clampStat(stats.strength, d.stats.strength),
      agility: clampStat(stats.agility, d.stats.agility),
      vitality: clampStat(stats.vitality, d.stats.vitality),
      flexibility: clampStat(stats.flexibility, d.stats.flexibility),
      diligence: clampStat(stats.diligence, d.stats.diligence),
    },
    inventory: Array.isArray(raw.inventory)
      ? raw.inventory.filter((s) => typeof s === 'string' && s.length > 0)
      : d.inventory,
    lastWorkoutDate,
    workoutStreak: clampStreak(raw.workoutStreak, d.workoutStreak),
    ownedTitleIds,
    equippedTitleId,
    decayShieldDay,
  }
}
