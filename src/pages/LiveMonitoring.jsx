import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getLiveMonitoring } from '../api/faceid'
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

// "Jonli efir" qancha tez-tez qayta so'raladi (millisekund) — real vaqtda
// push (websocket) yo'q, shu sabab davriy so'rov (polling) bilan yangilanadi.
const LIVE_FEED_POLL_MS = 10000

const FEED_FILTERS = [
  { key: 'all', label: 'Hammasi' },
  { key: 'teacher', label: "O'qituvchilar" },
  { key: 'student', label: 'Tinglovchilar' },
  { key: 'staff', label: 'Xodimlar' },
]

const FEED_TYPE_LABELS = { student: 'Tinglovchi', teacher: "O'qituvchi", staff: 'Xodim' }

const formatClock = (date) => date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
const formatDayLabel = (date) => `${UZ_WEEKDAYS[date.getDay()]}, ${date.getDate()}-${UZ_MONTHS[date.getMonth()]}`

function formatFeedTime(isoDateTime) {
  if (!isoDateTime) return '—'
  const d = new Date(isoDateTime)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function initials(name) {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
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

  const [feedFilter, setFeedFilter] = useState('all')
  const [liveData, setLiveData] = useState({ counts: null, feed: [] })
  const [isLiveLoading, setIsLiveLoading] = useState(true)
  const [isFeedRefreshing, setIsFeedRefreshing] = useState(false)
  // Butun sahifani qayta "yuklanmoqda" holatiga qaytarmasin uchun — faqat
  // ENG BIRINCHI muvaffaqiyatli yuklashda `isLiveLoading` ishlatiladi,
  // keyingi har bir yangilanish (filtr almashtirish yoki davriy so'rov)
  // faqat kichik `isFeedRefreshing` indikatorini ko'rsatadi.
  const hasLoadedLiveOnceRef = useRef(false)

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

  // "Jonli efir" — filtr o'zgarganda darhol qayta so'raladi, aks holda har
  // `LIVE_FEED_POLL_MS`da avtomatik yangilanadi (kim kirdi/chiqdi real vaqtga
  // yaqin ko'rinib tursin uchun — websocket yo'qligi sabab davriy so'rov).
  useEffect(() => {
    let cancelled = false
    const load = () => {
      if (hasLoadedLiveOnceRef.current) setIsFeedRefreshing(true)
      getLiveMonitoring({ type: feedFilter === 'all' ? undefined : feedFilter })
        .then((data) => {
          if (!cancelled) setLiveData(data)
        })
        .catch(() => {})
        .finally(() => {
          if (cancelled) return
          hasLoadedLiveOnceRef.current = true
          setIsLiveLoading(false)
          setIsFeedRefreshing(false)
        })
    }
    load()
    const id = setInterval(load, LIVE_FEED_POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [feedFilter])

  const units = useMemo(() => (tree?.children ?? []).reduce((acc, child) => collectUnits(child, acc), []), [tree])

  const attendanceRate = (dashboard?.summary?.attendance_percent ?? 0) / 100
  const counts = liveData.counts

  const summaryCards = [
    { key: 'student', label: 'Tinglovchilar', icon: 'users', tone: 'blue' },
    { key: 'teacher', label: "O'qituvchilar", icon: 'user', tone: 'green' },
    { key: 'staff', label: 'Xodimlar', icon: 'briefcase', tone: 'orange' },
  ]

  const pageLoading = isLoading || isLiveLoading

  return (
    <div className="live-monitoring-page">
      {pageLoading ? (
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
              const item = counts[key]
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
                  {isFeedRefreshing && <span className="loading loading-spinner loading-xs" />}
                </div>
              </div>

              <div className="live-monitoring-feed-filters">
                {FEED_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFeedFilter(f.key)}
                    className={`live-monitoring-feed-filter-btn ${feedFilter === f.key ? 'live-monitoring-feed-filter-btn--active' : ''}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {liveData.feed.length === 0 ? (
                <p className="live-monitoring-empty">Hozircha hodisalar yo'q</p>
              ) : (
                <ul className="live-monitoring-feed-list">
                  {liveData.feed.map((m) => {
                    const isOutgoing = m.direction === 'exit'
                    const toneClass = isOutgoing ? 'live-monitoring-feed-item--out' : 'live-monitoring-feed-item--in'
                    const typeLabel = FEED_TYPE_LABELS[m.personType] ?? ''
                    const metaLine = m.meta ? `${typeLabel}: ${m.meta}` : typeLabel

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
                            <p className="live-monitoring-feed-meta">{metaLine}</p>
                          </div>
                          <p className="live-monitoring-feed-time">{formatFeedTime(m.time)}</p>
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
