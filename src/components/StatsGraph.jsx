import { useMemo } from 'react'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

/** 레이더 축 순서: 힘 → 지구력 → 유연성 → 성실 → 민첩 */
const STAT_AXIS = [
  { key: 'strength', label: '힘' },
  { key: 'vitality', label: '지구력' },
  { key: 'flexibility', label: '유연성' },
  { key: 'diligence', label: '성실' },
  { key: 'agility', label: '민첩' },
]

export default function StatsGraph({ stats }) {
  const { data, maxScale } = useMemo(() => {
    const values = STAT_AXIS.map(({ key }) => stats[key] ?? 0)
    const peak = Math.max(...values, 10)
    const maxScale = Math.ceil(peak * 1.15)
    const labels = STAT_AXIS.map((a) => a.label)

    return {
      maxScale,
      data: {
        labels,
        datasets: [
          {
            label: '스탯',
            data: values,
            backgroundColor: 'rgba(139, 92, 246, 0.22)',
            borderColor: 'rgba(124, 58, 237, 0.95)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(124, 58, 237, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(124, 58, 237, 1)',
          },
        ],
      },
    }
  }, [stats])

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.formattedValue}`,
          },
        },
      },
      scales: {
        r: {
          suggestedMin: 0,
          suggestedMax: maxScale,
          ticks: {
            stepSize: Math.max(1, Math.round(maxScale / 5)),
            showLabelBackdrop: false,
          },
          angleLines: { color: 'rgba(148, 163, 184, 0.35)' },
          grid: { color: 'rgba(148, 163, 184, 0.35)' },
          pointLabels: {
            color: '#64748b',
            font: { size: 11, weight: '600' },
          },
        },
      },
    }),
    [maxScale],
  )

  return (
    <section className="px-4">
      <h2 className="mb-2 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
        스탯 레이더
      </h2>
      <div className="mx-auto h-80 w-full max-w-md">
        <Radar data={data} options={options} />
      </div>
      <ul className="mx-auto mt-2 grid max-w-md grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-3 sm:text-center lg:grid-cols-5">
        {STAT_AXIS.map(({ key, label }) => (
          <li key={key}>
            {label} {stats[key] ?? 0}
          </li>
        ))}
      </ul>
    </section>
  )
}
