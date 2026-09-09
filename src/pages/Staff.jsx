import { useEffect, useMemo, useState } from 'react'
import { getStaffTree } from '../api/staff'
import Alert from '../components/form/Alert'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/table/EmptyState'
import OrgUnitNode from '../features/staff/OrgUnitNode'
import StaffAnalysisModal from '../features/staff/StaffAnalysisModal'

function flattenStaffMembers(node) {
  if (!node) return []
  const own = (node.members ?? []).map((m) => ({ ...m, unitTitle: node.title }))
  const children = (node.children ?? []).flatMap((child) => flattenStaffMembers(child))
  return [...own, ...children]
}

const STAT_TAB_MAP = { keldi: 'kelganlar', kechQoldi: 'kechQolganlar', kelmagan: 'kelmaganlar', sababli: 'sababli' }

// "Sababli" toifasi hozircha bo'sh chiqadi — backend xodim tuzilmasida
// (`getStaffTree`) hali "sababli sabab bilan yo'q" degan alohida maydon yo'q
// (faqat `checkIn` bor). Backend bu maydonni qo'shsa (masalan `member.status
// === 'sababli'`), shu toifa avtomatik to'ldiriladi.
const STAT_DEFS = [
  {
    key: 'keldi',
    label: 'Vaqtida keldi',
    icon: 'check',
    tone: 'success',
    match: (m) => !!m.checkIn && m.checkIn <= '09:00',
  },
  {
    key: 'kechQoldi',
    label: 'Kech qoldi',
    icon: 'clock',
    tone: 'warning',
    match: (m) => !!m.checkIn && m.checkIn > '09:00',
  },
  {
    key: 'kelmagan',
    label: 'Kelmagan',
    icon: 'x',
    tone: 'error',
    match: (m) => !m.checkIn && m.status !== 'sababli',
  },
  {
    key: 'sababli',
    label: 'Sababli',
    icon: 'fileText',
    tone: 'info',
    match: (m) => m.status === 'sababli',
  },
]

const TONE_CLASSES = {
  success: { chip: 'bg-success/12 text-success', border: 'border-success/25 hover:border-success/60', line: 'bg-success' },
  warning: { chip: 'bg-warning/18 text-warning', border: 'border-warning/30 hover:border-warning/60', line: 'bg-warning' },
  error: { chip: 'bg-error/12 text-error', border: 'border-error/25 hover:border-error/60', line: 'bg-error' },
  info: { chip: 'bg-info/12 text-info', border: 'border-info/25 hover:border-info/60', line: 'bg-info' },
}

export default function Staff() {
  const [tree, setTree] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [activeStat, setActiveStat] = useState(null)

  useEffect(() => {
    let cancelled = false
    getStaffTree()
      .then((data) => {
        if (!cancelled) setTree(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message ?? "Tuzilmani yuklab bo'lmadi")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const allMembers = useMemo(() => flattenStaffMembers(tree), [tree])
  const groups = useMemo(
    () => Object.fromEntries(STAT_DEFS.map((def) => [def.key, allMembers.filter(def.match)])),
    [allMembers],
  )
  const presentCount = groups.keldi.length + groups.kechQoldi.length
  const attendanceRate = allMembers.length ? Math.round((presentCount / allMembers.length) * 100) : 0
  return (
    <div>
      <PageHeader
        title="Institut xodimlari"
        description="Ierarxik tuzilma va davomat — ish vaqti monitoringi"
        icon="sitemap"
      />

      {tree && (
        <div className="mb-5 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-200 bg-base-200/40 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <p className="text-lg font-extrabold text-primary">Xodimlar Davomati Tahlili</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-success/20 bg-success/8 px-3 py-1.5">
              <span className="size-2 rounded-full bg-success" />
              <span className="text-xs font-bold text-success">{attendanceRate}% ishda</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 p-3 sm:gap-3 sm:p-4">
            {STAT_DEFS.map((def) => (
              <button
                key={def.key}
                type="button"
                onClick={() => setActiveStat(def.key)}
                className={`group flex min-w-[160px] flex-1 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:min-w-[180px] ${TONE_CLASSES[def.tone].border} ${def.key === 'keldi' || def.key === 'kelmagan' ? 'bg-base-200/80' : 'bg-base-100'}`}
              >
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${TONE_CLASSES[def.tone].chip}`}>
                  <Icon name={def.icon} className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-base-content/70 sm:text-xs">{def.label}</p>
                  <p className="mt-0.5 text-xl font-black leading-none tabular-nums text-base-content sm:text-2xl">{groups[def.key].length}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="w-full max-w-full overflow-x-auto overflow-y-visible rounded-2xl border border-base-300 bg-base-100 p-3 shadow-sm sm:p-6">
        {loadError ? (
          <Alert variant="error">{loadError}</Alert>
        ) : isLoading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : !tree ? (
          <EmptyState message="Institut tuzilmasi hali kiritilmagan — admin panelida 'Institut tuzilmasi' bo'limidan boshlang." />
        ) : (
          <div className="flex w-fit min-w-full justify-center">
            <OrgUnitNode node={tree} />
          </div>
        )}
      </div>

      <StaffAnalysisModal
        open={!!activeStat}
        onClose={() => setActiveStat(null)}
        members={allMembers}
        initialTab={STAT_TAB_MAP[activeStat] ?? 'kelganlar'}
      />
    </div>
  )
}
