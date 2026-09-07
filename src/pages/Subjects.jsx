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

  const assignedCount = subjects.filter((subject) => assignments.some((assignment) => assignment.subjectId === subject.id)).length
  const totalHours = subjects.reduce((sum, subject) => sum + subject.theoryHours + subject.practiceHours, 0)
  const unassignedCount = subjects.length - assignedCount

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
        icon="book"
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

      <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
        <div className="grid grid-cols-3 border-b border-base-300 bg-base-200/45">
          <div className="border-r border-base-300 p-4 sm:p-5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-base-content/45">Jami modullar</span>
            <p className="mt-1.5 text-2xl font-black text-base-content">{subjects.length}</p>
          </div>
          <div className="border-r border-base-300 p-4 sm:p-5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-base-content/45">Biriktirilgan</span>
            <p className="mt-1.5 text-2xl font-black text-success">{assignedCount}</p>
          </div>
          <div className="p-4 sm:p-5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-base-content/45">Jami soat</span>
            <p className="mt-1.5 text-2xl font-black text-primary">{totalHours}</p>
          </div>
        </div>

        <div className="border-b border-base-300 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-black text-base-content sm:text-lg">Modullar ro'yxati</h2>
              <p className="mt-1 text-xs text-base-content/50 sm:text-sm">
                O'qituvchi va guruhlarga biriktirilgan o'quv modullari
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-base-content/45">
              {unassignedCount > 0 && <span className="text-warning">{unassignedCount} ta biriktirilmagan</span>}
              <span>{totalItems} ta natija</span>
            </div>
          </div>
          <div className="mt-4">
            <SearchInput value={query} onChange={setQuery} placeholder="Modul nomi bo'yicha qidirish" />
          </div>
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
          <div className="overflow-x-auto px-4 sm:px-5">
            <table className="table min-w-260">
              <thead>
                <tr className="border-b border-base-300 text-[10px] uppercase tracking-wider text-base-content/45">
                  <th className="w-12 pb-3">#</th>
                  <th className="pb-3">Modul</th>
                  <th className="pb-3">Soatlar taqsimoti</th>
                  <th className="pb-3">Jami</th>
                  <th className="pb-3">O'qituvchi</th>
                  <th className="pb-3">Guruhlar</th>
                  <th className="pb-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((subject, index) => (
                  <tr key={subject.id} className="group border-b border-base-200 transition-colors hover:bg-primary/[0.035]">
                    <td className="text-xs font-semibold text-base-content/35">{(page - 1) * pageSize + index + 1}</td>
                    <td>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon name="book" className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="max-w-sm truncate font-bold text-base-content">{subject.name}</p>
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-base-content/40">
                            {subject.subjectType === 'practice' ? 'Amaliy modul' : 'Nazariy modul'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="w-36">
                        <div className="mb-1 flex justify-between text-[10px] font-semibold text-base-content/50">
                          <span>Nazariy {subject.theoryHours}</span>
                          <span>Amaliy {subject.practiceHours}</span>
                        </div>
                        <div className="flex h-2 overflow-hidden rounded-full bg-base-300">
                          <span
                            className="bg-primary"
                            style={{
                              width: `${((subject.theoryHours / (subject.theoryHours + subject.practiceHours || 1)) * 100).toFixed(2)}%`,
                            }}
                          />
                          <span
                            className="bg-accent"
                            style={{
                              width: `${((subject.practiceHours / (subject.theoryHours + subject.practiceHours || 1)) * 100).toFixed(2)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="inline-flex rounded-lg bg-base-200 px-2.5 py-1 text-xs font-bold tabular-nums text-base-content/70">
                        {subject.theoryHours + subject.practiceHours} soat
                      </span>
                    </td>
                    <td className="max-w-48 text-xs text-base-content/70">
                      <span className="line-clamp-2">
                        {teacherNames(subject.id) || <span className="text-base-content/35">Biriktirilmagan</span>}
                      </span>
                    </td>
                    <td className="max-w-44 text-xs text-base-content/70">
                      {groupNames(subject.id) ? (
                        <span className="line-clamp-2">{groupNames(subject.id)}</span>
                      ) : (
                        <span className="text-base-content/35">—</span>
                      )}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
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
