import { useEffect, useState } from 'react'
import {
  GACHA_COST,
  SHIELD_COST,
  TITLE_CATALOG,
  getDecayShieldDisplay,
  getTitleTheme,
  isDecayShieldActive,
  tryBuyDecayShield,
  tryBuyTitle,
  tryEquipTitle,
  tryPullGacha,
} from '../shop'

export default function CoinShop({ userStatus, setUserStatus, embedded = false }) {
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(''), 3400)
    return () => clearTimeout(t)
  }, [msg])

  function apply(result) {
    if (!result.ok) {
      setMsg(result.reason)
      return
    }
    setUserStatus(result.userStatus)
    if (result.pulledSeed) setMsg('새 픽셀을 뽑았어요!')
    else setMsg('구매했어요.')
  }

  const shieldOn = isDecayShieldActive(userStatus)
  const shieldDetail = shieldOn ? getDecayShieldDisplay(userStatus.decayShieldDay) : null

  return (
    <section className={`px-4 pb-6 ${embedded ? 'pt-3' : 'pt-4'}`}>
      {!embedded ? (
        <>
          <h2 className="mb-1 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
            심심풀이 상점
          </h2>
          <p className="mb-4 text-center text-[11px] leading-snug text-slate-500 dark:text-slate-400">
            운동으로 모은 코인으로 작은 보상을 사 보세요.
          </p>
        </>
      ) : null}

      {msg ? (
        <p
          className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          {msg}
        </p>
      ) : null}

      <div className="mx-auto flex max-w-md flex-col gap-4">
        <article className="rounded-2xl border border-violet-200/80 bg-white/90 p-4 shadow-sm dark:border-violet-800/60 dark:bg-slate-900/80">
          <h3 className="text-sm font-bold text-violet-800 dark:text-violet-300">캐릭터 가챠</h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            새 픽셀 시드를 뽑아 바로 착용해요. (보유: {userStatus.coins} 코인)
          </p>
          <button
            type="button"
            disabled={userStatus.coins < GACHA_COST}
            onClick={() => apply(tryPullGacha(userStatus))}
            className="mt-3 w-full rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white shadow hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
          >
            뽑기 · {GACHA_COST} 코인
          </button>
          {userStatus.inventory.length > 1 ? (
            <label className="mt-3 block text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              착용 중인 캐릭터
              <select
                value={userStatus.currentBody}
                onChange={(e) =>
                  setUserStatus((p) => ({ ...p, currentBody: e.target.value }))
                }
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                {userStatus.inventory.map((s, i) => (
                  <option key={s} value={s}>
                    보유 {i + 1}
                    {s === userStatus.currentBody ? ' · 착용' : ''}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </article>

        <article className="rounded-2xl border border-violet-200/80 bg-white/90 p-4 shadow-sm dark:border-violet-800/60 dark:bg-slate-900/80">
          <h3 className="text-sm font-bold text-violet-800 dark:text-violet-300">칭호</h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            머리 위에 붙는 한 줄 멘트예요. 산 뒤에 장착할 수 있어요.
          </p>
          <ul className="mt-3 space-y-2">
            {TITLE_CATALOG.map((t) => {
              const owned = userStatus.ownedTitleIds.includes(t.id)
              const equipped = userStatus.equippedTitleId === t.id
              const theme = getTitleTheme(t.id)
              return (
                <li
                  key={t.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${theme.listNameClass}`}>
                      {t.label}
                    </p>
                    <p className="text-[11px] text-slate-500">{t.price} 코인</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!owned ? (
                      <button
                        type="button"
                        disabled={userStatus.coins < t.price}
                        onClick={() => apply(tryBuyTitle(userStatus, t.id))}
                        className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
                      >
                        구매
                      </button>
                    ) : equipped ? (
                      <span className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                        장착 중
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => apply(tryEquipTitle(userStatus, t.id))}
                        className="rounded-lg border border-violet-300 bg-white px-3 py-1.5 text-xs font-bold text-violet-800 hover:bg-violet-50 dark:border-violet-600 dark:bg-slate-800 dark:text-violet-200 dark:hover:bg-slate-700"
                      >
                        장착
                      </button>
                    )}
                    {owned && equipped ? (
                      <button
                        type="button"
                        onClick={() => apply(tryEquipTitle(userStatus, null))}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-white dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        벗기
                      </button>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        </article>

        <article className="rounded-2xl border border-violet-200/80 bg-white/90 p-4 shadow-sm dark:border-violet-800/60 dark:bg-slate-900/80">
          <h3 className="text-sm font-bold text-violet-800 dark:text-violet-300">스탯 하락 방지권</h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            오늘(로컬 기준) 하루 동안만 스탯 감소(Decay)를 막아 줘요. 나중에 Decay를 넣으면 그때 적용돼요.
          </p>
          <div className="mt-2 text-xs text-slate-700 dark:text-slate-200">
            <p className="font-medium">상태</p>
            {shieldDetail ? (
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-[11px] font-normal leading-snug text-slate-600 dark:text-slate-300">
                <li>구매·적용일: {shieldDetail.purchaseDateFormatted}</li>
                <li>효과 종료 예정: {shieldDetail.expiresAtFormatted}</li>
              </ul>
            ) : (
              <p className="mt-0.5 text-[11px] text-slate-500">미적용</p>
            )}
          </div>
          <button
            type="button"
            disabled={shieldOn || userStatus.coins < SHIELD_COST}
            onClick={() => apply(tryBuyDecayShield(userStatus))}
            className="mt-3 w-full rounded-xl border-2 border-amber-400/80 bg-amber-50 py-2.5 text-sm font-bold text-amber-950 hover:bg-amber-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100 dark:hover:bg-amber-950/50 dark:disabled:border-slate-700 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
          >
            방패 사기 · {SHIELD_COST} 코인
          </button>
        </article>
      </div>
    </section>
  )
}
