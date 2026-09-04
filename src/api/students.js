import { apiFetch, fetchAllPages } from './client'

function mapStudentFromApi(s) {
  return {
    id: s.id,
    fullName: s.full_name,
    groupId: s.group,
    phone: s.phone,
    externalId: s.external_id,
    institution: s.institution_name ?? '',
    isActive: s.is_active,
    userId: s.user,
  }
}

export async function listStudents(params = {}) {
  const raw = await fetchAllPages('/api/groups/students/', params)
  return raw.map(mapStudentFromApi)
}

function studentBody(input) {
  return {
    full_name: input.fullName,
    group: input.groupId,
    phone: input.phone || '',
    external_id: input.externalId,
    institution_name: input.institution || '',
    is_active: input.isActive ?? true,
  }
}

export async function createStudent(input) {
  const data = await apiFetch('/api/groups/students/', { method: 'POST', body: studentBody(input) })
  return mapStudentFromApi(data)
}

export async function updateStudent(id, input) {
  const data = await apiFetch(`/api/groups/students/${id}/`, { method: 'PATCH', body: studentBody(input) })
  return mapStudentFromApi(data)
}

export function deleteStudent(id) {
  return apiFetch(`/api/groups/students/${id}/`, { method: 'DELETE' })
}

export function importStudentsExcel(groupId, file) {
  const formData = new FormData()
  formData.append('file', file)
  return apiFetch(`/api/groups/${groupId}/import-students/`, { method: 'POST', formData })
}

export function deleteAllStudents(groupId) {
  return apiFetch(`/api/groups/${groupId}/delete-all-students/`, { method: 'POST' })
}
