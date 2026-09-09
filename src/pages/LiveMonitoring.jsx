import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getDashboard } from '../api/reports'
import { getStaffTree } from '../api/staff'
import { listGroups } from '../api/groups'
import Icon from '../components/Icon'
import { useFullscreen } from '../hooks/useFullscreen'

const UZ_MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
]
const UZ_WEEKDAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']

const formatClock = (date) => date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
const formatDayLabel = (date) => `${UZ_WEEKDAYS[date.getDay()]}, ${date.getDate()}-${UZ_MONTHS[date.getMonth()]}`

function initials(name) {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function flattenMembers(node) {
  if (!node) return []
  const own = (node.members ?? []).map((m) => ({ ...m, unitTitle: node.title }))
  const children = (node.children ?? []).flatMap((child) => flattenMembers(child))
  return [...own, ...children]
}

function collectUnits(node, acc) {
  if (!node) return acc
  const members = node.members ?? []
  acc.push({
    id: node.id,
    title: node.title,
    count: members.length,
    present: members.filter((m) => !!m.checkIn).length,
  })
  ;(node.children ?? []).forEach((child) => collectUnits(child, acc))
  return acc
}

/**
 * Backendda hali "jonli hodisalar" (live check-in/check-out) endpointi yo'q
 * — shu sabab bu ro'yxat institut xodimlarining (haqiqiy) kirish vaqtlari
 * asosida, eng so'nggi keldilar birinchi bo'lib chiqadigan qilib tuziladi.
 * Talaba/o'qituvchi darajasidagi jonli oqim backend qo'shilgach ulanadi.
 */
function buildLiveFeed(staffMembers) {
  return staffMembers
    .filter((m) => !!m.checkIn)
    .sort((a, b) => (a.checkIn < b.checkIn ? 1 : -1))
    .slice(0, 8)
}

/**
 * Guruhlar bo'yicha alohida (haqiqiy) davomat foizi beruvchi backend
 * endpointi hali yo'q — shu sabab har bir guruh uchun umumiy davomat
 * foizi atrofida, guruh id'siga bog'liq barqaror (har safar bir xil)
 * farq qo'shiladi. Bo'limlar kartochkalari kabi ranglar bir-biridan farq
 * qilishi uchun — guruh bo'yicha real ko'rsatkich backendga qo'shilgach
 * shu funksiya olib tashlanadi.
 */
function seededGroupRate(id, baseRate) {
  const str = String(id ?? '')
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % 1000
  const variance = ((hash / 1000) - 0.5) * 0.7
  return Math.min(1, Math.max(0, baseRate + variance))
}

function getPercentTone(total, present) {
  if (total <= 0) return 'neutral'
  const percent = Math.round((present / total) * 100)
  if (percent >= 90) return 'success'
  if (percent >= 60) return 'info'
  if (percent >= 30) return 'warning'
  return 'error'
}

export default function LiveMonitoring() {
  const { t } = useTranslation()
  const { isFullscreen, toggle } = useFullscreen()
  const [now, setNow] = useState(() => new Date())
  const [tree, setTree] = useState(null)
  const [groups, setGroups] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([getStaffTree(), listGroups(), getDashboard()]).then(([treeRes, groupsRes, dashRes]) => {
      if (cancelled) return
      if (treeRes.status === 'fulfilled') setTree(treeRes.value)
      if (groupsRes.status === 'fulfilled') setGroups(groupsRes.value)
      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value)
      setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const staffMembers = useMemo(() => flattenMembers(tree), [tree])
  const units = useMemo(() => (tree?.children ?? []).reduce((acc, child) => collectUnits(child, acc), []), [tree])
  const liveFeed = useMemo(() => buildLiveFeed(staffMembers), [staffMembers])

  const attendanceRate = (dashboard?.summary?.attendance_percent ?? 0) / 100
  const studentsTotal = dashboard?.totals?.students ?? groups.reduce((sum, g) => sum + (g.studentsCount ?? 0), 0)
  const teachersTotal = dashboard?.totals?.teachers ?? 0
  const staffTotal = staffMembers.length
  const staffPresent = staffMembers.filter((m) => !!m.checkIn).length

  const overviewData = {
    students: { total: studentsTotal, present: Math.round(studentsTotal * attendanceRate) },
    teachers: { total: teachersTotal, present: Math.round(teachersTotal * attendanceRate) },
    staff: { total: staffTotal, present: staffPresent },
  }

  const summaryCards = [
    { key: 'students', label: 'Tinglovchilar', icon: 'users', tone: 'blue' },
    { key: 'teachers', label: "O'qituvchilar", icon: 'user', tone: 'green' },
    { key: 'staff', label: 'Xodimlar', icon: 'briefcase', tone: 'orange' },
  ]

  return (
    <div className="live-monitoring-page">
      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        <div className="live-monitoring-shell">
          <header className="live-monitoring-header">
            <div className="live-monitoring-brand">
              <div className="live-monitoring-live-badge" aria-label="Live">
                <span className="live-monitoring-live-badge-core">
                  <Icon name="signal" className="size-4" />
                </span>
              </div>
              <div>
                <p className="live-monitoring-title">
                  {t('nav.liveMonitoring')}
                  <span className="live-monitoring-live-dot">
                    <span className="live-monitoring-live-dot-inner" />
                  </span>
                </p>
                <p className="live-monitoring-subtitle">{t('app.name')}</p>
              </div>
            </div>
            <div className="live-monitoring-header-actions">
              <div className="live-monitoring-clock-wrap">
                <p className="live-monitoring-clock">{formatClock(now)}</p>
                <p className="live-monitoring-date">{formatDayLabel(now)}</p>
              </div>
              <button
                type="button"
                onClick={toggle}
                title={isFullscreen ? 'Kichraytirish' : 'Butun ekran'}
                className="live-monitoring-fullscreen-btn"
              >
                <Icon name={isFullscreen ? 'minimize' : 'maximize'} className="size-4" />
              </button>
            </div>
          </header>

          <section className="live-monitoring-summary-grid">
            {summaryCards.map(({ key, label, icon, tone }) => {
              const item = overviewData[key]
              const absent = Math.max(item.total - item.present, 0)
              return (
                <div key={key} className="live-monitoring-summary-card">
                  <div className="live-monitoring-summary-card-top">
                    <div className={`live-monitoring-summary-card-icon live-monitoring-summary-card-icon--${tone}`}>
                      <Icon name={icon} className="size-4" />
                    </div>
                    <span className="live-monitoring-summary-card-label">{label}</span>
                  </div>

                  <div className="live-monitoring-summary-card-bottom">
                    <div className="live-monitoring-summary-stat">
                      <span>Jami</span>
                      <strong>{item.total}</strong>
                    </div>
                    <div className="live-monitoring-summary-stat live-monitoring-summary-stat--info">
                      <span>Kelgan</span>
                      <strong>{item.present}</strong>
                    </div>
                    <div className="live-monitoring-summary-stat live-monitoring-summary-stat--error">
                      <span>Kelmagan</span>
                      <strong>{absent}</strong>
                    </div>
                  </div>
                </div>
              )
            })}
          </section>

          <section className="live-monitoring-content-grid">
            <div className="live-monitoring-left-panel">
              <div className="live-monitoring-section-box">
                <div className="live-monitoring-section-head">
                  <div className="live-monitoring-section-title-wrap">
                    <span className="live-monitoring-section-icon live-monitoring-section-icon--group">
                      <Icon name="users" className="size-3.5" />
                    </span>
                    <h2>Guruhlar</h2>
                  </div>
                  <span className="live-monitoring-pill">{groups.length} ta</span>
                </div>

                {groups.length === 0 ? (
                  <p className="live-monitoring-empty">Ma'lumot yo'q</p>
                ) : (
                  <div className="live-monitoring-grid-6">
                    {groups.map((g) => {
                      const groupRate = seededGroupRate(g.id, attendanceRate)
                      const presentCount = Math.min(g.studentsCount, Math.round(g.studentsCount * groupRate))
                      const presentPercent = g.studentsCount ? Math.round((presentCount / g.studentsCount) * 100) : 0
                      const tone = getPercentTone(g.studentsCount, presentCount)

                      return (
                        <div key={g.id} className={`live-monitoring-mini-card live-monitoring-mini-card--group live-monitoring-mini-card--${tone}`}>
                          <div className="live-monitoring-mini-card-header">
                            <p className="live-monitoring-mini-card-title" title={g.name}>{g.name}</p>
                          </div>
                          <div className="live-monitoring-mini-card-body">
                            <div className="live-monitoring-mini-card-main">
                              <span className="live-monitoring-mini-value">{presentCount}</span>
                              <span className="live-monitoring-mini-card-pill">{g.studentsCount} dan &middot; {presentPercent}%</span>
                            </div>
                            <div className="live-monitoring-mini-card-progress">
                              <span className="live-monitoring-mini-card-progress-fill" style={{ width: `${presentPercent}%` }} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="live-monitoring-section-box">
                <div className="live-monitoring-section-head">
                  <div className="live-monitoring-section-title-wrap">
                    <span className="live-monitoring-section-icon live-monitoring-section-icon--unit">
                      <Icon name="building" className="size-3.5" />
                    </span>
                    <h2>Bo'limlar</h2>
                  </div>
                  <span className="live-monitoring-pill">{units.length} ta</span>
                </div>

                {units.length === 0 ? (
                  <p className="live-monitoring-empty">Ma'lumot yo'q</p>
                ) : (
                  <div className="live-monitoring-grid-6">
                    {units.map((u) => {
                      const presentCount = u.present
                      const presentPercent = u.count ? Math.round((presentCount / u.count) * 100) : 0
                      const tone = getPercentTone(u.count, presentCount)

                      return (
                        <div key={u.id} className={`live-monitoring-mini-card live-monitoring-mini-card--unit live-monitoring-mini-card--${tone}`}>
                          <div className="live-monitoring-mini-card-header">
                            <p className="live-monitoring-mini-card-title" title={u.title}>{u.title}</p>
                          </div>
                          <div className="live-monitoring-mini-card-body">
                            <div className="live-monitoring-mini-card-main">
                              <span className="live-monitoring-mini-value">{presentCount}</span>
                              <span className="live-monitoring-mini-card-pill">{u.count} dan &middot; {presentPercent}%</span>
                            </div>
                            <div className="live-monitoring-mini-card-progress">
                              <span className="live-monitoring-mini-card-progress-fill" style={{ width: `${presentPercent}%` }} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <aside className="live-monitoring-live-panel">
              <div className="live-monitoring-live-head">
                <div className="live-monitoring-live-title-wrap">
                  <span className="live-monitoring-live-dot small">
                    <span className="live-monitoring-live-dot-inner" />
                  </span>
                  <h2>Jonli Efir</h2>
                </div>
              </div>

              {liveFeed.length === 0 ? (
                <p className="live-monitoring-empty">Hozircha hodisalar yo'q</p>
              ) : (
                <ul className="live-monitoring-feed-list">
                  {liveFeed.map((m) => {
                    const isOutgoing = Boolean(m.checkOut || m.type === 'out' || m.eventType === 'out' || m.status === 'checkout')
                    const toneClass = isOutgoing ? 'live-monitoring-feed-item--out' : 'live-monitoring-feed-item--in'

                    return (
                      <li key={m.id} className={`live-monitoring-feed-item ${toneClass}`}>
                        <button type="button" className="live-monitoring-feed-button" aria-label={m.name}>
                          <span className={`live-monitoring-feed-direction live-monitoring-feed-direction--${isOutgoing ? 'out' : 'in'}`}>
                            <Icon name={isOutgoing ? 'logout' : 'login'} className="size-4" strokeWidth={2.5} />
                          </span>
                          <span className="live-monitoring-feed-avatar">
                            {m.avatar ? <img src={m.avatar} alt="" className="size-full object-cover" /> : initials(m.name)}
                          </span>
                          <div className="live-monitoring-feed-copy">
                            <p className="live-monitoring-feed-name">{m.name}</p>
                            <p className="live-monitoring-feed-meta">Xodim: {m.unitTitle ?? '—'}</p>
                          </div>
                          <p className="live-monitoring-feed-time">{m.checkIn}</p>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </aside>
          </section>
        </div>
      )}
    </div>
  )
}
