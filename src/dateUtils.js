/** @param {Date} [d] */
export function localDateString(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 로컬 달력 기준 `ymd` 그날이 끝나는 시점 = 다음날 0시.
 * 방패는 `ymd` 당일만 적용되고, 이 시각 이후에는 효과가 없다고 보면 됨.
 * @param {string} ymd YYYY-MM-DD
 * @returns {Date | null}
 */
export function localMidnightAfterYmd(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  if (![y, mo, d].every((n) => Number.isFinite(n))) return null
  return new Date(y, mo - 1, d + 1, 0, 0, 0, 0)
}

/**
 * @param {string} ymd YYYY-MM-DD
 */
export function formatKoreanYmdLong(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!m) return ymd
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  const dt = new Date(y, mo - 1, d)
  return dt.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}
