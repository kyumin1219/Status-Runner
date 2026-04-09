function dicebearPixelArtUrl(seed) {
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(seed)}`
}

export default function CharacterDashboard({ seed, titleLabel }) {
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">나의 캐릭터</p>
      <div className="rounded-2xl bg-gradient-to-b from-violet-100/80 to-slate-50 p-6 shadow-inner ring-1 ring-violet-200/60 dark:from-violet-950/40 dark:to-slate-900 dark:ring-violet-800/50">
        {titleLabel ? (
          <p
            className="mb-2 max-w-[14rem] text-center text-[11px] font-bold leading-tight text-violet-700 dark:text-violet-300 sm:text-xs"
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
      </div>
    </div>
  )
}
