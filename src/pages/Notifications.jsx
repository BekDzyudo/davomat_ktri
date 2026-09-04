import { useEffect, useState } from 'react'
import { getTelegramLink, listNotifications } from '../api/notifications'
import Alert from '../components/form/Alert'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/table/EmptyState'
import {
  NOTIF_STATUS_LABELS,
  NOTIF_STATUS_TONE,
  NOTIF_TYPE_ICON,
  NOTIF_TYPE_LABELS,
} from '../data/notificationTypes'
import { formatDateTime } from '../utils/date'

function TelegramCard() {
  const [link, setLink] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getTelegramLink()
      .then((data) => {
        if (!cancelled) setLink(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Ma'lumotni yuklab bo'lmadi")
      })
    return () => {
      cancelled = true
    }
  }, [])

  const isLinked = Boolean(link?.linkedAt)

  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-box ${isLinked ? 'bg-success/10 text-success' : 'bg-info/10 text-info'}`}
        >
          <Icon name="send" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-base-content">Telegram orqali bildirishnoma</h2>

          {error ? (
            <p className="mt-1 text-sm text-error">{error}</p>
          ) : !link ? (
            <div className="mt-2 flex justify-start">
              <span className="loading loading-spinner loading-sm text-primary" />
            </div>
          ) : isLinked ? (
            <p className="mt-1 text-sm text-base-content/60">
              Hisobingiz Telegram botga ulangan ({formatDateTime(link.linkedAt)}) — endi bildirishnomalarni
              Telegram orqali ham olasiz.
            </p>
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              <p className="text-sm text-base-content/60">
                Bildirishnomalarni Telegram orqali olish uchun botni oching va quyidagi kodni yuboring:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-1.5 font-mono text-sm font-semibold tracking-wider text-primary">
                  {link.linkCode}
                </span>
                {link.botLink && (
                  <a
                    href={link.botLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-box bg-primary px-3 py-1.5 text-sm font-semibold text-primary-content shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
                  >
                    <Icon name="send" className="size-3.5" />
                    Botni ochish
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false
    listNotifications()
      .then((data) => {
        if (!cancelled) setNotifications(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message ?? "Ma'lumotlarni yuklab bo'lmadi")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <PageHeader title="Bildirishnomalar" />

      <div className="flex flex-col gap-4">
        <TelegramCard />

        <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6">
          {loadError ? (
            <Alert variant="error">{loadError}</Alert>
          ) : isLoading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState message="Hali bildirishnoma yo'q" />
          ) : (
            <ul className="flex flex-col gap-1">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className="flex items-start gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-base-200/50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-box bg-primary/10 text-primary">
                    <Icon name={NOTIF_TYPE_ICON[n.type] ?? 'bell'} className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-base-content">{n.text}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-base-content/50">{NOTIF_TYPE_LABELS[n.type] ?? n.type}</span>
                      <span className="text-base-content/30">·</span>
                      <span className="text-xs text-base-content/50">{formatDateTime(n.createdAt)}</span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${NOTIF_STATUS_TONE[n.status] ?? 'bg-base-200 text-base-content/50'}`}
                  >
                    {NOTIF_STATUS_LABELS[n.status] ?? n.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
