import { apiFetch, fetchAllPages } from './client'

function mapFacultyFromApi(f) {
  return { id: f.id, name: f.name, createdAt: f.created_at }
}

export async function listFaculties() {
  const raw = await fetchAllPages('/api/faculties/')
  return raw.map(mapFacultyFromApi)
}

export async function createFaculty(input) {
  const data = await apiFetch('/api/faculties/', { method: 'POST', body: { name: input.name } })
  return mapFacultyFromApi(data)
}

export async function updateFaculty(id, input) {
  const data = await apiFetch(`/api/faculties/${id}/`, { method: 'PATCH', body: { name: input.name } })
  return mapFacultyFromApi(data)
}

export function deleteFaculty(id) {
  return apiFetch(`/api/faculties/${id}/`, { method: 'DELETE' })
}
