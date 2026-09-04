import { useEffect, useState } from 'react'
import { listGroups } from '../api/groups'
import {
  createAssignment,
  createSubject,
  deleteAssignment,
  deleteSubject,
  listAssignments,
  listSubjects,
  updateSubject,
} from '../api/subjects'
import { listUsers } from '../api/users'
import ConfirmDialog from '../components/ConfirmDialog'
import Alert from '../components/form/Alert'
import Button from '../components/form/Button'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/table/EmptyState'
import Pagination from '../components/table/Pagination'
import RowActionButton from '../components/table/RowActionButton'
import SearchInput from '../components/table/SearchInput'
import { ROLES } from '../data/roles'
import AssignSubjectModal from '../features/subjects/AssignSubjectModal'
import SubjectFormModal from '../features/subjects/SubjectFormModal'
import { useTableQuery } from '../hooks/useTableQuery'

const filterSubject = (subject, query) => subject.name.toLowerCase().includes(query)

export default function Subjects() {
  const [subjects, setSubjects] = useState([])
  const [assignments, setAssignments] = useState([])
  const [teachers, setTeachers] = useState([])
  const [groups, setGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [modalState, setModalState] = useState(null)
  const [assignTarget, setAssignTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([listSubjects(), listAssignments(), listUsers(), listGroups()])
      .then(([subjectsData, assignmentsData, usersData, groupsData]) => {
        if (cancelled) return
        setSubjects(subjectsData)
        setAssignments(assignmentsData)
        setTeachers(usersData.filter((u) => u.role === ROLES.OQITUVCHI))
        setGroups(groupsData)
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

  const groupNames = (subjectId) =>
    assignments
      .filter((a) => a.subjectId === subjectId)
      .map((a) => a.groupName)
      .join(', ')

  const teacherNames = (subjectId) => {
    const names = [...new Set(assignments.filter((a) => a.subjectId === subjectId).map((a) => a.teacherName))]
    return names.join(', ')
  }

  const { query, setQuery, page, setPage, totalPages, pageItems, totalItems, pageSize } =
    useTableQuery(subjects, { filterFn: filterSubject })

  const handleSubmit = async (data) => {
    if (modalState.mode === 'edit') {
      const updated = await updateSubject(data.id, data)
      setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    } else {
      const created = await createSubject(data)
      setSubjects((prev) => [...prev, created])
    }
    setModalState(null)
  }

  const handleAddAssignment = async (payload) => {
    const created = await createAssignment(payload)
    setAssignments((prev) => [...prev, created])
  }

  const handleRemoveAssignment = async (id) => {
    await deleteAssignment(id)
    setAssignments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleDelete = async () => {
    setActionError('')
    try {
      await deleteSubject(deleteTarget.id)
      setSubjects((prev) => prev.filter((s) => s.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setActionError(err.message ?? "O'chirishda xatolik yuz berdi")
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Modullar"
        actions={
          <Button onClick={() => setModalState({ mode: 'create' })}>
            <Icon
              name="plus"
              className="size-4 transition-transform duration-300 group-hover:rotate-90"
            />
            Yangi modul
          </Button>
        }
      />

      {actionError && (
        <div className="mb-4">
          <Alert variant="error">{actionError}</Alert>
        </div>
      )}

      <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6">
        <div className="mb-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Modul nomi bo'yicha qidirish" />
        </div>

        {loadError ? (
          <Alert variant="error">{loadError}</Alert>
        ) : isLoading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : pageItems.length === 0 ? (
          <EmptyState message="Hech narsa topilmadi" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-xs uppercase text-base-content/50">
                  <th className="w-10">#</th>
                  <th>Nomi</th>
                  <th>Nazariy / Amaliy</th>
                  <th>Jami soat</th>
                  <th>O'qituvchi</th>
                  <th>Guruhlar</th>
                  <th className="text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((subject, index) => (
                  <tr key={subject.id}>
                    <td className="text-base-content/40">{(page - 1) * pageSize + index + 1}</td>
                    <td className="font-medium text-base-content">{subject.name}</td>
                    <td className="text-base-content/70">
                      {subject.theoryHours} / {subject.practiceHours}
                    </td>
                    <td className="text-base-content/70">{subject.theoryHours + subject.practiceHours}</td>
                    <td className="text-base-content/70">
                      {teacherNames(subject.id) || <span className="text-base-content/40">Biriktirilmagan</span>}
                    </td>
                    <td className="text-base-content/70">
                      {groupNames(subject.id) || <span className="text-base-content/40">—</span>}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <RowActionButton
                          icon="group"
                          label="Biriktirish"
                          variant="assign"
                          onClick={() => setAssignTarget(subject)}
                        />
                        <RowActionButton
                          icon="pencil"
                          label="Tahrirlash"
                          variant="edit"
                          onClick={() => setModalState({ mode: 'edit', subject })}
                        />
                        <RowActionButton
                          icon="trash"
                          label="O'chirish"
                          variant="danger"
                          onClick={() => setDeleteTarget(subject)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={totalItems}
          pageSize={pageSize}
        />
      </div>

      {modalState && (
        <SubjectFormModal
          open
          mode={modalState.mode}
          initialValue={modalState.subject}
          onClose={() => setModalState(null)}
          onSubmit={handleSubmit}
        />
      )}

      {assignTarget && (
        <AssignSubjectModal
          open
          subject={assignTarget}
          assignments={assignments.filter((a) => a.subjectId === assignTarget.id)}
          teachers={teachers}
          groups={groups}
          onClose={() => setAssignTarget(null)}
          onAdd={handleAddAssignment}
          onRemove={handleRemoveAssignment}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Modulni o'chirish"
        description={deleteTarget ? `"${deleteTarget.name}" moduli o'chirilsinmi?` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
