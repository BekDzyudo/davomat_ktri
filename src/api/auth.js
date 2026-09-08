import { apiFetch, clearTokens, setTokens } from './client'
import { mapRoleFromApi, mapRoleToApi } from './roles'

export function mapUserFromApi(u) {
  if (!u) return null
  return {
    id: u.id,
    username: u.username,
    fullName: u.full_name,
    email: u.email,
    phone: u.phone,
    role: mapRoleFromApi(u.role),
    photo: u.photo,
    faculty: u.faculty,
    isActive: u.is_active,
    dateJoined: u.date_joined,
    studentProfileId: u.student_profile_id ?? null,
  }
}

export async function login(username, password) {
  const data = await apiFetch('/api/accounts/auth/login/', {
    method: 'POST',
    body: { username, password },
    skipAuth: true,
  })
  setTokens({ access: data.access, refresh: data.refresh })
  return data
}

export async function fetchMe() {
  const data = await apiFetch('/api/accounts/me/')
  return mapUserFromApi(data)
}

export async function updateMe(patch) {
  const body = {}
  if (patch.fullName !== undefined) body.full_name = patch.fullName
  if (patch.phone !== undefined) body.phone = patch.phone
  const data = await apiFetch('/api/accounts/me/', { method: 'PATCH', body })
  return mapUserFromApi(data)
}

export async function uploadMyPhoto(file) {
  const formData = new FormData()
  formData.append('photo', file)
  const data = await apiFetch('/api/accounts/me/', { method: 'PATCH', formData })
  return mapUserFromApi(data)
}

export function changePassword({ oldPassword, newPassword }) {
  return apiFetch('/api/accounts/me/change-password/', {
    method: 'POST',
    body: { old_password: oldPassword, new_password: newPassword },
  })
}

export function requestPasswordReset(email) {
  return apiFetch('/api/accounts/auth/password-reset/', {
    method: 'POST',
    body: { email },
    skipAuth: true,
  })
}

export function confirmPasswordReset({ email, code, newPassword }) {
  return apiFetch('/api/accounts/auth/password-reset/confirm/', {
    method: 'POST',
    body: { email, code, new_password: newPassword },
    skipAuth: true,
  })
}

export function logout() {
  clearTokens()
}

export { mapRoleToApi }
