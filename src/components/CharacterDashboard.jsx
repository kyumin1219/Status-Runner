import { getTitleTheme } from '../shop'

function dicebearPixelArtUrl(seed) {
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(seed)}`
}

export default function CharacterDashboard({ seed, titleId = null, titleLabel, decayShieldDetail = null }) {
  const titleTheme = getTitleTheme(titleId)

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">나의 캐릭터</p>
      <div className="rounded-2xl bg-gradient-to-b from-violet-100/80 to-slate-50 p-6 shadow-inner ring-1 ring-violet-200/60 dark:from-violet-950/40 dark:to-slate-900 dark:ring-violet-800/50">
        {titleLabel ? (
          <p
            className={`mb-2 max-w-[14rem] rounded-full border px-3 py-1.5 text-center text-[11px] font-bold leading-tight transition-transform duration-200 hover:-translate-y-0.5 sm:text-xs ${titleTheme.chipClass}`}
            title={titleLabel}
          >
            「{titleLabel}」
          </p>
        ) : null}
        <img
          src={dicebearPixelArtUrl(seed)}
          alt=""
          className="mx-auto h-40 w-40 sm:h-44 sm:w-44"
          width={176}
          height={176}
          loading="lazy"
          decoding="async"
        />
        <div
          className={`mt-4 rounded-xl border px-3 py-2 text-center text-[11px] font-semibold leading-snug sm:text-xs ${
            decayShieldDetail
              ? 'border-amber-300/90 bg-amber-50 text-amber-950 dark:border-amber-700/80 dark:bg-amber-950/35 dark:text-amber-100'
              : 'border-slate-200/80 bg-white/60 text-slate-500 dark:border-slate-600/80 dark:bg-slate-800/40 dark:text-slate-400'
          }`}
          role="status"
        >
          {decayShieldDetail ? (
            <>
              <span className="block text-amber-800 dark:text-amber-200">스탯 하락 방지권 적용 중</span>
              <span className="mt-0.5 block text-[10px] font-normal leading-snug opacity-95">
                효과 종료 예정: {decayShieldDetail.expiresAtFormatted}
              </span>
            </>
          ) : (
            <>
              <span className="block">하락 방지권 없음</span>
              <span className="mt-0.5 block text-[10px] font-normal opacity-90">
                상점에서 오늘치 방패를 살 수 있어요
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
