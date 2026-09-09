import { useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../../components/Icon'
import { useToast } from '../../context/useToast'

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

/**
 * Dumaloq avatar — rasm bo'lsa, hover qilganda lupa iconi bilan qoraygan
 * qatlam chiqadi, bosilganda `onZoom(src)` orqali rasm butun ekranda
 * kattalashtirib ko'rsatiladi (pastdagi lightbox).
 */
function Avatar({ src, name, size = 'size-9', iconSize = 'size-4', onZoom }) {
  const base = `flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-black text-primary ${size}`

  if (!src) return <span className={base}>{initials(name)}</span>

  return (
    <button
      type="button"
      onClick={() => onZoom(src)}
      title="Rasmni kattalashtirish"
      className={`group/avatar relative cursor-zoom-in ${base}`}
    >
      <img src={src} alt="" className="size-full object-cover" />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-150 group-hover/avatar:opacity-100">
        <Icon name="search" className={`${iconSize} text-white`} strokeWidth={2.5} />
      </span>
    </button>
  )
}

const TABS = [
  { key: 'kelganlar', label: 'Kelganlar', icon: 'badgeCheck', tone: 'success' },
  { key: 'kechQolganlar', label: 'Kech qolganlar', icon: 'clock', tone: 'warning' },
  { key: 'kelmaganlar', label: 'Kelmaganlar (Sababsiz)', icon: 'x', tone: 'error' },
  { key: 'sababli', label: 'Sababli', icon: 'fileText', tone: 'info' },
]

const TONE_BADGE = {
  success: 'bg-success/15 text-success',
  error: 'bg-error/15 text-error',
  warning: 'bg-warning/20 text-warning',
  info: 'bg-info/15 text-info',
}

// Kech qolish 09:00dan boshlab hisoblanadi (StaffMemberRow bilan bir xil
// chegara); 09:30gacha — ogohlantirish, undan keyin — qoida buzilishi.
const isLate = (m) => !!m.checkIn && m.checkIn > '09:00'
const isViolation = (m) => !!m.checkIn && m.checkIn > '09:30'

function matchTab(key, m) {
  if (key === 'kelganlar') return !!m.checkIn
  if (key === 'kechQolganlar') return isLate(m)
  if (key === 'kelmaganlar') return !m.checkIn && m.status !== 'sababli'
  if (key === 'sababli') return m.status === 'sababli'
  return false
}

function PresenceTable({ rows, onZoomPhoto, badgeTone = 'success' }) {
  if (rows.length === 0) {
    return <p className="py-3 text-sm text-base-content/40">Bu guruhda xodim yo'q</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-base-300 text-xs uppercase text-base-content/40">
            <th className="py-2 pr-3 font-bold">Xodim</th>
            <th className="py-2 pr-3 font-bold">Bo'lim / Kafedra</th>
            <th className="py-2 pr-3 font-bold">Vaqt</th>
            <th className="py-2 pr-3 font-bold">Rasmlar</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.id} className="border-b border-base-200 last:border-b-0">
              <td className="py-3 pr-3">
                <div className="flex items-center gap-2.5">
                  <Avatar src={m.avatar} name={m.name} size="size-9" onZoom={onZoomPhoto} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-base-content">{m.name}</p>
                    <p className="truncate text-xs text-base-content/50">{m.position}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-3 text-base-content/70">{m.unitTitle}</td>
              <td className="py-3 pr-3">
                <span className={`rounded-md px-2 py-1 text-xs font-bold tabular-nums ${TONE_BADGE[badgeTone]}`}>
                  {m.checkIn}
                </span>
              </td>
              <td className="py-3 pr-3">
                <button
                  type="button"
                  disabled={!m.avatar}
                  onClick={() => onZoomPhoto(m.avatar)}
                  title="Kirishdagi suratni ko'rish"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-info px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-info/90 disabled:cursor-not-allowed disabled:bg-base-300 disabled:text-base-content/30"
                >
                  <Icon name="camera" className="size-3.5" />
                  Rasm
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * "Sabab kiritish" / "O'zgartirish" tugmalari hozircha faqat vizual — xodim
 * uchun kelmaslik sababini saqlaydigan backend endpoint hali yo'q (faqat
 * talaba davomatida shunday imkoniyat bor). Backend tayyor bo'lgach shu
 * yerga haqiqiy so'rov ulanadi, hozircha ogohlantirish ko'rsatiladi.
 */
export default function StaffAnalysisModal({ open, onClose, members, initialTab = 'kelganlar' }) {
  // Modal har safar yopiq holatdan ochilganda `activeTab` `initialTab`ga
  // qaytariladi — bu render vaqtida (effektsiz) amalga oshiriladi, React
  // hujjatlaridagi "propga bog'liq state'ni reset qilish" andozasi bo'yicha.
  const [tabState, setTabState] = useState({ activeTab: initialTab, lateSubTab: 'ogohlantirish', wasOpen: open })
  const [lightboxImage, setLightboxImage] = useState(null)
  if (open && !tabState.wasOpen) {
    setTabState({ activeTab: initialTab, lateSubTab: 'ogohlantirish', wasOpen: true })
    if (lightboxImage) setLightboxImage(null)
  } else if (!open && tabState.wasOpen) {
    setTabState((s) => ({ ...s, wasOpen: false }))
  }
  const activeTab = tabState.activeTab
  const lateSubTab = tabState.lateSubTab
  const setActiveTab = (tab) => setTabState((s) => ({ ...s, activeTab: tab, lateSubTab: 'ogohlantirish' }))
  const setLateSubTab = (sub) => setTabState((s) => ({ ...s, lateSubTab: sub }))
  const toast = useToast()

  if (!open) return null

  const notReady = () => toast.error("Bu amal hali backendga ulanmagan — tez orada qo'shiladi")
  const rows = members.filter((m) => matchTab(activeTab, m))

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-5 sm:p-6 sm:pt-8" onClick={(e) => e.stopPropagation()}>
      <div className="absolute inset-0 bg-base-content/45 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[18px] border border-base-300 bg-base-100 shadow-[0_20px_45px_rgba(15,23,42,0.18)]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-base-300 bg-base-200/40 px-5 py-3 sm:px-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-primary">Xodimlar Davomati Tahlili</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="flex size-8 items-center justify-center rounded-lg text-base-content/60 transition-colors hover:bg-base-200 hover:text-base-content"
          >
            <Icon name="x" className="size-4" />
          </button>
        </div>

        <div className="flex shrink-0 items-end gap-1 overflow-x-auto overflow-y-hidden border-b border-base-300 bg-base-200/60 px-3 pt-2.5">
          {TABS.map((tab) => {
            const count = members.filter((m) => matchTab(tab.key, m)).length
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative -mb-px flex shrink-0 items-center gap-2 rounded-t-xl border border-b-0 px-4 py-2.5 text-sm font-bold transition-all ${
                  isActive
                    ? `z-10 border-base-300 bg-base-100 text-base-content shadow-[0_-2px_6px_rgba(15,23,42,0.06)]`
                    : 'mt-1.5 border-transparent bg-base-300/40 text-base-content/80 hover:bg-base-300/60 hover:text-base-content'
                }`}
              >
                <span className={`flex size-5 items-center justify-center rounded-md ${TONE_BADGE[tab.tone]}`}>
                  <Icon name={tab.icon} className="size-3.5" />
                </span>
                <span>{tab.label}</span>
                <span className={`min-w-6 rounded-full px-1.5 py-0.5 text-center text-[11px] font-black ${TONE_BADGE[tab.tone]}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'kelganlar' &&
            (rows.length === 0 ? (
              <p className="py-10 text-center text-sm text-base-content/50">Bu toifada xodim yo'q</p>
            ) : (
              <PresenceTable rows={rows} onZoomPhoto={setLightboxImage} badgeTone="success" />
            ))}

          {activeTab === 'kechQolganlar' &&
            (() => {
              const warnRows = rows.filter((m) => !isViolation(m))
              const violationRows = rows.filter(isViolation)
              const subRows = lateSubTab === 'ogohlantirish' ? warnRows : violationRows

              return rows.length === 0 ? (
                <p className="py-10 text-center text-sm text-base-content/50">Bu toifada xodim yo'q</p>
              ) : (
                <div>
                  <div className="mb-4 flex border-b border-base-200">
                    <button
                      type="button"
                      onClick={() => setLateSubTab('ogohlantirish')}
                      className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${
                        lateSubTab === 'ogohlantirish'
                          ? 'border-warning text-warning'
                          : 'border-transparent text-base-content/50 hover:text-base-content'
                      }`}
                    >
                      09:00 - 09:30 (Ogohlantirish)
                      <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs font-black text-warning">
                        {warnRows.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLateSubTab('qoidabuzarlik')}
                      className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${
                        lateSubTab === 'qoidabuzarlik'
                          ? 'border-error text-error'
                          : 'border-transparent text-base-content/50 hover:text-base-content'
                      }`}
                    >
                      09:30 dan keyin (Qoidabuzarlik)
                      <span className="rounded-full bg-error/15 px-2 py-0.5 text-xs font-black text-error">
                        {violationRows.length}
                      </span>
                    </button>
                  </div>

                  {subRows.length === 0 ? (
                    <p className="py-6 text-center text-sm text-base-content/40">Bu guruhda xodim yo'q</p>
                  ) : (
                    <div className="flex flex-col">
                      {subRows.map((m) => (
                        <div key={m.id} className="flex items-center justify-between gap-3 border-b border-base-200 py-3 last:border-b-0">
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar src={m.avatar} name={m.name} size="size-11" onZoom={setLightboxImage} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-base-content">{m.name}</p>
                              <p className="truncate text-xs text-base-content/50">
                                {m.position}
                                {m.unitTitle ? `, ${m.unitTitle}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              type="button"
                              disabled={!m.avatar}
                              onClick={() => setLightboxImage(m.avatar)}
                              title="Kirishdagi suratni ko'rish"
                              aria-label="Kirishdagi suratni ko'rish"
                              className="flex size-8 items-center justify-center rounded-lg bg-info text-white shadow-sm transition-colors hover:bg-info/90 disabled:cursor-not-allowed disabled:bg-base-300 disabled:text-base-content/30"
                            >
                              <Icon name="camera" className="size-4" />
                            </button>
                            <span
                              className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold tabular-nums ${
                                lateSubTab === 'ogohlantirish' ? 'bg-warning/20 text-warning' : 'bg-error/15 text-error'
                              }`}
                            >
                              <Icon name="clock" className="size-3" />
                              {m.checkIn}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}

          {(activeTab === 'kelmaganlar' || activeTab === 'sababli') &&
            (rows.length === 0 ? (
              <p className="py-10 text-center text-sm text-base-content/50">Bu toifada xodim yo'q</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-base-300 text-xs uppercase text-base-content/40">
                      <th className="py-2 pr-3 font-bold">Xodim</th>
                      <th className="py-2 pr-3 font-bold">Bo'lim / Kafedra</th>
                      {activeTab === 'kelmaganlar' && <th className="py-2 pr-3 font-bold">Holati</th>}
                      {activeTab === 'sababli' && <th className="py-2 pr-3 font-bold">Sababi (Izoh)</th>}
                      <th className="py-2 pr-3 text-right font-bold">Amal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((m) => (
                      <tr key={m.id} className="border-b border-base-200 last:border-b-0">
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar src={m.avatar} name={m.name} size="size-9" onZoom={setLightboxImage} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-base-content">{m.name}</p>
                              <p className="truncate text-xs text-base-content/50">{m.position}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-base-content/70">{m.unitTitle}</td>

                        {activeTab === 'kelmaganlar' && (
                          <td className="py-3 pr-3">
                            <span className="rounded-md bg-error/15 px-2 py-1 text-xs font-bold text-error">Kelmagan</span>
                          </td>
                        )}

                        {activeTab === 'sababli' && (
                          <td className="py-3 pr-3">
                            <span className="rounded-md bg-info/15 px-2 py-1 text-xs font-bold text-info">
                              {m.reasonText || '—'}
                            </span>
                          </td>
                        )}

                        <td className="py-3 pr-3 text-right">
                          <button
                            type="button"
                            onClick={notReady}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-info/40 px-3 py-1.5 text-xs font-bold text-info transition-colors hover:bg-info/10"
                          >
                            <Icon name={activeTab === 'sababli' ? 'settings' : 'pencil'} className="size-3.5" />
                            {activeTab === 'sababli' ? "O'zgartirish" : 'Sabab kiritish'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </div>
      </div>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            aria-label="Yopish"
            className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <Icon name="x" className="size-5" />
          </button>
          <img
            src={lightboxImage}
            alt=""
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>,
    document.body,
  )
}
