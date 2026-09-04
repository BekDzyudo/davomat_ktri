import { apiFetch, fetchAllPages } from './client'

function mapGroupFromApi(g) {
  return {
    id: g.id,
    name: g.name,
    direction: g.direction,
    course: g.course,
    faculty: g.faculty,
    academicYear: g.academic_year,
    studentsCount: g.students_count,
  }
}

export async function listGroups() {
  const raw = await fetchAllPages('/api/groups/')
  return raw.map(mapGroupFromApi)
}

function groupBody(input) {
  return {
    name: input.name,
    direction: input.direction,
    course: input.course,
    faculty: input.faculty,
    academic_year: input.academicYear,
  }
}

export async function createGroup(input) {
  const data = await apiFetch('/api/groups/', { method: 'POST', body: groupBody(input) })
  return mapGroupFromApi(data)
}

export async function updateGroup(id, input) {
  const data = await apiFetch(`/api/groups/${id}/`, { method: 'PATCH', body: groupBody(input) })
  return mapGroupFromApi(data)
}

export function deleteGroup(id) {
  return apiFetch(`/api/groups/${id}/`, { method: 'DELETE' })
}
