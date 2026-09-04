import { mapUserFromApi } from './auth'
import { apiFetch, fetchAllPages } from './client'
import { mapRoleToApi } from './roles'

export async function listUsers() {
  const raw = await fetchAllPages('/api/accounts/users/')
  return raw.map(mapUserFromApi)
}

export async function createUser(input) {
  const body = {
    username: input.username,
    password: input.password,
    full_name: input.fullName,
    role: mapRoleToApi(input.role),
    phone: input.phone || '',
  }
  const data = await apiFetch('/api/accounts/users/', { method: 'POST', body })
  return mapUserFromApi(data)
}

export async function updateUser(id, input) {
  const body = {
    full_name: input.fullName,
    role: mapRoleToApi(input.role),
    phone: input.phone || '',
    is_active: input.isActive,
  }
  const data = await apiFetch(`/api/accounts/users/${id}/`, { method: 'PATCH', body })
  return mapUserFromApi(data)
}

export function deleteUser(id) {
  return apiFetch(`/api/accounts/users/${id}/`, { method: 'DELETE' })
}

export function unlockUser(id) {
  return apiFetch(`/api/accounts/users/${id}/unlock/`, { method: 'POST' })
}
