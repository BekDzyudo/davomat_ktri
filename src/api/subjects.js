import { apiFetch, fetchAllPages } from './client'

function mapSubjectFromApi(s) {
  return {
    id: s.id,
    name: s.name,
    code: s.code,
    theoryHours: s.theory_hours ?? 0,
    practiceHours: s.practice_hours ?? 0,
    subjectType: s.subject_type ?? 'theory',
  }
}

export async function listSubjects() {
  const raw = await fetchAllPages('/api/subjects/')
  return raw.map(mapSubjectFromApi)
}

function subjectBody(input) {
  return {
    name: input.name,
    code: input.code,
    theory_hours: input.theoryHours,
    practice_hours: input.practiceHours,
    subject_type: input.subjectType,
  }
}

export async function createSubject(input) {
  const data = await apiFetch('/api/subjects/', { method: 'POST', body: subjectBody(input) })
  return mapSubjectFromApi(data)
}

export async function updateSubject(id, input) {
  const data = await apiFetch(`/api/subjects/${id}/`, { method: 'PATCH', body: subjectBody(input) })
  return mapSubjectFromApi(data)
}

export function deleteSubject(id) {
  return apiFetch(`/api/subjects/${id}/`, { method: 'DELETE' })
}

// Biriktirishlar (TeacherSubject) — bitta fan bir nechta (o'qituvchi, guruh)
// juftligiga alohida-alohida biriktirilishi mumkin.
function mapAssignmentFromApi(a) {
  return {
    id: a.id,
    teacherId: a.teacher,
    teacherName: a.teacher_name,
    subjectId: a.subject,
    subjectName: a.subject_name,
    groupId: a.group,
    groupName: a.group_name,
  }
}

export async function listAssignments() {
  const raw = await fetchAllPages('/api/subjects/assignments/')
  return raw.map(mapAssignmentFromApi)
}

export async function createAssignment({ subjectId, teacherId, groupId }) {
  const data = await apiFetch('/api/subjects/assignments/', {
    method: 'POST',
    body: { subject: subjectId, teacher: teacherId, group: groupId },
  })
  return mapAssignmentFromApi(data)
}

export function deleteAssignment(id) {
  return apiFetch(`/api/subjects/assignments/${id}/`, { method: 'DELETE' })
}
