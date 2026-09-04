import { getAccentColor } from '../utils/colors'

// Dars jadvali, Davomat va Hisobotlar sahifalarida bir xil ko'rinishdagi
// guruh tanlash paneli — sahifa header banneriga "chiqib" turadi.
export default function GroupChipRow({ groups, selectedGroupId, onChange }) {
  if (groups.length === 0) return null

  return (
    <div className="relative z-10 -mt-14 mb-4 rounded-2xl bg-white/95 px-4 py-5 shadow-lg sm:-mt-16">
      <div className="flex flex-wrap justify-between gap-2">
        {groups.map((g) => {
          const accent = getAccentColor(g.id)
          const isSelected = g.id === selectedGroupId
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onChange(g.id)}
              className={[
                'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
                isSelected
                  ? `${accent.solid} text-white shadow-sm`
                  : 'bg-base-300/70 text-base-content/80 hover:bg-base-300',
              ].join(' ')}
            >
              <span className={`size-2 shrink-0 rounded-full ${isSelected ? 'bg-white' : accent.solid}`} />
              {g.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
