import { formatKoreanYmdLong, localDateString, localMidnightAfterYmd } from './dateUtils'

export const GACHA_COST = 80
export const SHIELD_COST = 35

/** @type {{ id: string, label: string, price: number }[]} */
export const TITLE_CATALOG = [
  { id: 'title-casual', label: '새싹처럼 걷기부터', price: 25 },
  { id: 'title-quit-god', label: '갓생 사는 알파메일', price: 50 },
  { id: 'title-legs', label: '루틴 괴물', price: 50 },
  { id: 'title-morning', label: '또 달리는 러너', price: 50 },
  { id: 'title-stretch-king', label: '고무고무 유연성', price: 50 },
]

function randomSeed() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `pixel-${crypto.randomUUID()}`
  }
  return `pixel-${Math.random().toString(36).slice(2)}-${Date.now()}`
}

function uniqueGachaSeed(inventory) {
  for (let i = 0; i < 12; i++) {
    const s = randomSeed()
    if (!inventory.includes(s)) return s
  }
  return `${randomSeed()}-x`
}

/**
 * @param {object} userStatus
 */
export function isDecayShieldActive(userStatus) {
  const day = userStatus.decayShieldDay
  if (typeof day !== 'string' || day.length < 8) return false
  return day === localDateString()
}

/**
 * 구매·적용일(로컬 달력)과 효과 종료 시각(그다음 날 0시).
 * @param {string | null | undefined} decayShieldDay
 * @returns {{ purchaseDateFormatted: string, expiresAtFormatted: string } | null}
 */
export function getDecayShieldDisplay(decayShieldDay) {
  if (typeof decayShieldDay !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(decayShieldDay)) {
    return null
  }
  const expires = localMidnightAfterYmd(decayShieldDay)
  if (!expires || Number.isNaN(expires.getTime())) return null
  return {
    purchaseDateFormatted: formatKoreanYmdLong(decayShieldDay),
    expiresAtFormatted: expires.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour12: false,
    }),
  }
}

/**
 * @param {string} titleId
 */
export function getTitleLabel(titleId) {
  const t = TITLE_CATALOG.find((x) => x.id === titleId)
  return t ? t.label : null
}

/**
 * @param {object} userStatus
 */
export function tryPullGacha(userStatus) {
  if (userStatus.coins < GACHA_COST) {
    return { ok: false, reason: `캐릭터 뽑기에는 ${GACHA_COST} 코인이 필요해요.` }
  }
  const seed = uniqueGachaSeed(userStatus.inventory)
  const inventory = userStatus.inventory.includes(seed)
    ? userStatus.inventory
    : [...userStatus.inventory, seed]
  return {
    ok: true,
    pulledSeed: seed,
    userStatus: {
      ...userStatus,
      coins: userStatus.coins - GACHA_COST,
      inventory,
      currentBody: seed,
    },
  }
}

/**
 * @param {object} userStatus
 * @param {string} titleId
 */
export function tryBuyTitle(userStatus, titleId) {
  const item = TITLE_CATALOG.find((t) => t.id === titleId)
  if (!item) return { ok: false, reason: '없는 칭호예요.' }
  if (userStatus.ownedTitleIds.includes(titleId)) {
    return { ok: false, reason: '이미 산 칭호예요.' }
  }
  if (userStatus.coins < item.price) {
    return { ok: false, reason: '코인이 부족해요.' }
  }
  return {
    ok: true,
    userStatus: {
      ...userStatus,
      coins: userStatus.coins - item.price,
      ownedTitleIds: [...userStatus.ownedTitleIds, titleId],
      equippedTitleId: titleId,
    },
  }
}

/**
 * @param {object} userStatus
 * @param {string | null} titleId
 */
export function tryEquipTitle(userStatus, titleId) {
  if (titleId == null || titleId === '') {
    return { ok: true, userStatus: { ...userStatus, equippedTitleId: null } }
  }
  if (!userStatus.ownedTitleIds.includes(titleId)) {
    return { ok: false, reason: '아직 없는 칭호예요.' }
  }
  return { ok: true, userStatus: { ...userStatus, equippedTitleId: titleId } }
}

/**
 * @param {object} userStatus
 */
export function tryBuyDecayShield(userStatus) {
  if (isDecayShieldActive(userStatus)) {
    return { ok: false, reason: '오늘은 이미 방패가 켜져 있어요.' }
  }
  if (userStatus.coins < SHIELD_COST) {
    return { ok: false, reason: `방패는 ${SHIELD_COST} 코인이에요.` }
  }
  const today = localDateString()
  return {
    ok: true,
    userStatus: {
      ...userStatus,
      coins: userStatus.coins - SHIELD_COST,
      decayShieldDay: today,
    },
  }
}
