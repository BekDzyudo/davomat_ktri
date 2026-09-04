import { apiFetch, fetchAllPages } from './client'

function mapNotificationFromApi(n) {
  return {
    id: n.id,
    text: n.text,
    type: n.notif_type,
    status: n.status,
    createdAt: n.created_at,
    sentAt: n.sent_at,
  }
}

export async function listNotifications() {
  const raw = await fetchAllPages('/api/notifications/')
  return raw.map(mapNotificationFromApi)
}

export async function getTelegramLink() {
  const data = await apiFetch('/api/notifications/telegram/link-code/')
  return {
    linkCode: data.link_code,
    chatId: data.chat_id,
    linkedAt: data.linked_at,
    botLink: data.bot_link,
  }
}
